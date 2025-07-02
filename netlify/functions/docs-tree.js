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

  console.log('📋 Netlify Function: docs-tree called');
  console.log('🌍 Environment variables check:');
  console.log(`- GITHUB_REPO_OWNER: ${process.env.GITHUB_REPO_OWNER ? 'Set' : 'Not set'}`);
  console.log(`- GITHUB_REPO_NAME: ${process.env.GITHUB_REPO_NAME ? 'Set' : 'Not set'}`);
  console.log(`- GITHUB_DOCS_PATH: ${process.env.GITHUB_DOCS_PATH || 'docs (default)'}`);
  console.log(`- GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? 'Set' : 'Not set'}`);

  try {
    const docsProvider = createDocsProvider();
    
    if (!docsProvider) {
      console.error('❌ Failed to create docs provider');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Documentation provider not initialized. Please check your GitHub configuration in Netlify environment variables.',
          hint: 'Set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your Netlify dashboard under Site settings > Environment variables'
        })
      };
    }

    console.log('🔄 Initializing docs provider...');
    await docsProvider.initialize();
    
    console.log('🌳 Building file tree...');
    const tree = await docsProvider.buildFileTree();
    
    console.log(`✅ Successfully built tree with ${tree.length} items`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ tree })
    };
  } catch (error) {
    console.error('❌ Error in docs-tree function:', error);
    
    // Provide more helpful error messages
    let errorMessage = error instanceof Error ? error.message : 'Failed to load documentation tree';
    let hint = 'Check Netlify function logs for more information';
    
    if (errorMessage.includes('Missing environment variables')) {
      hint = 'Please set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your Netlify dashboard under Site settings > Environment variables';
    } else if (errorMessage.includes('Repository') && errorMessage.includes('not found')) {
      hint = 'Please verify your GitHub repository name and ensure it exists and is accessible';
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