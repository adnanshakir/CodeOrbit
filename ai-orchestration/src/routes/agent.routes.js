import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    const { message, projectId } = req.body;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const response = await agent.stream(
      {
        messages: [
          {
            role: "system",
            content: "You are an expert autonomous coding agent. Whenever you are asked to create or modify code, you MUST use the `update_files` tool to write your changes to the filesystem. DO NOT just output code blocks in your chat response. Make sure to use the correct relative paths like 'src/App.jsx'."
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        context: {
          projectId,
        },
        streamMode: "custom",
      },
    );

    for await (const chunk of response) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    return res.end();
  } catch (error) {
    console.error("Error invoking agent:", error);
    res.status(500).json({ error: "Failed to invoke agent" });
  }
});

export default agentRouter;
