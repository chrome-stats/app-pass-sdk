# App Pass SDK

This SDK facilitates integration with App Pass for Chrome Extensions.
It provides methods to check App Pass status and activate App Pass.
For more information, see https://joinapppass.com/.

## Installation

```bash
npm install @chrome-stats/app-pass-sdk
```

## Usage

### Check App Pass Status

To check if the user has a valid App Pass:

```typescript
import { checkAppPass } from '@chrome-stats/app-pass-sdk';

const response = await checkAppPass();
if (response.status === 'ok') {
  console.log('App Pass is valid');
} else {
  console.log('App Pass invalid:', response.message);
}
```

By default, the SDK uses `chrome.runtime.id`. That is the right value for a
normal extension installed from a browser store. If an unpacked or development
build has a temporary runtime ID, pass the published extension ID registered in
the App Pass catalog instead:

```typescript
const appPassOptions = {
  // Chrome Web Store ID for this extension. Use the corresponding published
  // browser ID when building for a different browser.
  extensionId: 'abcdefghijklmnopabcdefghijklmnop'
};

const response = await checkAppPass(appPassOptions);
```

Use the ID for the current browser's published listing. Do not copy a Chrome
Web Store ID into a Firefox or Edge build unless that is also the ID registered
for that build in App Pass. Omit `extensionId` whenever `chrome.runtime.id`
already matches the App Pass catalog entry.

- Store-installed Chrome, Edge, or Firefox build: omit the options object.
- Unpacked Chrome build: use its Chrome Web Store ID.
- Unpacked Edge build: use the Edge extension ID registered in App Pass.
- Firefox build with `browser_specific_settings.gecko.id`: omit the options
  object because Firefox exposes that value as `chrome.runtime.id`, including
  for temporary installs.
- Temporary Firefox build without an explicit Gecko ID: use the Gecko extension
  ID registered in App Pass.

Always pass an object (`{ extensionId }`), not the ID as a positional string.

### Activate App Pass

To initiate the activation flow (requests permissions and opens activation page):

```typescript
import { activateAppPass } from '@chrome-stats/app-pass-sdk';

const response = await activateAppPass({
  extensionId: 'abcdefghijklmnopabcdefghijklmnop'
});
```

Pass the same `extensionId` to `checkAppPass()` and `activateAppPass()` so the
status check and activation page refer to the same catalog entry.

### Manage App Pass

To open the App Pass management page:

```typescript
import { manageAppPass } from '@chrome-stats/app-pass-sdk';

await manageAppPass();
```

### Server-Side Verification

If you need to verify the App Pass status on your server (e.g., to unlock premium features in your backend), follow these steps:

1. **Retrieve Token**: On the client side (extension), obtain the `appPassToken` from the `checkAppPass()` response. This token is available only when `status` is `'ok'`.

```typescript
const response = await checkAppPass();
if (response.status === 'ok' && response.appPassToken) {
  // Send response.appPassToken to your server
}
```

2. **Verify Token**: On your server, make a GET request to the App Pass API to validate the token.

- **Endpoint**: `https://joinapppass.com/api/check-app-pass`
- **Method**: `GET`
- **Headers**:
  - `app-pass-token`: The token received from the client.

**Example (Node.js/fetch)**:

```typescript
const response = await fetch('https://joinapppass.com/api/check-app-pass', {
  method: 'GET',
  headers: {
    'app-pass-token': receivedAppPassToken
  }
});

const data = await response.json();
if (data.status === 'ok') {
  console.log('User is verified:', data.email);
}
```

## Example Extension

A full working example Chrome extension is available in the [`example/`](https://github.com/chrome-stats/app-pass-sdk/tree/main/example) directory. It demonstrates:

- Checking App Pass status in a popup
- Activating and managing App Pass subscriptions
- Using the SDK in a background service worker

See the [example README](https://github.com/chrome-stats/app-pass-sdk/blob/main/example/README.md) for setup instructions.
