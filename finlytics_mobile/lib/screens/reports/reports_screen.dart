import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/reports_provider.dart';
import '../../widgets/report_card.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReportsProvider>().loadReports();
    });
  }

  @override
  Widget build(BuildContext context) {
    final reportsProvider = context.watch<ReportsProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Approved Reports',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w800,
            fontSize: 18,
            letterSpacing: -0.3,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => reportsProvider.loadReports(),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: Colors.white,
        onRefresh: () => reportsProvider.loadReports(),
        child: reportsProvider.isLoading && reportsProvider.reports.isEmpty
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : reportsProvider.reports.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.22),
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF0E6),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFFFD2B3)),
                              ),
                              child: const Icon(
                                Icons.assignment_turned_in_rounded,
                                size: 42,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'No Approved Reports Yet',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.2,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Reports approved by your admin will appear here',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: reportsProvider.reports.length,
                    itemBuilder: (context, index) {
                      final report = reportsProvider.reports[index];
                      return ReportCard(report: report);
                    },
                  ),
      ),
    );
  }
}
