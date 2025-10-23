import express from 'express';
import cors from 'cors';
import OpenAI, { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Dynamically import pdf-parse to avoid initialization issues
let pdfParse;
const initPdfParse = async () => {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files with correct MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (filePath.endsWith('.html')) {
      res.set('Content-Type', 'text/html; charset=UTF-8');
    }
  }
}));

// Serve the docToFields.js library explicitly (ES6 module)
app.get('/docToFields.js', (req, res) => {
  res.set('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'docToFields.js'));
});

// Initialize OpenAI or Azure OpenAI (will be set per request)
let openai = null;

// Helper function to initialize OpenAI client based on provider
function initOpenAI(config) {
  const { provider, apiKey, azureEndpoint, azureDeployment, azureApiVersion } = config;
  
  if (provider === 'azure') {
    // Azure OpenAI configuration - use AzureOpenAI class
    // Note: deployment name is specified in the API call, not here
    return new AzureOpenAI({
      apiKey: apiKey,
      endpoint: azureEndpoint,
      apiVersion: azureApiVersion || '2024-02-15-preview'
    });
  } else {
    // Standard OpenAI configuration
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

// Extract text from PDF
app.post('/extractText', async (req, res) => {
  try {
    const { file, enableTextract } = req.body;
    const authKey = req.headers['x-auth-key'];
    console.log(authKey);
    if (!file || !file.base64) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const buffer = base64ToBuffer(file.base64);

    // Extract text using pdf-parse
    const parse = await initPdfParse();
    const data = await parse(buffer);
    
    res.json({ 
      text: data.text,
      blocks: [], // Can be enhanced with block-level data
      pages: data.numpages
    });
  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

// Extract fields using OpenAI
app.post('/extract', async (req, res) => {
  try {
    const { prompt, systemPrompt, fields, files, labels, model, enableTextract, aiConfig } = req.body;
    const authKey = req.headers['x-auth-key'];

    if (!authKey) {
      return res.status(401).json({ error: 'No API key provided' });
    }

    // Initialize OpenAI or Azure OpenAI with the provided configuration
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
    
    openai = initOpenAI(config);

    // Process files - extract text if not already extracted
    const processedFiles = [];
    for (const file of files) {
      if (file.text) {
        processedFiles.push({ text: file.text, name: file.name });
      } else if (file.base64) {
        // Extract text from base64 PDF
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
    
    // Replace {input_documents} with actual document text
    const documentsText = processedFiles.map((f, i) => 
      `Document ${i + 1} (${f.name}):\n${f.text}`
    ).join('\n\n');
    
    finalPrompt = finalPrompt.replace('{input_documents}', documentsText);
    
    // Replace {fields} with field descriptions
    if (fields && fields.length > 0) {
      const fieldsText = fields.map(f => 
        `- ${f.name}: ${f.description || 'Extract this field'}`
      ).join('\n');
      finalPrompt = finalPrompt.replace('{fields}', fieldsText);
    }
    
    // Replace {labels} for classification
    if (labels && labels.length > 0) {
      const labelsText = labels.map(l => 
        `- ${l.name}: ${l.description || ''}`
      ).join('\n');
      finalPrompt = finalPrompt.replace('{labels}', labelsText);
    }

    // Determine which model/deployment to use
    let modelToUse = 'gpt-4-turbo';
    
    if (config.provider === 'azure') {
      // For Azure, use the deployment name directly
      modelToUse = config.azureDeployment;
    } else {
      // For OpenAI, map the model name
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
    
    res.json({ 
      text: responseText,
      files: processedFiles
    });
  } catch (error) {
    console.error('Error extracting fields:', error);
    res.status(500).json({ 
      error: 'Failed to extract fields',
      message: error.message 
    });
  }
});

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
  res.json({
    provider: process.env.AI_PROVIDER || 'openai',
    model: process.env.DEFAULT_MODEL || 'gpt-4o',
    azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
    azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
  });
});

// API endpoint to get API key (based on provider)
app.get('/api/key', (req, res) => {
  const provider = process.env.AI_PROVIDER || 'openai';
  const apiKey = provider === 'azure' 
    ? process.env.AZURE_OPENAI_API_KEY 
    : process.env.OPENAI_API_KEY;
  
  res.json({ 
    apiKey: apiKey || '',
    provider: provider
  });
});

// Serve the viewer page
app.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Viewer available at http://localhost:${PORT}/viewer`);
});

