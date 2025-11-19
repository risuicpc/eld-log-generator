"""
FMCSA Hours of Service Regulations Implementation
Based on 49 CFR Part 395 - Property Carrying Vehicles
"""


class HOSRules:
    # Property-carrying vehicle limits (70-hour/8-day rule)
    DAILY_DRIVING_LIMIT = 11  # hours
    DUTY_WINDOW_LIMIT = 14    # hours
    CYCLE_LIMIT_7_DAY = 60    # hours
    CYCLE_LIMIT_8_DAY = 70    # hours
    MIN_BREAK_DURATION = 0.5  # 30 minutes
    BREAK_REQUIRED_AFTER = 8  # hours of driving
    MIN_OFF_DUTY = 10         # consecutive hours
    RESTART_HOURS = 34        # hours for reset

    @classmethod
    def calculate_breaks_needed(cls, driving_hours):
        """Calculate required 30-minute breaks based on driving hours"""
        if driving_hours <= cls.BREAK_REQUIRED_AFTER:
            return 0
        return int(driving_hours // cls.BREAK_REQUIRED_AFTER)

    @classmethod
    def is_driving_allowed(cls, current_cycle_used, additional_hours=0):
        """Check if driving is allowed within 70-hour/8-day limit"""
        return current_cycle_used + additional_hours <= cls.CYCLE_LIMIT_8_DAY

    @classmethod
    def calculate_available_driving_time(cls, current_cycle_used):
        """Calculate remaining driving time in current cycle"""
        return max(0, cls.CYCLE_LIMIT_8_DAY - current_cycle_used)

    @classmethod
    def needs_restart(cls, current_cycle_used):
        """Check if 34-hour restart is needed"""
        return current_cycle_used >= cls.CYCLE_LIMIT_8_DAY

    @classmethod
    def validate_daily_schedule(cls, activities):
        """Validate that daily schedule complies with HOS rules"""
        total_driving = 0
        total_on_duty = 0
        driving_start_time = None

        for activity in activities:
            if activity['status'] == 'driving':
                total_driving += activity['duration_hours']
                if driving_start_time is None:
                    driving_start_time = activity['start_time']

            if activity['status'] in ['driving', 'on_duty']:
                total_on_duty += activity['duration_hours']

        # Check daily limits
        violations = []
        if total_driving > cls.DAILY_DRIVING_LIMIT:
            violations.append(
                f"Daily driving limit exceeded: {total_driving}h > {cls.DAILY_DRIVING_LIMIT}h")

        if total_on_duty > cls.DUTY_WINDOW_LIMIT:
            violations.append(
                f"Duty window exceeded: {total_on_duty}h > {cls.DUTY_WINDOW_LIMIT}h")

        return violations
