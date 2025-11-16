'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './login.module.css';
import FormInput from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../../utils/config';

export default function EmployerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const validationConfig = getValidationConfig();

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    const navConfig = getNavConfig();
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setErrors({ 
          general: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
        });
        await firebaseAuth.signOut();
        return;
      }
      
      const idToken = await userCredential.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      // Check if user is actually an employer
      try {
        const meRes = await fetch('/api/me', { cache: 'no-store' });
        if (meRes.ok) {
          const me = await meRes.json();
          const role = me?.user?.role || me?.profile?.role;
          if (role === 'employer') {
            window.location.href = '/dashboard/employer';
          } else {
            setErrors({ general: 'Access denied. This login is for employers only.' });
            return;
          }
        } else {
          setErrors({ general: 'Unable to verify account. Please try again.' });
          return;
        }
      } catch {
        setErrors({ general: 'Unable to verify account. Please try again.' });
        return;
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>Employer Login</h1>
            <p className={styles.loginSubtitle}>
              Sign in to your employer account to manage job postings and applications
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

            <FormInput
              label="Company Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              placeholder="company@example.com"
            />

            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
            />

            <div className={styles.forgotPassword}>
              <Link href="/employer/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Login to Employer Portal
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <p>
              Don't have an employer account?{' '}
              <Link href="/employer/register" className={styles.registerLink}>
                Register your company
              </Link>
            </p>
            <Link href="/auth/login" className={styles.backLink}>
              ← Back to Role Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
