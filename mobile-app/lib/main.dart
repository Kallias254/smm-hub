import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const SmmHubApp());
}

class SmmHubApp extends StatelessWidget {
  const SmmHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SMM Hub Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
