// frontend/src/pages/_QuizComponent.jsx
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSecure, postSecure } from '../utils/fetchSecureData';

function safeParseOptions(raw) {
  // Ensure the return value is always an array of { id: string, text: string }
  if (!raw && raw !== 0) return []; // null/undefined -> empty array

  // If it's already an array — copy it
  if (Array.isArray(raw)) {
    return raw.map((o, i) => {
      if (typeof o === 'string' || typeof o === 'number') {
        return { id: String(i), text: String(o) };
      }
      // object-like: try to extract id/text
      const id = o?.id ?? o?.key ?? i;
      const text = o?.text ?? o?.label ?? o?.value ?? (typeof o === 'object' ? JSON.stringify(o) : String(o));
      return { id: String(id), text: String(text) };
    });
  }

  // If it's a JSON string, try to parse
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // try parse as JSON array/object
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return safeParseOptions(parsed);
      // if parsed is object with numeric keys -> convert values to array
      if (parsed && typeof parsed === 'object') {
        // if object looks like { "0": {...}, "1": {...} } convert to array
        const arr = Object.keys(parsed).map(k => parsed[k]);
        return safeParseOptions(arr);
      }
    } catch (e) {
      // not JSON — maybe it's a delimiter-separated string e.g. "a|b|c" or "opt1,opt2"
      const sep = trimmed.includes('|') ? '|' : (trimmed.includes(',') ? ',' : null);
      if (sep) {
        const parts = trimmed.split(sep).map(s => s.trim()).filter(Boolean);
        return parts.map((p, i) => ({ id: String(i), text: p }));
      }
      // fallback: single string option
      return [{ id: '0', text: trimmed }];
    }
  }

  // If it's an object (non-array), convert to array of its values or key/value pair
  if (typeof raw === 'object') {
    // If object looks like { id:..., text:... } treat as single option
    if (raw.id !== undefined || raw.text !== undefined || raw.value !== undefined) {
      const id = raw.id ?? raw.value ?? 0;
      const text = raw.text ?? raw.label ?? raw.value ?? JSON.stringify(raw);
      return [{ id: String(id), text: String(text) }];
    }
    // Otherwise convert values to array
    const arr = Object.keys(raw).map(k => raw[k]);
    return safeParseOptions(arr);
  }

  // any other (number, boolean) -> single item
  return [{ id: '0', text: String(raw) }];
}

export default function QuizComponent({ skill, user, onQuizComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuestions([]);
        setCurrentIndex(0);
        setSelected({});
        setSubmitted(false);
        setScore(null);

        const resp = await getSecure(`quiz/skill/${skill.id}?limit=20`);
        const data = resp?.data ?? resp;

        // Many endpoints return array directly; others might return { rows: [...] }
        const rows = Array.isArray(data) ? data : (data?.rows ? data.rows : []);

        const normalized = (rows || []).map((q) => {
          // ensure question fields exist
          const qid = q.id ?? q.questionId ?? q.question_id ?? null;
          const text = q.text ?? q.question ?? q.title ?? '';
          const rawOptions = q.options ?? q.option ?? q.opts ?? [];
          const opts = safeParseOptions(rawOptions);

          // ensure each option has id/text as strings
          const cleanOpts = opts.map((o, idx) => ({
            id: String(o.id ?? idx),
            text: String(o.text ?? o.label ?? JSON.stringify(o)),
          }));

          return { id: qid, text: String(text), options: cleanOpts };
        });

        if (!cancelled) setQuestions(normalized);
      } catch (err) {
        console.error('Failed to load quiz questions', err);
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load questions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [skill?.id]);

  const selectAnswer = (qid, optId) => {
    setSelected((p) => ({ ...p, [qid]: String(optId) }));
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const answers = Object.entries(selected).map(([questionId, selected_option]) => ({
        questionId: Number(questionId),
        selected_option: String(selected_option),
      }));
      const resp = await postSecure('quiz/attempt', { skillId: skill.id, answers });
      const data = resp?.data ?? resp;
      // backend returns { score, total } or something similar
      const pct = data?.total ? Math.round((data.score / data.total) * 100) : (data.score ?? null);
      setScore(pct);
      setSubmitted(true);
    } catch (err) {
      console.error('submit quiz error', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>;
  if (!questions || questions.length === 0) {
    return (
      <Card title={`Quiz: ${skill?.name ?? 'Skill'}`}>
        <div className="p-6">No questions available.</div>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card title="Quiz Results">
        <div style={{ textAlign: 'center', padding: 18 }}>
          <h3 style={{ fontSize: 28 }}>{score !== null ? `${score}%` : '—'}</h3>
          <p>Your score for {skill?.name}</p>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => onQuizComplete()}>Back</Button>
          </div>
        </div>
      </Card>
    );
  }

  const q = questions[currentIndex] ?? { id: null, text: '', options: [] };

  return (
    <Card title={`Quiz: ${skill?.name ?? ''} (${currentIndex + 1}/${questions.length})`} className="max-w-3xl">
      <div>
        <p style={{ fontWeight: 600 }}>{q.text}</p>
        <div style={{ marginTop: 12 }}>
          {Array.isArray(q.options) && q.options.map((opt, idx) => (
            <div
              key={opt.id ?? idx}
              className={`p-3 rounded mb-2 ${selected[q.id] === String(opt.id) ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50'}`}
              onClick={() => selectAnswer(q.id, opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectAnswer(q.id, opt.id); }}
              style={{ cursor: 'pointer' }}
            >
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
