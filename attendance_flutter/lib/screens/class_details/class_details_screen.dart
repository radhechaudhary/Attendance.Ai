import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../models/models.dart';
import '../../services/class_service.dart';
import '../../theme/app_theme.dart';
import '../attendance/photo_attendance_screen.dart';

class ClassDetailsScreen extends StatefulWidget {
  final ClassModel classModel;
  const ClassDetailsScreen({super.key, required this.classModel});

  @override
  State<ClassDetailsScreen> createState() => _ClassDetailsScreenState();
}

class _ClassDetailsScreenState extends State<ClassDetailsScreen> {
  final ClassService _service = ClassService();
  late Future<List<StudentStats>> _statsFuture;

  @override
  void initState() {
    super.initState();
    _statsFuture = _service.getClassStudentStats(widget.classModel.classId);
  }

  void _refresh() {
    setState(() {
      _statsFuture = _service.getClassStudentStats(widget.classModel.classId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.classModel.subject),
        actions: [
          IconButton(
            tooltip: 'Class join code',
            icon: const Icon(Icons.qr_code_2_outlined),
            onPressed: () => _showJoinCode(context),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PhotoAttendanceScreen(classModel: widget.classModel),
            ),
          );
          _refresh();
        },
        icon: const Icon(Icons.camera_alt_outlined),
        label: const Text('Take attendance'),
      ),
      body: FutureBuilder<List<StudentStats>>(
        future: _statsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final students = snapshot.data ?? [];
          if (students.isEmpty) {
            return const Center(child: Text('No students enrolled yet.\nShare the join code from students.',
                textAlign: TextAlign.center));
          }

          final avg = students.isEmpty
              ? 0.0
              : students.map((s) => s.percentage).reduce((a, b) => a + b) / students.length;

          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Class average', style: TextStyle(color: Colors.black54)),
                            Text('${avg.toStringAsFixed(1)}%',
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 160,
                          child: BarChart(
                            BarChartData(
                              maxY: 100,
                              gridData: const FlGridData(show: false),
                              borderData: FlBorderData(show: false),
                              titlesData: FlTitlesData(
                                leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    getTitlesWidget: (value, meta) {
                                      final i = value.toInt();
                                      if (i < 0 || i >= students.length) return const SizedBox();
                                      final label = students[i].name.split(' ').first;
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 6),
                                        child: Text(label, style: const TextStyle(fontSize: 9)),
                                      );
                                    },
                                  ),
                                ),
                              ),
                              barGroups: [
                                for (int i = 0; i < students.length; i++)
                                  BarChartGroupData(x: i, barRods: [
                                    BarChartRodData(
                                      toY: students[i].percentage,
                                      color: students[i].percentage < 75
                                          ? Colors.redAccent
                                          : AppTheme.primary,
                                      width: 14,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ]),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text('Students', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                for (final s in students) _StudentTile(stats: s),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showJoinCode(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Class join code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Share this code with students so they can join from the app.'),
            const SizedBox(height: 16),
            SelectableText(
              widget.classModel.classId,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 2),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}

class _StudentTile extends StatelessWidget {
  final StudentStats stats;
  const _StudentTile({required this.stats});

  @override
  Widget build(BuildContext context) {
    final low = stats.percentage < 75;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: (low ? Colors.red : AppTheme.primary).withOpacity(0.12),
          child: Text(
            stats.name.isNotEmpty ? stats.name[0].toUpperCase() : '?',
            style: TextStyle(color: low ? Colors.red : AppTheme.primary, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(stats.name),
        subtitle: Text('${stats.presentCount}/${stats.totalSessions} sessions attended'),
        trailing: Text(
          '${stats.percentage.toStringAsFixed(0)}%',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: low ? Colors.red : Colors.green.shade700,
          ),
        ),
      ),
    );
  }
}
