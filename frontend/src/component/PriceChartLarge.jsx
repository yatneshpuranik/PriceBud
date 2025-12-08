import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

// Format date into short readable form
const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0].payload;

  return (
    <div className="bg-white p-2 border rounded shadow-sm text-sm">
      <div className="font-semibold">{formatDate(p.date)}</div>
      <div>Price: ₹{p.price}</div>
    </div>
  );
};

const PriceChartLarge = ({ data }) => {
  if (!data || !data.length) return null;

  // Convert dates
  const formatted = data.map((d) => ({
    ...d,
    dateFormatted: formatDate(d.date),
  }));

  const prices = formatted.map((d) => d.price);
  const min = Math.min(...prices);
  const latestIdx = formatted.length - 1;

  return (
    <div style={{ width: "100%", height: 260, minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

          <XAxis
            dataKey="dateFormatted"
            tick={{ fontSize: 11, fill: "#666" }}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#666" }}
            width={50}
            domain={["dataMin - 5", "dataMax + 5"]}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#0ea5e9"
            strokeWidth={2.2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />

          {/* Lowest Price marker */}
          {formatted.map((d, idx) =>
            d.price === min ? (
              <ReferenceDot
                key={`low-${idx}`}
                x={d.dateFormatted}
                y={d.price}
                r={5}
                fill="#f59e0b"
                stroke="#f59e0b"
              />
            ) : null
          )}

          {/* Latest Point */}
          <ReferenceDot
            x={formatted[latestIdx].dateFormatted}
            y={formatted[latestIdx].price}
            r={5}
            fill="#10b981"
            stroke="#10b981"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChartLarge;
