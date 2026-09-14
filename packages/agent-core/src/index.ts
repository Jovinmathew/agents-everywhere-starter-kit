/**
 * Server surface. Importing this from a client component pulls
 * @copilotkit/runtime (and Express, and Node's `fs`) into the browser bundle.
 * Client code wants `agent-core/shared`.
 */
export { makeAgent } from "./agent";
export { SURFACE_RULES } from "./prompt";
export { resolveModel } from "./model";
export { searchWeb, isSearchConfigured } from "./capabilities/search";
export {
  searchWebParameters,
  type SearchWebArgs,
  type SearchHit,
} from "./schemas";
