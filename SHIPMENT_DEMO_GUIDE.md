# Shaker Logistics - Shipment Confirmation Extractor

## 📦 Overview

New demo page specifically designed for **Shaker Logistics** shipment confirmation documents. Extracts all 43 shipment-related fields from load confirmation PDFs.

---

## 🚀 Quick Start

### 1. **Start the Server**
```bash
npm start
```

### 2. **Open Shipment Demo**
```
http://localhost:3000/shipment_demo.html
```

### 3. **Upload & Extract**
- Upload a shipment confirmation PDF
- Click "Extract Shipment Information"
- Review in viewer
- Get all extracted data!

---

## 📋 Extracted Fields (43 Total)

### **Carrier Information**
- Load Number
- Carrier Name
- Carrier Contact
- Carrier Address
- Contact Person
- Contact Email
- Date

### **Equipment & Handling**
- Equipment Type
- Other Instructions
- Tanker Endorsement Required
- HazMat
- Temperature Controlled
- Temperature Range
- Carrier Notes

### **Pickup (Shipper) Information**
- Shipper Name
- Shipper Address
- Shipper Expected Date
- Shipper Hours
- Appointment Required (Pickup)
- Appointment Time (Pickup)
- Shipper Contact
- Pickup Instructions
- Shipper References
- Pickup/Delivery Number

### **Delivery (Consignee) Information**
- Consignee Name
- Consignee Address
- Consignee Expected Date
- Consignee Hours
- Appointment Required (Delivery)
- Appointment Time (Delivery)
- Consignee Contact
- Delivery Instructions
- Consignee References

### **Cargo Information**
- Commodity Description
- Handling Unit Quantity
- Package Quantity
- Weight
- Cargo Summary

### **Financial Information**
- Net Freight Charges
- Fuel Surcharge
- Total Cost
- Payment Instructions
- Penalty Clauses

---

## 🎯 Key Features

### **Tailored for Logistics**
- ✅ 43 shipment-specific fields
- ✅ Prompts optimized for load confirmations
- ✅ Handles pickup and delivery details
- ✅ Extracts financial information
- ✅ Captures special instructions

### **Auto-Viewer Integration**
- ✅ Viewer opens automatically after extraction
- ✅ PDF displayed on right side
- ✅ All 43 fields on left side
- ✅ Edit any field if needed
- ✅ Click Apply to confirm

### **Smart AI Prompts**
Each field has a custom prompt from `Shipment_Confirmation_Prompts.csv`:

Example:
```javascript
{
    name: 'Load_Number',
    description: 'Identify the unique shipment or load identifier mentioned in the document. It usually appears near the title or header, e.g., "Load Number: 714129."'
}
```

---

## 📂 Files Structure

```
AIPdfExtrator/
├── shipment_demo.html              # ← New shipment demo
├── Shipment_Confirmation_Prompts.csv  # ← Field definitions
├── demo.html                       # Original deposition demo
├── fieldAndPrompts.csv            # Deposition field definitions
├── docToFields.js                 # Core library
├── server.js                      # Backend server
└── viewer.html                    # Viewer page
```

---

## 🔄 How It Works

```
1. User uploads shipment confirmation PDF
        ↓
2. Clicks "Extract Shipment Information"
        ↓
3. PDF text extracted
        ↓
4. AI analyzes with shipment-specific prompts
        ↓
5. Extracts all 43 fields
        ↓
6. Viewer opens automatically
        ↓
7. User reviews:
   - PDF on right
   - All 43 fields on left
        ↓
8. User clicks "Apply & Close"
        ↓
9. Results display in main page
```

---

## 💻 Example Usage

```javascript
// The shipment demo uses the same docToFields library
// with shipment-specific fields and prompts

const docsToFields = new DocsToFields({
    authKey: 'api-key',
    url: 'http://localhost:3000',
    viewerUrl: 'http://localhost:3000/viewer',
    model: 'gpt-4o',
    systemPrompt: 'You are an expert logistics assistant...',
    autoOpenViewer: true
});

// Add all 43 shipment fields
FIELDS.forEach(field => {
    docsToFields.addField(field);
});

// Extract
await docsToFields.fileExtractText(pdfFile);
const results = await docsToFields.getFields();
```

---

## 🎨 UI Customization

The shipment demo has a **blue theme** to differentiate it from the deposition demo:

### **Color Scheme:**
- Primary: `#1e3c72` (Dark Blue)
- Secondary: `#2a5298` (Medium Blue)
- Background: Blue gradient

### **Branding:**
- Title: "Shaker Logistics - Shipment Extractor"
- Icon: 🚛 (Truck)
- Description: Shipment confirmation details

---

## 📊 Sample Output

```json
{
  "Load_Number": "714129",
  "Carrier_Name": "Shaker Transport, Inc.",
  "Carrier_Contact": "(p) 518-879-2827",
  "Carrier_Address": "154 Hudson River Road, Waterford, NY 12188",
  "Contact_Person": "Madison Beddows",
  "Contact_Email": "madisonb@shipwithshaker.com",
  "Date": "09/26/2025",
  "Equipment_Type": "Dry Van 53'",
  "Shipper_Name": "WESTLAKE LAKELAND DISTRIBUTION",
  "Shipper_Address": "2525 S COMBEE RD, LAKELAND, FL 33801",
  "Shipper_Expected_Date": "09/30/2025",
  "Consignee_Name": "WESTLAKE DELTA WAREHOUSE",
  "Consignee_Address": "5515 Ameriport Parkway, Baytown, TX 77523",
  "Weight": "39726 lbs",
  "Total_Cost": "USD 1,863.14",
  ...
}
```

---

## 🔧 Differences from Deposition Demo

| Aspect | Deposition Demo | Shipment Demo |
|--------|----------------|---------------|
| **Purpose** | Legal depositions | Logistics shipments |
| **Fields** | 21 legal fields | 43 shipment fields |
| **CSV** | `fieldAndPrompts.csv` | `Shipment_Confirmation_Prompts.csv` |
| **Color** | Purple gradient | Blue gradient |
| **Icon** | ⚖️ (Scales) | 🚛 (Truck) |
| **AI Prompt** | Legal assistant | Logistics assistant |

---

## ✅ Both Demos Available

You now have **two specialized demos**:

### **1. Deposition Demo** (`demo.html`)
- For legal deposition notices
- 21 legal-specific fields
- Purple theme
- URL: `http://localhost:3000/demo.html`

### **2. Shipment Demo** (`shipment_demo.html`)
- For logistics load confirmations
- 43 shipment-specific fields
- Blue theme
- URL: `http://localhost:3000/shipment_demo.html`

---

## 🎯 Use Cases

### **Shaker Logistics Team:**
- Process load confirmations
- Extract carrier details
- Get pickup/delivery information
- Calculate costs automatically
- Track special instructions

### **Dispatch Coordinators:**
- Quick data entry
- Verify shipment details
- Check appointments
- Review instructions

### **Billing Department:**
- Extract cost information
- Get payment terms
- Track fuel surcharges
- Verify totals

---

## 🚨 Configuration

Both demos use the **same configuration** from `.env`:

```env
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

No separate configuration needed! Just use the appropriate demo URL.

---

## 📚 Related Documentation

- **[README.md](README.md)** - Main project documentation
- **[AZURE_SETUP.md](AZURE_SETUP.md)** - Azure OpenAI setup
- **[VIEWER_INTEGRATION.md](VIEWER_INTEGRATION.md)** - Viewer features
- **[ENV_CONFIG.md](ENV_CONFIG.md)** - Configuration guide

---

## ✨ Summary

✅ **New shipment demo created** - `shipment_demo.html`  
✅ **43 fields from CSV** - All prompts included  
✅ **Same auto-viewer** - Integrated seamlessly  
✅ **Blue theme** - Differentiated from deposition  
✅ **Ready to use** - Just upload and extract!  

**Open `http://localhost:3000/shipment_demo.html` and start extracting!** 🚀📦

