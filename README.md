<div align="center">

# Wyatt

**A procurement agent that lives in Slack and in your ERP.**

</div>

Wyatt is a procurement agent for the ops person at a small company. Ask it in Slack, or in the chat panel of the WyattERP console: "Need 4000 ballpoint pens by Friday". Wyatt:

1. Matches the request to the catalog, asking when more than one item fits, and turns "Friday" into a date.
2. Drafts a requisition.
3. After you approve, emails a request for quotation (RFQ) to the right suppliers, each with a personal magic link.
4. Collects each supplier's quote through the portal.
5. Ranks the quotes (on time first, then price, then lead time) and recommends one.
6. After you approve, issues a purchase order and emails it to the supplier.

Both surfaces share the same database and service layer, so a request started in Slack appears in WyattERP straight away.

| Piece | Path | Port |
|---|---|---|
| Slack agent: CopilotKit Channels, native cards and approval buttons | `apps/channel` | 3000 (health only) |
| WyattERP console + agent chat panel (Vite, React, CopilotKit React) | `apps/erp-frontend` | 5173 |
| ERP chat agent (CopilotKit runtime, OpenRouter or OpenAI via `agent-core`) | `apps/procure-agent` | 3002 |
| Service layer + supplier portal (Express) | `apps/api` | 3001 |
| Schema, migrations, seed, shared queries, quote ranking | `packages/procure-db` | — |
| Postgres, Redis, Mailpit (local email inbox), Adminer (database browser) | `docker-compose.yml` | 5434, 6381, 1026/8026, 8081 |

### Quickstart

Needs Node 22+ and Docker.

```bash
npm install
cp .env.example .env        # then set MODEL_PROVIDER=openrouter, OPENROUTER_API_KEY, MODEL,
                            # and a random JWT_SIGNING_SECRET (openssl rand -hex 32)
npm run db:up               # Postgres, Redis, Mailpit, Adminer
npm run db:migrate
npm run db:seed             # sample catalog and suppliers (example.com addresses)

# three terminals
npm run dev:api
npm run dev:agent
npm run dev:erp             # open http://localhost:5173
```

Supplier emails land in Mailpit at http://localhost:8026. Open a magic link there to submit a quote as that supplier. To browse the database, open Adminer at http://localhost:8081/?pgsql=postgres&username=procurebot&db=procurebot (password `procurebot`). `npm run verify` typechecks and runs the offline tests for every workspace. To start from an empty database, run `docker compose down -v`, then `db:up`, `db:migrate` and `db:seed`.

### Add the Slack surface

The Slack agent needs Postgres and `npm run dev:api` running, because it sends RFQs and POs through the api.

1. Create a managed Channel in a CopilotKit Intelligence project (`npm run channel:setup`, or the dashboard) and create the Slack app from **that Channel's manifest**.
2. **In Slack, open OAuth & Permissions → Reinstall to Workspace → Allow**, then give the Channel the bot token from *after* the reinstall. If the first install granted only some of the manifest's scopes, Slack silently sends no events: the dashboard still says "Setup complete" and the bot never replies.
3. Put the project's key in `.env`. `npx copilotkit@latest project select --project <slug>` writes it as `CPK_INTELLIGENCE_API_KEY`, and `INTELLIGENCE_API_KEY` also works. Set `CHANNEL_CODE` to the Channel's name.
4. Run `npm run dev:slack`, which should print `✓ Channel "<name>" online`. Run **only one** listener per Channel; a second one takes deliveries away from the first.
5. `/invite @<bot>` in a channel, where it posts a welcome card. Then @-mention it with a request, picking the bot from autocomplete: a typed `@name` isn't a mention.

### What is real and what is sample data

- **Sample data:** the catalog items and suppliers are seeded, with no stock on hand.
- **Local email only:** RFQ and PO emails are real SMTP sends, but go to the local Mailpit capture unless you point `SMTP_*` at a real server.
- **Approval gate:** sending RFQs and issuing POs happen only when someone clicks an approval card in Slack or WyattERP. Neither agent has a tool that sends email or creates a PO.
- **Quotes appear when asked for in Slack:** WyattERP pages refresh as quotes arrive. In Slack, Wyatt shows new quotes when someone asks ("any quotes yet?"); it doesn't yet post into the thread by itself.
- **Session-only Slack state:** which request a thread is about, and the approval buttons, are held in the Slack listener's memory. After a restart, ask Wyatt again rather than clicking an old card.
- **No login:** the web requester is a fixed demo user (`web:demo`), and Slack requests belong to the Slack user who made them.
- **Queued jobs:** submitting a quote queues a `quote_submitted` job in Redis, reserved for pushing quotes into Slack threads. Nothing consumes it yet.

---

## Architecture

- **[apps/channel](apps/channel/)** — the Slack surface, built on CopilotKit Channels. Purchasing tools, native cards, and the two approval gates.
- **[apps/erp-frontend](apps/erp-frontend/)** — WyattERP, the React/Vite console, plus the Wyatt chat panel.
- **[apps/procure-agent](apps/procure-agent/)** — the CopilotKit runtime the ERP chat panel talks to.
- **[apps/api](apps/api/)** — the Express service layer: the ERP read API, RFQ dispatch, PO issuance, and the supplier portal.
- **[packages/procure-db](packages/procure-db/)** — schema, migrations, seed data, shared queries, and quote ranking.
- **[packages/agent-core](packages/agent-core/)** — the shared agent factory and model adapter both agents build on.

## Development

```bash
npm run verify       # typecheck + offline tests across every workspace
npm run test:db      # tests that hit the local Postgres (needs npm run db:up)
```

See [AGENTS.md](AGENTS.md) for conventions specific to working on the Channels/Slack code, and [dev-docs](dev-docs/) for Channels operational notes (deploy, troubleshooting, model switching).
