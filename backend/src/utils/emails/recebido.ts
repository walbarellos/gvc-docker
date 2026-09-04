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
