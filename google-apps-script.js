/**
 * Google Apps Script for Sahasra Home-Foods Multi-Item Cart Order Management
 * Updated for Enhanced Cart System Support
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update the email address on line 87
 * 5. Deploy as Web App with execute permissions for "Anyone"
 * 6. Copy the Web App URL and replace GOOGLE_SCRIPT_URL in script.js
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
    
    // Send email notification (optional)
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
    // spreadsheet.addEditor('saratsony@gmail.com');
    
    return spreadsheet;
  }
}

function sendEmailNotification(orderData) {
  // IMPORTANT: Replace with your actual email address
  const businessEmail = 'saratsony@gmail.com';
  
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

// Test function to verify cart setup
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