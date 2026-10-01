import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/reports_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/upload_provider.dart';
import 'services/dashboard_service.dart';
import 'services/reports_service.dart';
import 'services/chat_service.dart';
import 'services/upload_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_shell.dart';

import 'config/api_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiConfig.init();
  runApp(const FinlyticsApp());
}

class FinlyticsApp extends StatelessWidget {
  const FinlyticsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider()..checkAuth(),
        ),
        ChangeNotifierProxyProvider<AuthProvider, DashboardProvider>(
          create: (context) => DashboardProvider(
            DashboardService(context.read<AuthProvider>().dio),
          ),
          update: (context, auth, previous) =>
              (previous ?? DashboardProvider(DashboardService(auth.dio)))
                ..updateService(DashboardService(auth.dio)),
        ),
        ChangeNotifierProxyProvider<AuthProvider, ReportsProvider>(
          create: (context) => ReportsProvider(
            ReportsService(context.read<AuthProvider>().dio),
          ),
          update: (context, auth, previous) =>
              (previous ?? ReportsProvider(ReportsService(auth.dio)))
                ..updateService(ReportsService(auth.dio)),
        ),
        ChangeNotifierProxyProvider<AuthProvider, ChatProvider>(
          create: (context) => ChatProvider(
            ChatService(
              context.read<AuthProvider>().dio,
              context.read<AuthProvider>().token ?? '',
            ),
          ),
          update: (context, auth, previous) =>
              (previous ?? ChatProvider(ChatService(auth.dio, auth.token ?? '')))
                ..updateService(ChatService(auth.dio, auth.token ?? '')),
        ),
        ChangeNotifierProxyProvider<AuthProvider, UploadProvider>(
          create: (context) => UploadProvider(
            UploadService(context.read<AuthProvider>().dio),
          ),
          update: (context, auth, previous) =>
              (previous ?? UploadProvider(UploadService(auth.dio)))
                ..updateService(UploadService(auth.dio)),
        ),
      ],
      child: MaterialApp(
        title: 'Finlytics AI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthGate(),
      ),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    // Safety fallback: ensure loading never hangs indefinitely
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        final auth = context.read<AuthProvider>();
        if (auth.isLoading) {
          auth.forceStopLoading();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 44,
                height: 44,
                child: CircularProgressIndicator(
                  color: AppColors.primaryLight,
                  strokeWidth: 3,
                ),
              ),
              SizedBox(height: 20),
              Text(
                'Finlytics AI',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (!auth.isAuthenticated) {
      return const LoginScreen();
    }

    return const MainShell();
  }
}
