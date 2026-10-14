import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { propertyService, favoriteService } from '../api/propertyService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, propertyTypeLabel, resolveImageUrl } from '../utils/format';
import InquiryForm from '../components/InquiryForm';
import ReviewSection from '../components/ReviewSection';
import PropertyMap from '../components/PropertyMap';
import { StarDisplay } from '../components/StarRating';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertyService
      .getById(id)
      .then((data) => {
        setProperty(data);
        setActiveImage(0);
      })
      .catch(() => setError('This listing could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    favoriteService
      .list()
      .then((favs) => setIsFavorite(favs.some((f) => String(f.id) === String(id))))
      .catch(() => {});
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) return navigate('/login');
    if (isFavorite) {
      await favoriteService.remove(id);
      setIsFavorite(false);
    } else {
      await favoriteService.add(id);
      setIsFavorite(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await propertyService.remove(id);
      navigate('/my-listings');
    } catch {
      setError('Could not delete this listing.');
      setDeleting(false);
    }
  };

  if (loading) return <main className="page"><div className="container spinner-row">Loading listing&hellip;</div></main>;
  if (error || !property) {
    return (
      <main className="page">
        <div className="container empty-state">
          <h3>{error || 'Listing not found'}</h3>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>Back to listings</Link>
        </div>
      </main>
    );
  }

  const rawImages = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
  ];
  const images = rawImages.map(resolveImageUrl);
  const isOwner = user && String(user.id) === String(property.ownerId);

  return (
    <main className="page">
      <div className="container">
        <span className="eyebrow">{propertyTypeLabel(property.propertyType)} &middot; {property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}</span>

        <div className="detail-grid">
          <div>
            <div className="detail-gallery">
              <div className="main-photo">
                <img src={images[activeImage]} alt={property.title} />
              </div>
              {images.length > 1 && (
                <div className="thumb-row">
                  {images.map((img, i) => (
                    <img
                      key={img + i}
                      src={img}
                      alt=""
                      className={i === activeImage ? 'active' : ''}
                      onClick={() => setActiveImage(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="detail-title-row">
              <h1>{property.title}</h1>
              <div className="detail-price">{formatPrice(property.price, property.listingType)}</div>
            </div>
            <p className="text-muted" style={{ marginTop: 6 }}>
              {property.addressLine}, {property.city}, {property.state} {property.zipCode}
            </p>

            {property.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <StarDisplay rating={property.averageRating} size={16} />
                <span className="mono text-muted" style={{ fontSize: '0.82rem' }}>
                  {property.averageRating.toFixed(1)} ({property.reviewCount} review{property.reviewCount === 1 ? '' : 's'})
                </span>
              </div>
            )}

            <div className="spec-table">
              <div className="spec-cell">
                <span className="spec-label">Bedrooms</span>
                <span className="spec-value">{property.bedrooms ?? '\u2014'}</span>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Bathrooms</span>
                <span className="spec-value">{property.bathrooms ?? '\u2014'}</span>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Area</span>
                <span className="spec-value">{property.areaSqft ? `${property.areaSqft} sqft` : '\u2014'}</span>
              </div>
              <div className="spec-cell">
                <span className="spec-label">Year Built</span>
                <span className="spec-value">{property.yearBuilt ?? '\u2014'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Description</h4>
              <p>{property.description || 'No description provided.'}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="detail-section">
                <h4>Amenities</h4>
                <ul className="amenity-list">
                  {property.amenities.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            )}

            <PropertyMap latitude={property.latitude} longitude={property.longitude} title={property.title} />

            <ReviewSection propertyId={property.id} isOwner={isOwner} />
          </div>

          <div>
            <div className="owner-card">
              <span className="owner-role">Listed by</span>
              {property.ownerAvatarUrl ? (
                <img className="avatar-preview" src={resolveImageUrl(property.ownerAvatarUrl)} alt={property.ownerName} style={{ width: 56, height: 56, marginBottom: 10 }} />
              ) : null}
              <div className="owner-name">{property.ownerName}</div>
              {property.ownerPhone && <p className="text-muted mono">{property.ownerPhone}</p>}

              <div className="owner-actions">
                {!isOwner && (
                  <button className="btn btn-brass btn-block" onClick={toggleFavorite}>
                    {isFavorite ? 'Saved \u2665' : 'Save Listing \u2661'}
                  </button>
                )}
                {isOwner && (
                  <div className="listing-owner-controls" style={{ marginTop: 0, flexDirection: 'column' }}>
                    <Link to={`/properties/${property.id}/edit`} className="btn btn-outline btn-block">
                      Edit Listing
                    </Link>
                    <button className="btn btn-danger-outline btn-block" onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting\u2026' : 'Delete Listing'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isOwner && <InquiryForm propertyId={property.id} />}
          </div>
        </div>
      </div>
    </main>
  );
}
