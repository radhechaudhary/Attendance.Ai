import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';

import '../config/api_config.dart';

/// Wraps a single [Dio] instance shared across the app.
///
/// The backend authenticates via an httpOnly-ish cookie (`authToken`) set on
/// login/signup (see backend/controllers/login.controller.js). A native app
/// has no browser cookie jar, so we attach a [PersistCookieJar] to Dio via
/// [CookieManager] - this makes Dio behave exactly like a browser: it stores
/// the Set-Cookie response header and automatically replays it as the
/// Cookie request header on every subsequent call. No backend changes needed.
class ApiClient {
  ApiClient._internal();
  static final ApiClient instance = ApiClient._internal();

  late final Dio dio;
  PersistCookieJar? _cookieJar;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    final appDocDir = await getApplicationDocumentsDirectory();
    _cookieJar = PersistCookieJar(
      ignoreExpires: true,
      storage: FileStorage('${appDocDir.path}/.cookies/'),
    );
    dio.interceptors.add(CookieManager(_cookieJar!));

    _initialized = true;
  }

  Future<void> clearCookies() async {
    await _cookieJar?.deleteAll();
  }
}
