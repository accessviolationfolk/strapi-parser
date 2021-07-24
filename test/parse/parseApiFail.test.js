const helper = require('../../helper');

console.error = jest.fn();

const StrapiParser = require('../../index');

describe('StrapiParser.parse', function() {
    it('throws when theres no response from api', async () => {    
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });

        await expect(parser.parse((field) => field)).rejects.toThrow(
            'No data from Strapi, check the message above for details.'
        );
        expect(console.error).toHaveBeenCalled();
    });
})