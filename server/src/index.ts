import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";

import { basePrompt as HTMLPrompt } from "./templates/html";

import { BASE_PROMPT, getSystemPrompt } from "./defaults/prompts";
import { TextBlock } from "@anthropic-ai/sdk/resources";

const app = express();
app.use(express.json());
app.use(cors());
const anthropic = new Anthropic();

app.use("/template", async (req, res) => {
  const prompt = req.body.prompt;
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    temperature: 1,
    messages: [{ role: "user", content: prompt }],
    system:
      "Return either 'html' or 'complex' based on the project's complexity. If the project consists of simple HTML, CSS, and JavaScript, return 'html'. If it involves advanced functionality, frameworks, or backend logic, return 'complex'. Do not return anything extra.",
  });

  const answer = (response.content[0] as TextBlock).text;

  if (answer == "html") {
    res.status(200).json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${HTMLPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [HTMLPrompt],
    });
    return;
  }
  res.status(400).json({
    message: "Too complex to be created in a HTML page",
  });
  return;
});

app.listen(3000, () => {
  console.log("server started at 3000");
});

// async function main() {
//   anthropic.messages
//     .stream({
//       model: "claude-3-5-sonnet-20241022",
//       max_tokens: 8192,
//       temperature: 1,
//       messages: [
//         { role: "user", content: "Html page to display baby no money" },
//       ],
//       system: getSystemPrompt(),
//     })
//     .on("text", (text) => {
//       log(text);
//     });
// }

// main();
