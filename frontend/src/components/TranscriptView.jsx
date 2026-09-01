import { useEffect, useRef, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TranscriptView({ call, onTakeover, onSendMessage, onResolve }) {
  const [draft, setDraft] = useState('');
  const [outcomeType, setOutcomeType] = useState('enquiry');
  const [outcomeNote, setOutcomeNote] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [call?.messages?.length]);

  useEffect(() => {
    setDraft('');
  }, [call?._id]);

  if (!call) {
    return (
      <div className="pane-detail">
        <div className="empty-state">
          <span className="glyph">⌁</span>
          <span>Select a call to view its live transcript.</span>
        </div>
      </div>
    );
  }

  const isResolved = call.status === 'resolved';
  const isHuman = call.status === 'human_active';

  function handleSend() {
    const text = draft.trim();
    if (!text || isResolved) return;
    onSendMessage(call._id, text);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleResolve() {
    onResolve(call._id, outcomeType, { note: outcomeNote || undefined });
    setOutcomeNote('');
  }

  return (
    <div className="pane-detail">
      <div className="detail-header">
        <div>
          <p className="detail-title">{call.callerName}</p>
          <p className="detail-topic">{call.topic}</p>
        </div>
        <div className="detail-actions">
          <StatusBadge status={call.status} />
          {!isHuman && !isResolved && (
            <button className="btn" onClick={() => onTakeover(call._id)}>
              Take over
            </button>
          )}
        </div>
      </div>

      <div className="transcript">
        {call.messages.map((m) => (
          <div className={`msg-row ${m.sender}`} key={m._id || `${m.sender}-${m.timestamp}`}>
            <span className="msg-sender">{m.sender}</span>
            <div className="msg-bubble">{m.text}</div>
            <span className="msg-time">{formatTime(m.timestamp)}</span>
          </div>
        ))}
        {call.status === 'ai_handling' && (
          <div className="typing-indicator" aria-label="AI is responding">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <p className="composer-hint">
          {isResolved
            ? 'This call is resolved — reopen isn\u2019t supported in v1.'
            : 'Sending a message here takes the call over as the human operator.'}
        </p>
        <div className="composer-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply to the caller…"
            disabled={isResolved}
          />
          <button className="btn primary" onClick={handleSend} disabled={isResolved || !draft.trim()}>
            Send
          </button>
        </div>

        <div className="resolve-bar">
          <label htmlFor="outcome-type">Outcome</label>
          <select
            id="outcome-type"
            className="select"
            value={outcomeType}
            onChange={(e) => setOutcomeType(e.target.value)}
            disabled={isResolved}
          >
            <option value="booking">Booking</option>
            <option value="enquiry">Enquiry</option>
            <option value="lead">Lead</option>
          </select>
          <input
            className="select"
            style={{ flex: 1 }}
            placeholder="Optional note for the outcome record…"
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            disabled={isResolved}
          />
          <button className="btn" onClick={handleResolve} disabled={isResolved}>
            Mark resolved
          </button>
        </div>
      </div>
    </div>
  );
}