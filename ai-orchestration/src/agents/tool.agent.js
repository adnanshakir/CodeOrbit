import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const REQUEST_TIMEOUT_MS = 10000;

export const listFiles = tool(
  async ({}, config) => {
    try {
      const writer = config.writer;

      if (writer) {
        writer?.("Listing files in the working directory...\n");
      }

      const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/list-files`, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      writer?.("Files listed successfully.\n");

      return JSON.stringify(response.data.files);
    } catch (error) {
      console.log("After GET /list-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    }
  },
  {
    name: "list-files",
    description: "List all files in the working directory and its subdirectories.",
    schema: z.object({}),
  },
);

export const readFiles = tool(
  async ({ files = [] }, config) => {
    try {
      const writer = config.writer;

      if (writer) {
        writer?.(`Reading contents of files: ${files.join(", ")}...\n`);
      }

      const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/read-files`, {
        params: {
          files: files.join(","),
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      writer?.("Files read successfully.\n");

      return JSON.stringify(response.data);
    } catch (error) {
      console.log("After GET /read-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    }
  },
  {
    name: "read-files",
    description: "Read contents of files.",
    schema: z.object({
      files: z.array(z.string()),
    }),
  },
);

export const updateFiles = tool(
  async ({ files }, config) => {
    try {
      const writer = config.writer;

      if (writer) {
        writer?.(`Updating files: ${files.map((f) => f.file).join(", ")}...\n`);
      }

      const response = await axios.patch(
        `http://sandbox-service-${config.context.projectId}:3000/update-files`,
        {
          updates: files,
        },
        {
          timeout: REQUEST_TIMEOUT_MS,
        },
      );

      writer?.("Upadted files successfully.\n");

      return JSON.stringify(response.data.results);
    } catch (error) {
      console.log("After PATCH /update-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    }
  },
  {
    name: "update-files",
    description: "Update files with new contents.",
    schema: z.object({
      files: z.array(
        z.object({
          file: z.string(),
          content: z.string(),
        }),
      ),
    }),
  },
);
