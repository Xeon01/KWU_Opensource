import { Compass } from 'lucide-react';
import Button from './Button.jsx';

export default function EmptyState({ title, description, action, to, icon: Icon = Compass }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon size={27} strokeWidth={1.7} aria-hidden="true" /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && to && <Button to={to} variant="secondary">{action}</Button>}
    </div>
  );
}
