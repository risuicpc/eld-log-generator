import React, { Suspense } from "react";

// Dynamically import the map component to avoid SSR issues
const ClientOnlyRouteMap = React.lazy(() => import("./ClientOnlyRouteMap"));

interface RouteMapProps {
  route: any;
  trip: any;
}

const RouteMap: React.FC<RouteMapProps> = ({ route, trip }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="route-map-container">
        <div className="map-placeholder">
          <h3>Route Map</h3>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="route-map-container">
          <div className="map-placeholder">
            <h3>Route Map</h3>
            <p>Loading map...</p>
          </div>
        </div>
      }
    >
      <ClientOnlyRouteMap route={route} trip={trip} />
    </Suspense>
  );
};

export default RouteMap;
