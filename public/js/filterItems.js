export default function filterItems(items, filter) {
    if (!items || !items.length) return items;

    if (filter.hideErrors) {
        items = items.filter(item => !item.isError);
        console.log('Filtered from errors');
    }

    if (filter.firstShot && filter.firstShotDate) {
        items = items.filter(item => {
            if (item.hasOwnProperty('links') && item.links && item.links.length && item.links[0].timestamp) {
                return item.links[0].timestamp <= Date.parse(filter.firstShotDate)
            } return true;
        });
        console.log('Filtered according to first shot date');
    }

    if (filter.lastShot && filter.lastShotDate) {
        items = items.filter(item => {
            if (item.hasOwnProperty('links') && item.links && item.links.length && item.links[0].timestamp) {
                return item.links[item.links.length - 1].timestamp >= Date.parse(filter.lastShotDate)
            } return true;
        });
        console.log('Filtered according to last shot date');
    }

    return items;
}
