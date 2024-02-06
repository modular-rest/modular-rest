import 'package:flutter/foundation.dart';
import 'dart:convert' as convert;

abstract class BaseQuery {
  String database;
  String collection;

  BaseQuery(this.database, this.collection);

  String getJson();
}

class FindQuery extends BaseQuery {
  /// query object contains find conditions
  Map<String, dynamic> query;
  List populate;
  int skip;
  int limit;
  dynamic sort;
  dynamic select;

  FindQuery({
    @required String database,
    @required String collection,
    @required this.query,
    this.populate = const [],
    this.skip = 0,
    this.limit,
    this.select,
    this.sort,
  }) : super(database, collection);

  @override
  String getJson() {
    Map data = {
      'database': database,
      'collection': collection,
      'query': query,
      'populate': populate,
      'options': {
        'skip': skip,
      }
    };

    if (limit != null) data['options']['limit'] = limit;
    if (select != null) data['options']['select'] = select;
    if (sort != null) data['options']['sort'] = sort;

    return convert.json.encode(data);
  }
}

class FindByIDsQuery extends BaseQuery {
  List<String> ids;

  FindByIDsQuery({
    @required String database,
    @required String collection,
    @required this.ids,
  }) : super(database, collection);

  @override
  String getJson() {
    Map data = {
      'database': database,
      'collection': collection,
      'ids': ids,
    };

    return convert.json.encode(data);
  }
}

class UpdateQuery extends BaseQuery {
  Map<String, dynamic> query;
  Map<String, dynamic> update;

  UpdateQuery({
    @required String database,
    @required String collection,
    @required this.query,
    @required this.update,
  }) : super(database, collection);

  @override
  String getJson() {
    Map data = {
      'database': database,
      'collection': collection,
      'query': query,
      'update': update
    };

    return convert.json.encode(data);
  }
}

class InsertQuery extends BaseQuery {
  Map<String, dynamic> doc;

  InsertQuery({
    @required String database,
    @required String collection,
    @required this.doc,
  }) : super(database, collection);

  @override
  String getJson() {
    Map data = {
      'database': database,
      'collection': collection,
      'doc': doc,
    };

    return convert.json.encode(data);
  }
}

class AggregateQuery extends BaseQuery {
  List<Map> pipelines;
  Map<String, dynamic> accessQuery;

  AggregateQuery({
    @required String database,
    @required String collection,
    @required this.pipelines,
    this.accessQuery = const {},
  }) : super(database, collection);

  @override
  String getJson() {
    Map data = {
      'database': database,
      'collection': collection,
      'pipelines': pipelines,
      'accessQuery': accessQuery,
    };

    return convert.json.encode(data);
  }
}
