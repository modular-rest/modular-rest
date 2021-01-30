import 'package:rxdart/rxdart.dart';

class EventBus {
  static final EventBus _instance = EventBus._internal();
  final _tokenSubject = BehaviorSubject<String>();
  Stream get tokenStream => _tokenSubject.stream;

  EventBus._internal();

  factory EventBus() {
    return _instance;
  }

  void onClose() {
    _tokenSubject.close();
  }
}
