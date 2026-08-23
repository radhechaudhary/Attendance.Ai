import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../models/models.dart';
import '../../services/class_service.dart';
import '../../theme/app_theme.dart';

/// Flow:
/// 1. Teacher snaps 1-15 photos of the classroom (camera or gallery).
/// 2. Photos are sent to /classes/photoAttendance -> Flask model matches
///    faces against every enrolled student's stored embeddings.
/// 3. Result (studentId -> Present + confidence) is shown; teacher can
///    manually flip any student before saving with /classes/markAttendance.
class PhotoAttendanceScreen extends StatefulWidget {
  final ClassModel classModel;
  const PhotoAttendanceScreen({super.key, required this.classModel});

  @override
  State<PhotoAttendanceScreen> createState() => _PhotoAttendanceScreenState();
}

class _PhotoAttendanceScreenState extends State<PhotoAttendanceScreen> {
  final ClassService _classService = ClassService();
  final ImagePicker _picker = ImagePicker();

  final List<File> _photos = [];
  bool _matching = false;
  bool _saving = false;
  String? _error;

  Map<String, String> _status = {}; // studentId -> Present/Absent
  Map<String, double> _confidence = {};
  List<StudentModel> _allStudents = [];
  bool _loadedStudents = false;

  Future<void> _addPhoto(ImageSource source) async {
    final img = await _picker.pickImage(source: source, imageQuality: 85);
    if (img != null) setState(() => _photos.add(File(img.path)));
  }

  Future<void> _runAiAttendance() async {
    if (_photos.isEmpty) {
      setState(() => _error = 'Add at least one classroom photo first');
      return;
    }
    setState(() {
      _matching = true;
      _error = null;
    });

    // Load full roster so unmatched students default to Absent.
    if (!_loadedStudents) {
      try {
        _allStudents = await _classService.getStudents(widget.classModel.classId);
        _loadedStudents = true;
      } catch (_) {
        // non-fatal - stats screen already needs this to work
      }
    }

    final result = await _classService.photoAttendance(
      classId: widget.classModel.classId,
      photos: _photos,
    );

    setState(() => _matching = false);

    if (!result.success) {
      setState(() => _error = result.message ?? 'AI matching failed');
      return;
    }

    final attendance = result.data?['attendance'] ?? {};
    final Map<String, dynamic> statusRaw = Map<String, dynamic>.from(attendance['status'] ?? {});
    final Map<String, dynamic> confRaw = Map<String, dynamic>.from(attendance['confidence'] ?? {});

    final status = <String, String>{};
    final confidence = <String, double>{};

    for (final s in _allStudents) {
      status[s.studentId] = statusRaw.containsKey(s.studentId) ? 'Present' : 'Absent';
    }
    confRaw.forEach((k, v) => confidence[k] = double.tryParse(v.toString()) ?? 0);

    setState(() {
      _status = status;
      _confidence = confidence;
    });
  }

  Future<void> _saveAttendance() async {
    setState(() => _saving = true);
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final records = _status.entries
        .map((e) => {
              'student_id': e.key,
              'class_id': widget.classModel.classId,
              'date': today,
              'status': e.value,
            })
        .toList();

    final result = await _classService.markAttendance(records);
    setState(() => _saving = false);

    if (!mounted) return;
    if (result.success) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Attendance saved ✅')));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(result.message ?? 'Failed to save')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasResult = _status.isNotEmpty;
    final presentCount = _status.values.where((v) => v == 'Present').length;

    return Scaffold(
      appBar: AppBar(title: Text('Take attendance · ${widget.classModel.subject}')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (!hasResult) ...[
            const Text('1. Capture classroom photo(s)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 10, runSpacing: 10,
              children: [
                for (final p in _photos)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(p, width: 84, height: 84, fit: BoxFit.cover),
                  ),
                _AddPhotoButton(onTap: () => _addPhoto(ImageSource.camera)),
              ],
            ),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () => _addPhoto(ImageSource.gallery),
              icon: const Icon(Icons.photo_library_outlined),
              label: const Text('Add from gallery instead'),
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            ElevatedButton.icon(
              onPressed: _matching ? null : _runAiAttendance,
              icon: _matching
                  ? const SizedBox(height: 18, width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.auto_awesome),
              label: Text(_matching ? 'Matching faces…' : 'Run AI attendance'),
            ),
          ] else ...[
            Card(
              color: AppTheme.primary.withOpacity(0.06),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '$presentCount of ${_status.length} students marked present. '
                  'Tap any student below to correct it before saving.',
                ),
              ),
            ),
            const SizedBox(height: 12),
            for (final s in _allStudents) _ResultTile(
              student: s,
              status: _status[s.studentId] ?? 'Absent',
              confidence: _confidence[s.studentId],
              onToggle: () {
                setState(() {
                  _status[s.studentId] = _status[s.studentId] == 'Present' ? 'Absent' : 'Present';
                });
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _saving ? null : _saveAttendance,
              icon: _saving
                  ? const SizedBox(height: 18, width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.save_outlined),
              label: Text(_saving ? 'Saving…' : 'Save attendance'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => setState(() {
                _status = {};
                _confidence = {};
                _photos.clear();
              }),
              child: const Text('Retake photos'),
            ),
          ],
        ],
      ),
    );
  }
}

class _AddPhotoButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddPhotoButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 84, height: 84,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.add_a_photo_outlined, color: Colors.black45),
      ),
    );
  }
}

class _ResultTile extends StatelessWidget {
  final StudentModel student;
  final String status;
  final double? confidence;
  final VoidCallback onToggle;

  const _ResultTile({
    required this.student,
    required this.status,
    required this.confidence,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final present = status == 'Present';
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: (present ? Colors.green : Colors.red).withOpacity(0.12),
          child: Icon(present ? Icons.check : Icons.close, color: present ? Colors.green : Colors.red),
        ),
        title: Text(student.name),
        subtitle: confidence != null ? Text('Match confidence ${confidence!.toStringAsFixed(1)}%') : null,
        trailing: Switch(value: present, onChanged: (_) => onToggle(), activeColor: AppTheme.primary),
        onTap: onToggle,
      ),
    );
  }
}
