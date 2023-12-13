const nodeMailer = require("nodemailer");
const { spinner } = require("@clack/prompts");

/**
 * Initial retries count 
*/
const DEFAULT_MAX_RETRIES_COUNT = 20

/**
 * Initial backoff time in milliseconds after an error. 
*/
const DEFAULT_BACKOFF_INITIAL_DELAY_MS = 2000;

class MailServer 
{
    constructor ({ 
        maxRetriesCount, 
        backOffDelay 
    }={ 
        maxRetries: DEFAULT_MAX_RETRIES_COUNT,
        backOffDelay: DEFAULT_BACKOFF_INITIAL_DELAY_MS
    })
    {
        this.maxRetriesCount = maxRetriesCount;
        this.backOffDelay = backOffDelay;
        this.retries = {};
        this.transporter = nodeMailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            secure: true,
            auth: {
                user: process.env.USER_NAME,
                pass: process.env.PASSWORD
            }
        });
        this.spinner = spinner();
    }

    /**
     * increments retries count
     * @param {string} email 
    */
    incrementRetriesCount(recipientMail)
    {
        if(this.retries[recipientMail] == undefined)
        {
            this.retries[recipientMail] = 0;
            return;
        }

        this.retries[recipientMail] += 1;
    }

    /**
     * returns true if retries count exceed max limit
     * @param {string} recipientMail 
     * @returns {boolean}
     */
    isRetriesExceed (recipientMail) 
    {
        if(this.retries[recipientMail] == undefined) return false;
        return this.retries[recipientMail] >= this.maxRetries;
    }


    /**
     * sends mail to recipient
     * @param {string} from sender name
     * @param {string} recipient recipient mail address
     * @param {string} subject mail subject
     * @param {string} body mail content
     * @param {()=> void} onSucceed on mail sent to recipient
     * @example
     * ```javascript
     *  sendMail("community", "example@gmail.com", "Greeting", "hey 🙋‍♂️", ()=>{
     *      console.log("mail has been sent");
     *  })
     * ```
    */
    async sendMail(
        from,
        recipient,
        subject,
        body,
        onSucceed = ()=> {}
    ) 
    {

        this.spinner.start(`Mail Server | Going to send mail to ${recipient}`);
        try 
        {
            const res = await this.transporter.sendMail({
                from: `${from} <${process.env.USER_NAME}>`,
                to: recipient,
                subject,
                html: body 
            });
            
            onSucceed()
            this.incrementRetriesCount(recipient)
            this.spinner.stop(`Mail Server | mail has been sent to ${recipient}`);
        } catch(err) 
        {
            if(this.isRetriesExceed(recipient)) {
                this.spinner.stop(`Mail Sever | failed while sending mail to ${recipient}\n- reason: ${err.toString()}`);
                return;
            }
            
            await new Promise((resolve)=> setTimeout(resolve, this.backOffDelay));
            this.spinner.stop("");
            await this.sendMail(from, recipient, subject, onSucceed);
        }
        
    }
}

module.exports = MailServer;
