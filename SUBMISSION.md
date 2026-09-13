# Submission — Wyatt

Choose your city on the [global event page](https://aitinkerers.org/hackathons/global/agents-everywhere). Use that city's participant portal for the submission deadline and published judging criteria, and its handbook for eligibility and required deliverables. See [hackathon-rules.md](hackathon-rules.md) for the agent-readable summary.

> **Status:** draft prepared for the team. Items marked **TEAM** need a person to confirm or do them; nothing here has been submitted or posted.

## Build eligibility

- [ ] **TEAM:** Our submitted project is a net-new build created during the official hackathon period
- [ ] **TEAM:** Its core functionality was built during the event; we are not resubmitting or extending a pre-existing project and entering it as new
- [ ] **TEAM:** We identify inherited templates, libraries, prompts, components, and starter code separately from our event work (listed below; check it is complete and accurate)

**What we inherited**

- **This starter kit** ([CopilotKit/agents-everywhere-starter-kit](https://github.com/CopilotKit/agents-everywhere-starter-kit)):
  - `packages/agent-core`: the shared agent factory and model adapter.
  - `apps/channel`'s Channels runtime wiring: `server.ts`, the `ChannelRunAgent` wrapper, `read_thread`, and the test gateway.
  - The CopilotKit React patterns in `apps/web`.
  - The repo tooling.
  - The kit's incident demos (`apps/web`, `apps/mobile`, and the incident cards in `apps/channel`) are not part of Wyatt.
- **Our pre-event prototype, "Procurebot" (repo history from 2026-09-08):**
  - The product idea and domain design.
  - Its Postgres schema, copied verbatim into `packages/procure-db/migrations/0003–0033` plus `0024_thread_bindings.sql`.
  - The ERP console's visual design and helpers (`apps/erp-frontend/src/index.css`, `format.ts`, `statusTone.ts`), and the page layouts the new pages were adapted from.

  None of the prototype's backend, portal, Slack, or agent code was carried over; those were rewritten here.
- **Libraries:** CopilotKit (Channels, runtime, React), Express, pg, BullMQ, jose, nodemailer, multer, Vite, React.

**What we built during the hackathon**

- **The Slack surface** (`apps/channel/src/procurement/`):
  - Eight purchasing tools, with native Slack cards for the request, the quote comparison and the purchase order.
  - Two approval cards whose Send/Approve buttons are the only path to emailing suppliers or issuing a PO. Each click is honoured once only.
  - Failure messages people can act on, with reference codes.
  - A per-run "today" context, so relative dates like "by Friday" resolve.
- **The ERP chat agent** (`apps/procure-agent`): the Wyatt prompt and six server tools over the shared database. It runs on OpenRouter through `agent-core`; we added a `tools` option to `makeAgent`.
- **Approval-gated actions in the ERP chat** (`apps/erp-frontend/src/agent/generativeUi.tsx`): `propose_rfq`, `propose_award`, and the `quote_comparison` table. The cards read ground truth from the api and write only on the requester's click.
- **The service layer** (`apps/api`):
  - the ERP read API;
  - RFQ dispatch with per-supplier magic links and send-failure tracking;
  - PO issuance with an approval record and a formal PO email;
  - the supplier portal, where a quote is entered in a form with an optional document.
- **The shared data layer** (`packages/procure-db`): migration 0035 (needed-by dates, PO numbers, email status), the migration runner, seed data, typed queries, and deterministic quote ranking.
- **The WyattERP frontend** (`apps/erp-frontend`): a new app with pages rewritten against the new API, the agent column, and live page context (today's date and the open requisition).

## Title and description

**Project title:** Wyatt <!-- TEAM: or "Wyatt the Procurer" / "WyattERP" -->

**What you built**
Wyatt is a procurement agent that turns a Slack message into a placed order. In the team's ops channel:

1. Someone writes `@wyatt-the-procurer Need 4000 ballpoint pens by Friday`. Wyatt matches the catalog, asks "blue or black?", resolves Friday to a date, and posts a request card.
2. Wyatt posts an approval card naming the suppliers it will contact. Clicking **Send** emails each one a request for quotation with a personal link.
3. Suppliers open the link and submit a quote in a short form.
4. Asked "any quotes yet?", Wyatt posts a ranked comparison: on-time delivery first, then price, then lead time. It recommends the cheapest quote that meets the deadline over a cheaper one that would arrive late.
5. "Go with the recommended one" brings up a second approval card. On **Approve**, Wyatt issues purchase order PO-00xxxx, emails it to the supplier, and posts the PO card in the thread.

The same records appear straight away in **WyattERP**, the team's ERP console: requisitions, invitations, quotes, approvals and POs. WyattERP has its own Wyatt chat panel, which does the same workflow using the page you have open ("compare the quotes for this one").

**Who it is for**
The office or operations manager at a 30–200 person company who orders supplies and equipment. Today they email three suppliers by hand, chase replies, paste prices into a spreadsheet, then type up a PO. The request itself usually starts as a Slack message from a colleague.

**Why the context matters**
Purchase requests already start in Slack, and the team agrees on them there. Wyatt works inside that conversation:
- It reads the thread, so the reason and details someone gave earlier carry into the request.
- It posts every step as a native card that everyone in the thread can see.
- It puts the two decisions that cost money (contacting suppliers and committing spend) behind buttons in the same thread. The card records who approved.

Behind the thread, Wyatt works from the company's own catalog, supplier list and live quotes, and leaves an auditable requisition, approval and PO trail in the ERP. A standalone chatbox could draft an email, but it wouldn't know which suppliers to ask. It also couldn't collect their quotes, rank them against the deadline, or leave the audit trail where the team already works.

**Sponsor technologies used**
- **CopilotKit Channels + Intelligence:** the Slack surface. Managed Slack delivery with no tunnel or bot hosting, native cards, and the approve and cancel buttons.
- **CopilotKit runtime + React:** the WyattERP chat panel, with page context (`useAgentContext`), the generated comparison table (`useComponent`), and the approval cards (`useHumanInTheLoop`).
- **OpenRouter:** the model gateway behind both agents' reasoning and tool calls.

## Evidence for the judging criteria

Judges score each of the four official criteria from 1–5. This checklist helps you gather evidence; it does not guarantee a score.

| Official criterion | Our evidence |
|---|---|
| Core Requirements & Functionality | The full workflow has run live in Slack (request → RFQ emails → supplier quotes → comparison → approved PO-001003, emailed) and in the WyattERP chat (PO-001002), on 2026-09-12. |
| Innovation & Theme Alignment | The request, the decisions and the audit trail stay in the Slack thread where the purchase was discussed. Wyatt reads the thread and posts native cards, and the same records show up in the ERP. |
| Technical Execution & Integration | Two agents share one Postgres layer (`procure-db`); emails and POs go through one service (`apps/api`). Shown: **Cancel** on the RFQ card ("nothing was emailed; still a draft"); a repeated **Approve** click still makes one PO; tampered or expired supplier links are rejected; failed emails show on the card; tool failures come back as a sentence with a reference code. |
| Usefulness & Agentic Experience | Saves the manual email, chase and spreadsheet round. Wyatt asks when a request is ambiguous and recommends with a reason. It never contacts a supplier or commits spend without a click, and each approval says who made it. |

- [ ] **TEAM:** We can point to visible evidence for every criterion (the demo script below covers each)
- [x] We distinguish live services, sample data, session-only state, and standalone recipes (README → "What is real and what is sample data")
- [x] Sponsor technologies contribute to the workflow; their count is not a judging criterion

**Known limits (say them if asked):**
- In Slack, new quotes appear when someone asks; Wyatt doesn't yet post them into the thread by itself.
- Slack thread state and approval buttons don't survive a listener restart.
- There's no login.
- Catalog and suppliers are seed data, and emails go to a local Mailpit inbox.

## Public repository

Repository: https://github.com/Jovinmathew/agents-everywhere-starter-kit (public fork of the starter kit)

- [ ] **TEAM:** A new participant can run the quickstart from a clean clone (not yet tried from a fresh clone)
- [x] The README lists the credentials and separate processes required (README → Wyatt → Quickstart and "Add the Slack surface")
- [x] `npm run verify` passes: all seven workspaces typecheck, and 126 offline tests pass across five of them (2026-09-12)
- [x] `.env`, tokens, and account secrets are excluded: `.env` is gitignored, and a scan of tracked files found no keys (2026-09-12)
- [x] Sample data, session-only state, and unimplemented integrations are clearly labeled

## Two-minute demo video

**Before recording**
- Reset to clean data: `docker compose down -v`, then `npm run db:up`, `npm run db:migrate` and `npm run db:seed`.
- Start `dev:api`, `dev:agent`, `dev:erp` and **one** `dev:slack`.
- Open Mailpit (http://localhost:8026) and WyattERP (http://localhost:5173) in tabs.
- In the Slack channel, add two or three human messages first. For example: "40 new starters on Monday, desks need pens", "Blue ink please, finance hates black".

**Script (about 2:00)**
1. **0:00–0:15 — Context.** Show the Slack thread where the team is discussing new starters. Say who Wyatt is for.
2. **0:15–0:45 — Request.** Send `@wyatt-the-procurer Need 4000 ballpoint pens by Friday`. Wyatt uses the thread (blue ink), states the date, and posts the request card, then the RFQ approval card. First click **Cancel** to show nothing was emailed. Ask again and click **Send**. Cut to Mailpit: three RFQ emails.
3. **0:45–1:10 — Suppliers.** Open two magic links and submit quotes. Make one cheaper but late (e.g. $0.17, 12 days) and one on time ($0.20, 5 days).
4. **1:10–1:40 — Decide.** Ask `any quotes yet?` to get the comparison card: on time beats cheap-but-late. Say `go with the recommended one`, then **Approve**. The PO card appears; cut to the PO email in Mailpit.
5. **1:40–1:55 — Record.** In WyattERP, open the requisition: invitations, quotes, the approval (who and when) and the PO. Optionally ask the ERP panel "compare the quotes for this one".
6. **1:55–2:00 — Credits.** Built with CopilotKit Channels + Intelligence and CopilotKit React, on OpenRouter.

- [ ] **TEAM:** Show the surface and existing context before the prompt
- [ ] **TEAM:** Demonstrate one complete interaction
- [ ] **TEAM:** Show a visible result (the PO card, the PO email, the ERP record)
- [ ] **TEAM:** Distinguish the decision from execution: the approval card, then the resulting emails and PO
- [ ] **TEAM:** State which sponsor technologies made the interaction possible
- [ ] **TEAM:** Keep the video within the event's limit and check audio

## Social post and final submission

**Draft post (TEAM: add the organizer's required tags and handles):**

> We built **Wyatt** at #AgentsEverywhere 🛒 — a procurement agent that lives in Slack. "Need 4000 pens by Friday" → it matches the catalog, emails suppliers for quotes, ranks them against the deadline, and issues the PO — with every supplier email and every purchase behind an approve button in the thread. The team's ERP updates as it goes.
> Built with @CopilotKit Channels + React on @OpenRouter. [organizer / partner tags]
> Repo: https://github.com/Jovinmathew/agents-everywhere-starter-kit · Demo: [video link]

- [ ] **TEAM:** Follow the organizer's posting and sponsor-tagging instructions
- [ ] **TEAM:** Link the public repository and video
- [ ] **TEAM:** Credit the sponsors you used and applicable local partners
- [ ] **TEAM:** Check the live integration once more before recording or submitting
- [ ] **TEAM:** Inspect the video and screenshots for secrets (keys in `.env`, Slack tokens, the Intelligence dashboard)
- [ ] **TEAM:** Submit through your city's participant portal before its deadline

Prepare the post and submission for a human to publish; running the starter kit does not publish either automatically.
