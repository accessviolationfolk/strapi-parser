const { fetchStrapi } = require('./helper');
const fs = require('fs');

module.exports = async (type, field, typeEndpoint) => {
    const backupPath = `./backups/${type}-${field}-${new Date().getTime()}.json`
    const allFieldData = await fetchStrapi(typeEndpoint, 'GET');

    if (!allFieldData || !allFieldData.length) {
        throw new Error('No data fetched to create backup');
    }

    const backup = JSON.stringify(allFieldData);
    fs.mkdirSync('./backups', { recursive: true });
    console.log(`Creating a backup at ${backupPath}`)
    fs.writeFileSync(backupPath, backup, 'utf8');

    return fs.existsSync(backupPath);
}