import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class HealthScoreCard extends StatelessWidget {
  final int score;
  final String? rating;
  final String? change;

  const HealthScoreCard({
    super.key,
    required this.score,
    this.rating,
    this.change,
  });

  Color get scoreColor {
    return AppColors.primary;
  }

  String get scoreStatus {
    if (rating != null && rating!.isNotEmpty && rating != 'N/A') return rating!;
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Healthy';
    if (score >= 40) return 'Fair';
    if (score > 0) return 'Attention';
    return 'Calibrating';
  }

  @override
  Widget build(BuildContext context) {
    final hasScore = score > 0;
    const displayColor = AppColors.primary;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Tag & Status Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0E6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.query_stats_rounded,
                        color: AppColors.primary,
                        size: 15,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'FINANCIAL HEALTH INDEX',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF0E6),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFFFD2B3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        scoreStatus.toUpperCase(),
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.6,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Main Score & Gauge Row
            Row(
              children: [
                // Modern Circular Gauge
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Background track
                    const SizedBox(
                      width: 76,
                      height: 76,
                      child: CircularProgressIndicator(
                        value: 1.0,
                        strokeWidth: 7,
                        color: Color(0xFFF1F5F9),
                      ),
                    ),
                    // Active track
                    SizedBox(
                      width: 76,
                      height: 76,
                      child: CircularProgressIndicator(
                        value: hasScore ? (score.clamp(0, 100)) / 100.0 : 0.08,
                        strokeWidth: 7,
                        strokeCap: StrokeCap.round,
                        backgroundColor: Colors.transparent,
                        valueColor: const AlwaysStoppedAnimation<Color>(displayColor),
                      ),
                    ),
                    // Score Value
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          hasScore ? '$score' : '0',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF0F172A),
                            height: 1.1,
                          ),
                        ),
                        Text(
                          '/100',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(width: 20),

                // Title & Description
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Financial Health Score',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        hasScore
                            ? 'Real-time liquidity, margin efficiency & expense control.'
                            : 'Upload invoices or statements to calculate your live AI score.',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: const Color(0xFF64748B),
                          height: 1.35,
                        ),
                      ),
                      if (change != null && change!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(
                              change!.startsWith('+')
                                  ? Icons.trending_up_rounded
                                  : Icons.trending_down_rounded,
                              size: 14,
                              color: change!.startsWith('+')
                                  ? AppColors.success
                                  : AppColors.error,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              change!,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: change!.startsWith('+')
                                    ? AppColors.success
                                    : AppColors.error,
                              ),
                            ),
                            Text(
                              ' vs last month',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 11,
                                color: const Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Bottom Quick Pills
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMiniBadge(Icons.sync_rounded, 'Real-Time Sync', AppColors.primary),
                  _buildDivider(),
                  _buildMiniBadge(Icons.verified_user_outlined, 'Risk: Monitored', const Color(0xFF64748B)),
                  _buildDivider(),
                  _buildMiniBadge(Icons.analytics_outlined, 'AI Powered', const Color(0xFF64748B)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniBadge(IconData icon, String text, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 5),
        Text(
          text,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 12,
      color: const Color(0xFFCBD5E1),
    );
  }
}
