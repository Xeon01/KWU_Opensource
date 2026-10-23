export default function Badge({ children, tone = 'mint', className = '' }) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>;
}
