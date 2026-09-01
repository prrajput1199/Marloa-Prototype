import CallCard from './CallCard.jsx';

const STATUS_ORDER = { needs_human: 0, human_active: 1, ai_handling: 2, resolved: 3 };

export default function CallQueue({ calls, selectedId, onSelect }) {
  const sorted = [...calls].sort((a, b) => {
    const byStatus = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (byStatus !== 0) return byStatus;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  return (
    <div className="pane-queue">
      <div className="pane-header">
        <p className="pane-title">Live queue</p>
        <p className="pane-count">{calls.length} active session{calls.length === 1 ? '' : 's'}</p>
      </div>
      <div className="queue-list">
        {sorted.length === 0 && (
          <div className="empty-state">
            <span className="glyph">···</span>
            <span>No calls yet. Start a simulated call to populate the queue.</span>
          </div>
        )}
        {sorted.map((call) => (
          <CallCard
            key={call._id}
            call={call}
            selected={call._id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
