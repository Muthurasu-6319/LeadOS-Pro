export function wrapInHtmlTemplate(content: string, companyName: string, logo?: string, signature?: string) {
  const formattedContent = content.replace(/\n/g, '<br/>');
  const formattedSignature = signature ? signature.replace(/\n/g, '<br/>') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { padding: 32px; background: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: center; }
        .logo { max-height: 40px; margin-bottom: 12px; }
        .company-name { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.025em; }
        .content { padding: 40px 32px; font-size: 15px; color: #475569; }
        .footer { padding: 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 13px; }
        .signature { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logo ? `<img src="${logo}" alt="${companyName}" class="logo">` : ''}
          <div class="company-name">${companyName}</div>
        </div>
        <div class="content">
          ${formattedContent}
        </div>
        <div class="footer">
          <div class="signature">
            ${formattedSignature}
          </div>
          <p style="margin-top: 20px; color: #94a3b8; font-size: 11px;">
            Sent by ${companyName} via Lead Finder Intelligence.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
