import 'package:flutter/foundation.dart';
import 'package:mrest_flutter/src/class/user.dart';

import '../src/class/http_client.dart';
import '../src/class/global_options.dart';
import '../src/class/response.dart';
import '../src/class/event_bus.dart';

enum IDType { email, phone }

class AuthService {
  final _eventBus = EventBus();
  final HttpClient _http = HttpClient();
  String _token;
  bool isLogin = false;

  String get baseUrl => GlobalOptions().baseUrl;

  /*
   * Singleton pattern
   */
  static final AuthService _instance = AuthService._internal();
  AuthService._internal() {
    _eventBus.tokenStream.listen((token) {
      isLogin = true;
    });
  }

  factory AuthService() {
    return _instance;
  }
  //-- End Singleton pattern

  // Emit token to other service listeners.
  void _emitToken() {
    _eventBus.tokenSink.add(_token);
  }

  Future<void> _waiteUntilTokenEmitted() {
    return Future.doWhile(() async {
      if (isLogin)
        return false;
      else {
        await Future.delayed(Duration(milliseconds: 500));
        return true;
      }
    });
  }

  /// Login as an anonymouse user
  Future<LoginResponse> loginAsAnonymous() {
    return _http.get(baseUrl + '/user/loginAnonymous').then((body) {
      Map bodyMap = body as Map;
      _token = bodyMap['token'];
      _emitToken();
      return LoginResponse(false, null, bodyMap['status'], bodyMap['token']);
    }).then((value) async {
      await _waiteUntilTokenEmitted();
      return value;
    }).catchError((value) {
      return LoginResponse(true, value, 'fail', null);
    });
  }

  /// login as an registered user
  Future<User> login({
    @required IDType idType,
    @required String id,
    @required String password,
  }) {
    Map data = {
      'idType': (idType.index == IDType.email.index) ? 'email' : 'phone',
      'id': id,
      'password': password,
    };

    return _http.post(baseUrl + '/user/login', body: data).then((body) {
      Map bodyMap = body as Map;
      _token = bodyMap['token'];
      _emitToken();
      return validateToken(_token);
    }).then((value) async {
      await _waiteUntilTokenEmitted();
      return value;
    }).catchError((value) {
      throw LoginResponse(true, value, 'fail', null);
    });
  }

  Future<User> validateToken(String token) {
    Map data = {
      'token': token,
    };

    return _http.post(baseUrl + '/verify/token', body: data).then((body) {
      Map userData = body['user'];
      return User(
        id: userData['id'],
        type: userData['type'],
        email: userData['email'],
        phone: userData['phone'],
        permission: userData['permission'],
      );
    }).catchError((error) {
      BaseResponse(true, error, 'fail');
    });
  }

  /// Register user identity,
  /// first step for creating new account
  Future<BaseResponse> registerIndentity({
    @required IDType idType,
    @required String id,
  }) {
    Map data = {
      'idType': (idType.index == IDType.email.index) ? 'email' : 'phone',
      'id': id,
    };

    return _http.post(baseUrl + '/user/register_id', body: data).then((value) {
      Map body = value as Map;
      return BaseResponse(false, null, body['status']);
    }).catchError((value) => throw BaseResponse(true, value, 'fail'));
  }

  /// Send verification code to server,
  /// second step for creating new account.
  Future<ValidateCodeResponse> validateCode(String id, String code) {
    Map data = {
      'id': id,
      'code': code,
    };

    return _http.post(baseUrl + '/user/validateCode', body: data).then((value) {
      Map body = value as Map;
      return ValidateCodeResponse(false, null, body['status'], body['isValid']);
    }).catchError(
        (value) => throw ValidateCodeResponse(true, value, 'fail', false));
  }

  /// Submit password,
  /// third step for creating new account.
  Future<BaseResponse> submitPassword(String id, String code, String password) {
    Map data = {
      'id': id,
      'code': code,
      'password': password,
    };

    return _http
        .post(baseUrl + '/user/submit_password', body: data)
        .then((value) {
      Map body = value as Map;
      return BaseResponse(false, null, body['status']);
    }).catchError((value) => throw BaseResponse(true, value, 'fail'));
  }

  /// Change password
  Future<BaseResponse> changePassword(String id, String code, String password) {
    Map data = {
      'id': id,
      'code': code,
      'password': password,
    };

    return _http
        .post(baseUrl + '/user/change_password', body: data)
        .then((value) {
      Map body = value as Map;
      return BaseResponse(false, null, body['status']);
    }).catchError((value) => throw BaseResponse(true, value, 'fail'));
  }
}
