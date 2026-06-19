import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import pty from "node-pty";
import os from "os";
import http from "http";

const WORKING_DIR = process.env.WORKING_DIR || "/workspace";

const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// PTY setup
const shell = process.env.SHELL || "bash";

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: WORKING_DIR,
  env: process.env,
});

ptyProcess.onData((data) => {
  io.emit("terminal-output", data);
});

ptyProcess.onExit(({ exitCode, signal }) => {
  console.log(`PTY process exited with code ${exitCode} and signal ${signal}`);
  io.emit("terminal-exit", { exitCode, signal });
});

// Routes

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the agent!", status: "success" });
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("terminal-input", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

/*
 * @route GET /list-files
 * @desc List all files in the working directory and its subdirectories. Return a JSON object with the file paths relative to the working directory. Exculing directories like node_modules, .git, dist, build, etc
 * - eg. {
 *     "files": [
 *       "file1.txt",
 *       "src/file2.txt",
 *       "src/subdir/file3.txt"
 *     ]
 *   }
 */

app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, baseDir) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Exclude directories like node_modules, .git, dist, build, etc
      if (entry.isDirectory() && ["node_modules", ".git", "dist", "build"].includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await listFiles(fullPath, baseDir)));
      } else {
        files.push(relativePath);
      }
    }

    return files;
  };

  try {
    const files = await listFiles(WORKING_DIR, WORKING_DIR);
    res.status(200).json({ message: "Files listed successfully", files, status: "success" });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

/*
 * @route GET /read-file
 * @desc Read the content of all files requested in the query parameter "files" and return their contents as a JSON object.
 * - eg. /read-file?files=file1.txt,/src/file2.txt
 */
app.get("/read-files", async (req, res) => {
  const files = req.query.files;

  if (!files) {
    return res.status(400).json({
      message: "No files specified in the query parameter 'files'",
      status: "error",
    });
  }

  const fileList = files.split(",");

  const result = await Promise.all(
    fileList.map(async (file) => {
      const filePath = path.join(WORKING_DIR, file);
      try {
        const content = await fs.promises.readFile(filePath, "utf-8");
        return {
          [filePath.replace(WORKING_DIR, "")]: content,
        };
      } catch (error) {
        return {
          [filePath.replace(WORKING_DIR, "")]: `Error reading file: ${error.message}`,
        };
      }
    }),
  );

  res.status(200).json({ message: "File contents", files: result, status: "success" });
});

/*
 * @route PATCH /update-file
 * @desc Update the content of files specified in the request body.  The request body should contain a property 'updates'with a JSON array of object, each object should have a 'file' property specifying the file path (relative to the working directory) and a 'content' property specifying the new content for the file.
 */

app.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message: 'Invalid request body. Expected a JSON object with an "updates" property containing an array of file updates.',
      status: "error",
    });
  }

  const results = await Promise.all(
    updates.map(async (update) => {
      const { file, content } = update;
      const filePath = path.join(WORKING_DIR, file);
      try {
        console.log(path.dirname(filePath), filePath);

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, content, "utf-8");
        return {
          [filePath]: "File updated successfully",
        };
      } catch (err) {
        return {
          [filePath]: `Error updating file: ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "File update results",
    results,
  });
});

/*
 * @route POST /create-file
 * @desc Create new files with specified content in the request body. The request body should contain a property 'files' with a JSON array of objects, each object should have a 'file' property specifying the file path (relative to the working directory) and a 'content' property specifying the content for the new file.
 */

app.post("/create-files", async (req, res) => {
  const files = req.body.files;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      message: "Invalid request body. 'files' property is required and should be an array.",
      status: "error",
    });
  }

  try {
    const results = await Promise.all(
      files.map(async (fileObj) => {
        const { file, content } = fileObj;

        if (!file || typeof content !== "string") {
          throw new Error("Each file must have a 'file' property and a 'content' property.");
        }

        const filePath = path.join(WORKING_DIR, file);

        // create nested dirs if needed
        await fs.promises.mkdir(path.dirname(filePath), {
          recursive: true,
        });

        await fs.promises.writeFile(filePath, content, "utf-8");

        return {
          [filePath]: "File created successfully",
        };
      }),
    );

    return res.status(201).json({
      message: "Files created successfully",
      files: results,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating files:", error);

    return res.status(500).json({
      error: error.message || "Failed to create files",
      status: "error",
    });
  }
});

export default httpServer;
