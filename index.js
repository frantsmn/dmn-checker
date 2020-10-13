
/*

{
    error: {
        status: false,
        text: ""
    },
    data: {
        id: 0,
        domain: "domain.com",
        img: "",
        links: [
            {
                href: ""
                innerText: ""
                timestamp: ""
            }
        ]
    }
}

*/

const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const domainChecker = require('./model/domainChecker');
const yandexCollector = require('./model/yandexCollector');
const titleCollector = require('./model/titleCollector');

console.log(process.argv[2] === 'development' ? '\n-= DEVELOPMENT MODE =-\n' : '');

(async () => {

    // const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    if (process.argv[2] !== 'development') {
        app.use(express.static('dist'));
    }

    app.listen(port, () => console.log('App listening on port ' + port));

    app.post('/api/domain', express.json({ type: 'application/json' }), async (req, res) => {

        try {
            const data = await domainChecker(browser, (req.body));
            res.json(data);
        } catch (err) {
            req.body.isError = true;
            req.body.errorText = "ERROR >> 503 - Ошибка сервера";
            res.status(503).json(req.body);
            console.error('503 ERROR >> ', err);
        }
    });

    app.post('/api/search', express.json({ type: 'application/json' }), async (req, res) => {
        try {
            const data = await yandexCollector(browser, (req.body.query));
            res.json(data);
        } catch (err) {
            res.status(503);
            console.error('503 ERROR >> ', err);
        }
    });

    app.post('/api/title', express.json({ type: 'application/json' }), async (req, res) => {
        try {
            const data = await titleCollector((req.body));
            res.json(data);
        } catch (err) {
            res.status(503);
            console.error('503 ERROR >> ', err);
        }
    });

})();