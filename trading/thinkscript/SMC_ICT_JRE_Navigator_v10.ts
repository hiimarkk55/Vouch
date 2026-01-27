# =========================================================================
# SMC/ICT/JRE GLOBAL NAVIGATOR v10 (OPTIMIZED)
# Optimized for SPY/QQQ 0-1 DTE Options
#
# IMPROVEMENTS OVER v9:
# - ATR-based dynamic stop-losses (eliminates wick-outs)
# - Cumulative Delta divergence for runner management
# - Adaptive entry zones for "Trend Catch-up" without chasing
# - Volume confirmation filter
# - Breakeven trailing mechanism
# =========================================================================

# ========== 1. CORE SETTINGS ==========
input TradeSize = 100;
input EntryEnd_Time = 1100;

# ATR-Based Risk Management (REPLACING FIXED TICKS)
input ATR_Period = 14;
input ATR_StopMultiplier = 1.5;      # Stop = Entry - (ATR * 1.5)
input ATR_Target1Multiplier = 2.0;   # First target = Entry + (ATR * 2.0)
input ATR_Target2Multiplier = 4.0;   # Runner target = Entry + (ATR * 4.0)

# Trend Catch-up Settings
input CatchupZone_ATR_Mult = 0.5;    # Zone width for catching trends
input MinMomentumForCatchup = 0.3;   # Minimum momentum score (0-1)

# Delta Divergence Settings
input DeltaLookback = 10;
input DivergenceThreshold = 0.15;    # 15% divergence triggers exit warning

# ========== 2. ATR CALCULATION (Multi-Timeframe) ==========
def ATR_15min = ATR(14, AggregationPeriod.FIFTEEN_MIN);
def ATR_current = ATR(ATR_Period);

# Use the higher of current ATR or 15-min ATR for safety buffer
def dynamicATR = Max(ATR_current, ATR_15min);

# ========== 3. SESSION TIME DEFINITIONS ==========
# Asia Session: 20:00 - 00:00 (Accumulation)
def isAsia = SecondsFromTime(2000) >= 0 or SecondsTillTime(0000) > 0;

# London Session: 02:00 - 05:00 (Manipulation / Liquidity Hunt)
def isLondon = SecondsFromTime(0200) >= 0 and SecondsTillTime(0500) > 0;

# Pre-Market: 08:00 - 09:30 (Sentiment Formation)
def isPreMarket = SecondsFromTime(0800) >= 0 and SecondsTillTime(0930) > 0;

# NY Session: 09:30 - 16:00 (Distribution)
def isNY = SecondsFromTime(0930) >= 0 and SecondsTillTime(1600) > 0;

# Entry Window: 09:45 - EntryEnd_Time
def inWindow = SecondsFromTime(0945) >= 0 and SecondsTillTime(EntryEnd_Time) > 0;

# ========== 4. SESSION RANGE TRACKING (Recursive Memory) ==========

# --- Asia Range (Accumulation Zone) ---
rec asiaH = if SecondsFromTime(2000) == 0 then high
            else if isAsia and high > asiaH[1] then high
            else asiaH[1];
rec asiaL = if SecondsFromTime(2000) == 0 then low
            else if isAsia and low < asiaL[1] then low
            else asiaL[1];
def asiaMid = (asiaH + asiaL) / 2;
def asiaRange = asiaH - asiaL;

# --- London Range (Manipulation Zone) ---
rec lonH = if SecondsFromTime(0200) == 0 then high
           else if isLondon and high > lonH[1] then high
           else lonH[1];
rec lonL = if SecondsFromTime(0200) == 0 then low
           else if isLondon and low < lonL[1] then low
           else lonL[1];

# Detect Liquidity Sweep (London breaks Asia extremes)
def londonSweptAsiaHigh = lonH > asiaH;
def londonSweptAsiaLow = lonL < asiaL;

# --- 8:00 AM Pivot (Sentiment Anchor) ---
rec pivot8am = if SecondsFromTime(0800) == 0 then close else pivot8am[1];

# --- 9:30-9:45 Opening Range (ORB) ---
def is930to945 = SecondsFromTime(0930) >= 0 and SecondsTillTime(0945) > 0;
rec orbH = if SecondsFromTime(0930) == 0 then high
           else if is930to945 and high > orbH[1] then high
           else orbH[1];
rec orbL = if SecondsFromTime(0930) == 0 then low
           else if is930to945 and low < orbL[1] then low
           else orbL[1];
def orbMid = (orbH + orbL) / 2;
def orbRange = orbH - orbL;

# ========== 5. BIAS FILTERS (Multi-Timeframe Confluence) ==========

# 4-Hour Bias (Structural Direction)
def h4High = high(period = AggregationPeriod.FOUR_HOURS);
def h4Low = low(period = AggregationPeriod.FOUR_HOURS);
def h4Mid = (h4High + h4Low) / 2;
def h4Bias = if close > h4Mid then 1 else if close < h4Mid then -1 else 0;

# Daily Bias (Trend Context)
def dailyHigh = high(period = AggregationPeriod.DAY);
def dailyLow = low(period = AggregationPeriod.DAY);
def dailyMid = (dailyHigh + dailyLow) / 2;
def dailyBias = if close > dailyMid then 1 else if close < dailyMid then -1 else 0;

# Previous Day High/Low (Key Liquidity Levels)
def prevDayH = high(period = AggregationPeriod.DAY)[1];
def prevDayL = low(period = AggregationPeriod.DAY)[1];

# Combined Bias Score (-2 to +2)
def biasScore = h4Bias + dailyBias;
def biasBullish = biasScore >= 1;
def biasBearish = biasScore <= -1;

# ========== 6. MOMENTUM INDICATORS ==========

# Fast EMA (Trend Following)
def fastEMA = ExpAverage(close, 9);
def slowEMA = ExpAverage(close, 21);
def emaTrend = if fastEMA > slowEMA then 1 else if fastEMA < slowEMA then -1 else 0;

# EMA Slope (Momentum Strength)
def emaSlope = (fastEMA - fastEMA[3]) / 3;
def emaSlopeNorm = emaSlope / dynamicATR;  # Normalized for comparison

# VWAP (Fair Value Anchor)
def vwapValue = vwap;
def aboveVWAP = close > vwapValue;
def belowVWAP = close < vwapValue;

# RSI (Momentum Divergence Detection)
def rsiValue = RSI(14);
def rsiOverbought = rsiValue > 70;
def rsiOversold = rsiValue < 30;

# ========== 7. VOLUME & DELTA ANALYSIS ==========
# Note: TOS doesn't have native cumulative delta, so we approximate

# Volume Moving Average
def volMA = Average(volume, 20);
def volumeSpike = volume > volMA * 1.5;
def volumeConfirmation = volume > volMA;

# Approximate Delta using candle structure
# Positive delta = buying pressure, Negative delta = selling pressure
def candleBody = close - open;
def candleRange = high - low;
def deltaApprox = if candleRange > 0 then candleBody / candleRange else 0;

# Cumulative Delta Approximation (running sum)
rec cumDelta = if SecondsFromTime(0930) == 0 then deltaApprox * volume
               else cumDelta[1] + (deltaApprox * volume);

# Delta Divergence Detection
# Bullish: Price making higher highs, but delta is flat/declining
def priceHH = high > Highest(high[1], DeltaLookback);
def deltaFlat = cumDelta < cumDelta[DeltaLookback] * (1 + DivergenceThreshold);
def bearishDivergence = priceHH and deltaFlat and isNY;

# Bearish: Price making lower lows, but delta is rising
def priceLL = low < Lowest(low[1], DeltaLookback);
def deltaRising = cumDelta > cumDelta[DeltaLookback] * (1 - DivergenceThreshold);
def bullishDivergence = priceLL and deltaRising and isNY;

# ========== 8. ADAPTIVE ENTRY ZONES ==========
# Instead of exact retests, create a "zone" that adapts to volatility

# Zone around ORB High for long entries
def orbZoneTop = orbH + (dynamicATR * 0.3);
def orbZoneBottom = orbH - (dynamicATR * CatchupZone_ATR_Mult);

# Zone around ORB Low for short entries
def orbShortZoneTop = orbL + (dynamicATR * CatchupZone_ATR_Mult);
def orbShortZoneBottom = orbL - (dynamicATR * 0.3);

# EMA catch-up zone (wider when momentum is strong)
def momentumMultiplier = if AbsValue(emaSlopeNorm) > 0.5 then 1.5 else 1.0;
def emaCatchupZone = dynamicATR * CatchupZone_ATR_Mult * momentumMultiplier;

# ========== 9. MOMENTUM SCORE (0-1) ==========
# Higher score = stronger trend, safer to enter catch-up trades

def momScore_EMA = if emaTrend == 1 and biasBullish then 0.25
                   else if emaTrend == -1 and biasBearish then 0.25
                   else 0;
def momScore_VWAP = if biasBullish and aboveVWAP then 0.25
                    else if biasBearish and belowVWAP then 0.25
                    else 0;
def momScore_Volume = if volumeConfirmation then 0.25 else 0;
def momScore_Slope = if AbsValue(emaSlopeNorm) > 0.3 then 0.25 else 0;

def totalMomentumScore = momScore_EMA + momScore_VWAP + momScore_Volume + momScore_Slope;

# ========== 10. ENTRY LOGIC (OPTIMIZED) ==========

# --- LONG SETUP CONDITIONS ---

# Primary breakout signal
def breakoutLong = isNY and close > orbH and biasBullish;
rec hasBrokenOutLong = if breakoutLong then 1
                       else if SecondsFromTime(1600) == 0 then 0
                       else hasBrokenOutLong[1];

# ENTRY TYPE 1: Classic Retest (Zone-based, not exact)
# Price pulls back INTO the ORB zone but closes above ORB High
def retestEntryLong = hasBrokenOutLong
                      and low <= orbZoneTop
                      and low >= orbZoneBottom
                      and close > orbH
                      and volumeConfirmation;

# ENTRY TYPE 2: EMA Catch-up (For "Moon" moves)
# Price touches 9 EMA zone during strong momentum
def emaCatchupLong = hasBrokenOutLong
                     and low <= (fastEMA + emaCatchupZone)
                     and low >= (fastEMA - dynamicATR * 0.2)
                     and close > fastEMA
                     and totalMomentumScore >= MinMomentumForCatchup
                     and emaTrend == 1;

# ENTRY TYPE 3: VWAP Confluence (Additional safety)
# Price retests VWAP area during bullish structure
def vwapEntryLong = hasBrokenOutLong
                    and low <= (vwapValue + dynamicATR * 0.3)
                    and close > vwapValue
                    and close > fastEMA
                    and biasBullish
                    and volumeSpike;

# --- SHORT SETUP CONDITIONS ---

def breakoutShort = isNY and close < orbL and biasBearish;
rec hasBrokenOutShort = if breakoutShort then 1
                        else if SecondsFromTime(1600) == 0 then 0
                        else hasBrokenOutShort[1];

def retestEntryShort = hasBrokenOutShort
                       and high >= orbShortZoneBottom
                       and high <= orbShortZoneTop
                       and close < orbL
                       and volumeConfirmation;

def emaCatchupShort = hasBrokenOutShort
                      and high >= (fastEMA - emaCatchupZone)
                      and high <= (fastEMA + dynamicATR * 0.2)
                      and close < fastEMA
                      and totalMomentumScore >= MinMomentumForCatchup
                      and emaTrend == -1;

# --- COMBINED ENTRIES ---
def finalEntryLong = (retestEntryLong or emaCatchupLong or vwapEntryLong)
                     and inWindow
                     and !bearishDivergence;

def finalEntryShort = (retestEntryShort or emaCatchupShort)
                      and inWindow
                      and !bullishDivergence;

# Entry lock (prevent multiple entries)
rec entryLockLong = if finalEntryLong and !entryLockLong[1] then 1
                    else if SecondsFromTime(1600) == 0 then 0
                    else entryLockLong[1];

rec entryLockShort = if finalEntryShort and !entryLockShort[1] then 1
                     else if SecondsFromTime(1600) == 0 then 0
                     else entryLockShort[1];

# ========== 11. DYNAMIC STOP-LOSS CALCULATION ==========
# ATR-based stops that adapt to current volatility

# Track entry price
rec entryPriceLong = if finalEntryLong and !entryLockLong[1] then close
                     else entryPriceLong[1];
rec entryPriceShort = if finalEntryShort and !entryLockShort[1] then close
                      else entryPriceShort[1];

# Initial Stop Levels (ATR-based)
def initialStopLong = entryPriceLong - (dynamicATR * ATR_StopMultiplier);
def initialStopShort = entryPriceShort + (dynamicATR * ATR_StopMultiplier);

# Target Levels
def target1Long = entryPriceLong + (dynamicATR * ATR_Target1Multiplier);
def target2Long = entryPriceLong + (dynamicATR * ATR_Target2Multiplier);
def target1Short = entryPriceShort - (dynamicATR * ATR_Target1Multiplier);
def target2Short = entryPriceShort - (dynamicATR * ATR_Target2Multiplier);

# Trailing Stop Logic (Breakeven after Target 1)
rec trailingStopLong = if finalEntryLong and !entryLockLong[1] then initialStopLong
                       else if entryLockLong and high >= target1Long then
                            Max(entryPriceLong + dynamicATR * 0.2, trailingStopLong[1])
                       else trailingStopLong[1];

rec trailingStopShort = if finalEntryShort and !entryLockShort[1] then initialStopShort
                        else if entryLockShort and low <= target1Short then
                             Min(entryPriceShort - dynamicATR * 0.2, trailingStopShort[1])
                        else trailingStopShort[1];

# ========== 12. EXIT LOGIC (SMART EXITS) ==========

# --- LONG EXIT CONDITIONS ---

# Hard stop hit
def stopOutLong = entryLockLong and low <= trailingStopLong;

# Target 2 reached (Runner exit)
def target2HitLong = entryLockLong and high >= target2Long;

# Delta divergence exit (Early warning - momentum exhaustion)
def divergenceExitLong = entryLockLong and bearishDivergence and close < fastEMA;

# Structure break (Close below both ORB and EMA)
def structureBreakLong = entryLockLong and close < orbH and close < fastEMA;

# Time-based exit (Close before EOD)
def timeExitLong = entryLockLong and SecondsTillTime(1550) <= 0;

# Combined long exit
def exitLong = stopOutLong or target2HitLong or divergenceExitLong
               or structureBreakLong or timeExitLong;

# --- SHORT EXIT CONDITIONS ---
def stopOutShort = entryLockShort and high >= trailingStopShort;
def target2HitShort = entryLockShort and low <= target2Short;
def divergenceExitShort = entryLockShort and bullishDivergence and close > fastEMA;
def structureBreakShort = entryLockShort and close > orbL and close > fastEMA;
def timeExitShort = entryLockShort and SecondsTillTime(1550) <= 0;

def exitShort = stopOutShort or target2HitShort or divergenceExitShort
                or structureBreakShort or timeExitShort;

# ========== 13. ORDER EXECUTION ==========

# Long Orders
AddOrder(OrderType.BUY_AUTO,
         finalEntryLong and !entryLockLong[1],
         open[-1],
         TradeSize,
         Color.GREEN,
         Color.GREEN,
         name = "0DTE_CALL");

AddOrder(OrderType.SELL_TO_CLOSE,
         exitLong,
         open[-1],
         TradeSize,
         Color.RED,
         Color.RED,
         name = "CALL_EXIT");

# Short Orders
AddOrder(OrderType.SELL_AUTO,
         finalEntryShort and !entryLockShort[1],
         open[-1],
         TradeSize,
         Color.RED,
         Color.RED,
         name = "0DTE_PUT");

AddOrder(OrderType.BUY_TO_CLOSE,
         exitShort,
         open[-1],
         TradeSize,
         Color.GREEN,
         Color.GREEN,
         name = "PUT_EXIT");

# ========== 14. VISUAL PLOTS & LABELS ==========

# --- Session Labels ---
AddLabel(isAsia, "ACCUMULATION (ASIA)", Color.MAGENTA);
AddLabel(isLondon, "MANIPULATION (LONDON)", Color.YELLOW);
AddLabel(isPreMarket, "SENTIMENT (PRE-MKT)", Color.ORANGE);
AddLabel(isNY, "DISTRIBUTION (NY)", Color.CYAN);

# --- Bias Labels ---
AddLabel(yes, "4H Bias: " + (if h4Bias == 1 then "BULL" else if h4Bias == -1 then "BEAR" else "NEUTRAL"),
         if h4Bias == 1 then Color.GREEN else if h4Bias == -1 then Color.RED else Color.GRAY);

AddLabel(yes, "Mom Score: " + Round(totalMomentumScore * 100, 0) + "%",
         if totalMomentumScore >= 0.75 then Color.GREEN
         else if totalMomentumScore >= 0.5 then Color.YELLOW
         else Color.RED);

# --- Delta Divergence Warning ---
AddLabel(bearishDivergence, "BEARISH DIVERGENCE - CAUTION", Color.RED);
AddLabel(bullishDivergence, "BULLISH DIVERGENCE - CAUTION", Color.GREEN);

# --- Key Level Plots ---

# ORB High/Low
plot ORB_High = orbH;
ORB_High.SetDefaultColor(Color.YELLOW);
ORB_High.SetStyle(Curve.SHORT_DASH);
ORB_High.SetLineWeight(2);

plot ORB_Low = orbL;
ORB_Low.SetDefaultColor(Color.YELLOW);
ORB_Low.SetStyle(Curve.SHORT_DASH);
ORB_Low.SetLineWeight(2);

# Entry Zones (Clouds)
AddCloud(if hasBrokenOutLong and isNY then orbZoneTop else Double.NaN,
         if hasBrokenOutLong and isNY then orbZoneBottom else Double.NaN,
         Color.DARK_GREEN, Color.DARK_GREEN);

# EMA
plot EMA9 = fastEMA;
EMA9.SetDefaultColor(Color.PINK);
EMA9.SetLineWeight(2);

plot EMA21 = slowEMA;
EMA21.SetDefaultColor(Color.LIGHT_GRAY);

# VWAP
plot VWAPLine = vwapValue;
VWAPLine.SetDefaultColor(Color.LIGHT_ORANGE);
VWAPLine.SetStyle(Curve.FIRM);

# Dynamic Stop Level (when in position)
plot StopLevel = if entryLockLong then trailingStopLong
                 else if entryLockShort then trailingStopShort
                 else Double.NaN;
StopLevel.SetDefaultColor(Color.RED);
StopLevel.SetStyle(Curve.POINTS);
StopLevel.SetLineWeight(3);

# Target Levels
plot Target1 = if entryLockLong then target1Long
               else if entryLockShort then target1Short
               else Double.NaN;
Target1.SetDefaultColor(Color.GREEN);
Target1.SetStyle(Curve.SHORT_DASH);

plot Target2 = if entryLockLong then target2Long
               else if entryLockShort then target2Short
               else Double.NaN;
Target2.SetDefaultColor(Color.CYAN);
Target2.SetStyle(Curve.SHORT_DASH);

# Asia Range Background
AddCloud(if isNY then asiaH else Double.NaN,
         if isNY then asiaL else Double.NaN,
         Color.DARK_GRAY, Color.DARK_GRAY);

# 8 AM Pivot
plot Pivot8AM = pivot8am;
Pivot8AM.SetDefaultColor(Color.WHITE);
Pivot8AM.SetStyle(Curve.LONG_DASH);

# --- Entry Signals ---
AddChartBubble(finalEntryLong and !entryLockLong[1], low,
               "CALL\nStop: " + Round(initialStopLong, 2) + "\nT1: " + Round(target1Long, 2),
               Color.GREEN, no);

AddChartBubble(finalEntryShort and !entryLockShort[1], high,
               "PUT\nStop: " + Round(initialStopShort, 2) + "\nT1: " + Round(target1Short, 2),
               Color.RED, yes);

# --- Exit Signals ---
AddChartBubble(divergenceExitLong, high, "DELTA DIV", Color.ORANGE, yes);
AddChartBubble(target2HitLong, high, "TARGET 2", Color.CYAN, yes);
AddChartBubble(divergenceExitShort, low, "DELTA DIV", Color.ORANGE, no);
AddChartBubble(target2HitShort, low, "TARGET 2", Color.CYAN, no);

# ========== 15. ATR INFO DISPLAY ==========
AddLabel(yes, "ATR: " + Round(dynamicATR, 4) + " | Stop: " + Round(dynamicATR * ATR_StopMultiplier, 4),
         Color.WHITE);

# ========== END OF SCRIPT ==========
