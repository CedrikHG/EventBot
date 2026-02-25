const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;

export const sendTelegramMessage = async (chatId, text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML' // Permite usar negritas y formato en el mensaje
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.description || 'Error al enviar mensaje de Telegram');
  }

  return await response.json();
};