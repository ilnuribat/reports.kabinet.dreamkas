import Telegraf from 'telegraf';
import validate from 'uuid-validate';
import * as kabinet from '../kabinetApi';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const { telegram } = bot;

bot.start(({ reply }) => {
  return reply(`Поздравляю!
  Вы установили бота отчетов
    продаж Кабинет.Дримкас!
  Чтобы начать получать данные
    о закрытых сменах введите 
    токен из Кабинета
  Его можно найти или создать 
    в разделе "Профиль" 
      во вкладке "Токены"`)
});

bot.on('text', async ({ update, reply }) => {
  const { text: token } = update.message;
  const { id: chatId } = update.message.chat;

  if (!validate(token)) {
    return reply('Некорректный формат токена');
  }

  const name = await kabinet.getUserName(token);

  await kabinet.upsertWebhooks(token, chatId);

  return reply(`Привет, ${name}`);
});

export async function test() {
  const res = await kabinet.getUserName('efc393f7-1b36-4aee-b160-5266bbd12071');

  await telegram.sendMessage(249377954, `новый запуск, ${res}`);
}

export default bot;
