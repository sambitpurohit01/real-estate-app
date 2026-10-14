import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inquiryService } from '../api/propertyService';

export default function Messages() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    inquiryService
      .received()
      .then(setInquiries)
      .catch(() => setError('Could not load your messages.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    try {
      await inquiryService.markRead(id);
    } catch {
      // non-critical; ignore
    }
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1>Messages</h1>
        </div>

        {error && <div className="alert-banner">{error}</div>}

        {loading ? (
          <div className="spinner-row">Loading&hellip;</div>
        ) : inquiries.length === 0 ? (
          <div className="empty-state">
            <h3>No messages yet</h3>
            <p>When someone contacts you about one of your listings, it'll show up here.</p>
          </div>
        ) : (
          <div className="inquiry-list">
            {inquiries.map((i) => (
              <div className={`inquiry-item ${i.read ? '' : 'inquiry-unread'}`} key={i.id} onClick={() => !i.read && markRead(i.id)}>
                <div className="inquiry-item-header">
                  <div>
                    <div className="inquiry-property">
                      About: <Link to={`/properties/${i.propertyId}`}>{i.propertyTitle}</Link>
                    </div>
                    <div className="inquiry-sender">{i.senderName} &middot; {i.senderEmail}{i.senderPhone ? ` \u00b7 ${i.senderPhone}` : ''}</div>
                  </div>
                  {!i.read && <span className="inquiry-badge">New</span>}
                </div>
                <p style={{ marginTop: 10 }}>{i.message}</p>
                <span className="text-muted mono" style={{ fontSize: '0.72rem' }}>
                  {new Date(i.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
