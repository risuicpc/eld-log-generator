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
import { sampleTripDetails } from "~/utils/hosCalculations";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Calculate Trip - ELD Log Generator" }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    return { tripData };
  } catch (error) {
    const id = parseInt(params.id);
    if (id > 0 && id < 6) {
      return { tripData: sampleTripDetails[id as 1] };
    }
    return { tripData: {} };
  }
}

clientLoader.hydrate = true;

export default function TripCalculatePage() {
  const navigation = useNavigation();
  const { tripData } = useLoaderData() as { tripData: any };
  const [activeTab, setActiveTab] = useState("summary");

  const handlePrintLog = (logIndex: number) => {
    const element = document.getElementById(`eld-log-${logIndex}`);
    if (!element) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>ELD Log - ${tripData.daily_schedules[logIndex].date}</title>
        <style>

          body {
            font-family: 'Times New Roman', serif;
            margin: 20px;
          }

          /* OUTER WRAPPER */
          .eld-graph-wrapper {
            width: 100%;
            border: 2px solid #000;
            margin-top: 10px;
          }

          /* GRID LAYOUT */
          .eld-graph-grid {
            display: grid;
            grid-template-rows: auto repeat(4, 40px);
            border-left: 2px solid #000;
            border-right: 2px solid #000;
          }

          /* HEADER */
          .grid-header-row {
            display: grid;
            grid-template-columns: 90px repeat(24, 1fr);
            border-bottom: 2px solid #000;
            background: #f2f2f2;
          }

          .grid-header-left {
            border-right: 2px solid #000;
            padding: 4px;
            font-weight: bold;
            text-align: center;
            font-size: 12px;
          }

          .grid-hour-cell {
            text-align: center;
            font-size: 10px;
            padding: 2px 0;
            border-right: 1px solid #000;
          }

          /* DUTY ROWS */
          .grid-data-row {
            display: grid;
            grid-template-columns: 90px repeat(24, 1fr);
            border-bottom: 1px solid #000;
          }

          .grid-status-label {
            border-right: 2px solid #000;
            padding: 4px;
            font-size: 12px;
            display: flex;
            align-items: center;
          }

          .grid-hour-block {
            position: relative;
            border-right: 1px solid #888;
            height: 100%;
          }

          /* 12 & 24 thick markers */
          .grid-hour-block:nth-child(13),
          .grid-hour-block:nth-child(25) {
            border-right: 2px solid #000 !important;
          }

          /* ACTIVITY COLORS */
          .grid-cell-off-duty .graph-line {
            background: #10b981;
          }
          .grid-cell-sleeper-berth .graph-line {
            background: #3b82f6;
          }
          .grid-cell-driving .graph-line {
            background: #ef4444;
          }
          .grid-cell-on-duty .graph-line {
            background: #f59e0b;
          }

          .graph-line {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: #000;
          }

        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.print();
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
