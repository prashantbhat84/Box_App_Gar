'use strict';

const tempPath = '/logs/Gariyasi/temp/';
const pug = require('pug');
const pdf = require('html-pdf');

class PDFGenerator {

    constructor() {

    }

    async renderHTML(templatePath, data) {
        try {
            let filePath = `./views/downloadTemplates/${templatePath}`;
            let fn = pug.compileFile(filePath, {});
            let html = fn(data);
            return Promise.resolve(html);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    async generatePDF(html, fileName) {
        try {
            let filePath = `${tempPath}${fileName}.pdf`;
            let options = {
                format: 'A4'
            };
            return new Promise((resolve, reject) => {
                pdf.create(html, options).toFile(filePath, function (err, res) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(res.filename);
                    }
                });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };
}

module.exports = PDFGenerator;