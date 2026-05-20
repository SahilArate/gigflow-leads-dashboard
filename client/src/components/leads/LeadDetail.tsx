import { Lead } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { getStatusColor, getSourceColor, getInitials, formatDate } from "@/lib/utils";
import { Mail, Calendar, Tag, Globe, FileText } from "lucide-react";

interface LeadDetailProps {
  lead: Lead;
}

export function LeadDetail({ lead }: LeadDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{getInitials(lead.name)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
          <p className="text-sm text-zinc-500">{lead.email}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
          <Tag className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-400">Status</span>
          <Badge className={`ml-auto ${getStatusColor(lead.status)}`}>{lead.status}</Badge>
        </div>

        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
          <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-400">Source</span>
          <Badge className={`ml-auto ${getSourceColor(lead.source)}`}>{lead.source}</Badge>
        </div>

        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
          <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-400">Email</span>
          <span className="text-sm text-white ml-auto">{lead.email}</span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
          <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-400">Created</span>
          <span className="text-sm text-white ml-auto">{formatDate(lead.createdAt)}</span>
        </div>

        {lead.notes && (
          <div className="p-3 bg-zinc-900 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-sm text-zinc-400">Notes</span>
            </div>
            <p className="text-sm text-zinc-300 pl-7">{lead.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}