require("dotenv").config();
const MailServer = require("./lib/mail-server");
const util = require("./lib/util");
const fs = require("fs");

const mailServer = new MailServer()
const MAIL_SUBJECT = "Greeting";
const RECIPIENTS_FILE_PATH = "./recipients.json";
const TEMPLATE_FILE_PATH = "./templates/mail.html";

(async ()=> {
    const recipients = util.loadRecipients(RECIPIENTS_FILE_PATH);

    for(let recipient of recipients)
        await mailServer.sendMail(
            "Community", 
            recipient.email, 
            MAIL_SUBJECT, 
            fs.readFileSync(TEMPLATE_FILE_PATH, "utf-8")
                .replace("%name%", recipient.displayName),
            ()=> util.removeRecipients(RECIPIENTS_FILE_PATH, recipient.email)
        )
})();
