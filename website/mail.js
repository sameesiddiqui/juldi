const nodemailer = require('nodemailer')
var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
const secret = require('./secret');

var templateDir = path.join(__dirname, 'templates', 'pass')
var pass = new EmailTemplate(templateDir)
var passInfo = {
  passType: 'Week Pass',
  passCode: 'F7',
  name: 'Jason Smith',
  startDate: 'Jun 19',
  endDate: 'Jun 26'
}

// Render the html
pass.render(passInfo, (err, result) => {
  let mailOptions = {
      from: '"Exacly" <exacly@gmail.com>', // sender address
      to: 'exacly@gmail.com', // list of receivers
      subject: 'You\'ve got a Juldi Pass!', // Subject line
      text: result.text,
      html: result.html
  }

  sendMail(mailOptions)
})

//send mail using gmail account
function sendMail (message) {
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
