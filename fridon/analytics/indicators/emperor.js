class EmperorAnalysis {
    static calculateEMA(data, period) {
        const k = 2 / (period + 1);
        let ema = data[0];
        
        for (let i = 1; i < data.length; i++) {
            ema = (data[i] * k) + (ema * (1 - k));
        }
        
        return ema;
    }

    static analyzeRisk(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid data provided for risk analysis');
        }

        try {
            // Extract closes and volumes
            const closes = data.map(candle => {
                const close = parseFloat(candle[4]);
                if (isNaN(close)) throw new Error('Invalid closing price');
                return close;
            });

            const volumes = data.map(candle => {
                const volume = parseFloat(candle[5]);
                if (isNaN(volume)) throw new Error('Invalid volume');
                return volume;
            });
            
            // Calculate volatility
            const returns = [];
            for (let i = 1; i < closes.length; i++) {
                if (closes[i-1] === 0) continue;
                returns.push((closes[i] - closes[i-1]) / closes[i-1]);
            }
            
            const volatility = this.calculateStdDev(returns) * Math.sqrt(365) * 100;
            
            // Calculate volume trend
            const volumeSMA = this.calculateSMA(volumes, 20);
            const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const volumeTrend = ((recentVolume - volumeSMA) / volumeSMA) * 100;
            
            // Calculate momentum
            const startPrice = closes[0];
            const endPrice = closes[closes.length - 1];
            const momentum = ((endPrice - startPrice) / startPrice) * 100;
            
            // Calculate risk score
            const riskScore = this.calculateRiskScore(volatility, volumeTrend, momentum);
            
            return {
                volatility,
                volumeTrend,
                momentum,
                riskScore
            };
        } catch (error) {
            console.error('Risk analysis error:', error);
            throw error;
        }
    }

    static calculateSMA(data, period) {
        if (data.length < period) return data.reduce((a, b) => a + b, 0) / data.length;
        return data.slice(-period).reduce((a, b) => a + b, 0) / period;
    }

    static calculateStdDev(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / data.length);
    }

    static calculateRiskScore(volatility, volumeTrend, momentum) {
        // Normalize inputs to 0-100 scale
        const volScore = Math.min(100, Math.abs(volatility));
        const volTrendScore = Math.min(100, Math.abs(volumeTrend));
        const momScore = Math.min(100, Math.abs(momentum));
        
        // Weight the components
        const weightedScore = (
            (volScore * 0.5) +      // 50% weight to volatility
            (volTrendScore * 0.3) + // 30% weight to volume trend
            (momScore * 0.2)        // 20% weight to momentum
        );
        
        return Math.min(100, Math.max(0, weightedScore));
    }

    static analyzeTrend(data) {
        try {
            const closes = data.map(candle => parseFloat(candle[4]));
            
            // Calculate EMAs for trend direction
            const ema20 = this.calculateEMA(closes, 20);
            const ema50 = this.calculateEMA(closes, 50);
            
            // Calculate momentum
            const momentum = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100;
            
            // Calculate trend strength using price action
            const highs = data.map(candle => parseFloat(candle[2]));
            const lows = data.map(candle => parseFloat(candle[3]));
            
            let highersHighs = 0;
            let lowersLows = 0;
            
            for (let i = 5; i < data.length; i++) {
                const prevHigh = Math.max(...highs.slice(i-5, i));
                const prevLow = Math.min(...lows.slice(i-5, i));
                
                if (highs[i] > prevHigh) highersHighs++;
                if (lows[i] < prevLow) lowersLows++;
            }
            
            // Determine trend direction
            const direction = ema20 > ema50 ? 'UP' : 
                            ema20 < ema50 ? 'DOWN' : 'SIDEWAYS';
            
            // Calculate trend strength (0-100)
            const strength = ((highersHighs + lowersLows) / (data.length * 2)) * 100;
            
            return {
                direction,
                strength,
                momentum
            };
        } catch (error) {
            console.error('Trend analysis error:', error);
            throw error;
        }
    }

    static analyzeVolume(data) {
        try {
            const volumes = data.map(candle => parseFloat(candle[5]));
            const closes = data.map(candle => parseFloat(candle[4]));
            
            // Calculate volume trend
            const volumeSMA = this.calculateSMA(volumes, 20);
            const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const volumeTrend = ((recentVolume - volumeSMA) / volumeSMA) * 100;
            
            // Calculate price-volume correlation
            const correlation = this.calculateCorrelation(closes, volumes);
            
            // Detect abnormal volume
            const volumeStdDev = this.calculateStdDev(volumes);
            const volumeMean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
            const abnormalVolume = recentVolume > (volumeMean + (2 * volumeStdDev));
            
            return {
                volumeTrend,
                priceVolumeCorrelation: correlation,
                abnormalVolume
            };
        } catch (error) {
            console.error('Volume analysis error:', error);
            throw error;
        }
    }

    static calculateCorrelation(x, y) {
        const n = x.length;
        const sum_x = x.reduce((a, b) => a + b, 0);
        const sum_y = y.reduce((a, b) => a + b, 0);
        const sum_xy = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
        const sum_x2 = x.reduce((a, b) => a + b * b, 0);
        const sum_y2 = y.reduce((a, b) => a + b * b, 0);
        
        const correlation = (n * sum_xy - sum_x * sum_y) / 
            Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
        
        return isNaN(correlation) ? 0 : correlation;
    }

    static analyzeTraders(data) {
        try {
            const volumes = data.map(candle => parseFloat(candle[5]));
            const prices = data.map(candle => parseFloat(candle[4]));
            const currentPrice = prices[prices.length - 1];
            
            // Identify large transactions (whale moves)
            const volumeMean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
            const volumeStdDev = this.calculateStdDev(volumes);
            const whaleThreshold = volumeMean + (2 * volumeStdDev);
            
            const whaleMoves = volumes.filter(v => v > whaleThreshold).length;
            const whaleVolumes = volumes.filter(v => v > whaleThreshold);
            const avgWhaleVolume = whaleVolumes.length > 0 ? 
                whaleVolumes.reduce((a, b) => a + b, 0) / whaleVolumes.length : 0;
            
            // Find significant price levels within ±10% of current price
            const priceRange = currentPrice * 0.1; // 10% range
            const minPrice = currentPrice - priceRange;
            const maxPrice = currentPrice + priceRange;
            
            const significantLevels = this.findSignificantLevels(prices, currentPrice, minPrice, maxPrice);
            
            return {
                whaleMovements: whaleMoves,
                averageWhaleVolume: avgWhaleVolume,
                significantLevels
            };
        } catch (error) {
            console.error('Traders analysis error:', error);
            throw error;
        }
    }

    static findSignificantLevels(prices, currentPrice, minPrice, maxPrice) {
        const levels = [];
        const window = 20;
        
        for (let i = window; i < prices.length - window; i++) {
            const leftPrices = prices.slice(i - window, i);
            const rightPrices = prices.slice(i + 1, i + window + 1);
            const price = prices[i];
            
            // Only consider levels within the valid range
            if (price >= minPrice && price <= maxPrice) {
                if (price > Math.max(...leftPrices) && price > Math.max(...rightPrices)) {
                    levels.push({ price, type: 'resistance' });
                }
                if (price < Math.min(...leftPrices) && price < Math.min(...rightPrices)) {
                    levels.push({ price, type: 'support' });
                }
            }
        }
        
        // Sort levels by price and filter to get closest support and resistance
        const sortedLevels = levels.sort((a, b) => a.price - b.price);
        const support = sortedLevels.filter(l => l.type === 'support' && l.price < currentPrice)
            .slice(-1)[0] || { price: currentPrice * 0.95, type: 'support' };
        const resistance = sortedLevels.filter(l => l.type === 'resistance' && l.price > currentPrice)
            [0] || { price: currentPrice * 1.05, type: 'resistance' };
        
        return [resistance, support];
    }
}

module.exports = EmperorAnalysis;