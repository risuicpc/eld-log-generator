import math
from datetime import datetime, timedelta
from .hos_rules import HOSRules


class TripCalculator:
    def __init__(self, current_cycle_used=0):
        self.current_cycle_used = current_cycle_used
        self.hos_rules = HOSRules()

    def calculate_trip_schedule(self, total_duration_hours: float, total_distance_miles: float):
        """Calculate complete trip schedule with HOS compliance"""
        days_needed = self.calculate_days_needed(total_duration_hours)
        daily_schedules = []

        remaining_duration = total_duration_hours
        remaining_distance = total_distance_miles
        current_cycle = self.current_cycle_used
        current_date = datetime.now()

        for day in range(days_needed):
            if remaining_duration <= 0:
                break

            # Check if restart is needed
            if self.hos_rules.needs_restart(current_cycle):
                restart_day = self.create_restart_day(current_date)
                daily_schedules.append(restart_day)
                current_cycle = 0
                current_date += timedelta(days=1)
                continue

            # Calculate available driving time for the day
            available_driving = min(
                self.hos_rules.DAILY_DRIVING_LIMIT,
                self.hos_rules.calculate_available_driving_time(current_cycle)
            )

            if available_driving <= 0:
                # Need 34-hour restart
                restart_day = self.create_restart_day(current_date)
                daily_schedules.append(restart_day)
                current_cycle = 0
                current_date += timedelta(days=1)
                available_driving = self.hos_rules.DAILY_DRIVING_LIMIT

            # Calculate day's driving and activities
            day_driving = min(available_driving, remaining_duration)
            day_distance = (day_driving / total_duration_hours) * \
                total_distance_miles

            day_schedule = self.create_daily_schedule(
                day_number=len(daily_schedules) + 1,
                date=current_date,
                driving_hours=day_driving,
                distance=day_distance,
                has_pickup_dropoff=(day == 0 or day == days_needed - 1)
            )

            daily_schedules.append(day_schedule)

            # Update remaining values
            remaining_duration -= day_driving
            remaining_distance -= day_distance
            current_cycle += day_schedule['total_on_duty_hours']
            current_date += timedelta(days=1)

        return daily_schedules

    def calculate_days_needed(self, total_duration_hours: float) -> int:
        """Calculate number of days needed for trip considering HOS limits"""
        if self.hos_rules.needs_restart(self.current_cycle_used):
            # Need restart day plus driving days
            restart_days = 2  # 34-hour restart spans 2 calendar days
            available_after_restart = self.hos_rules.DAILY_DRIVING_LIMIT
            driving_days = math.ceil(
                total_duration_hours / available_after_restart)
            return restart_days + driving_days

        effective_daily_hours = min(
            self.hos_rules.DAILY_DRIVING_LIMIT,
            self.hos_rules.calculate_available_driving_time(
                self.current_cycle_used)
        )

        if effective_daily_hours <= 0:
            # Need restart day first
            return 1 + math.ceil(total_duration_hours / self.hos_rules.DAILY_DRIVING_LIMIT)

        days = math.ceil(total_duration_hours / effective_daily_hours)

        # Check if we need restart during trip
        total_cycle_used = self.current_cycle_used + total_duration_hours
        if total_cycle_used > self.hos_rules.CYCLE_LIMIT_8_DAY:
            restart_days = 2
            return days + restart_days

        return days

    def create_daily_schedule(self, day_number: int, date: datetime, driving_hours: float,
                              distance: float, has_pickup_dropoff: bool = False):
        """Create detailed schedule for a single day"""
        breaks_needed = self.hos_rules.calculate_breaks_needed(driving_hours)

        # Calculate total on-duty time (driving + breaks + pickup/dropoff)
        total_on_duty = driving_hours + (breaks_needed * 0.5)
        if has_pickup_dropoff:
            total_on_duty += 2  # 1 hour pickup + 1 hour dropoff

        schedule = {
            'day_number': day_number,
            'date': date.strftime('%Y-%m-%d'),
            'total_driving_hours': round(driving_hours, 2),
            'total_on_duty_hours': round(total_on_duty, 2),
            'total_off_duty_hours': 24 - total_on_duty,
            'breaks_needed': breaks_needed,
            'estimated_distance': round(distance, 2),
            'activities': [],
            'hos_compliant': True
        }

        # Create timeline starting at 6:00 AM
        current_time = date.replace(hour=6, minute=0, second=0, microsecond=0)

        # Pre-trip inspection (15 minutes)
        schedule['activities'].append({
            'start_time': current_time.isoformat(),
            'end_time': (current_time + timedelta(minutes=15)).isoformat(),
            'status': 'on_duty',
            'description': 'Pre-trip inspection and vehicle check',
            'location': 'Terminal/Start Location',
            'duration_hours': 0.25
        })
        current_time += timedelta(minutes=15)

        # Pickup time if applicable (1 hour)
        if has_pickup_dropoff and day_number == 1:
            schedule['activities'].append({
                'start_time': current_time.isoformat(),
                'end_time': (current_time + timedelta(hours=1)).isoformat(),
                'status': 'on_duty',
                'description': 'Loading and paperwork at pickup location',
                'location': 'Pickup Location',
                'duration_hours': 1.0
            })
            current_time += timedelta(hours=1)

        # Driving segments with breaks
        driving_segments = self.split_driving_time(
            driving_hours, breaks_needed)

        for i, segment in enumerate(driving_segments):
            # Driving segment
            segment_end = current_time + timedelta(hours=segment)
            schedule['activities'].append({
                'start_time': current_time.isoformat(),
                'end_time': segment_end.isoformat(),
                'status': 'driving',
                'description': f'Driving segment {i+1}',
                'location': f'Route - approx {i * 200} miles',
                'duration_hours': round(segment, 2)
            })
            current_time = segment_end

            # Break if needed (except after last segment)
            if i < len(driving_segments) - 1:
                break_end = current_time + timedelta(minutes=30)
                schedule['activities'].append({
                    'start_time': current_time.isoformat(),
                    'end_time': break_end.isoformat(),
                    'status': 'off_duty',
                    'description': '30-minute break as required by HOS',
                    'location': 'Rest area/truck stop',
                    'duration_hours': 0.5
                })
                current_time = break_end

        # Dropoff time if applicable (1 hour)
        # Last day
        if has_pickup_dropoff and driving_hours == driving_segments[-1]:
            schedule['activities'].append({
                'start_time': current_time.isoformat(),
                'end_time': (current_time + timedelta(hours=1)).isoformat(),
                'status': 'on_duty',
                'description': 'Unloading and paperwork at destination',
                'location': 'Dropoff Location',
                'duration_hours': 1.0
            })
            current_time += timedelta(hours=1)

        # Post-trip inspection (15 minutes)
        schedule['activities'].append({
            'start_time': current_time.isoformat(),
            'end_time': (current_time + timedelta(minutes=15)).isoformat(),
            'status': 'on_duty',
            'description': 'Post-trip inspection and documentation',
            'location': 'Destination/Terminal',
            'duration_hours': 0.25
        })
        current_time += timedelta(minutes=15)

        # Off-duty period (minimum 10 hours)
        off_duty_start = current_time
        off_duty_end = off_duty_start + timedelta(hours=10)

        # If off-duty would go past midnight, adjust to next day
        if off_duty_end.day != date.day:
            off_duty_end = date.replace(
                hour=23, minute=59, second=59) + timedelta(seconds=1)

        schedule['activities'].append({
            'start_time': off_duty_start.isoformat(),
            'end_time': off_duty_end.isoformat(),
            'status': 'off_duty',
            'description': '10-hour off-duty period as required by HOS',
            'location': 'Hotel/rest area',
            'duration_hours': 10.0
        })

        return schedule

    def split_driving_time(self, total_driving: float, breaks_needed: int):
        """Split driving time into segments with breaks"""
        if breaks_needed == 0:
            return [total_driving]

        # Try to make segments as equal as possible
        base_segment = total_driving / (breaks_needed + 1)
        segments = [base_segment] * (breaks_needed + 1)

        # Adjust for rounding
        total = sum(segments)
        if total != total_driving:
            segments[-1] += total_driving - total

        return [round(seg, 2) for seg in segments]

    def create_restart_day(self, date: datetime):
        """Create schedule for 34-hour restart day"""
        return {
            'day_number': 0,
            'date': date.strftime('%Y-%m-%d'),
            'total_driving_hours': 0,
            'total_on_duty_hours': 0,
            'total_off_duty_hours': 24,
            'breaks_needed': 0,
            'estimated_distance': 0,
            'activities': [{
                'start_time': date.replace(hour=0, minute=0, second=0).isoformat(),
                'end_time': (date + timedelta(hours=34)).isoformat(),
                'status': 'off_duty',
                'description': '34-hour restart period to reset 70-hour cycle',
                'location': 'Home terminal/rest area',
                'duration_hours': 34.0
            }],
            'hos_compliant': True,
            'is_restart_day': True
        }
