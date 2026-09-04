import nodemailer from 'nodemailer';

// Configuração do Transportador SMTP (Zimbra ou outro)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ac.gov.br',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    // Importante para servidores de governo com certificados internos:
    rejectUnauthorized: false
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EmailService] SMTP_USER ou SMTP_PASS não configurados. E-mail simulado:', options.to);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME || 'Sistema GVC'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('[EmailService] E-mail enviado com sucesso:', info.messageId);
    return info;
  } catch (error) {
    console.error('[EmailService] Erro ao enviar e-mail:', error);
    throw error;
  }
}

export function buildApprovalEmailHtml(nome: string, espaco: string, data: string, horario: string, resposta: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #059669;">Agendamento Aprovado!</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua solicitação de agendamento de espaço cultural foi <strong>aprovada</strong>.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Espaço:</strong> ${espaco}</p>
        <p><strong>Data:</strong> ${data}</p>
        <p><strong>Horário:</strong> ${horario}</p>
      </div>

      ${resposta ? `
        <div style="border-left: 4px solid #059669; padding-left: 15px; margin-bottom: 20px;">
          <p><strong>Mensagem do Coordenador:</strong></p>
          <p><em>${resposta}</em></p>
        </div>
      ` : ''}

      <p>Atenciosamente,</p>
      <p>Fundação de Cultura Elias Mansour - FEM</p>
    </div>
  `;
}

export function buildRejectionEmailHtml(nome: string, espaco: string, data: string, resposta: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #dc2626;">Atualização sobre seu Agendamento</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Sua solicitação de agendamento para o espaço <strong>${espaco}</strong> na data <strong>${data}</strong> não pôde ser aprovada no momento.</p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Justificativa:</strong></p>
        <p><em>${resposta}</em></p>
      </div>

      <p>Se tiver dúvidas, entre em contato conosco.</p>
      <p>Atenciosamente,</p>
      <p>Fundação de Cultura Elias Mansour - FEM</p>
    </div>
  `;
}

export function buildRecebidoEmailHtml(nome: string, espaco: string, data: string, horario: string, protocolo: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Solicitação de Agendamento Recebida!</h2>
      <p>Olá, <strong>${nome}</strong>.</p>
      <p>Recebemos sua solicitação de agendamento de espaço cultural. Ela será analisada pela nossa equipe e em breve você receberá um retorno.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <p><strong>Espaço:</strong> ${espaco}</p>
        <p><strong>Data:</strong> ${data}</p>
        <p><strong>Horário:</strong> ${horario}</p>
      </div>

      <p>Atenciosamente,</p>
      <p>Fundação de Cultura Elias Mansour - FEM</p>
    </div>
  `;
}
