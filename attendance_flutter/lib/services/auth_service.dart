import 'dart:io';
import 'package:dio/dio.dart';

import '../config/api_config.dart';
import 'api_client.dart';

class ApiResult {
  final bool success;
  final String? message;
  final Map<String, dynamic>? data;
  ApiResult({required this.success, this.message, this.data});
}

class AuthService {
  Dio get _dio => ApiClient.instance.dio;

  Future<ApiResult> signup({
    required String name,
    required String email,
    required String collegeName,
    required String password,
  }) async {
    try {
      final res = await _dio.post(ApiConfig.teacherSignup, data: {
        'name': name,
        'email': email,
        'collegeName': collegeName,
        'password': password,
      });
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(success: ok, data: res.data, message: ok ? null : 'Signup failed');
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }

  Future<ApiResult> login({required String email, required String password}) async {
    try {
      final res = await _dio.post(ApiConfig.teacherLogin, data: {
        'email': email,
        'password': password,
      });
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(
        success: ok,
        data: res.data,
        message: ok ? null : (res.data['message'] ?? 'Login failed'),
      );
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }

  /// Checks the current cookie against the backend. Used on app startup to
  /// decide whether to route to Dashboard or Login.
  Future<ApiResult> checkAuth() async {
    try {
      final res = await _dio.post(ApiConfig.auth);
      final ok = res.statusCode == 200 && res.data['status'] != 'error';
      return ApiResult(success: ok, data: res.data);
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConfig.logout);
    } catch (_) {
      // ignore network errors on logout
    }
    await ApiClient.instance.clearCookies();
  }

  /// Student self-enrollment: 3 face photos (left / right / centre) get
  /// turned into face embeddings by the Flask model service and stored
  /// against the class. Matches backend/controllers/join_class.controller.js
  Future<ApiResult> joinClass({
    required String name,
    required String email,
    required String classCode,
    required File left,
    required File right,
    required File centre,
  }) async {
    try {
      final formData = FormData.fromMap({
        'name': name,
        'email': email,
        'classCode': classCode,
        'left': await MultipartFile.fromFile(left.path, filename: 'left.jpg'),
        'right': await MultipartFile.fromFile(right.path, filename: 'right.jpg'),
        'centre': await MultipartFile.fromFile(centre.path, filename: 'centre.jpg'),
      });
      final res = await _dio.post(ApiConfig.joinClass, data: formData);
      final ok = res.statusCode == 200 && res.data['status'] == 'success';
      return ApiResult(
        success: ok,
        data: res.data,
        message: ok ? null : (res.data['error'] ?? 'Could not join class'),
      );
    } catch (e) {
      return ApiResult(success: false, message: e.toString());
    }
  }
}
