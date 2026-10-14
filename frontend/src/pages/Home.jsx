import { useCallback, useEffect, useState } from 'react';
import { propertyService, favoriteService } from '../api/propertyService';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import PropertiesMap from '../components/PropertiesMap';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 12;

export default function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [criteria, setCriteria] = useState({});
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [view, setView] = useState('grid');

  const loadProperties = useCallback((params, pageNum, append) => {
    (append ? setLoadingMore : setLoading)(true);
    setError('');
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    propertyService
      .search({ ...cleanParams, page: pageNum, size: PAGE_SIZE })
      .then((data) => {
        setProperties((prev) => (append ? [...prev, ...(data.content || [])] : data.content || []));
        setTotalElements(data.totalElements ?? (data.content || []).length);
        setTotalPages(data.totalPages ?? 0);
        setPage(pageNum);
      })
      .catch(() => setError('Could not load listings. Is the backend running?'))
      .finally(() => (append ? setLoadingMore : setLoading)(false));
  }, []);

  useEffect(() => {
    loadProperties(criteria, 0, false);
  }, [criteria, loadProperties]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    favoriteService
      .list()
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f.id))))
      .catch(() => {});
  }, [user]);

  const toggleFavorite = async (propertyId) => {
    if (!user) return;
    const isFav = favoriteIds.has(propertyId);
    const next = new Set(favoriteIds);
    if (isFav) {
      next.delete(propertyId);
      setFavoriteIds(next);
      await favoriteService.remove(propertyId).catch(() => {
        next.add(propertyId);
        setFavoriteIds(new Set(next));
      });
    } else {
      next.add(propertyId);
      setFavoriteIds(next);
      await favoriteService.add(propertyId).catch(() => {
        next.delete(propertyId);
        setFavoriteIds(new Set(next));
      });
    }
  };

  const loadMore = () => loadProperties(criteria, page + 1, true);
  const hasMore = page + 1 < totalPages;

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">Find your next address</span>
          <h1>Every listing, recorded like it matters.</h1>
          <p className="hero-sub">
            Browse homes, apartments, and land with the kind of detail you'd expect
            from a deed &mdash; exact specs, real photos, direct contact with the owner.
          </p>

          <SearchFilters initial={criteria} onSearch={setCriteria} />
        </div>
      </section>

      <main className="page">
        <div className="container">
          <div className="results-bar">
            <div className="results-count">
              {loading ? 'Searching\u2026' : `${totalElements} listing${totalElements === 1 ? '' : 's'} found`}
            </div>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grid</button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>Map</button>
            </div>
          </div>

          {error && <div className="alert-banner">{error}</div>}

          {!loading && !error && properties.length === 0 && (
            <div className="empty-state">
              <h3>No listings match your search</h3>
              <p>Try widening your filters, or clear them to see everything.</p>
            </div>
          )}

          {loading ? (
            <div className="spinner-row">Loading listings&hellip;</div>
          ) : view === 'map' ? (
            <PropertiesMap properties={properties} />
          ) : (
            <>
              <div className="property-grid">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isFavorite={favoriteIds.has(p.id)}
                    onToggleFavorite={user ? toggleFavorite : undefined}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-row">
                  <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading\u2026' : `Load More (${totalElements - properties.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
