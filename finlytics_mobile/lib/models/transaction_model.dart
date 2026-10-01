class TransactionModel {
  final String id;
  final String description;
  final double amount;
  final String type; // 'income' or 'expense'
  final String category;
  final String date;

  TransactionModel({
    required this.id,
    required this.description,
    required this.amount,
    required this.type,
    required this.category,
    required this.date,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id']?.toString() ?? '',
      description: json['description'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      type: json['type'] ?? 'expense',
      category: json['category'] ?? 'Other',
      date: json['date'] ?? json['created_at'] ?? '',
    );
  }

  bool get isIncome => type == 'income';
}
