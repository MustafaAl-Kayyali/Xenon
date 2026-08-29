import 'package:flutter/material.dart';
import 'package:gp/screens/loading_screen.dart';
import 'package:provider/provider.dart';
import 'package:gp/utils/secure_storage_helper.dart';
import 'package:gp/providers/profile_provider.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    // Increased delay to make the splash screen visible for longer
    await Future.delayed(const Duration(milliseconds: 500));

    final token = await SecureStorageHelper.getToken();

    if (!mounted) return;

    if (token != null && token.isNotEmpty) {
      // Token exists, try to load profile
      await context.read<ProfileProvider>().loadProfile(context, silent: true);

      if (!mounted) return;

      // If profile is loaded successfully, token is valid
      if (context.read<ProfileProvider>().profile != null) {
        Navigator.pushReplacementNamed(context, '/main');
      } else {
        // Token likely expired or invalid
        await SecureStorageHelper.clearAll();
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/login');
      }
    } else {
      // No token, go to login
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: LoadingScreen(),
    );
  }
}
