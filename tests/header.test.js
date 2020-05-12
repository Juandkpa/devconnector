const puppeteer = require('puppeteer');

let browser, page;

beforeEach( async () => {
    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
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

afterEach( async () => {
    await browser.close();
});