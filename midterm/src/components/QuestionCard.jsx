export default function QuestionCard(props) {
  const question = props.question;

  function open() {
    props.onOpen(question);
  }

  return (
    <article className="card">
      <p className="info">
        {question.topic} / {question.difficulty}
      </p>
      <h3>{question.title}</h3>
      <button className="secondary" onClick={open}>
        Open question
      </button>
    </article>
  );
}
