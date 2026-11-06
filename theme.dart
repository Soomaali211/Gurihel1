import 'package:flutter/material.dart';

/// Design tokens (waafaqsan Blueprint qaybta 8).
class AppColors {
  static const Color primary = Color(0xFF0B7A3E);
  static const Color deep = Color(0xFF0F3D2A);
  static const Color accent = Color(0xFFF5B800);
  static const Color info = Color(0xFF1F6FD0);
  static const Color danger = Color(0xFFD64545);
  static const Color surface = Color(0xFFEEF2F0);
  static const Color border = Color(0xFFC9D2CD);
  static const Color text = Color(0xFF18211C);
}

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(seedColor: AppColors.primary).copyWith(
    primary: AppColors.primary,
    secondary: AppColors.accent,
    error: AppColors.danger,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.surface,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.deep,
      foregroundColor: Colors.white,
    ),
    navigationBarTheme: const NavigationBarThemeData(
      labelTextStyle: WidgetStatePropertyAll(TextStyle(fontSize: 11)),
    ),
  );
}
