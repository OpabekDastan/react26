import { useState } from "react";
import { addQuestion } from "../api.js";
import { topics, levels } from "../options.js";

export default function QuestionForm(props) {
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("Python");
  const [level, setLevel] = useState("Easy");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function changeTitle(event) {
    setTitle(event.target.value);
  }
  function changeAnswer(event) {
    setAnswer(event.target.value);
  }
  function changeTopic(event) {
    setTopic(event.target.value);
  }
  function changeLevel(event) {
    setLevel(event.target.value);
  }
  function option(value) {
    return (
      <option key={value} value={value}>
        {value}
      </option>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (title.trim().length < 8 || answer.trim().length < 20) {
      setError("Use at least 8 characters for the question and 20 for the answer.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const question = await addQuestion({
        title: title.trim(),
        answer: answer.trim(),
        topic: topic,
        difficulty: level
      });
      props.onSave(question);
    } catch {
      setError("Cannot save the question. Browser storage may be full or unavailable.");
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Add a question</h2>
      <fieldset disabled={saving}>
        <label>
          Question
          <input
            value={title}
            onChange={changeTitle}
            maxLength="160"
          />
        </label>
        <label>
          Topic
          <select value={topic} onChange={changeTopic}>
            {topics.map(option)}
          </select>
        </label>
        <label>
          Level
          <select value={level} onChange={changeLevel}>
            {levels.map(option)}
          </select>
        </label>
        <label>
          Answer
          <textarea
            rows="6"
            value={answer}
            onChange={changeAnswer}
            maxLength="4000"
          />
        </label>
      </fieldset>
      {error !== "" && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save question"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={props.onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
