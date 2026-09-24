# Async Tasks — README

## 1. How the closure keeps the task counter private

`createTask(name)` declares `count`, `status`, and `lastTime` as local
variables inside its own function body. Only the functions `run`,
`getCount`, `getStatus`, `getLastTime`, and `reset` are returned — the
variables themselves are never exposed. Each of those returned functions
was created inside `createTask`, so it "closes over" (remembers) that
exact set of variables, even after `createTask` has finished running.

There is no way to read or change `count` from outside except through
those functions, so it behaves like a private field. And because every
call to `createTask("...")` runs the function body again from scratch,
each task gets its own independent `count`/`status`/`lastTime` — that's
why `tasks.loadUsers` and `tasks.loadPosts` never share a counter.

## 2. Call stack example

When a task's `run()` is called, a new execution context for `run` is
pushed onto the call stack. Inside it, `new Promise(...)` runs
immediately, and `setTimeout(...)` is called — `setTimeout` itself
returns right away (it just registers a timer with the browser and
hands control back), so `run()` finishes and is popped off the stack.
The stack goes back to empty while the timer counts down in the
background, completely outside the call stack.

## 3. How JavaScript can continue while setTimeout is waiting

`setTimeout` never pauses the JS thread. It hands the waiting off to
the browser (a Web API), and the next line of code after it runs
immediately. Only once the timer's time is up does its callback get
placed in the task queue, waiting for the call stack to be empty
before it runs. This is exactly why, in "Run All Tasks" and
`runConcurrentDemo`, all three `run()` calls start their timers almost
at the same moment — none of them blocks the others while waiting.

## 4. Predicted and actual Event Loop output

Predicted output, reading the code top to bottom naively:

```
sync: start
setTimeout A (0ms)
promise .then A
setTimeout B (0ms)
promise .then B
async function: before await
async function: after await
sync: end
```

Actual output:

```
sync: start
async function: before await
sync: end
promise .then A
promise .then B
async function: after await
setTimeout A (0ms)
setTimeout B (0ms)
```

All plain synchronous code runs first — including the part of
`asyncDemo` before its `await`, because an async function runs
synchronously up to its first `await`. Once the call stack is empty,
every queued microtask (both `.then()` callbacks, then the `await`
continuation) runs before anything else. Only after the microtask
queue is completely empty does the event loop move on to the task
queue and run the two `setTimeout` callbacks, in the order their
timers were scheduled.

## 5. Difference between tasks (macrotasks) and microtasks

Microtasks — `Promise.then()` callbacks and `await` continuations —
always run right after the current synchronous code finishes, and the
whole microtask queue is drained before the engine even looks at the
task queue. Macrotasks — `setTimeout`, `setInterval`, UI events — run
one at a time, and the engine checks for new microtasks again after
each one. That's why `promise .then A/B` print before `setTimeout A`,
even though the timers were scheduled with a 0ms delay: microtasks
always get priority over the next macrotask.

## 6. How multiple Promises and errors are handled

In the sequential demo, each `await t.run()` is wrapped in its own
`try/catch`, so one task failing doesn't stop the loop from moving on
to the next task. In "Run All Tasks" and the concurrent demo,
`Promise.allSettled` is used instead of `Promise.all` —
`allSettled` waits for every promise to either resolve or reject and
never stops early, so the result always reports the outcome of all
three tasks (`fulfilled` or `rejected`), instead of one rejection
throwing away the results of the tasks that succeeded.

## 7. Difference between sequential and concurrent execution

In the sequential run, each `await t.run()` blocks that loop until the
current task's timer has fully finished — the next task's
`setTimeout` isn't even created until the previous one settles. Total
time ≈ the sum of all three task durations.

In the concurrent run, all three `run()` calls (and therefore all
three timers) start on the same synchronous pass, before any of them
has finished. They count down in parallel, so the total time ≈ the
duration of the single longest task, not the sum.
