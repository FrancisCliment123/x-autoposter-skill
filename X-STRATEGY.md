# X Growth Strategy — Wealthmaia

## The Funnel

```
REPLY con valor a tweet de @alguien (5K-50K followers)
    ↓ miles de personas ven tu reply
    ↓ los curiosos hacen click en tu perfil
PERFIL optimizado (nombre personal, bio = "Building Wealthmaia...")
    ↓ ven que eres founder construyendo algo real
    ↓ click en link de bio
WEALTHMAIA waitlist / landing page
    ↓ signup
USUARIO
```

No vendes nada en la reply. Solo demuestras que sabes de wealth/finanzas. La curiosidad hace el trabajo de venta.

---

## Account Setup (MANUAL — do first)

1. **Change display name** to your real name (not WealthMaia Maia)
2. **Bio**: "Building Wealthmaia — AI-powered wealth advice. Sharing the journey from $0. Finance nerd."
3. **Profile pic**: Your face (not a logo)
4. **Banner**: Can include subtle Wealthmaia branding
5. **Link in bio**: wealthmaia.com or waitlist URL
6. **Pinned tweet**: Your best value thread with soft CTA at the end
7. **X Premium**: Buy after week 2 ($8/mo for 2-4x visibility boost)

---

## Reply Strategy (Autopilot — 3-5 replies/day)

### Niche targets by priority:
- **Wealth/finance (70%)**: financial advisors, money educators, wealth accounts (5K-50K followers)
- **Founder/build-in-public (20%)**: other SaaS founders, indie hackers
- **Fintech (10%)**: AI + finance, neobanks, wealthtech

### Reply rules:
- Reference something SPECIFIC from their tweet
- Add genuine value: insight, data point, contrarian angle, or thoughtful question
- Keep under 200 characters — concise replies get more engagement
- NEVER mention Wealthmaia — 0%. The profile does that job
- NEVER use generic filler: "Great point!", "This is so true!", "Agreed!"
- Sound like a real person, not an AI
- Be slightly contrarian or add a new angle — that stops the scroll

### Reply examples:

**Target**: "Most people don't start investing until their 30s and it costs them hundreds of thousands"
**Reply**: "The real cost isn't the missed returns — it's the risk tolerance you never built. Starting at 22 with $50/mo teaches you to stomach a -30% year before the stakes are high."

**Target**: "Personal finance is way more about human behavior than formulas"
**Reply**: "Everyone knows compound interest works. Almost nobody can ignore a friend's new car for 20 years to let it actually compound. The formula is simple — the execution is deeply emotional."

**Target**: "I built a personal finance dashboard in 15 minutes"
**Reply**: "Tracking was always the easy part. The hard part is making someone actually change behavior after seeing the numbers. Great dashboards, zero behavior change — that's where most fail."

### Execution:
```bash
# 1. Find targets
node scripts/autopilot.js --find-targets --count 3 --niche wealth

# 2. Generate reply (Claude does this based on rules above)

# 3. Post reply
node scripts/post.js "Your reply text" --reply-to <tweet_id>

# 4. Mark as replied
node scripts/autopilot.js --mark-replied <tweet_id>
```

---

## Post Strategy (1-2 posts/day)

### Content rotation:

| Day | Type | Template |
|-----|------|----------|
| Mon | MRR/Growth update | "Week X building my wealth SaaS:\n→ [metric] signups\n→ [metric] followers\n→ Lesson: [insight]\n\nThe journey from 0 to 1 is the hardest." |
| Tue | Hot take | "[Strong opinion about wealth/fintech/AI].\n\nHere's why most people get this wrong:\n\n[2-3 line explanation]" |
| Wed | Behind the scenes | Screenshot of feature + "Just shipped [feature]. Here's why it matters for [user benefit]." |
| Thu | Thread (value) | "7 money mistakes I see while building a wealth app:\n\n🧵" + 7 tweets of pure value |
| Fri | Mistake/learning | "Biggest mistake I made this week building my SaaS:\n\n[mistake]\n\nWhat I should have done: [lesson]" |
| Sat | Curated insight | Breakdown of a fintech/wealth trend or stat |
| Sun | Rest or 1 light tweet | Optional |

### The 95/5 rule:
- **95% of posts** = pure value (insights, build-in-public, tips, hot takes)
- **5% of posts** = soft product mention (1 in every 20 tweets)

### How to mention Wealthmaia (the 5%):

**Value Sandwich (threads):**
```
Tweet 1-7: Pure value about a wealth/finance topic
Tweet 8: "This is exactly why I'm building Wealthmaia — link in bio if you're curious"
```

**DM Funnel (single tweet):**
```
"I analyzed 50 common investment mistakes and built a framework to avoid them.

Comment 'WEALTH' and I'll share it with you."
```
→ Drives replies (algo weight 13.5x) + captures leads via DM

**Casual mention:**
```
"Building a wealth advice app taught me more about money psychology than any book.

People don't fail because they don't know what to do — they fail because knowing and doing are different skills."
```

### Execution:
```bash
# 1. Get daily context (stats for build-in-public posts)
node scripts/autopilot.js --daily-context

# 2. Generate post (Claude does this based on templates above)

# 3. Post
node scripts/post.js "Your tweet text"

# 4. For threads
node scripts/post.js --thread "Tweet 1" "Tweet 2" "Tweet 3"
```

---

## Hook Formulas

```
"Most [common belief] is wrong. Here's what actually works:"
"I spent [X time] studying [topic]. [Number] lessons:"
"Stop doing [common practice]. Do this instead:"
"[Specific number] changed everything about [topic]:"
"Nobody talks about this, but [surprising insight]"
"[Bold claim]. Let me explain:"
"Week [N] building my SaaS from zero:"
```

Front-load the most interesting part into the first 8 words. You have 0.3 seconds to stop the scroll.

---

## Link Strategy (CRITICAL)

Links in tweets = 50-90% reach penalty from the algorithm. NEVER put links in tweet body.

Instead:
1. **Link in bio** — always have wealthmaia.com there
2. **Link in reply** — post tweet, then reply to yourself with the link
3. **"Comment X and I'll DM you"** — drives replies + captures leads
4. **Thread with CTA at end** — value first, soft CTA in last tweet

---

## Engagement Rules (70/30 Time Split)

- **70% of X time = engagement** (replies, discussions, DMs)
- **30% of X time = creating content** (writing posts, threads)

Replies are the #1 growth lever at low follower counts. When you reply to a 30K account, thousands of people see your reply.

### Daily engagement minimum:
- 3-5 autopilot replies (via autopilot.js)
- Self-reply to your own tweets within 1 hour (boosts thread)
- Engage 15 min before AND after posting (signals to algo)

---

## Safety Limits

| Limit | Value | Why |
|-------|-------|-----|
| Max auto-replies/day | 5 | X flags >10 automated interactions/day |
| Pause between replies | 10-30s random | Consistent timing = bot detection |
| Max posts/day | 3-5 | Quality > quantity at low followers |
| Min target followers | 100 | Below = no reach from your reply |
| Max target followers | 100K | Above = reply gets buried |
| Product mentions | 1 in 20 tweets | Curiosity > promotion |
| Duplicate content | NEVER | Instant shadowban trigger |

---

## Shadowban Prevention

### Triggers to AVOID:
- More than 10 automated interactions/day
- Identical or near-identical text
- Perfectly timed posts (same minute every day)
- Aggressive following/unfollowing
- Generic replies ("Great post!", "Agreed!")

### If shadowbanned:
1. Stop ALL automation for 7-14 days
2. Check at shadowban.eu
3. Post 1-2 manual, high-quality tweets/day
4. 5-10 manual replies/day
5. Recovery: typically 2-14 days

---

## Weekly Metrics Targets

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Followers | 10-30 | 100-300 | 500-1000 |
| Avg impressions/tweet | 50-200 | 200-600 | 600-2000 |
| Profile visits/day | 5-10 | 20-50 | 100+ |
| Waitlist signups from X | 0-2 | 5-15 | 30-50 |

### Track weekly:
```bash
node scripts/analytics.js --top 10          # Best performing tweets
node scripts/analytics.js --profile         # Follower growth
node scripts/autopilot.js --stats           # Autopilot activity
```

---

## Full Autopilot Prompt (for /schedule or agent)

```
Run x-autoposter autopilot cycle:

1. Run: node scripts/autopilot.js --find-targets --count 3 --niche wealth
2. For each target, generate a unique reply following the rules in X-STRATEGY.md:
   - Reference something specific from the tweet
   - Add genuine value (insight, data, contrarian angle)
   - Under 200 chars, natural tone
   - ZERO product mentions
3. Post each reply: node scripts/post.js "reply" --reply-to <id>
4. Mark each: node scripts/autopilot.js --mark-replied <id>
5. Run: node scripts/autopilot.js --daily-context
6. Generate 1 build-in-public post using the daily template rotation
7. Post it: node scripts/post.js "tweet"

Follow all safety limits. Max 5 replies/day total.
```

---

## Algorithm Reference

| Action | Weight | Implication |
|--------|--------|-------------|
| Retweet | 20x | Make content worth sharing |
| Reply | 13.5x | Drive conversation in tweets |
| Profile click | 12x | Optimize profile to convert |
| Link click | 11x | But links kill reach — use bio |
| Bookmark | 10x | Threads get bookmarked most |
| Like | 1x | Least valuable signal |

**Critical window**: First 30-60 minutes after posting decide everything. Engage before AND after posting.

**X Premium**: 2-4x visibility boost, ~600 impressions/post vs ~60 free (Buffer, 18M posts analyzed).
