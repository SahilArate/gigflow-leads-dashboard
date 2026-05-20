"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Zap, LogOut, User, Users, UserPlus, TrendingUp, XCircle,
  Search, Download, SlidersHorizontal, Edit2, Trash2, Eye,
  Sparkles, Loader2, ChevronLeft, ChevronRight, X,
  CheckSquare, Square, Clock, Activity
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLeads, useLeadStats, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { LeadFilters, LeadStatus, LeadSource, Lead, UserRole } from "@/types";
import { leadsService } from "@/services/leads.service";
import { aiService, LeadAnalysis } from "@/services/ai.service";
import { formatDate, getInitials } from "@/lib/utils";
import { Charts } from "@/components/dashboard/Charts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  status: z.nativeEnum(LeadStatus),
  source: z.nativeEnum(LeadSource),
  notes: z.string().max(500).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const s = {
  page: { minHeight: "100vh", backgroundColor: "#000000", fontFamily: "system-ui, -apple-system, sans-serif" },
  navbar: { position: "sticky" as const, top: 0, zIndex: 40, borderBottom: "1px solid #141414", backgroundColor: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" },
  navInner: { maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px" },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" },
  card: { backgroundColor: "#080808", border: "1px solid #141414", borderRadius: "12px", padding: "20px" },
  input: { width: "100%", backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "9px 14px", fontSize: "14px", color: "#ffffff", outline: "none", boxSizing: "border-box" as const },
  select: { backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#888888", outline: "none", cursor: "pointer" },
  btn: { backgroundColor: "#ffffff", color: "#000000", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "600" as const, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnGhost: { backgroundColor: "transparent", color: "#555555", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnDanger: { backgroundColor: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "600" as const, cursor: "pointer" },
  label: { display: "block", fontSize: "13px", fontWeight: "500" as const, color: "#888888", marginBottom: "6px" },
  overlay: { position: "fixed" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#080808", border: "1px solid #1e1e1e", borderRadius: "16px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #141414" },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" as const },
  th: { textAlign: "left" as const, padding: "11px 16px", fontSize: "11px", fontWeight: "500" as const, color: "#444444", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid #141414" },
  td: { padding: "13px 16px", borderBottom: "1px solid #0c0c0c", fontSize: "14px" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [filters, setFilters] = useState<LeadFilters>({ page: 1, limit: 10, sort: "latest", status: "", source: "", search: "" });
  const [activeTab, setActiveTab] = useState<"table" | "charts">("table");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // AI states
  const [aiInsight, setAiInsight] = useState("");
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [leadAnalysis, setLeadAnalysis] = useState<LeadAnalysis | null>(null);
  const [leadAnalysisLoading, setLeadAnalysisLoading] = useState(false);

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Activity
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

  const { data, isLoading: leadsLoading } = useLeads(filters);
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { status: LeadStatus.NEW, source: LeadSource.WEBSITE },
  });

  useEffect(() => {
    if (editLead) {
      setValue("name", editLead.name);
      setValue("email", editLead.email);
      setValue("status", editLead.status);
      setValue("source", editLead.source);
      setValue("notes", editLead.notes || "");
    }
  }, [editLead, setValue]);

  const loadActivity = async (leadId: string) => {
    setActivityLoading(true);
    try {
      const result = await leadsService.getLeadActivity(leadId);
      setActivity(result);
    } catch { setActivity([]); }
    finally { setActivityLoading(false); }
  };

  const handleCreate = async (data: LeadFormData) => {
    await createLead.mutateAsync(data);
    setIsCreateOpen(false);
    reset();
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editLead) return;
    await updateLead.mutateAsync({ id: editLead._id, payload: data });
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleExport = async () => {
    try {
      await leadsService.exportCSV({ status: filters.status, source: filters.source, search: filters.search, sort: filters.sort });
      toast.success("CSV exported!");
    } catch { toast.error("Export failed"); }
  };

  const loadInsight = async () => {
    setAiInsightLoading(true);
    try {
      const result = await aiService.getDashboardInsights();
      setAiInsight(result);
    } catch { setAiInsight("Unable to load insights."); }
    finally { setAiInsightLoading(false); }
  };

  const analyzeViewLead = async () => {
    if (!viewLead) return;
    setLeadAnalysisLoading(true);
    try {
      const result = await aiService.analyzeLead(viewLead._id);
      setLeadAnalysis(result);
    } catch { setLeadAnalysis({ summary: "Unable to analyze.", score: 0, suggestion: "Try again." }); }
    finally { setLeadAnalysisLoading(false); }
  };

  const handleBulkAnalyze = async () => {
    if (selectedIds.length === 0) { toast.error("Select at least one lead"); return; }
    if (selectedIds.length > 5) { toast.error("Maximum 5 leads at once"); return; }
    setBulkLoading(true);
    setShowBulkModal(true);
    try {
      const results = await aiService.bulkAnalyze(selectedIds);
      setBulkResults(results);
    } catch { toast.error("Bulk analysis failed"); }
    finally { setBulkLoading(false); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const leads = data?.leads || [];
  const meta = data?.meta;

  const statConfig = [
    { label: "Total Leads", icon: Users, value: stats?.total ?? 0 },
    { label: "New", icon: UserPlus, value: stats?.New ?? 0 },
    { label: "Qualified", icon: TrendingUp, value: stats?.Qualified ?? 0 },
    { label: "Lost", icon: XCircle, value: stats?.Lost ?? 0 },
  ];

  const inputStyle = (hasError?: boolean) => ({
    ...s.input,
    border: `1px solid ${hasError ? "#ef4444" : "#2a2a2a"}`,
  });

  if (authLoading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
    </div>
  );

  const LeadFormFields = () => (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column" as const, gap: "16px" }}>
      <div>
        <label style={s.label}>Full Name</label>
        <input style={inputStyle(!!errors.name)} placeholder="John Doe" {...register("name")} />
        {errors.name && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.name.message}</p>}
      </div>
      <div>
        <label style={s.label}>Email</label>
        <input style={inputStyle(!!errors.email)} type="email" placeholder="john@example.com" {...register("email")} />
        {errors.email && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{errors.email.message}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={s.label}>Status</label>
          <select style={{ ...s.select, width: "100%" }} {...register("status")}>
            {Object.values(LeadStatus).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Source</label>
          <select style={{ ...s.select, width: "100%" }} {...register("source")}>
            {Object.values(LeadSource).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={s.label}>Notes (optional)</label>
        <textarea style={{ ...s.input, resize: "none" as const, height: "80px" }} placeholder="Add notes..." {...register("notes")} />
      </div>
    </div>
  );

  return (
    <div style={s.page}>

      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={s.navbar}>
        <div style={s.navInner}>
          {/* Left — Logo + Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", backgroundColor: "#fff", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={16} color="#000" />
              </div>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>GigFlow</span>
            </div>

            {/* Nav tabs */}
            <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[
                { id: "table", label: "Pipeline" },
                { id: "charts", label: "Analytics" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    color: activeTab === tab.id ? "#ffffff" : "#555555",
                    backgroundColor: activeTab === tab.id ? "#141414" : "transparent",
                    fontWeight: activeTab === tab.id ? "500" : "400",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkAnalyze}
                style={{ ...s.btnGhost, fontSize: "12px", padding: "7px 12px", borderColor: "#333", color: "#aaa" }}
              >
                <Sparkles size={13} />
                AI Analyze ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => { setIsCreateOpen(true); reset(); }}
              style={{ ...s.btn, padding: "7px 14px", fontSize: "13px" }}
            >
              <Plus size={14} /> New Lead
            </button>

            <div style={{ width: "1px", height: "24px", backgroundColor: "#1e1e1e" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", backgroundColor: "#141414", border: "1px solid #1e1e1e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={13} color="#666" />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "500", color: "#fff", margin: 0, lineHeight: 1 }}>{user?.name}</p>
                <p style={{ fontSize: "11px", color: "#444", margin: 0, textTransform: "capitalize" }}>{user?.role}</p>
              </div>
            </div>

            <button onClick={logout} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex" }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>

        {/* ─── PAGE HEADER ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>
            {activeTab === "table" ? "Leads Pipeline" : "Analytics"}
          </h1>
          <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
            {activeTab === "table" ? "Track and manage your sales leads" : "Visual overview of your pipeline"}
          </p>
        </div>

        {/* ─── STATS CARDS ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {statConfig.map(({ label, icon: Icon, value }) => (
            <div key={label} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
                <Icon size={13} color="#333" />
              </div>
              {statsLoading
                ? <div style={{ height: "28px", backgroundColor: "#111", borderRadius: "4px" }} />
                : <p style={{ fontSize: "26px", fontWeight: "600", color: "#fff", margin: 0 }}>{value}</p>
              }
            </div>
          ))}
        </div>

        {/* ─── AI INSIGHT ───────────────────────────────────────────────────── */}
        <div style={{ ...s.card, marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <Sparkles size={14} color="#666" />
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>AI Insight</span>
            {aiInsight && <span style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>{aiInsight}</span>}
            {!aiInsight && !aiInsightLoading && <span style={{ fontSize: "13px", color: "#333" }}>Click to analyze your pipeline</span>}
            {aiInsightLoading && <span style={{ fontSize: "13px", color: "#444", display: "flex", alignItems: "center", gap: "6px" }}><Loader2 size={12} /> Analyzing...</span>}
          </div>
          <button onClick={loadInsight} disabled={aiInsightLoading} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: "12px" }}>
            {aiInsightLoading ? <Loader2 size={12} /> : <Sparkles size={12} />}
            {aiInsight ? "Refresh" : "Analyze"}
          </button>
        </div>

        {/* ─── CHARTS TAB ───────────────────────────────────────────────────── */}
        {activeTab === "charts" && <Charts />}

        {/* ─── TABLE TAB ────────────────────────────────────────────────────── */}
        {activeTab === "table" && (
          <>
            {/* Filters */}
            <div style={{ ...s.card, marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={13} color="#444" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    style={{ ...s.input, paddingLeft: "34px" }}
                  />
                </div>
                <button onClick={handleExport} style={s.btnGhost}>
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" as const }}>
                <SlidersHorizontal size={13} color="#444" />
                <select value={filters.status || ""} onChange={e => setFilters(p => ({ ...p, status: e.target.value as any, page: 1 }))} style={s.select}>
                  <option value="">All Status</option>
                  {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.source || ""} onChange={e => setFilters(p => ({ ...p, source: e.target.value as any, page: 1 }))} style={s.select}>
                  <option value="">All Sources</option>
                  {Object.values(LeadSource).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.sort || "latest"} onChange={e => setFilters(p => ({ ...p, sort: e.target.value as any }))} style={s.select}>
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                {selectedIds.length > 0 && (
                  <span style={{ fontSize: "12px", color: "#666", marginLeft: "4px" }}>
                    {selectedIds.length} selected
                  </span>
                )}
                <span style={{ fontSize: "12px", color: "#333", marginLeft: "auto" }}>{meta?.total ?? 0} results</span>
              </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#080808", border: "1px solid #141414", borderRadius: "12px", overflow: "hidden", marginBottom: "14px" }}>
              {leadsLoading ? (
                <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ height: "44px", backgroundColor: "#0f0f0f", borderRadius: "6px" }} />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div style={{ padding: "80px 24px", textAlign: "center" as const }}>
                  <Eye size={28} color="#222" style={{ margin: "0 auto 12px" }} />
                  <p style={{ color: "#444", fontSize: "14px", margin: "0 0 4px" }}>No leads found</p>
                  <p style={{ color: "#2a2a2a", fontSize: "13px", margin: 0 }}>Try adjusting your filters or add a new lead</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#050505" }}>
                    <tr>
                      <th style={{ ...s.th, width: "40px" }}></th>
                      <th style={s.th}>Lead</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Source</th>
                      <th style={s.th}>Created</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => {
                      const isSelected = selectedIds.includes(lead._id);
                      return (
                        <tr
                          key={lead._id}
                          style={{ transition: "background 0.1s", backgroundColor: isSelected ? "#0d0d0d" : "transparent" }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "#0a0a0a"; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <td style={{ ...s.td, width: "40px" }}>
                            <button onClick={() => toggleSelect(lead._id)} style={{ background: "none", border: "none", color: isSelected ? "#fff" : "#333", cursor: "pointer", display: "flex", padding: "2px" }}>
                              {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                            </button>
                          </td>
                          <td style={s.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "30px", height: "30px", backgroundColor: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: "10px", fontWeight: "600", color: "#888" }}>{getInitials(lead.name)}</span>
                              </div>
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: "500", color: "#fff", margin: 0 }}>{lead.name}</p>
                                <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}>
                            <span style={{ ...s.badge, ...getBadgeStyle(lead.status) }}>{lead.status}</span>
                          </td>
                          <td style={s.td}>
                            <span style={{ ...s.badge, backgroundColor: "#111", color: "#666", border: "1px solid #1e1e1e" }}>{lead.source}</span>
                          </td>
                          <td style={{ ...s.td, color: "#444", fontSize: "12px" }}>{formatDate(lead.createdAt)}</td>
                          <td style={{ ...s.td, textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}>
                              <button onClick={() => { setViewLead(lead); setLeadAnalysis(null); setActivity([]); loadActivity(lead._id); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "5px", borderRadius: "5px" }}>
                                <Eye size={14} />
                              </button>
                              <button onClick={() => setEditLead(lead)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "5px", borderRadius: "5px" }}>
                                <Edit2 size={14} />
                              </button>
                              {isAdmin && (
                                <button onClick={() => setDeleteId(lead._id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "5px", borderRadius: "5px" }}>
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "12px", color: "#444" }}>
                  Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => setFilters(p => ({ ...p, page: p.page! - 1 }))} disabled={!meta.hasPrevPage} style={{ ...s.btnGhost, padding: "5px 9px" }}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setFilters(prev => ({ ...prev, page: p }))} style={{
                      width: "30px", height: "30px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
                      backgroundColor: p === meta.page ? "#ffffff" : "transparent",
                      color: p === meta.page ? "#000000" : "#444444",
                    }}>{p}</button>
                  ))}
                  <button onClick={() => setFilters(p => ({ ...p, page: p.page! + 1 }))} disabled={!meta.hasNextPage} style={{ ...s.btnGhost, padding: "5px 9px" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── CREATE MODAL ─────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>Add New Lead</h2>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(handleCreate)}>
              <LeadFormFields />
              <div style={{ padding: "0 24px 24px" }}>
                <button type="submit" disabled={isSubmitting} style={{ ...s.btn, width: "100%", justifyContent: "center", padding: "11px" }}>
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT MODAL ───────────────────────────────────────────────────────── */}
      {editLead && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditLead(null); }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>Edit Lead</h2>
              <button onClick={() => setEditLead(null)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(handleUpdate)}>
              <LeadFormFields />
              <div style={{ padding: "0 24px 24px" }}>
                <button type="submit" disabled={isSubmitting} style={{ ...s.btn, width: "100%", justifyContent: "center", padding: "11px" }}>
                  {isSubmitting ? "Updating..." : "Update Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VIEW MODAL ───────────────────────────────────────────────────────── */}
      {viewLead && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) { setViewLead(null); setLeadAnalysis(null); } }}>
          <div style={{ ...s.modal, maxWidth: "560px" }}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>Lead Details</h2>
              <button onClick={() => { setViewLead(null); setLeadAnalysis(null); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column" as const, gap: "14px" }}>

              {/* Lead Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{getInitials(viewLead.name)}</span>
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>{viewLead.name}</p>
                  <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>{viewLead.email}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "12px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#444", margin: "0 0 6px" }}>Status</p>
                  <span style={{ ...s.badge, ...getBadgeStyle(viewLead.status) }}>{viewLead.status}</span>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#444", margin: "0 0 6px" }}>Source</p>
                  <span style={{ ...s.badge, backgroundColor: "#111", color: "#666", border: "1px solid #1e1e1e" }}>{viewLead.source}</span>
                </div>
              </div>

              {viewLead.notes && (
                <div style={{ padding: "12px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#444", margin: "0 0 6px" }}>Notes</p>
                  <p style={{ fontSize: "13px", color: "#888", margin: 0, lineHeight: "1.5" }}>{viewLead.notes}</p>
                </div>
              )}

              {/* Activity Timeline */}
              <div style={{ padding: "14px", backgroundColor: "#0a0a0a", border: "1px solid #141414", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  <Activity size={13} color="#555" />
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>Activity Timeline</span>
                </div>
                {activityLoading ? (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px" }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: "36px", backgroundColor: "#111", borderRadius: "6px" }} />)}
                  </div>
                ) : activity.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#333", margin: 0 }}>No activity recorded yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "0" }}>
                    {activity.map((item, i) => (
                      <div key={item._id} style={{ display: "flex", gap: "12px", paddingBottom: i < activity.length - 1 ? "12px" : "0" }}>
                        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#333", marginTop: "4px" }} />
                          {i < activity.length - 1 && <div style={{ width: "1px", flex: 1, backgroundColor: "#1a1a1a", marginTop: "4px" }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontSize: "12px", fontWeight: "500", color: "#aaa", margin: 0 }}>{item.action}</p>
                            <span style={{ fontSize: "11px", color: "#333" }}>{formatDate(item.createdAt)}</span>
                          </div>
                          {item.newValue && (
                            <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>
                              {item.oldValue && <span style={{ color: "#333" }}>{item.oldValue} → </span>}
                              {item.newValue}
                            </p>
                          )}
                          <p style={{ fontSize: "11px", color: "#333", margin: "2px 0 0" }}>by {item.userName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              <div style={{ padding: "14px", backgroundColor: "#0a0a0a", border: "1px solid #141414", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: leadAnalysis ? "14px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={13} color="#555" />
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>AI Analysis</span>
                  </div>
                  <button onClick={analyzeViewLead} disabled={leadAnalysisLoading} style={{ ...s.btnGhost, padding: "5px 10px", fontSize: "12px" }}>
                    {leadAnalysisLoading ? <Loader2 size={12} /> : <Sparkles size={12} />}
                    {leadAnalysis ? "Re-analyze" : "Analyze"}
                  </button>
                </div>
                {leadAnalysisLoading && (
                  <p style={{ fontSize: "13px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={12} /> Analyzing...
                  </p>
                )}
                {leadAnalysis && !leadAnalysisLoading && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "11px", color: "#444" }}>Score</span>
                      <span style={{ fontSize: "22px", fontWeight: "700", color: "#fff" }}>{leadAnalysis.score}</span>
                      <span style={{ fontSize: "12px", color: "#333" }}>/10</span>
                      <div style={{ flex: 1, backgroundColor: "#141414", borderRadius: "4px", height: "3px" }}>
                        <div style={{ width: `${leadAnalysis.score * 10}%`, backgroundColor: "#fff", borderRadius: "4px", height: "3px" }} />
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", margin: 0 }}>{leadAnalysis.summary}</p>
                    <div style={{ padding: "10px 12px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
                      <p style={{ fontSize: "11px", color: "#444", margin: "0 0 4px" }}>Next Action</p>
                      <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>{leadAnalysis.suggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE MODAL ─────────────────────────────────────────────────────── */}
      {deleteId && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div style={{ ...s.modal, maxWidth: "360px" }}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>Delete Lead</h2>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: "1.6" }}>
                This action cannot be undone. The lead and all its activity will be permanently deleted.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setDeleteId(null)} style={{ ...s.btnGhost, flex: 1, justifyContent: "center" }}>Cancel</button>
                <button onClick={handleDelete} disabled={deleteLead.isPending} style={{ ...s.btnDanger, flex: 1 }}>
                  {deleteLead.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK AI MODAL ────────────────────────────────────────────────────── */}
      {showBulkModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) { setShowBulkModal(false); setSelectedIds([]); } }}>
          <div style={{ ...s.modal, maxWidth: "520px" }}>
            <div style={s.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={15} color="#fff" />
                <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>AI Bulk Analysis</h2>
              </div>
              <button onClick={() => { setShowBulkModal(false); setSelectedIds([]); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              {bulkLoading ? (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Loader2 size={14} color="#fff" />
                    <span style={{ fontSize: "13px", color: "#666" }}>Analyzing {selectedIds.length} leads...</span>
                  </div>
                  {Array.from({ length: selectedIds.length }).map((_, i) => (
                    <div key={i} style={{ height: "64px", backgroundColor: "#111", borderRadius: "8px" }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                  {bulkResults.map(result => (
                    <div key={result.leadId} style={{ padding: "14px", backgroundColor: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: "#fff", margin: 0 }}>{result.name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{result.score}</span>
                          <span style={{ fontSize: "11px", color: "#444" }}>/10</span>
                        </div>
                      </div>
                      <div style={{ backgroundColor: "#1a1a1a", borderRadius: "3px", height: "3px", marginBottom: "10px" }}>
                        <div style={{ width: `${result.score * 10}%`, backgroundColor: "#fff", borderRadius: "3px", height: "3px" }} />
                      </div>
                      <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: "1.5" }}>{result.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function getBadgeStyle(status: LeadStatus) {
  const styles: Record<LeadStatus, { backgroundColor: string; color: string; border: string }> = {
    [LeadStatus.NEW]: { backgroundColor: "#0f0f1a", color: "#818cf8", border: "1px solid #1e1e3a" },
    [LeadStatus.CONTACTED]: { backgroundColor: "#0a1a0a", color: "#4ade80", border: "1px solid #1a331a" },
    [LeadStatus.QUALIFIED]: { backgroundColor: "#1a150a", color: "#fbbf24", border: "1px solid #332a0f" },
    [LeadStatus.LOST]: { backgroundColor: "#1a0a0a", color: "#f87171", border: "1px solid #331515" },
  };
  return styles[status] || { backgroundColor: "#111", color: "#666", border: "1px solid #222" };
}