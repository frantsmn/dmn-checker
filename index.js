const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const domainChecker = require('./model/domainChecker');

(async () => {
    // headless: false,
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    app.use(express.static('public'));

    app.listen(port, () => console.log('App listening on port ' + port));

    app.post('/domain', express.json({ type: 'application/json' }), async (req, res) => {

        let data = await domainChecker(browser, (req.body.domains));
        res.json(data);

    });

})();