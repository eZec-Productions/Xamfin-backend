import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../config/api_config.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showServerConfigSheet(BuildContext context) {
    final ctrl = TextEditingController(
      text: ApiConfig.baseUrl.endsWith('/api')
          ? ApiConfig.baseUrl.substring(0, ApiConfig.baseUrl.length - 4)
          : ApiConfig.baseUrl,
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Padding(
        padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Server Configuration',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text('Enter your backend server address',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 12, color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              TextField(
                controller: ctrl,
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
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    await ApiConfig.setBaseUrl(ctrl.text.trim());
                    if (context.mounted) Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text('Save & Close',
                      style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final error = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Brand Logo
                  Center(
                    child: Image.asset(
                      'assets/images/logo.png',
                      height: 52,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.secondary],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.35),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.auto_graph_rounded,
                            color: Colors.white,
                            size: 38,
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Sign in to access your financial insights',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Email Field
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 14, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      labelStyle: GoogleFonts.plusJakartaSans(
                          color: AppColors.textSecondary, fontSize: 13),
                      prefixIcon: const Icon(Icons.email_rounded,
                          color: AppColors.primaryLight, size: 20),
                      filled: true,
                      fillColor: AppColors.card,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppColors.cardBorder),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                            color: AppColors.primaryLight, width: 2),
                      ),
                    ),
                    validator: (val) =>
                        val == null || val.isEmpty ? 'Please enter your email' : null,
                  ),
                  const SizedBox(height: 18),

                  // Password Field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 14, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Password',
                      labelStyle: GoogleFonts.plusJakartaSans(
                          color: AppColors.textSecondary, fontSize: 13),
                      prefixIcon: const Icon(Icons.lock_rounded,
                          color: AppColors.primaryLight, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off_rounded
                              : Icons.visibility_rounded,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      filled: true,
                      fillColor: AppColors.card,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppColors.cardBorder),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                            color: AppColors.primaryLight, width: 2),
                      ),
                    ),
                    validator: (val) =>
                        val == null || val.isEmpty ? 'Please enter your password' : null,
                  ),
                  const SizedBox(height: 28),

                  // Login Button
                  ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 4,
                      shadowColor: AppColors.primary.withOpacity(0.4),
                    ),
                    child: authProvider.isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Sign In',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.2,
                            ),
                          ),
                  ),
                   const SizedBox(height: 12),
                  // Server config quick access
                  GestureDetector(
                    onTap: () => _showServerConfigSheet(context),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.dns_rounded,
                            size: 13, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          'Configure Server',
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 12,
                              color: AppColors.textMuted,
                              decoration: TextDecoration.underline),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
