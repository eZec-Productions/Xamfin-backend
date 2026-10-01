import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';
import '../models/document_model.dart';

class UploadTile extends StatelessWidget {
  final DocumentModel document;

  const UploadTile({super.key, required this.document});

  Color get statusColor {
    if (document.isProcessed) return AppColors.success;
    if (document.isPending) return AppColors.warning;
    return AppColors.error;
  }

  IconData get fileIcon {
    final name = document.filename.toLowerCase();
    if (name.endsWith('.pdf')) return Icons.picture_as_pdf_rounded;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return Icons.image_rounded;
    }
    return Icons.description_rounded;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF0E6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(fileIcon, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  document.filename,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${document.documentType.toUpperCase()} • ${document.uploadedAt.isNotEmpty ? document.uploadedAt.split('T').first : 'Recent'}',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: statusColor.withOpacity(0.3)),
            ),
            child: Text(
              document.status.toUpperCase(),
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
