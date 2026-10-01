import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/upload_provider.dart';
import '../../widgets/upload_tile.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  final ImagePicker _picker = ImagePicker();

  final List<Map<String, String>> _docTypes = [
    {'label': 'Receipt', 'value': 'receipt'},
    {'label': 'Invoice', 'value': 'invoice'},
    {'label': 'Bank Statement', 'value': 'bank_statement'},
    {'label': 'Tax Document', 'value': 'tax_document'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UploadProvider>().loadDocuments();
    });
  }

  Future<void> _pickFromCamera() async {
    final picked = await _picker.pickImage(source: ImageSource.camera);
    if (picked != null) {
      _uploadFile(File(picked.path));
    }
  }

  Future<void> _pickFromGallery() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      _uploadFile(File(picked.path));
    }
  }

  Future<void> _pickPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    if (result != null && result.files.single.path != null) {
      _uploadFile(File(result.files.single.path!));
    }
  }

  Future<void> _uploadFile(File file) async {
    final provider = context.read<UploadProvider>();
    final success = await provider.uploadFile(file);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Document uploaded successfully! Processing started.',
              style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              provider.uploadError ?? 'Failed to upload document',
              style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
            ),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final uploadProvider = context.watch<UploadProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Upload Documents',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w800,
            fontSize: 18,
            letterSpacing: -0.3,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => uploadProvider.loadDocuments(),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: Colors.white,
        onRefresh: () => uploadProvider.loadDocuments(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Document Type Selector
              Text(
                'Document Category',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: uploadProvider.selectedDocType,
                    isExpanded: true,
                    dropdownColor: Colors.white,
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
                    items: _docTypes.map((item) {
                      return DropdownMenuItem<String>(
                        value: item['value'],
                        child: Text(
                          item['label']!,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        uploadProvider.setDocType(val);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Upload Action Buttons (Camera, Gallery, PDF)
              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.camera_alt_rounded,
                      label: 'Camera',
                      sublabel: 'Scan Receipt',
                      color: AppColors.primary,
                      onTap: uploadProvider.isUploading ? null : _pickFromCamera,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.photo_library_rounded,
                      label: 'Gallery',
                      sublabel: 'Pick Photo',
                      color: AppColors.primary,
                      onTap: uploadProvider.isUploading ? null : _pickFromGallery,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.picture_as_pdf_rounded,
                      label: 'PDF File',
                      sublabel: 'Statement',
                      color: AppColors.primary,
                      onTap: uploadProvider.isUploading ? null : _pickPdf,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Upload Progress Bar
              if (uploadProvider.isUploading) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFFD2B3)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Uploading document...',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${(uploadProvider.uploadProgress * 100).toInt()}%',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(
                        value: uploadProvider.uploadProgress > 0 ? uploadProvider.uploadProgress : null,
                        backgroundColor: const Color(0xFFFFF0E6),
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Recent Uploads / Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Uploads',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Text(
                    '${uploadProvider.documents.length} files',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (uploadProvider.isLoading && uploadProvider.documents.isEmpty) ...[
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                ),
              ] else if (uploadProvider.documents.isEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF0E6),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFFFD2B3)),
                          ),
                          child: const Icon(
                            Icons.cloud_upload_rounded,
                            size: 36,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'No documents uploaded yet',
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                ...uploadProvider.documents.map(
                  (doc) => UploadTile(document: doc),
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required String sublabel,
    required Color color,
    required VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0E6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.primary, size: 22),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                sublabel,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
