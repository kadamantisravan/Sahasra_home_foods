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
    // Check if this is a valid POST request with data
    if (!e || !e.postData || !e.postData.contents) {
      console.error('Invalid request: No postData found');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Invalid request format. This function should be called via HTTP POST with JSON data.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the incoming data
    console.log('Received POST data:', e.postData.contents);
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

// Handle GET requests (for testing and verification)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Sahasra Home-Foods Order System is running!',
      timestamp: new Date().toISOString(),
      status: 'active',
      instructions: 'This endpoint accepts POST requests with order data.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
  try {
    // IMPORTANT: Replace with your actual email address
    const businessEmail = 'saratsony@gmail.com';
    
    // Log email attempt
    console.log('Attempting to send email to:', businessEmail);
    console.log('Order data received:', JSON.stringify(orderData, null, 2));
    
    // Validate email address format
    if (!businessEmail || !businessEmail.includes('@') || !businessEmail.includes('.')) {
      throw new Error('Invalid business email address format');
    }
    
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
    
    // Check Gmail quota and send email
    const quota = MailApp.getRemainingDailyQuota();
    console.log('Remaining email quota:', quota);
    
    if (quota <= 0) {
      throw new Error('Daily email quota exceeded');
    }
    
    // Send the email
    MailApp.sendEmail({
      to: businessEmail,
      subject: subject,
      body: body,
      name: 'Sahasra Home-Foods Order System'
    });
    
    console.log('✅ Email notification sent successfully to:', businessEmail);
    console.log('Subject:', subject);
    
    return { success: true, message: 'Email sent successfully' };
    
  } catch (error) {
    console.error('❌ Error sending email:', error.toString());
    console.error('Error details:', error);
    
    // Try to log the error to the spreadsheet for debugging
    try {
      const spreadsheet = getOrCreateSpreadsheet();
      const errorSheet = getOrCreateErrorLog(spreadsheet);
      errorSheet.appendRow([
        new Date(),
        'Email Error',
        error.toString(),
        JSON.stringify(orderData),
        'saratsony@gmail.com'
      ]);
    } catch (logError) {
      console.error('Failed to log error to spreadsheet:', logError);
    }
    
    return { success: false, error: error.toString() };
  }
}

// Test function to verify cart setup
function testCartSetup() {
  console.log('🧪 Testing cart setup and order processing...');
  
  const testData = {
    orderRef: 'TEST-CART-' + Date.now(),
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
  
  console.log('Test order data:', JSON.stringify(testData, null, 2));
  
  const spreadsheet = getOrCreateSpreadsheet();
  console.log('Test spreadsheet created/found:', spreadsheet.getName());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
  
  // Test the doPost function with proper event simulation
  const testEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  console.log('Calling doPost with test event...');
  const result = doPost(testEvent);
  const resultContent = result.getContent();
  
  console.log('Test result:', resultContent);
  
  try {
    const parsedResult = JSON.parse(resultContent);
    if (parsedResult.success) {
      console.log('✅ Cart setup test PASSED');
      console.log('Order reference:', parsedResult.orderRef);
      console.log('Check your spreadsheet and email for the test order');
    } else {
      console.log('❌ Cart setup test FAILED:', parsedResult.error);
    }
  } catch (e) {
    console.log('❌ Error parsing test result:', e);
  }
  
  return resultContent;
}

// Helper function to create or get error log sheet
function getOrCreateErrorLog(spreadsheet) {
  let errorSheet;
  try {
    errorSheet = spreadsheet.getSheetByName('Error Log');
  } catch (e) {
    errorSheet = null;
  }
  
  if (!errorSheet) {
    errorSheet = spreadsheet.insertSheet('Error Log');
    const headers = ['Timestamp', 'Error Type', 'Error Message', 'Order Data', 'Email Address'];
    errorSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = errorSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#ff4444');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  }
  
  return errorSheet;
}

// Simple email test function
function testEmailSending() {
  console.log('🧪 Testing email functionality...');
  
  const testOrderData = {
    orderRef: 'TEST-EMAIL-' + Date.now(),
    timestamp: new Date().toISOString(),
    items: [
      { name: 'Test Sweet', price: 100, quantity: 1 }
    ],
    cartTotal: 100,
    deliveryCharges: 50,
    grandTotal: 150,
    customerName: 'Test Customer',
    customerPhone: '9876543210',
    customerEmail: 'test@example.com',
    customerAddress: 'Test Address',
    specialInstructions: 'This is a test order for email verification'
  };
  
  const result = sendEmailNotification(testOrderData);
  
  if (result.success) {
    console.log('✅ Email test PASSED - Check saratsony@gmail.com for test email');
  } else {
    console.log('❌ Email test FAILED:', result.error);
  }
  
  return result;
}