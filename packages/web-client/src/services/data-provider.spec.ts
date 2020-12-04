import { describe, it, before, beforeEach } from 'mocha'
import { assert, expect } from 'chai'
import AuthService from './authentication';
import GlobalOptions from '../class/global_options';
import DataProvider from './data-provider'

describe('Data Provider', () => {

    GlobalOptions.set({ host: 'http://localhost:3001' })

    const authService = AuthService.getInstance();
    const dataProvider = DataProvider.getInstance();

    before(async () => {

        // Running modular-rest server
        // const mrest = require('modular-rest');
        // await mrest.createRest();

        // Mocking global XMLHttpRequest class
        let xhr = require('xmlhttprequest-ts');
        global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('should login as anonymous', (done) => {

        authService.loginAsAnonymous()
            .then(() => done())
            .catch(done)

    })

    it('should run a find query', async () => {

        await dataProvider.find({
            database: 'cms',
            collection: 'permission',
            query: {},
        })
            .then(permissions => {
                expect(permissions.length).greaterThan(-1);
            })
            .catch(error => {
                expect(error.hasError).to.be.false
            })

    })
})