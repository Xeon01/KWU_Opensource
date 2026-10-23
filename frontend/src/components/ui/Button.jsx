import { Link } from 'react-router-dom';

/** A shared button. `to` creates a client-side route without a full reload. */
export default function Button({ children, variant = 'primary', size = 'md', to, className = '', icon: Icon, ...props }) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  const contents = <>{Icon && <Icon size={17} aria-hidden="true" />}{children}</>;
  if (to && !props.disabled) return <Link to={to} className={classes}>{contents}</Link>;
  return <button type="button" className={classes} {...props}>{contents}</button>;
}
