const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const { getUser } = require('../factories/dbFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            arg: ['--no-sandbox']
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);


        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user =  await getUser();
        const token = await sessionFactory(user);

        await this.page.evaluate((value) => localStorage.setItem('token', value), token);
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitFor('.navbar > ul > li:last-child > a');
    }

    async getTextOf(selector) {
        return this.page.$eval(selector, el => el.innerText);
    }

    get(path, token) {

        return this.page.evaluate(
            (_path, _token) => {
                return fetch( _path, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': _token
                    }
                }).then( res => res.json() );
            },
            path, token
        );
    }

    post(path, token, data) {

        return this.page.evaluate(
            (_path, _token, _data) => {
                return fetch( _path, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': _token
                    },
                    body: JSON.stringify(_data)
                }).then( res => res.json() );
            },
            path, token, data
        );
    }

    execRequests(actions, token) {
        return Promise.all(
            actions.map(({ method, path, data }) => this[method](path, token, data) )
        );
    }


}

module.exports = CustomPage;