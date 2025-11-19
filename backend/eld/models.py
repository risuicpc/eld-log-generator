from django.db import models


class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.DecimalField(
        max_digits=5, decimal_places=2, default=0)

    # Calculated fields
    total_distance = models.DecimalField(
        max_digits=8, decimal_places=2, default=0)
    estimated_duration = models.DecimalField(
        max_digits=6, decimal_places=2, default=0)
    total_days = models.IntegerField(default=1)

    # Route data
    route_geometry = models.JSONField(null=True, blank=True)
    route_summary = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip from {self.pickup_location} to {self.dropoff_location}"


class DailyLog(models.Model):
    trip = models.ForeignKey(
        Trip, related_name='daily_logs', on_delete=models.CASCADE)
    log_date = models.DateField()
    day_number = models.IntegerField(default=1)

    # Log header information
    total_miles = models.IntegerField(default=0)
    driver_name = models.CharField(max_length=255, default='John Doe')
    carrier_name = models.CharField(max_length=255, default='ABC Trucking')
    vehicle_number = models.CharField(max_length=50, default='TRK-001')
    cycle_used = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Calculated totals
    total_driving_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=0)
    total_on_duty_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=0)
    total_off_duty_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['trip', 'day_number']

    def __str__(self):
        return f"Log {self.day_number} - {self.log_date}"


class DutyStatus(models.Model):
    STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]

    daily_log = models.ForeignKey(
        DailyLog, related_name='duty_statuses', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=0)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # For grid display
    grid_start_hour = models.IntegerField(default=0)
    grid_end_hour = models.IntegerField(default=0)

    class Meta:
        ordering = ['start_time']

    def save(self, *args, **kwargs):
        # Calculate duration
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            self.duration_hours = round(duration.total_seconds() / 3600, 2)

        # Calculate grid hours
        self.grid_start_hour = self.start_time.hour
        self.grid_end_hour = self.end_time.hour

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.status} at {self.location}"
