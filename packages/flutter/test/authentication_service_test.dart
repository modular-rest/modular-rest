import 'package:flutter_test/flutter_test.dart';

import 'package:mrest_flutter/mrest_flutter.dart';

void main() {
  group('Authentication service', () {
    setUp(() {
      GlobalOptions globalOptions = GlobalOptions();
      globalOptions.setOption(baseUrl: 'https://data.goranee.ir');
    });

    test('login as anonymouse', () async {
      await AuthService().loginAsAnonymous().then((loginResponse) {
        expect(loginResponse.hasError, false);
      });
    });

    test('login as a user', () async {
      await AuthService()
          .login(
        idType: IDType.email,
        id: 'admin@email.com',
        password: '@dmin',
      )
          .then((user) {
        expect(user.type, 'user');
      });
    });

    group('register a user', () {
      String microsecond = DateTime.now().microsecond.toString();
      String fakeMail = 'email' + microsecond + '@fake.com';
      String fakePassword = '1234567890';
      String smsCode = '123';

      test('register identity', () async {
        await AuthService()
            .registerIndentity(idType: IDType.email, id: fakeMail)
            .then((response) {
          expect(response.hasError, false);
        });
      });

      test('validate varification code', () async {
        await AuthService()
            .validateCode(fakePassword, smsCode)
            .then((response) {
          expect(response.isValid, true);
        });
      });

      test('submit password', () async {
        await AuthService()
            .submitPassword(fakeMail, smsCode, fakePassword)
            .then((response) {
          expect(response.hasError, false);
        });
      });
    });
  });
}
