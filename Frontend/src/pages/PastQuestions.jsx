function PastQuestions() {
  const questions = [
    { subject: 'Mathematics', title: 'Algebra past paper 2025' },
    { subject: 'Biology', title: 'Cell biology MCQ set' },
    { subject: 'History', title: 'African independence timeline' },
    { subject: 'Physics', title: 'Mechanics practice questions' }
  ];

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Past Questions</h2>
        <p>Study guides, exam practice, and school-specific resources.</p>
      </div>
      <div className="resource-grid">
        {questions.map((item, index) => (
          <div className="resource-card" key={index}>
            <h3>{item.subject}</h3>
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PastQuestions;
