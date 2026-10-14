import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite doesn't resolve Leaflet's default marker asset paths automatically.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange }) {
  const center = latitude && longitude ? [latitude, longitude] : [20.5937, 78.9629]; // India centroid fallback
  const zoom = latitude && longitude ? 13 : 4;

  return (
    <div className="field">
      <label>Pin the location on the map (optional but recommended)</label>
      <div className="location-picker-map">
        <MapContainer center={center} zoom={zoom} style={{ height: '260px', width: '100%' }} key={`${center[0]}-${center[1]}`}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {latitude && longitude && <Marker position={[latitude, longitude]} icon={defaultIcon} />}
        </MapContainer>
      </div>
      <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
        Click anywhere on the map to drop a pin at that spot.
        {latitude && longitude ? ` Current: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : ' No location set yet.'}
      </p>
    </div>
  );
}
