// App Pass SDK
const urlBase = 'http://localhost:8080';

export interface AppPassResponse {
  /**
   * The status of the App Pass check.
   * Possible values:
   * - 'ok': App Pass is valid and active.
   * - 'no_perm': Host permission for chrome-stats.com is missing.
   * - 'no_apppass': User does not have an active App Pass subscription.
   * - 'ext_inactive': Extension is not part of App Pass or not active for this user.
   * - 'err': Connection error or server failure.
   * - 'unknown_error': Unexpected response format.
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
}

// Function to check app pass status via API
async function checkStatus(): Promise<AppPassResponse> {
  // Check if user has granted the host permission
  const hasPermission = await chrome.permissions.contains({
    origins: [`${urlBase}/`]
  });

  if (!hasPermission) {
    console.log('App Pass not activated - skipping status check');
    return { status: 'no_perm', message: 'Permission denied' };
  }
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const headers: HeadersInit = {
        extensionId: chrome.runtime.id,
        'Content-Type': 'application/json'
      };
      const response = await fetch(`${urlBase}/api/check-app-pass`, {
        method: 'GET',
        headers,
        credentials: 'include' // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
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
  return { status: 'err', message: 'Failed to connect to server' };
}

/**
 * Checks the status of the App Pass.
 * Verifies permissions and calls the server to check validity.
 * @returns Promise<AppPassResponse>
 */
export async function checkAppPass(): Promise<AppPassResponse> {
  const hasPermission = await chrome.permissions.contains({
    origins: [`${urlBase}/`]
  });
  if (!hasPermission) {
    return { status: 'no_perm', message: 'Permission denied' };
  }
  const res = await checkStatus();
  return res;
}

/**
 * Initiates the App Pass activation flow.
 * Requests necessary permissions and opens the activation page.
 * @returns Promise<AppPassResponse>
 */
export async function activateAppPass(): Promise<AppPassResponse> {
  const granted = await chrome.permissions.request({
    origins: [`${urlBase}/`]
  });
  if (granted) {
    const res = await checkStatus();
    await chrome.tabs.create({
      url: `${urlBase}/apppass/add/${encodeURIComponent(chrome.runtime.id)}`
    });
    return res;
  }
  return { status: 'no_perm', message: 'Permission denied' };
}
