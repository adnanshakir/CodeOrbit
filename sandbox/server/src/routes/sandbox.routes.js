import { Router } from "express";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { v7 as uuid } from "uuid";
import { createSandboxKey } from "../cofig/redis.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import Project from "../models/project.model.js";

const router = Router();

/**
 * @route POST /api/sandbox/start
 * @desc Start a new sandbox environment for a project
 * @access Private
 */
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const projectId = req.body.projectId;

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const sandboxId = uuid();
    await Promise.all([createPod(sandboxId), createService(sandboxId), createSandboxKey(sandboxId)]);

    return res.status(201).json({
      message: "Sandbox environment created successfully",
      sandboxId,
      previewUrl: `http://${sandboxId}.preview.localhost`,
      agentUrl: `http://${sandboxId}.agent.localhost`,
      agentSocketUrl: `http://${sandboxId}.agent.localhost`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create sandbox environment",
      error: error.message,
    });
  }
});

/**
 * @route POST /api/sandbox/project
 * @desc Create a new project
 * @access Private
 */
router.post("/project", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    if (title === undefined || title.trim() === "") {
      return (title = "Untitled Project");
    }

    const newProject = new Project({
      title,
      userId: req.user.id,
    });

    await newProject.save();

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/sandbox/projects
 * @desc Retrieve all projects for the authenticated user
 * @access Private
 */
router.get("/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });

    return res.status(200).json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve projects",
      error: error.message,
    });
  }
});

export default router;
