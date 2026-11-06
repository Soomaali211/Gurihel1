import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/shell/app_shell.dart';
import '../features/shell/placeholder_screen.dart';

/// 6 tab-ka hoose (isla sida app-ka sawirada): Profile · Listings · Projects · Bookings · Chat · Services.
class TabSpec {
  const TabSpec(this.path, this.label, this.icon, this.selectedIcon);
  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

const List<TabSpec> kTabs = [
  TabSpec('/profile', 'Profile', Icons.person_outline, Icons.person),
  TabSpec('/listings', 'Listings', Icons.map_outlined, Icons.map),
  TabSpec('/projects', 'Projects', Icons.apartment_outlined, Icons.apartment),
  TabSpec('/bookings', 'Bookings', Icons.calendar_month_outlined, Icons.calendar_month),
  TabSpec('/chat', 'Chat', Icons.chat_bubble_outline, Icons.chat_bubble),
  TabSpec('/services', 'Services', Icons.grid_view_outlined, Icons.grid_view),
];

/// Halka wax laga qabto shaashadaha dhabta ah (WP2–WP8) — hadda placeholder.
const Map<String, String> kTabWork = {
  '/profile': 'WP2 — Auth, Profile, KYC',
  '/listings': 'WP3 + WP4 — Map, filters, liis',
  '/projects': 'WP6 — Mashaariic',
  '/bookings': 'WP7 — Ballan + bixin',
  '/chat': 'WP5 — Chat',
  '/services': 'WP8 — Adeegyo',
};

final GlobalKey<NavigatorState> _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootKey,
  initialLocation: '/listings',
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => AppShell(navigationShell: navigationShell),
      branches: [
        for (final tab in kTabs)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: tab.path,
                builder: (context, state) => PlaceholderScreen(
                  title: tab.label,
                  workPackage: kTabWork[tab.path] ?? '',
                ),
              ),
            ],
          ),
      ],
    ),
  ],
);
