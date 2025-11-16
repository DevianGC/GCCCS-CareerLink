import React from 'react';
import './toast.css';

export default function Toast({ message, type = 'info' }) {
  if (!message) return null;
  return (
    <div className={`gc-toast gc-toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
