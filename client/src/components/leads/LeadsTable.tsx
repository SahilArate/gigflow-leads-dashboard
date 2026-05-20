"use client";

import { useState } from "react";
import { Edit2, Trash2, ChevronUp, ChevronDown, Eye } from "lucide-react";
import { Lead, UserRole } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LeadForm } from "./LeadForm";
import { LeadDetail } from "./LeadDetail";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { getStatusColor, getSourceColor, getInitials, formatDate } from "@/lib/utils";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  const { user } = useAuth();
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleUpdate = async (data: any) => {
    if (!editLead) return;
    await updateLead.mutateAsync({ id: editLead._id, payload: data });
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  if (isLoading) return <TableSkeleton />;

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-xl">
        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-zinc-400 font-medium">No leads found</p>
        <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or create a new lead</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Lead</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Created</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-zinc-900/50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-zinc-300">
                        {getInitials(lead.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge className={getSourceColor(lead.source)}>
                    {lead.source}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-zinc-500">{formatDate(lead.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewLead(lead)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditLead(lead)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(lead._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editLead}
        onClose={() => setEditLead(null)}
        title="Edit Lead"
      >
        <LeadForm
          lead={editLead || undefined}
          onSubmit={handleUpdate}
          isLoading={updateLead.isPending}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewLead}
        onClose={() => setViewLead(null)}
        title="Lead Details"
      >
        {viewLead && <LeadDetail lead={viewLead} />}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Lead"
        size="sm"
      >
        <p className="text-zinc-400 text-sm mb-6">
          Are you sure you want to delete this lead? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setDeleteId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            isLoading={deleteLead.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}