export default function sendMail() {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "prashant.work.1984@gmail.com",
            password: "()Blore560001"
        }
    });
    let mailOptions = {
        from: "Gariyasi Contact <contact@gariyasi.com>",
        to: "prashant.work.1984@gmail.com",
        bcc: "contact@gariyasi.com",
        subject: "test",
        text: "This is working"
    }
    await transporter.sendMail(mailOptions)
}