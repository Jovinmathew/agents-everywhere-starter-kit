/**
 * Wyatt's non-procurement tools: reading the thread it was mentioned in. The
 * purchasing tools live in ./procurement/tools.tsx.
 *
 * The return value is what the *agent* reads back, not what the user sees.
 * Return raw data (it is JSON-stringified for you) or a short natural-language
 * confirmation — never `{ ok: true }`, and never hand-stringify.
 */
import { defineChannelTool } from "@copilotkit/channels";
export { searchTheWeb } from "./search";
import { z } from "zod";

/**
 * Read the conversation a purchase request often starts inside of.
 */
export const readThread = defineChannelTool({
  name: "read_thread",
  description:
    "Read the recent messages in this conversation. Call this FIRST on any purchasing question — the thread often already says what is needed, why, and by when. Asking someone to re-type what they already said is the worst thing you can do here.",
  parameters: z.object({}),
  async handler(_args, { thread }) {
    const messages = await thread.getMessages();
    if (messages.length === 0) {
      return "This surface does not expose conversation history, or the thread is empty. Say that you cannot see earlier messages and ask for the shortest possible summary.";
    }
    return messages;
  },
});
