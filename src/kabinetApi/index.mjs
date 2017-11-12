import request from 'request-promise';
import _ from 'lodash';
import dotenv from 'dotenv';

dotenv.config();

const rq = request.defaults({
  baseUrl: process.env.KABINET_URL,
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
  const { WEBHOOK_HOST, HTTP_PORT } = process.env;
  const webhookURL = `${WEBHOOK_HOST}:${HTTP_PORT}/webhook/${token}/${chatId}`;
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

export async function getReports({ token, device, from, to }) {
  const reports = await rq({
    method: 'GET',
    url: `/reports/counters?details=true&devices=${device}&from=${from}&to=${to}`,
    headers: getHeaders(token),
  });

  return reports;
}

export async function getDeviceInfo({ token, deviceId }) {
  const device = await rq({
    method: 'GET',
    url: `/devices/${deviceId}`,
    headers: getHeaders(token),
  });
  let shop = 'Без Магазина';

  if (device.groupId) {
    shop = await rq({
      method: 'GET',
      url: `/shops/${device.groupId}`,
      headers: getHeaders(token),
    });
  }

  return {
    device: device.name,
    shop: shop.name,
  };
}
