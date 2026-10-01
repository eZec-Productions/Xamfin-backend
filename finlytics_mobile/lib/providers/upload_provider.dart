import 'dart:io';
import 'package:flutter/foundation.dart';
import '../services/upload_service.dart';
import '../models/document_model.dart';

class UploadProvider extends ChangeNotifier {
  UploadService _service;

  UploadProvider(this._service);

  void updateService(UploadService service) {
    _service = service;
  }

  List<DocumentModel> _documents = [];
  bool _isLoading = false;
  bool _isUploading = false;
  double _uploadProgress = 0.0;
  String? _uploadError;
  String _selectedDocType = 'receipt';

  List<DocumentModel> get documents => _documents;
  bool get isLoading => _isLoading;
  bool get isUploading => _isUploading;
  double get uploadProgress => _uploadProgress;
  String? get uploadError => _uploadError;
  String get selectedDocType => _selectedDocType;

  void setDocType(String type) {
    _selectedDocType = type;
    notifyListeners();
  }

  Future<void> loadDocuments() async {
    _isLoading = true;
    notifyListeners();

    try {
      _documents = await _service.getDocuments();
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> uploadFile(File file) async {
    _isUploading = true;
    _uploadProgress = 0.0;
    _uploadError = null;
    notifyListeners();

    final result = await _service.uploadFile(
      file: file,
      documentType: _selectedDocType,
      onProgress: (progress) {
        _uploadProgress = progress;
        notifyListeners();
      },
    );

    _isUploading = false;
    if (result['success'] == true) {
      await loadDocuments();
      notifyListeners();
      return true;
    } else {
      _uploadError = result['error'] ?? 'Upload failed';
      notifyListeners();
      return false;
    }
  }
}
