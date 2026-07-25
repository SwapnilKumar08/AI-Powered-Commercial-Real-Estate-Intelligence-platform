# Model governance

## Intended use

ConvLSTM and PredRNN estimate spatial market indicators such as rent, vacancy
or take-up. They support analyst scenario exploration and must not autonomously
approve investments, valuations or outreach.

## Required evaluation

- expanding-window temporal backtest;
- spatial holdout for unseen districts;
- MAE, RMSE, MAPE and structural similarity;
- calibration and interval coverage;
- comparison with naïve persistence and seasonal baselines;
- stability across asset types and market regimes;
- sensitivity to missing or revised upstream data.

## Release gates

1. Dataset licence and lineage approved.
2. Leakage review passed.
3. Baseline outperformance demonstrated on held-out periods.
4. Error and uncertainty thresholds approved.
5. Model card, training configuration and checksums recorded.
6. Shadow deployment completes without material drift.
7. Human owners approve production promotion.

## Monitoring

Monitor input drift, missing grids, forecast residuals, interval coverage,
inference latency and downstream analyst overrides. Roll back automatically when
data quality fails or residuals breach approved limits.

## Demonstration status

The repository contains executable architectures and a training entry point,
but no trained production weights or claimed real-world accuracy. Dashboard
figures are synthetic.

