var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

module.exports = {
  sendCommentsEmail: function(email, name, message) {
    var mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.COMMENTS_MAIL_TO,
      subject: "Website comments from " + name,
      text: "Reply email: " + email + "\nMessage: " + message
    };

    smtpTransport.sendMail(mailOptions, function(error, response){
      if (error) {
        console.log('mail send error:', error);
      } else {
        console.log('mail sent:', response.message);
      }
    });
  }
};
