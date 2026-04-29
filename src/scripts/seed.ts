import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Connect to emulators
process.env["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080";
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099";

// Initialize Admin SDK for emulator — no real credentials needed
initializeApp({ projectId: "civiccompass-494517" });

const auth = getAuth();
const db = getFirestore();

// ─── Test Users ───────────────────────────────────────────────────────────────

const TEST_USERS = [
  {
    uid: "priya-sharma-test-uid",
    email: "priya.sharma.test@gmail.com",
    displayName: "Priya Sharma",
    profile: {
      name: "Priya Sharma",
      voterIdNumber: "ABC1234567",
      phoneHash: "hashed-phone-priya",
      constituency: "New Delhi PC-01",
      pollingBooth: {
        name: "Govt. Model School, Connaught Place",
        address: "Connaught Place, New Delhi - 110001",
        coordinates: { lat: 28.6315, lng: 77.2167 },
      },
      language: "hi",
      electionInterest: ["lok_sabha", "vidhan_sabha"],
      isComplete: true,
      createdAt: Timestamp.now(),
    },
  },
  {
    uid: "rajan-iyer-test-uid",
    email: "rajan.iyer.test@gmail.com",
    displayName: "Rajan Iyer",
    profile: {
      name: "Rajan Iyer",
      voterIdNumber: "MH4567890",
      phoneHash: "hashed-phone-rajan",
      constituency: "Mumbai North PC-06",
      pollingBooth: {
        name: "Municipal School, Borivali West",
        address: "Borivali West, Mumbai - 400092",
        coordinates: { lat: 19.2307, lng: 72.8567 },
      },
      language: "en",
      electionInterest: ["lok_sabha"],
      isComplete: true,
      createdAt: Timestamp.now(),
    },
  },
];

// ─── Election Document ────────────────────────────────────────────────────────

const ELECTION_DOC = {
  electionId: "loksabha_2024",
  type: "Lok Sabha General Election",
  pollingDate: "2024-05-04",
  announcementDate: "2024-03-16",
  nominationDeadline: "2024-03-28",
  scrutinyDate: "2024-03-30",
  withdrawalDeadline: "2024-04-01",
  resultsDate: "2024-06-04",
  sourceUrl: "https://eci.gov.in/files/file/14761-schedule",
  phases: [
    { id: "p1", label: "Phase 1", date: "2024-04-19", status: "past" },
    { id: "p2", label: "Phase 2", date: "2024-04-26", status: "past" },
    { id: "p3", label: "Phase 3", date: "2024-05-07", status: "upcoming" },
    { id: "p4", label: "Phase 4", date: "2024-05-13", status: "upcoming" },
    { id: "p5", label: "Phase 5", date: "2024-05-20", status: "upcoming" },
    { id: "p6", label: "Phase 6", date: "2024-05-25", status: "upcoming" },
    { id: "p7", label: "Phase 7", date: "2024-06-01", status: "upcoming" },
  ],
  lastUpdated: Timestamp.now(),
};

// ─── Party Performance Data ───────────────────────────────────────────────────

const PARTY_RESULTS = [
  {
    party: "BJP",
    fullName: "Bharatiya Janata Party",
    voteShare2019: 56.6,
    voteShare2024: 54.3,
    result2019: "Won",
    winner2019: "Meenakshi Lekhi",
    result2024: "Won",
    winner2024: "Pravesh Verma",
    color: "#FF9933",
  },
  {
    party: "INC",
    fullName: "Indian National Congress",
    voteShare2019: 22.5,
    voteShare2024: 19.4,
    result2019: "Lost",
    winner2019: null,
    result2024: "Lost",
    winner2024: null,
    color: "#19AAED",
  },
  {
    party: "AAP",
    fullName: "Aam Aadmi Party",
    voteShare2019: 18.3,
    voteShare2024: 18.9,
    result2019: "Lost",
    winner2019: null,
    result2024: "Lost",
    winner2024: null,
    color: "#0066CC",
  },
  {
    party: "BSP",
    fullName: "Bahujan Samaj Party",
    voteShare2019: 1.2,
    voteShare2024: 1.1,
    result2019: "Lost",
    winner2019: null,
    result2024: "Lost",
    winner2024: null,
    color: "#1565C0",
  },
  {
    party: "Others",
    fullName: "Other Parties",
    voteShare2019: 1.4,
    voteShare2024: 6.3,
    result2019: "—",
    winner2019: null,
    result2024: "—",
    winner2024: null,
    color: "#9E9E9E",
  },
];

// ─── Police Stations ──────────────────────────────────────────────────────────

const POLICE_STATIONS = [
  {
    id: "cp-ps",
    name: "Connaught Place Police Station",
    address: "Connaught Place, New Delhi - 110001",
    city: "New Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    phone: "011-23747611",
    state: "Delhi",
  },
  {
    id: "kb-ps",
    name: "Karol Bagh Police Station",
    address: "Karol Bagh, New Delhi - 110005",
    city: "New Delhi",
    latitude: 28.6507,
    longitude: 77.1902,
    phone: "011-25722218",
    state: "Delhi",
  },
  {
    id: "pg-ps",
    name: "Paharganj Police Station",
    address: "Paharganj, New Delhi - 110055",
    city: "New Delhi",
    latitude: 28.6448,
    longitude: 77.2144,
    phone: "011-23625490",
    state: "Delhi",
  },
];

// ─── Polling Booths ───────────────────────────────────────────────────────────

const POLLING_BOOTHS = [
  {
    id: "booth-delhi-001",
    name: "Govt. Model School, Connaught Place",
    address: "Connaught Place, New Delhi - 110001",
    coordinates: { lat: 28.6315, lng: 77.2167 },
    wardName: "Connaught Place Ward",
    wardCode: "WARD-001",
    constituency: "New Delhi PC-01",
    city: "New Delhi",
  },
  {
    id: "booth-mumbai-001",
    name: "Municipal School, Borivali West",
    address: "Borivali West, Mumbai - 400092",
    coordinates: { lat: 19.2307, lng: 72.8567 },
    wardName: "Borivali West Ward",
    wardCode: "WARD-MW-001",
    constituency: "Mumbai North PC-06",
    city: "Mumbai",
  },
];

// ─── Support Tickets ──────────────────────────────────────────────────────────

const SUPPORT_TICKETS = [
  {
    id: "TKT-001",
    userId: "priya-sharma-test-uid",
    title: "Name missing from voter roll in Booth 42",
    description:
      "My name does not appear in the final voter roll for Booth 42 in Connaught Place. I have my voter ID card but cannot find my name.",
    category: "voter-roll",
    status: "Open",
    createdAt: Timestamp.fromDate(new Date("2024-04-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-10")),
  },
  {
    id: "TKT-002",
    userId: "priya-sharma-test-uid",
    title: "Polling booth address seems incorrect on NVSP",
    description:
      "The polling booth address shown on NVSP portal does not match the physical location. The school has moved to a new building.",
    category: "booth",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date("2024-04-08")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-09")),
  },
  {
    id: "TKT-003",
    userId: "rajan-iyer-test-uid",
    title: "Voter ID card not received after update",
    description:
      "I submitted a correction request for my voter ID card 3 months ago but have not received the updated card yet.",
    category: "id-card",
    status: "Resolved",
    createdAt: Timestamp.fromDate(new Date("2024-03-28")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-05")),
  },
  {
    id: "TKT-004",
    userId: "rajan-iyer-test-uid",
    title: "Unable to find name in Phase 3 voter roll",
    description:
      "My name was in the draft roll but seems to have been removed from the final Phase 3 voter roll. Voter ID is MH4567890.",
    category: "voter-roll",
    status: "Open",
    createdAt: Timestamp.fromDate(new Date("2024-04-11")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-11")),
  },
  {
    id: "TKT-005",
    userId: "priya-sharma-test-uid",
    title: "Assistance needed for elderly parent to vote",
    description:
      "My elderly mother is 82 years old and needs assistance to vote. She has mobility issues and cannot stand in queue.",
    category: "other",
    status: "Resolved",
    createdAt: Timestamp.fromDate(new Date("2024-04-02")),
    updatedAt: Timestamp.fromDate(new Date("2024-04-03")),
  },
];

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("Seeding users...");
  for (const user of TEST_USERS) {
    try {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: true,
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "auth/uid-already-exists"
      ) {
        console.log(`  User ${user.email} already exists — skipping`);
      } else {
        throw err;
      }
    }

    await db.collection("users").doc(user.uid).set(user.profile);
    console.log(`  ✓ ${user.email}`);
  }
}

async function seedElection() {
  console.log("Seeding election document...");
  await db
    .collection("elections")
    .doc("loksabha_2024")
    .set(ELECTION_DOC, { merge: true });
  console.log("  ✓ loksabha_2024");
}

async function seedPartyResults() {
  console.log("Seeding party performance data...");
  const batch = db.batch();
  for (const result of PARTY_RESULTS) {
    const ref = db
      .collection("elections")
      .doc("loksabha_2024")
      .collection("results")
      .doc(result.party.toLowerCase());
    batch.set(ref, result);
  }
  await batch.commit();
  console.log(`  ✓ ${PARTY_RESULTS.length} party results`);
}

async function seedPoliceStations() {
  console.log("Seeding police stations...");
  const batch = db.batch();
  for (const station of POLICE_STATIONS) {
    const ref = db.collection("policeStations").doc(station.id);
    batch.set(ref, station);
  }
  await batch.commit();
  console.log(`  ✓ ${POLICE_STATIONS.length} police stations`);
}

async function seedPollingBooths() {
  console.log("Seeding polling booths...");
  const batch = db.batch();
  for (const booth of POLLING_BOOTHS) {
    const ref = db.collection("pollingBooths").doc(booth.id);
    batch.set(ref, booth);
  }
  await batch.commit();
  console.log(`  ✓ ${POLLING_BOOTHS.length} polling booths`);
}

async function seedTickets() {
  console.log("Seeding support tickets...");
  const batch = db.batch();
  for (const ticket of SUPPORT_TICKETS) {
    const ref = db.collection("tickets").doc(ticket.id);
    batch.set(ref, ticket);
  }
  await batch.commit();
  console.log(`  ✓ ${SUPPORT_TICKETS.length} support tickets`);
}

async function clearAll() {
  console.log("Clearing all seeded data...");

  // Delete users
  for (const user of TEST_USERS) {
    try {
      await auth.deleteUser(user.uid);
    } catch {
      // User may not exist
    }
    await db.collection("users").doc(user.uid).delete();
  }

  // Delete tickets
  for (const ticket of SUPPORT_TICKETS) {
    await db.collection("tickets").doc(ticket.id).delete();
  }

  // Delete election
  await db.collection("elections").doc("loksabha_2024").delete();

  // Delete police stations
  for (const station of POLICE_STATIONS) {
    await db.collection("policeStations").doc(station.id).delete();
  }

  // Delete polling booths
  for (const booth of POLLING_BOOTHS) {
    await db.collection("pollingBooths").doc(booth.id).delete();
  }

  console.log("  ✓ All data cleared");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const shouldClear = process.argv.includes("--clear");

  if (shouldClear) {
    await clearAll();
  }

  await seedUsers();
  await seedElection();
  await seedPartyResults();
  await seedPoliceStations();
  await seedPollingBooths();
  await seedTickets();

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
