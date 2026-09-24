// ---------------------------------------------------------
// randomTime + createTask
// Same logic you already wrote and tested: closure keeps
// count/status private, run() returns a Promise that
// resolves ~70% of the time and rejects ~30% of the time.
// Added: getStatus() and getLastTime() so the DOM can read
// them (you already had getCount() in the same style).
// ---------------------------------------------------------

function randomTime() {
  let max = 2000;
  let min = 500;
  let result = Math.floor(Math.random() * (max - min) + min);
  return result;
}

function createTask(name) {
  let count = 0;
  let status = "idle";
  let lastTime = 0;

  return {
    run: () => {
      status = "loading";
      const time = randomTime();
      lastTime = time;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.3) {
            status = "failed";
            count++;
            reject(new Error(`${name} failed`));
          } else {
            status = "completed";
            count++;
            resolve(`${name} completed`);
          }
        }, time);
      });
    },
    getCount: () => count,
    getStatus: () => status,
    getLastTime: () => lastTime,
    reset: () => {
      count = 0;
      status = "idle";
      lastTime = 0;
    },
  };
}

// ---------------------------------------------------------
// DOM wiring: build one row per task, keep it in sync with
// the task's own state via the getters above.
// ---------------------------------------------------------

const taskConfigs = [
  { id: "loadUsers", name: "Load Users" },
  { id: "loadPosts", name: "Load Posts" },
  { id: "loadComments", name: "Load Comments" },
];

const tasks = {};
taskConfigs.forEach((cfg) => {
  tasks[cfg.id] = createTask(cfg.name);
});

function renderTask(id) {
  const task = tasks[id];
  const el = document.getElementById(`task-${id}`);
  el.dataset.state = task.getStatus();
  el.querySelector(".status").textContent = task.getStatus();
  el.querySelector(".count").textContent = task.getCount();
  el.querySelector(".time").textContent =
    task.getLastTime() > 0 ? `${task.getLastTime()}ms` : "–";
}

function renderAllTasks() {
  taskConfigs.forEach((cfg) => renderTask(cfg.id));
}

function buildTaskUI() {
  const container = document.getElementById("tasks");

  taskConfigs.forEach((cfg) => {
    const row = document.createElement("div");
    row.className = "task";
    row.id = `task-${cfg.id}`;
    row.dataset.state = "idle";
    row.innerHTML = `
      <span class="task-name">${cfg.name}</span>
      <span class="task-meta">
        status <b class="status">idle</b>
        runs <b class="count">0</b>
        time <b class="time">–</b>
      </span>
      <button class="run-one-btn" data-id="${cfg.id}">Run</button>
    `;
    container.appendChild(row);
  });

  document.querySelectorAll(".run-one-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      try {
        await tasks[id].run();
      } catch (e) {
        // status is already set to "failed" inside run() itself,
        // we just need to stop the rejection from bubbling further
      }
      renderTask(id);
    });
  });
}

buildTaskUI();

// ---------------------------------------------------------
// Run All Tasks: same idea as your runConcurrent — start all
// three run() calls together, wait for all of them with
// Promise.allSettled (so one failure doesn't stop the others).
// ---------------------------------------------------------

document.getElementById("runAllBtn").addEventListener("click", async () => {
  const list = document.getElementById("allTasksList");
  const resultEl = document.getElementById("allTasksResult");
  list.innerHTML = "";
  resultEl.textContent = "";

  const results = await Promise.allSettled(
    taskConfigs.map((cfg) => tasks[cfg.id].run())
  );

  renderAllTasks();

  results.forEach((result, i) => {
    const name = taskConfigs[i].name;
    const line = document.createElement("li");
    line.textContent =
      result.status === "fulfilled" ? `${name} Completed` : `${name} Failed`;
    list.appendChild(line);
  });

  resultEl.textContent = "All tasks finished";
});

// ---------------------------------------------------------
// Sequential vs concurrent comparison.
// Uses fresh tasks each time so the counters don't mix with
// the ones shown above.
// ---------------------------------------------------------

async function runSequentialDemo() {
  const t1 = createTask("Load Users");
  const t2 = createTask("Load Posts");
  const t3 = createTask("Load Comments");

  const start = Date.now();

  for (const t of [t1, t2, t3]) {
    try {
      await t.run();
    } catch (e) {
      // ignore here — we only care about total time in this demo
    }
  }

  const end = Date.now();
  document.getElementById(
    "seqResult"
  ).textContent = `Sequential took ${end - start}ms`;
}

async function runConcurrentDemo() {
  const t1 = createTask("Load Users");
  const t2 = createTask("Load Posts");
  const t3 = createTask("Load Comments");

  const start = Date.now();

  await Promise.allSettled([t1.run(), t2.run(), t3.run()]);

  const end = Date.now();
  document.getElementById(
    "concResult"
  ).textContent = `Concurrent took ${end - start}ms`;
}

document
  .getElementById("runSeqBtn")
  .addEventListener("click", runSequentialDemo);
document
  .getElementById("runConcBtn")
  .addEventListener("click", runConcurrentDemo);

// ---------------------------------------------------------
// Event Loop Demo.
// 2 timers, 2 Promise.then callbacks, 1 async function —
// logs to both the console and the page, in the ORDER they
// actually run (not the order they're written in).
// ---------------------------------------------------------

async function asyncDemo(log) {
  log("async function: before await");
  await null;
  log("async function: after await");
}

function eventLoopDemo(outputEl) {
  outputEl.textContent = "";

  const log = (msg) => {
    console.log(msg);
    outputEl.textContent += msg + "\n";
  };

  log("sync: start");

  setTimeout(() => log("setTimeout A (0ms)"), 0);

  Promise.resolve().then(() => log("promise .then A"));

  setTimeout(() => log("setTimeout B (0ms)"), 0);

  Promise.resolve().then(() => log("promise .then B"));

  asyncDemo(log);

  log("sync: end");
}

document.getElementById("eventLoopBtn").addEventListener("click", () => {
  eventLoopDemo(document.getElementById("eventLoopOutput"));
});
