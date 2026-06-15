import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const HOST = "sandbobx-service-019ecb1f-1714-727a-8d51-d311ebfcc5c5.agent.:3000";

export const listFiles = tool(
  async () => {
    console.log("Using listFiles tool!");
    console.log("==================================");

    const response = await axios.get("http://127.0.0.1/list-files", {
      headers: {
        Host: HOST,
      },
    });

    console.log("Response:", response.data);
    console.log("==================================");

    return JSON.stringify(response.data.files);
  },
  {
    name: "list-files",
    description:
      "List all files in the working directory and its subdirectories.",
    schema: z.object({}),
  }
);

export const readFiles = tool(
  async ({ files }) => {
    console.log("Using readFiles tool!");
    console.log("==================================");

    const response = await axios.get(
      "http://127.0.0.1/read-files",
      {
        params: {
          files: files.join(","),
        },
        headers: {
          Host: HOST,
        },
      }
    );

    console.log("Response:", response.data);
    console.log("==================================");

    return JSON.stringify(response.data);
  },
  {
    name: "read-files",
    description:
      "Read contents of files.",
    schema: z.object({
      files: z.array(z.string()),
    }),
  }
);

export const updateFiles = tool(
  async ({ files }) => {
    console.log("Using updateFiles tool!");
    console.log("==================================");

    const response = await axios.patch(
      "http://127.0.0.1/update-files",
      {
        updates: files,
      },
      {
        headers: {
          Host: HOST,
        },
      }
    );

    console.log("Response:", response.data);
    console.log("==================================");

    return JSON.stringify(response.data.results);
  },
  {
    name: "update-files",
    description:
      "Update files with new contents.",
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