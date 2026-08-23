import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/class_provider.dart';

class AddClassSheet extends StatefulWidget {
  const AddClassSheet({super.key});

  @override
  State<AddClassSheet> createState() => _AddClassSheetState();
}

class _AddClassSheetState extends State<AddClassSheet> {
  final _formKey = GlobalKey<FormState>();
  final _subject = TextEditingController();
  final _section = TextEditingController();
  final _schedule = TextEditingController();
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('New class', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextFormField(
              controller: _subject,
              decoration: const InputDecoration(labelText: 'Subject (e.g. Data Structures)'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _section,
              decoration: const InputDecoration(labelText: 'Section (e.g. CSE-B)'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _schedule,
              decoration: const InputDecoration(labelText: 'Schedule (optional, e.g. Mon/Wed 10am)'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _saving ? null : _submit,
              child: _saving
                  ? const SizedBox(
                      height: 20, width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Create class'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final ok = await context.read<ClassProvider>().addClass(
          subject: _subject.text.trim(),
          section: _section.text.trim(),
          schedule: _schedule.text.trim().isEmpty ? null : _schedule.text.trim(),
        );
    setState(() => _saving = false);
    if (ok && mounted) Navigator.pop(context);
  }
}
