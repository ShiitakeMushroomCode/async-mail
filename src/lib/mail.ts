import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP 서버
  port: 587, // SMTP 포트
  secure: false, // TLS 사용
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
} as nodemailer.TransportOptions);

export default transporter;
