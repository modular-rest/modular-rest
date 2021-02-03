@Timeout(const Duration(seconds: 120))
import 'package:flutter_test/flutter_test.dart';
import 'package:mrest_flutter/mrest_flutter.dart';

void main() {
  group('data provider', () {
    AuthService auth = AuthService();
    DataProvider dataProvider = DataProvider();

    setUp(() async {
      GlobalOptions globalOptions = GlobalOptions();
      globalOptions.setOption(baseUrl: 'https://data.goranee.ir');

      await auth.login(
        id: 'admin@email.com',
        idType: IDType.email,
        password: '@dmin',
      );
    });

    test('find', () async {
      await dataProvider
          .find(FindQuery(
        database: 'tab',
        collection: 'song',
        query: {},
      ))
          .then((list) {
        expect(true, true);
      }).catchError((error) {
        expect(error.hasError, false);
      });
    });

    test('find one', () async {
      await dataProvider
          .findOne(FindQuery(
        database: 'tab',
        collection: 'song',
        query: {},
      ))
          .then((doc) {
        expect(true, true);
      }).catchError((error) {
        expect(error.hasError, false);
      });
    });

    test('count', () async {
      await dataProvider
          .count(FindQuery(
        database: 'tab',
        collection: 'song',
        query: {},
      ))
          .then((count) {
        expect(true, true);
      }).catchError((error) {
        expect(error.hasError, false);
      });
    });

    test('update one', () async {
      await dataProvider
          .updateOne(UpdateQuery(
        database: 'tab',
        collection: 'song',
        query: {'name': 'dsdf'},
        update: {},
      ))
          .then((result) {
        expect(true, true);
      }).catchError((error) {
        expect(error.hasError, false);
      });
    });

    test('aggregate', () async {
      await dataProvider
          .aggregate(
        AggregateQuery(
          database: 'tab',
          collection: 'song',
          pipelines: [
            {'\$count': 'count'}
          ],
        ),
      )
          .then((result) {
        expect(true, true);
      }).catchError((error) {
        expect(error.hasError, false);
      });
    });
  });
}
