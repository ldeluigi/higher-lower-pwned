const transport = require("../../config/config").mailsenderTransport;
const nodemailer = require("nodemailer");

let lazyTransporter;

function getLazyTransporter() {
  if (lazyTransporter) {
    return lazyTransporter;
  } else {
    if (transport) {
      lazyTransporter = nodemailer.createTransport(transport);
    } else {
      lazyTransporter = {
        sendMail: function (options, callback) {
          // console.log("EMAIL DEBUGGER SEND_MAIL: (" + JSON.stringify(options) + ")");
          callback(null, {
            response: "OK",
          });
        },
      };
    }
    return lazyTransporter;
  }
}

module.exports = {
  sendSubscriptionEmail: function (address, username) {
    return new Promise((resolve, reject) => {
      let mailOpt = {};
      mailOpt.from = transport ? transport.auth.user : "debug.email@hlp.com";
      mailOpt.to = address;
      mailOpt.subject = "Account subscription";
      mailOpt.text =
        username +
        ", your subscription to The Pwned Game was successful.\n\nThe Pwned Game Team";
      getLazyTransporter().sendMail(mailOpt, function (error, info) {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  },
};
