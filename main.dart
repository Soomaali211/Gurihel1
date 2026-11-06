import 'package:flutter/material.dart';

import 'app/router.dart';
import 'app/theme.dart';

void main() => runApp(const GuriHelApp());

class GuriHelApp extends StatelessWidget {
  const GuriHelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GuriHel',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      routerConfig: appRouter,
    );
  }
}
