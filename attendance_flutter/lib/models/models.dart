class ClassModel {
  final String classId;
  final String subject;
  final String section;
  final int students;

  ClassModel({
    required this.classId,
    required this.subject,
    required this.section,
    required this.students,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) => ClassModel(
        classId: json['class_id'].toString(),
        subject: json['subject'] ?? '',
        section: json['section'] ?? '',
        students: json['students'] is int
            ? json['students']
            : int.tryParse(json['students'].toString()) ?? 0,
      );
}

class StudentModel {
  final String studentId;
  final String name;
  final String? rollNo;

  StudentModel({required this.studentId, required this.name, this.rollNo});

  factory StudentModel.fromJson(Map<String, dynamic> json) => StudentModel(
        studentId: json['student_id'].toString(),
        name: json['name'] ?? '',
        rollNo: json['roll_no']?.toString(),
      );
}

class StudentStats {
  final String studentId;
  final String name;
  final int presentCount;
  final int totalSessions;
  final double percentage;
  final List<String> recentAttendance;

  StudentStats({
    required this.studentId,
    required this.name,
    required this.presentCount,
    required this.totalSessions,
    required this.percentage,
    required this.recentAttendance,
  });

  factory StudentStats.fromJson(Map<String, dynamic> json) => StudentStats(
        studentId: json['student_id'].toString(),
        name: json['name'] ?? '',
        presentCount: json['present_count'] is int
            ? json['present_count']
            : int.tryParse(json['present_count'].toString()) ?? 0,
        totalSessions: json['total_sessions'] is int
            ? json['total_sessions']
            : int.tryParse(json['total_sessions'].toString()) ?? 0,
        percentage: double.tryParse(json['percentage'].toString()) ?? 0.0,
        recentAttendance: (json['recent_attendance'] as List? ?? [])
            .map((e) => e.toString())
            .toList(),
      );
}
