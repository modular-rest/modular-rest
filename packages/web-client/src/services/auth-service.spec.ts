import { describe, it, before, beforeEach } from 'mocha'
import { assert, expect } from 'chai'
import AuthService from './auth-service';

describe('Auth Service', () => {

    let authService = AuthService
        .getInstance('http://localhost:3000');

    before(async () => {

        // Running modular-rest server
        const mrest = require('modular-rest');
        await mrest.createRest();

        // Mocking global XMLHttpRequest class
        let xhr = require('xmlhttprequest-ts');
        global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('Login Anonymous', async () => {

        await authService.loginAsAnonymous()
            .then(body => {
                expect(body).to.include.keys('token')
            }).catch(error => {
                expect(error.hasError).to.be.false
            })

    })

    it('Login with email', async () => {

        await authService.login({
            idType: 'email',
            id: 'admin@email.com',
            password: '@dmin',
        }).then(body => {
            expect(body).to.include.keys('token')
        }).catch(error => {
            expect(error.hasError).to.be.false
        })
    })

    describe('Register a new user', async () => {

        let fakeMail = 'email' + new Date().getMilliseconds + '@fake.com';
        let fakePassword = '1234567890';

        it('Register identity', async () => {
            await authService.registerIdentity({
                id: fakeMail,
                idType: 'email'
            })
                .then((body) => {
                    expect(body).to.have.property('status', 'success');
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })

        it('Validate verification code', async () => {
            await authService.validateCode({
                id: fakeMail,
                code: '123'
            })
                .then((body) => {
                    expect(body.isValid).to.be.true
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })

        it('Submit Password', async () => {
            await authService.submitPassword({
                id: fakeMail,
                code: '123',
                password: fakePassword
            })
                .then((body) => {
                    expect(body).to.have.property('status', 'success');
                }).catch(error => {
                    expect(error.hasError).to.be.false
                })
        })
    })
})