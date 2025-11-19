from django.contrib import admin
from .models import Trip, DailyLog, DutyStatus


class DutyStatusInline(admin.TabularInline):
    model = DutyStatus
    extra = 0


class DailyLogInline(admin.TabularInline):
    model = DailyLog
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = [
        'pickup_location', 'dropoff_location', 'current_cycle_used', 'total_days', 'created_at']
    list_filter = ['created_at']
    inlines = [DailyLogInline]


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = [
        'trip', 'log_date', 'day_number', 'total_miles', 'total_driving_hours']
    list_filter = ['log_date', 'trip']
    inlines = [DutyStatusInline]


@admin.register(DutyStatus)
class DutyStatusAdmin(admin.ModelAdmin):
    list_display = [
        'daily_log', 'status', 'start_time', 'end_time', 'location']
    list_filter = ['status', 'start_time']
