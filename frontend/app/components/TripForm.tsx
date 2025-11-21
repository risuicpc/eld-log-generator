import React, { useState } from "react";
import type { TripFormData } from "~/services/api";

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  posting?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, posting }) => {
  const [formData, setFormData] = useState<TripFormData>({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    currentCycleUsed: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = "Current location is required";
    }
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    }
    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Dropoff location is required";
    }

    const cycleUsed = formData.currentCycleUsed;
    if (isNaN(cycleUsed) || cycleUsed < 0 || cycleUsed > 70) {
      newErrors.currentCycleUsed = "Must be between 0 and 70 hours";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handleChange = (field: keyof TripFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const exampleTrips = [
    {
      label: "New York to Chicago",
      currentLocation: "New York, NY",
      pickupLocation: "New York, NY",
      dropoffLocation: "Chicago, IL",
      currentCycleUsed: 0,
    },
    {
      label: "Chicago to Los Angeles",
      currentLocation: "Chicago, IL",
      pickupLocation: "Chicago, IL",
      dropoffLocation: "Los Angeles, CA",
      currentCycleUsed: 45,
    },
    {
      label: "Regional Trip",
      currentLocation: "Philadelphia, PA",
      pickupLocation: "Philadelphia, PA",
      dropoffLocation: "Boston, MA",
      currentCycleUsed: 30,
    },
  ];

  const loadExample = (example: any) => {
    setFormData(example);
    setErrors({});
  };

  return (
    <div className="trip-form-container">
      <div className="form-header">
        <h2>Plan Your Trip</h2>
        <p>Enter trip details to generate compliant ELD logs</p>
      </div>

      <div className="example-trips">
        <h3>🚀 Quick Examples</h3>
        <div className="example-buttons">
          {exampleTrips.map((example, index) => (
            <button
              key={index}
              type="button"
              className="btn-example"
              onClick={() => loadExample(example)}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="currentLocation">📍 Current Location *</label>
          <input
            id="currentLocation"
            type="text"
            value={formData.currentLocation}
            onChange={(e) => handleChange("currentLocation", e.target.value)}
            placeholder="e.g., New York, NY"
            className={errors.currentLocation ? "error" : ""}
          />
          {errors.currentLocation && (
            <span className="error-message">{errors.currentLocation}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="pickupLocation">📦 Pickup Location *</label>
          <input
            id="pickupLocation"
            type="text"
            value={formData.pickupLocation}
            onChange={(e) => handleChange("pickupLocation", e.target.value)}
            placeholder="e.g., Chicago, IL"
            className={errors.pickupLocation ? "error" : ""}
          />
          {errors.pickupLocation && (
            <span className="error-message">{errors.pickupLocation}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dropoffLocation">🎯 Dropoff Location *</label>
          <input
            id="dropoffLocation"
            type="text"
            value={formData.dropoffLocation}
            onChange={(e) => handleChange("dropoffLocation", e.target.value)}
            placeholder="e.g., Los Angeles, CA"
            className={errors.dropoffLocation ? "error" : ""}
          />
          {errors.dropoffLocation && (
            <span className="error-message">{errors.dropoffLocation}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="currentCycleUsed">
            ⏰ Current Cycle Used (Hours) *
            <span className="label-note"> - 70-hour/8-day limit</span>
          </label>
          <input
            id="currentCycleUsed"
            type="number"
            step="0.1"
            min="0"
            max="70"
            value={formData.currentCycleUsed}
            onChange={(e) =>
              handleChange("currentCycleUsed", parseFloat(e.target.value) || 0)
            }
            placeholder="0"
            className={errors.currentCycleUsed ? "error" : ""}
          />
          {errors.currentCycleUsed && (
            <span className="error-message">{errors.currentCycleUsed}</span>
          )}
          <div className="input-help">
            Enter hours used in current 8-day cycle (0-70 hours)
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          🚛 Generate ELD Logs
          {posting && <div className="loading"></div>}
        </button>
      </form>

      <div className="form-info">
        <h4>💡 About This Tool</h4>
        <ul>
          <li>Calculates routes and driving time automatically</li>
          <li>Generates FMCSA-compliant ELD logs</li>
          <li>Includes required 30-minute breaks</li>
          <li>Handles 70-hour/8-day cycle limits</li>
          <li>Plans 34-hour restarts when needed</li>
        </ul>
      </div>
    </div>
  );
};

export default TripForm;
