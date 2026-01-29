# Voice & Tone Guidelines: Clips

## Brand Voice

Clips speaks like a fellow trader who also happens to build tools. We're knowledgeable about the space, authentic to the culture, and confident without being arrogant. We take the product seriously but don't take ourselves too seriously.

### Voice Characteristics

1. **Direct** -- Say what needs to be said. No corporate fluff, no marketing jargon. Get to the point.
2. **Confident** -- We know our product is good. State facts, don't hedge with "might" or "could possibly."
3. **CT-Aware** -- We understand crypto culture, memecoin trading, and the language of Crypto Twitter. We can use slang where appropriate without overdoing it.
4. **Helpful** -- When something goes wrong or the user is confused, be clear and constructive. Don't blame the user.
5. **Energetic** -- Trading is exciting. Our product captures exciting moments. The copy should match that energy -- especially in marketing contexts.

---

## Tone Spectrum

The tone shifts based on context:

| Context | Tone | Example |
|---|---|---|
| **Landing page hero** | Bold, exciting, confident | "Hit a 10x but forgot to record? We got you." |
| **How It Works** | Clear, helpful, concise | "Paste your entry and exit hashes. Clips does the rest." |
| **Pricing** | Straightforward, honest | "5 free clips per month. Upgrade when you need more." |
| **Error messages** | Calm, helpful, specific | "That doesn't look like a valid transaction hash. Check and try again." |
| **Success messages** | Brief, positive | "Trade saved successfully" |
| **Dashboard UI** | Clean, functional | "Entry Transaction" / "Exit Transaction" |
| **Admin** | Professional, factual | "Ban User" / "Render count updated" |
| **FAQ** | Conversational, thorough | "No -- that's the whole point. Clips works retroactively." |

---

## Do's

- **Do** use active voice: "Clips renders your video" not "Your video is rendered by Clips"
- **Do** be specific: "5 clips per month" not "limited renders"
- **Do** use second person: "Your trade" / "Your clip" -- speak directly to the user
- **Do** use CT terminology where it fits naturally: "on-chain," "DEX," "transaction hash," "P&L"
- **Do** keep it short. If you can say it in 5 words, don't use 15.
- **Do** use contractions: "don't," "it's," "you're" -- we're conversational
- **Do** front-load the benefit: "Download your clip" not "Click the button to initiate the download process"
- **Do** use real examples: "$WIF 10x," "$BONK," actual numbers -- they feel real

## Don'ts

- **Don't** use corporate jargon: "leverage," "synergy," "solution," "utilize"
- **Don't** overpromise: Don't say "instant" if it takes 30 seconds. Don't say "4K" if it's 1080p.
- **Don't** use passive voice in UI: "An error has occurred" -> "Something went wrong"
- **Don't** be condescending: "Simply paste your hash" -- "simply" implies the user is dumb if they struggle
- **Don't** overuse CT slang: Using "ape," "degen," and "moon" in every sentence feels forced. Use sparingly and naturally.
- **Don't** use emojis in the app UI (buttons, labels, errors). Emojis are fine in marketing copy and social posts.
- **Don't** use exclamation marks in error messages. They feel aggressive.
- **Don't** use "please" excessively. Once per error message is fine. "Please try again" works. "Please check your input and please try again" doesn't.
- **Don't** say "we" too much in UI copy. The user doesn't care about the team; they care about their experience.

---

## Example Rewrites

### Headlines & Marketing
| Instead of... | Write... |
|---|---|
| "Create professional chart replay clips from your Solana trades" | "Turn your trades into clips that hit" |
| "Start your free trial today" | "Start clipping -- it's free" |
| "The ultimate trading content tool" | "The replay tool for Solana traders" |
| "Leverage our powerful replay engine" | "Paste two hashes. Get a video." |

### UI Copy
| Instead of... | Write... |
|---|---|
| "Submit" | "Load Chart" / "Save Trade" / "Render Clip" |
| "Error occurred" | "Something went wrong -- try again" |
| "Successfully saved" | "Trade saved" |
| "Processing your request" | "Rendering..." |
| "No results found" | "No trades saved yet" |
| "Invalid input detected" | "That doesn't look right. Check your input." |

### Error Messages
| Instead of... | Write... |
|---|---|
| "Error 500: Internal Server Error" | "Something went wrong. Please try again." |
| "Rate limit exceeded. Please wait and try again later." | "Slow down -- too many requests. Wait a moment and try again." |
| "The provided transaction signature is invalid or malformed." | "That doesn't look like a valid transaction hash. Check and try again." |
| "Authentication failed. Your session may have expired." | "Your session expired. Please sign in again." |

---

## Naming Conventions

### Product Terminology
| Term | Usage | Notes |
|---|---|---|
| **Clip** | A rendered video replay | Always "clip" not "video" in product context |
| **Render** | The process of creating a clip | "Render your clip" / "5 renders per month" |
| **Replay** | The interactive chart playback | "Watch the replay" / "Chart replay" |
| **Trade** | Entry + exit pair | "Save your trade" / "Trade replay" |
| **Markers** | Entry/exit points on chart | "Place your entry marker" |
| **Hash** / **Transaction hash** | Transaction signature | Avoid "signature" in user-facing copy (technical) |
| **P&L** | Profit and loss | Always "P&L" not "PnL" or "profit/loss" in UI |

### Feature Names
| Feature | Name | Not |
|---|---|---|
| Free tier | "Free" | "Basic," "Starter," "Free Trial" |
| Paid tier | "Pro" | "Premium," "Plus," "Paid" |
| Video output | "Clip" | "Video," "Recording," "Export" |
| Chart viewer | "Replay viewer" | "Chart player," "Playback view" |
| Leaderboard | "Leaderboard" | "Rankings," "Top Trades" |
| Public profile | "Profile" | "Public page," "Trader page" |

---

## Numbers & Formatting

- Use digits for all numbers: "5 renders" not "five renders"
- Use % symbol: "115%" not "115 percent"
- Use $ for prices: "$20/month" not "20 dollars per month"
- Use decimals for token prices: "$0.00028946" (full precision for memecoins)
- Format large P&L with + sign: "+115.81%" not "115.81%"
- Use "K" for thousands: "10K" not "10,000" in casual contexts
- Date format: "Jan 29, 2026" not "2026-01-29" in user-facing UI

---

## Accessibility Notes

- All button text should be descriptive enough for screen readers
- Don't rely on color alone to communicate state (green/red P&L should also have +/- prefix)
- Error messages should be specific about what went wrong, not just "error"
- Loading states should communicate what's happening, not just show a spinner
- Image alt text should describe the content, not just say "image"
