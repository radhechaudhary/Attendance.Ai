# Attendance.Ai — Flutter (Android) client

A native Android client for the existing Attendance.Ai stack (Node/Express backend +
Flask/`face_recognition` model service). It talks to the **same REST API** your
React frontend already uses — no backend changes required.

## What's included
- Teacher signup / login (cookie-based JWT, same as the web app)
- Dashboard: list & create classes, see join code
- Class details: attendance % per student, low-attendance highlighted, bar chart
- **Take attendance**: snap classroom photo(s) → AI face-matching via
  `/classes/photoAttendance` → editable present/absent list → save
- **Join class** (student flow): capture left/right/centre face photos →
  `/user/join_class` → embeddings generated & stored

## 1. Turn this into a runnable Flutter project

This folder has `pubspec.yaml` + `lib/`, but not the native Android/iOS
scaffolding (that's machine-generated boilerplate, not meaningful to hand-write).
On your machine, with the Flutter SDK installed:

```bash
# from a new empty folder
flutter create attendance_ai_app
cd attendance_ai_app
# now copy this repo's pubspec.yaml and lib/ over the generated ones,
# overwriting the defaults
flutter pub get
```

## 2. Point it at your backend

Edit `lib/config/api_config.dart`, or pass at build/run time:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000   # Android emulator
flutter run --dart-define=API_BASE_URL=http://192.168.1.23:3000  # physical device, same Wi-Fi
```

## 3. Add Android permissions

In `android/app/src/main/AndroidManifest.xml`, add inside `<manifest>` (above `<application>`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

If targeting Android 13+/14 and using `image_picker`'s gallery source, also add:
```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## 4. Run it

```bash
flutter run
```

## Why cookies instead of a token header?

Your backend sets an `authToken` cookie on login/signup and reads it in
`verifyToken.middleware.js`. Rather than forking the backend auth, this app
uses `dio_cookie_manager` + `cookie_jar` so Dio behaves like a browser: it
stores the `Set-Cookie` response and replays it automatically. It's a fine
approach for a hackathon demo; see the "Add-on ideas" list for a
production-grade alternative (Bearer tokens in `Authorization` header +
`flutter_secure_storage`).
