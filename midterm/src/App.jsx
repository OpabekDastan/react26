import { useEffect, useState } from "react";
import { getQuestions } from "./api.js";
import QuestionList from "./components/QuestionList.jsx";
import QuestionDetail from "./components/QuestionDetail.jsx";
import QuestionForm from "./components/QuestionForm.jsx";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(
    function () {
      let active = true;

      async function load() {
        setLoading(true);
        setError("");
        try {
          const data = await getQuestions();
          if (active) setQuestions(data);
        } catch {
          if (active)
            setError("Cannot load questions. Check browser storage and try again.");
        }
        if (active) setLoading(false);
      }

      load();
      return function () {
        active = false;
      };
    },
    [retry]
  );

  useEffect(
    function () {
      if (message === "") return;

      const timer = setTimeout(function () {
        setMessage("");
      }, 3000);

      return function () {
        clearTimeout(timer);
      };
    },
    [message]
  );

  function tryAgain() {
    setRetry(function (oldRetry) {
      return oldRetry + 1;
    });
  }

  function openForm() {
    setSelected(null);
    setMessage("");
    setShowForm(true);
  }

  function back() {
    setSelected(null);
    setShowForm(false);
  }
