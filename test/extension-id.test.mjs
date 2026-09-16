import assert from 'node:assert/strict';
import test from 'node:test';

const requests = [];
const openedTabs = [];

globalThis.chrome = {
  runtime: { id: 'runtime-extension-id' },
  tabs: {
    create: async (details) => {
      openedTabs.push(details);
      return details;
    }
  }
};

globalThis.fetch = async (url, options) => {
  requests.push({ url, options });
  return new Response(JSON.stringify({ status: 'ok', appPassToken: 'token' }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};

const { activateAppPass, checkAppPass } = await import('../dist/index.mjs');

test('checkAppPass uses the runtime ID by default', async () => {
  requests.length = 0;

  const response = await checkAppPass();

  assert.equal(response.status, 'ok');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers.extensionid, 'runtime-extension-id');
});

test('checkAppPass accepts a published extension ID override', async () => {
  requests.length = 0;

  await checkAppPass({ extensionId: 'published-extension-id' });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers.extensionid, 'published-extension-id');
});

test('activateAppPass uses the override for both the check and activation URL', async () => {
  requests.length = 0;
  openedTabs.length = 0;

  await activateAppPass({ extensionId: 'published extension/id' });

  assert.equal(requests[0].options.headers.extensionid, 'published extension/id');
  assert.deepEqual(openedTabs, [
    { url: 'https://joinapppass.com/add/published%20extension%2Fid' }
  ]);
});
