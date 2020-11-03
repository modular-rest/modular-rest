import { Expect, Test, TestFixture, SetupFixture, Timeout, TestCase, } from 'alsatian';
import AuthService from './auth-service';

@TestFixture('Auth')
export class AuthServiceTest {

    @SetupFixture
    public setGlobals() {

        // Mocking global XMLHttpRequest class
        let xhr = require('xmlhttprequest-ts');
        global.XMLHttpRequest = xhr.XMLHttpRequest;
    }

    @Test('Login Anonymous')
    @Timeout(30000)
    public async loginAsAnonymous() {

        let authService = AuthService
            .getInstance('http://localhost:3000');

        await authService.loginAsAnonymous()
            .then(body => {
                Expect(body.token).toBeDefined();
            })
            .catch(error => {
                Expect(error.hasError).toBe(false);
            })

    }

    @Test('Login with email')
    @Timeout(30000)
    @TestCase('admin@email.com', '@dmin')
    public async loginToDefaultAdmin(email: string, password: string) {

        let authService = AuthService
            .getInstance('http://localhost:3000');

        await authService.login({
            idType: 'email',
            id: email,
            password: password
        })
            .then(body => {
                Expect(body.token).toBeDefined();
            })
            .catch(error => {
                Expect(error.hasError).toBe(false);
            })
    }
}