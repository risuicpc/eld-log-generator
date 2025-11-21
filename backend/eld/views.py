from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from datetime import datetime

from .models import Trip, DailyLog, DutyStatus
from .serializers import (
    TripSerializer,
    TripListSerializer,
    TripCalculationSerializer,
    TripCalculationResponseSerializer
)
from .routing import RouteCalculator
from .calculations import TripCalculator
from .hos_rules import HOSRules


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def get_serializer(self, *args, **kwargs):
        if self.action == 'list':
            return TripListSerializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate trip route and generate ELD logs"""
        serializer = TripCalculationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = serializer.validated_data

            # Calculate route
            route_calculator = RouteCalculator()
            route_data = route_calculator.calculate_route(
                start=data['current_location'],
                end=data['dropoff_location'],
                via=[data['pickup_location']]
            )

            if not route_data:
                return Response(
                    {'error': 'Could not calculate route'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate trip schedule
            trip_calculator = TripCalculator(
                current_cycle_used=float(data['current_cycle_used']))
            daily_schedules = trip_calculator.calculate_trip_schedule(
                total_duration_hours=route_data['duration'],
                total_distance_miles=route_data['distance']
            )

            # Create trip and logs in database
            with transaction.atomic():
                trip = Trip.objects.create(
                    current_location=data['current_location'],
                    pickup_location=data['pickup_location'],
                    dropoff_location=data['dropoff_location'],
                    current_cycle_used=data['current_cycle_used'],
                    total_distance=route_data['distance'],
                    estimated_duration=route_data['duration'],
                    total_days=len(daily_schedules),
                    route_geometry=route_data.get('geometry'),
                    route_summary=route_data.get('summary')
                )

                # Create daily logs and duty statuses
                for schedule in daily_schedules:
                    daily_log = DailyLog.objects.create(
                        trip=trip,
                        log_date=schedule['date'],
                        day_number=schedule['day_number'],
                        total_miles=int(schedule['estimated_distance']),
                        total_driving_hours=schedule['total_driving_hours'],
                        total_on_duty_hours=schedule['total_on_duty_hours'],
                        total_off_duty_hours=schedule['total_off_duty_hours'],
                        cycle_used=schedule['total_on_duty_hours']
                    )

                    # Create duty status activities
                    for activity in schedule['activities']:
                        DutyStatus.objects.create(
                            daily_log=daily_log,
                            status=activity['status'],
                            start_time=datetime.fromisoformat(
                                activity['start_time']),
                            end_time=datetime.fromisoformat(
                                activity['end_time']),
                            location=activity['location'],
                            description=activity['description'],
                            duration_hours=activity['duration_hours']
                        )

            # Prepare response
            hos_compliance_check = {
                'is_compliant': True,
                'total_days': len(daily_schedules),
                'total_driving_hours': sum(s['total_driving_hours'] for s in daily_schedules),
                'total_on_duty_hours': sum(s['total_on_duty_hours'] for s in daily_schedules),
                'cycle_used_end': float(data['current_cycle_used']) + sum(s['total_on_duty_hours'] for s in daily_schedules)
            }

            response_data = {
                'trip': TripSerializer(trip).data,
                'route': route_data,
                'daily_schedules': daily_schedules,
                'total_days': len(daily_schedules),
                'hos_compliance_check': hos_compliance_check
            }

            response_serializer = TripCalculationResponseSerializer(
                data=response_data)
            if response_serializer.is_valid():
                return Response(response_serializer.validated_data)
            else:
                return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response(
                {'error': f'Calculation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Get all logs for a specific trip"""
        trip = self.get_object()
        daily_logs = trip.daily_logs.all()

        logs_data = []
        for daily_log in daily_logs:
            log_data = {
                'id': daily_log.id,
                'log_date': daily_log.log_date,
                'day_number': daily_log.day_number,
                'total_miles': daily_log.total_miles,
                'driver_name': daily_log.driver_name,
                'carrier_name': daily_log.carrier_name,
                'vehicle_number': daily_log.vehicle_number,
                'cycle_used': float(daily_log.cycle_used),
                'total_driving_hours': float(daily_log.total_driving_hours),
                'total_on_duty_hours': float(daily_log.total_on_duty_hours),
                'total_off_duty_hours': float(daily_log.total_off_duty_hours),
                'activities': []
            }

            for duty_status in daily_log.duty_statuses.all():
                log_data['activities'].append({
                    'start_time': duty_status.start_time.isoformat(),
                    'end_time': duty_status.end_time.isoformat(),
                    'status': duty_status.status,
                    'location': duty_status.location,
                    'description': duty_status.description,
                    'duration_hours': float(duty_status.duration_hours)
                })

            logs_data.append(log_data)

        return Response({'daily_logs': logs_data})


class HOSRulesViewSet(viewsets.ViewSet):
    """ViewSet for HOS rules information"""

    @action(detail=False, methods=['get'])
    def limits(self, request):
        """Get HOS limits information"""
        rules = HOSRules()

        return Response({
            'property_carrying_limits': {
                'daily_driving_limit': rules.DAILY_DRIVING_LIMIT,
                'duty_window_limit': rules.DUTY_WINDOW_LIMIT,
                'cycle_limit_7_day': rules.CYCLE_LIMIT_7_DAY,
                'cycle_limit_8_day': rules.CYCLE_LIMIT_8_DAY,
                'min_break_duration': rules.MIN_BREAK_DURATION,
                'break_required_after': rules.BREAK_REQUIRED_AFTER,
                'min_off_duty': rules.MIN_OFF_DUTY,
                'restart_hours': rules.RESTART_HOURS
            }
        })

    @action(detail=False, methods=['post'])
    def check_compliance(self, request):
        """Check HOS compliance for given hours"""
        current_cycle_used = request.data.get('current_cycle_used', 0)
        additional_hours = request.data.get('additional_hours', 0)

        rules = HOSRules()

        return Response({
            'current_cycle_used': current_cycle_used,
            'additional_hours': additional_hours,
            'total_cycle_used': current_cycle_used + additional_hours,
            'is_driving_allowed': rules.is_driving_allowed(current_cycle_used, additional_hours),
            'available_driving_time': rules.calculate_available_driving_time(current_cycle_used),
            'needs_restart': rules.needs_restart(current_cycle_used),
            'cycle_limit': rules.CYCLE_LIMIT_8_DAY
        })
