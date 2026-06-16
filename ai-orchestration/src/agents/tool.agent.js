import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const REQUEST_TIMEOUT_MS = 10000;

export const listFiles = tool(
  async ({}, config) => {
    console.log("Using listFiles tool!");
    console.log("==================================");
    console.time("listFiles");
    console.log("Before GET /list-files");

    try {
      const response = await axios.get(
        `http://sandbox-service-${config.context.projectId}:3000/list-files`,
        {
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      console.log("After GET /list-files");
      console.log("Status:", response.status);
      console.log("Response:", response.data);

      return JSON.stringify(response.data.files);
    } catch (error) {
      console.log("After GET /list-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    } finally {
      console.timeEnd("listFiles");
      console.log("==================================");
    }
  },
  {
    name: "list-files",
    description: "List all files in the working directory and its subdirectories.",
    schema: z.object({}),
  }
);

export const readFiles = tool(
  async ({ files = [] }, config) => {
    console.log("Using readFiles tool!");
    console.log("==================================");
    console.time("readFiles");
    console.log("Before GET /read-files");

    try {
      const response = await axios.get(
        `http://sandbox-service-${config.context.projectId}:3000/read-files`,
        {
          params: {
            files: files.join(","),
          },
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      console.log("After GET /read-files");
      console.log("Status:", response.status);
      console.log("Response:", response.data);

      return JSON.stringify(response.data);
    } catch (error) {
      console.log("After GET /read-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    } finally {
      console.timeEnd("readFiles");
      console.log("==================================");
    }
  },
  {
    name: "read-files",
    description: "Read contents of files.",
    schema: z.object({
      files: z.array(z.string()),
    }),
  }
);

export const updateFiles = tool(
  async ({ files }, config) => {
    console.log("Using updateFiles tool!");
    console.log("==================================");
    console.time("updateFiles");
    console.log("Before PATCH /update-files");

    try {
      const response = await axios.patch(
        `http://sandbox-service-${config.context.projectId}:3000/update-files`,
        {
          updates: files,
        },
        {
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      console.log("After PATCH /update-files");
      console.log("Status:", response.status);
      console.log("Response:", response.data);

      return JSON.stringify(response.data.results);
    } catch (error) {
      console.log("After PATCH /update-files with error");
      console.log("Status:", error?.response?.status ?? null);
      console.log("Response:", error?.response?.data ?? null);
      console.log("Message:", error?.message);
      throw error;
    } finally {
      console.timeEnd("updateFiles");
      console.log("==================================");
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
        })
      ),
    }),
  }
);