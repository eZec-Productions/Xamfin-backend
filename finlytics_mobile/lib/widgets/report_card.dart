import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../models/report_model.dart';

class ReportCard extends StatelessWidget {
  final ReportModel report;
  final VoidCallback? onOpenWeb;

  const ReportCard({super.key, required this.report, this.onOpenWeb});

  Future<void> _launchWebReport() async {
    if (onOpenWeb != null) {
      onOpenWeb!();
      return;
    }
    final url = Uri.parse('http://192.168.100.156:3000/dashboard/reports/${report.id}');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Title & Approved Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report.title,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Generated ${report.dateGenerated}',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_rounded, color: AppColors.success, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'Approved',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 4 Key Numbers Grid
          Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildStat('Revenue', report.revenue, AppColors.textPrimary),
                _buildDivider(),
                _buildStat('Expenses', report.expenses, const Color(0xFFE11D48)),
                _buildDivider(),
                _buildStat('Net Profit', report.netProfit, const Color(0xFF059669)),
                _buildDivider(),
                _buildStat('Cash Flow', report.cashFlow, AppColors.primary),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Top Action Items
          if (report.pendingActionItems.isNotEmpty) ...[
            Text(
              'Top Action Items',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            ...report.pendingActionItems.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 6),
                      child: Icon(Icons.circle, size: 5, color: AppColors.primary),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          height: 1.35,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Full Report Web Link Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _launchWebReport,
              icon: const Icon(Icons.arrow_outward_rounded, size: 16, color: AppColors.primary),
              label: Text(
                'View Full Report on Web',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFFD2B3)),
                backgroundColor: const Color(0xFFFFF7ED),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value.isEmpty ? '\$0' : value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: color,
                letterSpacing: -0.3,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 24,
      color: const Color(0xFFE2E8F0),
      margin: const EdgeInsets.symmetric(horizontal: 2),
    );
  }
}
