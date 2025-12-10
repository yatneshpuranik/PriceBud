/* global tf */

// QUICK ALIGNMENT (short version)
export function quickAlign(platforms) {
  const sorted = platforms.map(p => ({
    history: [...(p.history || [])],
  }));

  const max = Math.max(...sorted.map(p => p.history.length));
  const out = [];

  for (let i = 0; i < max; i++) {
    const prices = sorted.map(p =>
      p.history[i] ? p.history[i].price :
      p.history[p.history.length - 1]?.price || 0
    );
    out.push(prices);
  }

  return out;
}

// TRAIN SMALL MODEL
export async function quickTrain(series) {
  if (series.length < 35) return null;

  const WINDOW = 30;
  const X = [];
  const y = [];

  for (let i = 0; i + WINDOW < series.length; i++) {
    const windowSlice = series.slice(i, i + WINDOW).flat();
    const nextMin = Math.min(...series[i + WINDOW]);
    X.push(windowSlice);
    y.push(nextMin);
  }

  const xs = tf.tensor2d(X);
  const ys = tf.tensor2d(y, [y.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: "relu", inputShape: [90] }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
  });

  await model.fit(xs, ys, { epochs: 10, batchSize: 16, verbose: 0 });
  return model;
}

// PREDICT
export async function quickPredict(model, series, currentBest) {
  const WINDOW = 30;
  const last = series.slice(-WINDOW).flat();

  const out = model.predict(tf.tensor2d([last]));
  const predicted = (await out.data())[0];

  return {
    predictedMin: predicted,
    willDrop: predicted < currentBest * 0.97,
  };
}
