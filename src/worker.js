export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle API requests by proxying to the HTTP backend server (removes Mixed Content & CORS issues)
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': '*',
          },
        });
      }

      const backendUrl = 'http://albaseetcarrental.runasp.net' + url.pathname + url.search;

      const headers = new Headers(request.headers);
      headers.set('Host', 'albaseetcarrental.runasp.net');

      const init = {
        method: request.method,
        headers: headers,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.body) {
        init.body = request.body;
      }

      try {
        const response = await fetch(backendUrl, init);

        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        responseHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Backend proxy error', details: err.message }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Serve static frontend assets for all other routes
    return env.ASSETS.fetch(request);
  },
};
