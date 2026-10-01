import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/transaction_model.dart';

class DashboardService {
  final Dio _dio;

  DashboardService(this._dio);

  Future<Map<String, dynamic>> getOverview() async {
    try {
      final response = await _dio.get(ApiConfig.dashboardOverview);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        return data;
      }
    } catch (e) {
      debugPrint('DashboardService.getOverview error: $e');
    }
    return {};
  }

  Future<List<TransactionModel>> getRecentTransactions({int limit = 3}) async {
    try {
      final response = await _dio.get(
        ApiConfig.transactions,
        queryParameters: {'limit': limit, 'skip': 0},
      );
      if (response.statusCode == 200) {
        final data = response.data;
        List items = data is List ? data : (data['items'] ?? data['transactions'] ?? []);
        return items.map((j) => TransactionModel.fromJson(j)).toList();
      }
    } catch (e) {
      debugPrint('DashboardService.getRecentTransactions error: $e');
    }
    return [];
  }
}
