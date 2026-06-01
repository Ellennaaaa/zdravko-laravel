<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\Api\TherapyController;
use App\Http\Controllers\Api\TherapyLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmergencyContactController;
use App\Http\Controllers\Api\EmergencyContactInvitationController;
use App\Http\Controllers\Api\ContactDashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SmartGlucometerController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/measurements', [MeasurementController::class, 'index']);
    Route::get('/measurements/{id}', [MeasurementController::class, 'show']);
    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::put('/measurements/{id}', [MeasurementController::class, 'update']);
    Route::delete('/measurements/{id}', [MeasurementController::class, 'destroy']);

    Route::get('/therapies', [TherapyController::class, 'index']);
    Route::post('/therapies', [TherapyController::class, 'store']);
    Route::put('/therapies/{id}', [TherapyController::class, 'update']);
    Route::delete('/therapies/{id}', [TherapyController::class, 'destroy']);

    Route::get('/therapy-logs', [TherapyLogController::class, 'index']);
    Route::post('/therapy-logs', [TherapyLogController::class, 'store']);
    Route::delete('/therapy-logs/{id}', [TherapyLogController::class, 'destroy']);

    Route::get('/dashboard/blood-glucose/weekly', [DashboardController::class, 'weeklyGlucose']);
    Route::get('/dashboard/blood-glucose/monthly', [DashboardController::class, 'monthlyGlucose']);

    Route::get('/dashboard/therapy/weekly', [DashboardController::class, 'weeklyTherapy']);
    Route::get('/dashboard/therapy/monthly', [DashboardController::class, 'monthlyTherapy']);

    Route::get('/emergency-contact-invitations', [EmergencyContactInvitationController::class, 'index']);
    Route::post('/emergency-contact-invitations', [EmergencyContactInvitationController::class, 'store']);

    Route::get('/emergency-contacts', [EmergencyContactController::class, 'index']);
    Route::delete('/emergency-contacts/{id}', [EmergencyContactController::class, 'destroy']);

    Route::get('/contact/patients', [ContactDashboardController::class, 'patients']);
    Route::get('/contact/dashboard/{patientId}', [ContactDashboardController::class, 'dashboard']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/smart-glucometers', [SmartGlucometerController::class, 'index']);
    Route::post('/smart-glucometers', [SmartGlucometerController::class, 'store']);
    Route::delete('/smart-glucometers/{id}', [SmartGlucometerController::class, 'destroy']);

    Route::post('/sos', [SosController::class, 'send']);
});

Route::post('/contact-invitations/accept', [EmergencyContactInvitationController::class, 'accept']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/measurements', [AdminController::class, 'measurements']);
    Route::get('/admin/smart-glucometers', [AdminController::class, 'smartGlucometers']);
});
