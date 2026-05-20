"use client";

import { useQuery } from "@tanstack/react-query";
import { leadsService } from "@/services/leads.service";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];
const SOURCE_COLORS = ["#ffffff", "#888888", "#444444"];

export function Charts() {
  const { data, isLoading } = useQuery({
    queryKey: ["chart-data"],
    queryFn: () => leadsService.getChartData(),
  });

  if (isLoading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {[1, 2].map(i => (
        <div key={i} style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px", height: "260px" }} />
      ))}
    </div>
  );

  if (!data || (!data.byStatus?.length && !data.bySource?.length)) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

      {/* Status Pie Chart */}
      <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: "#ffffff", marginBottom: "4px" }}>Leads by Status</p>
        <p style={{ fontSize: "12px", color: "#444", marginBottom: "16px" }}>Pipeline distribution</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data.byStatus}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.byStatus.map((_, i) => (
                <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#aaa" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {data.byStatus.map((item, i) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
              <span style={{ fontSize: "11px", color: "#666" }}>{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Source Bar Chart */}
      <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: "#ffffff", marginBottom: "4px" }}>Leads by Source</p>
        <p style={{ fontSize: "12px", color: "#444", marginBottom: "16px" }}>Acquisition channels</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.bySource} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#555", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#aaa" }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.bySource.map((_, i) => (
                <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}