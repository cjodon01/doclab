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
          error: 'Documentation provider not initialized. Please check your configuration.' 
        })
      };
    }

    await docsProvider.initialize();
    const tree = await docsProvider.buildFileTree();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ tree })
    };
  } catch (error) {
    console.error('Error fetching file tree:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to load documentation' 
      })
    };
  }
};