import type { Route } from "./+types/home";
import TripForm from "~/components/TripForm";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ELD Log Generator" },
    {
      name: "description",
      content: "Generate FMCSA-compliant ELD logs for commercial truck drivers",
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  const handleTripSubmit = async (formData: any) => {
    // Navigate to trip calculation with form data
    navigate("/trips/calculate", {
      state: { formData },
      replace: true,
    });
  };

  return (
    <div className="home-page">
      <div className="trip-form-section">
        <TripForm onSubmit={handleTripSubmit} />
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Route Planning</h3>
            <p>
              Calculate optimal routes with automatic stop planning and fuel
              stop calculations.
            </p>
          </div>
          <div className="feature-card">
            <h3>HOS Compliance</h3>
            <p>
              Automatic Hours of Service calculations following FMCSA
              regulations 49 CFR Part 395.
            </p>
          </div>
          <div className="feature-card">
            <h3>ELD Log Generation</h3>
            <p>
              Generate compliant electronic logging device records with proper
              grid formatting.
            </p>
          </div>
          <div className="feature-card">
            <h3>Multi-Day Support</h3>
            <p>
              Handle trips spanning multiple days with automatic 34-hour restart
              planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
