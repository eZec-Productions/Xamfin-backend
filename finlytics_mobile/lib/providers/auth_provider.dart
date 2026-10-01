import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import 'package:dio/dio.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  String? _token;
  UserModel? _user;
  bool _isLoading = true;
  String? _error;

  String? get token => _token;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  String? get error => _error;

  Dio get dio {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        sendTimeout: const Duration(seconds: 10),
      ),
    );
    if (_token != null) {
      dio.options.headers['Authorization'] = 'Bearer $_token';
    }
    return dio;
  }

  void forceStopLoading() {
    if (_isLoading) {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> checkAuth() async {
    try {
      _token = await _authService.getToken();
      if (_token != null && _token!.isNotEmpty) {
        _user = await _authService.fetchCurrentUser(_token!);
        if (_user == null) {
          _token = null;
          await _authService.logout();
        }
      } else {
        _token = null;
      }
    } catch (e) {
      debugPrint('checkAuth error: $e');
      _token = null;
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(email, password);

      if (result['success'] == true) {
        _token = result['token'];
        _user = result['user'] ?? await _authService.fetchCurrentUser(_token!);
        _error = null;
        return null; // success
      } else {
        _error = result['error'] ?? 'Login failed';
        return _error;
      }
    } catch (e) {
      _error = 'Error: $e';
      return _error;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _token = null;
    _user = null;
    notifyListeners();
  }
}
