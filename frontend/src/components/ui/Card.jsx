export default function Card({ children, className = '', as: Element = 'div' }) {
  return <Element className={`card ${className}`.trim()}>{children}</Element>;
}
