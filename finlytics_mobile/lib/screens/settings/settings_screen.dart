import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/api_config.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _serverIpController;
  bool _saving = false;
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    final current = ApiConfig.baseUrl;
    final display = current.endsWith('/api')
        ? current.substring(0, current.length - 4)
        : current;
    _serverIpController = TextEditingController(text: display);
  }

  @override
  void dispose() {
    _serverIpController.dispose();
    super.dispose();
  }

  Future<void> _saveServerUrl() async {
    final raw = _serverIpController.text.trim();
    if (raw.isEmpty) return;
    setState(() { _saving = true; _saved = false; });
    await ApiConfig.setBaseUrl(raw);
    if (!mounted) return;
    setState(() { _saving = false; _saved = true; });
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() { _saved = false; });
  }

  Future<void> _resetServerUrl() async {
    await ApiConfig.resetToDefault();
    final display = ApiConfig.defaultBaseUrl.endsWith('/api')
        ? ApiConfig.defaultBaseUrl.substring(0, ApiConfig.defaultBaseUrl.length - 4)
        : ApiConfig.defaultBaseUrl;
    if (!mounted) return;
    setState(() { _serverIpController.text = display; });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Reset to default server',
            style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600)),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  BoxDecoration _cardDecor() => BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      );

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Settings',
            style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w800, fontSize: 18, letterSpacing: -0.3)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (user != null) ...[
            const _SectionLabel('Account'),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: _cardDecor(),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0E6),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFFD2B3)),
                    ),
                    child: Center(
                      child: Text(
                        (user.name.isNotEmpty ? user.name[0] : 'U').toUpperCase(),
                        style: GoogleFonts.plusJakartaSans(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name.isNotEmpty ? user.name : 'User',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.2),
                        ),
                        const SizedBox(height: 2),
                        Text(user.email,
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 12, color: AppColors.textSecondary)),
                        if (user.companyName.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(user.companyName,
                              style: GoogleFonts.plusJakartaSans(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                  fontWeight: FontWeight.w600)),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          const _SectionLabel('Server Configuration'),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: _cardDecor(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Backend Server URL',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 4),
                Text('Enter your server IP address (e.g. 192.168.1.5:8000)',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 12),
                TextField(
                  controller: _serverIpController,
                  keyboardType: TextInputType.url,
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 14, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'http://192.168.100.236:8000',
                    hintStyle: GoogleFonts.plusJakartaSans(
                        fontSize: 13, color: AppColors.textMuted),
                    prefixIcon: const Icon(Icons.dns_rounded,
                        color: AppColors.primary, size: 20),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _saving ? null : _saveServerUrl,
                        icon: _saving
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : Icon(
                                _saved
                                    ? Icons.check_circle_rounded
                                    : Icons.save_rounded,
                                size: 18),
                        label: Text(_saved ? 'Saved!' : 'Save URL',
                            style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              _saved ? AppColors.success : AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton(
                      onPressed: _resetServerUrl,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                        padding: const EdgeInsets.symmetric(
                            vertical: 12, horizontal: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Reset',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFBBF7D0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded,
                          size: 14, color: AppColors.success),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text('Active: ${ApiConfig.baseUrl}',
                            style: GoogleFonts.plusJakartaSans(
                                fontSize: 11,
                                color: const Color(0xFF15803D),
                                fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const _SectionLabel('About'),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: _cardDecor(),
            child: const Column(
              children: [
                _InfoRow(
                    icon: Icons.auto_graph_rounded,
                    label: 'App Name',
                    value: 'Finlytics AI'),
                Divider(height: 20, color: Color(0xFFE2E8F0)),
                _InfoRow(
                    icon: Icons.verified_rounded,
                    label: 'Version',
                    value: '1.0.0 (Production)'),
                Divider(height: 20, color: Color(0xFFE2E8F0)),
                _InfoRow(
                    icon: Icons.android_rounded,
                    label: 'Platform',
                    value: 'Android / Flutter'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _showLogoutDialog(context, auth),
              icon: const Icon(Icons.logout_rounded,
                  size: 18, color: Color(0xFFE11D48)),
              label: Text('Sign Out',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFE11D48))),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFDA4AF)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: const Color(0xFFFFF1F2),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 20),
            const Icon(Icons.logout_rounded,
                size: 36, color: Color(0xFFE11D48)),
            const SizedBox(height: 12),
            Text('Sign Out?',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            Text(
              'You will need to log in again to access your account.',
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Cancel',
                        style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      auth.logout();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE11D48),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Sign Out',
                        style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: AppColors.textMuted,
            letterSpacing: 1.0),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow(
      {required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(label,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13, color: AppColors.textSecondary)),
        const Spacer(),
        Text(value,
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
      ],
    );
  }
}
