const nodemailer = require('nodemailer')
const EmailTemplate = require('email-templates').EmailTemplate
const path = require('path')
const secret = require('../secret');

var templateDir = path.join(__dirname, '..', 'templates', 'pass')

// Send a user their pass
exports.sendPass = (passInfo, email) => {
  let pass = new EmailTemplate(templateDir);

  // Generate the pass HTML
  pass.render(passInfo, (err, result) => {
    if (err) {
      console.error(err);
    }

    let mailOptions = {
        from: '"Juldi" <hello@juldi.org>', // sender address
        to: email,
        subject: 'Your Juldi Pass',
        text: result.text,
        html: result.html
    }

    exports.sendMail(mailOptions);
  });
}

//send mail using gmail account
exports.sendMail = (message) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: secret.emailinfo.user,
          pass: secret.emailinfo.pass
      }
  })

  // send mail with defined transport object
  transporter.sendMail(message, (error, info) => {
      if (error) {
          return console.log(error)
      }
      console.log('Message %s sent: %s', info.messageId, info.response)
  })
}
