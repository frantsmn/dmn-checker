export default function sortItems(items, sortType) {
    if (!items || !items.length) return;

    switch (sortType) {

        case 'alphabet':
            sortByAlphabet(items);
            break;

        case 'age':
            sortByAge(items);
            break;

        case 'donors':
            sortByDonors(items);
            break;

        default:
            sortById(items);
            break;
    }
}

function sortByAlphabet(items) {
    items.sort((a, b) => {
        if (a.domain > b.domain) {
            return 1;
        }
        if (a.domain < b.domain) {
            return -1;
        }
        return 0;
    });
    console.log('Sorted by alpabet');
}

function sortByAge(items) {
    items.sort((a, b) => {
        let _a = 0;
        let _b = 0;

        if (a.data.hasOwnProperty('links') && a.data.links.length && a.data.links[0].timestamp)
            _a = a.data.links[0].timestamp;
        if (a.data.hasOwnProperty('links') && b.data.links.length && b.data.links[0].timestamp)
            _b = b.data.links[0].timestamp;

        return _a - _b;
    });
    console.log('Sorted by age');
}

function sortByDonors(items) {
    items.sort((a, b) => {
        let _a = 0;
        let _b = 0;

        if (a.hasOwnProperty('donors'))
            _a = parseInt(a.donors.replace(/\s/g, ""));

        if (b.hasOwnProperty('donors'))
            _b = parseInt(b.donors.replace(/\s/g, ""));

        return _b - _a;
    });
    console.log('Sorted by donors');
}

function sortById(items) {
    items.sort((a, b) => a.id - b.id);
    console.log('Sorted by id');
}