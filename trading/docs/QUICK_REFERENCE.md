# Quick Reference - SMC/ICT/JRE Navigator v10

## Session Schedule (Eastern Time)

| Session | Time | Purpose | Action |
|---------|------|---------|--------|
| Asia | 20:00-00:00 | Accumulation | Mark High/Low |
| London | 02:00-05:00 | Manipulation | Watch for sweeps |
| Pre-Market | 08:00-09:30 | Sentiment | Note 8AM pivot |
| ORB | 09:30-09:45 | Range Formation | Mark High/Low |
| Entry Window | 09:45-11:00 | Distribution | Execute trades |
| NY Afternoon | 11:00-16:00 | Continuation | Manage positions |

## Entry Checklist

```
□ NY Session Active (09:30-16:00)
□ Entry Window Open (09:45-11:00)
□ Price broke ORB High/Low
□ 4H Bias aligned (bullish for calls, bearish for puts)
□ No Delta Divergence present
□ One of:
  □ Price in ORB Retest Zone + Volume
  □ Price in EMA Zone + Momentum ≥ 30%
  □ Price at VWAP + Volume Spike
```

## Key Levels to Plot

1. **ORB High/Low** (Yellow dash)
2. **9 EMA** (Pink)
3. **21 EMA** (Gray)
4. **VWAP** (Orange)
5. **8 AM Pivot** (White dash)
6. **Asia Range** (Gray cloud)

## Stop-Loss Calculation

```
LONG:  Stop = Entry - (ATR × 1.5)
SHORT: Stop = Entry + (ATR × 1.5)
```

## Target Calculation

```
Target 1: Entry ± (ATR × 2.0)  → Move stop to breakeven
Target 2: Entry ± (ATR × 4.0)  → Full exit or trail
```

## Momentum Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| 75-100% | Strong trend | Wide catch-up zone OK |
| 50-75% | Moderate trend | Standard zone |
| 25-50% | Weak trend | Retest entries only |
| 0-25% | Conflicting | No trade |

## Exit Signals (Priority Order)

1. **Stop Hit** → Immediate exit
2. **Target 2 Reached** → Full exit
3. **Delta Divergence + EMA Break** → Exit runners
4. **Structure Break** (ORB + EMA lost) → Exit
5. **Time Exit** (15:50) → Close all

## Red Flags - Do NOT Enter

- Delta divergence showing
- Momentum score < 25%
- VIX spike > 10% intraday
- Major news in next 30 min
- Already missed 100%+ of move

## Position Sizing Formula

```
Position Size = (Account × 1%) / (ATR × 1.5)

Example: $25,000 account, $0.40 ATR
= $250 / $0.60 = ~400 shares
```

## Daily Trading Rules

- Max 3 trades per day
- Stop after 3 consecutive losses
- Max daily loss: 3% of account
- No trades first 15 minutes
- All positions closed by 15:50

## Input Defaults

| Parameter | Default | Range |
|-----------|---------|-------|
| ATR_StopMultiplier | 1.5 | 1.0-2.5 |
| ATR_Target1Multiplier | 2.0 | 1.5-3.0 |
| ATR_Target2Multiplier | 4.0 | 3.0-6.0 |
| CatchupZone_ATR_Mult | 0.5 | 0.3-0.8 |
| MinMomentumForCatchup | 0.3 | 0.2-0.6 |
| EntryEnd_Time | 1100 | 1030-1200 |

## Keyboard Reference (TOS)

| Key | Action |
|-----|--------|
| `F3` | Buy |
| `F4` | Sell |
| `Ctrl+R` | Flatten position |
| `Space` | Cancel all orders |
