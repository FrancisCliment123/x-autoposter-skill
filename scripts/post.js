#!/usr/bin/env node
/**
 * X (Twitter) Post Script
 * Post tweets, threads, and replies using the official X API v2.
 *
 * Usage:
 *   node post.js "Your tweet text"
 *   node post.js "Tweet text" --reply-to <tweet_id>
 *   node post.js --thread "First tweet" "Second tweet" "Third tweet"
 *   node post.js "Tweet with image" --media path/to/image.jpg
 *
 * Requires .env file in the skill directory with:
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 */

const { TwitterApi } = require('twitter-api-v2');
const path = require('path');
const fs = require('fs');

// Load .env from skill directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function getClient() {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;

  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    console.error('Missing API keys. Create a .env file in ~/.claude/skills/x-autoposter/ with:');
    console.error('  X_API_KEY=your_api_key');
    console.error('  X_API_SECRET=your_api_secret');
    console.error('  X_ACCESS_TOKEN=your_access_token');
    console.error('  X_ACCESS_SECRET=your_access_secret');
    process.exit(1);
  }

  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET,
  });
}

async function uploadMedia(client, filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  console.log(`Uploading media: ${filePath}...`);
  const mediaId = await client.v1.uploadMedia(filePath);
  console.log(`Media uploaded: ${mediaId}`);
  return mediaId;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage:');
    console.error('  node post.js "Your tweet text"');
    console.error('  node post.js "Tweet text" --reply-to <tweet_id>');
    console.error('  node post.js --thread "First tweet" "Second tweet" "Third tweet"');
    console.error('  node post.js "Tweet text" --media path/to/image.jpg');
    process.exit(1);
  }

  const client = getClient();

  // Parse args
  let isThread = false;
  let replyTo = null;
  let mediaPath = null;
  const texts = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--thread') {
      isThread = true;
    } else if (args[i] === '--reply-to' && args[i + 1]) {
      replyTo = args[i + 1];
      i++;
    } else if (args[i] === '--media' && args[i + 1]) {
      mediaPath = args[i + 1];
      i++;
    } else {
      texts.push(args[i]);
    }
  }

  if (texts.length === 0) {
    console.error('No tweet text provided.');
    process.exit(1);
  }

  try {
    // Thread mode
    if (isThread) {
      console.log(`Posting thread (${texts.length} tweets)...`);
      const result = await client.v2.tweetThread(texts);
      console.log('');
      console.log(JSON.stringify({
        success: true,
        type: 'thread',
        tweets: result.map((r, i) => ({
          index: i,
          id: r.data.id,
          text: texts[i].slice(0, 80),
          url: `https://x.com/i/status/${r.data.id}`,
        })),
        timestamp: new Date().toISOString(),
      }, null, 2));
      return;
    }

    // Single tweet or reply
    const tweetText = texts[0];
    const payload = { text: tweetText };

    // Upload media if provided
    if (mediaPath) {
      const mediaId = await uploadMedia(client, mediaPath);
      payload.media = { media_ids: [mediaId] };
    }

    // Reply mode
    if (replyTo) {
      payload.reply = { in_reply_to_tweet_id: replyTo };
      console.log(`Replying to tweet ${replyTo}...`);
    } else {
      console.log('Posting tweet...');
    }

    const result = await client.v2.tweet(payload);

    console.log('');
    console.log(JSON.stringify({
      success: true,
      type: replyTo ? 'reply' : 'tweet',
      id: result.data.id,
      text: tweetText,
      url: `https://x.com/i/status/${result.data.id}`,
      reply_to: replyTo || null,
      has_media: !!mediaPath,
      timestamp: new Date().toISOString(),
    }, null, 2));

  } catch (err) {
    if (err.data) {
      console.error('X API Error:', JSON.stringify(err.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

main();
