import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, text, html, auth, fromName, attachments } = await req.json();

    // Basic validation
    if (!to) return NextResponse.json({ error: 'Recipient email (to) is required' }, { status: 400 });
    if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    if (!auth?.user || !auth?.pass) {
      return NextResponse.json({ error: 'SMTP credentials (user and pass) are required in the auth object' }, { status: 400 });
    }

    // Configure the transporter for Gmail SMTP
    // Note: service: 'gmail' is a shorthand for Gmail-specific settings in nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
    });

    const mailOptions = {
      from: fromName ? `"${fromName}" <${auth.user}>` : auth.user,
      to,
      subject,
      text,
      html,
      attachments: (attachments || []).map((a: any) => ({
        filename: a.name,
        content: a.data.split(',')[1],
        encoding: 'base64'
      }))
    };

    console.log(`Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response
    });
  } catch (error: any) {
    console.error('SMTP Error:', error);
    
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Please check your Gmail App Password.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
