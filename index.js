const express = require("express");

const app = express();

app.use(express.json());
 app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let tasks = [
  {
    id: 1,
    title: "Learn Express basics",
    description: "Create a simple CRUD API",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 2;

function findTaskIndexById(id) {
  return tasks.findIndex((t) => t.id === id);
}

app.get("/api", (req, res) => {
  res.json({
    message: "Node.js CRUD API is running",
    endpoints: [
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "DELETE /tasks/:id",
    ],
  });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/tasks", (req, res) => {
  res.json({
    total: tasks.length,
    tasks,
  });
});

app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task id must be a number" });
  }

  const idx = findTaskIndexById(id);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(tasks[idx]);
});

app.post("/tasks", (req, res) => {
  const { title, description, status } = req.body || {};

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required and must be a string" });
  }

  if (description != null && typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }

  if (status != null && !["pending", "done"].includes(status)) {
    return res.status(400).json({ error: "status must be 'pending' or 'done'" });
  }

  const now = new Date().toISOString();
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: (description || "").trim(),
    status: status || "pending",
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task id must be a number" });
  }

  const idx = findTaskIndexById(id);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, description, status } = req.body || {};

  if (title != null && typeof title !== "string") {
    return res.status(400).json({ error: "title must be a string" });
  }

  if (description != null && typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }

  if (status != null && !["pending", "done"].includes(status)) {
    return res.status(400).json({ error: "status must be 'pending' or 'done'" });
  }

  const updated = {
    ...tasks[idx],
    title: title != null ? title.trim() : tasks[idx].title,
    description: description != null ? description.trim() : tasks[idx].description,
    status: status != null ? status : tasks[idx].status,
    updatedAt: new Date().toISOString(),
  };

  tasks[idx] = updated;
  return res.json(updated);
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Task id must be a number" });
  }

  const idx = findTaskIndexById(id);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deleted = tasks[idx];
  tasks = tasks.filter((t) => t.id !== id);

  return res.json({
    message: "Task deleted",
    deleted,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
