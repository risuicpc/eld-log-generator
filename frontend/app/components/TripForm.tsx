import React, { useState } from "react";
import type { TripFormData } from "~/services/api";

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TripFormData>({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.current_location.trim()) {
      newErrors.current_location = "Current location is required";
    }
    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = "Pickup location is required";
    }
    if (!formData.dropoff_location.trim()) {
      newErrors.dropoff_location = "Dropoff location is required";
    }

    const cycleUsed = formData.current_cycle_used;
    if (isNaN(cycleUsed) || cycleUsed < 0 || cycleUsed > 70) {
      newErrors.current_cycle_used = "Must be between 0 and 70 hours";
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
      current_location: "New York, NY",
      pickup_location: "New York, NY",
      dropoff_location: "Chicago, IL",
      current_cycle_used: 0,
    },
    {
      label: "Chicago to Los Angeles",
      current_location: "Chicago, IL",
      pickup_location: "Chicago, IL",
      dropoff_location: "Los Angeles, CA",
      current_cycle_used: 45,
    },
    {
      label: "Regional Trip",
      current_location: "Philadelphia, PA",
      pickup_location: "Philadelphia, PA",
      dropoff_location: "Boston, MA",
      current_cycle_used: 30,
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
        <h3>Quick Examples:</h3>
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
          <label htmlFor="current_location">Current Location *</label>
          <input
            id="current_location"
            type="text"
            value={formData.current_location}
            onChange={(e) => handleChange("current_location", e.target.value)}
            placeholder="e.g., New York, NY"
            className={errors.current_location ? "error" : ""}
          />
          {errors.current_location && (
            <span className="error-message">{errors.current_location}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="pickup_location">Pickup Location *</label>
          <input
            id="pickup_location"
            type="text"
            value={formData.pickup_location}
            onChange={(e) => handleChange("pickup_location", e.target.value)}
            placeholder="e.g., Chicago, IL"
            className={errors.pickup_location ? "error" : ""}
          />
          {errors.pickup_location && (
            <span className="error-message">{errors.pickup_location}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dropoff_location">Dropoff Location *</label>
          <input
            id="dropoff_location"
            type="text"
            value={formData.dropoff_location}
            onChange={(e) => handleChange("dropoff_location", e.target.value)}
            placeholder="e.g., Los Angeles, CA"
            className={errors.dropoff_location ? "error" : ""}
          />
          {errors.dropoff_location && (
            <span className="error-message">{errors.dropoff_location}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="current_cycle_used">
            Current Cycle Used (Hours) *
            <span className="label-note"> - 70-hour/8-day limit</span>
          </label>
          <input
            id="current_cycle_used"
            type="number"
            step="0.1"
            min="0"
            max="70"
            value={formData.current_cycle_used}
            onChange={(e) =>
              handleChange(
                "current_cycle_used",
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="0"
            className={errors.current_cycle_used ? "error" : ""}
          />
          {errors.current_cycle_used && (
            <span className="error-message">{errors.current_cycle_used}</span>
          )}
          <div className="input-help">
            Enter hours used in current 8-day cycle (0-70 hours)
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Generate ELD Logs
        </button>
      </form>

      <div className="form-info">
        <h4>About This Tool</h4>
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
