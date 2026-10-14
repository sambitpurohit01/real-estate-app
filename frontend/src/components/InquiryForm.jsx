import { useState } from 'react';
import { inquiryService } from '../api/propertyService';
import { useAuth } from '../context/AuthContext';

export default function InquiryForm({ propertyId }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    senderName: user?.fullName || '',
    senderEmail: user?.email || '',
    senderPhone: user?.phone || '',
    message: "Hi, I'm interested in this property. Is it still available?",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await inquiryService.create({ propertyId: Number(propertyId), ...form });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send your message. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="owner-card" style={{ marginTop: 20, position: 'static' }}>
        <h4 style={{ marginBottom: 8 }}>Message sent \u2713</h4>
        <p className="text-muted" style={{ fontSize: '0.88rem' }}>
          The owner has been notified and can reach you at {form.senderEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="owner-card" style={{ marginTop: 20, position: 'static' }}>
      <span className="owner-role">Contact about this listing</span>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="senderName">Your Name</label>
          <input id="senderName" required value={form.senderName} onChange={update('senderName')} />
        </div>
        <div className="field">
          <label htmlFor="senderEmail">Your Email</label>
          <input id="senderEmail" type="email" required value={form.senderEmail} onChange={update('senderEmail')} />
        </div>
        <div className="field">
          <label htmlFor="senderPhone">Phone (optional)</label>
          <input id="senderPhone" value={form.senderPhone} onChange={update('senderPhone')} />
        </div>
        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea id="message" required value={form.message} onChange={update('message')} />
        </div>
        <button type="submit" className="btn btn-brass btn-block" disabled={sending}>
          {sending ? 'Sending\u2026' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
