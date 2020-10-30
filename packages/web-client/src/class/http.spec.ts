import { Expect, Test, SetupFixture, Timeout } from "alsatian";
import HTTP from './http';

export class HttpClient {

    @SetupFixture
    public setGlobals() {
        // mocking global XMLHttpRequest class
        let xhr = require('xmlhttprequest-ts');
        global.XMLHttpRequest = xhr.XMLHttpRequest;
    }

    @Test('Get Request')
    @Timeout(30000)
    public async getRequest() {

        let http = new HTTP({
            baseUrl: 'https://reqres.in/'
        });

        await http.get('api/users')
            .then((body: { page: number }) => {
                Expect(body.page).toBe(1);
            })
    }

}