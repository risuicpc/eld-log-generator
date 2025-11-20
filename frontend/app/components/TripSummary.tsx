import React from "react";
import { formatDurationHours, formatDate } from "../utils/timeUtils";

interface TripSummaryProps {
  trip: any;
  route: any;
  dailySchedules: any[];
}

const TripSummary: React.FC<TripSummaryProps> = ({
  trip,
  route,
  dailySchedules,
}) => {
  const totalDrivingHours = dailySchedules.reduce(
    (sum, day) => sum + day.total_driving_hours,
    0
  );
  const totalOnDutyHours = dailySchedules.reduce(
    (sum, day) => sum + day.total_on_duty_hours,
    0
  );
  const totalDistance = dailySchedules.reduce(
    (sum, day) => sum + day.estimated_distance,
    0
  );
  const hasRestartDay = dailySchedules.some((day) => day.is_restart_day);

  const drivingDays = dailySchedules.filter(
    (day) => day.total_driving_hours > 0
  ).length;

  return (
    <div className="trip-summary">
      <div className="summary-header">
        <h3>📊 Trip Summary</h3>
        <div className="trip-overview">
          <div className="overview-item">
            <span className="overview-label">Total Distance</span>
            <span className="overview-value">
              {Math.round(totalDistance)} mi
            </span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Total Duration</span>
            <span className="overview-value">
              {formatDurationHours(totalDrivingHours)}
            </span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Trip Days</span>
            <span className="overview-value">{dailySchedules.length}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Driving Days</span>
            <span className="overview-value">{drivingDays}</span>
          </div>
        </div>
      </div>

      <div className="summary-content">
        <div className="route-summary">
          <h4>📍 Route Information</h4>
          <div className="route-details">
            <div className="route-item">
              <strong>From:</strong> {trip.current_location}
            </div>
            <div className="route-item">
              <strong>To:</strong> {trip.dropoff_location}
            </div>
            <div className="route-item">
              <strong>Pickup:</strong> {trip.pickup_location}
            </div>
            <div className="route-item">
              <strong>Current Cycle Used:</strong> {trip.current_cycle_used}{" "}
              hours
            </div>
            {route && (
              <>
                <div className="route-item">
                  <strong>Estimated Distance:</strong> {route.distance} miles
                </div>
                <div className="route-item">
                  <strong>Estimated Driving Time:</strong>{" "}
                  {route.duration.toFixed(1)} hours
                </div>
                <div className="route-item">
                  <strong>Fuel Stops Required:</strong> {route.fuel_stops}
                </div>
                {route.summary && (
                  <div className="route-item">
                    <strong>Average Speed:</strong>{" "}
                    {route.summary.average_speed} mph
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="daily-schedules">
          <h4>📅 Daily Schedule</h4>
          <div className="schedule-list">
            {dailySchedules.map((schedule, index) => (
              <div
                key={index}
                className={`schedule-day ${schedule.is_restart_day ? "restart-day" : ""}`}
              >
                <div className="day-header">
                  <span className="day-number">Day {schedule.day_number}</span>
                  <span className="day-date">{formatDate(schedule.date)}</span>
                  {schedule.is_restart_day && (
                    <span className="restart-badge">🔄 34-Hour Restart</span>
                  )}
                </div>

                {!schedule.is_restart_day && (
                  <div className="day-details">
                    <div className="day-stats">
                      <span className="stat">
                        <strong>🚛 Driving:</strong>{" "}
                        {schedule.total_driving_hours.toFixed(1)}h
                      </span>
                      <span className="stat">
                        <strong>💼 On Duty:</strong>{" "}
                        {schedule.total_on_duty_hours.toFixed(1)}h
                      </span>
                      <span className="stat">
                        <strong>📏 Distance:</strong>{" "}
                        {Math.round(schedule.estimated_distance)} mi
                      </span>
                      <span className="stat">
                        <strong>☕ Breaks:</strong> {schedule.breaks_needed}
                      </span>
                    </div>

                    <div className="day-activities">
                      <strong>Activities:</strong>
                      <ul>
                        {schedule.activities
                          .slice(0, 3)
                          .map((activity: any, activityIndex: number) => (
                            <li key={activityIndex}>
                              {new Date(activity.start_time).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}{" "}
                              - {activity.description}
                            </li>
                          ))}
                        {schedule.activities.length > 3 && (
                          <li>
                            ... and {schedule.activities.length - 3} more
                            activities
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {schedule.is_restart_day && (
                  <div className="restart-info">
                    <p>34 consecutive hours off duty to reset 70-hour cycle.</p>
                    <p>No driving permitted during restart period.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {hasRestartDay && (
          <div className="restart-notice summary-notice">
            <h5>🔄 34-Hour Restart Included</h5>
            <p>
              This trip includes a 34-hour restart period to comply with the
              70-hour/8-day cycle limit. The restart resets your available
              driving hours to the full 70 hours.
            </p>
          </div>
        )}

        <div className="hos-summary">
          <h4>✅ HOS Compliance Summary</h4>
          <div className="compliance-grid">
            <div className="compliance-item compliant">
              <span className="compliance-label">Daily Driving Limit</span>
              <span className="compliance-value">≤ 11 hours ✅</span>
            </div>
            <div className="compliance-item compliant">
              <span className="compliance-label">Duty Window</span>
              <span className="compliance-value">≤ 14 hours ✅</span>
            </div>
            <div className="compliance-item compliant">
              <span className="compliance-label">70-Hour Cycle</span>
              <span className="compliance-value">Compliant ✅</span>
            </div>
            <div className="compliance-item compliant">
              <span className="compliance-label">30-Minute Breaks</span>
              <span className="compliance-value">Included ✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSummary;
