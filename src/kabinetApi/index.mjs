import request from 'request-promise';
import _ from 'lodash';

const rq = request.defaults({
  baseUrl: 'https://kabinet.dreamkas.ru/api',
  json: true,
});

function getHeaders(token) {
  return {
    authorization: `bearer ${token}`,
  };
}

export async function getUserName(token) {
  const { name } = await rq({
    method: 'GET',
    url: '/users/0',
    headers: getHeaders(token),
  });

  return name;
}

export async function upsertWebhooks(token, chatId) {
  const webhooks = await rq({
    method: 'GET',
    url: '/webhooks',
    headers: getHeaders(token),
  });
  const webhookURL = `http://95.213.202.42/webhook/${token}/${chatId}`;
  const found = _.find(webhooks, { url: webhookURL });

  if (!found) {
    // create new one
    return rq({
      method: 'POST',
      url: '/webhooks',
      headers: getHeaders(token),
      body: {
        url: webhookURL,
        isActive: true,
        types: { shifts: true },
      },
    });
  }

  return rq({
    method: 'PATCH',
    url: `/webhooks/${found.id}`,
    headers: getHeaders(token),
    body: {
      isActive: true,
      types: { shifts: true },
    },
  });
}
