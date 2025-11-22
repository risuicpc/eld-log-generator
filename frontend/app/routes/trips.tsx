import { useLoaderData, useNavigate } from "react-router";
import { getTrips } from "~/services/api";
import { formatDate, formatDurationHours } from "~/utils/timeUtils";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ELD Log Generator - Professional HOS Compliance" },
    {
      name: "description",
      content:
        "Generate FMCSA-compliant ELD logs with modern, professional tools for commercial truck drivers",
    },
  ];
}

export async function clientLoader() {
  try {
    const tripsData = await getTrips();
    return { tripsData };
  } catch (error) {
    console.error("Failed to load trips:", error);
    return { tripsData: [] };
  }
}

clientLoader.hydrate = true;

export default function TripsPage() {
  const navigate = useNavigate();
  const { tripsData } = useLoaderData() as { tripsData: any[] };

  const formatDistance = (distance: string) => {
    const num = parseFloat(distance);
    return `${num.toFixed(0)} miles`;
  };

  const handleTripClick = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="home-page">
      {/* Recent Trips */}
      <section className="recent-trips">
        <h3>Trips</h3>
        <div className="trips-list">
          {tripsData &&
            tripsData.length > 0 &&
            tripsData.map((trip) => (
              <div
                key={trip.id}
                className="trip-item"
                onClick={() => handleTripClick(trip.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="trip-info">
                  <h4>Trip #{trip.id}</h4>
                  <p>
                    {trip.current_location} → {trip.pickup_location} →{" "}
                    {trip.dropoff_location}
                  </p>
                  <div className="trip-meta">
                    <span>📏 {formatDistance(trip.total_distance)}</span>
                    <span>
                      ⏱️{" "}
                      {formatDurationHours(parseFloat(trip.estimated_duration))}
                    </span>
                    <span>📅 {formatDate(trip.created_at)}</span>
                    <span>🔄 {trip.current_cycle_used} hrs used</span>
                  </div>
                </div>
                <div className="trip-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTripClick(trip.id);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add duplicate functionality here if needed
                      console.log("Duplicate trip", trip.id);
                    }}
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
