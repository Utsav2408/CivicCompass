import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

initializeApp();

// Remove region from global options
setGlobalOptions({ maxInstances: 10 });

export { eciVoterLookup } from "./eci-voter-lookup";
export { geminiProxy } from "./gemini-proxy";
export { candidateFetch } from "./candidate-fetch";
export { mediaValidate } from "./media-validate";
export { nightlyEciFetch } from "./nightly-eci-fetch";