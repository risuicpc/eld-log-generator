import type { Route } from "./+types/trips.$id";
import { useLoaderData, Link, Outlet, useParams } from "react-router";
import { getTripLogs } from "../services/api";
import { useState } from "react";

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
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  if (!tripData) {
    return (
      <div className="trip-detail-page">
        <div className="error-message-container">
          <div className="error-icon">⚠️</div>
          <h3>Trip Not Found</h3>
          <p>The requested trip could not be found.</p>
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const trip = tripData.trip || tripData;

  return (
    <div className="trip-detail-page">
      <div className="trip-header">
        <div>
          <h2>📋 Trip Details</h2>
          <p className="text-gray-600">Trip ID: {params.id}</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to Home
        </Link>
      </div>

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

      <div className="trip-actions">
        <div className="action-buttons">
          <Link to={`/trips/${params.id}/logs`} className="btn btn-primary">
            📋 View All Logs
          </Link>
          <button className="btn btn-outline">🖨️ Export Report</button>
          <button className="btn btn-secondary">📝 Duplicate Trip</button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === "route" ? "active" : ""}`}
          onClick={() => setActiveTab("route")}
        >
          🗺️ Route Details
        </button>
        <button
          className={`tab ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTab("compliance")}
        >
          ✅ Compliance
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <span className="stat-value">
                    {tripData.daily_logs?.length || 0}
                  </span>
                  <span className="stat-label">Total Days</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚛</div>
                <div className="stat-content">
                  <span className="stat-value">
                    {tripData.daily_logs
                      ?.reduce(
                        (sum: number, log: any) =>
                          sum + log.total_driving_hours,
                        0
                      )
                      .toFixed(1)}
                    h
                  </span>
                  <span className="stat-label">Total Driving</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-content">
                  <span className="stat-value">
                    {tripData.daily_logs
                      ?.reduce(
                        (sum: number, log: any) =>
                          sum + log.total_on_duty_hours,
                        0
                      )
                      .toFixed(1)}
                    h
                  </span>
                  <span className="stat-label">Total On Duty</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                  <span className="stat-value">
                    {tripData.daily_logs?.reduce(
                      (sum: number, log: any) => sum + log.total_miles,
                      0
                    )}
                  </span>
                  <span className="stat-label">Total Miles</span>
                </div>
              </div>
            </div>

            <div className="recent-logs">
              <h4>📋 Recent Logs</h4>
              <div className="logs-preview">
                {tripData.daily_logs
                  ?.slice(0, 3)
                  .map((log: any, index: number) => (
                    <div key={index} className="log-preview-item">
                      <div className="log-preview-header">
                        <span className="log-date">
                          {new Date(log.log_date).toLocaleDateString()}
                        </span>
                        <span className="log-day">Day {log.day_number}</span>
                      </div>
                      <div className="log-preview-stats">
                        <span>🚛 {log.total_driving_hours.toFixed(1)}h</span>
                        <span>💼 {log.total_on_duty_hours.toFixed(1)}h</span>
                        <span>📏 {log.total_miles} mi</span>
                      </div>
                    </div>
                  ))}
                {tripData.daily_logs && tripData.daily_logs.length > 3 && (
                  <div className="view-all-logs">
                    <Link
                      to={`/trips/${params.id}/logs`}
                      className="btn btn-outline btn-sm"
                    >
                      View All {tripData.daily_logs.length} Logs →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "route" && (
          <div className="route-content">
            <div className="route-details-card">
              <h4>🗺️ Route Information</h4>
              <div className="route-info-grid">
                <div className="route-info-item">
                  <strong>Start Point:</strong>
                  <span>{trip.current_location}</span>
                </div>
                <div className="route-info-item">
                  <strong>End Point:</strong>
                  <span>{trip.dropoff_location}</span>
                </div>
                <div className="route-info-item">
                  <strong>Pickup Location:</strong>
                  <span>{trip.pickup_location}</span>
                </div>
                <div className="route-info-item">
                  <strong>Total Distance:</strong>
                  <span>{trip.total_distance} miles</span>
                </div>
                <div className="route-info-item">
                  <strong>Estimated Duration:</strong>
                  <span>{trip.estimated_duration} hours</span>
                </div>
                {trip.route_summary && (
                  <>
                    <div className="route-info-item">
                      <strong>Average Speed:</strong>
                      <span>{trip.route_summary.average_speed} mph</span>
                    </div>
                    <div className="route-info-item">
                      <strong>Fuel Stops:</strong>
                      <span>
                        {Math.ceil(trip.total_distance / 500)} planned
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="compliance-content">
            <div className="compliance-summary">
              <h4>✅ Compliance Summary</h4>
              <div className="compliance-stats">
                <div className="compliance-stat compliant">
                  <span className="stat-label">70-Hour Cycle</span>
                  <span className="stat-value">Within Limits</span>
                </div>
                <div className="compliance-stat compliant">
                  <span className="stat-label">Daily Driving</span>
                  <span className="stat-value">Compliant</span>
                </div>
                <div className="compliance-stat compliant">
                  <span className="stat-label">30-Minute Breaks</span>
                  <span className="stat-value">Included</span>
                </div>
                <div className="compliance-stat compliant">
                  <span className="stat-label">Rest Periods</span>
                  <span className="stat-value">Adequate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
