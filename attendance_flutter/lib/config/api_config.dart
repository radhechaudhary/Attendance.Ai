/// Central place for backend URLs.
///
/// The Node/Express backend (from `backend/app.js`) listens on port 3000
/// and exposes `/user/*` and `/classes/*`.
///
/// IMPORTANT (Android emulator vs real device):
/// - Android emulator -> host machine is reachable at 10.0.2.2
/// - Physical device on same Wi-Fi -> use your machine's LAN IP, e.g. 192.168.1.23
/// - Deployed backend -> use its public https URL
///
/// Change [baseUrl] below to match your setup, or wire it to a settings
/// screen / --dart-define if you want it configurable at build time.
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  // user/auth routes
  static const String teacherSignup = '/user/teacher-signup';
  static const String teacherLogin = '/user/teacher-login';
  static const String auth = '/user/auth';
  static const String joinClass = '/user/join_class';
  static const String logout = '/user/logout';

  // class routes
  static const String addClass = '/classes/addClass';
  static const String fetchClassesList = '/classes/fetchClassesList';
  static const String getStudents = '/classes/getStudents';
  static const String photoAttendance = '/classes/photoAttendance';
  static const String markAttendance = '/classes/markAttendance';
  static const String getClassStudentStats = '/classes/getClassStudentStats';
}
