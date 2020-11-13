import { describe, it, before, beforeEach } from 'mocha'
import { assert } from 'chai'
import HTTP from './http';

describe('Http Client', () => {

    before(() => {

        // mocking global XMLHttpRequest class
        let xhr = require('xmlhttprequest-ts');
        global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('send GET request', async () => {
        let http = new HTTP({
            baseUrl: 'https://reqres.in/'
        });

        await http.get<{ page: number }>('api/users')
            .then((body) => {
                // Expect(body.page).toBe(1);
                assert.equal(body.page, 1)
            })
    })

})