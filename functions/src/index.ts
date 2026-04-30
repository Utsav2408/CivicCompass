import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

initializeApp();

// Remove region from global options
setGlobalOptions({ maxInstances: 10 });

export { eciVoterLookup } from "./eci-voter-lookup.js";
export { geminiProxy } from "./gemini-proxy.js";
export { candidateFetch } from "./candidate-fetch.js";
export { mediaValidate } from "./media-validate.js";
export { nightlyEciFetch } from "./nightly-eci-fetch.js";
export { supportAgent } from "./support-agent.js";
