const helper = require('../../helper');
const dbRes = require('../db.json');
const fs = require('fs');

helper.fetchStrapi = jest.fn().mockResolvedValue(dbRes);
jest.mock('fs');
console.log = jest.fn();

const createBackup = require('../../createBackup');

describe('createBackup function', function() {
    it('creates the backup', async () => {

        const mockDate = new Date(11111111111)
        const spy = jest
            .spyOn(global, 'Date')
            .mockImplementation(() => mockDate)

        fs.existsSync.mockReturnValue(true);
        expect(await createBackup('test', 'test', 'test')).toEqual(true);
        expect(console.log).toHaveBeenCalledWith(
            'Creating a backup at ./backups/test-test-11111111111.json'
        );
        spy.mockRestore()
    });
});