import { describe, it, before, beforeEach } from 'mocha'
import { assert } from 'chai'
import HTTP from './http';
import GlobalOption from './global_options';

describe('Http Client', () => {

    before(() => {

        // mocking global XMLHttpRequest class
        // let xhr = require('xmlhttprequest-ts');
        // global.XMLHttpRequest = xhr.XMLHttpRequest;

    })

    it('send GET request', async function () {
        GlobalOption.set({
            host: 'https://reqres.in'
        });

        let http = new HTTP();

        this.timeout(1000)

        await http.get<{ page: number }>('api/users')
            .then((body) => {
                // Expect(body.page).toBe(1);
                assert.equal(body.page, 1)
            })
    })

})