import { onRequest } from "firebase-functions/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { GeminiRequestSchema } from "./_shared/schemas.js";
import { checkRateLimit } from "./_shared/rateLimiter.js";
import { getSecret } from "./_shared/secrets.js";
import { log } from "./_shared/logger.js";
import { verifyAppCheckToken } from "./_shared/appCheck.js";

const db = getFirestore();
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-uid, x-firebase-appcheck",
};

const SUPPORT_SYSTEM_PROMPT = `
You are the CivicCompass Support Agent, helping Indian voters with their election-related issues.

RULES:
1. Use plain language at a Grade 8 reading level.
2. Maintain an impartial and helpful tone.
3. If a user wants to report an issue, use the 'create_ticket' tool.
4. IMPORTANT: You MUST confirm with the user before calling 'create_ticket'. Summarize the issue and category, and ask for their permission.
5. If a user asks about an existing issue, use 'get_ticket_status'.
6. If asked about election rules or processes, refer to eci.gov.in but stay focused on support.
7. Never express political opinions or partisan statements.
8. If the provided chat summary clearly indicates the user wants to raise a ticket, call 'create_ticket_from_summary'.
`;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function isTransientModelOverloadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toUpperCase();
  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("HIGH DEMAND") ||
    message.includes("RATE LIMIT")
  );
}

function inferCategoryFromText(
  text: string,
): "voter-roll" | "booth" | "id-card" | "other" {
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("voter roll") ||
    lowerText.includes("name missing") ||
    lowerText.includes("name is missing")
  ) {
    return "voter-roll";
  }
  if (
    lowerText.includes("polling booth") ||
    lowerText.includes("booth") ||
    lowerText.includes("polling station")
  ) {
    return "booth";
  }
  if (
    lowerText.includes("id card") ||
    lowerText.includes("voter id") ||
    lowerText.includes("epic")
  ) {
    return "id-card";
  }
  return "other";
}

export const supportAgentHandler = async (req: any, res: any) => {
  res.set(CORS_HEADERS);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const appCheckValid = await verifyAppCheckToken(req, res);
  if (!appCheckValid) return;

  const uid = req.headers["x-uid"] as string;
  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rateLimit = await checkRateLimit({
    uid,
    functionName: "support-agent",
    maxCalls: 60,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: rateLimit.retryAfter,
    });
    return;
  }

  const parsed = GeminiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { prompt, chatSummary } = parsed.data;

  try {
    const apiKey = await getSecret("gemini-api-key");

    const ai = genkit({
      plugins: [googleAI({ apiKey })],
    });

    const createTicket = ai.defineTool(
      {
        name: "create_ticket",
        description: "Creates a new support ticket in the system.",
        inputSchema: z.object({
          description: z.string().describe("Detailed description of the issue"),
          category: z
            .enum(["voter-roll", "booth", "id-card", "other"])
            .describe("The category of the issue"),
        }),
        outputSchema: z.object({
          ticketId: z.string(),
          status: z.string(),
        }),
      },
      async (input) => {
        const ticketData = {
          ...input,
          userId: uid,
          status: "open",
          createdAt: Timestamp.now(),
        };
        const docRef = await db.collection("tickets").add(ticketData);
        log.info("ticket_created", { ticketId: docRef.id, uid });
        return { ticketId: docRef.id, status: "open" };
      },
    );

    const createTicketFromSummary = ai.defineTool(
      {
        name: "create_ticket_from_summary",
        description:
          "Creates a support ticket from chat summary when user intent to raise ticket is clear.",
        inputSchema: z.object({
          chatSummary: z
            .string()
            .describe("Brief summary of the support conversation"),
          category: z
            .enum(["voter-roll", "booth", "id-card", "other"])
            .optional()
            .describe("Optional category when known from context"),
        }),
        outputSchema: z.object({
          ticketId: z.string(),
          status: z.string(),
          category: z.enum(["voter-roll", "booth", "id-card", "other"]),
        }),
      },
      async (input) => {
        const description = input.chatSummary.trim();
        const category = input.category ?? inferCategoryFromText(description);
        const ticketData = {
          description,
          category,
          userId: uid,
          status: "open",
          createdAt: Timestamp.now(),
        };
        const docRef = await db.collection("tickets").add(ticketData);
        log.info("ticket_created_from_summary", {
          ticketId: docRef.id,
          uid,
          category,
        });
        return { ticketId: docRef.id, status: "open", category };
      },
    );

    const getTicketStatus = ai.defineTool(
      {
        name: "get_ticket_status",
        description: "Retrieves the status of an existing ticket.",
        inputSchema: z.object({
          ticketId: z.string().describe("The ID of the ticket to check"),
        }),
        outputSchema: z.object({
          status: z.string(),
          description: z.string(),
          mediaError: z.string().optional(),
          mediaUrl: z.string().optional(),
        }),
      },
      async (input) => {
        const doc = await db.collection("tickets").doc(input.ticketId).get();
        if (!doc.exists) {
          throw new Error("Ticket not found");
        }
        const data = doc.data();
        if (data?.userId !== uid) {
          throw new Error("Unauthorized to access this ticket");
        }
        return {
          status: data.status,
          description: data.description,
          mediaError: data.mediaError,
          mediaUrl: data.mediaUrl,
        };
      },
    );

    const promptWithContext = chatSummary
      ? `Latest user message:\n${prompt}\n\nChat summary:\n${chatSummary}`
      : prompt;

    let text: string | null = null;
    let lastGenerationError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const generation = await ai.generate({
          model: googleAI.model("gemini-2.5-flash"),
          system: SUPPORT_SYSTEM_PROMPT,
          prompt: promptWithContext,
          tools: [createTicket, createTicketFromSummary, getTicketStatus],
        });
        text = generation.text;
        break;
      } catch (generationError) {
        lastGenerationError = generationError;
        if (
          attempt < 2 &&
          isTransientModelOverloadError(generationError)
        ) {
          await sleep(400 * 2 ** attempt);
          continue;
        }
        throw generationError;
      }
    }

    if (!text) {
      throw lastGenerationError ?? new Error("Generation failed");
    }

    res.status(200).json({ response: text });
  } catch (error) {
    log.error("support_agent_error", {
      uid,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    if (isTransientModelOverloadError(error)) {
      res.status(503).json({
        error:
          "Support assistant is currently handling high demand. Please try again in a few moments.",
      });
      return;
    }
    res.status(500).json({ error: "Support agent unavailable" });
  }
};

export const supportAgent = onRequest(
  { cors: false, region: "us-east1", invoker: "public" },
  supportAgentHandler,
);
