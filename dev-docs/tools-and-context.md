# Tools, native UI, and approval gates

Wyatt's Slack surface uses CopilotKit Channels for tools, conversation context, and native UI. The examples below live in `apps/channel/src/`.

## Tools — `defineChannelTool`

A channel tool handler receives the **live thread**, so it can post native UI
and return a result to the agent. Managed deliveries finish without waiting for
a later button click. Wyatt's purchasing tools (`apps/channel/src/procurement/tools.tsx`)
follow this shape:

```ts
const searchCatalog = defineChannelTool({
  name: "search_catalog",
  description: "Search the item catalog by name or description.",
  parameters: z.object({ query: z.string() }),
  async handler({ query }, { thread, user, actor, signal, platform }) {
    return await searchItems(query);
  },
});
```

Register via `createChannel({ tools })`.

**The return value is what the agent reads back, not what the user sees.** Return
raw data — it is JSON-stringified for you. Do not hand-stringify, and do not
return `{ ok: true }`. For a tool that posts a card, return a short confirmation
like `"Displayed the issue card."` so the model does not restate it. On failure,
return the actual error text so the model can repair and retry.

`maxSteps` on the agent must be greater than 1 or the agent calls one tool and
stops before it sees the result. The kit sets 10.

## Native UI — Channels JSX

One tree renders as Slack Block Kit, Teams Adaptive Cards, and Discord
components. A surface that cannot render a node **skips it** rather than
failing, so rich UI degrades instead of erroring.

Files with JSX must be `.tsx`, and the tsconfig must set
`jsxImportSource: "@copilotkit/channels"`. This is not React.

Vocabulary: `Message` `Header` `Section` `Markdown` `Fields`/`Field` `Context`
`Divider` `Image` `Table`/`Row`/`Cell` `Chart` `Actions` `Button` `Select`
`Input`, plus modal components. **Do not invent tags or props** — a made-up tag
does not lower to a valid IR node.

Wyatt does not use `defineChannelComponent` (agent-called components). Its
cards — the request card, the quote comparison, the two approval cards, the PO
— are posted directly by the tools that hold the backend response
(`apps/channel/src/procurement/cards.tsx`), so a price or total can never be
retyped by the model on its way to the screen. `channel.tsx` registers
`components: []` for exactly this reason.

## The approval gates

`propose_rfq` and `propose_award` (`apps/channel/src/procurement/tools.tsx`) use
`thread.post()` with inline `onClick` handlers. Each posts a native card and
immediately returns **pending**, instructing the agent to stop without calling
the write tool itself. On a later delivery, **Send**/**Approve** replaces the
card and performs the real write (emailing suppliers, issuing the PO); **Cancel**
reports that nothing was sent. Neither click resumes the agent — see
`apps/channel/src/procurement/tools.tsx` for the queue-and-settle-once pattern
that makes a click honored exactly once.

The installed managed adapter sets `supportsBlockingChoice: false`:
`thread.awaitChoice()` rejects before posting a card. Use blocking `awaitChoice`
only with adapters that support it. Agents that emit interrupts can instead use
`onInterrupt` plus `Thread.resume()` on a later interaction delivery; Wyatt's
approval tools do not implement that continuation flow.

Run **one listener instance**, and keep it running until the click. Inline
handlers are process-local and cannot be recovered after a restart or by another
replica. To support replicas, use reconstructible registered-component handlers
with shared persistent action bindings; a durable store alone cannot restore an
inline closure.

## Context — `ContextEntry`

`{ description, value }` pairs injected into the agent's prompt per run. Pass at
`createChannel({ context })` or per-run via `thread.runAgent({ context })`. Use it
for the things that make the agent *situated*: which channel, the caller's role,
what the surface can and cannot do.

## Memory

`thread.runAgent({ memory: { user: "read-write", project: "read" } })` grants
Intelligence Memory **for that run only**. Omitting it disables Memory — there is
no implicit access.
