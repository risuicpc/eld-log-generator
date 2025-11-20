import type { Route } from "./+types/trips.$id.logs";
import { useLoaderData } from "react-router";
import ELDLog from "~/components/ELDLog";
import { getTripLogs } from "~/services/api";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Trip ${params.id} Logs - ELD Log Generator` }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    return { tripData };
  } catch (error) {
    throw new Error(`Failed to load trip logs: ${params.id}`);
  }
}

clientLoader.hydrate = true;

export default function TripLogsPage() {
  const { tripData } = useLoaderData() as { tripData: any };

  const handlePrintLog = (logIndex: number) => {
    const element = document.getElementById(`eld-log-${logIndex}`);
    if (element) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ELD Log</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .eld-log { border: 2px solid #000; padding: 20px; }
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

  return (
    <div className="trip-logs-page">
      <h3>Daily Logs</h3>
      <div className="logs-container">
        {tripData.daily_logs?.map((log: any, index: number) => (
          <div key={index} className="log-wrapper">
            <ELDLog
              dailyLog={log}
              logIndex={index}
              onPrint={() => handlePrintLog(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
