export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
