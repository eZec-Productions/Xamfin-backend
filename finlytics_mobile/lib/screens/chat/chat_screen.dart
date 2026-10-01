import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/chat_bubble.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _quickSuggestions = [
    'What was my highest expense this month?',
    'How is my net profit compared to revenue?',
    'Give me a summary of my financial health',
    'What are my top 3 action items?',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().loadConversations();
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage([String? presetText]) {
    final text = presetText ?? _textController.text;
    if (text.trim().isEmpty) return;

    final chatProvider = context.read<ChatProvider>();
    _textController.clear();
    chatProvider.sendMessage(text);

    Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.psychology_rounded, color: AppColors.primary, size: 22),
            const SizedBox(width: 8),
            Text(
              'Finlytics AI Assistant',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w800,
                fontSize: 17,
                letterSpacing: -0.3,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'New Chat',
            icon: const Icon(Icons.add_comment_rounded, color: AppColors.primary),
            onPressed: () => chatProvider.startNewChat(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Chat Messages or Empty State with Quick Suggestions
          Expanded(
            child: chatProvider.messages.isEmpty
                ? SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizedBox(height: 30),
                        Container(
                          padding: const EdgeInsets.all(22),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF0E6),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFFFD2B3)),
                          ),
                          child: const Icon(
                            Icons.psychology_rounded,
                            size: 44,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Ask Finlytics AI',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Ask any question about your transactions, approved reports, or business health.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 32),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Quick questions:',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._quickSuggestions.map(
                          (suggestion) => Container(
                            width: double.infinity,
                            margin: const EdgeInsets.only(bottom: 10),
                            child: OutlinedButton(
                              onPressed: () => _sendMessage(suggestion),
                              style: OutlinedButton.styleFrom(
                                alignment: Alignment.centerLeft,
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                                backgroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.help_outline_rounded, size: 16, color: AppColors.primary),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      suggestion,
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: chatProvider.messages.length,
                    itemBuilder: (context, index) {
                      final msg = chatProvider.messages[index];
                      return ChatBubble(message: msg);
                    },
                  ),
          ),

          // Bottom Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: TextField(
                        controller: _textController,
                        style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.textPrimary),
                        decoration: InputDecoration(
                          hintText: 'Ask about your finances...',
                          hintStyle: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.textMuted),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: chatProvider.isStreaming
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.arrow_upward_rounded, color: Colors.white, size: 20),
                      onPressed: chatProvider.isStreaming ? null : () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
