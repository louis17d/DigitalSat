export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { user_name, user_email, user_phone, service, message } = data;

    // Utilizziamo l'API gratuita di Resend (resend.com - 3.000 mail/mese gratis)
    // Imposta RESEND_API_KEY nelle variabili d'ambiente di Cloudflare Pages
    const API_KEY = context.env.RESEND_API_KEY; 

    // 1. Email di notifica per TE (Elettricista)
    const adminEmail = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sito Elettricista <onboarding@resend.dev>',
        to: ['TUANOME@EMAIL.COM'], // Inserisci la tua email
        subject: `⚡ Nuovo Preventivo: ${service} - ${user_name}`,
        html: `
          <h2>Nuova richiesta ricevuta dal sito web</h2>
          <p><strong>Nome:</strong> ${user_name}</p>
          <p><strong>Email:</strong> ${user_email}</p>
          <p><strong>Telefono:</strong> ${user_phone}</p>
          <p><strong>Servizio:</strong> ${service}</p>
          <p><strong>Messaggio:</strong><br>${message}</p>
        `
      })
    });

    // 2. Email di conferma automatica per il CLIENTE
    const clientEmail = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sito Elettricista <onboarding@resend.dev>',
        to: [user_email],
        subject: 'Conferma di ricezione richiesta preventivo',
        html: `
          <h3>Gentile ${user_name},</h3>
          <p>Abbiamo ricevuto la tua richiesta per il servizio <strong>${service}</strong>.</p>
          <p>Un nostro tecnico analizzerà i dettagli e ti ricontatterà entro 24 ore lavorative.</p>
          <br>
          <p>Cordiali saluti,<br><strong>Servizi Elettrici Qualificati</strong></p>
        `
      })
    });

    await Promise.all([adminEmail, clientEmail]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
