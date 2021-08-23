const aws = require('aws-sdk');
const nodemailer = require('nodemailer');

const ses = new aws.SES();
async function sendEmail(email, body) {

    // var mailOptions = {
    //     from: 'contact@gariyasi.com',
    //     subject: 'Your OTP for signup',

    //     to: email,
    //     // bcc: Any BCC address you want here in an array,
    //     html: 

    // };
    // console.log('Creating SES transporter');
    // // create Nodemailer SES transporter
    // const transporter = nodemailer.createTransport({
    //     SES: ses
    // });
    // // send email
    // try {

    //     await transporter.sendMail(mailOptions);
    //     return;
    // } catch (error) {
    //     console.log(error.message);
    // }
}
module.exports = { sendEmail }
