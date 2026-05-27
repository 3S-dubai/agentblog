exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: { message: 'Method not allowed' } }) };
  }

  try {
    const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
    
    if (!apiKey) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: { message: 'No API key provided' } }) };
    }

    const body = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return { statusCode: response.status, headers, body: JSON.stringify(data) };
    } catch(e) {
      return { statusCode: response.status, headers, body: JSON.stringify({ error: { message: text } }) };
    }

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: { message: err.message } }) };
  }
};
