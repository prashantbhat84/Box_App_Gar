const fs = require('fs');

const convert = require('docx-pdf')

const Logger = {};

function convert2pdf(file, boxid) {
    const actualfile = fs.readFileSync(file);
    console.log(actualfile)
    const dest = './pdflog/' + boxid + '.pdf';

    convert(file, dest, (err, res) => {
        if (err) {
            console.log('error');
        }
        console.log('generated');
    })


}
Logger.info = (msg, boxid) => {

    const filename = './logs/' + boxid + '.docx'
    const date = new Date();
    const timestamp = `${date.getUTCDate()}/${date.getMonth() + 1}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}`
    
    if (fs.existsSync(filename)) {

        fs.appendFileSync(filename, `\r\n  Box  with id ${boxid} ${msg} at ${timestamp} `)
    } else {

        fs.writeFileSync(filename, ` Box with id ${boxid} ${msg} at ${timestamp}`);
    }
   
    
    return
}
module.exports = Logger
