// frontend/src/pages/Quiz.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

function normalizeOptions(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((o, i) => {
      if (o == null) return { id: String(i), text: '' };
      if (typeof o === 'string') return { id: String(i), text: o };
      return { id: (o.id ?? o.key ?? String(i)), text: (o.text ?? o.label ?? String(o)) };
    });
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeOptions(parsed);
    } catch (e) {
      return raw.split('|').map((t, i) => ({ id: String(i), text: t.trim() }));
    }
  }

  if (typeof raw === 'object') {
    try {
      const vals = Object.values(raw);
      if (Array.isArray(vals)) return normalizeOptions(vals);
    } catch (e) { /* ignore */ }
  }

  return [];
}

export default function Quiz() {
  const { skillId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setQuestions(null);
        const resp = await api.get(`/quiz/skill/${skillId}?limit=10`);
        const payload = resp?.data ?? resp;
        const qArr = Array.isArray(payload) ? payload : (payload.rows || []);
        if (!cancelled) setQuestions(qArr);
      } catch (err) {
        console.error('Failed to load quiz questions', err);
        if (!cancelled) setQuestions([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [skillId]);

  const handleSelect = (qid, optionId) => {
    setAnswers(prev => ({ ...prev, [qid]: String(optionId) }));
  };

  const handleSubmit = async () => {
    try {
      const answersPayload = Object.entries(answers).map(([qid, selected_option]) => ({
        questionId: parseInt(qid, 10),
        selected_option: String(selected_option)
      }));
      const payload = { skillId: parseInt(skillId, 10), answers: answersPayload };
      const resp = await api.post('/quiz/attempt', payload);
      alert(`Score: ${resp.data.score} / ${resp.data.total}`);
      navigate('/reports');
    } catch (err) {
      console.error('Failed to submit quiz', err);
      alert(err.response?.data?.message || err.message || 'Failed to submit quiz');
    }
  };

  if (questions === null) return <div style={{ padding: 20 }}>Loading questions…</div>;
  if (!questions || questions.length === 0) return (
    <div style={{ padding: 20 }}>
      <h2>Quiz</h2>
      <div>No questions available for this skill.</div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Quiz</h2>
      {questions.map(q => {
        const opts = normalizeOptions(q.options);
        return (
          <div key={q.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{q.text}</p>
            {opts.length === 0 ? (
              <div style={{ color: '#777', marginTop: 8 }}>No options available.</div>
            ) : (
              opts.map(opt => (
                <div key={opt.id} style={{ marginTop: 8 }}>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      onChange={() => handleSelect(q.id, opt.id)}
                      checked={String(answers[q.id]) === String(opt.id)}
                    />{' '}
                    {opt.text}
                  </label>
                </div>
              ))
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSubmit} style={{ padding: '8px 14px', borderRadius: 6 }}>
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
