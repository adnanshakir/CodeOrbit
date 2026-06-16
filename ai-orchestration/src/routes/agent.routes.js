import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    const { message } = req.body;
    console.time("agent.invoke");
    let response;
    try {
      response = await agent.invoke({ messages: [{
          role: "user",
          content: message,
      }] });
      console.log("Agent Response:", JSON.stringify(response, null, 2));
      console.log("response.tool_calls:", JSON.stringify(response?.tool_calls ?? null, null, 2));
      console.log("response.messages:", JSON.stringify(response?.messages ?? null, null, 2));
      console.log("final output:", JSON.stringify(response?.output ?? response?.content ?? response, null, 2));
    } finally {
      console.timeEnd("agent.invoke");
    }
    res.json({ response });
  } catch (error) {
    console.error("Error invoking agent:", error);
    res.status(500).json({ error: "Failed to invoke agent" });
  }
});

export default agentRouter;
