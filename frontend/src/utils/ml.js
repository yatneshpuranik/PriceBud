/* global tf */

// ---------------------------------------------
// SAFE HISTORY ALIGNMENT
// ---------------------------------------------
export function alignPlatformHistory(platforms) {
  if (!platforms || platforms.length === 0) return [];

  const sorted = platforms.map((p) => ({
    name: p.name,
    history: [...(p.history || [])].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
    currentPrice: p.currentPrice,
  }));

  // agar kisi ka history chhota hai to bhi handle kar sake
  const maxLen = Math.max(...sorted.map((p) => p.history.length));
  const merged = [];

  for (let i = 0; i < maxLen; i++) {
    const prices = [];

    sorted.forEach((p) => {
      const h = p.history[i];

      if (h) {
        prices.push(h.price);
      } else {
        // Missing data → last known ya currentPrice use karo
        const last = p.history[p.history.length - 1];
        prices.push(last ? last.price : p.currentPrice);
      }
    });

    merged.push({
      date:
        sorted[0].history[i]?.date ||
        sorted[0].history[sorted[0].history.length - 1]?.date,
      prices,
    });
  }

  return merged;
}

// ---------------------------------------------
// ML MODEL (BROWSER)
// ---------------------------------------------
export async function trainPriceModel(series) {
  const WINDOW = 30;
  const FEATURES = series[0]?.prices.length || 0;

  if (series.length <= WINDOW || FEATURES === 0) return null;

  const X = [];
  const y = [];

  for (let i = 0; i + WINDOW < series.length; i++) {
    const windowSlice = series.slice(i, i + WINDOW);
    const nextDay = series[i + WINDOW];

    const featureVec = windowSlice.map((d) => d.prices).flat();
    const nextMin = Math.min(...nextDay.prices);

    X.push(featureVec);
    y.push(nextMin);
  }

  const xs = tf.tensor2d(X); // shape [N, WINDOW * FEATURES]
  const ys = tf.tensor2d(y, [y.length, 1]);

  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 64,
      activation: "relu",
      inputShape: [WINDOW * FEATURES],
    })
  );
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: tf.train.adam(),          // 🔥 backend-safe optimizer
    loss: tf.losses.meanSquaredError,    // 🔥 fix for "Unknown loss mse"
  });

  await model.fit(xs, ys, {
    epochs: 20,
    batchSize: 16,
    verbose: 0,
  });

  xs.dispose();
  ys.dispose();

  return model;
}

// ---------------------------------------------
// PREDICT
// ---------------------------------------------
export async function predictNextDrop(model, series, currentBestPrice) {
  const WINDOW = 30;
  const FEATURES = series[0]?.prices.length || 0;

  if (!model || series.length < WINDOW || FEATURES === 0) return null;

  const lastWindow = series.slice(-WINDOW);
  const featureVec = lastWindow.map((d) => d.prices).flat();

  const input = tf.tensor2d([featureVec]);
  const output = model.predict(input);

  const data = await output.data();
  const nextMin = data[0];

  input.dispose();
  output.dispose();

  // 👉 yahi value card wale green price se match karegi
  const effectiveCurrent =
    typeof currentBestPrice === "number"
      ? currentBestPrice
      : Math.min(...series[series.length - 1].prices);

  const willDrop = nextMin < effectiveCurrent * 0.98;

  return {
    currentMin: effectiveCurrent,
    predictedMin: nextMin,
    willDrop,
  };
}
