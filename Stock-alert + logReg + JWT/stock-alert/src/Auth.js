async function login(username, password) {
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Invalid username or password');
    }
    console.log('Logged in successfully!');
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error; 
  }
}


export async function attemptRefresh() {
  const response = await fetch('/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  return response;
}

async function getProtectedData() {
  try {
    // First call /protected
    let response = await fetch('/protected', {
      method: 'GET',
      credentials: 'include'
    });
    
    // If the request is OK (200), return the full response
    if (response.ok) {
      const data = await response.json();
      console.log('Protected data:', data);
      // If you want the caller to see the JSON, you could store it
      // or just re-fetch it in the caller. Minimal approach: return the original response
      // (which can't be re-read as JSON, but the status is enough for App.js).
      return new Response(null, { status: 200 }); 
      // Explanation: Once we do response.json(), the body is "consumed".
      // So we return a mock 200 response so App.js sees status===200.
    }

    // If /protected => 401, possibly the token is expired => attempt refresh
    if (response.status === 401) {
      const refreshRes = await fetch('/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      // If refresh OK, call /protected again
      if (refreshRes.ok) {
        response = await fetch('/protected', {
          method: 'GET',
          credentials: 'include'
        });
        return response; // final attempt (could be 200 or 401, etc.)
      }
      // If refresh fails => return refreshRes or the original 401
      return refreshRes;
    }

    // If it’s some other error (e.g. 500), just return it
    return response;

  } catch (error) {
    console.error('Error accessing protected route:', error);
    throw error;
  }
}

// Exports
export { login, getProtectedData };
