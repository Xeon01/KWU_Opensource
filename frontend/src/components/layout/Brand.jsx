import { Link } from 'react-router-dom';
import { Navigation2 } from 'lucide-react';
import { PATHS } from '../../routes/paths.js';

export default function Brand({ light = false }) {
  return (
    <Link to={PATHS.dashboard} className={`brand${light ? ' brand--light' : ''}`} aria-label="N-Trip 홈">
      <span className="brand__mark"><Navigation2 size={20} strokeWidth={2.4} fill="currentColor" aria-hidden="true" /></span>
      <span className="brand__name">N<span className="brand__dash">·</span>Trip</span>
    </Link>
  );
}
