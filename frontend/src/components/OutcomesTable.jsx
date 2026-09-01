function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function summarizeDetails(details) {
  if (!details || Object.keys(details).length === 0) return '—';
  return Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('  ·  ');
}

export default function OutcomesTable({ outcomes }) {
  return (
    <div className="pane-outcomes">
      <div className="outcomes-header">
        <h2>Structured outcomes</h2>
        <span className="pane-count">{outcomes.length} logged</span>
      </div>

      {outcomes.length === 0 ? (
        <div className="empty-state">
          <span className="glyph">▤</span>
          <span>Nothing logged yet. Resolve a call from the Live Queue to see it here.</span>
        </div>
      ) : (
        <table className="outcomes-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Caller</th>
              <th>Topic</th>
              <th>Details</th>
              <th>Logged</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr key={o._id}>
                <td>
                  <span className={`outcome-type-pill outcome-type-${o.type}`}>{o.type}</span>
                </td>
                <td>{o.callId?.callerName || '—'}</td>
                <td>{o.callId?.topic || '—'}</td>
                <td className="outcome-details">{summarizeDetails(o.details)}</td>
                <td className="outcome-details">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}