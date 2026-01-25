import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../config.dart';

class AuthService {
  final _storage = const FlutterSecureStorage();
  
  // Singleton
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  String? _token;
  Map<String, dynamic>? _currentUser;

  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get currentUser => _currentUser;
  String? get token => _token;

  /// Check if a valid token exists on disk
  Future<bool> tryAutoLogin() async {
    final storedToken = await _storage.read(key: 'jwt_token');
    final storedUser = await _storage.read(key: 'user_data');
    
    if (storedToken != null && storedUser != null) {
      _token = storedToken;
      _currentUser = json.decode(storedUser);
      return true;
    }
    return false;
  }

  /// Login to Payload CMS
  Future<bool> login(String email, String password) async {
    try {
      final url = Uri.parse('${Config.apiBaseUrl}/users/login');
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Payload returns: { "message": "...", "token": "...", "user": { ... } }
        _token = data['token'];
        _currentUser = data['user'];

        if (_token != null) {
          await _storage.write(key: 'jwt_token', value: _token);
          await _storage.write(key: 'user_data', value: json.encode(_currentUser));
          return true;
        }
      } else {
        print('Login failed: ${response.body}');
      }
    } catch (e) {
      print('Login Error: $e');
    }
    return false;
  }

  /// Logout
  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    await _storage.deleteAll();
  }
}
