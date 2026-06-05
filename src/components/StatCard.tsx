interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({
  label,
  value,
  hint,
}: StatCardProps): React.ReactElement {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </article>
  );
}
