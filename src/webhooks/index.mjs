import Koa from 'koa';
import Router from 'koa-router';
import validate from 'uuid-validate';
import bodyparser from 'koa-bodyparser';
import bot from '../telegram';

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

  await telegram.sendMessage(chatId, `смена №${body.shiftId} закрыта`);
  ctx.status = 200;
});

app
  .use(bodyparser())
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
