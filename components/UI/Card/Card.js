import styles from './Card.module.css';

export default function Card({
  children,
  className,
  variant = 'default',
  onClick,
  ...props
}) {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={`${styles.cardHeader} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={`${styles.cardBody} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={`${styles.cardFooter} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}