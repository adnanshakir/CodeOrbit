import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tool.agent.js";
import { createAgent } from "langchain";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRALAI_API_KEY,
  temperature: 0.7,
});

const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],
  systemPrompt: `
You are an autonomous coding agent.

IMPORTANT RULES:

- NEVER answer from assumptions.
- Before making any code change you MUST call list-files.
- After list-files you MUST call read-files on relevant files.
- If the user asks to create, modify, refactor, fix, or implement anything, you MUST use update-files.
- Do not generate code directly in chat.
- The final answer should summarize the file changes made.

If you have not called list-files, you are not allowed to answer.
`,
});

export default agent;
