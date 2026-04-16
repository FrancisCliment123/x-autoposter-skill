#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const HISTORY_FILE = path.join(__dirname, '..', '.reply-history.json');

const NICHES = {
  wealth: {
    en: [
      '"personal finance" -is:retweet lang:en',
      '"wealth management" OR "financial planning" -is:retweet lang:en',
      '"money mistakes" OR "investing mistake" -is:retweet lang:en',
      '"passive income" OR "financial freedom" -is:retweet lang:en',
      '"financial advice" OR "money tips" -is:retweet lang:en',
      '"building wealth" OR "save money" -is:retweet lang:en',
    ],
    es: [
      '"finanzas personales" -is:retweet lang:es',
      '"inversión" OR "invertir dinero" -is:retweet lang:es',
      '"libertad financiera" -is:retweet lang:es',
      '"gestión patrimonial" OR "asesoría financiera" -is:retweet lang:es',
      '"errores financieros" OR "errores de inversión" -is:retweet lang:es',
    ],
  },
  founder: {
    en: [
      '"build in public" OR "building in public" SaaS -is:retweet lang:en',
      '"indie hacker" OR "bootstrapped" -is:retweet lang:en',
      '"first users" OR "first customers" SaaS -is:retweet lang:en',
      '"just shipped" OR "just launched" -is:retweet lang:en',
    ],
    es: [
      '"construyendo en público" -is:retweet lang:es',
      '"primeros usuarios" OR "primeros clientes" -is:retweet lang:es',
    ],
  },
  fintech: {
    en: [
      '"fintech" OR "wealthtech" -is:retweet lang:en',
      '"robo advisor" OR "AI finance" -is:retweet lang:en',
      '"neobank" OR "digital banking" -is:retweet lang:en',
    ],
    es: [
      '"fintech" OR "banca digital" -is:retweet lang:es',
      '"tecnología financiera" -is:retweet lang:es',
    ],
  },
};

function getClient() {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    console.error(JSON.stringify({ success: false, error: 'Missing API keys in .env' }));
    process.exit(1);
  }
  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET,
  });
}

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {}
  return { replied_to: [], last_run: null, daily_replies: {} };
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getTodayReplyCount() {
  const history = loadHistory();
  return history.daily_replies?.[getTodayKey()] || 0;
}

function engagementScore(metrics) {
  if (!metrics) return 0;
  return (
    (metrics.retweet_count || 0) * 20 +
    (metrics.reply_count || 0) * 13.5 +
    (metrics.like_count || 0) * 1 +
    (metrics.bookmark_count || 0) * 10 +
    (metrics.quote_count || 0) * 20 +
    (metrics.impression_count || 0) * 0.001
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findTargets(options = {}) {
  const {
    count = 5,
    lang = 'en',
    niche = 'wealth',
    customQuery = null,
    minLikes = 2,
    minFollowers = 100,
    maxFollowers = 100000,
  } = options;

  const client = getClient();
  const history = loadHistory();
  const todayCount = getTodayReplyCount();

  if (todayCount >= 5) {
    console.log(JSON.stringify({
      success: false,
      error: 'Daily reply limit reached (5/5). Try again tomorrow.',
      today_replies: todayCount,
    }));
    return;
  }

  const remaining = 5 - todayCount;
  const effectiveCount = Math.min(count, remaining);

  let queries;
  if (customQuery) {
    queries = [customQuery];
  } else {
    const nicheQueries = NICHES[niche]?.[lang] || NICHES.wealth.en;
    queries = nicheQueries.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  let allTweets = [];

  for (const query of queries) {
    try {
      await sleep(1000 + Math.random() * 2000);

      const result = await client.v2.search(query, {
        max_results: 25,
        'tweet.fields': 'public_metrics,created_at,conversation_id,author_id',
        'user.fields': 'username,name,public_metrics,description',
        expansions: 'author_id',
        sort_order: 'relevancy',
      });

      const users = {};
      if (result.includes?.users) {
        for (const u of result.includes.users) {
          users[u.id] = u;
        }
      }

      for (const tweet of result.data?.data || []) {
        const author = users[tweet.author_id];
        const metrics = tweet.public_metrics || {};
        const followers = author?.public_metrics?.followers_count || 0;

        if (history.replied_to.includes(tweet.id)) continue;
        if (followers > maxFollowers || followers < minFollowers) continue;
        if ((metrics.like_count || 0) < minLikes) continue;

        allTweets.push({
          id: tweet.id,
          text: tweet.text,
          author: author?.username || 'unknown',
          author_name: author?.name || 'Unknown',
          author_bio: author?.description || '',
          author_followers: followers,
          likes: metrics.like_count || 0,
          replies: metrics.reply_count || 0,
          retweets: metrics.retweet_count || 0,
          impressions: metrics.impression_count || 0,
          engagement_score: engagementScore(metrics),
          created_at: tweet.created_at,
          url: `https://x.com/${author?.username || 'i'}/status/${tweet.id}`,
          query: query.slice(0, 60),
        });
      }
    } catch (e) {
      // Continue with other queries
    }
  }

  // Deduplicate
  const seen = new Set();
  allTweets = allTweets.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  allTweets.sort((a, b) => b.engagement_score - a.engagement_score);
  const targets = allTweets.slice(0, effectiveCount);

  console.log(JSON.stringify({
    success: true,
    targets_found: targets.length,
    total_scanned: allTweets.length,
    today_replies: todayCount,
    remaining_today: remaining,
    queries_used: queries.length,
    targets,
    timestamp: new Date().toISOString(),
  }, null, 2));
}

async function markReplied(tweetId) {
  const history = loadHistory();

  if (!history.replied_to.includes(tweetId)) {
    history.replied_to.push(tweetId);
    if (history.replied_to.length > 1000) {
      history.replied_to = history.replied_to.slice(-1000);
    }
  }

  const today = getTodayKey();
  if (!history.daily_replies) history.daily_replies = {};
  history.daily_replies[today] = (history.daily_replies[today] || 0) + 1;

  // Clean old daily counts (keep last 30 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  for (const key of Object.keys(history.daily_replies)) {
    if (new Date(key) < cutoff) delete history.daily_replies[key];
  }

  history.last_run = new Date().toISOString();
  saveHistory(history);

  console.log(JSON.stringify({
    success: true,
    marked: tweetId,
    today_replies: history.daily_replies[today],
    total_replied: history.replied_to.length,
  }));
}

async function getDailyContext() {
  const client = getClient();

  const me = await client.v2.me({
    'user.fields': 'public_metrics,description,created_at',
  });

  const timeline = await client.v2.userTimeline(me.data.id, {
    max_results: 20,
    'tweet.fields': 'public_metrics,created_at',
    exclude: ['replies'],
  });

  let totalImpressions = 0, totalLikes = 0, totalReplies = 0, totalRetweets = 0;
  let tweetCount = 0;
  let bestTweet = null, bestScore = 0;

  for (const tweet of timeline.data?.data || []) {
    const m = tweet.public_metrics || {};
    totalImpressions += m.impression_count || 0;
    totalLikes += m.like_count || 0;
    totalReplies += m.reply_count || 0;
    totalRetweets += m.retweet_count || 0;
    tweetCount++;

    const score = engagementScore(m);
    if (score > bestScore) {
      bestScore = score;
      bestTweet = { text: tweet.text.slice(0, 120), score: Math.round(score), metrics: m };
    }
  }

  const history = loadHistory();
  const today = getTodayKey();

  console.log(JSON.stringify({
    success: true,
    profile: {
      username: me.data.username,
      name: me.data.name,
      followers: me.data.public_metrics?.followers_count || 0,
      following: me.data.public_metrics?.following_count || 0,
      total_tweets: me.data.public_metrics?.tweet_count || 0,
      bio: me.data.description,
    },
    recent_performance: {
      tweets_analyzed: tweetCount,
      total_impressions: totalImpressions,
      total_likes: totalLikes,
      total_replies: totalReplies,
      total_retweets: totalRetweets,
      avg_impressions: tweetCount > 0 ? Math.round(totalImpressions / tweetCount) : 0,
      avg_likes: tweetCount > 0 ? +(totalLikes / tweetCount).toFixed(1) : 0,
      best_tweet: bestTweet,
    },
    autopilot_stats: {
      total_auto_replies: history.replied_to.length,
      today_replies: history.daily_replies?.[today] || 0,
      last_run: history.last_run,
      last_7_days: Object.entries(history.daily_replies || {})
        .filter(([k]) => new Date(k) > new Date(Date.now() - 7 * 86400000))
        .reduce((sum, [, v]) => sum + v, 0),
    },
    timestamp: new Date().toISOString(),
  }, null, 2));
}

async function getStats() {
  const history = loadHistory();
  const today = getTodayKey();

  const last7 = Object.entries(history.daily_replies || {})
    .filter(([k]) => new Date(k) > new Date(Date.now() - 7 * 86400000))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log(JSON.stringify({
    total_replies_ever: history.replied_to.length,
    today_replies: history.daily_replies?.[today] || 0,
    remaining_today: 5 - (history.daily_replies?.[today] || 0),
    last_7_days: Object.fromEntries(last7),
    last_7_days_total: last7.reduce((s, [, v]) => s + v, 0),
    last_run: history.last_run,
  }, null, 2));
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--find-targets')) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) { opts.count = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--lang' && args[i + 1]) { opts.lang = args[i + 1]; i++; }
    else if (args[i] === '--niche' && args[i + 1]) { opts.niche = args[i + 1]; i++; }
    else if (args[i] === '--query' && args[i + 1]) { opts.customQuery = args[i + 1]; i++; }
    else if (args[i] === '--min-likes' && args[i + 1]) { opts.minLikes = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--min-followers' && args[i + 1]) { opts.minFollowers = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--max-followers' && args[i + 1]) { opts.maxFollowers = parseInt(args[i + 1]); i++; }
  }
  findTargets(opts).catch(e => {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  });
} else if (args.includes('--mark-replied')) {
  const idx = args.indexOf('--mark-replied');
  const id = args[idx + 1];
  if (!id) { console.error('Usage: --mark-replied <tweet_id>'); process.exit(1); }
  markReplied(id).catch(e => {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  });
} else if (args.includes('--daily-context')) {
  getDailyContext().catch(e => {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  });
} else if (args.includes('--stats')) {
  getStats();
} else if (args.includes('--history')) {
  console.log(JSON.stringify(loadHistory(), null, 2));
} else if (args.includes('--clear-history')) {
  saveHistory({ replied_to: [], last_run: null, daily_replies: {} });
  console.log(JSON.stringify({ success: true, message: 'History cleared' }));
} else {
  console.log(JSON.stringify({
    name: 'x-autopilot',
    usage: {
      find_targets: 'node autopilot.js --find-targets [--count N] [--lang en|es] [--niche wealth|founder|fintech] [--query "custom"]',
      mark_replied: 'node autopilot.js --mark-replied <tweet_id>',
      daily_context: 'node autopilot.js --daily-context',
      stats: 'node autopilot.js --stats',
      history: 'node autopilot.js --history',
      clear_history: 'node autopilot.js --clear-history',
    },
    niches: Object.keys(NICHES),
    daily_limit: 5,
  }, null, 2));
}