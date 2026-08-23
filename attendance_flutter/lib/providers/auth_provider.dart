import 'package:flutter/foundation.dart';

import '../services/auth_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus status = AuthStatus.unknown;
  String? name;
  String? email;
  String? collegeName;
  String? errorMessage;
  bool loading = false;

  Future<void> bootstrapCheckAuth() async {
    final result = await _authService.checkAuth();
    if (result.success) {
      name = result.data?['name'];
      email = result.data?['email'];
      collegeName = result.data?['collegeName'];
      status = AuthStatus.authenticated;
    } else {
      status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    loading = true;
    errorMessage = null;
    notifyListeners();

    final result = await _authService.login(email: email, password: password);
    loading = false;
    if (result.success) {
      this.email = result.data?['email'] ?? email;
      name = result.data?['name'];
      status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    }
    errorMessage = result.message;
    notifyListeners();
    return false;
  }

  Future<bool> signup({
    required String name,
    required String email,
    required String collegeName,
    required String password,
  }) async {
    loading = true;
    errorMessage = null;
    notifyListeners();

    final result = await _authService.signup(
      name: name,
      email: email,
      collegeName: collegeName,
      password: password,
    );
    loading = false;
    if (result.success) {
      this.name = name;
      this.email = email;
      this.collegeName = collegeName;
      status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    }
    errorMessage = result.message;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _authService.logout();
    status = AuthStatus.unauthenticated;
    name = null;
    email = null;
    collegeName = null;
    notifyListeners();
  }
}
