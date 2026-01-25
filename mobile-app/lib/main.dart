import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';
import 'services/auth_service.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    await NotificationService().initialize();
  } catch (e) {
    print("⚠️ Firebase Initialization Failed (Expected if google-services.json is missing): $e");
  }

  // Check if user is already logged in
  final bool isLoggedIn = await AuthService().tryAutoLogin();

  runApp(SmmHubApp(isLoggedIn: isLoggedIn));
}

class SmmHubApp extends StatelessWidget {
  final bool isLoggedIn;

  const SmmHubApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SMM Hub Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: isLoggedIn ? const HomeScreen() : const LoginScreen(),
    );
  }
}
