import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface TripFormData {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}

export interface TripData {
  trip: any;
  route: any;
  daily_schedules: any[];
  hos_compliance_check: any;
  total_days: number;
}

export const calculateTrip = async (
  tripData: TripFormData
): Promise<TripData> => {
  try {
    console.log("Sending trip data to API:", tripData);
    const response = await api.post("/trips/calculate/", tripData);
    return response.data;
  } catch (error: any) {
    console.log("API error:", error);
    if (error.response) { 
      throw new Error(error.response.data.error || "Failed to calculate trip");
    } else if (error.request) {
      throw new Error(
        "Unable to connect to server. Please check if the backend is running."
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getTripLogs = async (tripId: string): Promise<any> => {
  try {
    const response = await api.get(`/trips/${tripId}/logs/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch trip logs");
  }
};

export const getHOSLimits = async (): Promise<any> => {
  try {
    const response = await api.get("/hos-rules/limits/");
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch HOS limits");
  }
};

export const checkHOSCompliance = async (
  currentCycleUsed: number,
  additionalHours: number = 0
): Promise<any> => {
  try {
    const response = await api.post("/hos-rules/check_compliance/", {
      current_cycle_used: currentCycleUsed,
      additional_hours: additionalHours,
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to check HOS compliance");
  }
};

export default api;
