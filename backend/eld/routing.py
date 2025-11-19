import math
import requests
from typing import Dict, List, Optional


class RouteCalculator:
    """Calculate routes using OpenRouteService API"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or "5b3ce3597851110001cf6248eac8e5c0b6f14a1297a432d92197c27a"  # Demo key
        self.base_url = "https://api.openrouteservice.org/v2/directions/driving-car"

    def calculate_route(self, start: str, end: str, via: List[str] = None) -> Optional[Dict]:
        """Calculate route between points"""
        try:
            coordinates = []

            # Add start point
            start_coords = self.geocode_location(start)
            if start_coords:
                coordinates.append(start_coords)

            # Add via points (pickup locations)
            if via:
                for location in via:
                    via_coords = self.geocode_location(location)
                    if via_coords:
                        coordinates.append(via_coords)

            # Add end point
            end_coords = self.geocode_location(end)
            if end_coords:
                coordinates.append(end_coords)

            if len(coordinates) < 2:
                return None

            # Make API request
            headers = {
                'Authorization': self.api_key,
                'Content-Type': 'application/json'
            }

            body = {
                "coordinates": coordinates,
                "instructions": True,
                "geometry": True
            }

            response = requests.post(
                f"{self.base_url}",
                json=body,
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                return self.parse_route_data(response.json())
            else:
                # Fallback to estimated calculation
                return self.estimate_route(coordinates)

        except Exception as e:
            print(f"Route calculation error: {e}")
            return self.estimate_route_from_addresses(start, end, via)

    def geocode_location(self, location: str) -> Optional[List[float]]:
        """Geocode location name to coordinates"""
        try:
            # Simple fallback coordinates for major cities
            city_coordinates = {
                'new york': [-74.0060, 40.7128],
                'chicago': [-87.6298, 41.8781],
                'los angeles': [-118.2437, 34.0522],
                'houston': [-95.3698, 29.7604],
                'phoenix': [-112.0740, 33.4484],
                'philadelphia': [-75.1652, 39.9526],
                'san antonio': [-98.4936, 29.4241],
                'san diego': [-117.1611, 32.7157],
                'dallas': [-96.7970, 32.7767],
                'san jose': [-121.8863, 37.3382],
            }

            location_lower = location.lower()
            for city, coords in city_coordinates.items():
                if city in location_lower:
                    return coords

            # Default to NYC if no match
            return [-74.0060, 40.7128]

        except Exception as e:
            print(f"Geocoding error for {location}: {e}")
            return [-74.0060, 40.7128]  # Default to NYC

    def estimate_route(self, coordinates: List[List[float]]) -> Dict:
        """Estimate route when API fails"""
        # Calculate distance using Haversine formula
        total_distance = 0
        for i in range(len(coordinates) - 1):
            lat1, lon1 = coordinates[i][1], coordinates[i][0]
            lat2, lon2 = coordinates[i+1][1], coordinates[i+1][0]
            total_distance += self.haversine_distance(lat1, lon1, lat2, lon2)

        # Estimate duration (assuming 50 mph average)
        estimated_duration = total_distance / 50  # hours
        fuel_stops = math.ceil(total_distance / 500)  # fuel every 500 miles

        return {
            'distance': total_distance,
            'duration': estimated_duration,
            'fuel_stops': fuel_stops,
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            },
            'summary': {
                'total_distance': round(total_distance, 2),
                'total_duration': round(estimated_duration, 2),
                'average_speed': 50
            }
        }

    def estimate_route_from_addresses(self, start: str, end: str, via: List[str] = None) -> Dict:
        """Estimate route from addresses only"""
        # Simple distance estimation based on typical city distances
        distance_estimates = {
            ('new york', 'chicago'): 790,
            ('new york', 'los angeles'): 2800,
            ('chicago', 'los angeles'): 2010,
            ('new york', 'philadelphia'): 95,
            ('chicago', 'dallas'): 967,
        }

        start_key = self.extract_city(start).lower()
        end_key = self.extract_city(end).lower()

        # Look for exact match or partial match
        distance = 500  # default distance
        for (city1, city2), dist in distance_estimates.items():
            if (start_key in city1 and end_key in city2) or (start_key in city2 and end_key in city1):
                distance = dist
                break

        estimated_duration = distance / 50  # hours
        fuel_stops = math.ceil(distance / 500)

        return {
            'distance': distance,
            'duration': estimated_duration,
            'fuel_stops': fuel_stops,
            'geometry': {
                'type': 'LineString',
                # Default coordinates
                'coordinates': [[-74.0060, 40.7128], [-118.2437, 34.0522]]
            },
            'summary': {
                'total_distance': distance,
                'total_duration': round(estimated_duration, 2),
                'average_speed': 50
            }
        }

    def extract_city(self, address: str) -> str:
        """Extract city name from address string"""
        parts = address.split(',')
        if len(parts) > 1:
            return parts[0].strip()
        return address.strip()

    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance between two points"""
        R = 6371  # Earth radius in kilometers

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon/2) * math.sin(delta_lon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        distance_km = R * c
        distance_miles = distance_km * 0.621371

        return distance_miles

    def parse_route_data(self, data: Dict) -> Dict:
        """Parse OpenRouteService response"""
        if not data or 'features' not in data or not data['features']:
            return None

        feature = data['features'][0]
        properties = feature['properties']
        geometry = feature['geometry']

        summary = properties.get('summary', {})
        distance_km = summary.get('distance', 0) / 1000  # meters to km
        duration_hours = summary.get('duration', 0) / 3600  # seconds to hours

        distance_miles = distance_km * 0.621371
        fuel_stops = math.ceil(distance_miles / 500)  # fuel every 500 miles

        return {
            'distance': round(distance_miles, 2),
            'duration': round(duration_hours, 2),
            'fuel_stops': fuel_stops,
            'geometry': geometry,
            'summary': {
                'total_distance': round(distance_miles, 2),
                'total_duration': round(duration_hours, 2),
                'average_speed': round(distance_miles / duration_hours, 2) if duration_hours > 0 else 50
            }
        }
