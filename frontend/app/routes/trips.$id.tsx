import type { Route } from "./+types/trips.$id";
import { useLoaderData, Link, Outlet } from "react-router";
import { getTripLogs } from "../services/api";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Trip ${params.id} - ELD Log Generator` }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    return { tripData };
  } catch (error) {
    throw new Error(`Failed to load trip: ${params.id}`);
  }
}

clientLoader.hydrate = true;

export default function TripDetailPage() {
  const { tripData } = useLoaderData() as { tripData: any };

  return (
    <div className="trip-detail-page">
      <div className="trip-header">
        <h2>Trip Details</h2>
        <Link to="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>

      <div className="trip-info">
        <div className="info-grid">
          <div className="info-item">
            <label>From:</label>
            <span>{tripData.trip?.current_location}</span>
          </div>
          <div className="info-item">
            <label>To:</label>
            <span>{tripData.trip?.dropoff_location}</span>
          </div>
          <div className="info-item">
            <label>Pickup:</label>
            <span>{tripData.trip?.pickup_location}</span>
          </div>
          <div className="info-item">
            <label>Distance:</label>
            <span>{tripData.trip?.total_distance} miles</span>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
