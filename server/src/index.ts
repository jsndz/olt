import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";

import { PORT, ANTHROPIC_API_KEY } from "./config";
import { basePrompt as HTMLPrompt } from "./templates/html";

import { BASE_PROMPT, getSystemPrompt } from "./defaults/prompts";
import { TextBlock } from "@anthropic-ai/sdk/resources";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/template", async (req, res) => {
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

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const response = await anthropic.messages.create({
    messages: messages,
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    system: getSystemPrompt(),
  });

  console.log(response);

  res.json({
    response: (response.content[0] as TextBlock)?.text,
  });
});
app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
