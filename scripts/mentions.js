#!/usr/bin/env node
/**
 * X (Twitter) Mentions & Replies Reader
 * Read replies to your tweets and mentions of your account.
 *
 * Usage:
 *   node mentions.js                          # Get recent mentions
 *   node mentions.js --tweet <tweet_id>       # Get replies to a specific tweet
 *   node mentions.js --count 50               # Get last 50 mentions (default: 20)
 *   node mentions.js --engagement <tweet_id>  # Get engagement stats for a tweet
 *
 * Requires .env file with: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 */

const { TwitterApi } = require('twitter-api-v2');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function getClient() {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;

  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    console.error('Missing API keys. Create a .env file in ~/.claude/skills/x-autoposter/ with:');
    console.error('  X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET');
    process.exit(1);
  }

  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET,
  });
}

async function getMyUserId(client) {
  const me = await client.v2.me();
  return { id: me.data.id, username: me.data.username };
}

async function getMentions(client, userId, count) {
  const mentions = await client.v2.userMentionTimeline(userId, {
    max_results: Math.min(count, 100),
    expansions: ['author_id', 'referenced_tweets.id'],
    'tweet.fields': ['created_at', 'public_metrics', 'conversation_id', 'in_reply_to_user_id'],
    'user.fields': ['username', 'name', 'public_metrics'],
  });

  const users = {};
  if (mentions.includes?.users) {
    mentions.includes.users.forEach(u => { users[u.id] = u; });
  }

  const results = [];
  for (const tweet of mentions.data?.data || []) {
    const author = users[tweet.author_id] || {};
    results.push({
      id: tweet.id,
      text: tweet.text,
      author: author.username || tweet.author_id,
      author_name: author.name || null,
      author_followers: author.public_metrics?.followers_count || null,
      created_at: tweet.created_at,
      conversation_id: tweet.conversation_id,
      is_reply: !!tweet.in_reply_to_user_id,
      metrics: tweet.public_metrics || {},
      url: `https://x.com/${author.username || 'i'}/status/${tweet.id}`,
    });
  }

  return results;
}

async function getTweetReplies(client, tweetId) {
  // Search for replies to a specific tweet using conversation_id
  const tweet = await client.v2.singleTweet(tweetId, {
    'tweet.fields': ['conversation_id', 'public_metrics', 'created_at'],
  });

  const conversationId = tweet.data.conversation_id || tweetId;

  const search = await client.v2.search(`conversation_id:${conversationId} is:reply`, {
    max_results: 100,
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'public_metrics', 'in_reply_to_user_id'],
    'user.fields': ['username', 'name', 'public_metrics'],
  });

  const users = {};
  if (search.includes?.users) {
    search.includes.users.forEach(u => { users[u.id] = u; });
  }

  const replies = [];
  for (const reply of search.data?.data || []) {
    const author = users[reply.author_id] || {};
    replies.push({
      id: reply.id,
      text: reply.text,
      author: author.username || reply.author_id,
      author_name: author.name || null,
      author_followers: author.public_metrics?.followers_count || null,
      created_at: reply.created_at,
      metrics: reply.public_metrics || {},
      url: `https://x.com/${author.username || 'i'}/status/${reply.id}`,
    });
  }

  return {
    original_tweet: {
      id: tweet.data.id,
      text: tweet.data.text,
      metrics: tweet.data.public_metrics,
      created_at: tweet.data.created_at,
    },
    replies,
  };
}

async function getEngagement(client, tweetId) {
  const tweet = await client.v2.singleTweet(tweetId, {
    'tweet.fields': ['public_metrics', 'created_at', 'text'],
  });

  return {
    id: tweet.data.id,
    text: tweet.data.text,
    created_at: tweet.data.created_at,
    metrics: tweet.data.public_metrics,
    url: `https://x.com/i/status/${tweet.data.id}`,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const client = getClient();

  let mode = 'mentions';
  let tweetId = null;
  let count = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tweet' && args[i + 1]) {
      mode = 'replies';
      tweetId = args[i + 1];
      i++;
    } else if (args[i] === '--engagement' && args[i + 1]) {
      mode = 'engagement';
      tweetId = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1]);
      i++;
    }
  }

  try {
    if (mode === 'mentions') {
      const { id, username } = await getMyUserId(client);
      console.error(`Fetching mentions for @${username}...`);
      const mentions = await getMentions(client, id, count);
      console.log(JSON.stringify({
        user: username,
        total: mentions.length,
        mentions,
        fetched_at: new Date().toISOString(),
      }, null, 2));

    } else if (mode === 'replies') {
      console.error(`Fetching replies to tweet ${tweetId}...`);
      const data = await getTweetReplies(client, tweetId);
      console.log(JSON.stringify({
        ...data,
        total_replies: data.replies.length,
        fetched_at: new Date().toISOString(),
      }, null, 2));

    } else if (mode === 'engagement') {
      console.error(`Fetching engagement for tweet ${tweetId}...`);
      const data = await getEngagement(client, tweetId);
      console.log(JSON.stringify(data, null, 2));
    }

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
