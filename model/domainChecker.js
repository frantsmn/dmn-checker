const grabFromWebArchive = require('./webArchive.js');
const grabFromLinkpad = require('./linkpad.js');

async function collectInfo(browser, obj) {
    let result = {
        id: obj.id,
        domain: obj.domain,
        img: '',
        links: [],
        donors: '',
        isError: false,
        errorText: ''
    };

    if (/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/igm.test(obj.domain) === false) {
        result.errorText = `«${obj.domain}» не является доменным именем`;
        result.isError = true;
        return result;
    }

    // ждем когда все промисы будут выполнены
    await Promise.all([
        grabFromWebArchive(browser, result),
        grabFromLinkpad(browser, result)
    ]);

    console.log(`Для домена: ${obj.domain} объект собран!\n=============\n\n`);
    return result;
}

module.exports = async function (browser, domains) {

    let array = domains.length > 3 ? domains.slice(0, 3) : domains;
    let result = [];

    // делаем "map" массива в промисы
    const promises = array.map(
        async domain => {
            await collectInfo(browser, domain)
                .then(info => result.push(info))
                .catch(error => console.error('ERROR >> Не удалось проверить домен', error))
        });

    // ждем когда все промисы будут выполнены
    await Promise.all(promises);

    console.log('===>> Все промисы выполнены!\n\n');

    return result;
}