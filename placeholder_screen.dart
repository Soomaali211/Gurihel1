import 'package:flutter/material.dart';

/// Shaashad ku-meel-gaar ah ilaa qayb kasta la dhiso.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({super.key, required this.title, required this.workPackage});

  final String title;
  final String workPackage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.construction, size: 48),
              const SizedBox(height: 12),
              Text('Ku soo socota', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 4),
              Text(workPackage, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
