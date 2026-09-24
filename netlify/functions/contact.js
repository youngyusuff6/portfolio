const contactHandler = require('../../api/contact.js');

exports.handler = async function netlifyContactHandler(event) {
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request.' })
    };
  }

  let statusCode = 200;
  const response = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
    }
  };

  return contactHandler({ method: event.httpMethod, body }, response);
};
