# GuriHel Mobile (Flutter) — skeleton

> **Xaalad:** koodhka `lib/` iyo `test/` waa la qoray, laakiin **lama orodsiin** (Flutter SDK ma jirin deegaanka ay ku dhismeen). Orod `flutter analyze` iyo `flutter test` marka hore.

## Bilow (mar keliya)

```bash
cd apps/mobile
# 1) Abuur folders-ka Android/iOS (kuma beddelayo lib/ iyo pubspec.yaml jira)
flutter create . --org so.gurihel --project-name gurihel --platforms=android,ios
# 2) Xirmooyinka
flutter pub get
# 3) Hubi
flutter analyze && flutter test
# 4) Orod
flutter run
```

Haddii `flutter create` beddelo `test/widget_test.dart`, ku celi faylka repo-ga (`git checkout test/widget_test.dart`).

## Waxa hadda jira

- Theme (Material 3, midabada Blueprint)
- `go_router` + `StatefulShellRoute.indexedStack` — 6 tab: Profile · Listings · Projects · Bookings · Chat · Services
- Shaashado placeholder ah (tab kasta wuxuu muujiyaa qaybta WP ee dhisaysa)

## Xiga

WP1 (design tokens → component library), WP2 (auth), WP3/WP4 (Map + Listings). Eeg `docs/ROADMAP.md`.
