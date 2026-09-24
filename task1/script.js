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
	const status = task.getStatus();
	const count = task.getCount();
	const time = task.getLastTime() > 0 ? `${task.getLastTime()}ms` : "–";

	el.dataset.state = status;
	el.querySelector(".status").textContent = status;
	el.querySelector(".count").textContent = count;
	el.querySelector(".time").textContent = time;

	console.log(
		`${taskConfigs.find((c) => c.id === id).name}: ${status}, runs: ${count}, time: ${time}`,
	);
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
			} catch (e) {}
			renderTask(id);
		});
	});
}

buildTaskUI();

document.getElementById("runAllBtn").addEventListener("click", async () => {
	const list = document.getElementById("allTasksList");
	const resultEl = document.getElementById("allTasksResult");
	list.innerHTML = "";
	resultEl.textContent = "";

	const results = await Promise.allSettled(
		taskConfigs.map((cfg) => tasks[cfg.id].run()),
	);

	renderAllTasks();

	results.forEach((result, i) => {
		const name = taskConfigs[i].name;
		const text =
			result.status === "fulfilled" ? `${name} Completed` : `${name} Failed`;
		const line = document.createElement("li");
		line.textContent = text;
		list.appendChild(line);
		console.log(text);
	});

	resultEl.textContent = "All tasks finished";
	console.log("All tasks finished");
});

async function runSequentialDemo() {
	const start = Date.now();

	for (const cfg of taskConfigs) {
		try {
			await tasks[cfg.id].run();
		} catch (e) {}
		renderTask(cfg.id);
	}

	const end = Date.now();
	const msg = `Sequential took ${end - start}ms`;
	document.getElementById("seqResult").textContent = msg;
	console.log(msg);
}

async function runConcurrentDemo() {
	const start = Date.now();

	await Promise.allSettled(taskConfigs.map((cfg) => tasks[cfg.id].run()));

	renderAllTasks();

	const end = Date.now();
	const msg = `Concurrent took ${end - start}ms`;
	document.getElementById("concResult").textContent = msg;
	console.log(msg);
}

document
	.getElementById("runSeqBtn")
	.addEventListener("click", runSequentialDemo);
document
	.getElementById("runConcBtn")
	.addEventListener("click", runConcurrentDemo);

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
