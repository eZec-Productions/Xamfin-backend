import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/chat_model.dart';

class ChatService {
  final Dio _dio;
  final String _token;

  ChatService(this._dio, this._token);

  Future<List<ChatConversation>> getConversations() async {
    try {
      final response = await _dio.get(ApiConfig.chatConversations);
      if (response.statusCode == 200) {
        final data = response.data;
        List items = data is List ? data : (data['conversations'] ?? []);
        return items.map((j) => ChatConversation.fromJson(j)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<List<ChatMessage>> getMessages(String conversationId) async {
    try {
      final response = await _dio.get(
        '${ApiConfig.chatConversations}/$conversationId/messages',
      );
      if (response.statusCode == 200) {
        final data = response.data;
        List items = data is List ? data : (data['messages'] ?? []);
        return items.map((j) => ChatMessage.fromJson(j)).toList();
      }
    } catch (_) {}
    return [];
  }

  /// SSE streaming — yields content chunks from backend
  Stream<String> streamMessage({
    required String message,
    String? conversationId,
    void Function(String conversationId)? onConversationId,
  }) async* {
    try {
      final request = http.Request('POST', Uri.parse(ApiConfig.chatStream));
      request.headers['Content-Type'] = 'application/json';
      request.headers['Authorization'] = 'Bearer $_token';
      request.body = jsonEncode({
        'message': message,
        if (conversationId != null) 'conversation_id': conversationId,
      });

      final client = http.Client();
      final response = await client.send(request);

      if (response.statusCode != 200) {
        yield "Unable to reach advisory engine. Status: ${response.statusCode}";
        return;
      }

      final stream = response.stream.transform(utf8.decoder).transform(const LineSplitter());

      await for (final line in stream) {
        if (line.startsWith('data: ')) {
          final dataStr = line.substring(6).trim();
          if (dataStr == '[DONE]') break;
          try {
            final json = jsonDecode(dataStr);
            if (json is Map<String, dynamic>) {
              final type = json['type'];

              if (type == 'meta' && json['conversation_id'] != null) {
                onConversationId?.call(json['conversation_id'].toString());
                continue;
              }

              if (type == 'delta' && json['content'] != null) {
                yield json['content'].toString();
              } else if (type == 'error') {
                yield json['message']?.toString() ?? json['error']?.toString() ?? 'Error generating response';
              } else if (json['content'] != null && type != 'meta' && type != 'done') {
                yield json['content'].toString();
              } else if (json['token'] != null) {
                yield json['token'].toString();
              } else if (json['text'] != null && type != 'meta' && type != 'done') {
                yield json['text'].toString();
              } else if (json['error'] != null) {
                yield json['error'].toString();
              }
            }
          } catch (_) {
            if (dataStr.isNotEmpty && dataStr != '[DONE]') {
              yield dataStr;
            }
          }
        }
      }
    } catch (e) {
      yield "Connection error: $e";
    }
  }
}
