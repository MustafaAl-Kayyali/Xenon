import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:gp/theme/colors.dart';

class LoadingScreen extends StatelessWidget {
  const LoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark 
              ? [AppColors.backgroundDark, const Color(0xFF1A1A24)]
              : [const Color(0xFFF8F9FF), const Color(0xFFE5E9F5)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  // Subtle glowing aura
                  Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryRust.withValues(alpha: 0.2),
                          blurRadius: 40,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                  )
                  .animate(onPlay: (controller) => controller.repeat())
                  .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 2.seconds, curve: Curves.easeInOut)
                  .then()
                  .scale(begin: const Offset(1.2, 1.2), end: const Offset(0.8, 0.8), duration: 2.seconds, curve: Curves.easeInOut),
                  
                  // Refined Camel Image
                  Image.asset(
                    'assets/images/camel_pixel.png',
                    width: 130,
                    height: 130,
                    fit: BoxFit.contain,
                  )
                  .animate(onPlay: (controller) => controller.repeat())
                  .moveY(begin: 0, end: -5, duration: 400.ms, curve: Curves.easeInOut)
                  .then()
                  .moveY(begin: -5, end: 0, duration: 400.ms, curve: Curves.easeInOut),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // Shadow beneath the camel
              Container(
                width: 70,
                height: 10,
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(100),
                ),
              )
              .animate(onPlay: (controller) => controller.repeat())
              .scaleX(begin: 1.0, end: 0.6, duration: 500.ms, curve: Curves.easeInOut)
              .then()
              .scaleX(begin: 0.6, end: 1.0, duration: 500.ms, curve: Curves.easeInOut),

              const SizedBox(height: 50),

              // Loading Text
              Text(
                'Loading your journey...',
                style: GoogleFonts.plusJakartaSans(
                  color: isDark ? AppColors.textPrimaryDark : const Color(0xFF5C4033),
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                ),
              )
              .animate(onPlay: (controller) => controller.repeat())
              .fade(begin: 0.4, end: 1.0, duration: 1.seconds, curve: Curves.easeInOut)
              .then()
              .fade(begin: 1.0, end: 0.4, duration: 1.seconds, curve: Curves.easeInOut),
              
              const SizedBox(height: 24),
              
              // Classy Animated Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: AppColors.primaryRust,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryRust.withValues(alpha: 0.3),
                          blurRadius: 4,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  )
                  .animate(
                    onPlay: (controller) => controller.repeat(),
                    delay: (index * 150).ms,
                  )
                  .slideY(begin: 0, end: -1, duration: 400.ms, curve: Curves.easeInOut)
                  .then()
                  .slideY(begin: -1, end: 0, duration: 400.ms, curve: Curves.easeInOut);
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
