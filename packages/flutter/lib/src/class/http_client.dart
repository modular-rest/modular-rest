import 'dart:convert';

import 'package:http/http.dart' as http;
import 'dart:convert' as convert;

import 'package:http/http.dart';

class HttpClient {
  dynamic Function(dynamic body) bodyMutator;
  dynamic analyseResponse(Response response) {
    if (response.statusCode == 200 || response.statusCode == 201)
      return response.body;
    else
      throw response.body;
  }

  Future<dynamic> post(String url,
      {dynamic body, Map<String, String> headers}) {
    return http
        .post(url, body: body, headers: headers)
        .then(analyseResponse)
        .then((bodyString) {
      try {
        return convert.json.decode(bodyString);
      } catch (e) {
        return bodyString;
      }
    }).then((body) {
      if (bodyMutator != null)
        return bodyMutator(body);
      else
        return body;
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
    }).then((body) {
      if (bodyMutator != null)
        return bodyMutator(body);
      else
        return body;
    });
  }
}
