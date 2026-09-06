// App Pass SDK
const urlBase = 'https://joinapppass.com';

export interface AppPassResponse {
  /**
   * The status of the App Pass check.
   * Possible values:
   * - 'ok': App Pass is valid and active.
   * - 'no_apppass': User does not have an active App Pass subscription.
   * - 'rate_limited': Too many checks from this network; the check never reached App Pass.
   * - 'unknown_error': Connection error or server failure.
   */
  status: string;

  /**
   * A human-readable message explaining the status, especially when status is not 'ok'.
   */
  message?: string;

  /**
   * The email of the user, present when status is 'ok'.
   */
  email?: string;

  /**
   * The encrypted App Pass token, returned when status is 'ok'.
   * Can be used for subsequent authentication without cookies.
   */
  appPassToken?: string;

  /**
   * How long to wait before checking again, in seconds. Present only when status is
   * 'rate_limited' and the server said how long the block lasts.
   */
  retryAfterSeconds?: number;
}

// Function to check app pass status via API
async function checkStatus(): Promise<AppPassResponse> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const headers: HeadersInit = {
        extensionid: chrome.runtime.id,
        'Content-Type': 'application/json'
      };
      const response = await fetch(`${urlBase}/api/check-app-pass`, {
        method: 'GET',
        headers,
        credentials: 'include' // Include cookies for authentication
      });

      // A rate-limit block is served by the edge, not the app, so it carries an HTML body rather
      // than the JSON every other status returns. Parsing it threw, which looked like a connection
      // error and burned the remaining attempts inside a mitigation window they could not outlast.
      // Report it instead, and pass along how long to wait.
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'));
        console.warn('App pass status check was rate limited');
        return {
          status: 'rate_limited',
          message: 'Too many App Pass checks from this network. Try again shortly.',
          retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined
        };
      }

      if (response.ok || (response.status < 500 && response.status >= 400)) {
        // A body that is not JSON is a response from something other than the App Pass endpoint
        // (a captive portal, a proxy error page). Retrying cannot fix it within this call.
        let data;
        try {
          data = await response.json();
        } catch {
          console.error('App pass status response was not JSON:', response.status);
          return {
            status: 'unknown_error',
            message: 'Unexpected response from server'
          };
        }
        console.log('App pass status response:', data);
        return {
          status: data.status || 'unknown_error',
          message: data.message,
          email: data.email,
          appPassToken: data.appPassToken
        };
      } else {
        console.error(
          `App pass status check failed (attempt ${attempt}/${maxAttempts}):`,
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error(`Error checking app pass status (attempt ${attempt}/${maxAttempts}):`, error);
    }

    // If not the last attempt, wait before retrying
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }

  console.error('App pass status check failed after all retry attempts');
  return { status: 'unknown_error', message: 'Failed to connect to server' };
}

/**
 * Checks the status of the App Pass.
 * Verifies permissions and calls the server to check validity.
 * @returns Promise<AppPassResponse>
 */
export async function checkAppPass(): Promise<AppPassResponse> {
  const res = await checkStatus();
  return res;
}

/**
 * Initiates the App Pass activation flow.
 * Requests necessary permissions and opens the activation page.
 * @returns Promise<AppPassResponse>
 */
export async function activateAppPass(): Promise<AppPassResponse> {
  const res = await checkStatus();
  await chrome.tabs.create({
    url: `${urlBase}/add/${encodeURIComponent(chrome.runtime.id)}`
  });
  return res;
}

/**
 * Opens the App Pass management page.
 * @returns Promise<void>
 */
export async function manageAppPass(): Promise<void> {
  await chrome.tabs.create({
    url: `${urlBase}/mypass`
  });
}
