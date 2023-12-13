const fs = require("fs");

/**
 * loads recipients data from JSON file
 * @param {string} jsonFilePath 
 * @example
 * ```javascript
 *  loadRecipients("./recipients.json")
 * ```
*/
const loadRecipients = (jsonFilePath)=> {
    const recipients = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
    if(recipients.length == 0)
    {
        console.log(`0 recipients left to send mail | ${jsonFilePath}`)
        process.exit(0);
    }

    return recipients;
}

/**
 * removes recipient from file by email
 * @param {string} jsonFilePath file path
 * @param {string} email email of recipient
 */
const removeRecipients = (jsonFilePath, email)=> {
    const recipients = JSON.parse(
        fs.readFileSync(jsonFilePath, "utf-8")
    );
    
    fs.writeFileSync(jsonFilePath, JSON.stringify(
        recipients.filter(rec=> rec.email != email)
    ));
}

module.exports = {
    loadRecipients,
    removeRecipients
}
