import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';
import '../models/transaction_model.dart';

class TransactionTile extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;

  const TransactionTile({
    super.key,
    required this.transaction,
    this.onTap,
  });

  IconData _getCategoryIcon(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('salary') || cat.contains('payroll')) return Icons.payments_rounded;
    if (cat.contains('software') || cat.contains('api') || cat.contains('tech')) return Icons.code_rounded;
    if (cat.contains('rent') || cat.contains('lease') || cat.contains('office')) return Icons.domain_rounded;
    if (cat.contains('revenue') || cat.contains('client') || cat.contains('deposit')) return Icons.arrow_downward_rounded;
    if (cat.contains('travel') || cat.contains('transport')) return Icons.flight_takeoff_rounded;
    if (cat.contains('food') || cat.contains('meal')) return Icons.restaurant_rounded;
    if (cat.contains('marketing') || cat.contains('ad')) return Icons.campaign_rounded;
    return Icons.receipt_long_rounded;
  }


  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final isIncome = transaction.isIncome;
    final amountColor = isIncome ? AppColors.success : const Color(0xFF0F172A);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Clean Minimal Category Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFE2E8F0),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    _getCategoryIcon(transaction.category),
                    color: const Color(0xFF334155),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 14),

                // Description & Category/Date
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        transaction.description.isEmpty ? 'Untitled Transaction' : transaction.description,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              transaction.category.isEmpty ? 'General' : transaction.category,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            transaction.date.isNotEmpty
                                ? transaction.date.split('T').first
                                : 'Recent',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              color: const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),

                // Amount
                Text(
                  '${isIncome ? '+' : '-'}${currencyFormatter.format(transaction.amount)}',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: amountColor,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
