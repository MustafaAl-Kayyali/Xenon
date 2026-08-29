import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gp/theme/colors.dart';

class CompassLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;

  const CompassLoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: Colors.black.withValues(alpha: 0.5),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primaryRust.withValues(alpha: 0.2),
                                  blurRadius: 15,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                          )
                          .animate(onPlay: (controller) => controller.repeat())
                          .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 2.seconds, curve: Curves.easeInOut)
                          .then()
                          .scale(begin: const Offset(1.2, 1.2), end: const Offset(0.8, 0.8), duration: 2.seconds, curve: Curves.easeInOut),
                          
                          Image.asset(
                            'assets/images/camel_pixel.png',
                            width: 50,
                            height: 50,
                            fit: BoxFit.contain,
                          )
                          .animate(onPlay: (controller) => controller.repeat())
                          .moveY(begin: 0, end: -3, duration: 400.ms, curve: Curves.easeInOut)
                          .then()
                          .moveY(begin: -3, end: 0, duration: 400.ms, curve: Curves.easeInOut),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 30,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(100),
                        ),
                      )
                      .animate(onPlay: (controller) => controller.repeat())
                      .scaleX(begin: 1.0, end: 0.6, duration: 500.ms, curve: Curves.easeInOut)
                      .then()
                      .scaleX(begin: 0.6, end: 1.0, duration: 500.ms, curve: Curves.easeInOut),
                      const SizedBox(height: 24),
                      const Text(
                        'Preparing your journey...',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.2,
                          color: AppColors.primaryRust,
                          decoration: TextDecoration.none,
                        ),
                      )
                      .animate(onPlay: (controller) => controller.repeat())
                      .fade(begin: 0.5, end: 1.0, duration: 1.seconds)
                      .then()
                      .fade(begin: 1.0, end: 0.5, duration: 1.seconds),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
