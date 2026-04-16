---
name: x-autoposter
version: "3.0.0"
description: "Post tweets, threads, replies, and quote tweets on X (Twitter) using the official API v2. Read mentions, replies, timeline, top-performing tweets, search tweets, and full engagement analytics. Delete tweets. AUTOPILOT MODE: autonomous find-targets → AI-generate-reply → post cycle with daily limits. TRIGGER: tweet, post on x, post on twitter, x api, twitter api, reply tweet, quote tweet, mentions, thread, analytics, top tweets, search twitter, delete tweet."
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
      - autopilot
---

# X Autoposter — Post + Reply + Engage + Autopilot

Post tweets, threads, and replies on X (Twitter) via the official API v2. Read mentions, replies, and engagement data. **Autopilot mode**: autonomous targeting, AI-generated replies, and build-in-public posts. Pay-per-use pricing (~$0.01/post).

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

### Quote tweet

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "My take on this" --quote <tweet_id>
```

### Delete a tweet

```bash
node ~/.claude/skills/x-autoposter/scripts/post.js --delete <tweet_id>
```

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

## 3. Analytics: `analytics.js`

```bash
# Your last 20 tweets with metrics
node ~/.claude/skills/x-autoposter/scripts/analytics.js

# Your top 10 tweets by engagement score
node ~/.claude/skills/x-autoposter/scripts/analytics.js --top 10

# Search public tweets
node ~/.claude/skills/x-autoposter/scripts/analytics.js --search "AI fintech"

# Analyze another user's tweets
node ~/.claude/skills/x-autoposter/scripts/analytics.js --user elonmusk --count 20

# Your profile stats
node ~/.claude/skills/x-autoposter/scripts/analytics.js --profile
```

## 4. Growth guide: `GROWTH-GUIDE.md`

See [GROWTH-GUIDE.md](GROWTH-GUIDE.md) for the full X/Twitter growth playbook — covering the algorithm scoring formula, the personal-account strategy (build in public as a founder, NOT as a product account), reply strategy (70/30 rule), content templates, shadowban prevention, and how to promote the product without being salesy. When drafting tweets, always follow this guide.

---

## 5. AUTOPILOT MODE — Autonomous Engagement

Autopilot finds high-engagement tweets in the wealth/fintech/founder niche, generates contextual AI replies, and posts build-in-public content. Fully autonomous — no manual approval needed.

### 5.1 autopilot.js commands

```bash
# Find target tweets to reply to (default: 5, max 5/day)
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --find-targets [--count N] [--lang en|es] [--niche wealth|founder|fintech] [--query "custom search"]

# Mark a tweet as replied (tracks history to avoid double-replies)
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --mark-replied <tweet_id>

# Get account stats + performance for build-in-public posts
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --daily-context

# View autopilot stats (replies today, last 7 days, limits)
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --stats

# View/clear reply history
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --history
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --clear-history
```

### 5.2 Autopilot Workflow: Reply Engine

**Step 1** — Find targets:
```bash
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --find-targets --count 3
```

**Step 2** — For EACH target, generate a reply following these STRICT rules:

**MUST DO:**
- Read the target tweet text completely — understand the context
- Reference something SPECIFIC from their tweet (proves you read it)
- Add genuine value: an insight, data point, personal experience, contrarian angle, or a thoughtful question
- Keep under 200 characters — concise replies win
- Match the conversation tone: professional for finance, casual for founder content
- Sound like a real person, not an AI — use natural language, occasional contractions, no corporate speak
- Be slightly contrarian or add a new angle — that's what stops the scroll

**MUST NOT:**
- NEVER mention Wealthmaia, the product, or any links — the funnel is: good reply → profile visit → bio → click
- NEVER use generic filler: "Great point!", "This is so true!", "Agreed!", "Love this!", "100%!" — these are invisible
- NEVER start with "As a..." or "In my experience..." — sounds robotic
- NEVER use hashtags in replies
- NEVER reply to the same person twice in one session

**REPLY EXAMPLES (good):**
- Target: "Most people don't start investing until their 30s and it costs them hundreds of thousands"
  Reply: "The real cost isn't the missed returns — it's the risk tolerance you never built. Starting at 22 with $50/mo teaches you to stomach a -30% year before the stakes are high."

- Target: "Just hit $5k MRR on my SaaS after 8 months of grinding"
  Reply: "Curious what your churn looks like at this stage. The $5k→$10k jump was way harder for me than 0→$5k because retention starts mattering more than acquisition."

- Target: "AI is going to replace financial advisors within 5 years"
  Reply: "Replace the spreadsheet part, sure. But the behavioral coaching — stopping someone from panic-selling in a crash — that's still deeply human. AI + human advisor is the play."

**Step 3** — Post each reply with a random pause (10-30s between replies):
```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "Your generated reply" --reply-to <tweet_id>
```

**Step 4** — Mark as replied after each successful post:
```bash
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --mark-replied <tweet_id>
```

### 5.3 Autopilot Workflow: Build-in-Public Posts

**Step 1** — Get daily context:
```bash
node ~/.claude/skills/x-autoposter/scripts/autopilot.js --daily-context
```

**Step 2** — Generate 1-2 posts using real data from the context. Rotate these templates:

**MRR/Growth Update:**
```
Week X building my wealth advice SaaS:

→ {followers} followers (up {N} this week)
→ {signups} total signups
→ Lesson: {real insight from building}

The journey from 0 to 1 is the hardest part.
```

**Behind the Scenes:**
```
Just shipped {feature} for my wealth app.

{What it does in 1 sentence}.
{Why it matters for users in 1 sentence}.

Building in public, one commit at a time.
```

**Mistake/Learning:**
```
Biggest mistake I made this week building my SaaS:

{Specific mistake}.

What I should have done: {lesson}.

Sharing so you don't repeat it.
```

**Hot Take:**
```
{Strong opinion about wealth/fintech/AI}.

Here's why most people get this wrong:

{2-3 line explanation with data or logic}.
```

**Step 3** — Post:
```bash
node ~/.claude/skills/x-autoposter/scripts/post.js "Your generated tweet"
```

### 5.4 Safety Limits (Hard-coded)

| Limit | Value | Why |
|-------|-------|-----|
| Max replies/day | 5 | X flags accounts with >10 automated interactions/day |
| Pause between replies | 10-30s random | Consistent timing = bot detection |
| Max posts/day | 3 | Quality > quantity at low follower counts |
| Min target followers | 100 | Below = no reach from reply |
| Max target followers | 100K | Above = reply gets buried |
| Min target likes | 2 | Ensures tweet has some engagement |
| Repeat reply to same person | Never | Tracked in history |
| Product mentions in replies | 0% | Never. Ever. Funnel is profile → bio → link |

### 5.5 Running Autopilot on Schedule

Use `/schedule` or `/loop` to run autopilot automatically:

**Recommended schedule (2-3x daily):**
- Morning (9-10 AM local): `--find-targets --count 2 --niche wealth` + 1 build-in-public post
- Midday (1-2 PM local): `--find-targets --count 2 --niche founder`
- Evening (6-7 PM local): `--find-targets --count 1 --niche fintech` + 1 post (optional)

**Full autopilot prompt for /schedule:**
```
Run x-autoposter autopilot: (1) find 2-3 target tweets with --find-targets, (2) generate a unique contextual reply for each following the rules in SKILL.md section 5.2, (3) post each reply with post.js --reply-to, (4) mark each as replied, (5) get daily context and post 1 build-in-public tweet. Follow all safety limits.
```

---

## Notes

- **Cost**: ~$0.01 per post, ~$0.005 per read. A typical autopilot session costs < $0.10.
- **Rate limits**: 100 posts/15min (user context), 300 searches/15min
- **Max tweet length**: 280 characters (standard), 25,000 (X Premium)
- **Media**: Max 4 images or 1 video per tweet
- **Threads**: No limit on length, each tweet in thread counts as one post
- **.env file** must NOT be committed to git — contains secret keys
- **Reply history** stored in `.reply-history.json` — survives across sessions