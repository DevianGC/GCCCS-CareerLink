'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './forgot-password.module.css';
import FormInput from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getValidationConfig } from '../../../utils/config';

export default function EmployerForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const validationConfig = getValidationConfig();

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setIsSubmitted(true);
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.forgotPasswordPage}>
        <div className={styles.forgotPasswordContainer}>
          <div className={styles.forgotPasswordCard}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#dcfce7"/>
                <path d="M20 32L28 40L44 24" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.forgotPasswordHeader}>
              <h1 className={styles.forgotPasswordTitle}>Check Your Email</h1>
              <p className={styles.forgotPasswordSubtitle}>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className={styles.instructionText}>
                Click the link in the email to reset your password. If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className={styles.actionButtons}>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => window.location.href = '/employer/login'}
              >
                Back to Login
              </Button>
              
              <button 
                className={styles.resendButton}
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Try different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.forgotPasswordContainer}>
        <div className={styles.forgotPasswordCard}>
          <div className={styles.forgotPasswordHeader}>
            <h1 className={styles.forgotPasswordTitle}>Reset Your Password</h1>
            <p className={styles.forgotPasswordSubtitle}>
              Enter your employer email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
            <FormInput
              label="Company Email Address"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              error={errors.email}
              placeholder="company@example.com"
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            
            {errors.general && <div className={styles.errorText}>{errors.general}</div>}
          </form>

          <div className={styles.forgotPasswordFooter}>
            <p>
              Remember your password?{' '}
              <Link href="/employer/login" className={styles.loginLink}>
                Back to login
              </Link>
            </p>
            <div className={styles.otherLinks}>
              <p className={styles.otherLink}>
                <Link href="/employer/register">
                  Create employer account
                </Link>
              </p>
              <p className={styles.otherLink}>
                <Link href="/forgot-password">
                  Student/Alumni password reset
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
