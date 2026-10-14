import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { formatPrice } from '../utils/format';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PropertiesMap({ properties }) {
  const navigate = useNavigate();
  const withCoords = properties.filter((p) => p.latitude && p.longitude);

  if (withCoords.length === 0) {
    return (
      <div className="empty-state">
        <h3>No mapped listings</h3>
        <p>None of the current results have a pinned location yet.</p>
      </div>
    );
  }

  const center = [withCoords[0].latitude, withCoords[0].longitude];

  return (
    <div className="home-map-container">
      <MapContainer center={center} zoom={5} style={{ height: '560px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={defaultIcon}>
            <Popup>
              <strong>{p.title}</strong>
              <br />
              {formatPrice(p.price, p.listingType)}
              <br />
              <button
                className="map-popup-link"
                onClick={() => navigate(`/properties/${p.id}`)}
              >
                View listing &rarr;
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
