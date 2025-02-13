"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const html_1 = require("./templates/html");
const prompts_1 = require("./defaults/prompts");
const anthropic = new sdk_1.default({
    apiKey: config_1.ANTHROPIC_API_KEY,
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Hi");
    // const prompt = req.body.prompt;
    // const response = await anthropic.messages.create({
    //   model: "claude-3-5-sonnet-20241022",
    //   max_tokens: 8192,
    //   temperature: 1,
    //   messages: [{ role: "user", content: prompt }],
    //   system:
    //     "Return either 'html' or 'complex' based on the project's complexity. If the project consists of simple HTML, CSS, and JavaScript, return 'html'. If it involves advanced functionality, frameworks, or backend logic, return 'complex'. Do not return anything extra.",
    // });
    // const answer = (response.content[0] as TextBlock).text;
    // console.log(answer);
    // if (answer == "html") {
    res.status(200).json({
        prompts: [
            prompts_1.BASE_PROMPT,
            `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${html_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [html_1.basePrompt],
    });
    //   return;
    // }
    // res.status(400).json({
    //   message: "Too complex to be created in a HTML page",
    // });
    // return;
}));
// app.post("/chat", async (req, res) => {
//   const messages = req.body.messages;
//   const response = await anthropic.messages.create({
//     messages: messages,
//     model: "claude-3-5-sonnet-20241022",
//     max_tokens: 8000,
//     system: getSystemPrompt(),
//   });
//   console.log(response);
//   res.json({
//     response: (response.content[0] as TextBlock)?.text,
//   });
// });
app.listen(config_1.PORT, () => {
    console.log(`server started at ${config_1.PORT}`);
});
