import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// WHITE & NEON ORANGE PALETTE
/// Ultra-clean, modern, high-contrast fintech aesthetic
class AppColors {
  // Clean White Backgrounds & Surfaces
  static const Color background = Color(0xFFF8FAFC); // Crisp porcelain / slate-50
  static const Color surface = Color(0xFFFFFFFF); // Pure white
  static const Color card = Color(0xFFFFFFFF); // Pure white card
  static const Color cardElevated = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0); // Light slate border
  static const Color cardBorderLight = Color(0xFFF1F5F9);

  // Backward compatibility aliases
  static const Color navyDark = Color(0xFF0F172A);
  static const Color mirageBlue = Color(0xFFE2E8F0);
  static const Color mirageLight = Color(0xFFFF6B00);
  static const Color mirageSoft = Color(0xFFFF8533);

  // Brand Accents - Electric / Neon Orange
  static const Color primary = Color(0xFFFF6B00); // Neon Orange
  static const Color primaryLight = Color(0xFFFF8533);
  static const Color primaryDark = Color(0xFFE05300);
  static const Color orangeGlow = Color(0xFFFF9E42);
  static const Color orangeSubtle = Color(0xFFFFF5ED); // Light orange tint

  // Harmonious Secondary Accents
  static const Color secondary = Color(0xFF0284C7); // Electric Cyan
  static const Color accent = Color(0xFFFF7A00);

  // Status & Financial Performance Colors
  static const Color success = Color(0xFF10B981); // Emerald Mint
  static const Color successLight = Color(0xFF34D399);
  static const Color warning = Color(0xFFF59E0B); // Amber Gold
  static const Color error = Color(0xFFEF4444); // Coral Red
  static const Color info = Color(0xFFFF6B00); // Neon Orange

  // Typography - Crisp dark slate on white
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF6B00), Color(0xFFFF881A)],
  );

  static const LinearGradient orangeGlowGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF5F1F), Color(0xFFFF9E00)],
  );

  static const LinearGradient heroCardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFFFFFFF),
      Color(0xFFFFF8F3),
    ],
  );

  static const LinearGradient emeraldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF10B981), Color(0xFF059669)],
  );

  static const LinearGradient roseGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF43F5E), Color(0xFFE11D48)],
  );

  static const LinearGradient cyanGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF06B6D4), Color(0xFF0284C7)],
  );

  static const LinearGradient violetGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF6B00), Color(0xFFFF9E42)],
  );

  // Backward-compatibility gradients
  static const LinearGradient navyMirageGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [surface, cardBorder],
  );

  static const LinearGradient mirageNavyGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [cardBorder, surface],
  );
}

class AppTheme {
  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.plusJakartaSansTextTheme(
      ThemeData(brightness: Brightness.light).textTheme,
    );

    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primary,
      fontFamily: GoogleFonts.plusJakartaSans().fontFamily,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        displayMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        headlineLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        headlineMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        titleLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        titleMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        titleSmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, color: AppColors.textSecondary),
        bodyLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w500, color: AppColors.textPrimary),
        bodyMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w400, color: AppColors.textSecondary),
        labelLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      ),
      cardTheme: CardTheme(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.cardBorder, width: 1),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          letterSpacing: -0.3,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  // Alias for backward compatibility
  static ThemeData get darkTheme => lightTheme;
}
