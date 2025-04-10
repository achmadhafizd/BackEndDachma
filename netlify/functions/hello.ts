// netlify/functions/hello.js
exports.handler = async () => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello from Netlify Functions!" }),
    };
  };
  
  module.exports.handler = exports.handler;  