# Strapi Parser
Basic tool to parse a specific field for all data of a Strapi type, updating data according to your changes. Use it with caution.

Strapi update role needs to be public to use this tool, it doesn't support authentication.
Make your own backup before using, don't rely on the tool one.

## Declaration
```javascript
// Creates the parser
const parser = new StrapiParser(
    {
        type: 'posts',
        field: 'title',
        apiURL: 'http://localhost:1337' // optional, defaults to http://localhost:1337
    });
```

## Update fields
```javascript
// Creates the parser
const parser = new StrapiParser(
    {
        type: 'posts',
        field: 'title',
        apiURL: 'http://localhost:1337' // optional, defaults to http://localhost:1337
    });
// Change content in any way you want
const parsedContent = await parser.parse((title, allFields) => {
    return title + ' 🚀';
});
// Update Strapi
parser.update(parsedContent, true);
```

## Backup
```javascript
// Creates the parser
const parser = new StrapiParser(
    {
        type: 'posts',
        field: 'title',
        apiURL: 'http://localhost:1337' // optional, defaults to http://localhost:1337
    });
parser.backup('./backups/something-abcd-123456.json', { field: 'title', uniqueField: 'id' }); // file optionally made by the parser when updating
```

## API
### StrapiParser constructor
#### Parameters
- type: Strapi type to be changed
- field: Strapi field which will be parsed
- apiURL: Strapi URL, it defaults to 'http://localhost:1337'
- uniqueField: Wrong name for this prop. this is  your primary key, usually its just 'id', it defaults to id
### StrapiParser.parse(fn)
- Takes a function with two parameters: (field, allFields), the first one is the content of the field you supplied, the second one is all other data of this row, which you can use to modify the data by returning the new value for that field.
### StrapiParser.update(parsedContent, shouldBackup)
- Update Strapi to take the changes of the parse function, if shouldBackup is true then it will create a backup file in the backups folder that hopefully will help if something wrong happens.
- This function currently doesn't help you if something bad happens in the middle of a update. For example, it updated all data with IDs between 1 and 10, and during 11 you lost your network, if you run it again, it will parse again everything from ID 1, which can cause unexpected results(depending on what you're doing), it is possible to complete eliminate this problem, but it's not done for now. It will though give you the id where it ended, it's recommended to check if that id was parsed or not.
### StrapiParser.backup(filepath, { field, allFields, uniqueField })
- filepath: Path of the backup file
- field: If a value is specified here, then the backup will only recover this field from the backup file, leaving the others as it is
- allFields: Attempt to recover all fields
- uniqueField: This is required here, usually id as mentioned
