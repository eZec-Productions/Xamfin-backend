import 'package:flutter_test/flutter_test.dart';
import 'package:finlytics_mobile/main.dart';

void main() {
  testWidgets('FinlyticsApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FinlyticsApp());
    expect(find.byType(FinlyticsApp), findsOneWidget);
  });
}
