const helper = require('../../helper');
const dbRes = require('../db.json');

console.log = jest.fn();
helper.input = jest.fn().mockResolvedValue('y');
helper.fetchStrapi = jest.fn().mockResolvedValue(dbRes);

const StrapiParser = require('../../index');

describe('StrapiParser.upload function', function() {
    it('does a simple upload', async () => {
        const parser = new StrapiParser({ field: 'title', type: 'whatever' });

        const parsedContent = await parser.parse((field, allFields) => {
            return field + ' 🔧';
        });

        expect(helper.fetchStrapi).toHaveBeenNthCalledWith(
            1, 
            'http://localhost:1337/whatever?_sort=id:ASC',
            'GET'
        );

        await parser.update(parsedContent, false);

        expect(helper.fetchStrapi).toHaveBeenCalledTimes(parsedContent.length + 1);

        [
            { id: dbRes[0].id, title: dbRes[0].title + ' 🔧' },
            { id: dbRes[1].id, title: dbRes[1].title + ' 🔧' },
        ].forEach((d, i) => expect(helper.fetchStrapi).toHaveBeenNthCalledWith(
            i + 2, `http://localhost:1337/whatever/${d.id}`, 'PUT', { title: d.title }))

        expect(console.log).toHaveBeenCalledWith('Updated successfuly');
    });
})