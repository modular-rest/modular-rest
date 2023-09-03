import { describe, it, before, after } from 'mocha'
import { assert, expect } from 'chai'
import AuthService from './authentication';
import GlobalOptions from '../class/global_options';

describe('Auth Service', () => {
    let authService = AuthService.getInstance();
    // let server: any;

    before(async () => {
        GlobalOptions.set({ host: 'http://localhost:3001' })
    })

    it('should login as Anonymous', async () => {

        await authService.loginAsAnonymous()
            .then(body => {
                expect(body).to.include.keys('token')
            }).catch(error => {
                expect(error.hasError).to.be.false
            })

    })

    it('should login with email', async () => {

        await authService.login({
            idType: 'email',
            id: 'admin@email.com',
            password: '@dmin',
        }, false).then(body => {
            expect(body).to.include.keys('email')
        }).catch(error => {
            expect(error.hasError).to.be.false
        })
    })

    describe('User registration', async () => {

        let fakeMail = 'email' + new Date().getMilliseconds() + '@fake.com';
        let fakePassword = '1234567890';

        it('should register an identity', async () => {
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

        it('should validate verification code', async () => {
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

        it('should submit password', async () => {
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

        describe('Password change', () => {

            it('should register an identity', async () => {
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

            it('should validate verification code', async () => {
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

            it('should submit Password', async () => {
                await authService.changePassword({
                    id: fakeMail,
                    code: '123',
                    password: fakePassword + '-changed'
                })
                    .then((body) => {
                        expect(body).to.have.property('status', 'success');
                    }).catch(error => {
                        expect(error.hasError).to.be.false
                    })
            })

        })
    })
})