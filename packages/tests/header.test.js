const { disconnectDb } = require('./factories/dbFactory');
const Page = require('./helpers/page');

let page;

beforeEach( async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach( async () => {
    await page.close();
});

test('the header has the correct text', async () => {
    const text = await page.getTextOf('.navbar > h1 > a');
    expect(text).toEqual(' DevConnector');
});

test('clicking login redirect to login', async() => {
    await page.click('.navbar > ul > li:last-child > a');

    const url = await page.url();
    expect(url).toEqual('http://localhost:3000/login');

});

test('when signed in, shows logout button ', async () => {
    await page.login();

    const text = await page.getTextOf('.navbar > ul > li:last-child > a');
    expect(text).toEqual(' Logout');
});

afterAll(disconnectDb);