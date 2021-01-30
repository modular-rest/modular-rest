import 'dart:convert';

import 'package:http/http.dart' as http;
import 'dart:convert' as convert;

import 'package:http/http.dart';

class HttpClient {
  String analyseResponse(Response response) {
    if (response.statusCode == 200 || response.statusCode == 201)
      return response.body;
    else
      throw response.body;
  }

  Future<dynamic> post(String url, {Map body, Map headers}) {
    return http
        .post(url, body: body, headers: headers)
        .then(analyseResponse)
        .then((bodyString) {
      try {
        return convert.json.decode(bodyString);
      } catch (e) {
        return bodyString;
      }
    });
  }

  Future<dynamic> get(String url, {Map query, Map headers}) {
    return http
        .get(url, headers: headers)
        .then(analyseResponse)
        .then((bodyString) {
      try {
        return convert.json.decode(bodyString);
      } catch (e) {
        return bodyString;
      }
    });
  }
}
