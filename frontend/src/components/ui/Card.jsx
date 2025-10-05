// frontend/src/components/ui/Card.jsx
import React from 'react';
export default function Card({ title, children, className='' }) {
  return (
    <div className={`content-card ${className}`}>
      {title && <h3 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h3>}
      {children}
    </div>
  );
}
