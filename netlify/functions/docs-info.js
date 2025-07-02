const { createDocsProvider } = require('../../dist/lib/docs');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const docsProvider = createDocsProvider();
    
    if (!docsProvider) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Documentation provider not initialized' 
        })
      };
    }

    await docsProvider.initialize();
    const sourceInfo = docsProvider.getSourceInfo();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sourceInfo)
    };
  } catch (error) {
    console.error('Error getting docs info:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to get docs info' 
      })
    };
  }
};