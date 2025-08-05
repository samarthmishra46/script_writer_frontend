#!/usr/bin/env node

/**
 * Script to check environment variables before starting the frontend
 * Helps identify missing critical configuration
 * 
 * Usage: node check-env.js
 */

// Import required packages
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env files
const loadEnv = (filename) => {
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) {
    return dotenv.parse(fs.readFileSync(filepath));
  }
  return {};
};

const envLocal = loadEnv('.env.local');
const envDev = loadEnv('.env.development');
const env = loadEnv('.env');

// Combined environment with priority: .env.local > .env.development > .env
const combinedEnv = { ...env, ...envDev, ...envLocal };

console.log(chalk.blue('🔍 Checking frontend environment variables...'));
console.log('');

// Critical variables that must be set
const criticalVars = [
  { 
    name: 'VITE_GOOGLE_CLIENT_ID',
    description: 'Google OAuth Client ID',
    example: '1234567890-abcdefg.apps.googleusercontent.com'
  },
  { 
    name: 'VITE_API_URL', 
    description: 'Backend API URL',
    example: 'http://localhost:5000'
  }
];

// Optional variables
const optionalVars = [
  { 
    name: 'VITE_RAZORPAY_KEY_ID', 
    description: 'Razorpay Key ID',
    example: 'rzp_test_your_key_here'
  }
];

// Check critical variables
let criticalMissing = false;

console.log(chalk.blue('Required Variables:'));
criticalVars.forEach(variable => {
  const value = combinedEnv[variable.name];
  
  if (!value) {
    console.log(`  ${chalk.red('✗')} ${variable.name}: Missing`);
    console.log(`    Description: ${variable.description}`);
    console.log(`    Example: ${variable.example}`);
    criticalMissing = true;
  } else {
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` 
      : value;
    console.log(`  ${chalk.green('✓')} ${variable.name}: ${maskedValue}`);
  }
});

console.log('');
console.log(chalk.blue('Optional Variables:'));
optionalVars.forEach(variable => {
  const value = combinedEnv[variable.name];
  
  if (!value) {
    console.log(`  ${chalk.yellow('!')} ${variable.name}: Not set (optional)`);
    console.log(`    Description: ${variable.description}`);
  } else {
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` 
      : value;
    console.log(`  ${chalk.green('✓')} ${variable.name}: ${maskedValue}`);
  }
});

console.log('');

// Print summary
if (criticalMissing) {
  console.log(chalk.red('❌ Missing critical environment variables!'));
  console.log(chalk.yellow('Please fix the issues above before starting the application.'));
  console.log(`Create or update the ${chalk.blue('.env.local')} file with the missing variables.`);
  process.exit(1);
} else {
  console.log(chalk.green('✅ All critical environment variables are set!'));
}

console.log('');
