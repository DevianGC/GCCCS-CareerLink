'use client';
import { useState } from 'react';
import styles from './FormInput.module.css';

export default function FormInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  className,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className={`${styles.formGroup} ${error ? styles.hasError : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${styles.input} ${focused ? styles.focused : ''} ${isPasswordField ? styles.passwordInput : ''}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required,
  error,
  className,
  ...props
}) {
  return (
    <div className={`${styles.formGroup} ${error ? styles.hasError : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={styles.select}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export function FormTextarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 4,
  className,
  ...props
}) {
  return (
    <div className={`${styles.formGroup} ${error ? styles.hasError : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={styles.textarea}
          rows={rows}
          {...props}
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}