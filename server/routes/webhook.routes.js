/**
 * Clerk Webhook Routes
 * 
 * @description Handle Clerk webhook events for user synchronization
 */

const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const User = require('../models/User');

// Raw body parser for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

/**
 * @route   POST /api/webhooks/clerk
 * @desc    Handle Clerk webhook events
 * @access  Public (verified by signature)
 */
router.post('/clerk', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Get headers
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    event = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }

  // Handle event types
  const eventType = event.type;
  const data = event.data;

  console.log(`Received Clerk webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(data);
        break;

      case 'user.updated':
        await handleUserUpdated(data);
        break;

      case 'user.deleted':
        await handleUserDeleted(data);
        break;

      case 'session.created':
        await handleSessionCreated(data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Handler error' });
  }
});

/**
 * Handle user.created event
 */
async function handleUserCreated(data) {
  const { id, email_addresses, first_name, last_name, image_url, public_metadata } = data;

  const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

  // Check if user already exists
  const existingUser = await User.findOne({ clerkId: id });
  
  if (!existingUser) {
    await User.create({
      clerkId: id,
      email: primaryEmail?.email_address || '',
      firstName: first_name || '',
      lastName: last_name || '',
      profileImage: image_url,
      role: public_metadata?.role || 'STUDENT',
      isApproved: false
    });
    console.log(`Created user for Clerk ID: ${id}`);
  }
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(data) {
  const { id, email_addresses, first_name, last_name, image_url, public_metadata } = data;

  const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

  const updateData = {
    email: primaryEmail?.email_address,
    firstName: first_name,
    lastName: last_name,
    profileImage: image_url
  };

  // Only update role if explicitly set in metadata
  if (public_metadata?.role) {
    updateData.role = public_metadata.role;
  }

  await User.findOneAndUpdate(
    { clerkId: id },
    updateData,
    { new: true }
  );

  console.log(`Updated user for Clerk ID: ${id}`);
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(data) {
  const { id } = data;

  // Soft delete - just mark as inactive
  await User.findOneAndUpdate(
    { clerkId: id },
    { isActive: false }
  );

  console.log(`Deactivated user for Clerk ID: ${id}`);
}

/**
 * Handle session.created event
 */
async function handleSessionCreated(data) {
  const { user_id } = data;

  await User.findOneAndUpdate(
    { clerkId: user_id },
    { lastLogin: new Date() }
  );

  console.log(`Updated last login for Clerk ID: ${user_id}`);
}

module.exports = router;
