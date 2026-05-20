"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Zap, LogOut, User, Users, UserPlus, TrendingUp, XCircle, Search, Download, SlidersHorizontal, Edit2, Trash2, Eye, Sparkles, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLeads, useLeadStats, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { LeadFilters, LeadStatus, LeadSource, Lead, UserRole } from "@/types";
import { leadsService } from "@/services/leads.service";
import { aiService, LeadAnalysis } from "@/services/ai.service";
import { getStatusColor, getSourceColor, getInitials, formatDate } from "@/lib/utils";
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
  page: { minHeight: "100vh", backgroundColor: "#000000", fontFamily: "system-ui, sans-serif" },
  navbar: { position: "sticky" as const, top: 0, zIndex: 40, borderBottom: "1px solid #1a1a1a", backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" },
  navInner: { maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" },
  logo: { display: "flex", alignItems: "center", gap: "8px" },
  logoIcon: { width: "30px", height: "30px", backgroundColor: "#ffffff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" },
  card: { backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" },
  statCard: { backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px", cursor: "default" },
  input: { width: "100%", backgroundColor: "#111111", border: "1px solid #333333", borderRadius: "8px", padding: "9px 14px", fontSize: "14px", color: "#ffffff", outline: "none", boxSizing: "border-box" as const },
  select: { backgroundColor: "#111111", border: "1px solid #333333", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#aaaaaa", outline: "none", cursor: "pointer" },
  btn: { backgroundColor: "#ffffff", color: "#000000", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "600" as const, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnGhost: { backgroundColor: "transparent", color: "#666666", border: "1px solid #222222", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnDanger: { backgroundColor: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "600" as const, cursor: "pointer" },
  label: { display: "block", fontSize: "13px", fontWeight: "500" as const, color: "#aaaaaa", marginBottom: "6px" },
  overlay: { position: "fixed" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#0a0a0a", border: "1px solid #222222", borderRadius: "16px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1a1a1a" },
  badge: { display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" as const },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { textAlign: "left" as const, padding: "12px 16px", fontSize: "11px", fontWeight: "500" as const, color: "#555555", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #1a1a1a" },
  td: { padding: "14px 16px", borderBottom: "1px solid #0f0f0f", fontSize: "14px" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [filters, setFilters] = useState<LeadFilters>({ page: 1, limit: 10, sort: "latest", status: "", source: "", search: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [leadAnalysis, setLeadAnalysis] = useState<LeadAnalysis | null>(null);
  const [leadAnalysisLoading, setLeadAnalysisLoading] = useState(false);

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

  const isAdmin = user?.role === UserRole.ADMIN;
  const leads = data?.leads || [];
  const meta = data?.meta;

  const statConfig = [
    { key: "total", label: "Total Leads", icon: Users, value: stats?.total ?? 0 },
    { key: "New", label: "New", icon: UserPlus, value: stats?.New ?? 0 },
    { key: "Qualified", label: "Qualified", icon: TrendingUp, value: stats?.Qualified ?? 0 },
    { key: "Lost", label: "Lost", icon: XCircle, value: stats?.Lost ?? 0 },
  ];

  const inputStyle = (hasError?: boolean) => ({
    ...s.input,
    border: `1px solid ${hasError ? "#ef4444" : "#333333"}`,
  });

  if (authLoading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const LeadFormFields = () => (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
        <textarea style={{ ...s.input, resize: "none", height: "80px" }} placeholder="Add notes..." {...register("notes")} />
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Navbar */}
      <header style={s.navbar}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}><Zap size={18} color="#000" /></div>
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>GigFlow</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px" }}>
              <div style={{ width: "24px", height: "24px", backgroundColor: "#222", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={12} color="#aaa" />
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "500", color: "#fff", margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: "11px", color: "#555", margin: 0, textTransform: "capitalize" }}>{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} style={{ ...s.btnGhost, padding: "6px 12px", color: "#666" }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#fff", margin: 0 }}>Leads Pipeline</h1>
            <p style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>Track and manage your sales leads</p>
          </div>
          <button onClick={() => { setIsCreateOpen(true); reset(); }} style={s.btn}>
            <Plus size={16} /> Add Lead
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {statConfig.map(({ label, icon: Icon, value }) => (
            <div key={label} style={s.statCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{label}</p>
                <div style={{ width: "28px", height: "28px", backgroundColor: "#161616", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color="#666" />
                </div>
              </div>
              {statsLoading
                ? <div style={{ height: "32px", backgroundColor: "#161616", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
                : <p style={{ fontSize: "28px", fontWeight: "600", color: "#fff", margin: 0 }}>{value}</p>
              }
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div style={{ ...s.card, marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", backgroundColor: "#161616", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>AI Pipeline Insight</span>
            </div>
            <button onClick={loadInsight} disabled={aiInsightLoading} style={{ ...s.btnGhost, padding: "6px 12px", fontSize: "12px" }}>
              {aiInsightLoading ? <Loader2 size={13} /> : <Sparkles size={13} />}
              {aiInsight ? "Refresh" : "Analyze"}
            </button>
          </div>
          {aiInsight && (
            <p style={{ fontSize: "14px", color: "#aaa", marginTop: "12px", lineHeight: "1.6" }}>{aiInsight}</p>
          )}
          {!aiInsight && !aiInsightLoading && (
            <p style={{ fontSize: "13px", color: "#333", marginTop: "8px" }}>Click analyze to get AI-powered insights about your pipeline.</p>
          )}
        </div>

        {/* Filters */}
        <div style={{ ...s.card, marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} color="#555" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{ ...s.input, paddingLeft: "36px" }}
              />
            </div>
            <button onClick={handleExport} style={s.btnGhost}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const }}>
            <SlidersHorizontal size={14} color="#555" />
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
            <span style={{ fontSize: "12px", color: "#444", marginLeft: "auto" }}>{meta?.total ?? 0} results</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
          {leadsLoading ? (
            <div style={{ padding: "48px", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: "48px", backgroundColor: "#111", borderRadius: "8px" }} />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: "80px 24px", textAlign: "center" as const }}>
              <Eye size={32} color="#333" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#555", fontSize: "15px", marginBottom: "4px" }}>No leads found</p>
              <p style={{ color: "#333", fontSize: "13px" }}>Try adjusting your filters or add a new lead</p>
            </div>
          ) : (
            <table style={s.table}>
              <thead style={{ backgroundColor: "#060606" }}>
                <tr>
                  <th style={s.th}>Lead</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Source</th>
                  <th style={s.th}>Created</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id} style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f0f0f")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", backgroundColor: "#161616", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#aaa" }}>{getInitials(lead.name)}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "500", color: "#fff", margin: 0 }}>{lead.name}</p>
                          <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...getBadgeStyle(lead.status) }}>{lead.status}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: "#161616", color: "#888", border: "1px solid #222" }}>{lead.source}</span>
                    </td>
                    <td style={{ ...s.td, color: "#555", fontSize: "13px" }}>{formatDate(lead.createdAt)}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                        <button onClick={() => { setViewLead(lead); setLeadAnalysis(null); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "6px", borderRadius: "6px" }} title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setEditLead(lead)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "6px", borderRadius: "6px" }} title="Edit">
                          <Edit2 size={15} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteId(lead._id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "6px", borderRadius: "6px" }} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "13px", color: "#555" }}>
              Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setFilters(p => ({ ...p, page: p.page! - 1 }))} disabled={!meta.hasPrevPage} style={{ ...s.btnGhost, padding: "6px 10px" }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setFilters(prev => ({ ...prev, page: p }))} style={{
                  width: "32px", height: "32px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px",
                  backgroundColor: p === meta.page ? "#ffffff" : "transparent",
                  color: p === meta.page ? "#000000" : "#555555",
                }}>{p}</button>
              ))}
              <button onClick={() => setFilters(p => ({ ...p, page: p.page! + 1 }))} disabled={!meta.hasNextPage} style={{ ...s.btnGhost, padding: "6px 10px" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>Add New Lead</h2>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}><X size={18} /></button>
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

      {/* EDIT MODAL */}
      {editLead && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditLead(null); }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>Edit Lead</h2>
              <button onClick={() => setEditLead(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}><X size={18} /></button>
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

      {/* VIEW MODAL */}
      {viewLead && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) { setViewLead(null); setLeadAnalysis(null); } }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>Lead Details</h2>
              <button onClick={() => { setViewLead(null); setLeadAnalysis(null); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column" as const, gap: "16px" }}>
              {/* Lead Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", backgroundColor: "#161616", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{getInitials(viewLead.name)}</span>
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>{viewLead.name}</p>
                  <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>{viewLead.email}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "12px", backgroundColor: "#111", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px" }}>Status</p>
                  <span style={{ ...s.badge, ...getBadgeStyle(viewLead.status) }}>{viewLead.status}</span>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#111", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px" }}>Source</p>
                  <span style={{ ...s.badge, backgroundColor: "#161616", color: "#888", border: "1px solid #222" }}>{viewLead.source}</span>
                </div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#111", borderRadius: "8px" }}>
                <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px" }}>Created</p>
                <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>{formatDate(viewLead.createdAt)}</p>
              </div>
              {viewLead.notes && (
                <div style={{ padding: "12px", backgroundColor: "#111", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px" }}>Notes</p>
                  <p style={{ fontSize: "13px", color: "#aaa", margin: 0, lineHeight: "1.5" }}>{viewLead.notes}</p>
                </div>
              )}

              {/* AI Analysis */}
              <div style={{ padding: "16px", backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: leadAnalysis ? "16px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={14} color="#fff" />
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>AI Analysis</span>
                  </div>
                  <button onClick={analyzeViewLead} disabled={leadAnalysisLoading} style={{ ...s.btnGhost, padding: "5px 10px", fontSize: "12px" }}>
                    {leadAnalysisLoading ? <Loader2 size={12} /> : <Sparkles size={12} />}
                    {leadAnalysis ? "Re-analyze" : "Analyze"}
                  </button>
                </div>
                {leadAnalysisLoading && (
                  <p style={{ fontSize: "13px", color: "#444", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Loader2 size={13} /> Analyzing lead...
                  </p>
                )}
                {leadAnalysis && !leadAnalysisLoading && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#555" }}>Score</span>
                      <span style={{ fontSize: "24px", fontWeight: "700", color: "#fff" }}>{leadAnalysis.score}</span>
                      <span style={{ fontSize: "12px", color: "#444" }}>/10</span>
                      <div style={{ flex: 1, backgroundColor: "#1a1a1a", borderRadius: "4px", height: "4px" }}>
                        <div style={{ width: `${leadAnalysis.score * 10}%`, backgroundColor: "#fff", borderRadius: "4px", height: "4px", transition: "width 0.5s" }} />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>Summary</p>
                      <p style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6", margin: 0 }}>{leadAnalysis.summary}</p>
                    </div>
                    <div style={{ padding: "10px 12px", backgroundColor: "#111", borderRadius: "8px", border: "1px solid #222" }}>
                      <p style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>Suggested Action</p>
                      <p style={{ fontSize: "13px", color: "#fff", margin: 0 }}>{leadAnalysis.suggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div style={{ ...s.modal, maxWidth: "360px" }}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>Delete Lead</h2>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: "1.6" }}>
                Are you sure you want to delete this lead? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setDeleteId(null)} style={{ ...s.btnGhost, flex: 1, justifyContent: "center" }}>Cancel</button>
                <button onClick={handleDelete} disabled={deleteLead.isPending} style={{ ...s.btnDanger, flex: 1 }}>
                  {deleteLead.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getBadgeStyle(status: LeadStatus) {
  const styles: Record<LeadStatus, { backgroundColor: string; color: string; border: string }> = {
    [LeadStatus.NEW]: { backgroundColor: "#1a1a2e", color: "#818cf8", border: "1px solid #312e81" },
    [LeadStatus.CONTACTED]: { backgroundColor: "#1a2e1a", color: "#4ade80", border: "1px solid #166534" },
    [LeadStatus.QUALIFIED]: { backgroundColor: "#2e2a1a", color: "#fbbf24", border: "1px solid #92400e" },
    [LeadStatus.LOST]: { backgroundColor: "#2e1a1a", color: "#f87171", border: "1px solid #991b1b" },
  };
  return styles[status] || { backgroundColor: "#1a1a1a", color: "#888", border: "1px solid #333" };
}