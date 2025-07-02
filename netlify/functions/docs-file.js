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
    const { path: filePath } = event.queryStringParameters || {};
    
    if (!filePath || typeof filePath !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File path is required' })
      };
    }

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
    const content = await docsProvider.fetchFileContent(filePath);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content })
    };
  } catch (error) {
    console.error('Error fetching file:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to load file' 
      })
    };
  }
};