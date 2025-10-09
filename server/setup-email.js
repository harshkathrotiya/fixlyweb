/**
 * Email setup helper script
 * Helps configure and test different email providers
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load existing .env file
const envPath = path.resolve(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.log('No existing .env file found or unable to read it.');
}

console.log('=== Nodemailer Email Setup Helper ===\n');

console.log('Common Email Provider Configurations:');
console.log('1. Gmail - Requires App Password');
console.log('2. Outlook/Hotmail');
console.log('3. Yahoo - Requires App Password');
console.log('4. Zoho');
console.log('5. Other (custom SMTP)\n');

rl.question('Select your email provider (1-5): ', (provider) => {
  const providers = {
    '1': { name: 'Gmail', host: 'smtp.gmail.com', port: '587' },
    '2': { name: 'Outlook/Hotmail', host: 'smtp-mail.outlook.com', port: '587' },
    '3': { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '587' },
    '4': { name: 'Zoho', host: 'smtp.zoho.com', port: '587' },
    '5': { name: 'Custom', host: '', port: '' }
  };

  const selectedProvider = providers[provider];
  if (!selectedProvider) {
    console.log('Invalid selection. Exiting.');
    rl.close();
    return;
  }

  console.log(`\nSetting up ${selectedProvider.name} configuration...\n`);

  // Ask for configuration details
  rl.question('SMTP Host (e.g., smtp.gmail.com): ', (host) => {
    const smtpHost = provider === '5' ? host : selectedProvider.host;
    
    rl.question(`SMTP Port (usually ${selectedProvider.port}): `, (port) => {
      const smtpPort = port || selectedProvider.port;
      
      rl.question('SMTP Email (your email address): ', (email) => {
        rl.question('SMTP Password (use App Password for Gmail/Yahoo): ', (password) => {
          rl.question('From Email (usually same as SMTP Email): ', (fromEmail) => {
            const fromEmailValue = fromEmail || email;
            
            rl.question('From Name (e.g., YourAppName): ', (fromName) => {
              // Generate new email configuration
              const newEmailConfig = `
# SMTP Configuration for Nodemailer
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_EMAIL=${email}
SMTP_PASSWORD=${password}
FROM_EMAIL=${fromEmailValue}
FROM_NAME=${fromName}
`;

              console.log('\n=== Generated Configuration ===');
              console.log(newEmailConfig);

              rl.question('\nDo you want to update your .env file with this configuration? (y/n): ', (confirm) => {
                if (confirm.toLowerCase() === 'y') {
                  // Remove old email configuration if it exists
                  let updatedEnvContent = envContent.replace(
                    /# SMTP Configuration.*?(\n\n|$)/s,
                    ''
                  );

                  // Add new configuration
                  updatedEnvContent = updatedEnvContent.trim() + '\n' + newEmailConfig.trim() + '\n';

                  try {
                    fs.writeFileSync(envPath, updatedEnvContent);
                    console.log('\n✅ .env file updated successfully!');
                    console.log('\nNext steps:');
                    console.log('1. Restart your server');
                    console.log('2. Test the forgot password functionality');
                  } catch (err) {
                    console.log('\n❌ Error updating .env file:', err.message);
                  }
                } else {
                  console.log('\nConfiguration not saved. You can manually add the configuration to your .env file.');
                }

                console.log('\n=== Testing Instructions ===');
                console.log('1. After updating your .env file, restart your server');
                console.log('2. Run the test script to verify: node test-email.js');
                console.log('3. Test the forgot password functionality on the frontend');

                rl.close();
              });
            });
          });
        });
      });
    });
  });
});