import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';
import 'home/home_screen.dart';
import 'reports/reports_screen.dart';
import 'chat/chat_screen.dart';
import 'upload/upload_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(
        onNavigateToReports: () => setState(() => _currentIndex = 1),
        onNavigateToChat: () => setState(() => _currentIndex = 2),
        onNavigateToUpload: () => setState(() => _currentIndex = 3),
      ),
      const ReportsScreen(),
      const ChatScreen(),
      const UploadScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(
            top: BorderSide(
              color: Color(0xFFE2E8F0),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.dashboard_outlined, Icons.dashboard_rounded, 'Home'),
                _buildNavItem(1, Icons.insert_chart_outlined_rounded, Icons.insert_chart_rounded, 'Reports'),
                _buildNavItem(2, Icons.psychology_outlined, Icons.psychology_rounded, 'AI Chat'),
                _buildNavItem(3, Icons.cloud_upload_outlined, Icons.cloud_upload_rounded, 'Upload'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? AppColors.primary : const Color(0xFF94A3B8);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: color,
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: color,
                letterSpacing: 0.1,
              ),
            ),
            const SizedBox(height: 3),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isSelected ? 16 : 0,
              height: 2.5,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
