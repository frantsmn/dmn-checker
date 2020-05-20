const grabFromWebArchive = require('./webArchive.js');
const grabFromLinkpad = require('./linkpad.js');

async function collectInfo(browser, obj) {

    let result = Object.assign({
        img: '',
        links: [],
        donors: '',
        isError: false,
        errorText: ''
    }, obj);

    if (/^(?!:\/\/)([а-яА-Яa-zA-Z0-9-_]+\.)*[а-яА-Яa-zA-Z0-9][а-яА-Яa-zA-Z0-9-_]+\.[а-яА-Яa-zA-Z]{2,11}?$/igm.test(obj.domain) === false) {
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

module.exports = async function (browser, domains, limit) {

    let array = [];
    let result = [];

    if (limit === false)
        array = domains;
    else
        array = domains.length > 3 ? domains.slice(0, 3) : domains;

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