import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/health_score_card.dart';
import '../../widgets/metric_card.dart';
import '../../widgets/transaction_tile.dart';
import '../settings/settings_screen.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onNavigateToReports;
  final VoidCallback? onNavigateToChat;
  final VoidCallback? onNavigateToUpload;

  const HomeScreen({
    super.key,
    this.onNavigateToReports,
    this.onNavigateToChat,
    this.onNavigateToUpload,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadAll();
    });
  }

  Future<void> _openWebDashboard() async {
    final url = Uri.parse('http://192.168.100.156:3000/dashboard');
    try {
      final launched = await launchUrl(url, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(url, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        await launchUrl(url);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Opening Web Studio at: http://192.168.100.156:3000/dashboard',
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
              ),
              backgroundColor: AppColors.primary,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    }
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.logout_rounded, color: AppColors.error, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              'Sign Out of Finlytics?',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You will need your login credentials to sign back in.',
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                color: const Color(0xFF64748B),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      side: const BorderSide(color: AppColors.cardBorder),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text('Cancel', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      auth.logout();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: Text('Sign Out', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dashboard = context.watch<DashboardProvider>();
    final userName = auth.user?.name ?? 'Muhammad';
    final firstName = userName.split(' ').first;
    final initial = firstName.isNotEmpty ? firstName[0].toUpperCase() : 'M';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: Colors.white,
          onRefresh: () => dashboard.loadAll(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Custom Modern App Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        // Profile Avatar (Tap to open Settings)
                        GestureDetector(
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const SettingsScreen()),
                          ),
                          child: Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFF6B00), Color(0xFFFFA048)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFFF6B00).withOpacity(0.25),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                initial,
                                style: GoogleFonts.plusJakartaSans(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'WELCOME BACK',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.1,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF0E6),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: const Color(0xFFFFD2B3),
                                      width: 0.8,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.verified_rounded, size: 10, color: AppColors.primary),
                                      const SizedBox(width: 3),
                                      Text(
                                        'PRO',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.primary,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              firstName,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F172A),
                                letterSpacing: -0.4,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Top Action Buttons
                    Row(
                      children: [
                        // Real Sync Button
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(11),
                            border: Border.all(
                              color: AppColors.cardBorder,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: IconButton(
                            icon: dashboard.isLoading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.primary,
                                    ),
                                  )
                                : const Icon(Icons.sync_rounded, size: 18, color: Color(0xFF475569)),
                            padding: EdgeInsets.zero,
                            onPressed: dashboard.isLoading ? null : () => dashboard.loadAll(),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Settings Button
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(11),
                            border: Border.all(
                              color: AppColors.cardBorder,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.settings_outlined, size: 18, color: Color(0xFF475569)),
                            padding: EdgeInsets.zero,
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const SettingsScreen()),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Real Logout Button
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(11),
                            border: Border.all(
                              color: AppColors.cardBorder,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.logout_rounded, size: 18, color: Color(0xFF94A3B8)),
                            padding: EdgeInsets.zero,
                            onPressed: () => _showLogoutDialog(context, auth),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Financial Health Score Hero Card
                HealthScoreCard(
                  score: dashboard.healthScore,
                  rating: dashboard.healthRating,
                  change: dashboard.healthChange,
                ),

                const SizedBox(height: 20),

                // Quick Action Hub (Real finance icons & clean typography)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildQuickAction(
                      icon: Icons.upload_file_rounded,
                      label: 'Upload',
                      onTap: widget.onNavigateToUpload,
                    ),
                    _buildQuickAction(
                      icon: Icons.psychology_rounded,
                      label: 'AI Copilot',
                      onTap: widget.onNavigateToChat,
                    ),
                    _buildQuickAction(
                      icon: Icons.insights_rounded,
                      label: 'Analytics',
                      onTap: widget.onNavigateToReports,
                    ),
                    _buildQuickAction(
                      icon: Icons.desktop_windows_rounded,
                      label: 'Web Studio',
                      onTap: _openWebDashboard,
                    ),
                  ],
                ),

                const SizedBox(height: 26),

                // Financial Overview Section Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Financial Overview',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0F172A),
                        letterSpacing: -0.3,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_month_rounded, size: 12, color: AppColors.primary),
                          const SizedBox(width: 5),
                          Text(
                            'Current Period',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              color: const Color(0xFF64748B),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Revenue + Net Profit cards (Real Finance Icons)
                Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        title: 'Revenue',
                        amount: dashboard.revenue,
                        icon: Icons.arrow_outward_rounded,
                        subtitle: 'Inflows this month',
                        onTap: widget.onNavigateToReports,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        title: 'Net Profit',
                        amount: dashboard.netProfit,
                        icon: Icons.account_balance_wallet_rounded,
                        subtitle: 'Net margins',
                        onTap: widget.onNavigateToReports,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Expenses + Cash Balance cards (Real Finance Icons)
                Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        title: 'Expenses',
                        amount: dashboard.expenses,
                        icon: Icons.receipt_rounded,
                        subtitle: 'Operating costs',
                        onTap: widget.onNavigateToReports,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        title: 'Cash Reserve',
                        amount: dashboard.cashBalance,
                        icon: Icons.account_balance_rounded,
                        subtitle: 'Available liquidity',
                        onTap: widget.onNavigateToReports,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Recent Transactions Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Recent Activity',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF0E6),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${dashboard.recentTransactions.length}',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (widget.onNavigateToReports != null)
                      GestureDetector(
                        onTap: widget.onNavigateToReports,
                        child: Text(
                          'View All →',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                // Transactions list or Clean White Empty State
                if (dashboard.recentTransactions.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: AppColors.cardBorder,
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.025),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 58,
                          height: 58,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFFFFF0E6),
                                Color(0xFFFFE3D0),
                              ],
                            ),
                            border: Border.all(
                              color: const Color(0xFFFFD2B3),
                              width: 1,
                            ),
                          ),
                          child: const Icon(
                            Icons.receipt_long_rounded,
                            color: AppColors.primary,
                            size: 28,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'No Transactions Found',
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.2,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Upload invoices, receipts or bank statements to auto-track financial cash flows with AI.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 18),
                        if (widget.onNavigateToUpload != null)
                          ElevatedButton.icon(
                            onPressed: widget.onNavigateToUpload,
                            icon: const Icon(Icons.upload_file_rounded, size: 18),
                            label: Text(
                              'Upload Document',
                              style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 0,
                            ),
                          ),
                      ],
                    ),
                  )
                else
                  ...dashboard.recentTransactions.take(3).map(
                    (tx) => TransactionTile(
                      transaction: tx,
                      onTap: widget.onNavigateToReports,
                    ),
                  ),

                const SizedBox(height: 22),

                // AI Insights section if present
                if (dashboard.aiInsights.isNotEmpty) ...[
                  Row(
                    children: [
                      const Icon(Icons.psychology_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'AI Financial Insights',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...dashboard.aiInsights.take(2).map((insight) => _InsightCard(insight: insight)),
                  const SizedBox(height: 20),
                ],

                // Modern Web Dashboard Banner with White & Neon Orange Accents
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.cardBorder,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.025),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF0E6),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.desktop_windows_rounded, color: AppColors.primary, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Finlytics Web Studio',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.2,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Export P&L reports, charts & reconcile statements.',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _openWebDashboard,
                        icon: const Icon(Icons.arrow_forward_rounded, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        splashColor: AppColors.primary.withOpacity(0.12),
        highlightColor: AppColors.primary.withOpacity(0.06),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.025),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Icon(icon, color: AppColors.primary, size: 24),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: 72,
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      label,
                      maxLines: 1,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1E293B),
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  final Map<String, dynamic> insight;
  const _InsightCard({required this.insight});

  Color _typeColor(String type) {
    switch (type) {
      case 'strong':      return AppColors.success;
      case 'warning':     return AppColors.warning;
      case 'opportunity': return AppColors.secondary;
      default:            return AppColors.primaryLight;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'strong':      return Icons.check_circle_rounded;
      case 'warning':     return Icons.warning_amber_rounded;
      case 'opportunity': return Icons.lightbulb_rounded;
      default:            return Icons.insights_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final type   = insight['type']?.toString() ?? '';
    final title  = insight['title']?.toString() ?? '';
    final desc   = insight['description']?.toString() ?? '';
    final impact = insight['impact']?.toString() ?? '';
    final color  = _typeColor(type);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.3), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(_typeIcon(type), color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.plusJakartaSans(
                    color: color,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                if (desc.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      desc,
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                if (impact.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Impact: $impact',
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
