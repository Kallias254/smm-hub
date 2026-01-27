import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:io';
import 'dart:convert';
import '../config.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _posts = [];
  bool _isLoading = true;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'jwt_token');
      final agencySlug = await _storage.read(key: 'agency_slug');

      if (token == null || agencySlug == null) {
        // Redirect to login if needed, for now just show error
        setState(() => _isLoading = false);
        return;
      }

      final url = Uri.parse('${Config.apiBaseUrl}/posts?where[distributionStatus][in]=pending,queued&limit=20&sort=-createdAt');
      
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'JWT $token',
          'X-Tenant-Subdomain': agencySlug,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          setState(() {
            _posts = data['docs'];
            _isLoading = false;
          });
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching tasks: $e')),
        );
      }
    }
  }

  /// Flow 1: Share to WhatsApp (Manual Approval)
  Future<void> _handleShare(Map<String, dynamic> post) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    try {
      String? imageUrl;
      if (post['assets']?['brandedMedia'] != null) {
        imageUrl = post['assets']['brandedMedia']['url'];
      }
      
      if (imageUrl == null) {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('No media generated yet!')));
        return;
      }

      // Handle localhost to emulator mapping
      if (imageUrl.startsWith('http://localhost:3000')) {
        imageUrl = imageUrl.replaceFirst('http://localhost:3000', 'http://10.0.2.2:3000');
      }

      final response = await http.get(Uri.parse(imageUrl));
      final temp = await getTemporaryDirectory();
      final path = '${temp.path}/branded_${post['id']}.png';
      File(path).writeAsBytesSync(response.bodyBytes);

      final title = post['title'] ?? 'New Property';
      
      await Share.shareXFiles(
        [XFile(path)],
        text: "Hi! Check out this post for approval:\n\n$title",
      );

    } catch (e) {
      scaffoldMessenger.showSnackBar(SnackBar(content: Text('Share failed: $e')));
    }
  }

  /// Flow 2: Official Approval (Triggers Postiz)
  Future<void> _publishToSocials(String postId) async {
    setState(() => _isLoading = true);
    try {
      final token = await _storage.read(key: 'jwt_token');
      final agencySlug = await _storage.read(key: 'agency_slug');

      await http.patch(
        Uri.parse('${Config.apiBaseUrl}/posts/$postId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'JWT $token',
          'X-Tenant-Subdomain': agencySlug ?? '',
        },
        body: json.encode({'distributionStatus': 'queued'}),
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sent to Distribution Queue!'), backgroundColor: Colors.green),
      );
      _fetchPosts(); 
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Publish failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchPosts,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService().logout();
              if (mounted) Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _posts.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _posts.length,
                  itemBuilder: (context, index) => _buildTaskCard(_posts[index]),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.check_circle_outline, size: 100, color: Colors.green.shade100),
          const SizedBox(height: 24),
          const Text('No Pending Tasks', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const Text('Your social media is currently up to date.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildTaskCard(Map<String, dynamic> post) {
    final isReady = post['assets']?['brandedMedia'] != null;
    final status = post['distributionStatus'];
    
    String? imageUrl;
    if (isReady) {
      imageUrl = post['assets']['brandedMedia']['url'];
      if (imageUrl != null && imageUrl.startsWith('http://localhost:3000')) {
        imageUrl = imageUrl.replaceFirst('http://localhost:3000', 'http://10.0.2.2:3000');
      }
    }

    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (imageUrl != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Image.network(imageUrl, height: 200, fit: BoxFit.cover),
            )
          else
            Container(
              height: 100,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: const Center(child: Text('Generating Branded Content...')),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        post['title'] ?? 'New Listing',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    _buildStatusBadge(status),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Channels: ${(post['channels'] as List?)?.join(', ') ?? 'All'}'),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isReady ? () => _handleShare(post) : null,
                        icon: const Icon(Icons.whatsapp),
                        label: const Text('WhatsApp Client'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: isReady && status == 'pending' 
                           ? () => _publishToSocials(post['id']) 
                           : null,
                        icon: const Icon(Icons.rocket_launch),
                        label: const Text('Publish'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.orange;
    String label = 'Pending';
    if (status == 'queued') { color = Colors.blue; label = 'Queued'; }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }
}