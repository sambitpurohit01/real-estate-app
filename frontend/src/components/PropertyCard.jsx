import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, resolveImageUrl } from '../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

export default function PropertyCard({ property, isFavorite, onToggleFavorite }) {
  const image = property.images && property.images.length > 0 ? resolveImageUrl(property.images[0]) : FALLBACK_IMAGE;

  return (
    <motion.div
      className="property-card"
      whileHover={{ y: -5, boxShadow: '0 16px 32px rgba(27, 36, 48, 0.14)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <Link to={`/properties/${property.id}`}>
        <div className="card-photo">
          <span className="card-tag">{property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}</span>
          <img src={image} alt={property.title} loading="lazy" />
        </div>
      </Link>

      {onToggleFavorite && (
        <motion.button
          className="card-fav"
          onClick={() => onToggleFavorite(property.id)}
          aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
          title={isFavorite ? 'Remove from saved' : 'Save listing'}
          whileTap={{ scale: 0.8 }}
        >
          {isFavorite ? '\u2665' : '\u2661'}
        </motion.button>
      )}

      <Link to={`/properties/${property.id}`}>
        <div className="card-body">
          <h3>{property.title}</h3>
          <div className="card-location">{property.city}, {property.state}</div>
          <div className="card-price">
            {formatPrice(property.price, property.listingType)}
          </div>
        </div>

        <div className="deed-strip">
          <span>Beds <span className="val">{property.bedrooms ?? '\u2014'}</span></span>
          <span>Baths <span className="val">{property.bathrooms ?? '\u2014'}</span></span>
          <span>Sqft <span className="val">{property.areaSqft ?? '\u2014'}</span></span>
        </div>
      </Link>
    </motion.div>
  );
}
