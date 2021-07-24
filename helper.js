const readline = require('readline');
const fetch = require('node-fetch');

const rl = (process.env.NODE_ENV !== 'test')
    ?   readline.createInterface(process.stdin, process.stdout)
    :   () => {};

module.exports.input = function(msg) {
    return new Promise((resolve, reject) => {
        rl.question(msg, (input) => resolve(input) );
    });
}

module.exports.fetchStrapi = async (url, method, data) => {
    let headers = {
        'Accept': 'application/json',
    }

    if (data)
        headers['Content-Type'] = 'application/json';

    try {
        const response = await fetch(url,
            { 
                method,
                body: data ? JSON.stringify(data) : null,
                headers
             })
        const json = await response.json()    
        return json;
      } catch (error) {
        console.error(error)
      }
}

module.exports.badWarning = (lastID, uniqueField) => {
    if (lastID !== -1)
        console.error(`The last ${uniqueField} parsed successfuly is ${lastID}, the tool won't skip previously parsed rows, so it means it's safer to not parse again data with '${uniqueField} <= ${lastID}'`);
    else
        console.error('No data was updated');
}