class Config {
  // 10.0.2.2 is the localhost for Android Emulator.
  // Use your computer's local IP (e.g., 192.168.1.X) for physical devices.
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api';
  
  // For the MVP, we hardcode the API Key or User Token here.
  // In a real app, you'd implement a Login Screen.
  static const String apiKey = 'YOUR_API_KEY_OR_JWT_HERE';
}
