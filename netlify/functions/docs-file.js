const { createDocsProvider } = require('./lib/docs');

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

  console.log('📄 Netlify Function: docs-file called');

  try {
    const { path: filePath } = event.queryStringParameters || {};
    
    if (!filePath || typeof filePath !== 'string') {
      console.error('❌ No file path provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File path is required',
          hint: 'Please provide a valid file path in the query parameters'
        })
      };
    }

    console.log(`📄 Requested file: ${filePath}`);

    const docsProvider = createDocsProvider();
    
    if (!docsProvider) {
      console.error('❌ Failed to create docs provider');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Documentation provider not initialized. Please check your GitHub configuration.',
          hint: 'Set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your Netlify dashboard'
        })
      };
    }

    console.log('🔄 Initializing docs provider...');
    await docsProvider.initialize();
    
    console.log(`📖 Fetching file content: ${filePath}`);
    const content = await docsProvider.fetchFileContent(filePath);
    
    console.log(`✅ Successfully fetched file: ${filePath} (${content.length} characters)`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content })
    };
  } catch (error) {
    console.error('❌ Error in docs-file function:', error);
    
    let errorMessage = error instanceof Error ? error.message : 'Failed to load file';
    let hint = 'Check Netlify function logs for more information';
    
    if (errorMessage.includes('not found')) {
      hint = 'Please verify the file path exists in your documentation repository';
    } else if (errorMessage.includes('Access denied')) {
      hint = 'For private repositories, please set GITHUB_TOKEN in your Netlify environment variables';
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        hint: hint
      })
    };
  }
};