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

  console.log('ℹ️ Netlify Function: docs-info called');

  try {
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
    
    const sourceInfo = docsProvider.getSourceInfo();
    console.log(`✅ Source info: ${sourceInfo.source} - ${sourceInfo.description}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sourceInfo)
    };
  } catch (error) {
    console.error('❌ Error in docs-info function:', error);
    
    let errorMessage = error instanceof Error ? error.message : 'Failed to get docs info';
    let hint = 'Check Netlify function logs for more information';
    
    if (errorMessage.includes('Missing environment variables')) {
      hint = 'Please set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your Netlify dashboard under Site settings > Environment variables';
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