# =========================================================================
# DELTA DIVERGENCE MODULE v1.0
# Cumulative Delta Approximation for Thinkorswim
#
# PURPOSE: Detect momentum exhaustion by comparing price action to
# estimated buying/selling pressure (delta).
#
# NOTE: TOS doesn't provide native cumulative delta. This module uses
# candle structure analysis to approximate delta flow.
# =========================================================================

# ========== SETTINGS ==========
input DeltaPeriod = 20;
input SmoothingPeriod = 5;
input DivergenceLookback = 10;
input DivergenceStrength = 0.15;  # 15% threshold

# ========== DELTA CALCULATION METHODS ==========

# Method 1: Body-to-Range Ratio
# Approximates delta based on where price closed within the candle
def bodySize = AbsValue(close - open);
def wickUp = high - Max(open, close);
def wickDown = Min(open, close) - low;
def totalRange = high - low;

# Delta approximation: +1 = all buying, -1 = all selling
def deltaRatio = if totalRange > 0 then
    ((close - open) / totalRange) else 0;

# Method 2: Volume-Weighted Delta
# Weight the delta by volume for significance
def volumeWeightedDelta = deltaRatio * volume;

# Method 3: Wick Analysis (Absorption Detection)
# Large wicks suggest absorption/rejection
def upperWickRatio = if totalRange > 0 then wickUp / totalRange else 0;
def lowerWickRatio = if totalRange > 0 then wickDown / totalRange else 0;

# High upper wick = selling absorption (bearish)
# High lower wick = buying absorption (bullish)
def absorptionSignal = lowerWickRatio - upperWickRatio;

# ========== CUMULATIVE DELTA ==========

# Reset at market open
def isMarketOpen = SecondsFromTime(0930) >= 0 and SecondsTillTime(1600) > 0;
def newSession = SecondsFromTime(0930) >= 0 and SecondsFromTime(0930) < 60;

# Running cumulative delta from session start
rec cumulativeDelta = if newSession then volumeWeightedDelta
    else if isMarketOpen then cumulativeDelta[1] + volumeWeightedDelta
    else cumulativeDelta[1];

# Smoothed delta for cleaner signals
def smoothedDelta = ExpAverage(cumulativeDelta, SmoothingPeriod);

# Delta Rate of Change (momentum of the delta)
def deltaROC = if smoothedDelta[DeltaPeriod] != 0 then
    (smoothedDelta - smoothedDelta[DeltaPeriod]) / AbsValue(smoothedDelta[DeltaPeriod])
    else 0;

# ========== DIVERGENCE DETECTION ==========

# Price Swing Detection
def priceHighest = Highest(high, DivergenceLookback);
def priceLowest = Lowest(low, DivergenceLookback);
def deltaHighest = Highest(smoothedDelta, DivergenceLookback);
def deltaLowest = Lowest(smoothedDelta, DivergenceLookback);

# Higher High in Price
def priceHH = high >= priceHighest;
# Lower High in Delta (bearish divergence signal)
def deltaLH = smoothedDelta < deltaHighest * (1 - DivergenceStrength);

# Lower Low in Price
def priceLL = low <= priceLowest;
# Higher Low in Delta (bullish divergence signal)
def deltaHL = smoothedDelta > deltaLowest * (1 + DivergenceStrength);

# BEARISH DIVERGENCE: Price making new highs, delta failing
def bearishDivergence = priceHH and deltaLH and isMarketOpen;

# BULLISH DIVERGENCE: Price making new lows, delta holding
def bullishDivergence = priceLL and deltaHL and isMarketOpen;

# Divergence Strength Score (0-1)
# How significant is the divergence?
def bearishDivStrength = if bearishDivergence and deltaHighest != 0 then
    AbsValue(smoothedDelta - deltaHighest) / AbsValue(deltaHighest) else 0;
def bullishDivStrength = if bullishDivergence and deltaLowest != 0 then
    AbsValue(smoothedDelta - deltaLowest) / AbsValue(deltaLowest) else 0;

# ========== MOMENTUM EXHAUSTION SIGNALS ==========

# Volume Climax (extreme volume with reversal candle)
def avgVol = Average(volume, 20);
def volumeClimax = volume > avgVol * 2.5;

# Exhaustion conditions
def bullExhaustion = bearishDivergence and volumeClimax and (close < open);
def bearExhaustion = bullishDivergence and volumeClimax and (close > open);

# ========== DELTA TREND ==========
def deltaTrend = if smoothedDelta > smoothedDelta[1] and smoothedDelta[1] > smoothedDelta[2] then 1
    else if smoothedDelta < smoothedDelta[1] and smoothedDelta[1] < smoothedDelta[2] then -1
    else 0;

# ========== PLOTS ==========

# Delta Line
plot CumDelta = smoothedDelta;
CumDelta.SetDefaultColor(Color.CYAN);
CumDelta.SetLineWeight(2);

# Zero Line
plot ZeroLine = 0;
ZeroLine.SetDefaultColor(Color.GRAY);
ZeroLine.SetStyle(Curve.SHORT_DASH);

# Delta Trend Background
AssignBackgroundColor(
    if deltaTrend == 1 then Color.DARK_GREEN
    else if deltaTrend == -1 then Color.DARK_RED
    else Color.CURRENT);

# Divergence Markers
plot BearDiv = if bearishDivergence then smoothedDelta else Double.NaN;
BearDiv.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
BearDiv.SetDefaultColor(Color.RED);
BearDiv.SetLineWeight(3);

plot BullDiv = if bullishDivergence then smoothedDelta else Double.NaN;
BullDiv.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BullDiv.SetDefaultColor(Color.GREEN);
BullDiv.SetLineWeight(3);

# Exhaustion Markers
plot BullExh = if bullExhaustion then smoothedDelta else Double.NaN;
BullExh.SetPaintingStrategy(PaintingStrategy.BOOLEAN_WEDGE_DOWN);
BullExh.SetDefaultColor(Color.MAGENTA);

plot BearExh = if bearExhaustion then smoothedDelta else Double.NaN;
BearExh.SetPaintingStrategy(PaintingStrategy.BOOLEAN_WEDGE_UP);
BearExh.SetDefaultColor(Color.CYAN);

# ========== LABELS ==========

AddLabel(yes, "Delta: " + Round(smoothedDelta, 0),
    if smoothedDelta > 0 then Color.GREEN else Color.RED);

AddLabel(yes, "Delta ROC: " + Round(deltaROC * 100, 1) + "%",
    if deltaROC > 0.05 then Color.GREEN
    else if deltaROC < -0.05 then Color.RED
    else Color.GRAY);

AddLabel(bearishDivergence, "BEARISH DIV (" + Round(bearishDivStrength * 100, 0) + "%)", Color.RED);
AddLabel(bullishDivergence, "BULLISH DIV (" + Round(bullishDivStrength * 100, 0) + "%)", Color.GREEN);

AddLabel(bullExhaustion, "BULL EXHAUSTION", Color.MAGENTA);
AddLabel(bearExhaustion, "BEAR EXHAUSTION", Color.CYAN);

# ========== ALERTS ==========

Alert(bearishDivergence and !bearishDivergence[1], "Bearish Delta Divergence", Alert.BAR, Sound.Ding);
Alert(bullishDivergence and !bullishDivergence[1], "Bullish Delta Divergence", Alert.BAR, Sound.Ding);
Alert(bullExhaustion, "Bullish Exhaustion - Consider Exit", Alert.BAR, Sound.Ring);
Alert(bearExhaustion, "Bearish Exhaustion - Consider Exit", Alert.BAR, Sound.Ring);

# ========== END OF MODULE ==========
