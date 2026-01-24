import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'dart:convert';
import '../config.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final url = Uri.parse('${Config.apiBaseUrl}/posts?where[distributionStatus][in]=queued,pending&limit=10&sort=-createdAt');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          setState(() {
            _posts = data['docs'];
            _isLoading = false;
          });
        }
      } else {
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection Error: Make sure CMS is running at ${Config.apiBaseUrl}')),
        );
      }
    }
  }

  Future<void> _handleShare(Map<String, dynamic> post) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    try {
      // 1. Get Image URL
      String? imageUrl;
      if (post['assets'] != null && post['assets']['brandedMedia'] != null) {
        imageUrl = post['assets']['brandedMedia']['url'];
      }
      
      if (imageUrl == null) {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('No branded image found to share!')));
        return;
      }

      // Fix localhost for emulator
      if (imageUrl.startsWith('http://localhost:3000')) {
        imageUrl = imageUrl.replaceFirst('http://localhost:3000', 'http://10.0.2.2:3000');
      }

      scaffoldMessenger.showSnackBar(const SnackBar(content: Text('Preparing media...'), duration: Duration(seconds: 1)));

      // 2. Download Image
      final response = await http.get(Uri.parse(imageUrl));
      final bytes = response.bodyBytes;

      // 3. Save to Temp Dir
      final temp = await getTemporaryDirectory();
      final path = '${temp.path}/share_image.png';
      File(path).writeAsBytesSync(bytes);

      // 4. Extract Caption (Simple text fallback)
      final title = post['title'] ?? 'New Property';
      final captionText = "${post['caption']?['root']?['children']?[0]?['children']?[0]?['text'] ?? 'Check this out!'}";

      // 5. Trigger System Share
      await Share.shareXFiles(
        [XFile(path)],
        text: "$title\n\n$captionText",
      );

      // 6. Ask user if they want to mark as published
      _showPublishedDialog(post['id']);

    } catch (e) {
      scaffoldMessenger.showSnackBar(SnackBar(content: Text('Share failed: $e')));
    }
  }

  void _showPublishedDialog(String postId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Post Successful?'),
        content: const Text('Did you successfully share this to the social channels?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () {
              _markAsPublished(postId);
              Navigator.pop(context);
            },
            child: const Text('Yes, Mark Published'),
          ),
        ],
      ),
    );
  }

  Future<void> _markAsPublished(String postId) async {
    try {
      await http.patch(
        Uri.parse('${Config.apiBaseUrl}/posts/$postId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'distributionStatus': 'published'}),
      );
      _fetchPosts(); // Refresh list
    } catch (e) {
      print('Failed to update status: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchPosts,
        child: CustomScrollView(
          slivers: [
            SliverAppBar.large(
              title: const Text('Marketing Tasks'),
              floating: true,
              pinned: true,
              actions: [
                IconButton(
                  icon: const Icon(Icons.account_circle_outlined),
                  onPressed: () {},
                ),
              ],
            ),
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_posts.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.done_all, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('All caught up!', style: TextStyle(fontSize: 18, color: Colors.grey)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final post = _posts[index];
                      return _buildTaskCard(post);
                    },
                    childCount: _posts.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskCard(Map<String, dynamic> post) {
    final status = post['distributionStatus'];
    final isQueued = status == 'queued';
    
    String? imageUrl;
    if (post['assets']?['brandedMedia'] != null) {
      imageUrl = post['assets']['brandedMedia']['url'];
      if (imageUrl != null && imageUrl.startsWith('http://localhost:3000')) {
        imageUrl = imageUrl.replaceFirst('http://localhost:3000', 'http://10.0.2.2:3000');
      }
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      clipBehavior: Clip.antiAlias,
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              if (imageUrl != null)
                Image.network(
                  imageUrl,
                  height: 240,
                  width: double.infinity,
                  fit: BoxFit.cover,
                )
              else
                Container(
                  height: 120,
                  color: Colors.blueGrey[50],
                  child: const Center(child: Icon(Icons.image_outlined, size: 48, color: Colors.grey)),
                ),
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isQueued ? Colors.blue : Colors.orange,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Text(
                    isQueued ? 'READY TO POST' : 'PENDING GEN',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  post['title'] ?? 'Untitled',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Destination: ${(post['channels'] as List?)?.join(' • ') ?? 'None'}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.tonalIcon(
                        onPressed: isQueued ? () => _handleShare(post) : null,
                        icon: const Icon(Icons.ios_share, size: 18),
                        label: const Text('Open Share Sheet'),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
}