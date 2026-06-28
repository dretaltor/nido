const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '1156099824249418'
const WA_TOKEN = process.env.WHATSAPP_TOKEN

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (!WA_TOKEN) { console.error('WHATSAPP_TOKEN no configurado en Vercel'); return false }
  const phone = to.replace(/[^0-9]/g, '')
  const fullPhone = phone.startsWith('506') ? phone : '506' + phone

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: fullPhone,
        type: 'text',
        text: { body: message }
      })
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('sendWhatsApp error:', res.status, errBody)
    }
    return res.ok
  } catch (e) {
    console.error('sendWhatsApp exception:', e)
    return false
  }
}
