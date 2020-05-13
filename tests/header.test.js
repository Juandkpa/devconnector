const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const {getUser, disconnectDb } = require('./factories/dbFactory');




let browser, page;

beforeEach( async () => {
    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
});

afterEach( async () => {
    await browser.close();
});

test('the header has the correct text', async () => {
    const text = await page.$eval('.navbar > h1 > a', el => el.innerText);
    expect(text).toEqual(' DevConnector');
});

test('clicking login redirect to login', async() => {
    await page.click('.navbar > ul > li:last-child > a');

    const url = await page.url();
    expect(url).toEqual('http://localhost:3000/login');

});

test('when signed in, shows logout button ', async () => {
    const user =  await getUser();
    const token = await sessionFactory(user);

    await page.evaluate((value) => localStorage.setItem('token', value), token);
    await page.goto('localhost:3000');
    await page.waitFor('.navbar > ul > li:last-child > a');

    const text = await page.$eval('.navbar > ul > li:last-child > a', el => el.innerText);
    expect(text).toEqual(' Logout');
});

afterAll(disconnectDb);

