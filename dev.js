const testData = require('./data/testData.json');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.listen(port, () => console.log('////////////////////////\n\tDEV MODE\n\nApp on port ' + port));
app.post('/domain', express.json({ type: 'application/json' }), async (req, res) => {

    setTimeout(() => {
        res.json(testData);
    }, 400);
    
});
