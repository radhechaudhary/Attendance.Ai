import 'dart:io';
import 'package:dio/dio.dart';

import '../config/api_config.dart';
import '../models/models.dart';
import 'api_client.dart';
import 'auth_service.dart';

class ClassService {
  Dio get _dio => ApiClient.instance.dio;

  Future<ApiResult> addClass({
    required String subject,
    required String section,
    String? schedule,
  }) async {
    try {
      final res = await _dio.post(ApiConfig.addClass, data: {
        'subject': subject,
        'section': section,
        'schedule': schedule,
      });
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(success: ok, data: res.data);
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }

  Future<List<ClassModel>> fetchClasses() async {
    final res = await _dio.get(ApiConfig.fetchClassesList);
    if (res.statusCode == 200 && res.data['status'] == 'success') {
      return (res.data['classes'] as List)
          .map((e) => ClassModel.fromJson(e))
          .toList();
    }
    throw Exception('Failed to fetch classes');
  }

  Future<List<StudentModel>> getStudents(String classId) async {
    final res = await _dio.post(ApiConfig.getStudents, data: {'classId': classId});
    if (res.statusCode == 200 && res.data['status'] == 'success') {
      return (res.data['students'] as List)
          .map((e) => StudentModel.fromJson(e))
          .toList();
    }
    throw Exception('Failed to fetch students');
  }

  Future<List<StudentStats>> getClassStudentStats(String classId) async {
    final res = await _dio.post(ApiConfig.getClassStudentStats, data: {'classId': classId});
    if (res.statusCode == 200 && res.data['status'] == 'success') {
      return (res.data['students'] as List)
          .map((e) => StudentStats.fromJson(e))
          .toList();
    }
    throw Exception('Failed to fetch class stats');
  }

  /// Uploads up to 15 classroom photos; the Flask model matches faces
  /// against every enrolled student's stored embeddings and returns a
  /// present/confidence map. Mirrors class.controller.js#photoAttendance.
  Future<ApiResult> photoAttendance({
    required String classId,
    required List<File> photos,
  }) async {
    try {
      final formData = FormData.fromMap({
        'classId': classId,
        'photos': [
          for (final photo in photos)
            await MultipartFile.fromFile(photo.path, filename: photo.path.split('/').last),
        ],
      });
      final res = await _dio.post(ApiConfig.photoAttendance, data: formData);
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(success: ok, data: res.data, message: ok ? null : 'AI matching failed');
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }

  /// Manual roll-call fallback / correction after AI attendance.
  /// records: [{student_id, class_id, date (yyyy-MM-dd), status: Present|Absent}]
  Future<ApiResult> markAttendance(List<Map<String, dynamic>> records) async {
    try {
      final res = await _dio.post(ApiConfig.markAttendance, data: {
        'attendanceRecords': records,
      });
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(success: ok, data: res.data);
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }
}
