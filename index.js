const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const domainChecker = require('./model/domainChecker');
const yandexCollector = require('./model/yandexCollector');

(async () => {
    // headless: false,
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    app.use(express.static('public'));

    app.listen(port, () => console.log('App listening on port ' + port));

    app.post('/domain', express.json({ type: 'application/json' }), async (req, res) => {
        try {
            const data = await domainChecker(browser, (req.body));
            res.json(data);
        } catch (err) {
            req.body.forEach(item => {
                item.isError = true;
                item.errorText = "ERROR >> 503 - Ошибка сервера";
            });
            res.status(503).json(req.body);
            console.error('503 ERROR >> ', err);
        }
    });

    app.post('/search', express.json({ type: 'application/json' }), async (req, res) => {
        try {
        
            const resArray = await yandexCollector(browser, (req.body.query));
            const data = await domainChecker(browser, resArray, false);
            res.json(data);
            // console.log('RES!!!!!!!!!!!! => ', data);
        } catch (err) {
            res.status(503);
            console.error('503 ERROR >> ', err);
        }
    });


})();



