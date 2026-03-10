"use client";

import { useState, useMemo } from "react";
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import type {
  CustodianFormRule,
  Custodian,
  TransactionType,
  RegistrationType,
} from "@/lib/types";
import { CUSTODIAN_FORM_RULES } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { CustodianBadge, EndpointsCell, EmptyState } from "./shared";
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

export function CustodianFormsTab() {
  const [rules, setRules] = useState<CustodianFormRule[]>(CUSTODIAN_FORM_RULES);
  const [search, setSearch] = useState("");
  const [filterCustodian, setFilterCustodian] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterReg, setFilterReg] = useState<string>("all");
  const [filterEndpoint, setFilterEndpoint] = useState<string>("all");

  // Rules modal state (unified add/edit modal)
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [rulesModalTarget, setRulesModalTarget] = useState<CustodianFormRule | null>(null);
  const [rulesModalMode, setRulesModalMode] = useState<"add" | "edit">("edit");

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

  const handleRulesSave = (id: string | null, data: {
    displayConditionJson: string;
    payloadTemplateJson: string;
    eSignatureMappingJson: string;
    endpoints: import("@/lib/types").EndpointConfig[];
    formDetails?: {
      custodian: import("@/lib/types").Custodian;
      transactionType: import("@/lib/types").TransactionType;
      registrationType: import("@/lib/types").RegistrationType;
      formTemplateId: string;
      formTemplateName: string;
    };
  }) => {
    if (id) {
      // Editing existing rule
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...(data.formDetails ? {
                  custodian: data.formDetails.custodian,
                  transactionType: data.formDetails.transactionType,
                  registrationType: data.formDetails.registrationType,
                  formTemplateId: data.formDetails.formTemplateId,
                  formTemplateName: data.formDetails.formTemplateName,
                } : {}),
                rulesJson: data.displayConditionJson,
                payloadTemplateJson: data.payloadTemplateJson,
                eSignatureMappingJson: data.eSignatureMappingJson,
                endpoints: data.endpoints,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    } else if (data.formDetails) {
      // Adding new rule
      const newRule: CustodianFormRule = {
        id: `cfr-${Date.now()}`,
        custodian: data.formDetails.custodian,
        transactionType: data.formDetails.transactionType,
        registrationType: data.formDetails.registrationType,
        formTemplateId: data.formDetails.formTemplateId,
        formTemplateName: data.formDetails.formTemplateName,
        rulesJson: data.displayConditionJson,
        payloadTemplateJson: data.payloadTemplateJson,
        eSignatureMappingJson: data.eSignatureMappingJson,
        endpoints: data.endpoints,
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
      setRules((prev) => [newRule, ...prev]);
    }
    setAddDialogOpen(false);
    setEditingRule(null);
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

  const renderSort = (field: keyof CustodianFormRule, label: string) => (
    <SortHeader label={label} active={sortField === field} onClick={() => toggleSort(field)} />
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none"
            />
          </div>

          <Select value={filterCustodian} onValueChange={(v) => { setFilterCustodian(v); resetPage(); }}>
            <SelectTrigger className="w-[140px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
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
            <SelectTrigger className="w-[160px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
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
            <SelectTrigger className="w-[150px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
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
            <SelectTrigger className="w-[150px] h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
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
            setRulesModalMode("add");
            // Start with blank form details; RulesModal will collect them
            setRulesModalTarget({
              id: "",
              custodian: "Fidelity" as Custodian,
              transactionType: "New account" as TransactionType,
              registrationType: "Individual" as RegistrationType,
              formTemplateId: "",
              formTemplateName: "",
              rulesJson: JSON.stringify({ conditions: [] }, null, 2),
              payloadTemplateJson: JSON.stringify({}, null, 2),
              eSignatureMappingJson: JSON.stringify({}, null, 2),
              endpoints: [],
              enabled: true,
              updatedAt: new Date().toISOString(),
            });
            setRulesModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0">
      {filtered.length === 0 ? (
        <EmptyState
          title="No custodian form rules"
          description="Rules define which forms to render based on account configuration. Add your first rule to get started."
          actionLabel="Add"
          onAction={() => {
            setRulesModalMode("add");
            setRulesModalTarget({
              id: "",
              custodian: "Fidelity" as Custodian,
              transactionType: "New account" as TransactionType,
              registrationType: "Individual" as RegistrationType,
              formTemplateId: "",
              formTemplateName: "",
              rulesJson: JSON.stringify({ conditions: [] }, null, 2),
              payloadTemplateJson: JSON.stringify({}, null, 2),
              eSignatureMappingJson: JSON.stringify({}, null, 2),
              endpoints: [],
              enabled: true,
              updatedAt: new Date().toISOString(),
            });
            setRulesModalOpen(true);
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setRulesModalMode("edit");
                          setRulesModalTarget(rule);
                          setRulesModalOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
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
                          <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Rules Modal - Used for both adding and editing rules */}
      {rulesModalOpen && rulesModalTarget && (
        <RulesModal
          open={rulesModalOpen}
          onOpenChange={(o) => {
            setRulesModalOpen(o);
            if (!o) {
              setRulesModalTarget(null);
            }
          }}
          title={rulesModalMode === "add" ? "Add Form Rule" : (rulesModalTarget.formTemplateName || "Form")}
          displayConditionJson={rulesModalTarget.rulesJson ?? JSON.stringify({ conditions: [] }, null, 2)}
          payloadTemplateJson={rulesModalTarget.payloadTemplateJson ?? "{}"}
          eSignatureMappingJson={rulesModalTarget.eSignatureMappingJson ?? "{}"}
          endpoints={rulesModalTarget.endpoints ?? [{ id: "ep-quik", name: "Quik PDF", type: "quik_pdf", endpointUsage: "pdf" as const }]}
          mode={rulesModalMode}
          formDetails={{
            custodian: rulesModalMode === "add" ? "" : rulesModalTarget.custodian,
            transactionType: rulesModalMode === "add" ? "" : rulesModalTarget.transactionType,
            registrationType: rulesModalMode === "add" ? "" : rulesModalTarget.registrationType,
            formTemplateId: rulesModalMode === "add" ? "" : rulesModalTarget.formTemplateId,
          }}
          onSave={(data) => handleRulesSave(rulesModalMode === "add" ? null : rulesModalTarget.id, data)}
        />
      )}
    </div>
  );
}

