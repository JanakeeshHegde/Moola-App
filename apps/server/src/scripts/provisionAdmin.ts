/**
 * MOOLA Secure Server-Side Admin Provisioning Utility
 *
 * Exclusively for authorized administrators to provision or update admin accounts.
 * This runs solely in server-side CLI environment and is NOT accessible via web/public APIs.
 *
 * Usage:
 *   npx ts-node src/scripts/provisionAdmin.ts --phone 9845012345 --password <secure-password> --name "Admin Name"
 *   OR via package script:
 *   npm run admin:provision -- --phone 9845012345 --password <secure-password>
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/database';
import { User } from '../models/User';
import { config } from '../config/env';

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].replace(/^--/, '');
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const phone = args.phone || process.env.ADMIN_PHONE;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const name = args.name || 'MOOLA Administrator';

  if (!phone || !password) {
    console.error('❌ Error: Both --phone and --password arguments are required.');
    console.error('Usage: npm run admin:provision -- --phone 9845012345 --password "YourStrongPassword" [--name "Your Name"]');
    process.exit(1);
  }

  // Validate phone format (Indian 10-digit)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    console.error('❌ Error: Phone must be a valid 10-digit Indian phone number starting with 6-9.');
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('❌ Error: Administrator password must be at least 8 characters.');
    process.exit(1);
  }

  // Check against ADMIN_ALLOWED_PHONES if configured
  const allowedPhones = (config.ADMIN_ALLOWED_PHONES || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (allowedPhones.length > 0 && !allowedPhones.includes(phone) && !args.force) {
    console.log(`⚠️ Notice: Phone number is not in pre-configured ADMIN_ALLOWED_PHONES list: [${allowedPhones.join(', ')}].`);
    console.log('To bypass this check, re-run with --force or add the phone number to ADMIN_ALLOWED_PHONES in .env.');
    if (!args.force) {
      process.exit(1);
    }
  }

  console.log('🔐 Connecting to database for admin provisioning...');
  await connectDB();

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    let user = await User.findOne({ phone });

    if (user) {
      user.role = 'admin';
      user.passwordHash = hashedPassword;
      user.isActive = true;
      if (args.name) user.name = name;
      await user.save();
      console.log(`✅ Successfully promoted existing user to Administrator! Phone: ${phone.slice(0, 3)}****${phone.slice(-3)}`);
    } else {
      user = await User.create({
        name,
        phone,
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        preferredLanguage: 'en',
      });
      console.log(`✅ Successfully created new Administrator account! Phone: ${phone.slice(0, 3)}****${phone.slice(-3)}`);
    }

    console.log('🛡️  Admin privileges granted safely with bcrypt encryption. Public access remains restricted.');
  } catch (err: any) {
    console.error('❌ Failed to provision admin:', err.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error('Fatal error during admin provisioning:', err);
  process.exit(1);
});
