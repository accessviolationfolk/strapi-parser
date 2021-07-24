const helper = require('../../helper');
const dbRes = require('../db.json');

helper.fetchStrapi = jest.fn().mockResolvedValue(dbRes);

const StrapiParser = require('../../index');

describe('StrapiParser.parse', function() {
    it('does a simple parse', async () => {
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });
        const parsedContent = await parser.parse((field, allFields) => {
            return field + ' 🔧';
        });

        expect(parsedContent).toEqual(
            dbRes.map(o => ({ id: o.id, data: o.title + ' 🔧' }))
        );
    });

    it('allows other props to be used in the parsing', async () => {
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });
        const parsedContent = await parser.parse((field, allFields) => {
            return `${field} - ${allFields.id}`;
        });

        expect(parsedContent).toEqual(
            dbRes.map(o => ({ id: o.id, data: `${o.title} - ${o.id}` }))
        );
    });

    it('accepts an async function to parse', async () => {
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });

        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const parsedContent = await parser.parse(async (field, allFields) => {
            await timeout(100);
            return field + ' 🔧';
        });

        expect(parsedContent).toEqual(
            dbRes.map(o => ({ id: o.id, data: o.title + ' 🔧' }))
        );
    });
});