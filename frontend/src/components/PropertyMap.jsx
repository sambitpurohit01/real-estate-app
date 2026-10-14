import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PropertyMap({ latitude, longitude, title }) {
  if (!latitude || !longitude) return null;

  return (
    <div className="detail-section">
      <h4>Location</h4>
      <div className="property-map-container">
        <MapContainer center={[latitude, longitude]} zoom={14} style={{ height: '260px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={defaultIcon}>
            <Popup>{title}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
