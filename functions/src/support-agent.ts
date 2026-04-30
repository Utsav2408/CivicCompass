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
`;

export const supportAgentHandler = async (req: any, res: any) => {
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

    const { prompt } = parsed.data;

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

      const { text } = await ai.generate({
        model: googleAI.model("gemini-2.0-flash"),
        system: SUPPORT_SYSTEM_PROMPT,
        prompt,
        tools: [createTicket, getTicketStatus],
      });

      res.status(200).json({ response: text });
    } catch (error) {
      log.error("support_agent_error", {
        uid,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      res.status(500).json({ error: "Support agent unavailable" });
    }
};

export const supportAgent = onRequest(
  { cors: true, region: "us-east1" },
  supportAgentHandler
);
