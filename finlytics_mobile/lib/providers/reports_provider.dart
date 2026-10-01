import 'package:flutter/foundation.dart';
import '../services/reports_service.dart';
import '../models/report_model.dart';

class ReportsProvider extends ChangeNotifier {
  ReportsService _service;

  ReportsProvider(this._service);

  void updateService(ReportsService service) {
    _service = service;
  }

  bool _isLoading = false;
  List<ReportModel> _reports = [];
  String? _errorMessage;

  bool get isLoading => _isLoading;
  List<ReportModel> get reports => _reports;
  String? get errorMessage => _errorMessage;

  ReportModel? get latestReport => _reports.isNotEmpty ? _reports.first : null;

  Future<void> loadReports() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _reports = await _service.getReports();
    } catch (e) {
      _errorMessage = 'Failed to load reports';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
