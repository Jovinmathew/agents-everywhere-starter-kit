# Wyatt on Slack

Wyatt's Slack surface, built on CopilotKit Channels. It reads the thread a purchase request started in, matches items to the catalog, and drives suppliers through RFQ and PO with native cards and approval buttons. See the [root README](../../README.md) for the full workflow and quickstart.

[![Wyatt on Slack demo](../../assets/demos/slack.gif)](../../assets/demos/slack.mp4)

_A completed purchase: request card, RFQ approval, quote comparison, PO approval. The preview is sped up; click it for the full MP4._

## Get started

Complete the [root quickstart](../../README.md#quickstart) first — this surface needs Postgres and `npm run dev:api` running, because it sends RFQs and POs through the api. Then configure `.env`:

```dotenv
MODEL_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
MODEL=openai/gpt-5.6-sol
CHANNEL_CODE=your-channel-code
INTELLIGENCE_API_KEY=your-project-key
PROCURE_API_URL=http://localhost:3001
```

Create the managed Channel with `npm run channel:setup` — see the [root README](../../README.md#add-the-slack-surface) for the full Slack installation steps.

```bash
npm run dev:slack
```

Invite the bot to a channel and mention it with a purchase request. CopilotKit Intelligence manages the Slack connection; this listener needs no public tunnel.

## Try the flow

1. Add a couple of sentences of context to a thread before mentioning the bot (e.g. "40 new starters Monday, desks need pens").
2. `@wyatt Need 4000 ballpoint pens by Friday`. Wyatt reads the thread, resolves the date, and posts a request card, then an RFQ approval card. Click **Send**.
3. Open the RFQ emails in Mailpit (http://localhost:8026) and submit a quote through each magic link.
4. Ask `any quotes yet?` for a ranked comparison, then `go with the recommended one` and **Approve** to issue the PO.

## Customize these files

| Piece | File |
|---|---|
| Agent and model | [Shared agent factory](../../packages/agent-core/src/agent.ts) |
| Channel lifecycle | [src/channel.tsx](src/channel.tsx): mention, subscribe, respond to subscribed messages |
| Channel-only run adapter | [src/agent.ts](src/agent.ts): keeps outer transcript/state while using fresh inner agent runs |
| Purchasing tools and cards | [src/procurement/](src/procurement/): the eight purchasing tools, the two approval gates, and the request/quote/PO cards |
| Prompt | [src/procurement/prompt.ts](src/procurement/prompt.ts) |
| Thread context and research | [src/tools.tsx](src/tools.tsx) and [src/search.tsx](src/search.tsx): `read_thread` and optional Exa-backed `search_web` |
| Welcome card | [src/components.tsx](src/components.tsx) |

## Verify and limits

Run `npm run verify` for root/channel typechecks and offline tests. Live Slack delivery and model responses require your own accounts and should be checked manually.

Keep the pinned Channels/runtime pair and the `@ag-ui/client` override — see [AGENTS.md](../../AGENTS.md). [Channels guide](https://copilotkit.ai/channels-guide.md) · [OpenTag reference app](https://github.com/CopilotKit/OpenTag)
