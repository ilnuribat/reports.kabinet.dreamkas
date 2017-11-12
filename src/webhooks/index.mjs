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

moment.locale('ru');


router.post('/webhook/:token/:chatId', async (ctx) => {
  const { token, chatId } = ctx.params;
  const { body } = ctx.request;

  if (!validate(token)) {
    ctx.status = 400;

    return;
  }

  if (body.action !== 'UPDATE' || body.type !== 'SHIFT') {
    ctx.status = 204;
    return;
  }
  const { data } = body;
  const { deviceId, openedAt: from, closedAt: to } = data;

  console.log(data)

  const deviceInfo = await kabinet.getDeviceInfo({ token, deviceId });
  const { summary } = await kabinet.getReports({ token, device: deviceId, from, to });

  await telegram.sendMessage(chatId, `Отчет от продажах за смену № ${data.shiftId}:
    Кассир: ${data.cashier.name},
    Время открытия: ${moment(data.openedAt).format('LLL')},
    Время закрытия: ${moment(data.closedAt).format('LLL')},
    Касса: ${deviceInfo.device},
    Магазин: ${deviceInfo.shop},
    Продажи:
      Наличными: ${summary.cash.value / 100} руб.,
      Безнал: ${summary.cashless.value / 100} руб.
  `);
  ctx.status = 204;
});

app
  .use(bodyparser())
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
