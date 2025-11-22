import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import TripForm from "~/components/TripForm";
import { calculateTrip, getTrips, type TripFormData } from "~/services/api";
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

export default function HomePage() {
  const navigate = useNavigate();
  const { tripsData } = useLoaderData() as { tripsData: any[] };
  const [showTripForm, setShowTripForm] = useState(false);
  const [posting, setPosting] = useState(false);

  const formatDistance = (distance: string) => {
    const num = parseFloat(distance);
    return `${num.toFixed(0)} miles`;
  };

  const handleTripClick = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  const quickActions = [
    {
      title: "Create New Trip",
      description: "Plan a new route and generate compliant ELD logs",
      icon: "🗺️",
      action: () => setShowTripForm(true),
      color: "primary",
    },
    {
      title: "View Recent Trips",
      description: "Access your previously calculated trips and logs",
      icon: "📊",
      action: () => navigate(`/trips`),
      color: "secondary",
    },
    {
      title: "HOS Rules Guide",
      description: "Learn about FMCSA Hours of Service regulations",
      icon: "📚",
      action: () => console.log("Open HOS guide"),
      color: "info",
    },
  ];

  const handleTripFormSubmit = async (formData: TripFormData) => {
    try {
      setPosting(true);
      const params = {
        current_location: formData.currentLocation,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        current_cycle_used: formData.currentCycleUsed.toString(),
      };
      const result = await calculateTrip(params);
      handleTripClick(result.id);
    } catch (err: any) {
      console.log(err.message || "Failed to calculate trip");
    } finally {
      setPosting(false);
      setShowTripForm(false);
    }
  };

  const handleCloseModal = () => {
    setShowTripForm(false);
  };

  return (
    <div className="home-page">
      {/* Modal for TripForm */}
      {showTripForm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Plan Your Trip</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <TripForm onSubmit={handleTripFormSubmit} posting={posting} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <h2>Professional ELD Log Generation</h2>
        <p>
          Create FMCSA-compliant electronic logging device records with our
          modern, intuitive platform designed for professional truck drivers.
        </p>
        <div className="cta-buttons">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowTripForm(true)}
          >
            🚛 Start New Trip
          </button>
          <button className="btn btn-secondary btn-lg">
            📖 Learn HOS Rules
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={action.action}>
              <div className="action-icon">{action.icon}</div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
              <button className={`btn btn-${action.color} btn-sm`}>
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Trips */}
      <section className="recent-trips">
        <h3>Recent Trips</h3>
        <div className="trips-list">
          {tripsData && tripsData.length > 0 ? (
            tripsData.splice(0, 3).map((trip) => (
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
            ))
          ) : (
            <div className="empty-state">
              <p>No recent trips found</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowTripForm(true)}
              >
                Create Your First Trip
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our ELD Generator?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>
              Generate compliant ELD logs in seconds with our optimized
              calculation engine and intuitive interface.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>FMCSA Compliant</h3>
            <p>
              All logs are generated following strict FMCSA Hours of Service
              regulations 49 CFR Part 395.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Smart Routing</h3>
            <p>
              Automatic route calculation with optimized stops for fuel and
              required breaks.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>
              Access your logs anywhere with our fully responsive design that
              works on all devices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
