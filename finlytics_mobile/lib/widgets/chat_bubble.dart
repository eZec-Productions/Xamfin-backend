import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';
import '../models/chat_model.dart';

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              margin: const EdgeInsets.only(right: 10, top: 2),
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF0E6),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFFD2B3)),
              ),
              child: const Icon(
                Icons.psychology_rounded,
                size: 16,
                color: AppColors.primary,
              ),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isUser ? 18 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 18),
                ),
                border: Border.all(
                  color: isUser
                      ? AppColors.primary
                      : AppColors.cardBorder,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: message.isStreaming && message.text.isEmpty
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Analyzing financial data...',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    )
                  : SelectableText(
                      message.text.isEmpty ? '...' : message.text,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        color: isUser ? Colors.white : AppColors.textPrimary,
                        height: 1.45,
                      ),
                    ),
            ),
          ),
          if (isUser) ...[
            Container(
              margin: const EdgeInsets.only(left: 10, top: 2),
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Icon(
                Icons.person_rounded,
                size: 16,
                color: Color(0xFF475569),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
