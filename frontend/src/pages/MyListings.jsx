import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../api/propertyService';
import PropertyCard from '../components/PropertyCard';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    propertyService
      .myListings()
      .then(setListings)
      .catch(() => setError('Could not load your listings.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Listings</h1>
          <Link to="/properties/new" className="btn btn-brass">+ New Listing</Link>
        </div>

        {error && <div className="alert-banner">{error}</div>}

        {loading ? (
          <div className="spinner-row">Loading&hellip;</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h3>You haven't listed anything yet</h3>
            <p>Publish your first property to see it here.</p>
          </div>
        ) : (
          <div className="property-grid">
            {listings.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
