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
          error: 'Documentation provider not initialized. Please check your GitHub configuration in Netlify environment variables.' 
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to load documentation tree',
        details: 'Check Netlify function logs for more information'
      })
    };
  }
};