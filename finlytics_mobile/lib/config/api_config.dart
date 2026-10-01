import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// API Configuration
class ApiConfig {
  static const String defaultBaseUrl = 'http://192.168.100.156:8000/api';
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true, resetOnError: true),
  );
  static const _baseUrlKey = 'custom_base_url';

  static String _baseUrl = defaultBaseUrl;

  static Future<void> init() async {
    try {
      final saved = await _storage.read(key: _baseUrlKey);
      if (saved != null && saved.trim().isNotEmpty) {
        _baseUrl = _formatUrl(saved.trim());
      }
    } catch (_) {}
  }

  static String _formatUrl(String url) {
    var trimmed = url.trim();
    if (trimmed.endsWith('/')) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }
    if (!trimmed.endsWith('/api')) {
      trimmed = '$trimmed/api';
    }
    return trimmed;
  }

  static String get baseUrl => _baseUrl;

  static Future<void> setBaseUrl(String newUrl) async {
    _baseUrl = _formatUrl(newUrl);
    try {
      await _storage.write(key: _baseUrlKey, value: _baseUrl);
    } catch (_) {}
  }

  static Future<void> resetToDefault() async {
    _baseUrl = defaultBaseUrl;
    try {
      await _storage.delete(key: _baseUrlKey);
    } catch (_) {}
  }

  // Auth
  static String get login => '$baseUrl/auth/login';
  static String get profile => '$baseUrl/settings/profile';

  // Dashboard
  static String get dashboardOverview => '$baseUrl/dashboard/overview';

  // Transactions
  static String get transactions => '$baseUrl/transactions';

  // Reports
  static String get reports => '$baseUrl/reports';

  // Chat
  static String get chatConversations => '$baseUrl/chat/conversations';
  static String get chatMessage => '$baseUrl/chat/message';
  static String get chatStream => '$baseUrl/chat/stream';

  // Documents/Upload
  static String get documents => '$baseUrl/documents';
  static String get documentsUpload => '$baseUrl/documents/upload';
}
