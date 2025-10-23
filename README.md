# AI PDF Field Extractor

A powerful JavaScript library and Node.js server for extracting structured fields from PDF documents using AI (OpenAI GPT models). Upload a PDF, define fields with descriptions, and let AI extract the data automatically.

## 🌟 Features

- **📄 PDF Text Extraction** - Automatically extract text from PDF documents
- **🤖 AI-Powered Field Extraction** - Use OpenAI GPT models to intelligently extract fields
- **🎨 Beautiful Viewer UI** - Split-panel interface with fields on left and PDF preview on right
- **🔄 Real-time Communication** - Seamless data flow between library, server, and viewer
- **📦 Easy Integration** - Simple JavaScript library that works in any HTML page
- **⚡ Multiple Extraction Modes** - Use viewer or extract directly
- **🎯 Flexible Field Configuration** - Define custom fields with descriptions

## 📋 Project Structure

```
AIPdfExtrator/
├── docToFields.js       # Main JavaScript library
├── server.js            # Node.js server with API endpoints
├── viewer.html          # Viewer page with split layout
├── demo.html            # Demo/example usage page
├── package.json         # Node.js dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or navigate to the project directory
cd AIPdfExtrator

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
```

### 2. Configuration

Edit `.env` file (optional - API key can also be provided from the client):

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Start Server

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

Server will be running at: `http://localhost:3000`

### 4. Open Demo

Open your browser and navigate to:
```
http://localhost:3000/demo.html
```

## 📖 Usage

### Basic Usage Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF Field Extractor</title>
</head>
<body>
    <input type="file" id="pdfFile" accept=".pdf" />
    <button id="extractBtn">Extract Fields</button>
    <div id="results"></div>

    <script type="module">
        import { DocsToFields } from './docToFields.js';

        const docsToFields = new DocsToFields({
            authKey: 'your-openai-api-key',
            url: 'http://localhost:3000',
            model: 'openai_gpt-4o'
        });

        // Define fields to extract
        docsToFields.addField({ 
            name: 'ShippingDate', 
            description: 'The date on which shipment will be dispatched' 
        });
        docsToFields.addField({ 
            name: 'InvoiceNumber', 
            description: 'The invoice or order number' 
        });
        docsToFields.addField({ 
            name: 'TotalAmount', 
            description: 'The total amount or price' 
        });

        document.getElementById('extractBtn').addEventListener('click', async () => {
            const file = document.getElementById('pdfFile').files[0];
            
            // Extract text from PDF
            await docsToFields.fileExtractText(file);
            
            // Extract fields using AI
            const results = await docsToFields.getFields();
            
            document.getElementById('results').textContent = 
                JSON.stringify(results, null, 2);
        });
    </script>
</body>
</html>
```

### Using the Viewer

```javascript
import { DocsToFields } from './docToFields.js';

const docsToFields = new DocsToFields({
    authKey: 'your-openai-api-key',
    url: 'http://localhost:3000',
    viewerUrl: 'http://localhost:3000/viewer',
    model: 'openai_gpt-4o'
});

// Add fields
docsToFields.addField({ 
    name: 'ShippingDate', 
    description: 'Date of shipment' 
});

// Add PDF file
docsToFields.addFile(pdfFileObject);

// Open viewer window with callback
docsToFields.viewFile({
    showFields: true,
    sendFile: true,
    callback: (result) => {
        if (result.fields) {
            console.log('Extracted fields:', result.fields);
            // Use the extracted fields in your application
        }
    }
});
```

## 🎯 API Reference

### DocsToFields Class

#### Constructor

```javascript
new DocsToFields(settings)
```

**Settings:**
- `authKey` (string) - OpenAI API key
- `url` (string) - Server URL (default: current domain)
- `viewerUrl` (string) - Viewer page URL (default: '/viewer')
- `model` (string) - AI model to use (default: 'openai_gpt-4-turbo')
- `systemPrompt` (string) - Custom system prompt for AI
- `prompt` (string) - Custom extraction prompt
- `fields` (array) - Initial fields configuration
- `fileDropElement` (HTMLElement) - Element for drag & drop

#### Methods

**`addField(field)`**
Add a field to extract from documents.

```javascript
docsToFields.addField({ 
    name: 'FieldName', 
    description: 'Description for AI' 
});
```

**`addFile(file, text?, blocks?)`**
Add a PDF file to process.

```javascript
docsToFields.addFile(fileObject);
```

**`fileExtractText(file)`**
Extract text from PDF file.

```javascript
await docsToFields.fileExtractText(fileObject);
```

**`getFields()`**
Extract fields using AI.

```javascript
const fields = await docsToFields.getFields();
```

**`viewFile(options)`**
Open viewer window.

```javascript
docsToFields.viewFile({
    showFields: true,
    sendFile: true,
    callback: (result) => {
        console.log(result.fields);
    }
});
```

**`setAuthKey(key)`**
Set or update API key.

```javascript
docsToFields.setAuthKey('new-api-key');
```

**`setModel(model)`**
Set AI model to use.

```javascript
docsToFields.setModel('openai_gpt-4o');
```

**`clearFields()`**
Clear all configured fields.

**`clearFiles()`**
Clear all added files.

### Available Models

```javascript
import { ModelEnum } from './docToFields.js';

ModelEnum.OPENAP_GPT_4o              // GPT-4o (recommended)
ModelEnum.OPENAI_GPT_4_TURBO         // GPT-4 Turbo
ModelEnum.OPENAI_GPT_4               // GPT-4
ModelEnum.OPENAI_GPT_3_5_TURBO       // GPT-3.5 Turbo
```

## 🔌 Server API Endpoints

### POST `/extractText`
Extract text from PDF file.

**Request:**
```json
{
  "file": {
    "name": "document.pdf",
    "base64": "data:application/pdf;base64,..."
  }
}
```

**Response:**
```json
{
  "text": "Extracted text content...",
  "blocks": [],
  "pages": 5
}
```

### POST `/extract`
Extract fields using AI.

**Request:**
```json
{
  "prompt": "Extract the following fields...",
  "systemPrompt": "You are a helpful assistant...",
  "fields": [
    { "name": "ShippingDate", "description": "Date of shipment" }
  ],
  "files": [
    { "text": "Document content..." }
  ],
  "model": "openai_gpt-4o"
}
```

**Response:**
```json
{
  "text": "{\"ShippingDate\": \"2024-10-15\", ...}",
  "files": [...]
}
```

## 🎨 Viewer Features

The viewer window provides:

- **Left Panel - Fields:**
  - Display all configured fields
  - Show field descriptions
  - Edit and populate field values
  - Real-time updates from AI

- **Right Panel - PDF Preview:**
  - Render PDF document
  - Scroll through pages
  - Visual reference while reviewing fields

- **Apply Button:**
  - Send extracted values back to parent window
  - Close viewer automatically
  - Trigger callback in main application

## 🛠️ How It Works

1. **User uploads PDF** in the main application
2. **Define fields** with names and descriptions
3. **Open viewer** or extract directly
4. **PDF sent to server** for text extraction
5. **Text + fields sent to OpenAI** for extraction
6. **AI returns structured data** matching field definitions
7. **Fields populated** in viewer or returned to callback
8. **User reviews/edits** and clicks Apply
9. **Data sent back** to main application via callback

## 📝 Example Field Definitions

```javascript
// Invoice Processing
docsToFields.addField({ 
    name: 'InvoiceNumber', 
    description: 'The invoice number (e.g., INV-001234)' 
});
docsToFields.addField({ 
    name: 'InvoiceDate', 
    description: 'Date the invoice was issued' 
});
docsToFields.addField({ 
    name: 'TotalAmount', 
    description: 'Total invoice amount with currency' 
});
docsToFields.addField({ 
    name: 'VendorName', 
    description: 'Name of the vendor or supplier' 
});

// Shipping Documents
docsToFields.addField({ 
    name: 'TrackingNumber', 
    description: 'Package tracking number' 
});
docsToFields.addField({ 
    name: 'ShippingDate', 
    description: 'Date when shipment will be dispatched' 
});
docsToFields.addField({ 
    name: 'Destination', 
    description: 'Shipping destination address' 
});

// Contracts
docsToFields.addField({ 
    name: 'ContractNumber', 
    description: 'Unique contract identifier' 
});
docsToFields.addField({ 
    name: 'PartyNames', 
    description: 'Names of all parties in the contract' 
});
docsToFields.addField({ 
    name: 'EffectiveDate', 
    description: 'Date when contract becomes effective' 
});
docsToFields.addField({ 
    name: 'ExpirationDate', 
    description: 'Date when contract expires' 
});
```

## 🔒 Security Notes

- API keys are sent from client to server (use HTTPS in production)
- Consider implementing server-side API key management
- Validate and sanitize all inputs
- Implement rate limiting for production use
- Use environment variables for sensitive data

## 🐛 Troubleshooting

**Issue: Viewer window not opening**
- Check if popup blockers are enabled
- Ensure server is running on correct port
- Verify URLs in configuration

**Issue: PDF not displaying**
- Ensure PDF file is valid and not corrupted
- Check browser console for errors
- Verify file size is within limits

**Issue: AI extraction failing**
- Verify OpenAI API key is valid
- Check API usage limits
- Ensure model name is correct
- Review console logs for detailed errors

**Issue: CORS errors**
- Ensure server is running
- Check CORS configuration in server.js
- Verify URLs match in configuration

## 📦 Dependencies

- **express** - Web server framework
- **cors** - Enable CORS for API
- **openai** - OpenAI API client
- **pdf-parse** - PDF text extraction
- **dotenv** - Environment variables

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests.

## 📄 License

MIT License

## 🔗 Links

- OpenAI API: https://platform.openai.com/
- Documentation: See code comments in docToFields.js

## 💡 Tips

1. **Better Descriptions = Better Results**: Provide clear, detailed field descriptions
2. **Choose Right Model**: GPT-4o is recommended for accuracy
3. **Test with Sample PDFs**: Start with simple documents
4. **Review AI Output**: Always verify extracted data
5. **Use Viewer for Complex Cases**: Visual reference helps with accuracy

## 🎯 Use Cases

- Invoice processing and data entry automation
- Contract analysis and key term extraction
- Shipping document processing
- Form data extraction
- Legal document review
- Medical records processing
- Any document-based workflow automation

---

Made with ❤️ for automated document processing

