"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lead, LeadStatus, LeadSource } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  status: z.nativeEnum(LeadStatus),
  source: z.nativeEnum(LeadSource),
  notes: z.string().max(500).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading: boolean;
}

export function LeadForm({ lead, onSubmit, isLoading }: LeadFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email,
        status: lead.status,
        source: lead.source,
        notes: lead.notes || "",
      });
    }
  }, [lead, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          error={errors.status?.message}
          options={Object.values(LeadStatus).map((s) => ({ value: s, label: s }))}
          {...register("status")}
        />
        <Select
          label="Source"
          error={errors.source?.message}
          options={Object.values(LeadSource).map((s) => ({ value: s, label: s }))}
          {...register("source")}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Notes (optional)</label>
        <textarea
          placeholder="Add any notes about this lead..."
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 resize-none"
          {...register("notes")}
        />
        {errors.notes && <p className="text-xs text-red-400">{errors.notes.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {lead ? "Update Lead" : "Create Lead"}
      </Button>
    </form>
  );
}