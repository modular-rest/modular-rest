import 'package:mrest_flutter/src/class/response.dart';

import '../src/class/event_bus.dart';
import '../src/class/global_options.dart';
import '../src/class/http_client.dart';

import '../src/class/query.dart';
export '../src/class/query.dart';

class DataProvider {
  final _eventBus = EventBus();
  final HttpClient _http = HttpClient();

  String _token;
  String get _baseUrl => GlobalOptions().baseUrl;
  Map<String, String> get _headers => {
        'authorization': this._token,
        'content-type': 'application/json',
      };

  /*
    Singleton Patern
  */
  static final DataProvider _instance = DataProvider._internal();

  DataProvider._internal() {
    _eventBus.tokenStream.listen(_onReceivedToken);
    _http.bodyMutator = (body) => body['data'];
  }

  factory DataProvider() {
    return _instance;
  }
  //-- End Singleton pattern

  _onReceivedToken(String token) {
    _token = token;
  }

  Future<List<Map>> find(FindQuery query) {
    return _http
        .post(
      _baseUrl + '/data-provider/find',
      body: query.getJson(),
      headers: _headers,
    )
        .then((body) {
      List<Map> list = (body as List).map((e) => e as Map).toList();
      return list;
    }).catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<Map> findOne(FindQuery query) {
    return _http
        .post(
          _baseUrl + '/data-provider/find-one',
          body: query.getJson(),
          headers: _headers,
        )
        .then((body) => body as Map)
        .catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<int> count(FindQuery query) {
    return _http
        .post(
          _baseUrl + '/data-provider/count',
          body: query.getJson(),
          headers: _headers,
        )
        .then((body) => body as int)
        .catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<Map> updateOne(UpdateQuery query) {
    return _http
        .post(
          _baseUrl + '/data-provider/update-one',
          body: query.getJson(),
          headers: _headers,
        )
        .then((body) => body as Map)
        .catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<Map> removeOne(FindQuery query) {
    return _http
        .post(
          _baseUrl + '/data-provider/remove-one',
          body: query.getJson(),
          headers: _headers,
        )
        .then((body) => body as Map)
        .catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<dynamic> aggregate(AggregateQuery query) {
    return _http
        .post(
          _baseUrl + '/data-provider/aggregate',
          body: query.getJson(),
          headers: _headers,
        )
        .catchError((error) => throw BaseResponse(true, error, 'fail'));
  }

  Future<List<Map>> findByIDs(FindByIDsQuery query) {
    return _http
        .post(
      _baseUrl + '/data-provider/findByIds',
      body: query.getJson(),
      headers: _headers,
    )
        .then((body) {
      List<Map> list = (body as List).map((e) => e as Map).toList();
      return list;
    }).catchError((error) => throw BaseResponse(true, error, 'fail'));
  }
}
