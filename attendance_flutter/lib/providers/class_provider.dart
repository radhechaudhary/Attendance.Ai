import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/class_service.dart';

class ClassProvider extends ChangeNotifier {
  final ClassService _service = ClassService();

  List<ClassModel> classes = [];
  bool loading = false;
  String? error;

  Future<void> loadClasses() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      classes = await _service.fetchClasses();
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<bool> addClass({
    required String subject,
    required String section,
    String? schedule,
  }) async {
    final result = await _service.addClass(subject: subject, section: section, schedule: schedule);
    if (result.success) {
      await loadClasses();
      return true;
    }
    error = result.message;
    notifyListeners();
    return false;
  }
}
