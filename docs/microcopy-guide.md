# Microcopy Guide: Clips

A complete audit and recommendation for all UI microcopy across the Clips application.

---

## 1. Button Labels

### Dashboard Actions
| Current | Recommended | Reasoning |
|---|---|---|
| "Load" (address submit) | "Load Chart" | More descriptive of what happens |
| "Mark Entry" | "Mark Entry" | Keep -- clear and concise |
| "Mark Exit" | "Mark Exit" | Keep -- clear and concise |
| "Reset" (markers) | "Clear Markers" | More specific about what resets |
| "Generate Video" | "Render Clip" | Consistent with "Clips" branding |
| "Download" | "Download Clip" | More specific |
| "Save Trade" | "Save Trade" | Keep -- clear |

### Playback Controls
| Current | Recommended | Reasoning |
|---|---|---|
| Play/Pause icons | Keep icons only | Universal, no text needed |
| Step icons | Keep icons only | Universal |
| Speed labels (1x, 2x, 5x) | Keep as-is | Clear and standard |

### Auth & Navigation
| Current | Recommended | Reasoning |
|---|---|---|
| "Sign In" | "Sign In" | Keep -- standard |
| "Get Started" | "Get Started Free" | Adds "free" to reduce friction |
| "Sign Out" | "Sign Out" | Keep -- standard |
| "Upgrade" | "Go Pro" | More exciting, brand-aligned |
| "Upgrade to Pro" | "Go Pro" | Shorter, punchier |
| "Dashboard" | "Dashboard" | Keep -- standard |
| "Create Your First Clip" | "Replay Your Last Trade" | See landing page copy V2 |

### Admin
| Current | Recommended | Reasoning |
|---|---|---|
| "Ban User" | "Ban User" | Keep -- clear |
| "Unban User" | "Unban User" | Keep -- clear |
| "Update" (render count) | "Update Count" | More specific |

---

## 2. Empty States

### Dashboard (No Chart Loaded)
**Current:** Input field with placeholder text
**Recommended:**
```
Headline: "Paste your transaction hashes to get started"
Subtext: "Enter your entry (buy) and exit (sell) transaction signatures
         to create a chart replay of your trade."
Helper link: "Where do I find my transaction hashes?" (expandable guide)
```

### My Trades (No Trades Saved)
**Current:** "You haven't saved any trades yet."
**Recommended:**
```
Headline: "No trades saved yet"
Subtext: "Create a chart replay from your dashboard and save it here.
         Your trades will appear in this list."
CTA: "Go to Dashboard" (button)
```

### Leaderboard (No Public Trades)
**Current:** Empty state varies by period filter
**Recommended:**
```
Headline: "No trades for this period"
Subtext: "Be the first to land on the leaderboard.
         Save a trade as public to appear here."
```

### Public Profile (No Public Trades)
**Recommended:**
```
Headline: "No public trades yet"
Subtext: "This trader hasn't shared any trades publicly."
```

---

## 3. Error Messages

### API / Network Errors
| Scenario | Current | Recommended |
|---|---|---|
| Generic API failure | "Internal server error" | "Something went wrong. Please try again." |
| Network timeout | Varies | "Connection timed out. Check your internet and try again." |
| Rate limited | "Too many requests" | "Slow down -- you're making requests too fast. Wait a moment and try again." |

### Authentication Errors
| Scenario | Current | Recommended |
|---|---|---|
| Invalid credentials | "Invalid login credentials" | "Incorrect email or password. Try again or reset your password." |
| Email not confirmed | "Email not confirmed" | "Check your email for a confirmation link before signing in." |
| OAuth failure | "Error during sign in" | "Sign-in failed. Please try again or use a different method." |
| Session expired | Redirect to login | Show toast: "Your session expired. Please sign in again." |
| Banned user | "Account is banned" | "Your account has been suspended. Contact support@clips.app for help." |

### Transaction Parsing Errors
| Scenario | Current | Recommended |
|---|---|---|
| Invalid hash format | "Invalid transaction signature" | "That doesn't look like a valid transaction hash. Check and try again." |
| Transaction not found | "Transaction not found" | "We couldn't find that transaction. Double-check the hash or try Solscan to verify it exists." |
| Not a swap transaction | "No swap detected" | "This transaction doesn't appear to be a token swap. Make sure you're using a buy or sell transaction." |
| Different tokens | "Tokens don't match" | "Your entry and exit transactions are for different tokens. Both hashes need to be for the same token." |
| Entry after exit | "Entry must be before exit" | "Your entry transaction happened after your exit. Swap the two hashes and try again." |

### Chart Data Errors
| Scenario | Current | Recommended |
|---|---|---|
| Token not found | "Token not found" | "We couldn't find data for this token. It may be too new or have low liquidity." |
| No candle data | "No data available" | "No chart data available for this timeframe. Try a different timeframe or date range." |
| Birdeye rate limit | Retry silently | Show after 3 retries: "Chart data is temporarily unavailable. Please try again in a few seconds." |

### Render Errors
| Scenario | Current | Recommended |
|---|---|---|
| Render limit reached | Shows upgrade modal | Modal text: "You've used all 5 free renders this month. Upgrade to Pro for unlimited clips." |
| Render failed | "Render failed" | "Your clip failed to render. This can happen with complex charts. Try again -- it usually works on retry." |
| Download failed | "Download failed" | "Download failed. Your clip is still available -- try the download button again." |

### Payment Errors
| Scenario | Current | Recommended |
|---|---|---|
| Checkout failed | "Failed to create checkout" | "We couldn't start the checkout process. Please try again." |
| Already subscribed | "Already have active subscription" | "You already have an active Pro subscription. Manage it from your billing portal." |

---

## 4. Success Messages

| Action | Recommended Message |
|---|---|
| Trade saved | "Trade saved successfully" |
| Trade deleted | "Trade deleted" |
| Trade made public | "Trade is now public and visible on the leaderboard" |
| Trade made private | "Trade is now private" |
| Render started | "Your clip is rendering..." (shown in progress modal) |
| Render complete | "Your clip is ready! Download it now." |
| Link copied | "Link copied to clipboard" |
| Password reset email sent | "Check your email for a password reset link" |
| Password updated | "Password updated. You can now sign in with your new password." |
| Subscription activated | "Welcome to Pro! You now have unlimited renders." |
| Render count updated (admin) | "Render count updated" |

---

## 5. Tooltips & Helper Text

### Dashboard Inputs
| Element | Tooltip/Helper |
|---|---|
| Entry hash input | "The transaction hash from your buy/entry trade" |
| Exit hash input | "The transaction hash from your sell/exit trade" |
| "How to find hashes" link | Expandable guide with Phantom + Solscan instructions |

### Chart Controls
| Element | Tooltip |
|---|---|
| Timeframe selector | "Chart candle interval" |
| Date range selector | "How far back to load chart data" |
| Display mode toggle | "Switch between price and market cap view" |
| Fullscreen button | "Toggle fullscreen (F)" |
| Speed selector | "Playback speed" |

### Trade Management
| Element | Tooltip |
|---|---|
| Public toggle | "Public trades appear on the leaderboard and your profile" |
| Replay button | "Load this trade back into the chart viewer" |

### Render
| Element | Tooltip |
|---|---|
| Render button (disabled) | "Place entry and exit markers to enable rendering" |
| Queue position | "Your place in the render queue. Pro users get priority." |

---

## 6. Form Labels & Placeholders

### Auth Forms
| Field | Label | Placeholder |
|---|---|---|
| Email | "Email" | "you@example.com" |
| Password | "Password" | "At least 8 characters" |
| Confirm password | "Confirm Password" | "Re-enter your password" |

### Dashboard Inputs
| Field | Label | Placeholder |
|---|---|---|
| Entry hash | "Entry Transaction" | "Paste your buy transaction hash" |
| Exit hash | "Exit Transaction" | "Paste your sell transaction hash" |
| Trade name (save modal) | "Trade Name (optional)" | "e.g., $WIF 10x" |

### Admin
| Field | Label | Placeholder |
|---|---|---|
| User search | "Search users" | "Search by username or email" |
| Render count | "Renders this month" | (number input) |

---

## 7. Loading States

| Context | Loading Text |
|---|---|
| Chart loading | "Loading chart data..." |
| Transaction parsing | "Parsing transaction..." |
| Render starting | "Starting render..." |
| Render queued | "Queued -- position #X" |
| Render processing | "Rendering... X%" |
| Trade list loading | Skeleton placeholders (no text) |
| Auth checking | Skeleton button (no text) |
| Admin stats loading | Skeleton cards (no text) |

---

## 8. Keyboard Shortcut Labels

| Shortcut | Action | Display Format |
|---|---|---|
| Space | Play/Pause | "Space" |
| Left Arrow | Step back | "Left" |
| Right Arrow | Step forward | "Right" |
| Home | Jump to start | "Home" |
| End | Jump to end | "End" |
| F | Toggle fullscreen | "F" |
| 1 | Speed 1x | "1" |
| 2 | Speed 2x | "2" |
| 5 | Speed 5x | "5" |
