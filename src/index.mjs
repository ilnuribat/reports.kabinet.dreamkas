import bot from './telegram';
import app from './webhooks';

bot.startPolling();
app.listen(process.env.HTTP_PORT);
console.log('bot started');
