export interface Activity {
  start_time: string;
  end_time: string;
  status: "driving" | "on_duty" | "off_duty";
  location: string;
  description: string;
  duration_hours: number;
}

export interface DailyLog {
  id: number;
  log_date: string;
  day_number: number;
  total_miles: number;
  driver_name: string;
  carrier_name: string;
  vehicle_number: string;
  cycle_used: number;
  total_driving_hours: number;
  total_on_duty_hours: number;
  total_off_duty_hours: number;
  activities: Activity[];
}

export interface Trip {
  current_location: string;
  dropoff_location: string;
  pickup_location: string;
  total_distance: number;
  estimated_duration: number;
  current_cycle_used: number;
  created_at: string;
  route_summary?: {
    average_speed: number;
  };
}

export interface TripData {
  trip?: Trip;
  daily_logs: DailyLog[];
}

export interface ComplianceStatus {
  seventyHourCycle: { status: "compliant" | "violation"; message: string };
  dailyDriving: { status: "compliant" | "violation"; message: string };
  thirtyMinuteBreaks: { status: "compliant" | "violation"; message: string };
  restPeriods: { status: "compliant" | "violation"; message: string };
}

export interface RouteStats {
  totalMiles: number;
  totalDrivingHours: string;
  averageSpeed: string;
  fuelStops: number;
  totalDays: number;
}
