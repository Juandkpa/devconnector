const { disconnectDb } = require('./factories/dbFactory');
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
   await page.close();
});

describe('When logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.waitFor('a.btn-primary');
        await page.click('a.btn-primary');
    });

    test('can see profile create form', async () => {
        const text = await page.getTextOf('form small');

        expect(text).toEqual('Give us an idea of where you are at in your career');
    });

    describe('and required inputs are filled', () => {
        beforeEach(async () => {
            await page.select('form select', 'Developer');
            await page.type('form input[name="skills"]', 'c++,python,jest');
            await page.click('form input.btn-primary');
            await page.waitFor('.container .alert-success');
        });

        test('Submitting takes user to dasboard screen with proper content', async () => {
            const text = await page.getTextOf('.container .alert-success');
            const url = await page.url();
            const editText = await page.getTextOf('.dash-buttons a:nth-child(1)');
            const addExperienceText = await page.getTextOf('.dash-buttons a:nth-child(2)');
            const addEducationText = await page.getTextOf('.dash-buttons a:nth-child(3)');

            expect(text).toEqual('Profile Created');
            expect(url).toEqual('http://localhost:3000/dashboard');
            expect(editText).toEqual(' Edit Profile');
            expect(addExperienceText).toEqual(' Add Experience');
            expect(addEducationText).toEqual(' Add Education');
        });
    });

    describe('and required inputs are not filled', () => {
        beforeEach(async() =>{
            await page.click('form input.btn-primary');
            await page.waitFor('.container .alert-danger:nth-child(1)');
        });

        test('the form shows an error message', async() => {
            const statusText = await page.getTextOf('.container .alert-danger:nth-child(1)');
            const skillsText = await page.getTextOf('.container .alert-danger:nth-child(2)');

            expect(statusText).toEqual('Status is required');
            expect(skillsText).toEqual('Skills is required');
        });
    });
});

describe('When is not logged in', () => {
    let token;

    afterEach(async() =>{
        token = await page.evaluate(() => localStorage.getItem('token') );
    });

    test('user cannot create profile', async () => {
        const result = await page.evaluate(
            (token) => {
                return fetch('/api/profile', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ status: 'Developer', skills: 'python,puppeteer' })
                }).then( res => res.json() );
            },
            token
        );

        expect(result).toEqual({ msg: 'Token is not valid' });
    });

    test('user cannot get own profile', async () => {
        const result = await page.evaluate(
            (token) => {
                return fetch('/api/profile/me', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                }).then( res => res.json() );
            },
            token
        );
        expect(result).toEqual({ msg: 'Token is not valid' });
    })
});

afterAll(disconnectDb);