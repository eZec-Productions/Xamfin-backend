import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class AuthService {
  final FlutterSecureStorage _storage;
  final Dio _dio;

  static const _tokenKey = 'jwt_token';
  static const _userKey = 'cached_user_profile';

  AuthService()
      : _storage = const FlutterSecureStorage(
          aOptions: AndroidOptions(
            encryptedSharedPreferences: true,
            resetOnError: true,
          ),
        ),
        _dio = Dio(
          BaseOptions(
            connectTimeout: const Duration(seconds: 8),
            receiveTimeout: const Duration(seconds: 8),
            sendTimeout: const Duration(seconds: 8),
          ),
        );

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiConfig.login,
        data: {
          'email': email.trim(),
          'password': password,
        },
        options: Options(contentType: 'application/json'),
      );

      if (response.statusCode == 200) {
        final token = response.data['access_token'];
        UserModel? user;
        if (response.data['user'] != null) {
          user = UserModel.fromJson(response.data['user']);
        }
        try {
          await _storage.write(key: _tokenKey, value: token);
          if (user != null) {
            await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
          }
        } catch (e) {
          debugPrint('Storage write error: $e');
        }
        return {'success': true, 'token': token, 'user': user};
      }
      return {'success': false, 'error': 'Login failed'};
    } on DioException catch (e) {
      String msg = 'Login failed. Check your credentials.';
      if (e.response?.statusCode == 400 || e.response?.statusCode == 401) {
        msg = e.response?.data?['detail'] ?? 'Invalid email or password.';
      } else if (e.type == DioExceptionType.connectionError ||
                 e.type == DioExceptionType.connectionTimeout) {
        msg = 'Cannot connect to server at ${ApiConfig.baseUrl}. Check Wi-Fi or server IP.';
      }
      return {'success': false, 'error': msg};
    } catch (e) {
      return {'success': false, 'error': 'An unexpected error occurred: $e'};
    }
  }

  Future<String?> getToken() async {
    try {
      return await _storage.read(key: _tokenKey).timeout(
        const Duration(seconds: 2),
        onTimeout: () => null,
      );
    } catch (e) {
      debugPrint('Storage read error: $e');
      return null;
    }
  }

  Future<UserModel?> getCachedUser() async {
    try {
      final jsonStr = await _storage.read(key: _userKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final data = jsonDecode(jsonStr) as Map<String, dynamic>;
        return UserModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    try {
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _userKey);
    } catch (e) {
      debugPrint('Storage delete error: $e');
    }
  }

  Future<UserModel?> fetchCurrentUser(String token) async {
    try {
      final response = await _dio.get(
        ApiConfig.profile,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      ).timeout(
        const Duration(seconds: 5),
      );
      if (response.statusCode == 200) {
        final user = UserModel.fromJson(response.data);
        await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
        return user;
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await logout();
        return null;
      }
      debugPrint('fetchCurrentUser DioException: $e');
    } catch (e) {
      debugPrint('fetchCurrentUser error: $e');
    }

    return await getCachedUser();
  }
}
