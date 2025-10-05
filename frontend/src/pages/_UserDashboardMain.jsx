// frontend/src/pages/_UserDashboardMain.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSecure } from '../utils/fetchSecureData';
import PastPerformance from './_PastPerformance';
import QuizComponent from './_QuizComponent';

export default function UserDashboardMain({ user }) {
  const [skillsRaw, setSkillsRaw] = useState([]); // can be array OR object
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [error, setError] = useState(null);

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const resp = await getSecure('skills');
      const data = resp.data || resp;

      // normalize to array (handles pagination or raw array)
      const normalized =
        Array.isArray(data) ? data :
        data?.rows ? data.rows :
        [];

      setSkillsRaw(normalized);
    } catch (err) {
      console.error('Failed to load skills:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load skills');
      setSkillsRaw([]); // fallback empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  // render QuizComponent if user selected a skill
  if (selectedSkill) {
    return (
      <QuizComponent
        skill={selectedSkill}
        user={user}
        onQuizComplete={() => {
          setSelectedSkill(null);
          loadSkills();
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Welcome, {user?.name || 'User'}</h2>
      </div>

      <Card title="Start a New Quiz">
        {loading && <LoadingSpinner />}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {skillsRaw.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded">
                No skills found. Please add skills from the admin panel.
              </div>
            ) : (
              skillsRaw.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 border rounded-lg content-card hover:shadow-md transition"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <h3 style={{ margin: '0 0 8px' }}>{skill.name}</h3>
                  <p style={{ color: '#475569', margin: 0, minHeight: 36 }}>
                    {skill.description || 'No description available'}
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      Take Quiz
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Show user's past performance section */}
      <PastPerformance user={user} />
    </div>
  );
}
