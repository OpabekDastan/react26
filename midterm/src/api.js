import data from "./questions.json";

const key = "interviewhub.simple.questions";

function wait() {
  return new Promise(function (resolve) {
    setTimeout(resolve, 300);
  });
}

function readQuestions() {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }

  const questions = JSON.parse(saved);
  if (!Array.isArray(questions)) {
    throw new Error("Question data is not valid.");
  }
  return questions;
}

export async function getQuestions() {
  await wait();
  return readQuestions();
}

export async function addQuestion(values) {
  await wait();
  const question = {
    ...values,
    id: crypto.randomUUID(),
    example: "",
    createdAt: new Date().toISOString()
  };

  const questions = readQuestions();
  localStorage.setItem(key, JSON.stringify([question, ...questions]));
  return question;
}
