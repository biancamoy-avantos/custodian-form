"use client";

import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Custodian, ClientOrg, RoleType, EndpointConfig } from "@/lib/types";

// ─── Custodian Badge ─────────────────────────────────────────────────

const CUSTODIAN_COLORS: Record<Custodian, string> = {
  Fidelity: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Schwab: "bg-blue-50 text-blue-700 border-blue-200",
  Pershing: "bg-violet-50 text-violet-700 border-violet-200",
};

export function CustodianBadge({ custodian }: { custodian: Custodian }) {
  return (
    <Badge variant="outline" className={`font-medium ${CUSTODIAN_COLORS[custodian]}`}>
      {custodian}
    </Badge>
  );
}

// ─── Client Org Badge ────────────────────────────────────────────────

const CLIENT_ORG_COLORS: Record<ClientOrg, string> = {
  Guardian: "bg-amber-50 text-amber-700 border-amber-200",
  "Park Avenue": "bg-rose-50 text-rose-700 border-rose-200",
  Mercer: "bg-sky-50 text-sky-700 border-sky-200",
};

export function ClientOrgBadge({ org }: { org: ClientOrg }) {
  return (
    <Badge variant="outline" className={`font-medium ${CLIENT_ORG_COLORS[org]}`}>
      {org}
    </Badge>
  );
}

// ─── Role Type Badge ─────────────────────────────────────────────────

const ROLE_LABELS: Record<RoleType, string> = {
  per_account: "Per account",
  per_person: "Per person",
  per_distinct_owner: "Per distinct owner",
  per_signer: "Per signer",
  global: "Global",
};

export function RoleTypeBadge({ roleType }: { roleType: RoleType }) {
  return (
    <Badge variant="secondary" className="font-mono text-xs">
      {ROLE_LABELS[roleType]}
    </Badge>
  );
}

// ─── Enabled/Disabled Badge ──────────────────────────────────────────

export function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
      Disabled
    </Badge>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      </div>
      <Button size="sm" onClick={onAction}>
        <Plus className="h-4 w-4 mr-1" />
        {actionLabel}
      </Button>
    </div>
  );
}

// ─── Endpoints Cell ──────────────────────────────────────────────────

export function EndpointsCell({ endpoints }: { endpoints: EndpointConfig[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {endpoints.map((ep) => (
        <Badge
          key={ep.id}
          variant="outline"
          className={`text-[10px] font-normal ${
            ep.endpointUsage === "pdf"
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-amber-50 text-amber-600 border-amber-200"
          }`}
        >
          {ep.name}
        </Badge>
      ))}
    </div>
  );
}

// ─── Rules Cell Button ───────────────────────────────────────────────

export function RulesCell({ onClick, hasRules }: { onClick: () => void; hasRules: boolean }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background hover:bg-muted/50 transition-colors border border-border"
    >
      {hasRules ? "View rules" : "Add rules"}
    </button>
  );
}
