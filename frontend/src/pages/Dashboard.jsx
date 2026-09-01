import CallQueue from '../components/CallQueue.jsx';
import TranscriptView from '../components/TranscriptView.jsx';

export default function Dashboard({ calls, selectedId, onSelect, onTakeover, onSendMessage, onResolve }) {
  const selectedCall = calls.find((c) => c._id === selectedId) || null;

  return (
    <div className={`workspace${selectedId ? ' has-selection' : ''}`}>
      <CallQueue calls={calls} selectedId={selectedId} onSelect={onSelect} />
      <TranscriptView
        call={selectedCall}
        onTakeover={onTakeover}
        onSendMessage={onSendMessage}
        onResolve={onResolve}
        onBack={() => onSelect(null)}
      />
    </div>
  );
}