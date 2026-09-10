/* ============================================================
   Small helpers used by every task to print into its output panel
   ============================================================ */

function formatValue(v) {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function log(outId, label, value) {
  const el = document.getElementById(outId);
  const row = document.createElement('div');
  row.className = 'log-row';
  const l = document.createElement('span');
  l.className = 'log-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'log-value';
  v.textContent = formatValue(value);
  row.append(l, v);
  el.appendChild(row);
}

function logError(outId, err) {
  const el = document.getElementById(outId);
  const row = document.createElement('div');
  row.className = 'log-row log-error';
  row.textContent = `⚠ ${err.name}: ${err.message}`;
  el.appendChild(row);
}

/* ============================================================
   TASK 1 — Variables and Data Types
   ============================================================ */
function task1(outId) {
  const studentName = "Zhantore";
  let studentAge = 21;
  let isActive = true;
  const courses = ["Algorithms", "Web Development", "Databases"];
  const address = { city: "Almaty", street: "Abay Ave" };
  let middleName;          // declared but never assigned -> undefined
  const graduationYear = null; // "on purpose empty", not "not yet known"

  log(outId, 'studentName ->', studentName);
  log(outId, 'typeof studentName ->', typeof studentName);
  log(outId, 'studentAge ->', studentAge);
  log(outId, 'typeof studentAge ->', typeof studentAge);
  log(outId, 'isActive ->', isActive);
  log(outId, 'typeof isActive ->', typeof isActive);
  log(outId, 'courses ->', courses);
  log(outId, 'typeof courses ->', typeof courses); // "object", arrays are reference values
  log(outId, 'address ->', address);
  log(outId, 'typeof address ->', typeof address);
  log(outId, 'middleName (undefined) ->', middleName);
  log(outId, 'typeof middleName ->', typeof middleName);
  log(outId, 'graduationYear (null) ->', graduationYear);
  log(outId, 'typeof graduationYear ->', typeof graduationYear); // "object" -> old JS bug, see insight

  const sentence = `${studentName} is ${studentAge} years old and studies ${courses.length} courses.`;
  log(outId, 'template literal ->', sentence);

  /* primitive vs reference:
     primitive  -> studentName, studentAge, isActive, middleName, graduationYear
     reference  -> courses (array), address (object) */

  /* INSIGHT:
   let vs const - const just means you can't reassign the variable itself.
   if it holds an object/array you can still change what's inside, the box stays the same.
   typeof null gives "object" which is honestly just an old bug, null isn't really an object.
  primitives: string, number, boolean, undefined, null, symbol, bigint. everything else is a reference.*/
}

/* ============================================================
   TASK 2 — Arrays
   ============================================================ */
function task2(outId) {
  const numbers = [3, 7, 2, 10, 5];

  const doubled = numbers.map(n => n * 2);
  const above5 = numbers.filter(n => n > 5);
  const firstAbove5 = numbers.find(n => n > 5);
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  const has10 = numbers.includes(10);

  log(outId, 'original numbers ->', numbers);
  log(outId, 'doubled (map) ->', doubled);
  log(outId, 'above 5 (filter) ->', above5);
  log(outId, 'first above 5 (find) ->', firstAbove5);
  log(outId, 'sum (reduce) ->', sum);
  log(outId, 'includes 10 ->', has10);
  log(outId, 'original still untouched ->', numbers);

  /* INSIGHT:
   map and filter always give back a new array. reduce can return anything, here it's just a number.
   find gives you the actual item, not the index (findIndex is the one for that).
   checked and none of these touch the original numbers array, good to see it for real */
}

/* ============================================================
   TASK 3 — Arrays of Objects
   ============================================================ */
function task3(outId) {
  const students = [
    { id: 1, name: "Anna", grade: 85 },
    { id: 2, name: "John", grade: 62 },
    { id: 3, name: "Sara", grade: 91 },
    { id: 4, name: "Mike", grade: 55 },
  ];

  const passed = students.filter(s => s.grade >= 70);
  const names = students.map(s => s.name);
  const byId3 = students.find(s => s.id === 3);
  const top = students.reduce((best, s) => (s.grade > best.grade ? s : best));
  const average = students.reduce((acc, s) => acc + s.grade, 0) / students.length;
  // I used 60 as the passing mark here, same idea as "≥70" above but for a boolean flag per student
  const withPassedFlag = students.map(s => ({ ...s, passed: s.grade >= 60 }));

  log(outId, 'students with grade >= 70 ->', passed);
  log(outId, 'names ->', names);
  log(outId, 'student with id 3 ->', byId3);
  log(outId, 'top student ->', top);
  log(outId, 'average grade ->', average.toFixed(2));
  log(outId, 'with passed flag ->', withPassedFlag);
  log(outId, 'original students unchanged ->', students);

  /* INSIGHT:
   {...s, passed: ...} makes a fresh copy of each student, so the original array stays untouched.
   that's basically the whole point of this task.
   reduce without an initial value just uses students[0] as the starting "best", works here
  but probably not safe if the array could ever be empty. */
}

/* ============================================================
   TASK 4 — Objects
   ============================================================ */
function task4(outId) {
  const user = {
    id: 1,
    name: "Diana",
    age: 20,
    address: { city: "Almaty", street: "Dostyk" },
  };

  log(outId, 'user.name ->', user.name);
  log(outId, 'user.address.city ->', user.address.city);

  user.age = 21;                 // change age
  user.email = "diana@kbtu.kz";  // add email
  delete user.street;            // (was never there at top level — the real street lives in address)
  delete user.address.street;    // remove the nested street instead

  log(outId, 'after edits ->', user);

  const { name, age } = user;                       // plain destructuring
  const { address: { city } } = user;                // nested destructuring
  const { name: userName } = user;                   // renaming during destructuring

  log(outId, 'destructured name & age ->', { name, age });
  log(outId, 'destructured nested city ->', city);
  log(outId, 'renamed userName ->', userName);

  /* INSIGHT:
   at first I wrote delete user.street and couldn't figure out why street was still there.
   turns out street was inside user.address the whole time, not on user directly.
   the { name: userName } rename syntax is a bit confusing at first:
   left side is always the existing key on the object, right side is the new variable name.*/
}

/* ============================================================
   TASK 5 — Values and References
   ============================================================ */
function task5(outId) {
  const original = { name: "Alice", score: 10 };
  const copy = original;      // same reference, not a real copy
  copy.score = 20;

  log(outId, 'copy.score = 20 ... original.score ->', original.score); // also 20!

  const copy2 = { ...original };   // real, shallow copy
  copy2.score = 30;
  log(outId, 'after spread copy, copy2.score = 30 ... original.score ->', original.score); // still 20, safe now

  const user = { name: "Alice", address: { city: "Almaty" } };
  const userShallow = { ...user };
  userShallow.address.city = "Astana"; // nested object is still the SAME object
  log(outId, 'shallow copy, changed nested city ... original city ->', user.address.city); // "Astana" too!

  const userDeep = { ...user, address: { ...user.address } };
  userDeep.address.city = "Shymkent";
  log(outId, 'deep-ish copy, changed nested city ... original city ->', user.address.city); // untouched

  /* INSIGHT:
   copy = original doesn't actually copy anything, it's just a second name pointing at the same object.
   that's why copy.score = 20 also changes original.score.
   {...original} only copies one level deep, so the nested address object was still shared,
   had to spread that separately too. for a real deep copy I'd just use structuredClone(obj). */
}

/* ============================================================
   TASK 6 — Functions
   ============================================================ */
function isEven(number) {
  return number % 2 === 0;
}
const isEvenArrow = (number) => number % 2 === 0;

function getFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}
const calculatePrice = (price, quantity) => price * quantity;
const calculateDiscount = (price, percent) => price - (price * percent) / 100;
const getMax = (a, b) => Math.max(a, b);

function task6(outId) {
  log(outId, 'isEven(4) ->', isEven(4));
  log(outId, 'isEvenArrow(4) ->', isEvenArrow(4));
  log(outId, 'getFullName("Zhantore","Orazymbetov") ->', getFullName("Zhantore", "Orazymbetov"));
  log(outId, 'calculatePrice(2500, 3) ->', calculatePrice(2500, 3));
  log(outId, 'calculateDiscount(2500, 10) ->', calculateDiscount(2500, 10));
  log(outId, 'getMax(7, 12) ->', getMax(7, 12));

  /* INSIGHT:
   isEven and isEvenArrow do the exact same thing, just different syntax.
   arrow function is shorter but has no own "this" and can't be used as a constructor.
   doesn't matter for simple stuff like this, but I'll think twice before using
   an arrow function as an object method. */
}

/* ============================================================
   TASK 7 — Functions as Values
   ============================================================ */
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

function calculate(a, b, operation) {
  return operation(a, b);
}

function task7(outId) {
  log(outId, 'calculate(5, 3, add) ->', calculate(5, 3, add));
  log(outId, 'calculate(5, 3, multiply) ->', calculate(5, 3, multiply));

  /* INSIGHT:
   yes, functions can be stored in variables (add and multiply are just values here)
   and passed into other functions as arguments, that's basically what "higher order function" means.
   add by itself is the function, you can pass it around without calling it.
   add() actually calls it and gives you a number back, not a function.*/
}

/* ============================================================
   TASK 8 — Scope
   ============================================================ */
const message = "global";

function scopeTest(outId) {
  let message = "function";
  if (true) {
    let message = "block";
    log(outId, 'message inside if-block ->', message);
  }
  log(outId, 'message inside function, after the block ->', message);
}

function task8(outId) {
  log(outId, 'message at top level (before calling anything) ->', message);
  scopeTest(outId);
  log(outId, 'message at top level, still unchanged ->', message);

  {
    var varVar = "var value";
    let letVar = "let value";
    const constVar = "const value";
  }
  log(outId, 'varVar right after the block ->', varVar); // var "leaks" out of the block
  try {
    // eval so a real ReferenceError is caught instead of crashing the whole script,
    // since letVar/constVar genuinely stop existing outside the block
    log(outId, 'letVar right after the block ->', eval('letVar'));
  } catch (e) {
    logError(outId, e);
  }

  /* INSIGHT:
   the confusing part is having "message" declared three times at three levels.
   js looks for the variable from the inside out and just stops at the first match it finds.
   var ignores the curly braces of a block and stays alive till the end of the function,
   but let/const are actually locked inside {}, which is why the eval throws a ReferenceError. */
}

/* ============================================================
   TASK 9 — Closures
   ============================================================ */
function createCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

function createAdder(value) {
  return function (number) {
    return value + number;
  };
}

function task9(outId) {
  const counterA = createCounter();
  log(outId, 'counterA() ->', counterA());
  log(outId, 'counterA() ->', counterA());
  log(outId, 'counterA() ->', counterA());

  const counterB = createCounter();
  log(outId, 'counterB() (fresh counter) ->', counterB());

  const addFive = createAdder(5);
  log(outId, 'addFive(10) ->', addFive(10));
  log(outId, 'addFive(20) ->', addFive(20));

  /* INSIGHT:
   every call to createCounter() makes its own separate count variable.
   counterA and counterB don't interfere with each other, you can see it because
   counterB starts back at 1 even though counterA is already at 3.
   the inner function isn't "remembering a value", it just keeps a live link to the
   scope it was created in. that's what a closure actually is. */
}

/* ============================================================
   TASK 10 — Destructuring, Spread and Rest
   ============================================================ */
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

function task10(outId) {
  const numbers = [10, 20, 30, 40];
  const [first, second] = numbers;
  log(outId, 'first, second ->', { first, second });

  const user = { id: 1, name: "Anna", age: 21 };
  const { name, age } = user;
  log(outId, 'destructured name, age ->', { name, age });

  const moreNumbers = [...numbers, 50];
  const olderUser = { ...user, age: 22 };
  const userWithEmail = { ...user, email: "anna@example.com" };
  const combined = [...numbers, ...moreNumbers];

  log(outId, 'moreNumbers (copy + 50) ->', moreNumbers);
  log(outId, 'olderUser (copy, age 22) ->', olderUser);
  log(outId, 'userWithEmail (copy + email) ->', userWithEmail);
  log(outId, 'combined arrays ->', combined);
  log(outId, 'original numbers/user untouched ->', { numbers, user });

  log(outId, 'sum(1, 2) ->', sum(1, 2));
  log(outId, 'sum(1, 2, 3, 4) ->', sum(1, 2, 3, 4));

  // INSIGHT:
  // kept mixing up spread and rest even though they look identical (...).
  // spread unpacks a collection into separate items, used wherever js expects
  // individual values (inside [], {}, or a function call).
  // rest does the opposite, it gathers separate arguments back into one array,
  // and it only works in a function's parameter list, has to be the last param.
}

/* ============================================================
   TASK 11 — Optional Chaining and Default Values
   ============================================================ */
function task11(outId) {
  const userWithAddress = { name: "Anna", address: { city: "Almaty" } };
  const userNoAddress = { name: "John" };

  try {
    const city = userNoAddress.address.city; // real TypeError: address is undefined
    log(outId, 'city ->', city);
  } catch (e) {
    logError(outId, e);
  }

  log(outId, 'safe with ?. (has address) ->', userWithAddress?.address?.city);
  log(outId, 'safe with ?. (no address) ->', userNoAddress?.address?.city);
  log(outId, 'with ?? fallback ->', userNoAddress?.address?.city ?? "City not specified");

  const testValues = [0, "", false, null, undefined];
  testValues.forEach(v => {
    log(outId, `value = ${formatValue(v)}  ->  (v || "default")`, v || "default");
    log(outId, `value = ${formatValue(v)}  ->  (v ?? "default")`, v ?? "default");
  });

  /* INSIGHT:
   ?. just stops and returns undefined the moment something on the left is null/undefined,
   instead of throwing. really useful for API data where a field might just not be there.
   || vs ??: || replaces ANY falsy value (0, "", false, null, undefined), but ?? only
   cares about null and undefined. so || quietly breaks valid 0 or "" values, which is
   exactly why ?? got added to the language. */
}

/* ============================================================
   FINAL TASK
   ============================================================ */
function getAverage(grades) {
  return grades.reduce((acc, g) => acc + g, 0) / grades.length;
}
function getStudentAverage(student) {
  return getAverage(student.grades);
}
function getPassedStudents(students, passMark = 60) {
  return students.filter(s => getStudentAverage(s) >= passMark);
}
function getStudentNames(students) {
  return students.map(s => s.name);
}
function findStudent(students, id) {
  return students.find(s => s.id === id);
}
function getTopStudent(students) {
  return students.reduce((best, s) => (getStudentAverage(s) > getStudentAverage(best) ? s : best));
}

function taskFinal(outId) {
  const students = [
    { id: 1, name: "Dastan", age: 20, grades: [85, 90, 78] },
    { id: 2, name: "Zhantore", age: 21, grades: [60, 55, 50] },
    { id: 3, name: "Birzhan", age: 22, grades: [95, 88, 92] },
    { id: 4, name: "Nursultan", age: 20, grades: [40, 45, 50] },
    { id: 5, name: "Bekzhan", age: 23, grades: [70, 65, 75] },
  ];

  log(outId, 'passed students (avg >= 60) ->', getPassedStudents(students).map(s => s.name));
  log(outId, 'all names ->', getStudentNames(students));
  log(outId, 'find id 3 ->', findStudent(students, 3));
  log(outId, 'top student ->', getTopStudent(students).name);

  const summary = students.map(s => ({
    id: s.id,
    name: s.name,
    average: Number(getStudentAverage(s).toFixed(1)),
    passed: getStudentAverage(s) >= 60,
  }));
  log(outId, 'final { id, name, average, passed } array ->', summary);
  log(outId, 'original students array untouched ->', students);

  /* INSIGHT:
   building small plain functions (getAverage, getStudentAverage) and reusing them in
   getPassedStudents/getTopStudent felt way nicer than one giant loop, each piece is
   easy to check on its own. none of them touch the students array directly,
   map/filter/reduce/find always give back something new so the original data stays intact. */
}

/* ============================================================
   Render: table of contents, source code (with comments) + run each task
   ============================================================ */

const TASKS = [
  { id: '1', title: 'Variables & Types', fn: task1 },
  { id: '2', title: 'Arrays', fn: task2 },
  { id: '3', title: 'Arrays of Objects', fn: task3 },
  { id: '4', title: 'Objects', fn: task4 },
  { id: '5', title: 'Values & References', fn: task5 },
  { id: '6', title: 'Functions', fn: task6 },
  { id: '7', title: 'Functions as Values', fn: task7 },
  { id: '8', title: 'Scope', fn: task8 },
  { id: '9', title: 'Closures', fn: task9 },
  { id: '10', title: 'Destructuring / Spread / Rest', fn: task10 },
  { id: '11', title: 'Optional Chaining', fn: task11 },
  { id: 'final', title: 'Final Task', fn: taskFinal },
];

const tocList = document.getElementById('toc-list');
TASKS.forEach(t => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `#task-${t.id}`;
  a.innerHTML = `<span class="n">${t.id === 'final' ? 'FT' : t.id.padStart(2, '0')}</span><span>${t.title}</span>`;
  li.appendChild(a);
  tocList.appendChild(li);
});

TASKS.forEach(t => {
  const codeEl = document.getElementById(`code-${t.id}`);
  if (codeEl) codeEl.textContent = t.fn.toString();
  try {
    t.fn(`output-${t.id}`);
  } catch (e) {
    logError(`output-${t.id}`, e);
  }
});

if (window.hljs) {
  document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
}

/* pull the "// INSIGHT:" comment block out of each function's source
 and drop it into the visible sticky-note panel for that task */
TASKS.forEach(t => {
  const source = t.fn.toString();
  const match = source.match(/\/\/ INSIGHT[\s\S]*?(?=\n\s*\}\s*$)/);
  const panel = document.getElementById(`insight-${t.id}`);
  if (match && panel) {
    const text = match[0]
      .replace(/\/\/ INSIGHT.*:?/, '')
      .split('\n')
      .map(l => l.replace(/^\s*\/\/\s?/, '').trim())
      .filter(Boolean)
      .join(' ');
    text.split(/(?<=[.!?])\s+/).forEach(sentence => {
      const p = document.createElement('p');
      p.textContent = sentence.trim();
      if (p.textContent) panel.appendChild(p);
    });
  }
});

// simple scroll-spy for the sidebar
if ('IntersectionObserver' in window) {
  const sections = TASKS.map(t => document.getElementById(`task-${t.id}`));
  const navLinks = Array.from(document.querySelectorAll('nav.toc a'));
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  sections.forEach(s => s && spy.observe(s));
}
