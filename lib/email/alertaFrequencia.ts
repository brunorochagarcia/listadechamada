import { resend } from "./resend";

type Aluno = {
  nome: string;
  matricula: string;
  emailResponsavel: string;
  turma: { nome: string };
};

function templateAlerta(aluno: Aluno, percentual: number): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background: #dc2626; padding: 24px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">⚠️ Alerta de Frequência</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Prezado(a) responsável,</p>
      <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
        Informamos que o(a) aluno(a) <strong>${aluno.nome}</strong> (Matrícula: ${aluno.matricula})
        da turma <strong>${aluno.turma.nome}</strong> está com frequência abaixo do mínimo exigido.
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          <strong>Frequência atual:</strong> ${percentual}%<br />
          <strong>Mínimo exigido:</strong> 75%<br />
          <strong>Situação:</strong> Irregular
        </p>
      </div>
      <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
        Pedimos que entre em contato com a escola para regularizar a situação e evitar reprovação por falta.
      </p>
      <p style="color: #6b7280; font-size: 13px; margin: 0;">
        Este é um e-mail automático. Por favor, não responda a esta mensagem.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function enviarAlertaFrequencia(aluno: Aluno, percentual: number) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: aluno.emailResponsavel,
    subject: `[Lista de Chamada] Alerta de frequência — ${aluno.nome}`,
    html: templateAlerta(aluno, percentual),
  });
}
