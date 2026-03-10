"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
  Braces,
  Info,
} from "lucide-react";
import type {
  ClientFormRule,
  ClientOrg,
  ClientFormType,
  RoleType,
} from "@/lib/types";
import { CLIENT_FORM_RULES } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { TablePagination } from "./table-pagination";

const PAGE_SIZE = 10;

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className="group/sort flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3 transition-opacity", active ? "opacity-100" : "opacity-0 group-hover/sort:opacity-100")} />
    </button>
  );
}

import { ClientOrgBadge, RoleTypeBadge, RulesCell, EmptyState } from "./shared";
import { RulesModal } from "./rules-modal";

const CLIENT_ORGS: ClientOrg[] = ["Guardian", "Park Avenue", "Mercer"];
const FORM_TYPES: ClientFormType[] = ["PDF", "Disclosure", "Signature addendum", "Supplemental"];
const ROLE_TYPES: RoleType[] = ["per_account", "per_person", "per_distinct_owner", "per_signer", "global"];

export function ClientFormsTab() {
  const [rules, setRules] = useState<ClientFormRule[]>(CLIENT_FORM_RULES);
  const [search, setSearch] = useState("");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [filterFormType, setFilterFormType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [rulesModalTarget, setRulesModalTarget] = useState<string | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ClientFormRule | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState<keyof ClientFormRule>("clientOrg");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = rules;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.formName.toLowerCase().includes(q) ||
          r.clientOrg.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.formType.toLowerCase().includes(q)
      );
    }
    if (filterOrg !== "all") result = result.filter((r) => r.clientOrg === filterOrg);
    if (filterFormType !== "all") result = result.filter((r) => r.formType === filterFormType);
    if (filterRole !== "all") result = result.filter((r) => r.roleType === filterRole);

    result.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rules, search, filterOrg, filterFormType, filterRole, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const resetPage = () => setCurrentPage(1);

  const toggleSort = (field: keyof ClientFormRule) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleRulesSave = (id: string, data: {
    displayConditionJson: string;
    eSignatureMappingJson: string;
    endpoints: import("@/lib/types").EndpointConfig[];
  }) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              rulesJson: data.displayConditionJson,
              eSignatureMappingJson: data.eSignatureMappingJson,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleDelete = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  const handleDuplicate = (rule: ClientFormRule) => {
    const dup: ClientFormRule = {
      ...rule,
      id: `clf-${Date.now()}`,
      formName: `${rule.formName} (copy)`,
      updatedAt: new Date().toISOString(),
    };
    setRules((prev) => [dup, ...prev]);
  };

  const handleAddOrEditSave = (rule: ClientFormRule) => {
    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    } else {
      setRules((prev) => [rule, ...prev]);
    }
    setAddDialogOpen(false);
    setEditingRule(null);
  };

  const renderSort = (field: keyof ClientFormRule, label: string) => (
    <SortHeader label={label} active={sortField === field} onClick={() => toggleSort(field)} />
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none"
            />
          </div>

          <Select value={filterOrg} onValueChange={(v) => { setFilterOrg(v); resetPage(); }}>
            <SelectTrigger className="w-[140px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {CLIENT_ORGS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterFormType} onValueChange={(v) => { setFilterFormType(v); resetPage(); }}>
            <SelectTrigger className="w-[160px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
              <SelectValue placeholder="Form type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {FORM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); resetPage(); }}>
            <SelectTrigger className="w-[170px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
              <SelectValue placeholder="Role type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All role types</SelectItem>
              {ROLE_TYPES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          onClick={() => { setEditingRule(null); setAddDialogOpen(true); }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add form
        </Button>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
      {filtered.length === 0 ? (
        <EmptyState
          title="No client form rules"
          description="Client forms define disclosures and PDFs to include in envelopes. Add your first form to get started."
          actionLabel="Add form"
          onAction={() => { setEditingRule(null); setAddDialogOpen(true); }}
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">{renderSort("clientOrg", "Client")}</TableHead>
                <TableHead>{renderSort("formName", "Form name")}</TableHead>
                <TableHead className="w-[120px]">{renderSort("formType", "Type")}</TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        Controls how many instances of this form are generated per envelope (e.g., one per account vs one per distinct owner).
                      </TooltipContent>
                    </Tooltip>
                    {renderSort("roleType", "Role type")}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Rules</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell><ClientOrgBadge org={rule.clientOrg} /></TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm font-medium">{rule.formName}</span>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{rule.formType}</span>
                  </TableCell>
                  <TableCell><RoleTypeBadge roleType={rule.roleType} /></TableCell>
                  <TableCell>
                    <RulesCell
                      hasRules={rule.rulesJson !== "{}"}
                      onClick={() => {
                        setRulesModalTarget(rule.id);
                        setRulesModalOpen(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingRule(rule); setAddDialogOpen(true); }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setRulesModalTarget(rule.id); setRulesModalOpen(true); }}>
                          <Braces className="h-4 w-4 mr-2" />
                          Edit rules
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(rule)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-auto shrink-0">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </div>
      </div>

      {/* Rules Modal */}
      {rulesModalTarget && (() => {
        const targetRule = rules.find((r) => r.id === rulesModalTarget);
        return (
          <RulesModal
            open={rulesModalOpen}
            onOpenChange={setRulesModalOpen}
            title={`${targetRule?.formName ?? "Form"}`}
            displayConditionJson={targetRule?.rulesJson ?? "{}"}
            eSignatureMappingJson={targetRule?.eSignatureMappingJson ?? "{}"}
            endpoints={[{ id: "ep-quik", name: "Quik PDF", type: "quik_pdf" as const, tag: "pdf" as const, payloadTemplateJson: "{}" }]}
            onSave={(data) => handleRulesSave(rulesModalTarget, data)}
          />
        );
      })()}

      {/* Add / Edit Dialog */}
      <AddEditClientDialog
        open={addDialogOpen}
        onOpenChange={(o) => { setAddDialogOpen(o); if (!o) setEditingRule(null); }}
        initial={editingRule}
        onSave={handleAddOrEditSave}
      />
    </div>
  );
}

// ─── Add / Edit Dialog ───────────────────────────────────────────────

function AddEditClientDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ClientFormRule | null;
  onSave: (rule: ClientFormRule) => void;
}) {
  const isEdit = !!initial;
  const [clientOrg, setClientOrg] = useState<ClientOrg | "">(initial?.clientOrg ?? "");
  const [formType, setFormType] = useState<ClientFormType | "">(initial?.formType ?? "");
  const [roleType, setRoleType] = useState<RoleType | "">(initial?.roleType ?? "");
  const [formName, setFormName] = useState(initial?.formName ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  useEffect(() => {
    if (open) {
      setClientOrg(initial?.clientOrg ?? "");
      setFormType(initial?.formType ?? "");
      setRoleType(initial?.roleType ?? "");
      setFormName(initial?.formName ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open, initial]);

  const allConditionsFilled = !!clientOrg && !!formType && !!roleType;
  const canSave = allConditionsFilled && !!formName;

  const handleSave = () => {
    if (!canSave) return;
    const rule: ClientFormRule = {
      id: initial?.id ?? `clf-${Date.now()}`,
      clientOrg: clientOrg as ClientOrg,
      formName: formName || "Untitled form",
      formType: formType as ClientFormType,
      roleType: roleType as RoleType,
      rulesJson: initial?.rulesJson ?? JSON.stringify({ conditions: [] }, null, 2),
      eSignatureMappingJson: initial?.eSignatureMappingJson ?? JSON.stringify({}, null, 2),
      description,
      enabled: initial?.enabled ?? true,
      updatedAt: new Date().toISOString(),
    };
    onSave(rule);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[460px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} client form</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground shrink-0 w-[100px]"><span>Form name<span className="text-foreground">*</span></span></Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Guardian Privacy Notice"
              className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none"
            />
          </div>

          <div className="flex items-start gap-2">
            <Label className="text-muted-foreground shrink-0 w-[100px] mt-2">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of when this form is included..."
              rows={2}
              className="flex-1 resize-none bg-[rgba(105,105,105,0.051)] border-none shadow-none"
            />
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <Label className="text-muted-foreground shrink-0 w-[100px]"><span>Client org<span className="text-foreground">*</span></span></Label>
            <Select value={clientOrg} onValueChange={(v) => setClientOrg(v as ClientOrg)}>
              <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {CLIENT_ORGS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientOrg && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <Label className="text-muted-foreground shrink-0 w-[100px]"><span>Form type<span className="text-foreground">*</span></span></Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as ClientFormType)}>
                <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {FORM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {clientOrg && formType && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <Label className="text-muted-foreground shrink-0 w-[100px]"><span>Role type<span className="text-foreground">*</span></span></Label>
              <Select value={roleType} onValueChange={(v) => setRoleType(v as RoleType)}>
                <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {ROLE_TYPES.map((r) => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>{isEdit ? "Save changes" : "Add form"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
