const fetch = require('node-fetch');
const cliProgress = require('cli-progress');
const _colors = require('colors');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

function input(msg) {
    return new Promise((resolve, reject) => {
        rl.question(msg, (input) => resolve(input) );
    });
}

const fetchStrapi = async (url, method, data) => {
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

const badWarning = (lastID, uniqueField) => {
    if (lastID !== -1)
        console.error(`The last ${uniqueField} parsed successfuly is ${lastID}, the tool won't skip previously parsed rows, so it means it's safer to not parse again data with '${uniqueField} <= ${lastID}'`);
    else
        console.error('No data was updated');
}

class StrapiParser {
    constructor({ type, field, apiURL, uniqueField }) {
        this.field = field;
        this.type = type;
        this.uniqueField = uniqueField ? uniqueField : 'id';
        this.apiURL = apiURL ? apiURL : 'http://localhost:1337';
        if (!this.apiURL.endsWith('/'))
            this.apiURL += '/';
        this.typeEndpoint = `${this.apiURL}${this.type}?_sort=${this.uniqueField}:ASC`;
        this.lastID = -1;
    }

    async parse(fn) {
        const allFieldData = await fetchStrapi(this.typeEndpoint, 'GET');

        const prog = new cliProgress.SingleBar({
            format: `Parsing content | ${_colors.cyan('{bar}')} | {percentage}%`
        }, cliProgress.Presets.shades_classic);
        prog.start(allFieldData.length, 0);
        const parsedContent = allFieldData.map(fieldData => {
            prog.increment();
            return { id: fieldData[this.uniqueField], data: fn(fieldData[this.field], fieldData) }
        })
        prog.stop();

        return parsedContent
    }

    async _doUpdate(updateEndpoint, updateObj, uniqueField) {
        const update = await fetchStrapi(
            updateEndpoint,
            'PUT',
            updateObj);

        if (update.statusCode && update.statusCode !== 200) {
            if (update.statusCode === 403)
                throw new Error(`Error 403 while trying to update values`);
            throw new Error(`A problem occurred while trying to update ${updateEndpoint}, ${update}`);
        }

        this.lastID = update[uniqueField];

        return update;
    }

    _getUpdateEndpoint = (id) => {
        return `${this.apiURL}${this.type}/${id}`;
    }

    async update(parsedContent, shouldBackup) {
        if (shouldBackup) {
            try {
                const backupPath = `./backups/${this.type}-${this.field}-${new Date().getTime()}.json`
                const allFieldData = await fetchStrapi(this.typeEndpoint, 'GET');
                const backup = JSON.stringify(allFieldData);
                fs.mkdirSync('./backups', { recursive: true });
                console.log(`Creating a backup at ${backupPath}`)
                fs.writeFileSync(backupPath, backup, 'utf8');
                if (fs.existsSync(backupPath)) {
                   console.log('Backup created!')

                   const confirmProceed = await input(
                       `Check if the backup at '${backupPath}' has no problems. Do you want to proceed? (y/N) `);

                    if (!confirmProceed || confirmProceed !== 'y') {
                        console.log('Update aborted.')
                        process.exit(1)
                    }
                } else {
                    console.log("Backup doesn't exists")
                    process.exit(1)
                }
            } catch(e) {
                throw e
            }
        } else {
            const confirmProceed = await input(
                `**WARNING** you choose to not make a backup for this update. Do you really want to proceed? (y/N) `);

             if (!confirmProceed || confirmProceed !== 'y') {
                 console.log('Update aborted.')
                 process.exit(1)
             }

            console.log("I really hope you know what you're doing.");
        }
        
        const prog = new cliProgress.SingleBar({
            format: `Updating {current} | ${_colors.cyan('{bar}')} | {percentage}% || {value}/{total} rows`
        }, cliProgress.Presets.shades_classic);
        prog.start(parsedContent.length, 0);
        this.lastID = -1;
        for (let i = 0; i < parsedContent.length; i += 1) {
            const updateEndpoint = this._getUpdateEndpoint(parsedContent[i][this.uniqueField]);
            try {
                const updateObj = {};
                updateObj[this.field] = parsedContent[i].data;
                await this._doUpdate(updateEndpoint, updateObj, this.uniqueField);
            } catch(e) { 
                prog.stop()
                console.log('Error while trying to update', e)
                badWarning(this.lastID, this.uniqueField);
                return;
            }

            prog.increment({ current: updateEndpoint })
        }
        prog.stop()

        console.log('Updated successfuly')
    }

    /*
    *   Update it back based on the specified backup file.
    *   field: Name of the field parsed when the backup was created
    *   allFields: This will bypass "field", will update all fields to what it was before
    */
    async applyBackup(filepath, { field, allFields, uniqueField }) {
        if (!uniqueField) {
            console.log('Supply the primary key in "uniqueField" prop, usually just id')
            return;
        }

        if (!field && !allFields) {
            console.log('Supply either field or allFields')
            return;
        }

        let rawJSON = fs.readFileSync(filepath);
        const data = JSON.parse(rawJSON);

        if (!data) {
            console.log('JSON has no data');
            return;
        }

        const prog = new cliProgress.SingleBar({
            format: `Updating {current} | ${_colors.cyan('{bar}')} | {percentage}% || {value}/{total} rows`
        }, cliProgress.Presets.shades_classic);
        prog.start(data.length, 0);

        this.lastID = -1;
        for (let i = 0; i < data.length; i += 1) {
            const updateEndpoint = this._getUpdateEndpoint(data[i].id);
            try {
                let updateObj = {};

                if (allFields) {
                    delete data[i][uniqueField];
                    updateObj = data[i];
                } else {
                    updateObj[this.field] = data[i][this.field];
                }
                
                await this._doUpdate(updateEndpoint, updateObj, uniqueField);
            } catch(e) { 
                prog.stop()
                console.error('Error while trying to update', e)
                badWarning(this.lastID, uniqueField);
                return;
            }

            prog.increment({ current: updateEndpoint })
        }

        console.log('Backup applied successfuly')
    }
}

module.exports = StrapiParser;
