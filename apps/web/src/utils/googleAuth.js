/**
 * Google Identity Services (GIS) Client Helper
 * Handles Google OAuth 2.0 Token Client with prompt='select_account'
 * to display all Google accounts on the user's device and select among them.
 */

export async function fetchAuthConfig() {
  try {
    const res = await fetch('/api/v1/auth/config');
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
  } catch (e) {
    console.warn('Failed to load auth config from backend:', e);
  }
  return {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    smtpConfigured: false
  };
}

/**
 * Trigger native Google Account Chooser via Google Identity Services (GIS)
 * prompt: 'select_account' forces Google to show all accounts on device
 */
export function promptGoogleIdentityServices({ clientId, onSuccess, onError, onFallback }) {
  if (!clientId) {
    // No client ID configured in .env -> use rich interactive account chooser modal
    if (onFallback) onFallback();
    return;
  }

  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    console.warn('Google Identity Services SDK not loaded yet. Using fallback chooser.');
    if (onFallback) onFallback();
    return;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      prompt: 'select_account', // CRITICAL: Forces Google to display all accounts on device
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('Google OAuth error:', tokenResponse);
          if (onError) onError(tokenResponse.error_description || tokenResponse.error);
          return;
        }

        try {
          // Send access token to backend to authenticate and sync verified Google profile
          const res = await fetch('/api/v1/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: tokenResponse.access_token })
          });

          const data = await res.json();
          if (data.success && data.data?.token) {
            if (onSuccess) onSuccess(data.data);
          } else {
            if (onError) onError(data.error?.message || 'Google authentication failed');
          }
        } catch (err) {
          if (onError) onError('Failed to connect to authentication server');
        }
      }
    });

    client.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    console.error('Error invoking Google Identity Services client:', err);
    if (onFallback) onFallback();
  }
}
