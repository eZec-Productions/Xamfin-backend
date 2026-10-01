class ReportModel {
  final String id;
  final String month;
  final String year;
  final String dateGenerated;
  final bool isApproved;
  final Map<String, dynamic> summaryMetrics;
  final List<Map<String, dynamic>> actionPlan;

  ReportModel({
    required this.id,
    required this.month,
    required this.year,
    required this.dateGenerated,
    required this.isApproved,
    required this.summaryMetrics,
    required this.actionPlan,
  });

  static String _extractMetric(dynamic val) {
    if (val == null) return '\$0';
    if (val is Map) return val['value']?.toString() ?? '\$0';
    return val.toString();
  }

  String get title => '$month $year Report';
  String get revenue => _extractMetric(summaryMetrics['revenue']);
  String get expenses => _extractMetric(summaryMetrics['expenses']);
  String get netProfit => _extractMetric(summaryMetrics['net_profit']);
  String get cashFlow => _extractMetric(summaryMetrics['cash_flow']);

  List<String> get pendingActionItems => actionPlan
      .where((a) => a['status'] == 'pending' || a['status'] == 'active')
      .map((a) => a['title']?.toString() ?? '')
      .where((t) => t.isNotEmpty)
      .take(3)
      .toList();

  factory ReportModel.fromJson(Map<String, dynamic> json) {
    List<Map<String, dynamic>> actions = [];
    if (json['action_plan'] != null) {
      actions = List<Map<String, dynamic>>.from(
        (json['action_plan'] as List).map((a) => Map<String, dynamic>.from(a as Map))
      );
    }

    return ReportModel(
      id: json['id']?.toString() ?? '',
      month: json['month']?.toString() ?? '',
      year: json['year']?.toString() ?? '',
      dateGenerated: json['date_generated']?.toString() ?? '',
      isApproved: json['is_approved'] as bool? ?? false,
      summaryMetrics: json['summary_metrics'] != null
          ? Map<String, dynamic>.from(json['summary_metrics'] as Map)
          : {},
      actionPlan: actions,
    );
  }
}
