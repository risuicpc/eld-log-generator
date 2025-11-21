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
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycleUsed: number;
}

export interface FormData {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: string;
}

export interface TripData {
  trip: any;
  route: any;
  daily_schedules: any[];
  hos_compliance_check: any;
  total_days: number;
}

export const calculateTrip = async (tripData: FormData): Promise<TripData> => {
  try {
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

export const getTrips = async (): Promise<any> => {
  try {
    const response = await api.get("/trips/");
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to fetch HOS limits");
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


export default api;
