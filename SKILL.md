---
name: x-autoposter
version: "1.0.0"
description: "Post tweets, threads, and replies on X (Twitter) using the official API v2. Read mentions, replies, and engagement data. TRIGGER: tweet, post on x, post on twitter, x api, twitter api, reply tweet, mentions, thread."
argument-hint: 'x-autoposter "Your tweet text here"'
allowed-tools: Bash, Read, Write
user-invocable: true
author: FrancisCliment123
license: MIT
homepage: https://github.com/FrancisCliment123/x-autoposter-skill
repository: https://github.com/FrancisCliment123/x-autoposter-skill
metadata:
  openclaw:
    emoji: "🐦"
    requires:
      bins:
        - node
    homepage: https://github.com/FrancisCliment123/x-autoposter-skill
    tags:
      - x
      - twitter
      - social-media
      - posting
      - automation
      - engagement
      - threads
      - replies
---

# X Autoposter — Post + Reply + Engage

Post tweets, threads, and replies on X (Twitter) via the official API v2. Read mentions, replies, and engagement data. Pay-per-use pricing (~$0.01/post).

## Setup

1. Create an app at [developer.x.com](https://developer.x.com)
2. Set app permissions to **Read and Write**
3. Generate all 4 keys under "Keys and Tokens"
4. Create `~/.claude/skills/x-autoposter/.env`:

```
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_SECRET=your_access_secret
```

5. Install dependencies: `npm install` in `~/.claude/skills/x-autoposter/`

## 1. Post a tweet: `post.js`

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "Your tweet text"
```

### Post with media

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "Tweet with image" --media path/to/image.jpg
```

### Post a thread

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js --thread "First tweet" "Second tweet" "Third tweet"
```

### Reply to a tweet

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "Your reply" --reply-to <tweet_id>
```

**IMPORTANT:** Always show the user the exact tweet text before posting. Never post automatically without explicit approval.

## 2. Read mentions & replies: `mentions.js`

```bash
# Get recent mentions
node ~/.claude/skills/x-autoposter/scripts/mentions.js

# Get replies to a specific tweet
node ~/.claude/skills/x-autoposter/scripts/mentions.js --tweet <tweet_id>

# Get engagement stats for a tweet
node ~/.claude/skills/x-autoposter/scripts/mentions.js --engagement <tweet_id>

# Get last N mentions (default: 20)
node ~/.claude/skills/x-autoposter/scripts/mentions.js --count 50
```

Returns JSON with:
- `mentions[]`: id, text, author, author_followers, created_at, metrics (likes, retweets, replies)
- `replies[]`: same fields, filtered to a specific tweet's conversation
- `engagement`: like_count, retweet_count, reply_count, quote_count, impression_count

## Workflow — Post & Engage

```
1. User tells agent what they want to tweet
2. Agent drafts tweet text (max 280 chars)
3. User approves → post.js publishes it
4. Later: agent reads replies via mentions.js --tweet <id>
5. Agent drafts responses to interesting replies
6. User approves → post.js --reply-to <reply_id> posts them
```

## Workflow — Monitor & Respond

```
1. Run mentions.js to see recent mentions/replies
2. Agent analyzes each mention for sentiment and relevance
3. Agent drafts responses
4. User approves each reply before sending
```

## 3. Growth guide: `GROWTH-GUIDE.md`

See [GROWTH-GUIDE.md](GROWTH-GUIDE.md) for the full X/Twitter growth playbook — covering the algorithm scoring formula, posting strategy, content mix, hook formulas, link strategy (never put links in tweet body), engagement tactics, automation safety, and how to promote WealthMaia without being salesy. When drafting tweets, always follow this guide.

## Notes

- **Cost**: ~$0.01 per post, ~$0.005 per read. A typical session costs pennies.
- **Rate limits**: 100 posts/15min (user context), 300 searches/15min
- **Max tweet length**: 280 characters (standard), 25,000 (X Premium)
- **Media**: Max 4 images or 1 video per tweet
- **Threads**: No limit on length, each tweet in thread counts as one post
- **.env file** must NOT be committed to git — contains secret keys
