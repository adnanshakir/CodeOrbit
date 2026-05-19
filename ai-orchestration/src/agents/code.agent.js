import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tool.agent.js";
import { createAgent } from "langchain";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRALAI_API_KEY,
  "temperature": 0.7,
});

const agent = createAgent({
  model,
  tools: [listFiles, readFiles, updateFiles],
  systemPrompt: `You are a coding agent.
    Workflow:
    1. Use list-files once to inspect project structure.
    2. Read relevant files.
    3. Update files if needed.
    4. Stop after completing the task.

    Do not repeatedly call the same tool.`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Update the project theme to light mode also change the 'Get started' text to 'Begin your journey' in the App.jsx file.",
    },
  ],
});

// console.log(result);
