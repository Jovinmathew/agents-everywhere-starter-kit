# Notes for coding agents

Wyatt is a procurement agent that lives in Slack (`apps/channel`) and in the WyattERP chat panel (`apps/procure-agent` + `apps/erp-frontend`). Both share `packages/procure-db` for data and `packages/agent-core` for the model/agent factory. See the root [README](README.md) for the full architecture and quickstart.

Hard-won rules that are easy to get wrong here:

- **`@ag-ui/client` must stay deduped.** The root `package.json` pins it via
  `overrides` to the exact version `@copilotkit/runtime` declares. Two copies
  produce two `AbstractAgent` types and every `createChannel({ agent })` fails
  on a private `_debug` property. If you bump `@copilotkit/runtime`, re-check
  `npm ls @ag-ui/client` and update the override.
- **`@copilotkit/channels` and `@copilotkit/runtime` are a tested pair.** Bump
  together, keep them exact.
- **Files containing JSX must be `.tsx`**, and the tsconfig must set
  `jsxImportSource: "@copilotkit/channels"`. This is not React.
- **`maxSteps` defaults to 1** on `BuiltInAgent`. Any agent with tools needs more,
  or it calls one tool and stops before seeing the result. `agent-core` sets 10.
- **Do not add `identifyUser` to `CopilotRuntime`.** It belongs on
  `createChannel`, and must be absent on a Channels-only runtime.
- **Handlers return `void`.** `thread.post()` returns a `MessageRef`, so a
  concise arrow body fails under `strict`. Use a block body and `await`.
- **Never invent a Channels JSX component or prop.** The vocabulary is fixed —
  `Message` `Header` `Section` `Markdown` `Fields`/`Field` `Context` `Divider`
  `Table`/`Row`/`Cell` `Actions` `Button` `Select` `Input`, plus modal
  components. A made-up tag does not lower to a valid IR node.
- **Sending an RFQ and issuing a PO are approval-gated.** Neither agent has a
  tool that emails a supplier or creates a PO directly — see
  `apps/channel/src/procurement/tools.tsx` and
  `apps/erp-frontend/src/agent/generativeUi.tsx`. Keep it that way.
- Run `npm run verify` before claiming anything works.
