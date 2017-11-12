import Koa from 'koa';
import Router from 'koa-router';
import validate from 'uuid-validate';
import bodyparser from 'koa-bodyparser';
import moment from 'moment';
import bot from '../telegram';
import * as kabinet from '../kabinetApi';

const app = new Koa();
const router = new Router();
const { telegram } = bot;


router.post('/webhook/:token/:chatId', async (ctx) => {
  const { token, chatId } = ctx.params;
  const { body } = ctx.request;

  if (!validate(token)) {
    ctx.status = 400;

    return;
  }
  ctx.status = 200;

  if (body.action !== 'UPDATE' || body.type !== 'SHIFT') {
    return;
  }
  const { data } = body;
  const { deviceId, openedAt: from, closedAt: to } = data;
  const deviceInfo = await kabinet.getDeviceInfo({ token, deviceId });
  const { summary } = await kabinet.getReports({ token, device: deviceId, from, to });

  await telegram.sendMessage(chatId, `Отчет от продажах за смену № ${data.shiftId}:
    Кассир: ${data.cashier.name},
    Время открытия: ${moment(data.openedAt).format('HH:mm')},
    Время закрытия: ${moment(data.closedAt).format('HH:mm')},
    Касса: ${deviceInfo.device},
    Магазин: ${deviceInfo.shop},
    Продажи:
      Наличными: ${summary.cash.value},
      Безнал: ${summary.cashless.value}
  `);
});

app
  .use(bodyparser())
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
