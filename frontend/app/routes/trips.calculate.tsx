import { useState } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import { getTripLogs } from "~/services/api";
import ELDLog from "../components/ELDLog";
import ErrorMessage from "../components/ErrorMessage";
import HosCompliance from "../components/HosCompliance";
import LoadingSpinner from "../components/LoadingSpinner";
import RouteMap from "../components/RouteMap";
import TripSummary from "../components/TripSummary";
import type { Route } from "./+types/trips.calculate";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Calculate Trip - ELD Log Generator" }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    return { tripData };
  } catch (error) {
    console.error("Failed to load trips:", error);
    return { tripData: [] };
  }
}

clientLoader.hydrate = true;

export default function TripCalculatePage() {
  const navigation = useNavigation();
  const { tripData } = useLoaderData() as { tripData: any };
  const [activeTab, setActiveTab] = useState("summary");

  const handlePrintLog = (logIndex: number) => {
    const element = document.getElementById(`eld-log-${logIndex}`);
    if (element) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ELD Log - ${tripData.daily_schedules[logIndex].date}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .eld-log { border: 2px solid #000; padding: 20px; }
                .log-header { text-align: center; margin-bottom: 20px; }
                .log-grid { margin: 20px 0; }
                .grid-row { display: flex; border-bottom: 1px solid #ccc; }
                .grid-cell { flex: 1; padding: 5px; text-align: center; border-right: 1px solid #ccc; }
                .grid-header { font-weight: bold; background: #f0f0f0; }
                .active { background: #000; color: white; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (navigation.state === "loading") {
    return <LoadingSpinner />;
  }

  if (!tripData) {
    return (
      <div className="trip-calculate-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="trip-calculate-page">
        <ErrorMessage message="No trip data available" />
      </div>
    );
  }

  return (
    <div className="trip-calculate-page">
      <div className="results-header">
        <div>
          <h2>Trip Results</h2>
          <p className="text-gray-600">
            {tripData.trip.current_location} → {tripData.trip.dropoff_location}
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← New Trip
        </Link>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          📊 Summary
        </button>
        <button
          className={`tab ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          🗺️ Route Map
        </button>
        <button
          className={`tab ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTab("compliance")}
        >
          ✅ HOS Compliance
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📋 ELD Logs ({tripData.daily_schedules.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "summary" && (
          <TripSummary
            trip={tripData.trip}
            route={tripData.route}
            dailySchedules={tripData.daily_schedules}
          />
        )}

        {activeTab === "map" && (
          <RouteMap route={tripData.route} trip={tripData.trip} />
        )}

        {activeTab === "compliance" && (
          <HosCompliance
            compliance={tripData.hos_compliance_check}
            dailySchedules={tripData.daily_schedules}
          />
        )}

        {activeTab === "logs" && (
          <div className="logs-container">
            {tripData.daily_schedules.map((schedule: any, index: number) => (
              <div key={index} className="log-wrapper">
                <ELDLog
                  dailyLog={schedule}
                  logIndex={index}
                  onPrint={() => handlePrintLog(index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
