// frontend/src/components/ui/LoadingSpinner.jsx
import React from 'react';
export default function LoadingSpinner() {
  return <div style={{ padding: 16, textAlign: 'center' }}><div style={{ width: 28, height: 28, border: '4px solid #eef2ff', borderLeftColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;
}
