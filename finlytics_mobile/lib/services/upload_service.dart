import 'dart:io';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/document_model.dart';

class UploadService {
  final Dio _dio;

  UploadService(this._dio);

  Future<List<DocumentModel>> getDocuments() async {
    try {
      final response = await _dio.get(ApiConfig.documents);
      if (response.statusCode == 200) {
        final data = response.data;
        List items = data is List ? data : (data['documents'] ?? data['items'] ?? []);
        final docs = items.map((j) => DocumentModel.fromJson(j)).toList();
        return docs;
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, dynamic>> uploadFile({
    required File file,
    required String documentType,
    void Function(double progress)? onProgress,
  }) async {
    try {
      final fileName = file.path.split('/').last.split('\\').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        'document_type': documentType,
      });

      final response = await _dio.post(
        ApiConfig.documentsUpload,
        data: formData,
        onSendProgress: (sent, total) {
          if (total > 0 && onProgress != null) {
            onProgress(sent / total);
          }
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': response.data};
      }
      return {'success': false, 'error': 'Upload failed'};
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data?['detail'] ?? 'Upload failed. Check network.',
      };
    } catch (e) {
      return {'success': false, 'error': 'Unexpected error: $e'};
    }
  }
}
