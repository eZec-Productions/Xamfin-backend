class UserModel {
  final String id;
  final String email;
  final String name;
  final String companyName;
  final String industry;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.companyName,
    required this.industry,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? json['full_name'] ?? '',
      companyName: json['company_name'] ?? json['companyName'] ?? '',
      industry: json['industry'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'company_name': companyName,
      'industry': industry,
    };
  }
}
