"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Check,
  Braces,
  Workflow,
  Globe,
  Plus,
  ChevronLeft,
  ChevronDown,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import type { EndpointConfig, EndpointTag, Custodian, TransactionType, RegistrationType, CustodianFormRule } from "@/lib/types";
import { ENDPOINT_SERVICES, FORM_TEMPLATES } from "@/lib/sample-data";

type ModalTab = "form_details" | "display_condition" | "endpoints";

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

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  displayConditionJson: string;
  payloadTemplateJson: string;
  eSignatureMappingJson: string;
  endpoints: EndpointConfig[];
  // Form details for combined add/edit mode
  mode?: "add" | "edit" | "view";
  formDetails?: {
    custodian: Custodian | "";
    transactionType: TransactionType | "";
    registrationType: RegistrationType | "";
    formTemplateId: string;
  };
  onSave: (data: {
    displayConditionJson: string;
    payloadTemplateJson: string;
    eSignatureMappingJson: string;
    endpoints: EndpointConfig[];
    formDetails?: {
      custodian: Custodian;
      transactionType: TransactionType;
      registrationType: RegistrationType;
      formTemplateId: string;
      formTemplateName: string;
    };
  }) => void;
}

function validateJson(str: string): { valid: boolean; error?: string } {
  if (!str.trim()) return { valid: true };
  try {
    JSON.parse(str);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

/**
 * Three-tab modal for managing all JSON configurations per form rule:
 * - Display Condition (matching rules)
 * - Payload Template (field-to-API mappings)
 * - E-Signature Mapping (signer tag assignments)
 *
 * Each tab has its own independent JSON editor with validation.
 * FUTURE: The Display Condition tab will gain a "Visual" mode toggle
 * to swap the textarea for a structured condition builder UI.
 */
export function RulesModal({
  open,
  onOpenChange,
  title,
  displayConditionJson,
  payloadTemplateJson,
  eSignatureMappingJson,
  endpoints: initialEndpoints,
  mode = "view",
  formDetails: initialFormDetails,
  onSave,
}: RulesModalProps) {
  const showFormDetails = mode === "add" || mode === "edit";
  const [activeTab, setActiveTab] = useState<ModalTab>(showFormDetails ? "form_details" : "display_condition");
  const [editorMode, setEditorMode] = useState<"json" | "visual">("json");

  const [conditionValue, setConditionValue] = useState(displayConditionJson);
  const [payloadValue, setPayloadValue] = useState(payloadTemplateJson);
  const [esigValue, setEsigValue] = useState(eSignatureMappingJson);
  const [endpointsValue, setEndpointsValue] = useState<EndpointConfig[]>(initialEndpoints);

  // Form details state
  const [custodian, setCustodian] = useState<Custodian | "">(initialFormDetails?.custodian ?? "");
  const [transactionType, setTransactionType] = useState<TransactionType | "">(initialFormDetails?.transactionType ?? "");
  const [registrationType, setRegistrationType] = useState<RegistrationType | "">(initialFormDetails?.registrationType ?? "");
  const [formTemplateId, setFormTemplateId] = useState(initialFormDetails?.formTemplateId ?? "");

  const [conditionValidation, setConditionValidation] = useState(validateJson(displayConditionJson));
  const [payloadValidation, setPayloadValidation] = useState(validateJson(payloadTemplateJson));
  const [esigValidation, setEsigValidation] = useState(validateJson(eSignatureMappingJson));

  // Endpoint drill-in state
  const [endpointDrillIn, setEndpointDrillIn] = useState<{ mode: "add" | "view"; endpointId?: string } | null>(null);
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false);
  const [editServiceId, setEditServiceId] = useState("");
  const [editEndpointId, setEditEndpointId] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editLabel, setEditLabel] = useState("");
  const [editPayloadValue, setEditPayloadValue] = useState("");

  const selectedTemplate = FORM_TEMPLATES.find((t) => t.id === formTemplateId);
  const formDetailsValid = !showFormDetails || (custodian && transactionType && registrationType && formTemplateId);

  // Build tabs array based on mode
  const TABS: { id: ModalTab; label: string; icon: React.ElementType; description: string }[] = [
    ...(showFormDetails ? [{
      id: "form_details" as const,
      label: "Form Details",
      icon: FileText,
      description: "Configure the form attributes and template.",
    }] : []),
    {
      id: "display_condition" as const,
      label: "Conditions",
      icon: Braces,
      description: "Define when this form should be shown based on account configuration.",
    },
    {
      id: "endpoints" as const,
      label: "Endpoints and Payloads",
      icon: Globe,
      description: "Configure API endpoints and payload templates for this form.",
    },
  ];

  useEffect(() => {
    if (open) {
      setConditionValue(displayConditionJson);
      setPayloadValue(payloadTemplateJson);
      setEsigValue(eSignatureMappingJson);
      setEndpointsValue(initialEndpoints);
      setConditionValidation(validateJson(displayConditionJson));
      setPayloadValidation(validateJson(payloadTemplateJson));
      setEsigValidation(validateJson(eSignatureMappingJson));
      // Reset form details
      setCustodian(initialFormDetails?.custodian ?? "");
      setTransactionType(initialFormDetails?.transactionType ?? "");
      setRegistrationType(initialFormDetails?.registrationType ?? "");
      setFormTemplateId(initialFormDetails?.formTemplateId ?? "");
      setActiveTab(showFormDetails ? "form_details" : "display_condition");
      setEditorMode("json");
      setEndpointDrillIn(null);
      setIsEditingEndpoint(false);
    }
  }, [open, displayConditionJson, payloadTemplateJson, eSignatureMappingJson, initialEndpoints, initialFormDetails, showFormDetails]);

  // Open drill-in for adding new endpoint (starts in edit mode)
  const openAddEndpoint = () => {
    setEditServiceId("");
    setEditEndpointId("");
    setEditTags([]);
    setEditLabel("");
    setEditPayloadValue("{}");
    setIsEditingEndpoint(true);
    setEndpointDrillIn({ mode: "add" });
  };

  // Open drill-in for viewing existing endpoint (starts in view mode)
  const openViewEndpoint = (ep: EndpointConfig) => {
    setEditServiceId(ep.serviceId ?? "");
    setEditEndpointId(ep.endpointId ?? "");
    // Support both old single tag and new tags array
    const tags = ep.tags ?? (ep.tag ? [ep.tag] : []);
    setEditTags(tags);
    setEditLabel(ep.label ?? "");
    setEditPayloadValue(ep.payloadTemplateJson ?? "{}");
    setIsEditingEndpoint(false);
    setEndpointDrillIn({ mode: "view", endpointId: ep.id });
  };

  // Enable editing mode
  const enableEditing = () => {
    setIsEditingEndpoint(true);
  };

  // Close drill-in
  const closeDrillIn = () => {
    setEndpointDrillIn(null);
    setIsEditingEndpoint(false);
  };

  const handleConditionChange = useCallback((v: string) => {
    setConditionValue(v);
    setConditionValidation(validateJson(v));
  }, []);

  const formatCurrent = () => {
    try {
      setConditionValue(JSON.stringify(JSON.parse(conditionValue), null, 2));
    } catch {
      // leave as-is
    }
  };

  const allValid = conditionValidation.valid && formDetailsValid;

  // Check if any changes were made compared to initial props
  const formDetailsChanged = showFormDetails && (
    custodian !== (initialFormDetails?.custodian ?? "") ||
    transactionType !== (initialFormDetails?.transactionType ?? "") ||
    registrationType !== (initialFormDetails?.registrationType ?? "") ||
    formTemplateId !== (initialFormDetails?.formTemplateId ?? "")
  );
  
  const hasChanges =
    conditionValue !== displayConditionJson ||
    payloadValue !== payloadTemplateJson ||
    esigValue !== eSignatureMappingJson ||
    JSON.stringify(endpointsValue) !== JSON.stringify(initialEndpoints) ||
    formDetailsChanged;

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  const selectedEditService = ENDPOINT_SERVICES.find((s) => s.id === editServiceId);
  const selectedEditEndpoint = selectedEditService?.endpoints.find((e) => e.id === editEndpointId);

  const hasPdfEndpoint = endpointsValue.some((ep) => ep.tags?.includes("pdf") || ep.tag === "pdf");
  const otherHasPdf = endpointDrillIn?.mode === "view" 
    ? endpointsValue.some((ep) => ep.id !== endpointDrillIn.endpointId && (ep.tags?.includes("pdf") || ep.tag === "pdf"))
    : hasPdfEndpoint;

  const handleSaveEndpoint = () => {
    if (!editServiceId || !editEndpointId || !selectedEditService || !selectedEditEndpoint) return;

    const epType = editServiceId.includes("quik") ? "quik_pdf" as const
      : editServiceId.includes("pershing") ? "pershing_api" as const
      : editServiceId.includes("box") ? "box" as const
      : "custom" as const;

    const tags: EndpointTag[] = editTags.filter((t): t is EndpointTag => t === "pdf" || t === "esignature");

    if (endpointDrillIn?.mode === "add") {
      const ep: EndpointConfig = {
        id: `ep-${Date.now()}`,
        name: selectedEditEndpoint.name,
        type: epType,
        tags: tags.length > 0 ? tags : undefined,
        label: editLabel || undefined,
        serviceId: editServiceId,
        endpointId: editEndpointId,
        url: selectedEditEndpoint.url,
        payloadTemplateJson: editPayloadValue,
        endpointUsage: "pdf",
      };
      setEndpointsValue((prev) => [...prev, ep]);
      closeDrillIn();
    } else if (endpointDrillIn?.mode === "view" && endpointDrillIn.endpointId) {
      setEndpointsValue((prev) =>
        prev.map((ep) =>
          ep.id === endpointDrillIn.endpointId
            ? {
                ...ep,
                serviceId: editServiceId,
                endpointId: editEndpointId,
                name: selectedEditEndpoint.name,
                url: selectedEditEndpoint.url,
                type: epType,
                tags: tags.length > 0 ? tags : undefined,
                tag: undefined,
                label: editLabel || undefined,
                payloadTemplateJson: editPayloadValue,
              }
            : ep
        )
      );
      // Stay on view page after saving, just exit edit mode
      setIsEditingEndpoint(false);
    }
  };

  // Cancel editing - for existing endpoints, go back to view mode; for add, close drill-in
  const handleCancelEdit = () => {
    if (endpointDrillIn?.mode === "view") {
      // Restore original values from the endpoint
      const ep = endpointsValue.find((e) => e.id === endpointDrillIn.endpointId);
      if (ep) {
        setEditServiceId(ep.serviceId ?? "");
        setEditEndpointId(ep.endpointId ?? "");
        const tags = ep.tags ?? (ep.tag ? [ep.tag] : []);
        setEditTags(tags);
        setEditLabel(ep.label ?? "");
        setEditPayloadValue(ep.payloadTemplateJson ?? "{}");
      }
      setIsEditingEndpoint(false);
    } else {
      closeDrillIn();
    }
  };

  const removeEndpoint = (id: string) => {
    setEndpointsValue((prev) => prev.filter((ep) => ep.id !== id));
    closeDrillIn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Manage the conditions, payload template, and e-signature mapping for this form rule.
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const validation =
              tab.id === "display_condition" ? conditionValidation : { valid: true };

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${isActive
                    ? "border-b-foreground text-foreground"
                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {!validation.valid && (
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab description */}
        {!(activeTab === "endpoints" && endpointDrillIn) && (
          <div className="px-6 pt-4 pb-3">
            <p className="text-sm text-muted-foreground">{activeTabMeta.description}</p>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 min-h-0 px-6 pb-3">
          {activeTab === "form_details" ? (
            /* Form Details tab content */
            <div className="h-[320px] space-y-6 py-2">
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When</span>
                </div>
                <div className="space-y-3 pl-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground shrink-0 w-[100px]">Custodian is</Label>
                    <Select value={custodian} onValueChange={(v) => setCustodian(v as Custodian)}>
                      <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTODIANS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {custodian && (
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground shrink-0 w-[100px]">Transaction is</Label>
                      <Select value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
                        <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSACTION_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {custodian && transactionType && (
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground shrink-0 w-[100px]">Registration is</Label>
                      <Select value={registrationType} onValueChange={(v) => setRegistrationType(v as RegistrationType)}>
                        <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
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
                <div className="space-y-3 pt-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Then show</span>
                  </div>
                  <div className="pl-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground shrink-0 w-[100px]">Form template</Label>
                      <Select value={formTemplateId} onValueChange={setFormTemplateId}>
                        <SelectTrigger className="flex-1 bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
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
          ) : activeTab === "endpoints" ? (
            endpointDrillIn ? (
              /* Drill-in view for Add/Edit endpoint */
              <div className="flex flex-col min-h-0">
                {/* Drill-in header with back button */}
                <div className="flex items-center justify-between pt-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={closeDrillIn}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {endpointDrillIn.mode === "add" ? "Add Endpoint" : "Edit Endpoint"}
                    </span>
                  </div>
                  {endpointDrillIn.mode === "view" && !isEditingEndpoint && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={enableEditing}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  {isEditingEndpoint && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleSaveEndpoint}
                        disabled={!editServiceId || !editEndpointId}
                      >
                        {endpointDrillIn.mode === "add" ? "Add" : "Save"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Drill-in content */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
                  {isEditingEndpoint ? (
                    /* Edit mode - editable fields */
                    <>
                      {/* Row 1: Label and Tags | Row 2: Service and Endpoint (2x2 grid, equal widths) */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Label (optional)</Label>
                          <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder="e.g., Quik PDF - Generate"
                            className="h-8 text-xs bg-[rgba(105,105,105,0.051)] border-none shadow-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Tags (optional)</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md bg-[rgba(105,105,105,0.051)] border-none shadow-none px-3 py-1 text-xs cursor-pointer"
                              >
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {editTags.length === 0 ? (
                                    <span className="text-muted-foreground truncate">
                                      Select tags...
                                    </span>
                                  ) : (
                                    editTags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className={
                                          tag === "pdf"
                                            ? "px-1.5 py-0 text-[11px] font-normal rounded-full border border-blue-200 bg-blue-50 text-blue-700"
                                            : "px-1.5 py-0 text-[11px] font-normal rounded-full border border-purple-200 bg-purple-50 text-purple-700"
                                        }
                                      >
                                        {tag === "pdf" ? "PDF" : "E-signature"}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                                <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                              <DropdownMenuItem
                                disabled={otherHasPdf && !editTags.includes("pdf")}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setEditTags(prev => prev.includes("pdf") ? prev.filter(t => t !== "pdf") : [...prev, "pdf"]);
                                }}
                                className="flex items-center justify-between gap-2 rounded-sm py-1.5 px-2 text-sm cursor-pointer"
                              >
                                <span>PDF</span>
                                {editTags.includes("pdf") && <Check className="h-4 w-4 shrink-0 text-foreground" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setEditTags(prev => prev.includes("esignature") ? prev.filter(t => t !== "esignature") : [...prev, "esignature"]);
                                }}
                                className="flex items-center justify-between gap-2 rounded-sm py-1.5 px-2 text-sm cursor-pointer"
                              >
                                <span>E-signature</span>
                                {editTags.includes("esignature") && <Check className="h-4 w-4 shrink-0 text-foreground" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Service</Label>
                          <Select value={editServiceId} onValueChange={(v) => { setEditServiceId(v); setEditEndpointId(""); }}>
                            <SelectTrigger className="h-8 w-full text-xs bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                              <SelectValue placeholder="Select service..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ENDPOINT_SERVICES.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Endpoint</Label>
                          <Select value={editEndpointId} onValueChange={setEditEndpointId} disabled={!editServiceId}>
                            <SelectTrigger className="h-8 w-full text-xs bg-[rgba(105,105,105,0.051)] border-none shadow-none">
                              <SelectValue placeholder={editServiceId ? "Select endpoint..." : "Select a service first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedEditService?.endpoints.map((e) => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Payload Template (JSON)</Label>
                        <Textarea
                          value={editPayloadValue}
                          onChange={(e) => setEditPayloadValue(e.target.value)}
                          className="font-mono text-xs leading-relaxed resize-none h-[120px] bg-[rgba(105,105,105,0.051)] border-none shadow-none"
                          placeholder='{"FormFields": [...]}'
                          spellCheck={false}
                        />
                      </div>

                      {/* Edit mode actions - only show delete for existing endpoints */}
                      {endpointDrillIn.mode === "view" && (
                        <div className="flex items-center pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeEndpoint(endpointDrillIn.endpointId!)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete endpoint
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* View mode - read-only display */
                    <>
                      {/* 2x2 grid: Label | Tags, Service | Endpoint */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Label</Label>
                          <p className="text-sm">{editLabel || "—"}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Tags</Label>
                          <div className="flex gap-1.5">
                            {editTags.length > 0 ? (
                              editTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag === "pdf" ? "PDF" : "E-signature"}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Service</Label>
                          <p className="text-sm">{selectedEditService?.name || "—"}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Endpoint</Label>
                          <p className="text-sm">{selectedEditEndpoint?.name || "—"}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Payload Template (JSON)</Label>
                        <pre className="font-mono text-xs leading-relaxed p-3 rounded bg-[rgba(105,105,105,0.051)] overflow-auto h-[120px]">
                          {editPayloadValue || "{}"}
                        </pre>
                      </div>

                      {/* View mode actions */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeEndpoint(endpointDrillIn.endpointId!)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete endpoint
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Main endpoints list view */
              <div className="h-[320px]">
                {/* Endpoints list */}
                <div className="flex flex-col gap-3 overflow-auto h-full">
                  {/* Existing endpoints list */}
                  <div className="space-y-2">
                    {endpointsValue.map((ep) => (
                      <button
                        key={ep.id}
                        className="w-full border rounded-lg bg-muted/30 px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => openViewEndpoint(ep)}
                      >
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{ep.label || ep.name}</p>
                            {ep.label && ep.name !== ep.label && (
                              <span className="text-xs text-muted-foreground truncate">{ep.name}</span>
                            )}
                          </div>
                        </div>
                        {(ep.tags && ep.tags.length > 0) || ep.tag ? (
                          <div className="flex gap-1 shrink-0">
                            {(ep.tags ?? (ep.tag ? [ep.tag] : [])).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`text-[10px] h-5 ${
                                  tag === "pdf"
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-purple-50 text-purple-600 border-purple-200"
                                }`}
                              >
                                {tag === "pdf" ? "PDF" : "E-signature"}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 rotate-180" />
                      </button>
                    ))}
                  </div>

                  {/* Add endpoint button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start text-xs h-7"
                    onClick={openAddEndpoint}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add endpoint
                  </Button>

                  {hasPdfEndpoint && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Only one PDF-tagged endpoint allowed per form.
                    </p>
                  )}
                </div>
              </div>
            )
          ) : activeTab === "display_condition" && editorMode === "visual" ? (
            /* FUTURE: Visual rule builder component goes here */
            <div className="h-[320px] flex items-center justify-center border border-dashed rounded-lg bg-muted/30">
              <div className="text-center space-y-2">
                <Workflow className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Visual rule builder coming soon
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Add condition rows, operators, and values — no JSON needed.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 h-[320px]">
              <div className="relative flex-1 min-h-0">
                <Textarea
                  value={conditionValue}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="h-full font-mono text-xs leading-relaxed resize-none pb-10 bg-[rgba(105,105,105,0.051)] border-none shadow-none"
                  placeholder='{\n  "conditions": []\n}'
                  spellCheck={false}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatCurrent}
                  className="absolute bottom-2 right-6 text-xs h-7"
                >
                  Format
                </Button>
              </div>

              {/* Validation status */}
              <div className="flex items-center">
                {conditionValidation.valid ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    Valid JSON
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span className="truncate max-w-md">{conditionValidation.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center gap-2 mr-auto" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                displayConditionJson: conditionValue,
                payloadTemplateJson: payloadValue,
                eSignatureMappingJson: esigValue,
                endpoints: endpointsValue,
                ...(showFormDetails && custodian && transactionType && registrationType && formTemplateId ? {
                  formDetails: {
                    custodian: custodian as Custodian,
                    transactionType: transactionType as TransactionType,
                    registrationType: registrationType as RegistrationType,
                    formTemplateId,
                    formTemplateName: selectedTemplate?.name ?? "Untitled form",
                  }
                } : {}),
              });
              onOpenChange(false);
            }}
            disabled={!allValid || (!hasChanges && mode !== "add")}
          >
            {mode === "add" ? "Add" : "Save all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
