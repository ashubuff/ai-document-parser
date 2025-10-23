# Quick Start Guide - AI PDF Field Extractor

Get up and running in 5 minutes! 🚀

## Step 1: Install Dependencies (1 minute)

```bash
cd /Users/ashutoshbelwal/Documents/vsCode/AIPdfExtrator
npm install
```

This installs:
- express (web server)
- cors (enable API access)
- openai (AI integration)
- pdf-parse (PDF text extraction)
- dotenv (environment variables)

## Step 2: Get OpenAI API Key (2 minutes)

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

💡 **Tip:** You can also set it in `.env` file (optional):
```bash
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here
```

## Step 3: Start Server (30 seconds)

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
Viewer available at http://localhost:3000/viewer
```

## Step 4: Open Demo (30 seconds)

Open your browser and go to:
```
http://localhost:3000/demo.html
```

## Step 5: Test It! (1 minute)

### Using Demo Page:

1. **Paste your OpenAI API key** in the first input field
2. **Select AI Model** (GPT-4o recommended)
3. **Upload a PDF**:
   - Click the upload zone, OR
   - Drag & drop a PDF file
4. **Review/Edit Fields** (default fields are already added):
   - ShippingDate
   - InvoiceNumber
   - TotalAmount
   - Add more if needed
5. **Click "🚀 Open Viewer & Extract"** button

### What Happens:

1. Viewer window opens (split panel)
2. PDF displays on right side
3. Fields show on left side
4. AI automatically extracts field values
5. You can review/edit values
6. Click "Apply & Close"
7. Results appear in demo page!

---

## 🎯 Two Extraction Modes

### Mode 1: Viewer Mode (Visual)
- Opens viewer window
- Shows PDF preview
- Interactive field editing
- Click "🚀 Open Viewer & Extract"

### Mode 2: Direct Mode (Headless)
- No viewer window
- Faster extraction
- Results in demo page only
- Click "⚡ Extract Directly"

---

## 📝 Code Example

Want to integrate in your own page? Here's a minimal example:

### Create `test.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test PDF Extraction</title>
</head>
<body>
    <h1>PDF Field Extractor Test</h1>
    
    <input type="file" id="pdfFile" accept=".pdf" />
    <button id="extractBtn">Extract</button>
    
    <pre id="results"></pre>

    <script type="module">
        import { DocsToFields } from './docToFields.js';

        document.getElementById('extractBtn').onclick = async () => {
            // Initialize
            const dtf = new DocsToFields({
                authKey: 'sk-your-key-here',  // Replace with your key
                url: 'http://localhost:3000',
                model: 'openai_gpt-4o'
            });

            // Define fields
            dtf.addField({ 
                name: 'ShippingDate', 
                description: 'Date of shipment' 
            });
            dtf.addField({ 
                name: 'InvoiceNumber', 
                description: 'Invoice number' 
            });

            // Get file
            const file = document.getElementById('pdfFile').files[0];
            
            // Extract
            await dtf.fileExtractText(file);
            const results = await dtf.getFields();
            
            // Display
            document.getElementById('results').textContent = 
                JSON.stringify(results, null, 2);
        };
    </script>
</body>
</html>
```

Open: `http://localhost:3000/test.html`

---

## 🧪 Test PDFs

Don't have a test PDF? Use these:

1. **Create a simple invoice PDF** with:
   - Company name
   - Invoice number: INV-12345
   - Date: October 15, 2024
   - Total: $1,234.56

2. **Or use any PDF with**:
   - Dates
   - Numbers
   - Text fields
   - Addresses

The AI is smart enough to extract even from poorly formatted PDFs!

---

## 🔍 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Error: Cannot find module 'express'"
**Solution:** Run `npm install` first

### Issue: "Viewer window blocked"
**Solution:** Allow popups for localhost in browser settings

### Issue: "Error: No API key provided"
**Solution:** Make sure you entered your OpenAI API key

### Issue: "Error extracting fields"
**Solution:** 
- Check API key is valid
- Verify you have OpenAI credits
- Check browser console for details
- Ensure PDF is valid (not scanned image)

### Issue: "CORS error"
**Solution:** Make sure server is running on port 3000

### Issue: PDF not displaying
**Solution:** 
- Check file is valid PDF
- Try smaller file size
- Check browser console for errors

---

## 📊 Expected Results

After extraction, you'll get JSON like:

```json
{
  "ShippingDate": "2024-10-15",
  "InvoiceNumber": "INV-12345",
  "TotalAmount": "$1,234.56"
}
```

The AI understands:
- ✅ Different date formats
- ✅ Currency symbols
- ✅ Various invoice formats
- ✅ Contextual field locations
- ✅ Similar field names (e.g., "Ship Date", "Shipping Date")

---

## 🎨 Customization

### Add Custom Fields

```javascript
dtf.addField({ 
    name: 'CustomerName', 
    description: 'Name of the customer or company' 
});

dtf.addField({ 
    name: 'PaymentTerms', 
    description: 'Payment terms like Net 30, Due on Receipt' 
});

dtf.addField({ 
    name: 'Items', 
    description: 'List of items or products in the order' 
});
```

### Change AI Model

```javascript
// Faster, cheaper
model: 'openai_gpt-3.5-turbo'

// Best accuracy (recommended)
model: 'openai_gpt-4o'

// Balance of speed and accuracy
model: 'openai_gpt-4-turbo'
```

### Custom Prompts

```javascript
const dtf = new DocsToFields({
    authKey: 'your-key',
    url: 'http://localhost:3000',
    systemPrompt: 'You are an expert at reading invoices. Extract data accurately.',
    prompt: 'From this document: {input_documents}\n\nExtract: {fields}\n\nReturn JSON only.'
});
```

---

## 📱 Integration Examples

### Example 1: Auto-populate Form

```javascript
const results = await dtf.getFields();

// Populate form fields
document.getElementById('shipDate').value = results.ShippingDate;
document.getElementById('invoice').value = results.InvoiceNumber;
document.getElementById('amount').value = results.TotalAmount;
```

### Example 2: Save to Database

```javascript
const results = await dtf.getFields();

// Send to backend
fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
});
```

### Example 3: Batch Processing

```javascript
const files = document.getElementById('multiFile').files;

for (const file of files) {
    await dtf.fileExtractText(file);
}

const results = await dtf.getFields();
// Results contain data from all files
```

---

## 🎯 Use Cases

- ✅ Invoice processing automation
- ✅ Contract data extraction
- ✅ Shipping label processing
- ✅ Form digitization
- ✅ Receipt scanning
- ✅ Medical records processing
- ✅ Legal document review
- ✅ Tax document processing

---

## 💡 Pro Tips

1. **Better descriptions = Better results**
   - ❌ Bad: `{ name: 'date', description: 'date' }`
   - ✅ Good: `{ name: 'ShippingDate', description: 'The date when the shipment will be dispatched or sent out' }`

2. **Use GPT-4o for complex documents**
   - GPT-3.5: Simple, structured documents
   - GPT-4: Complex layouts
   - GPT-4o: Best for everything (recommended)

3. **Test with sample PDF first**
   - Start simple
   - Verify extraction accuracy
   - Adjust field descriptions if needed

4. **Use viewer mode for debugging**
   - See exactly what PDF looks like
   - Verify field values visually
   - Adjust before saving

5. **Cache extracted text**
   - `fileExtractText()` once
   - Call `getFields()` multiple times
   - Saves API calls and money

---

## 🚀 Next Steps

1. ✅ Test with demo page
2. ✅ Try your own PDFs
3. ✅ Customize fields for your use case
4. ✅ Integrate into your application
5. ✅ Deploy to production (use HTTPS!)

---

## 📚 More Resources

- **Full Documentation:** See `README.md`
- **Compatibility Info:** See `COMPATIBILITY.md`
- **API Reference:** See comments in `docToFields.js`
- **OpenAI Docs:** https://platform.openai.com/docs

---

## 🤝 Need Help?

Check the troubleshooting section or review:
1. Browser console for errors
2. Server terminal for API logs
3. OpenAI dashboard for API usage

---

**Ready to extract some fields?** 🎉

```bash
npm start
```

Then open: `http://localhost:3000/demo.html`

Happy extracting! 📄✨

