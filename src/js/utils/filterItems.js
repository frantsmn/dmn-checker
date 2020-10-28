export default function filterItems(items, filter) {
    if (!items || !items.length) return items;

    if (filter.hideErrors) {
        items = items.filter(item => !item.error.status);
        console.log('Filtered from errors', items);
    }

    if (filter.firstShot && filter.firstShotDate) {
        items = items.filter(item => {
            if (item.data.hasOwnProperty('links') && item.data.links.length && item.data.links[0].timestamp) {
                return item.data.links[0].timestamp <= Date.parse(filter.firstShotDate)
            } return true;
        });
        console.log('Filtered according to first shot date');
    }

    if (filter.lastShot && filter.lastShotDate) {
        items = items.filter(item => {
            if (item.data.hasOwnProperty('links') && item.data.links.length && item.data.links[0].timestamp) {
                return item.data.links[item.data.links.length - 1].timestamp >= Date.parse(filter.lastShotDate)
            } return true;
        });
        console.log('Filtered according to last shot date');
    }

    return items;
}
