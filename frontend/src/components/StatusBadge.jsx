const LABELS = {
  ai_handling: 'AI handling',
  needs_human: 'Needs human',
  human_active: 'Human active',
  resolved: 'Resolved',
};

export default function StatusBadge({ status }) {
  const label = LABELS[status] || status;
  return (
    <span className={`status-badge status-${status}`}>
      <span className="pulse-dot" />
      {label}
    </span>
  );
}
