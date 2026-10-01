import 'package:flutter/foundation.dart';
import '../services/dashboard_service.dart';
import '../models/transaction_model.dart';

class DashboardProvider extends ChangeNotifier {
  DashboardService _service;

  DashboardProvider(this._service);

  void updateService(DashboardService service) {
    _service = service;
  }

  bool _isLoading = false;
  bool _hasData = false;
  String _revenue = '\$0';
  String _expenses = '\$0';
  String _netProfit = '\$0';
  String _cashBalance = '\$0';
  int _healthScore = 0;
  String _healthRating = 'N/A';
  String _healthChange = '';
  List<TransactionModel> _recentTransactions = [];
  List<Map<String, dynamic>> _monthlyBars = [];
  List<Map<String, dynamic>> _expenseBreakdown = [];
  List<Map<String, dynamic>> _aiInsights = [];

  bool get isLoading => _isLoading;
  bool get hasData => _hasData;
  String get revenue => _revenue;
  String get expenses => _expenses;
  String get netProfit => _netProfit;
  String get cashBalance => _cashBalance;
  int get healthScore => _healthScore;
  String get healthRating => _healthRating;
  String get healthChange => _healthChange;
  List<TransactionModel> get recentTransactions => _recentTransactions;
  List<Map<String, dynamic>> get monthlyBars => _monthlyBars;
  List<Map<String, dynamic>> get expenseBreakdown => _expenseBreakdown;
  List<Map<String, dynamic>> get aiInsights => _aiInsights;

  Future<void> loadAll() async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _service.getOverview();

      _hasData = data['hasData'] as bool? ?? false;

      final metrics = data['metrics'] as Map<String, dynamic>?;
      if (metrics != null) {
        _revenue     = ((metrics['revenue']     as Map?)?['value'])?.toString() ?? '\$0';
        _expenses    = ((metrics['expenses']    as Map?)?['value'])?.toString() ?? '\$0';
        _netProfit   = ((metrics['netProfit']   as Map?)?['value'])?.toString() ?? '\$0';
        _cashBalance = ((metrics['cashBalance'] as Map?)?['value'])?.toString() ?? '\$0';
      }

      final hs = data['healthScore'];
      if (hs != null) {
        _healthScore  = (hs['score'] as num?)?.toInt() ?? 0;
        _healthRating = hs['rating']?.toString() ?? '';
        _healthChange = hs['changeVsLastMonth']?.toString() ?? '';
      }

      // Recent transactions from overview
      final rawTxs = data['recentTransactions'] as List? ?? [];
      _recentTransactions = rawTxs
          .map((j) => TransactionModel.fromJson(j as Map<String, dynamic>))
          .take(3)
          .toList();

      // Monthly bars
      _monthlyBars = (data['monthlyBars'] as List? ?? [])
          .map((b) => Map<String, dynamic>.from(b as Map))
          .toList();

      // Expense breakdown
      _expenseBreakdown = (data['expenseBreakdown'] as List? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();

      // AI insights
      _aiInsights = (data['aiInsights'] as List? ?? [])
          .map((i) => Map<String, dynamic>.from(i as Map))
          .toList();
    } catch (e) {
      debugPrint('DashboardProvider.loadAll error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }
}
