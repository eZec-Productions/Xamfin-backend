class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final String timestamp;
  bool isStreaming;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isStreaming = false,
  });

  ChatMessage copyWith({String? text, bool? isStreaming}) {
    return ChatMessage(
      id: id,
      text: text ?? this.text,
      isUser: isUser,
      timestamp: timestamp,
      isStreaming: isStreaming ?? this.isStreaming,
    );
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      text: json['content'] ?? json['text'] ?? '',
      isUser: (json['sender'] ?? json['role'] ?? '') == 'user',
      timestamp: json['created_at'] ?? '',
    );
  }
}

class ChatConversation {
  final String id;
  final String title;
  final String lastMessage;
  final String updatedAt;

  ChatConversation({
    required this.id,
    required this.title,
    required this.lastMessage,
    required this.updatedAt,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'New Conversation',
      lastMessage: json['last_message'] ?? '',
      updatedAt: json['updated_at'] ?? json['created_at'] ?? '',
    );
  }
}
