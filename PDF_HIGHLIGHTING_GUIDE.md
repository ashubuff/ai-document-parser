# PDF Text Highlighting Feature

## 📋 Overview

Guide for implementing text highlighting in the PDF viewer to show which text was extracted by the AI.

---

## ✅ Current Implementation: Editable Form

### **What's Been Added:**

1. **Editable Input Fields**
   - Results now display as form inputs instead of read-only text
   - Users can edit any extracted value
   - Color-coded by status:
     - 🔵 Blue background: AI-extracted values
     - 🟡 Yellow background: User-edited values
     - ⚪ Gray background: Empty/not found

2. **Export Functionality**
   - 💾 Export button to download data as JSON
   - 📋 View JSON button shows live form data
   - Timestamped filenames

3. **Visual Feedback**
   - Focus states with blue highlight
   - Smooth transitions
   - Clear placeholder text

---

## 🎨 PDF Highlighting - Implementation Options

### **Option 1: PDF.js with Text Layer Highlighting** (Recommended)

#### **How It Works:**
1. Use PDF.js to render PDF pages
2. Extract text layer with coordinates
3. Match AI-extracted text to PDF text positions
4. Overlay colored highlights on matched text

#### **Requirements:**
```html
<!-- Add PDF.js library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```

#### **Implementation Steps:**

```javascript
// 1. Initialize PDF.js
pdfjsLib.getDocument(pdfData).promise.then(pdf => {
    // Render each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(page => {
            // Get text content with positions
            page.getTextContent().then(textContent => {
                // Match extracted values with text items
                highlightMatchedText(textContent, extractedValues);
            });
        });
    }
});

// 2. Match and highlight text
function highlightMatchedText(textContent, extractedValues) {
    extractedValues.forEach(value => {
        textContent.items.forEach(item => {
            if (item.str.includes(value)) {
                // Create highlight overlay at item.transform position
                createHighlight(item.transform, item.width, item.height);
            }
        });
    });
}

// 3. Create highlight overlay
function createHighlight(position, width, height) {
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.left = position[4] + 'px';
    highlight.style.top = position[5] + 'px';
    highlight.style.width = width + 'px';
    highlight.style.height = height + 'px';
    highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
    highlight.style.pointerEvents = 'none';
    document.querySelector('.pdf-page').appendChild(highlight);
}
```

---

### **Option 2: PDF Annotation API** (More Complex)

Use PDF annotation capabilities to add actual highlights to the PDF:

```javascript
// Requires server-side PDF manipulation with libraries like:
// - pdf-lib (JavaScript)
// - PyPDF2 (Python)
// - iText (Java)
```

---

### **Option 3: Simple Overlay Highlighting** (Quick Solution)

Create a transparent overlay with clickable field names:

```javascript
// When user clicks a field name, show which page/area it came from
function showFieldSource(fieldName, pageNumber, coordinates) {
    // Navigate to page
    // Show bounding box around approximate area
}
```

---

## 🚀 Recommended Implementation Plan

### **Phase 1: Enhanced Viewer with PDF.js** ✅ Easiest

Create a new enhanced viewer that:
1. Renders PDF using PDF.js
2. Shows text layer
3. Highlights matched text in yellow
4. Shows field name on hover

**Estimated Time:** 4-6 hours  
**Complexity:** Medium  
**Benefits:** Best user experience

---

### **Phase 2: Interactive Field-to-PDF Linking** 🎯 Recommended

Add interactivity:
1. Click on a field → PDF scrolls to that location and highlights it
2. Hover over highlighted text → shows which field it belongs to
3. Multiple highlights per field (if text appears multiple times)

**Estimated Time:** 2-3 hours (after Phase 1)  
**Complexity:** Low (once Phase 1 is done)  
**Benefits:** Excellent for verification

---

### **Phase 3: Confidence Indicators** 🌟 Advanced

Show AI confidence levels:
1. Green highlight: High confidence match
2. Yellow highlight: Medium confidence
3. Orange highlight: Low confidence
4. Allow user to select alternate matches

**Estimated Time:** 3-4 hours  
**Complexity:** High  
**Benefits:** Professional-grade quality control

---

## 💻 Sample Enhanced Viewer Code

### **viewer_with_highlights.html** (New File)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced PDF Viewer with Highlights</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        .pdf-container {
            position: relative;
            display: flex;
        }
        
        .pdf-canvas {
            border: 1px solid #ccc;
        }
        
        .text-layer {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            opacity: 0.2;
            line-height: 1.0;
        }
        
        .highlight {
            position: absolute;
            background-color: rgba(255, 255, 0, 0.4);
            border: 1px solid rgba(255, 200, 0, 0.8);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .highlight:hover {
            background-color: rgba(255, 255, 0, 0.6);
            z-index: 1000;
        }
        
        .highlight-tooltip {
            position: absolute;
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            display: none;
            z-index: 10001;
        }
    </style>
</head>
<body>
    <div class="pdf-container" id="pdfContainer">
        <canvas class="pdf-canvas" id="pdfCanvas"></canvas>
        <div class="text-layer" id="textLayer"></div>
    </div>
    <div class="highlight-tooltip" id="tooltip"></div>

    <script>
        // Configuration
        const extractedFields = {
            'Load_Number': '714129',
            'Carrier_Name': 'Shaker Transport, Inc.',
            // ... more fields
        };

        // Initialize PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Load and render PDF
        async function renderPDFWithHighlights(pdfData) {
            const loadingTask = pdfjsLib.getDocument(pdfData);
            const pdf = await loadingTask.promise;
            
            // Render first page
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Setup canvas
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render page
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // Get text content
            const textContent = await page.getTextContent();
            
            // Highlight extracted values
            highlightExtractedText(textContent, viewport, extractedFields);
        }

        function highlightExtractedText(textContent, viewport, fields) {
            const textLayer = document.getElementById('textLayer');
            
            Object.entries(fields).forEach(([fieldName, fieldValue]) => {
                if (!fieldValue) return;
                
                // Find matching text items
                textContent.items.forEach(item => {
                    if (item.str.includes(fieldValue)) {
                        // Create highlight
                        const highlight = document.createElement('div');
                        highlight.className = 'highlight';
                        
                        // Calculate position
                        const tx = item.transform;
                        highlight.style.left = tx[4] + 'px';
                        highlight.style.top = (viewport.height - tx[5]) + 'px';
                        highlight.style.width = item.width + 'px';
                        highlight.style.height = item.height + 'px';
                        
                        // Add tooltip
                        highlight.setAttribute('data-field', fieldName);
                        highlight.addEventListener('mouseenter', showTooltip);
                        highlight.addEventListener('mouseleave', hideTooltip);
                        
                        textLayer.appendChild(highlight);
                    }
                });
            });
        }

        function showTooltip(e) {
            const tooltip = document.getElementById('tooltip');
            tooltip.textContent = 'Field: ' + e.target.getAttribute('data-field');
            tooltip.style.display = 'block';
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY + 10 + 'px';
        }

        function hideTooltip() {
            document.getElementById('tooltip').style.display = 'none';
        }
    </script>
</body>
</html>
```

---

## 🎯 Quick Win: Field-to-PDF Navigation

### **Simpler Alternative** (Can implement today!)

Instead of highlighting, add "Show in PDF" buttons:

```javascript
// In the results display
function displayResults(data) {
    FIELDS.forEach(field => {
        const item = document.createElement('div');
        
        // ... create input field ...
        
        // Add "Locate in PDF" button
        const locateBtn = document.createElement('button');
        locateBtn.textContent = '📍 Show in PDF';
        locateBtn.onclick = () => {
            // Send message to viewer to focus this field
            if (viewerWindow) {
                viewerWindow.postMessage({
                    type: 'locateField',
                    fieldName: field.name,
                    fieldValue: input.value
                }, '*');
            }
        };
        
        item.appendChild(input);
        item.appendChild(locateBtn);
    });
}
```

---

## 📊 Feature Comparison

| Feature | Current | With PDF.js | With Annotations |
|---------|---------|-------------|------------------|
| **View PDF** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Edit Fields** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Highlight Text** | ❌ No | ✅ Yes | ✅ Yes |
| **Click to Locate** | ❌ No | ✅ Yes | ✅ Yes |
| **Permanent Highlights** | ❌ No | ❌ No | ✅ Yes |
| **Multi-page Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Mobile Friendly** | ✅ Yes | ⚠️ Medium | ⚠️ Medium |
| **Implementation Time** | - | 4-6 hours | 8-12 hours |

---

## 🎨 Visual Examples

### **Current (After Form Update):**
```
┌─────────────────────────┐
│  Load Number            │
│  ┌──────────────────┐   │
│  │ 714129           │   │ ← Editable input (blue background)
│  └──────────────────┘   │
└─────────────────────────┘
```

### **With PDF Highlighting:**
```
┌──────────────────┬──────────────────┐
│ Load Number      │  [PDF Preview]   │
│ ┌──────────┐     │  ┌──────────┐    │
│ │ 714129   │ ──→ │  │░714129░░░│    │ ← Highlighted in PDF
│ └──────────┘     │  └──────────┘    │
└──────────────────┴──────────────────┘
```

---

## ✅ What's Already Done

1. ✅ **Editable Form Fields** - Complete
2. ✅ **Export Functionality** - Complete
3. ✅ **Color-coded Status** - Complete
4. ✅ **Auto-viewer Integration** - Complete

---

## 🚧 Next Steps for PDF Highlighting

### **Option A: Implement Full PDF.js Highlighting** 
**Time:** ~6 hours  
**Best For:** Production use, professional quality

### **Option B: Add "Locate in PDF" Buttons**
**Time:** ~1 hour  
**Best For:** Quick win, immediate value

### **Option C: Create Side-by-side View with Sync**
**Time:** ~2 hours  
**Best For:** Good balance of effort and value

---

## 🎯 Recommendation

**Start with Option B** (Locate buttons), then upgrade to Option A later:

1. ✅ Add "📍 Show in PDF" buttons next to each field
2. ✅ Clicking button sends message to viewer
3. ✅ Viewer searches for text and scrolls to it
4. ✅ Simple visual indicator (border flash)

**Then Later:**
- Upgrade to PDF.js for permanent highlights
- Add confidence indicators
- Implement click-to-navigate

---

**Would you like me to implement any of these options?** 🚀

