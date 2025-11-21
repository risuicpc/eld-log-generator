import { useCallback, useMemo, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router";
import ErrorMessage from "~/components/ErrorMessage";
import LoadingSpinner from "~/components/LoadingSpinner";
import { ComplianceTab, OverviewTab, RouteTab } from "~/components/Tab";
import {
  calculateCompliance,
  calculateRouteStats,
} from "~/utils/hosCalculations";
import { getTripLogs } from "../services/api";
import type { TripData } from "../types/trip";
import type { Route } from "./+types/trips.$id";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Trip ${params.id} - ELD Log Generator` }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    if (!tripData) {
      throw new Response("Trip Not Found", {
        status: 404,
        statusText: `Trip ${params.id} could not be found`,
      });
    }
    return { tripData };
  } catch (error) {
    console.error("Failed to load trip:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Failed to load trip", {
      status: 500,
      statusText: `Failed to load trip: ${params.id}`,
    });
  }
}

clientLoader.hydrate = true;

// Main Component
export default function TripDetailPage() {
  const { tripData } = useLoaderData() as { tripData: TripData };
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const setActiveTabHandler = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Calculate derived data
  const { compliance, routeStats, trip } = useMemo(() => {
    if (!tripData) {
      return { compliance: null, routeStats: null, trip: null };
    }

    const trip = tripData.trip || tripData;
    const compliance = calculateCompliance(tripData.daily_logs || []);
    const routeStats = calculateRouteStats(tripData.daily_logs || [], trip);

    return { compliance, routeStats, trip };
  }, [tripData]);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading trip details..." />;
  }

  // Error state
  if (!tripData || !trip) {
    return <ErrorMessage message="The requested trip could not be found." />;
  }

  return (
    <div className="trip-detail-page">
      {/* Header */}
      <div className="trip-header">
        <div>
          <h2>📋 Trip Details</h2>
          <p className="text-gray-600">Trip ID: {params.id}</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to Home
        </Link>
      </div>

      {/* Trip Info Card */}
      <div className="trip-info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">📍 From</span>
            <span className="info-value">{trip.current_location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🎯 To</span>
            <span className="info-value">{trip.dropoff_location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📦 Pickup</span>
            <span className="info-value">{trip.pickup_location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📏 Distance</span>
            <span className="info-value">{trip.total_distance} miles</span>
          </div>
          <div className="info-item">
            <span className="info-label">⏱️ Duration</span>
            <span className="info-value">{trip.estimated_duration} hours</span>
          </div>
          <div className="info-item">
            <span className="info-label">⏰ Cycle Used</span>
            <span className="info-value">{trip.current_cycle_used} hours</span>
          </div>
          <div className="info-item">
            <span className="info-label">📅 Created</span>
            <span className="info-value">
              {new Date(trip.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">🔄 Status</span>
            <span className="info-value">
              <span className="status-badge compliant">Completed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="trip-actions">
        <div className="action-buttons">
          <Link to={`/trips/${params.id}/logs`} className="btn btn-primary">
            📋 View All Logs
          </Link>
          <button className="btn btn-outline">🖨️ Export Report</button>
          <button className="btn btn-secondary">📝 Duplicate Trip</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTabHandler("overview")}
          role="tab"
          aria-selected={activeTab === "overview"}
          aria-controls="overview-panel"
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === "route" ? "active" : ""}`}
          onClick={() => setActiveTabHandler("route")}
          role="tab"
          aria-selected={activeTab === "route"}
          aria-controls="route-panel"
        >
          🗺️ Route Details
        </button>
        <button
          className={`tab ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTabHandler("compliance")}
          role="tab"
          aria-selected={activeTab === "compliance"}
          aria-controls="compliance-panel"
        >
          ✅ Compliance
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div
          id="overview-panel"
          role="tabpanel"
          aria-labelledby="overview-tab"
          hidden={activeTab !== "overview"}
        >
          {activeTab === "overview" && (
            <OverviewTab
              tripData={tripData}
              routeStats={routeStats!}
              params={params}
            />
          )}
        </div>

        <div
          id="route-panel"
          role="tabpanel"
          aria-labelledby="route-tab"
          hidden={activeTab !== "route"}
        >
          {activeTab === "route" && (
            <RouteTab trip={trip} routeStats={routeStats!} />
          )}
        </div>

        <div
          id="compliance-panel"
          role="tabpanel"
          aria-labelledby="compliance-tab"
          hidden={activeTab !== "compliance"}
        >
          {activeTab === "compliance" && compliance && (
            <ComplianceTab compliance={compliance} />
          )}
        </div>
      </div>
    </div>
  );
}
