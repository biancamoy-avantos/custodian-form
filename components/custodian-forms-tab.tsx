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
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
  Braces,
} from "lucide-react";
import type {
  CustodianFormRule,
  Custodian,
  TransactionType,
  RegistrationType,
  GlobalEndpoint,
} from "@/lib/types";
import { CUSTODIAN_FORM_RULES, FORM_TEMPLATES } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { CustodianBadge, RulesCell, EndpointsCell, EmptyState } from "./shared";
import { RulesModal } from "./rules-modal";
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

const CUSTODIANS: Custodian[] = ["Fidelity", "Schwab", "Pershing"];
const TRANSACTION_TYPES: TransactionType[] = [
  "New account",
  "Money movement",
  "Transfer of assets",
  "Account maintenance",
];
const REGISTRATION_TYPES: RegistrationType[] = [
  "Individual",
  "Joint",
  "IRA",
  "Trust",
  "Entity",
  "Partnership",
];

export function CustodianFormsTab({ globalEndpoints = [] }: { globalEndpoints?: GlobalEndpoint[] }) {
  const [rules, setRules] = useState<CustodianFormRule[]>(CUSTODIAN_FORM_RULES);
  const [search, setSearch] = useState("");
  const [filterCustodian, setFilterCustodian] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterReg, setFilterReg] = useState<string>("all");
  const [filterEndpoint, setFilterEndpoint] = useState<string>("all");

  // Rules modal state
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [rulesModalTarget, setRulesModalTarget] = useState<string | null>(null);

  // Add/edit dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustodianFormRule | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState<keyof CustodianFormRule>("custodian");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = rules;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.formTemplateName.toLowerCase().includes(q) ||
          r.custodian.toLowerCase().includes(q) ||
          r.transactionType.toLowerCase().includes(q) ||
          r.registrationType.toLowerCase().includes(q)
      );
    }
    if (filterCustodian !== "all") {
      result = result.filter((r) => r.custodian === filterCustodian);
    }
    if (filterType !== "all") {
      result = result.filter((r) => r.transactionType === filterType);
    }
    if (filterReg !== "all") {
      result = result.filter((r) => r.registrationType === filterReg);
    }
    if (filterEndpoint !== "all") {
      result = result.filter((r) => r.endpoints.some((ep) => ep.type === filterEndpoint));
    }

    result.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rules, search, filterCustodian, filterType, filterReg, filterEndpoint, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  const toggleSort = (field: keyof CustodianFormRule) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleRulesSave = (id: string, data: {
    displayConditionJson: string;
    payloadTemplateJson: string;
    eSignatureMappingJson: string;
    endpoints: import("@/lib/types").EndpointConfig[];
  }) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              rulesJson: data.displayConditionJson,
              payloadTemplateJson: data.payloadTemplateJson,
              eSignatureMappingJson: data.eSignatureMappingJson,
              endpoints: data.endpoints,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDuplicate = (rule: CustodianFormRule) => {
    const dup: CustodianFormRule = {
      ...rule,
      id: `cfr-${Date.now()}`,
      formTemplateName: `${rule.formTemplateName} (copy)`,
      updatedAt: new Date().toISOString(),
    };
    setRules((prev) => [dup, ...prev]);
  };

  const handleAddOrEditSave = (rule: CustodianFormRule) => {
    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    } else {
      setRules((prev) => [rule, ...prev]);
    }
    setAddDialogOpen(false);
    setEditingRule(null);
  };

  const renderSort = (field: keyof CustodianFormRule, label: string) => (
    <SortHeader label={label} active={sortField === field} onClick={() => toggleSort(field)} />
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 h-9"
            />
          </div>

          <Select value={filterCustodian} onValueChange={(v) => { setFilterCustodian(v); resetPage(); }}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Custodian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All custodians</SelectItem>
              {CUSTODIANS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(v) => { setFilterType(v); resetPage(); }}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterReg} onValueChange={(v) => { setFilterReg(v); resetPage(); }}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Registration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All registrations</SelectItem>
              {REGISTRATION_TYPES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEndpoint} onValueChange={(v) => { setFilterEndpoint(v); resetPage(); }}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Endpoint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All endpoints</SelectItem>
              <SelectItem value="quik_pdf">Quik PDF</SelectItem>
              <SelectItem value="pershing_api">Pershing API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingRule(null);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add rule
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0">
      {filtered.length === 0 ? (
        <EmptyState
          title="No custodian form rules"
          description="Rules define which forms to render based on account configuration. Add your first rule to get started."
          actionLabel="Add rule"
          onAction={() => {
            setEditingRule(null);
            setAddDialogOpen(true);
          }}
        />
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">{renderSort("custodian", "Custodian")}</TableHead>
                <TableHead className="w-[140px]">{renderSort("transactionType", "Type")}</TableHead>
                <TableHead className="w-[120px]">{renderSort("registrationType", "Registration")}</TableHead>
                <TableHead>{renderSort("formTemplateName", "Form template")}</TableHead>
                <TableHead className="w-[140px]">Endpoints</TableHead>
                <TableHead className="w-[100px]">Rules</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell><CustodianBadge custodian={rule.custodian} /></TableCell>
                  <TableCell>
                    <span className="text-sm">{rule.transactionType}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {rule.registrationType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{rule.formTemplateName}</span>
                  </TableCell>
                  <TableCell>
                    <EndpointsCell endpoints={rule.endpoints} />
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => {
                          setEditingRule(rule);
                          setAddDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setRulesModalTarget(rule.id);
                          setRulesModalOpen(true);
                        }}>
                          <Braces className="h-4 w-4 mr-2" />
                          Edit rules
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(rule)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(rule.id)}
                        >
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
            title={`${targetRule?.formTemplateName ?? "Form"}`}
            displayConditionJson={targetRule?.rulesJson ?? "{}"}
            payloadTemplateJson={targetRule?.payloadTemplateJson ?? "{}"}
            eSignatureMappingJson={targetRule?.eSignatureMappingJson ?? "{}"}
            endpoints={targetRule?.endpoints ?? [{ id: "ep-quik", name: "Quik PDF", type: "quik_pdf", endpointUsage: "pdf" as const }]}
            globalEndpoints={globalEndpoints}
            onSave={(data) => handleRulesSave(rulesModalTarget, data)}
          />
        );
      })()}

      {/* Add / Edit Dialog */}
      <AddEditCustodianDialog
        open={addDialogOpen}
        onOpenChange={(o) => {
          setAddDialogOpen(o);
          if (!o) setEditingRule(null);
        }}
        initial={editingRule}
        onSave={handleAddOrEditSave}
      />
    </div>
  );
}

// ─── Add / Edit Dialog ───────────────────────────────────────────────

function AddEditCustodianDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CustodianFormRule | null;
  onSave: (rule: CustodianFormRule) => void;
}) {
  const isEdit = !!initial;
  const [custodian, setCustodian] = useState<Custodian | "">(initial?.custodian ?? "");
  const [transactionType, setTransactionType] = useState<TransactionType | "">(initial?.transactionType ?? "");
  const [registrationType, setRegistrationType] = useState<RegistrationType | "">(initial?.registrationType ?? "");
  const [formTemplateId, setFormTemplateId] = useState(initial?.formTemplateId ?? "");

  useEffect(() => {
    if (open) {
      setCustodian(initial?.custodian ?? "");
      setTransactionType(initial?.transactionType ?? "");
      setRegistrationType(initial?.registrationType ?? "");
      setFormTemplateId(initial?.formTemplateId ?? "");
    }
  }, [open, initial]);

  const selectedTemplate = FORM_TEMPLATES.find((t) => t.id === formTemplateId);

  const handleSave = () => {
    if (!custodian || !transactionType || !registrationType || !formTemplateId) return;
    const rule: CustodianFormRule = {
      id: initial?.id ?? `cfr-${Date.now()}`,
      custodian: custodian as Custodian,
      transactionType: transactionType as TransactionType,
      registrationType: registrationType as RegistrationType,
      formTemplateId: formTemplateId || "tmpl-unset",
      formTemplateName: selectedTemplate?.name ?? "Untitled form",
      rulesJson: initial?.rulesJson ?? JSON.stringify({ conditions: [] }, null, 2),
      payloadTemplateJson: initial?.payloadTemplateJson ?? JSON.stringify({}, null, 2),
      eSignatureMappingJson: initial?.eSignatureMappingJson ?? JSON.stringify({}, null, 2),
      endpoints: initial?.endpoints ?? [{ id: "ep-quik", name: "Quik PDF", type: "quik_pdf" as const, endpointUsage: "pdf" as const }],
      enabled: initial?.enabled ?? true,
      updatedAt: new Date().toISOString(),
    };
    onSave(rule);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[396px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} custodian form rule</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3 pl-1">
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <Label className="text-muted-foreground shrink-0 w-[100px]">Custodian is</Label>
                <Select value={custodian} onValueChange={(v) => setCustodian(v as Custodian)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {CUSTODIANS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {custodian && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <Label className="text-muted-foreground shrink-0 w-[100px]">Transaction is</Label>
                  <Select value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {custodian && transactionType && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <Label className="text-muted-foreground shrink-0 w-[100px]">Registration is</Label>
                  <Select value={registrationType} onValueChange={(v) => setRegistrationType(v as RegistrationType)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {REGISTRATION_TYPES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {custodian && transactionType && registrationType && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Then show</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="pl-1">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground shrink-0 w-[100px]">Form template</Label>
                  <Select value={formTemplateId} onValueChange={setFormTemplateId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select a template..." /></SelectTrigger>
                    <SelectContent>
                      {FORM_TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!custodian || !transactionType || !registrationType || !formTemplateId}>
            {isEdit ? "Save changes" : "Add rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
