# Viewer Integration Guide

## 🎯 Overview

The viewer now automatically opens after AI extraction, allowing users to:
- **View the PDF** on the right side
- **Review extracted field values** on the left side
- **Edit any field** if needed
- **Click Apply** to confirm and return to the main application

---

## 🚀 How It Works

### **1. New Feature in `docToFields.js`**

Added `autoOpenViewer` setting that automatically opens the viewer after `getFields()` completes.

```javascript
const docsToFields = new DocsToFields({
    authKey: 'your-api-key',
    url: 'http://localhost:3000',
    viewerUrl: 'http://localhost:3000/viewer',
    autoOpenViewer: true,  // ← Enable auto-open
    viewerCallback: (result) => {
        // Called when user clicks Apply in viewer
        console.log('User reviewed fields:', result.fields);
    }
});
```

### **2. Extraction Flow**

```
1. User uploads PDF
        ↓
2. Click "Extract Information"
        ↓
3. PDF text extracted
        ↓
4. AI analyzes and extracts fields
        ↓
5. ✨ Viewer window opens automatically
        ↓
6. User sees:
   - PDF on right
   - Extracted fields on left
        ↓
7. User reviews/edits fields
        ↓
8. User clicks "Apply & Close"
        ↓
9. Viewer closes
        ↓
10. Results display in main page
```

---

## 💻 Code Example

### Complete Implementation:

```javascript
// Initialize with auto-viewer
const docsToFields = new DocsToFields({
    authKey: CONFIG.apiKey,
    url: CONFIG.serverUrl,
    viewerUrl: CONFIG.serverUrl + '/viewer',
    model: 'openai_gpt-4o',
    autoOpenViewer: true,  // Enable automatic viewer
    viewerCallback: (result) => {
        // Handle user-approved values
        if (result.fields) {
            console.log('Extracted and reviewed:', result.fields);
            displayResults(result.fields);
        }
    },
    aiConfig: {
        provider: 'azure',
        azureEndpoint: 'https://...',
        azureDeployment: 'gpt-4o',
        azureApiVersion: '2024-02-15-preview'
    }
});

// Add fields
docsToFields.addField({ 
    name: 'ShippingDate', 
    description: 'Date of shipment' 
});

// Extract text and get fields
await docsToFields.fileExtractText(pdfFile);
const results = await docsToFields.getFields();

// Viewer opens automatically at this point! ✨
```

---

## 🎨 Viewer Features

### **Left Panel: Fields**
- ✅ Shows all configured fields
- ✅ Displays AI-extracted values
- ✅ Editable inputs for corrections
- ✅ Field descriptions as hints
- ✅ Green highlight for populated fields

### **Right Panel: PDF Viewer**
- ✅ Shows the original PDF
- ✅ Scrollable for multi-page documents
- ✅ Visual reference while reviewing

### **Apply Button**
- ✅ Sends reviewed values back to callback
- ✅ Automatically closes viewer
- ✅ Updates main application

---

## 🔧 Configuration Options

### **autoOpenViewer** (boolean)
- `true`: Viewer opens automatically after extraction
- `false`: Manual control (call `viewFile()` yourself)

### **viewerCallback** (function)
- Called when user clicks "Apply & Close"
- Receives object: `{ fields: {...} }`
- Use to update your UI with reviewed values

### **viewerUrl** (string)
- URL of the viewer page
- Default: `{serverUrl}/viewer`

---

## 📝 Usage Patterns

### Pattern 1: Auto-Viewer (Recommended)
```javascript
const dtf = new DocsToFields({
    autoOpenViewer: true,
    viewerCallback: (result) => {
        // User has reviewed the values
        updateForm(result.fields);
    }
});

await dtf.fileExtractText(file);
await dtf.getFields();
// Viewer opens automatically!
```

### Pattern 2: Manual Control
```javascript
const dtf = new DocsToFields({
    autoOpenViewer: false  // Manual control
});

await dtf.fileExtractText(file);
const results = await dtf.getFields();

// Manually open viewer when you want
dtf.viewFile({
    showFields: true,
    sendFile: true,
    callback: (result) => {
        console.log(result.fields);
    }
});
```

### Pattern 3: Direct Extraction (No Viewer)
```javascript
const dtf = new DocsToFields({
    autoOpenViewer: false
    // No viewerUrl needed
});

await dtf.fileExtractText(file);
const results = await dtf.getFields();
// Just use results directly, no viewer
```

---

## 🔄 Complete Workflow Example

```javascript
// 1. Configure
const docsToFields = new DocsToFields({
    authKey: 'api-key',
    url: 'http://localhost:3000',
    viewerUrl: 'http://localhost:3000/viewer',
    model: 'openai_gpt-4o',
    autoOpenViewer: true,
    viewerCallback: handleReviewedFields
});

// 2. Define fields
docsToFields.addField({ 
    name: 'InvoiceNumber', 
    description: 'Invoice number' 
});
docsToFields.addField({ 
    name: 'TotalAmount', 
    description: 'Total amount' 
});

// 3. Process PDF
await docsToFields.fileExtractText(pdfFile);

// 4. Extract with AI
const results = await docsToFields.getFields();
// ✨ Viewer window opens here!

// 5. User reviews in viewer
// User edits fields if needed
// User clicks "Apply & Close"

// 6. Callback receives reviewed values
function handleReviewedFields(result) {
    console.log('User-approved values:', result.fields);
    // Update your app with these values
    document.getElementById('invoice').value = result.fields.InvoiceNumber;
    document.getElementById('amount').value = result.fields.TotalAmount;
}
```

---

## 🎯 Benefits

### **For Users:**
- ✅ Visual confirmation of extracted values
- ✅ See PDF and fields side-by-side
- ✅ Easy correction of any mistakes
- ✅ Confidence in final values

### **For Developers:**
- ✅ Reusable across all applications
- ✅ Built into the library
- ✅ Minimal code changes needed
- ✅ Handles all window management

---

## 🐛 Troubleshooting

### Issue: Viewer doesn't open
**Check:**
- `autoOpenViewer` is set to `true`
- `viewerUrl` is correct
- Popup blocker is disabled
- Server is running

### Issue: Fields don't show in viewer
**Check:**
- Fields were added before calling `getFields()`
- AI extraction completed successfully
- Check browser console for errors

### Issue: Apply button doesn't work
**Check:**
- `viewerCallback` function is defined
- Function is properly bound
- Check browser console for errors

---

## 📚 Related Files

- **`docToFields.js`** - Core library with auto-viewer logic
- **`viewer.html`** - Viewer page UI
- **`demo.html`** - Example implementation
- **`server.js`** - Backend server

---

## ✨ Key Takeaways

1. **Auto-viewer is now built into the library** ✅
2. **Just set `autoOpenViewer: true`** ✅
3. **Provide a `viewerCallback` to handle results** ✅
4. **Users can review before accepting** ✅
5. **Reusable across all projects** ✅

---

**The viewer integration is complete and ready to use!** 🎉

Simply enable `autoOpenViewer` and the library handles everything automatically!

