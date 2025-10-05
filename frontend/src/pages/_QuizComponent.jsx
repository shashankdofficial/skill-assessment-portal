// frontend/src/pages/_QuizComponent.jsx
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSecure, postSecure } from '../utils/fetchSecureData';

export default function QuizComponent({ skill, user, onQuizComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const resp = await getSecure(`quiz/skill/${skill.id}?limit=20`);
        const data = resp.data || resp;
        // data is array of { id, text, options: JSON array of {id,text} or strings }
        const normalized = (data || []).map(q => {
          const opts = q.options && q.options.length && typeof q.options[0] === 'string'
            ? q.options.map((t, i) => ({ id: String(i), text: t }))
            : (q.options || []).map(o => (typeof o === 'string' ? { id: String(o), text: o } : { id: String(o.id ?? o), text: o.text ?? o }));
          return { id: q.id, text: q.text, options: opts };
        });
        setQuestions(normalized);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [skill.id]);

  const selectAnswer = (qid, optId) => setSelected(p => ({ ...p, [qid]: optId }));

  const submitQuiz = async () => {
    try {
      setLoading(true); setError(null);
      // build answers array
      const answers = Object.entries(selected).map(([questionId, selected_option]) => ({ questionId: Number(questionId), selected_option }));
      const resp = await postSecure('quiz/attempt', { skillId: skill.id, answers });
      const data = resp.data || resp;
      const pct = data.total ? Math.round((data.score / data.total) * 100) : data.score;
      setScore(pct);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>;
  if (!questions.length) return <Card title={`Quiz: ${skill.name}`}><div className="p-6">No questions available.</div></Card>;

  if (submitted) {
    return (
      <Card title="Quiz Results">
        <div style={{ textAlign: 'center', padding: 18 }}>
          <h3 style={{ fontSize: 28 }}>{score}%</h3>
          <p>Your score for {skill.name}</p>
          <div style={{ marginTop: 12 }}><Button onClick={() => onQuizComplete()}>Back</Button></div>
        </div>
      </Card>
    );
  }

  const q = questions[currentIndex];
  return (
    <Card title={`Quiz: ${skill.name} (${currentIndex + 1}/${questions.length})`} className="max-w-3xl">
      <div>
        <p style={{ fontWeight: 600 }}>{q.text}</p>
        <div style={{ marginTop: 12 }}>
          {q.options.map((opt, idx) => (
            <div key={opt.id} className={`p-3 rounded mb-2 ${selected[q.id] === String(opt.id) ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50'}`} onClick={() => selectAnswer(q.id, String(opt.id))}>
              <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</strong> {opt.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button variant="secondary" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>Previous</Button>
        {currentIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}>Next</Button>
        ) : (
          <Button onClick={submitQuiz}>Submit Quiz</Button>
        )}
      </div>
    </Card>
  );
}
