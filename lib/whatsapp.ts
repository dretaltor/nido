const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '1156099824249418'
const WA_TOKEN = process.env.WHATSAPP_TOKEN || 'EAA9uUc0RdRkBRqxPkZAYTxTVtjESr7CkBC27lH9q7v3lNebwxTZA1FMcvYU0FyJRkgaynzHrtrx6Cz8kJSBJ0VZBDDmjgKP83CqquHvhw9Dazc4oKA9AcgljAFWZAOZAyMr17EMtx9AZCSqYgUjLW6tZCbCNAgkKrlsQjp8ip1zpPapqnylqFDd2KyASbjdTgZDZD'

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
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
    return res.ok
  } catch {
    return false
  }
}
