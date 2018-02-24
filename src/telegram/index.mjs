import Telegraf from 'telegraf';
import validate from 'uuid-validate';
import * as kabinet from '../kabinetApi';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start(({ reply }) =>
  reply(`Поздравляю!
  Вы установили бота Кабинет Дримкас!
  Чтобы начать получать данные о закрытых сменах, введите токен из Кабинета
  Его можно создать в профиле.

  https://kabinet.dreamkas.ru/app/#!/profile/tokens`));

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

export default bot;
