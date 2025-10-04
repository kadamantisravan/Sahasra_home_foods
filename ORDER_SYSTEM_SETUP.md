# Sahasra Home-Foods Order System Setup Guide

## 🚀 Complete Multi-Item Cart & Order Management System

Your website now has a comprehensive order management system that includes:
- **Multi-item shopping cart** functionality
- **Real-time price calculation** with quantity adjustments
- **Customer information collection** with validation
- **Google Sheets integration** for automated order tracking
- **Email notifications** for new orders
- **Success confirmations** with order references

## 📋 Google Sheets Setup Instructions

### Step 1: Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the **updated code below**
4. Save the project with name "Sahasra Cart Order System"

### Step 2: Updated Google Apps Script Code

```javascript
/**
 * Google Apps Script for Sahasra Home-Foods Multi-Item Order Management
 * Updated for Cart System Support
 */

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Order Date',
        'Order Reference',
        'Customer Name',
        'Phone Number',
        'Email',
        'Address',
        'Items Ordered',
        'Item Count',
        'Cart Total',
        'Delivery Charges',
        'Grand Total',
        'Special Instructions',
        'Status',
        'Order Time'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
    }
    
    // Prepare the row data
    const timestamp = new Date(data.timestamp);
    const orderDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const orderTime = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'HH:mm:ss');
    
    // Format items list for Google Sheets
    let itemsList = '';
    let itemCount = 0;
    
    if (data.items && Array.isArray(data.items)) {
      itemsList = data.items.map(item => {
        itemCount += item.quantity;
        return `${item.name} (Qty: ${item.quantity}, ₹${item.price} each, Total: ₹${item.price * item.quantity})`;
      }).join(' | ');
    } else {
      // Fallback for single item orders (backward compatibility)
      itemsList = `${data.itemName || 'N/A'} (Qty: ${data.quantity || 1}, ₹${data.itemPrice || 0})`;
      itemCount = data.quantity || 1;
    }
    
    const rowData = [
      orderDate,
      data.orderRef,
      data.customerName,
      data.customerPhone,
      data.customerEmail || '',
      data.customerAddress,
      itemsList,
      itemCount,
      data.cartTotal || data.itemTotal || 0,
      data.deliveryCharges || 50,
      data.grandTotal,
      data.specialInstructions || '',
      data.status || 'Pending',
      orderTime
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, rowData.length);
    
    // Apply formatting to the new row
    const lastRow = sheet.getLastRow();
    const dataRange = sheet.getRange(lastRow, 1, 1, rowData.length);
    
    // Alternate row colors
    if (lastRow % 2 === 0) {
      dataRange.setBackground('#f8f9fa');
    }
    
    // Format currency columns
    sheet.getRange(lastRow, 9, 1, 3).setNumberFormat('₹#,##0'); // Cart Total, Delivery, Grand Total
    
    // Send email notification
    sendEmailNotification(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, orderRef: data.orderRef}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error processing order:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSpreadsheet() {
  const spreadsheetName = 'Sahasra Cart Orders';
  
  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  } else {
    // Create new spreadsheet
    const spreadsheet = SpreadsheetApp.create(spreadsheetName);
    
    // Share with the business owner (replace with actual email)
    // spreadsheet.addEditor('your-email@gmail.com');
    
    return spreadsheet;
  }
}

function sendEmailNotification(orderData) {
  // IMPORTANT: Replace with your actual email address
  const businessEmail = 'your-email@gmail.com';
  
  const subject = `🛒 New Cart Order: ${orderData.orderRef} - Sahasra Home-Foods`;
  
  // Format items list for email
  let itemsDetails = '';
  let itemCount = 0;
  
  if (orderData.items && Array.isArray(orderData.items)) {
    itemsDetails = orderData.items.map(item => {
      itemCount += item.quantity;
      return `• ${item.name}\n  Quantity: ${item.quantity}\n  Price: ₹${item.price} each\n  Subtotal: ₹${item.price * item.quantity}`;
    }).join('\n\n');
  } else {
    // Fallback for single item orders
    itemsDetails = `• ${orderData.itemName || 'N/A'}\n  Quantity: ${orderData.quantity || 1}\n  Price: ₹${orderData.itemPrice || 0}`;
    itemCount = orderData.quantity || 1;
  }
  
  const body = `
🍰 NEW ORDER RECEIVED - Sahasra Home-Foods

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Reference: ${orderData.orderRef}
Date & Time: ${new Date(orderData.timestamp).toLocaleString()}
Total Items: ${itemCount}

CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}
Email: ${orderData.customerEmail || 'Not provided'}
Address: ${orderData.customerAddress}

ITEMS ORDERED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsDetails}

PRICING BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cart Total: ₹${orderData.cartTotal || orderData.itemTotal || 0}
Delivery Charges: ₹${orderData.deliveryCharges || 50}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRAND TOTAL: ₹${orderData.grandTotal}

SPECIAL INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${orderData.specialInstructions || 'None'}

ACTION REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Contact customer to confirm order
✅ Prepare items for delivery
✅ Arrange delivery/pickup
✅ Update order status in Google Sheets

Best regards,
Sahasra Home-Foods Automated Order System
  `;
  
  try {
    MailApp.sendEmail(businessEmail, subject, body);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Test function to verify setup
function testCartSetup() {
  const testData = {
    orderRef: 'TEST-CART-001',
    timestamp: new Date().toISOString(),
    items: [
      { name: 'Test Sweet 1', price: 200, quantity: 2 },
      { name: 'Test Sweet 2', price: 150, quantity: 1 }
    ],
    cartTotal: 550,
    deliveryCharges: 50,
    grandTotal: 600,
    customerName: 'Test Customer',
    customerPhone: '9876543210',
    customerEmail: 'test@example.com',
    customerAddress: 'Test Address, Test City',
    specialInstructions: 'Test order for cart system',
    status: 'Test'
  };
  
  const spreadsheet = getOrCreateSpreadsheet();
  console.log('Test spreadsheet created/found:', spreadsheet.getName());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
  
  // Test the doPost function
  const testEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(testEvent);
  console.log('Test result:', result.getContent());
}
```

### Step 3: Configure Email Settings
1. **Find line 87**: `const businessEmail = 'your-email@gmail.com';`
2. **Replace with your actual email** where you want to receive order notifications
3. **Uncomment line 133** if you want to share the spreadsheet: `// spreadsheet.addEditor('your-email@gmail.com');`

### Step 4: Deploy as Web App
1. **Click "Deploy"** → "New Deployment"
2. **Choose "Web app"** as type
3. **Set "Execute as"** to "Me"
4. **Set "Who has access"** to "Anyone"
5. **Click "Deploy"**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123DEF456.../exec`)

### Step 5: Update Website Code
1. **Open** `js/script.js`
2. **Find line around 570**: `const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';`
3. **Replace** `PASTE_YOUR_WEB_APP_URL_HERE` with your actual Web App URL from Step 4
4. **Save** the file

### Step 5: Test the System
1. Run the `testSetup()` function in Google Apps Script
2. Check if the spreadsheet is created
3. Test an order from your website

## 📊 Google Sheets Features

Your order spreadsheet will automatically include:
- **Order Date & Time**
- **Customer Information** (Name, Phone, Email, Address)
- **Item Details** (Name, Price, Quantity)
- **Pricing** (Item Total, Delivery Charges, Grand Total)
- **Special Instructions**
- **Order Status**
- **Auto-formatted Headers**

## 🎯 Order System Features

### For Customers:
- ✅ Easy order placement with item selection
- ✅ Quantity adjustment with live price calculation
- ✅ Customer information form
- ✅ Order confirmation with reference number
- ✅ Professional success message

### For Business:
- ✅ All orders automatically saved to Google Sheets
- ✅ Email notifications for new orders
- ✅ Complete customer and order information
- ✅ Order reference numbers for tracking
- ✅ Delivery charges calculation

## 🛠️ How It Works

1. **Customer clicks "Order Now"** on any product
2. **Order modal opens** with item details and price
3. **Customer adjusts quantity** - total updates automatically
4. **Customer fills information** (name, phone, address, etc.)
5. **Order submits** to Google Sheets automatically
6. **Success message displays** with order reference
7. **Email notification sent** to business owner
8. **Order appears** in Google Sheets for processing

## 📱 Order Process Flow

```
Product Page → Order Now Button → Order Modal → Customer Form → 
Google Sheets → Email Notification → Success Message
```

## 🔧 Customization Options

### Delivery Charges
- Current: ₹50 fixed
- To change: Update `deliveryCharges` in JavaScript (line 268)

### Maximum Quantity
- Current: 50 items max
- To change: Update line 238 in `script.js`

### Order Reference Format
- Current: SAH-YYMMDD-001
- To change: Update `generateOrderRef()` function

## 📧 Email Notification Content

Automatic emails include:
- Order reference number
- Customer contact information
- Item details and pricing
- Delivery address
- Special instructions
- Timestamp

## 🎨 Visual Features

- **Professional Order Forms** with responsive design
- **Real-time Price Calculation**
- **Success Animations** with order confirmation
- **Mobile-Optimized** modals and forms
- **Loading States** during order submission

## 🔒 Security & Privacy

- Customer data handled securely
- HTTPS required for Google Sheets integration
- No sensitive payment information stored
- Privacy-focused data collection

## 📞 Next Steps After Setup

1. **Test the complete flow** with a sample order
2. **Verify Google Sheets** receives data correctly
3. **Check email notifications** are working
4. **Train staff** on using the Google Sheets order management
5. **Monitor orders** and respond promptly to customers

## 🎯 Business Benefits

- **Automated Order Collection** - No manual data entry
- **Professional Customer Experience** - Branded order forms
- **Real-time Order Tracking** - Instant Google Sheets updates
- **Email Notifications** - Never miss an order
- **Mobile-Friendly** - Customers can order from any device
- **Scalable System** - Handle growing order volume easily

Your Sahasra Home-Foods website now has a complete e-commerce-style order management system that will help streamline your business operations and provide excellent customer experience!