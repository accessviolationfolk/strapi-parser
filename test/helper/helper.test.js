const helper = require('../../helper');
const fetch = require('node-fetch');

jest.mock('node-fetch')
console.error = jest.fn();


describe('helper functions', function() {
    describe('badWarning', function() {
        it('shows no data message', async () => {
            helper.badWarning(4, 'id')
            expect(console.error).toHaveBeenCalledWith(
                `The last id parsed successfuly is 4, the tool won't skip previously parsed rows, so it means it's safer to not parse again data with 'id <= 4'`
            );
        });

        it('shows last id message', async () => {
            helper.badWarning(-1, 'id')
            expect(console.error).toHaveBeenCalledWith('No data was updated');
        });
    });

    describe('fetchStrapi', function() {
        it('returns basic response value', async () => {
            fetch.mockResolvedValue({ json: () => ({ test: true })});

            
            expect(await helper.fetchStrapi('test', 'POST'))
                .toEqual({ test: true });
        });
    });
});