import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/report_model.dart';

class ReportsService {
  final Dio _dio;

  ReportsService(this._dio);

  Future<List<ReportModel>> getReports() async {
    try {
      final response = await _dio.get(ApiConfig.reports);
      if (response.statusCode == 200) {
        final data = response.data;
        List items = data is List ? data : (data['items'] ?? data['reports'] ?? []);
        final reports = items
            .map((j) => ReportModel.fromJson(j))
            .where((r) => r.isApproved)
            .toList();
        return reports;
      }
    } catch (_) {}
    return [];
  }
}
