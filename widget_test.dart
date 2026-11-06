import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

import 'package:gurihel/main.dart';

void main() {
  testWidgets('6 tab ayaa muuqda oo Listings ayaa ugu horreeya', (tester) async {
    await tester.pumpWidget(const GuriHelApp());
    await tester.pumpAndSettle();

    for (final label in ['Profile', 'Listings', 'Projects', 'Bookings', 'Chat', 'Services']) {
      expect(find.text(label), findsWidgets);
    }
    // Bilowga: Listings (AppBar-ka)
    expect(find.descendant(of: find.byType(AppBar), matching: find.text('Listings')), findsOneWidget);
  });

  testWidgets('taabashada Chat waxay furtaa shaashadda Chat', (tester) async {
    await tester.pumpWidget(const GuriHelApp());
    await tester.pumpAndSettle();

    await tester.tap(find.descendant(of: find.byType(NavigationBar), matching: find.text('Chat')));
    await tester.pumpAndSettle();

    expect(find.descendant(of: find.byType(AppBar), matching: find.text('Chat')), findsOneWidget);
  });
}
