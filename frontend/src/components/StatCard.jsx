export function StatCard({ icon, label, value, subtitle, color }) {
  return (
    <article className="stat-card" style={{ '--card-accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </article>
  );
}
