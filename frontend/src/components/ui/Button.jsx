// frontend/src/components/ui/Button.jsx
import React from 'react';
export default function Button({ children, onClick, variant='primary', disabled=false, type='button', className='' }) {
  let base = 'px-4 py-2 rounded-md font-medium';
  if (variant === 'primary') base += ' bg-indigo-600 text-white';
  if (variant === 'secondary') base += ' bg-gray-200 text-gray-800';
  if (disabled) base += ' opacity-60 cursor-not-allowed';
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`}>{children}</button>;
}
