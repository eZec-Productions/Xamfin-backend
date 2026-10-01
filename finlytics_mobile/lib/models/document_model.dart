class DocumentModel {
  final String id;
  final String filename;
  final String documentType;
  final String status;
  final String uploadedAt;
  final double? fileSizeKb;

  DocumentModel({
    required this.id,
    required this.filename,
    required this.documentType,
    required this.status,
    required this.uploadedAt,
    this.fileSizeKb,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      id: json['id']?.toString() ?? '',
      filename: json['filename'] ?? json['file_name'] ?? 'Unknown',
      documentType: json['document_type'] ?? json['type'] ?? 'Other',
      status: json['status'] ?? 'pending',
      uploadedAt: json['uploaded_at'] ?? json['created_at'] ?? '',
      fileSizeKb: (json['file_size_kb'] ?? json['size'])?.toDouble(),
    );
  }

  bool get isProcessed => status == 'processed' || status == 'approved';
  bool get isPending => status == 'pending' || status == 'processing';
}
