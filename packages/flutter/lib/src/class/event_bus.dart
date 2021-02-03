import 'package:rxdart/rxdart.dart';

final _tokenController = BehaviorSubject<String>();

class EventBus {
  static final EventBus _instance = EventBus._internal();
  Sink<String> get tokenSink => _tokenController.sink;
  Stream<String> get tokenStream => _tokenController.stream;

  EventBus._internal();

  factory EventBus() {
    return _instance;
  }

  void onClose() {
    _tokenController.close();
  }
}
