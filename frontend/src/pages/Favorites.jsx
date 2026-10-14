import { useEffect, useState } from 'react';
import { favoriteService } from '../api/propertyService';
import PropertyCard from '../components/PropertyCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    favoriteService
      .list()
      .then(setFavorites)
      .catch(() => setError('Could not load your saved listings.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleFavorite = async (propertyId) => {
    await favoriteService.remove(propertyId);
    setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1>Saved Listings</h1>
        </div>

        {error && <div className="alert-banner">{error}</div>}

        {loading ? (
          <div className="spinner-row">Loading&hellip;</div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any listing to save it here for later.</p>
          </div>
        ) : (
          <div className="property-grid">
            {favorites.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorite onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
