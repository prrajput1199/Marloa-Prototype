import { useEffect, useState, useCallback } from 'react';
import socket from './api/socket.js';
import api from './api/api.js';
import Dashboard from './pages/Dashboard.jsx';
import OutcomesTable from './components/OutcomesTable.jsx';

export default function App() {
  const [calls, setCalls] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('queue'); // 'queue' | 'outcomes'
  const [connected, setConnected] = useState(socket.connected);
  const [scenarioChoice, setScenarioChoice] = useState('');
  const [starting, setStarting] = useState(false);

  // ---- Initial load ----
  useEffect(() => {
    api.listCalls().then(setCalls).catch((err) => console.error('Failed to load calls', err));
    api.listOutcomes().then(setOutcomes).catch((err) => console.error('Failed to load outcomes', err));
    api
      .listScenarios()
      .then((list) => {
        setScenarios(list);
        if (list.length) setScenarioChoice(list[0].id);
      })
      .catch((err) => console.error('Failed to load scenarios', err));
  }, []);

  // ---- Socket wiring ----
  useEffect(() => {
    function handleConnect() {
      setConnected(true);
    }
    function handleDisconnect() {
      setConnected(false);
    }
    function handleNewCall(call) {
      setCalls((prev) => (prev.some((c) => c._id === call._id) ? prev : [call, ...prev]));
    }
    function handleMessage({ callId, message }) {
      setCalls((prev) =>
        prev.map((c) =>
          c._id === callId ? { ...c, messages: [...c.messages, message], updatedAt: new Date().toISOString() } : c
        )
      );
    }
    function handleStatus({ callId, status }) {
      setCalls((prev) => prev.map((c) => (c._id === callId ? { ...c, status } : c)));
    }
    function handleOutcome(outcome) {
      setOutcomes((prev) => [outcome, ...prev]);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('call:new', handleNewCall);
    socket.on('call:message', handleMessage);
    socket.on('call:status', handleStatus);
    socket.on('outcome:new', handleOutcome);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('call:new', handleNewCall);
      socket.off('call:message', handleMessage);
      socket.off('call:status', handleStatus);
      socket.off('outcome:new', handleOutcome);
    };
  }, []);

  const handleTakeover = useCallback((callId) => {
    socket.emit('operator:takeover', { callId });
  }, []);

  const handleSendMessage = useCallback((callId, text) => {
    socket.emit('operator:message', { callId, text });
  }, []);

  const handleResolve = useCallback((callId, type, details) => {
    socket.emit('operator:resolve', { callId, type, details });
  }, []);

  async function handleStartCall() {
    setStarting(true);
    try {
      const call = await api.runScenario(scenarioChoice);
      setSelectedId(call._id);
      setTab('queue');
    } catch (err) {
      console.error('Failed to start simulated call', err);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            Marloa <span>Live</span>
          </span>
          <span className="brand-sub">Ops console — prototype</span>
        </div>

        <div className="tabs">
          <button className={`tab-btn${tab === 'queue' ? ' active' : ''}`} onClick={() => setTab('queue')}>
            Live queue
          </button>
          <button className={`tab-btn${tab === 'outcomes' ? ' active' : ''}`} onClick={() => setTab('outcomes')}>
            Outcomes
          </button>
        </div>

        <div className="topbar-actions">
          <select className="select" value={scenarioChoice} onChange={(e) => setScenarioChoice(e.target.value)}>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.callerName} — {s.topic}
              </option>
            ))}
          </select>
          <button className="btn primary" onClick={handleStartCall} disabled={starting || !scenarioChoice}>
            {starting ? 'Starting…' : 'Start simulated call'}
          </button>
          <span className={`conn-dot${connected ? ' online' : ''}`} />
          <span className="conn-label">{connected ? 'live' : 'offline'}</span>
        </div>
      </header>

      {tab === 'queue' ? (
        <Dashboard
          calls={calls}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onTakeover={handleTakeover}
          onSendMessage={handleSendMessage}
          onResolve={handleResolve}
        />
      ) : (
        <OutcomesTable outcomes={outcomes} />
      )}
    </div>
  );
}