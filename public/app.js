const API_BASE = "";

const el = {
  createForm: document.getElementById("createForm"),
  refreshBtn: document.getElementById("refreshBtn"),
  tasks: document.getElementById("tasks"),
  stats: document.getElementById("stats"),

  title: document.getElementById("title"),
  description: document.getElementById("description"),
  status: document.getElementById("status"),

  modalOverlay: document.getElementById("modalOverlay"),
  editModal: document.getElementById("editModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),

  editForm: document.getElementById("editForm"),
  editId: document.getElementById("editId"),
  editTitleInput: document.getElementById("editTitleInput"),
  editDescriptionInput: document.getElementById("editDescriptionInput"),
  editStatusInput: document.getElementById("editStatusInput"),
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function openModal(task) {
  el.modalOverlay.classList.remove("hidden");
  el.editModal.classList.remove("hidden");

  el.editId.value = task.id;
  el.editTitleInput.value = task.title || "";
  el.editDescriptionInput.value = task.description || "";
  el.editStatusInput.value = task.status || "pending";
}

function closeModal() {
  el.modalOverlay.classList.add("hidden");
  el.editModal.classList.add("hidden");
}

function renderTasks(tasks) {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  el.stats.textContent = `Total: ${tasks.length} | Done: ${doneCount} | Pending: ${tasks.length - doneCount}`;

  if (!tasks.length) {
    el.tasks.innerHTML = `<div class="stats">No tasks yet. Create one on the left.</div>`;
    return;
  }

  el.tasks.innerHTML = tasks
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .map((t) => {
      const createdAt = t.createdAt ? new Date(t.createdAt).toLocaleString() : "";
      const updatedAt = t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "";

      return `
        <div class="task">
          <div>
            <h4>${escapeHtml(t.title)}</h4>
            <p>${escapeHtml(t.description || "")}</p>

            <div class="badges">
              <span class="badge ${t.status === "done" ? "done" : ""}">${escapeHtml(t.status)}</span>
              <span class="badge">id: ${t.id}</span>
              ${createdAt ? `<span class="badge">created: ${escapeHtml(createdAt)}</span>` : ""}
              ${updatedAt ? `<span class="badge">updated: ${escapeHtml(updatedAt)}</span>` : ""}
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" data-action="edit" data-id="${t.id}">Edit</button>
            <button class="btn btn-danger" data-action="delete" data-id="${t.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

async function loadTasks() {
  el.refreshBtn.disabled = true;
  try {
    const data = await api("/tasks");
    renderTasks(data.tasks || []);
  } catch (err) {
    el.tasks.innerHTML = `<div class="stats">Error: ${escapeHtml(err.message)}</div>`;
  } finally {
    el.refreshBtn.disabled = false;
  }
}

el.createForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: el.title.value,
    description: el.description.value,
    status: el.status.value,
  };

  try {
    await api("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    el.createForm.reset();
    el.status.value = "pending";
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

el.refreshBtn.addEventListener("click", () => {
  loadTasks();
});

el.tasks.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = Number(btn.getAttribute("data-id"));
  if (!Number.isInteger(id)) return;

  if (action === "delete") {
    const ok = confirm(`Delete task #${id}?`);
    if (!ok) return;

    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      alert(err.message);
    }
  }

  if (action === "edit") {
    try {
      const task = await api(`/tasks/${id}`);
      openModal(task);
    } catch (err) {
      alert(err.message);
    }
  }
});

el.closeModalBtn.addEventListener("click", closeModal);
el.cancelModalBtn.addEventListener("click", closeModal);
el.modalOverlay.addEventListener("click", closeModal);

el.editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = Number(el.editId.value);
  if (!Number.isInteger(id)) return;

  const payload = {
    title: el.editTitleInput.value,
    description: el.editDescriptionInput.value,
    status: el.editStatusInput.value,
  };

  try {
    await api(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    closeModal();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

loadTasks();
