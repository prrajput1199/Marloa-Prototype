import StatusBadge from './StatusBadge.jsx';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CallCard({ call, selected, onSelect }) {
  const lastMessage = call.messages?.[call.messages.length - 1];

  return (
    <div
      className={`call-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(call._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? onSelect(call._id) : null)}
    >
      <div className="call-card-top">
        <span className="call-caller">{call.callerName}</span>
        <StatusBadge status={call.status} />
      </div>
      <div className="call-topic">
        {lastMessage ? lastMessage.text : call.topic}
      </div>
      <div className="call-card-foot">
        <span className="call-time">{call.messages?.length || 0} msgs</span>
        <span className="call-time">{formatTime(call.updatedAt || call.createdAt)}</span>
      </div>
    </div>
  );
}
