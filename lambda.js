// AWS Lambda Handler for PDF Field Extraction
// This replaces server.js for serverless deployment

import { AzureOpenAI } from 'openai';
import OpenAI from 'openai';

// Dynamically import pdf-parse
let pdfParse;
const initPdfParse = async () => {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
};

// Helper function to initialize OpenAI client
function initOpenAI(config) {
  const { provider, apiKey, azureEndpoint, azureDeployment, azureApiVersion } = config;
  
  if (provider === 'azure') {
    return new AzureOpenAI({
      apiKey: apiKey,
      endpoint: azureEndpoint,
      apiVersion: azureApiVersion || '2024-02-15-preview'
    });
  } else {
    return new OpenAI({
      apiKey: apiKey
    });
  }
}

// Helper function to convert base64 to buffer
function base64ToBuffer(base64String) {
  const base64Data = base64String.replace(/^data:.*?;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Auth-Key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

// Lambda handler
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS preflight requests
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Parse the path and method
    const path = event.path || event.rawPath || event.requestContext?.http?.path || '';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

    // Route the request
    if (path === '/extractText' && method === 'POST') {
      return await handleExtractText(event);
    } else if (path === '/extract' && method === 'POST') {
      return await handleExtract(event);
    } else if (path === '/api/config' && method === 'GET') {
      return handleGetConfig(event);
    } else if (path === '/api/key' && method === 'GET') {
      return handleGetKey(event);
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Not found' })
      };
    }
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Handle /extractText endpoint
async function handleExtractText(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { file } = body;

    if (!file || !file.base64) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No file provided' })
      };
    }

    // Convert base64 to buffer
    const buffer = base64ToBuffer(file.base64);

    // Extract text using pdf-parse
    const parse = await initPdfParse();
    const data = await parse(buffer);
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        text: data.text,
        blocks: [],
        pages: data.numpages
      })
    };
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to extract text from PDF' })
    };
  }
}

// Handle /extract endpoint
async function handleExtract(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, systemPrompt, fields, files, labels, model, aiConfig } = body;
    
    // Get auth key from headers
    const authKey = event.headers['x-auth-key'] || event.headers['X-Auth-Key'];

    if (!authKey) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No API key provided' })
      };
    }

    // Initialize OpenAI or Azure OpenAI
    const config = {
      apiKey: authKey,
      provider: aiConfig?.provider || 'openai',
      azureEndpoint: aiConfig?.azureEndpoint,
      azureDeployment: aiConfig?.azureDeployment,
      azureApiVersion: aiConfig?.azureApiVersion
    };
    
    console.log('AI Config:', {
      provider: config.provider,
      endpoint: config.azureEndpoint,
      deployment: config.azureDeployment,
      hasApiKey: !!config.apiKey
    });
    
    const openai = initOpenAI(config);

    // Process files - extract text if not already extracted
    const processedFiles = [];
    for (const file of files) {
      if (file.text) {
        processedFiles.push({ text: file.text, name: file.name });
      } else if (file.base64) {
        const buffer = base64ToBuffer(file.base64);
        const parse = await initPdfParse();
        const data = await parse(buffer);
        processedFiles.push({ 
          text: data.text, 
          name: file.name,
          blocks: []
        });
      }
    }

    // Build the prompt
    let finalPrompt = prompt;
    
    const documentsText = processedFiles.map((f, i) => 
      `Document ${i + 1} (${f.name}):\n${f.text}`
    ).join('\n\n');
    
    finalPrompt = finalPrompt.replace('{input_documents}', documentsText);
    
    if (fields && fields.length > 0) {
      const fieldsText = fields.map(f => 
        `- ${f.name}: ${f.description || 'Extract this field'}`
      ).join('\n');
      finalPrompt = finalPrompt.replace('{fields}', fieldsText);
    }
    
    if (labels && labels.length > 0) {
      const labelsText = labels.map(l => 
        `- ${l.name}: ${l.description || ''}`
      ).join('\n');
      finalPrompt = finalPrompt.replace('{labels}', labelsText);
    }

    // Determine model/deployment
    let modelToUse = 'gpt-4-turbo';
    
    if (config.provider === 'azure') {
      modelToUse = config.azureDeployment;
    } else {
      if (model) {
        if (model.includes('gpt-4o')) modelToUse = 'gpt-4o';
        else if (model.includes('gpt-4-turbo')) modelToUse = 'gpt-4-turbo';
        else if (model.includes('gpt-4')) modelToUse = 'gpt-4';
        else if (model.includes('gpt-3.5')) modelToUse = 'gpt-3.5-turbo';
      }
    }

    console.log('Making API call with model/deployment:', modelToUse);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: finalPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const responseText = completion.choices[0].message.content;
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        text: responseText,
        files: processedFiles
      })
    };
  } catch (error) {
    console.error('Error extracting fields:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to extract fields',
        message: error.message 
      })
    };
  }
}

// Handle /api/config endpoint
function handleGetConfig(event) {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      provider: process.env.AI_PROVIDER || 'openai',
      model: process.env.DEFAULT_MODEL || 'gpt-4o',
      azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
      azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
    })
  };
}

// Handle /api/key endpoint
function handleGetKey(event) {
  const provider = process.env.AI_PROVIDER || 'openai';
  const apiKey = provider === 'azure' 
    ? process.env.AZURE_OPENAI_API_KEY 
    : process.env.OPENAI_API_KEY;
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ 
      apiKey: apiKey || '',
      provider: provider
    })
  };
}


