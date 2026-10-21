import { useState } from "react";

export default function QuestionDetail(props) {
  const [show, setShow] = useState(false);
  const question = props.question;

  function toggleAnswer() {
    setShow(function (oldShow) {
      return !oldShow;
    });
  }

  let text = "Show answer";
  if (show) text = "Hide answer";

  return (
    <section className="panel">
      <button className="secondary" onClick={props.onBack}>
        Back to questions
      </button>
      <p className="info">
        {question.topic} / {question.difficulty}
      </p>
      <h2>{question.title}</h2>
      <p>Try to answer in your own words first.</p>
      <button onClick={toggleAnswer} aria-expanded={show}>
        {text}
      </button>
      {show && (
        <div className="answer">
          <p>{question.answer}</p>
          {question.example && (
            <pre>
              <code>{question.example}</code>
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
