#!/usr/bin/env node

/**
 * Xiaohongshu Login Check Script
 * Checks login status and displays QR code if needed
 */

const MCP_SERVER_URL = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';

async function callMCPMethod(method, params = {}) {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message || 'MCP call failed');
  }
  return result.result;
}

async function checkLoginStatus() {
  try {
    const result = await callMCPMethod('tools/call', {
      name: 'check_login_status',
      arguments: {},
    });
    return JSON.parse(result.content[0].text);
  } catch (error) {
    return null;
  }
}

async function getLoginQRCode() {
  const result = await callMCPMethod('tools/call', {
    name: 'get_login_qrcode',
    arguments: {},
  });
  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    console.log('Checking Xiaohongshu login status...');

    const loginStatus = await checkLoginStatus();

    if (loginStatus && loginStatus.loggedIn) {
      console.log('Already logged in!');
      console.log('User info:', JSON.stringify(loginStatus, null, 2));
      process.exit(0);
    }

    console.log('Not logged in. Getting QR code...');

    const qrData = await getLoginQRCode();

    console.log('\n========================================');
    console.log('Please scan the QR code to login:');
    console.log('========================================\n');

    if (qrData.qrcode) {
      // Save QR code to a temporary file
      const fs = await import('fs');
      const buffer = Buffer.from(qrData.qrcode, 'base64');
      const qrPath = '/tmp/xiaohongshu_qrcode.png';
      fs.writeFileSync(qrPath, buffer);
      console.log(`QR code saved to: ${qrPath}`);
      console.log('You can open this file to scan the QR code.\n');
    }

    if (qrData.expiresIn) {
      console.log(`QR code expires in ${qrData.expiresIn} seconds.`);
    }

    console.log('\nAfter scanning, please wait a moment and run this command again to verify login.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
