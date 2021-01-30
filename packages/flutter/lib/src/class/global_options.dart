class GlobalOptions {
  String _baseURL;
  String get baseUrl => _baseURL;

  static GlobalOptions _instance = GlobalOptions._internal();

  GlobalOptions._internal();

  factory GlobalOptions() {
    return _instance;
  }

  void setOption({String baseUrl}) {
    this._baseURL = baseUrl;
  }
}
