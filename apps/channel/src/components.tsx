/**
 * The welcome message posted when Wyatt is invited into a channel.
 *
 * `Message`/`Header`/etc. are Channels JSX: one tree renders as Slack Block
 * Kit, Teams Adaptive Cards, and Discord components. A surface that cannot
 * render a node skips it rather than failing.
 */
import { Message, Header, Section, Markdown, Fields, Field, Actions, Button } from "@copilotkit/channels";

/**
 * The welcome message. A bot that says nothing when invited looks broken; one
 * that says what it will do on its own gets used.
 */
export function welcomeMessage(platform: string) {
  return (
    <Message accent="#4A6FA5">
      <Header>Purchasing assistant, in the thread</Header>
      <Section>
        <Markdown>
          {"@-mention me with what you need to buy and I will take it from there — " +
            "matching it to the catalog, sending it out for quotes, and comparing what comes back. " +
            "One " +
            platform +
            " thread is one purchase request."}
        </Markdown>
      </Section>
      <Fields>
        <Field label="I will">Match items, chase quotes, compare suppliers</Field>
        <Field label="I won't">Raise a purchase order without your approval</Field>
      </Fields>
      <Actions>
        <Button
          value="catalog"
          style="primary"
          onClick={async ({ thread }) => {
            await thread.runAgent({
              prompt: "Show me what is in the catalog.",
            });
          }}
        >
          Show the catalog
        </Button>
      </Actions>
    </Message>
  );
}
