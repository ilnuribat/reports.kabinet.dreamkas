import Telegraf from 'telegraf';
import * as kabinet from '../kabinetApi';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start(({ reply }) =>
  reply(`Поздравляю!
  Вы установили бота Кабинет Дримкас!
  Чтобы начать получать данные о закрытых сменах, введите токен из Кабинета
  Его можно создать в профиле.

  https://kabinet.dreamkas.ru/app/#!/profile/tokens`));

bot.hears(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, async (ctx) => {
  const { message: { text: token }, chat: { id: chatId }, reply } = ctx;
  const name = await kabinet.getUserName(token);

  await kabinet.upsertWebhooks(token, chatId);

  return reply(`Привет, ${name}`);
});

bot.on('text', async ({ reply }) => {
  await reply('начало меню, снизу кнопки', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'text of button',
          callback_data: 'callback_data_of_button',
        }],
      ],
    },
  });
});

bot.on('callback_query', async (ctx) => {
  try {
    return ctx.editMessageText(
      `edit text ${new Date()}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'сверху слева',
              callback_data: 'callback_data_of_button',
            }, {
              text: 'кнопка справа',
              callback_data: 'callback_data_of_button',
            }],
            [{
              text: 'снизу одна',
              callback_data: 'callback_data_of_button',
            }],
          ],
        },
      },
    );
  } catch (err) {
    return ctx.reply('произошла ошибка, не удалось обновить меню');
  }
});

export default bot;
