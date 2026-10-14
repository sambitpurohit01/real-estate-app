import { useEffect, useRef, useState } from 'react';
import { agentService } from '../api/agentService';
import { useAuth } from '../context/AuthContext';
import PropertyCard from './PropertyCard';

const WELCOME =
  "Hi, I'm the Keystone Assistant. Tell me what you're looking for — e.g. \"2BHK apartments for rent in Pune under 35k\" — or ask me about a listing you've already found.";

const ACTION_LABEL = {
  inquiry_sent: 'Message sent to the owner',
  favorite_added: 'Saved to your favorites',
};

export default function AgentChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME, properties: [], actions: [] }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setSending(true);

    // History sent to the backend excludes our locally-attached properties/actions —
    // the model only needs role + content, same as it sent them.
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const data = await agentService.chat(text, history);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, properties: data.properties || [], actions: data.actions || [] },
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't reach the assistant. Is the backend running with an API key configured?");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="agent-widget">
      {open && (
        <div className="agent-panel">
          <div className="agent-header">
            <div>
              <div className="agent-title">Keystone Assistant</div>
              <div className="agent-subtitle">{user ? `Signed in as ${user.fullName}` : 'Browsing as a guest'}</div>
            </div>
            <button className="agent-close" onClick={() => setOpen(false)} aria-label="Close assistant">&times;</button>
          </div>

          <div className="agent-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`agent-msg agent-msg-${m.role}`}>
                <div className="agent-bubble">{m.content}</div>

                {m.actions && m.actions.length > 0 && (
                  <div className="agent-action-chips">
                    {m.actions.map((a, j) => (
                      <span className="agent-action-chip" key={j}>&#10003; {ACTION_LABEL[a.type] || a.type}</span>
                    ))}
                  </div>
                )}

                {m.properties && m.properties.length > 0 && (
                  <div className="agent-property-results">
                    {m.properties.map((p) => (
                      <div className="agent-property-card" key={p.id}>
                        <PropertyCard property={p} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="agent-msg agent-msg-assistant">
                <div className="agent-bubble agent-bubble-typing">Thinking&hellip;</div>
              </div>
            )}
          </div>

          {error && <div className="agent-error">{error}</div>}

          <form className="agent-input-row" onSubmit={send}>
            <input
              type="text"
              placeholder="Ask about a listing, or describe what you want…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" className="btn btn-brass" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button className="agent-fab" onClick={() => setOpen((v) => !v)} aria-label="Open Keystone Assistant">
        {open ? '\u2715' : '\u2726 Ask Keystone'}
      </button>
    </div>
  );
}
