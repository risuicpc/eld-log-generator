import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ClientOnlyRouteMapProps {
  route: any;
  trip: any;
}

const ClientOnlyRouteMap: React.FC<ClientOnlyRouteMapProps> = ({
  route,
  trip,
}) => {
  if (!route || !route.geometry) {
    return (
      <div className="route-map-container">
        <div className="map-placeholder">
          <h3>Route Map</h3>
          <p>No route data available for display.</p>
          <div className="route-info">
            <p>
              <strong>Estimated Distance:</strong> {route?.distance || "N/A"}{" "}
              miles
            </p>
            <p>
              <strong>Estimated Duration:</strong> {route?.duration || "N/A"}{" "}
              hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  const coordinates = route.geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]]
  );
  const startPoint = coordinates[0];
  const endPoint = coordinates[coordinates.length - 1];

  const center = startPoint as [number, number];
  const zoom = coordinates.length > 10 ? 5 : 10;

  return (
    <div className="route-map-container">
      <div className="map-header">
        <h3>Route Overview</h3>
        <div className="route-stats">
          <div className="stat">
            <span className="stat-label">Total Distance:</span>
            <span className="stat-value">{route.distance} miles</span>
          </div>
          <div className="stat">
            <span className="stat-label">Est. Duration:</span>
            <span className="stat-value">{route.duration} hours</span>
          </div>
          <div className="stat">
            <span className="stat-label">Fuel Stops:</span>
            <span className="stat-value">{route.fuel_stops}</span>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "500px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker position={startPoint}>
            <Popup>
              <div>
                <strong>Start: {trip?.current_location}</strong>
                <br />
                Current Location
              </div>
            </Popup>
          </Marker>

          <Marker position={endPoint}>
            <Popup>
              <div>
                <strong>End: {trip?.dropoff_location}</strong>
                <br />
                Dropoff Location
              </div>
            </Popup>
          </Marker>

          {trip?.pickup_location &&
            trip.pickup_location !== trip.current_location && (
              <Marker
                position={coordinates[Math.floor(coordinates.length / 2)]}
              >
                <Popup>
                  <div>
                    <strong>Pickup: {trip.pickup_location}</strong>
                    <br />
                    Load Pickup Location
                  </div>
                </Popup>
              </Marker>
            )}

          <Polyline
            positions={coordinates}
            color="#1890ff"
            weight={4}
            opacity={0.7}
          />
        </MapContainer>
      </div>

      <div className="route-details">
        <h4>Trip Details</h4>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">From:</span>
            <span className="detail-value">{trip?.current_location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">To:</span>
            <span className="detail-value">{trip?.dropoff_location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pickup:</span>
            <span className="detail-value">{trip?.pickup_location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Current Cycle:</span>
            <span className="detail-value">
              {trip?.current_cycle_used} hours used
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOnlyRouteMap;
