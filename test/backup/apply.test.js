const helper = require('../../helper');
const fs = require('fs');
jest.mock('fs');

console.log = jest.fn();
helper.input = jest.fn().mockResolvedValue('y');
helper.fetchStrapi = jest.fn().mockResolvedValue({});

const StrapiParser = require('../../index');

describe('StrapiParser.applyBackup function', function() {
    it('applies a backup', async () => {
        const backupData = [
            { id: 1, content: 'test' },
            { id: 2, content: 'something else' },
        ];

        fs.readFileSync.mockReturnValue(JSON.stringify(backupData));

        const parser = new StrapiParser({ type: 'whatever', field: 'content' });

        await parser.applyBackup('doesntmatter', { uniqueField: 'id' })

        expect(helper.fetchStrapi).toHaveBeenCalledTimes(2);

        backupData.forEach((d, i) => expect(helper.fetchStrapi).toHaveBeenNthCalledWith(
            i + 1, `http://localhost:1337/whatever/${d.id}`, 'PUT', { content: d.content }))

        expect(console.log).toHaveBeenCalledWith('Backup applied successfuly');
    });
})