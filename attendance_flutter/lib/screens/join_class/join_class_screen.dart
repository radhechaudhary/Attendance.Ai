import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';

/// Student self-enrollment: takes left/right/centre face shots which the
/// Flask model turns into embeddings for future photo-attendance matching.
/// Mirrors POST /user/join_class (multipart: left, right, centre, name,
/// email, classCode).
class JoinClassScreen extends StatefulWidget {
  const JoinClassScreen({super.key});

  @override
  State<JoinClassScreen> createState() => _JoinClassScreenState();
}

class _JoinClassScreenState extends State<JoinClassScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _picker = ImagePicker();
  final _authService = AuthService();

  File? _left, _right, _centre;
  bool _submitting = false;
  String? _error;

  Future<void> _capture(String which) async {
    final img = await _picker.pickImage(source: ImageSource.camera, preferredCameraDevice: CameraDevice.front, imageQuality: 90);
    if (img == null) return;
    setState(() {
      if (which == 'left') _left = File(img.path);
      if (which == 'right') _right = File(img.path);
      if (which == 'centre') _centre = File(img.path);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_left == null || _right == null || _centre == null) {
      setState(() => _error = 'Capture all three face angles first');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });

    final result = await _authService.joinClass(
      name: _name.text.trim(),
      email: _email.text.trim(),
      classCode: _code.text.trim(),
      left: _left!,
      right: _right!,
      centre: _centre!,
    );

    setState(() => _submitting = false);

    if (!mounted) return;
    if (result.success) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('You\'re enrolled! 🎉'),
          content: const Text('Your face has been registered for this class. '
              'Your teacher can now mark you present automatically via photo attendance.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Done'),
            ),
          ],
        ),
      );
    } else {
      setState(() => _error = result.message ?? 'Could not join class');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join a class')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Your full name'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Your email'),
                validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _code,
                decoration: const InputDecoration(labelText: 'Class join code'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 24),
              const Text('Face enrollment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 4),
              const Text('For best accuracy, take 3 clear, well-lit, close-up shots.',
                  style: TextStyle(color: Colors.black54, fontSize: 13)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _FaceShot(label: 'Left', file: _left, onTap: () => _capture('left')),
                  _FaceShot(label: 'Centre', file: _centre, onTap: () => _capture('centre')),
                  _FaceShot(label: 'Right', file: _right, onTap: () => _capture('right')),
                ],
              ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const SizedBox(height: 20, width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Join class'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FaceShot extends StatelessWidget {
  final String label;
  final File? file;
  final VoidCallback onTap;
  const _FaceShot({required this.label, required this.file, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(50),
          child: CircleAvatar(
            radius: 44,
            backgroundColor: AppTheme.primary.withOpacity(0.08),
            backgroundImage: file != null ? FileImage(file!) : null,
            child: file == null ? const Icon(Icons.camera_alt_outlined, color: AppTheme.primary) : null,
          ),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
