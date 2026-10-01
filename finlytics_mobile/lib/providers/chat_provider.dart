import 'package:flutter/foundation.dart';
import '../services/chat_service.dart';
import '../models/chat_model.dart';

class ChatProvider extends ChangeNotifier {
  ChatService _service;

  ChatProvider(this._service);

  void updateService(ChatService service) {
    _service = service;
  }

  List<ChatConversation> _conversations = [];
  List<ChatMessage> _messages = [];
  String? _activeConversationId;
  bool _isLoading = false;
  bool _isStreaming = false;

  List<ChatConversation> get conversations => _conversations;
  List<ChatMessage> get messages => _messages;
  String? get activeConversationId => _activeConversationId;
  bool get isLoading => _isLoading;
  bool get isStreaming => _isStreaming;

  Future<void> loadConversations() async {
    _isLoading = true;
    notifyListeners();

    try {
      _conversations = await _service.getConversations();
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
  }

  Future<void> selectConversation(String conversationId) async {
    _activeConversationId = conversationId;
    _isLoading = true;
    notifyListeners();

    try {
      _messages = await _service.getMessages(conversationId);
    } catch (_) {
      _messages = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  void startNewChat() {
    _activeConversationId = null;
    _messages = [];
    notifyListeners();
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || _isStreaming) return;

    final userMsg = ChatMessage(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now().toIso8601String(),
    );

    final assistantMsg = ChatMessage(
      id: 'ai_${DateTime.now().millisecondsSinceEpoch}',
      text: '',
      isUser: false,
      timestamp: DateTime.now().toIso8601String(),
      isStreaming: true,
    );

    _messages.add(userMsg);
    _messages.add(assistantMsg);
    _isStreaming = true;
    notifyListeners();

    try {
      final stream = _service.streamMessage(
        message: text.trim(),
        conversationId: _activeConversationId,
        onConversationId: (convId) {
          _activeConversationId = convId;
        },
      );

      StringBuffer buffer = StringBuffer();
      await for (final chunk in stream) {
        buffer.write(chunk);
        final index = _messages.indexWhere((m) => m.id == assistantMsg.id);
        if (index != -1) {
          _messages[index] = _messages[index].copyWith(
            text: buffer.toString(),
            isStreaming: true,
          );
          notifyListeners();
        }
      }

      final index = _messages.indexWhere((m) => m.id == assistantMsg.id);
      if (index != -1) {
        final finalText = buffer.toString().trim();
        _messages[index] = _messages[index].copyWith(
          text: finalText.isEmpty ? "No response received. Please try again." : finalText,
          isStreaming: false,
        );
      }

      loadConversations();
    } catch (e) {
      final index = _messages.indexWhere((m) => m.id == assistantMsg.id);
      if (index != -1) {
        _messages[index] = _messages[index].copyWith(
          text: 'Error processing response: $e',
          isStreaming: false,
        );
      }
    } finally {
      _isStreaming = false;
      notifyListeners();
    }
  }
}
