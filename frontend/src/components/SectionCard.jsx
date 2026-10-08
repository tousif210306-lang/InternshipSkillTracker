export function SectionCard({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`dashboard-panel ${className}`.trim()}>
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Overview</p>
          <h3>{title}</h3>
        </div>
        {subtitle && <span className="panel-subtitle">{subtitle}</span>}
        {action}
      </div>
      {children}
    </section>
  );
}
