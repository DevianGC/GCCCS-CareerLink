import Link from 'next/link';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  type = 'button',
  onClick,
  fullWidth,
  disabled,
  className,
  ...props
}) {
  const buttonClasses = `
    ${styles.button} 
    ${styles[variant]} 
    ${styles[size]} 
    ${fullWidth ? styles.fullWidth : ''} 
    ${disabled ? styles.disabled : ''} 
    ${className || ''}
  `.trim();

  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}