#!/usr/bin/env node
/**
 * X (Twitter) Analytics
 * Fetch your recent tweets with full metrics, find top performers,
 * and analyze engagement trends.
 *
 * Usage:
 *   node analytics.js                        # Your last 20 tweets with metrics
 *   node analytics.js --count 50             # Your last 50 tweets
 *   node analytics.js --top 10               # Your top 10 tweets by engagement
 *   node analytics.js --search "AI fintech"  # Search public tweets
 *   node analytics.js --user elonmusk        # Get another user's recent tweets
 *   node analytics.js --profile              # Your profile stats (followers, following, etc.)
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

function engagementScore(metrics) {
  if (!metrics) return 0;
  return (metrics.retweet_count || 0) * 20
    + (metrics.reply_count || 0) * 13.5
    + (metrics.like_count || 0) * 1
    + (metrics.bookmark_count || 0) * 10
    + (metrics.quote_count || 0) * 20
    + (metrics.impression_count || 0) * 0.001;
}

async function getMyTimeline(client, count) {
  const me = await client.v2.me({ 'user.fields': ['public_metrics', 'description', 'created_at'] });
  const userId = me.data.id;
  const username = me.data.username;

  const timeline = await client.v2.userTimeline(userId, {
    max_results: Math.min(count, 100),
    'tweet.fields': ['created_at', 'public_metrics', 'referenced_tweets', 'text'],
    exclude: ['replies'],
  });

  const tweets = [];
  for (const tweet of timeline.data?.data || []) {
    const isRetweet = tweet.referenced_tweets?.some(r => r.type === 'retweeted');
    if (isRetweet) continue;

    tweets.push({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics || {},
      engagement_score: engagementScore(tweet.public_metrics),
      url: `https://x.com/${username}/status/${tweet.id}`,
    });
  }

  return { user: me.data, tweets };
}

async function getTopTweets(client, count, topN) {
  const { user, tweets } = await getMyTimeline(client, count);
  const sorted = tweets.sort((a, b) => b.engagement_score - a.engagement_score).slice(0, topN);
  return { user, tweets: sorted };
}

async function getUserTweets(client, username, count) {
  const user = await client.v2.userByUsername(username, {
    'user.fields': ['public_metrics', 'description', 'created_at'],
  });

  if (!user.data) {
    console.error(`User @${username} not found.`);
    process.exit(1);
  }

  const timeline = await client.v2.userTimeline(user.data.id, {
    max_results: Math.min(count, 100),
    'tweet.fields': ['created_at', 'public_metrics', 'text'],
    exclude: ['replies'],
  });

  const tweets = [];
  for (const tweet of timeline.data?.data || []) {
    tweets.push({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics || {},
      engagement_score: engagementScore(tweet.public_metrics),
      url: `https://x.com/${username}/status/${tweet.id}`,
    });
  }

  return { user: user.data, tweets };
}

async function searchTweets(client, query, count) {
  const search = await client.v2.search(query, {
    max_results: Math.min(count, 100),
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'public_metrics', 'text'],
    'user.fields': ['username', 'name', 'public_metrics'],
  });

  const users = {};
  if (search.includes?.users) {
    search.includes.users.forEach(u => { users[u.id] = u; });
  }

  const tweets = [];
  for (const tweet of search.data?.data || []) {
    const author = users[tweet.author_id] || {};
    tweets.push({
      id: tweet.id,
      text: tweet.text,
      author: author.username || tweet.author_id,
      author_name: author.name || null,
      author_followers: author.public_metrics?.followers_count || null,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics || {},
      engagement_score: engagementScore(tweet.public_metrics),
      url: `https://x.com/${author.username || 'i'}/status/${tweet.id}`,
    });
  }

  return { query, tweets };
}

async function getProfile(client) {
  const me = await client.v2.me({
    'user.fields': ['public_metrics', 'description', 'created_at', 'profile_image_url', 'url', 'verified'],
  });
  return me.data;
}

function summarize(tweets) {
  if (tweets.length === 0) return null;
  const totalLikes = tweets.reduce((s, t) => s + (t.metrics.like_count || 0), 0);
  const totalReplies = tweets.reduce((s, t) => s + (t.metrics.reply_count || 0), 0);
  const totalRetweets = tweets.reduce((s, t) => s + (t.metrics.retweet_count || 0), 0);
  const totalImpressions = tweets.reduce((s, t) => s + (t.metrics.impression_count || 0), 0);
  const totalBookmarks = tweets.reduce((s, t) => s + (t.metrics.bookmark_count || 0), 0);

  return {
    tweets_analyzed: tweets.length,
    total_likes: totalLikes,
    total_replies: totalReplies,
    total_retweets: totalRetweets,
    total_impressions: totalImpressions,
    total_bookmarks: totalBookmarks,
    avg_likes: (totalLikes / tweets.length).toFixed(1),
    avg_replies: (totalReplies / tweets.length).toFixed(1),
    avg_retweets: (totalRetweets / tweets.length).toFixed(1),
    avg_impressions: (totalImpressions / tweets.length).toFixed(0),
    avg_engagement_score: (tweets.reduce((s, t) => s + t.engagement_score, 0) / tweets.length).toFixed(1),
    best_tweet: tweets.sort((a, b) => b.engagement_score - a.engagement_score)[0],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const client = getClient();

  let mode = 'timeline';
  let count = 20;
  let topN = 10;
  let searchQuery = null;
  let targetUser = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) { count = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--top' && args[i + 1]) { mode = 'top'; topN = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--search' && args[i + 1]) { mode = 'search'; searchQuery = args[i + 1]; i++; }
    else if (args[i] === '--user' && args[i + 1]) { mode = 'user'; targetUser = args[i + 1]; i++; }
    else if (args[i] === '--profile') { mode = 'profile'; }
  }

  try {
    if (mode === 'profile') {
      console.error('Fetching profile...');
      const profile = await getProfile(client);
      console.log(JSON.stringify(profile, null, 2));

    } else if (mode === 'timeline') {
      console.error(`Fetching your last ${count} tweets...`);
      const { user, tweets } = await getMyTimeline(client, count);
      console.log(JSON.stringify({
        user: user.username,
        followers: user.public_metrics?.followers_count,
        following: user.public_metrics?.following_count,
        summary: summarize(tweets),
        tweets,
        fetched_at: new Date().toISOString(),
      }, null, 2));

    } else if (mode === 'top') {
      console.error(`Fetching your top ${topN} tweets from last ${count}...`);
      const { user, tweets } = await getTopTweets(client, count, topN);
      console.log(JSON.stringify({
        user: user.username,
        top_n: topN,
        from_last: count,
        tweets,
        fetched_at: new Date().toISOString(),
      }, null, 2));

    } else if (mode === 'search') {
      console.error(`Searching: "${searchQuery}"...`);
      const { tweets } = await searchTweets(client, searchQuery, count);
      console.log(JSON.stringify({
        query: searchQuery,
        total: tweets.length,
        tweets,
        fetched_at: new Date().toISOString(),
      }, null, 2));

    } else if (mode === 'user') {
      console.error(`Fetching tweets from @${targetUser}...`);
      const { user, tweets } = await getUserTweets(client, targetUser, count);
      console.log(JSON.stringify({
        user: {
          username: user.username,
          name: user.name,
          description: user.description,
          followers: user.public_metrics?.followers_count,
          following: user.public_metrics?.following_count,
          tweets_count: user.public_metrics?.tweet_count,
          created_at: user.created_at,
        },
        summary: summarize(tweets),
        tweets,
        fetched_at: new Date().toISOString(),
      }, null, 2));
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
