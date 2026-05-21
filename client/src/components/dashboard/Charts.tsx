"use client";

import { useQuery } from "@tanstack/react-query";
import { leadsService } from "@/services/leads.service";
import dynamic from "next/dynamic";

const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });

const STATUS_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];
const SOURCE_COLORS = ["#ffffff", "#888888", "#444444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "#111",
        border: "1px solid #222",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "#fff",
      }}>
        <p style={{ margin: 0 }}>{label || payload[0]?.name}: <strong>{payload[0]?.value}</strong></p>
      </div>
    );
  }
  return null;
};

export function Charts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chart-data"],
    queryFn: () => leadsService.getChartData(),
  });

  if (isLoading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {[1, 2].map(i => (
        <div key={i} style={{
          backgroundColor: "#080808",
          border: "1px solid #141414",
          borderRadius: "12px",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <p style={{ color: "#333", fontSize: "13px" }}>Loading chart...</p>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: "13px" }}>
      Failed to load chart data. Make sure you have leads in the database.
    </div>
  );

  if (!data || (!data.byStatus?.length && !data.bySource?.length)) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: "13px" }}>
      No data available. Add some leads first.
    </div>
  );

  const { byStatus, bySource } = data;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

      {/* Status Pie Chart */}
      <div style={{
        backgroundColor: "#080808",
        border: "1px solid #141414",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: "#fff", margin: "0 0 4px" }}>
          Leads by Status
        </p>
        <p style={{ fontSize: "12px", color: "#444", margin: "0 0 20px" }}>
          Pipeline distribution
        </p>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {byStatus.map((_: any, i: number) => (
                  <Cell key={`cell-${i}`} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
          {byStatus.map((item: any, i: number) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length],
              }} />
              <span style={{ fontSize: "12px", color: "#555" }}>
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source Bar Chart */}
      <div style={{
        backgroundColor: "#080808",
        border: "1px solid #141414",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: "#fff", margin: "0 0 4px" }}>
          Leads by Source
        </p>
        <p style={{ fontSize: "12px", color: "#444", margin: "0 0 20px" }}>
          Acquisition channels
        </p>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bySource}
              barSize={40}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#444", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#444", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {bySource.map((_: any, i: number) => (
                  <Cell key={`cell-${i}`} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}