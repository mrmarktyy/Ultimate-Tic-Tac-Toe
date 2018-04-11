require('dotenv').config()
var nodemailer = require('nodemailer')
var logger = require('./logger')

const smtpConfig = {
  host: process.env.SMTP_HOSTNAME,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}

class Mailer {
  constructor (mailOptions) {
    this.options = {
      from: 'tech@ratecity.com.au',
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html || '<p>Please see attached</p>',
      attachments: mailOptions.attachments,
    }
    if (mailOptions.cc) {
      this.options.cc = mailOptions.cc
    }
    this.transporter = nodemailer.createTransport(smtpConfig)
  }
  sendEmail () {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(this.options, (error, info) => {
        if (error) {
          logger.error(error)
          reject()
        }

        if (info) {
          logger.info(info)
          resolve()
        }
      })
    })
  }
}

module.exports =  Mailer
