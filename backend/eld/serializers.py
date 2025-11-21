from rest_framework import serializers
from .models import Trip, DailyLog, DutyStatus


class DutyStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyStatus
        fields = '__all__'


class DailyLogSerializer(serializers.ModelSerializer):
    duty_statuses = DutyStatusSerializer(many=True, read_only=True)

    class Meta:
        model = DailyLog
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    daily_logs = DailyLogSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'


class TripListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Trip
        fields = '__all__'


class TripCalculationSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_used = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=70)

    def validate_current_cycle_used(self, value):
        if value > 70:
            raise serializers.ValidationError(
                "Current cycle used cannot exceed 70 hours")
        return value


class RouteResponseSerializer(serializers.Serializer):
    distance = serializers.FloatField()
    duration = serializers.FloatField()
    fuel_stops = serializers.IntegerField()
    geometry = serializers.DictField()
    summary = serializers.DictField()


class DailyScheduleSerializer(serializers.Serializer):
    day_number = serializers.IntegerField()
    date = serializers.CharField()
    total_driving_hours = serializers.FloatField()
    total_on_duty_hours = serializers.FloatField()
    total_off_duty_hours = serializers.FloatField()
    breaks_needed = serializers.IntegerField()
    estimated_distance = serializers.FloatField()
    activities = serializers.ListField()
    hos_compliant = serializers.BooleanField()
    is_restart_day = serializers.BooleanField(required=False)


class TripCalculationResponseSerializer(serializers.Serializer):
    trip = TripSerializer()
    route = RouteResponseSerializer()
    daily_schedules = DailyScheduleSerializer(many=True)
    total_days = serializers.IntegerField()
    hos_compliance_check = serializers.DictField()
