class Post {
  final String id;
  final String title;
  final String caption; // This might be HTML or rich text, we'll need to strip it
  final String price;
  final String? imageUrl;
  final String distributionStatus;

  Post({
    required this.id,
    required this.title,
    required this.caption,
    required this.price,
    this.imageUrl,
    required this.distributionStatus,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    // Navigate the Payload relationship structure
    String? imgUrl;
    if (json['assets'] != null && 
        json['assets']['brandedMedia'] != null && 
        json['assets']['brandedMedia'] is Map) {
      imgUrl = json['assets']['brandedMedia']['url'];
    }

    // Rich text handling (simplified: assumes it's a string or extracts text)
    // Payload RichText is JSON. For now, we assume basic string or handle in UI.
    // If it's a Map (Slate/Lexical), we'd need a serializer. 
    // We'll treat it as empty if complex for this prototype.
    String captionText = '';
    if (json['caption'] is String) {
      captionText = json['caption'];
    } else {
      captionText = "Check CMS for caption"; // Placeholder for complex RichText
    }

    return Post(
      id: json['id'],
      title: json['title'] ?? 'Untitled',
      caption: captionText,
      price: json['price'] ?? '',
      imageUrl: imgUrl,
      distributionStatus: json['distributionStatus'] ?? 'unknown',
    );
  }
}
