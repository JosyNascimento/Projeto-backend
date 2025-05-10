//src/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outras portas (tipo 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // ADICIONADO para aceitar certificado autoassinado
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Erro no transportador de e-mail:', error);
  } else {
    console.log('Servidor de e-mail pronto para enviar mensagens!');
  }
});

const sendEmail = async (options) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

module.exports = { sendEmail };
