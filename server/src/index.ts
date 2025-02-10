import Anthropic from "@anthropic-ai/sdk";
import { log } from "console";

const anthropic = new Anthropic();

async function main() {
  anthropic.messages
    .stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      temperature: 1,
      messages: [
        { role: "user", content: "Html page to display baby no money" },
      ],
    })
    .on("text", (text) => {
      log(text);
    });
}

main();
