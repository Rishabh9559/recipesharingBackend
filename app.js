import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Adjust to your frontend's URL
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Backend starting .... 😉");
})


// Email Sending
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

app.post('/send-email', (req, res) => {
    const { to, subject, text, html } = req.body;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to send email' });
        }
        else{
        res.status(200).json({ message: 'Email sent successfully!', info });

        }

    });

});


app.listen(process.env.PORT, () => {
    console.log(`Email server is running on http://localhost:${process.env.PORT}`);
});
