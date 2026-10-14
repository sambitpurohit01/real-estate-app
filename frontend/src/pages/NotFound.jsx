import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="page">
      <div className="container empty-state">
        <span className="eyebrow">404</span>
        <h1 style={{ marginTop: 10, marginBottom: 16 }}>This lot is empty.</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Back to listings</Link>
      </div>
    </main>
  );
}
