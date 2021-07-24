const helper = require('../../helper');

helper.fetchStrapi = jest.fn().mockResolvedValue(new Error ('Hello'));
console.error = jest.fn();

const StrapiParser = require('../../index');

describe('StrapiParser.parse', function() {
    it('throws when theres no data', async () => {    
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });

        await expect(parser.parse((field) => field)).rejects.toThrow(
            'No data returned from http://localhost:1337/whatever?_sort=id:ASC'
        );
        expect(console.error).not.toHaveBeenCalled();
    });
})