import bot from './telegram';
import app from './webhooks';

bot.startPolling();
app.listen(process.env.HTTP_PORT || 8080);
console.log('bot started');
