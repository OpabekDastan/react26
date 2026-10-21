# InterviewHub

InterviewHub is a React single page application for practicing developer interview questions.
You can search, filter, sort and page through 100 questions, open a question to see its answer,
and add your own questions.

**Live demo: https://opabekdastan.github.io/react26/midterm/**

## Features

- List of 100 interview questions (Python, Django, SQL, Git, HTTP, React)
- Search by question title
- Filter by topic and level
- Sort by title (A-Z), newest first, or easy first
- Pagination (6 questions per page)
- Detail view with a "Show answer" / "Hide answer" button
- Controlled form to add a new question (with validation)
- Loading, error (with "Try again"), empty and success states
- Responsive layout for desktop, tablet and phone

## Data source

The app uses a **simulated API** (`src/api.js`):

- the first 100 records come from `src/questions.json`;
- the data is saved in `localStorage`, so added questions stay after a page reload;
- every request waits 300 ms and returns a Promise, like a real server.

To reset the data, delete the `interviewhub.simple.questions` key in
DevTools → Application → Local Storage.

## Project structure

```
src/
  main.jsx               entry point, renders <App />
  App.jsx                loads data, switches between list / detail / form
  api.js                 simulated API (getQuestions, addQuestion)
  options.js             list of topics and levels
  questions.json         100 initial questions
  style.css              styles
  components/
    QuestionList.jsx     search, filter, sort and pagination state
    Filters.jsx          search input and select boxes
    QuestionCard.jsx     one question in the list
    Pagination.jsx       Previous / Next buttons
    QuestionDetail.jsx   one question with its answer
    QuestionForm.jsx     controlled form for a new question
```

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Tech

React 19, Vite, plain CSS.
