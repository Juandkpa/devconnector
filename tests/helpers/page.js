const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const { getUser } = require('../factories/dbFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
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
        await this.page.goto('localhost:3000');
        await this.page.waitFor('.navbar > ul > li:last-child > a');
    }

    async getTextOf(selector) {
        return this.page.$eval(selector, el => el.innerText);
    }
}

module.exports = CustomPage;