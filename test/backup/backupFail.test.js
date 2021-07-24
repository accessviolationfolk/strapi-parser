const helper = require('../../helper');

helper.fetchStrapi = jest.fn().mockResolvedValue(new Error('Throws'));

const createBackup = require('../../createBackup');

describe('createBackup function', function() {
    it('throws if no data is returned from api', async () => {
        await expect(createBackup('test', 'test', 'test')).rejects.toThrow(
            'No data fetched to create backup'
        );
    });
});