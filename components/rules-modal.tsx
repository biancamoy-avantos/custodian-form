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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  Braces,
  Workflow,
  FileJson,
  PenTool,
  Globe,
  Plus,
  X,
  FileText,
} from "lucide-react";
import type { EndpointConfig, GlobalEndpoint } from "@/lib/types";

type ModalTab = "display_condition" | "payload_template" | "esignature_mapping" | "endpoints";

const TABS: { id: ModalTab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: "display_condition",
    label: "Conditions",
    icon: Braces,
    description: "Define when this form should be shown based on account configuration.",
  },
  {
    id: "payload_template",
    label: "Payload Template",
    icon: FileJson,
    description: "Map form field data into Quik PDF payloads using Go template syntax.",
  },
  {
    id: "esignature_mapping",
    label: "E-Signature Mapping",
    icon: PenTool,
    description: "Define which owner/signer roles map to e-signature email tags.",
  },
  {
    id: "endpoints",
    label: "Endpoints",
    icon: Globe,
    description: "Configure which API endpoints this form calls. Quik PDF is always included.",
  },
];

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  displayConditionJson: string;
  payloadTemplateJson: string;
  eSignatureMappingJson: string;
  endpoints: EndpointConfig[];
  globalEndpoints?: GlobalEndpoint[];
  onSave: (data: {
    displayConditionJson: string;
    payloadTemplateJson: string;
    eSignatureMappingJson: string;
    endpoints: EndpointConfig[];
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
  globalEndpoints = [],
  onSave,
}: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("display_condition");
  const [editorMode, setEditorMode] = useState<"json" | "visual">("json");

  const [conditionValue, setConditionValue] = useState(displayConditionJson);
  const [payloadValue, setPayloadValue] = useState(payloadTemplateJson);
  const [esigValue, setEsigValue] = useState(eSignatureMappingJson);
  const [endpointsValue, setEndpointsValue] = useState<EndpointConfig[]>(initialEndpoints);

  const [conditionValidation, setConditionValidation] = useState(validateJson(displayConditionJson));
  const [payloadValidation, setPayloadValidation] = useState(validateJson(payloadTemplateJson));
  const [esigValidation, setEsigValidation] = useState(validateJson(eSignatureMappingJson));

  useEffect(() => {
    if (open) {
      setConditionValue(displayConditionJson);
      setPayloadValue(payloadTemplateJson);
      setEsigValue(eSignatureMappingJson);
      setEndpointsValue(initialEndpoints);
      setConditionValidation(validateJson(displayConditionJson));
      setPayloadValidation(validateJson(payloadTemplateJson));
      setEsigValidation(validateJson(eSignatureMappingJson));
      setActiveTab("display_condition");
      setEditorMode("json");
    }
  }, [open, displayConditionJson, payloadTemplateJson, eSignatureMappingJson, initialEndpoints]);

  const handleConditionChange = useCallback((v: string) => {
    setConditionValue(v);
    setConditionValidation(validateJson(v));
  }, []);

  const handlePayloadChange = useCallback((v: string) => {
    setPayloadValue(v);
    setPayloadValidation(validateJson(v));
  }, []);

  const handleEsigChange = useCallback((v: string) => {
    setEsigValue(v);
    setEsigValidation(validateJson(v));
  }, []);

  const formatCurrent = () => {
    try {
      if (activeTab === "display_condition") {
        setConditionValue(JSON.stringify(JSON.parse(conditionValue), null, 2));
      } else if (activeTab === "payload_template") {
        setPayloadValue(JSON.stringify(JSON.parse(payloadValue), null, 2));
      } else {
        setEsigValue(JSON.stringify(JSON.parse(esigValue), null, 2));
      }
    } catch {
      // leave as-is
    }
  };

  const allValid = conditionValidation.valid && payloadValidation.valid && esigValidation.valid;

  const currentValue =
    activeTab === "display_condition" ? conditionValue :
    activeTab === "payload_template" ? payloadValue : esigValue;

  const currentValidation =
    activeTab === "display_condition" ? conditionValidation :
    activeTab === "payload_template" ? payloadValidation : esigValidation;

  const currentOnChange =
    activeTab === "display_condition" ? handleConditionChange :
    activeTab === "payload_template" ? handlePayloadChange : handleEsigChange;

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  const addEndpointFromGlobal = (gep: GlobalEndpoint) => {
    setEndpointsValue((prev) => [
      ...prev,
      {
        id: `ep-${Date.now()}`,
        name: gep.label,
        type: gep.serviceId.includes("quik") ? "quik_pdf" as const
          : gep.serviceId.includes("pershing") ? "pershing_api" as const
          : gep.serviceId.includes("box") ? "box" as const
          : "custom" as const,
        endpointUsage: gep.endpointUsage,
        url: gep.url,
      },
    ]);
  };

  const removeEndpoint = (id: string) => {
    setEndpointsValue((prev) => prev.filter((ep) => ep.type === "quik_pdf" || ep.id !== id));
  };

  const hasPdfEndpoint = endpointsValue.some((ep) => ep.endpointUsage === "pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[85vh] max-h-[700px] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Manage the conditions, payload template, and e-signature mapping for this form rule.
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b px-2 shrink-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const validation =
              tab.id === "display_condition" ? conditionValidation :
              tab.id === "payload_template" ? payloadValidation : esigValidation;

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

        {/* Tab description + editor mode toggle */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 shrink-0">
          <p className="text-sm text-muted-foreground">{activeTabMeta.description}</p>

          {/* JSON / Visual toggle (only for Display Condition tab) */}
          {activeTab === "display_condition" && (
            <div className="flex gap-1 p-0.5 bg-muted rounded-md">
              <button
                onClick={() => setEditorMode("json")}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  editorMode === "json"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Braces className="h-3 w-3" />
                JSON
              </button>
              <button
                onClick={() => setEditorMode("visual")}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  editorMode === "visual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Workflow className="h-3 w-3" />
                Visual
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 leading-none">
                  Soon
                </Badge>
              </button>
            </div>
          )}
        </div>

        {/* Editor area */}
        <div className="flex-1 min-h-0 px-6 pb-4 flex flex-col overflow-hidden">
          {activeTab === "endpoints" ? (
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
              <div className="space-y-2">
                {endpointsValue.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between px-3 py-2.5 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{ep.name}</p>
                        {ep.url && (
                          <p className="text-xs text-muted-foreground font-mono">{ep.url}</p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${
                          ep.endpointUsage === "pdf"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                      >
                        {ep.endpointUsage === "pdf" ? "PDF" : "Action"}
                      </Badge>
                      {ep.type === "quik_pdf" && (
                        <Badge variant="secondary" className="text-[10px] h-5">Default</Badge>
                      )}
                    </div>
                    {ep.type !== "quik_pdf" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEndpoint(ep.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* One PDF constraint notice */}
              {hasPdfEndpoint && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Only one PDF endpoint allowed per form. Remove the existing PDF endpoint to add a different one.
                </p>
              )}

              {/* Add endpoint from global registry */}
              <div className="border border-dashed rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Add endpoint from registry</p>
                <div className="flex gap-2 flex-wrap">
                  {globalEndpoints
                    .filter((gep) => !endpointsValue.some((ep) => ep.name === gep.label))
                    .filter((gep) => !(gep.endpointUsage === "pdf" && hasPdfEndpoint))
                    .map((gep) => (
                      <Button
                        key={gep.id}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => addEndpointFromGlobal(gep)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {gep.label}
                        <Badge variant="outline" className={`text-[9px] h-4 ml-1 ${
                          gep.endpointUsage === "pdf" ? "text-blue-600 border-blue-200" : "text-amber-600 border-amber-200"
                        }`}>
                          {gep.endpointUsage === "pdf" ? "PDF" : "Action"}
                        </Badge>
                      </Button>
                    ))}
                  {globalEndpoints
                    .filter((gep) => !endpointsValue.some((ep) => ep.name === gep.label))
                    .filter((gep) => !(gep.endpointUsage === "pdf" && hasPdfEndpoint))
                    .length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {globalEndpoints.length === 0
                        ? "No endpoints in registry. Add endpoints via Manage Endpoints."
                        : "All available endpoints added."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "display_condition" && editorMode === "visual" ? (
            /* FUTURE: Visual rule builder component goes here */
            <div className="flex-1 min-h-0 flex items-center justify-center border border-dashed rounded-lg bg-muted/30">
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
            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <Textarea
                  value={currentValue}
                  onChange={(e) => currentOnChange(e.target.value)}
                  className="absolute inset-0 font-mono text-xs leading-relaxed resize-none pb-10 overflow-auto"
                  placeholder={
                    activeTab === "display_condition"
                      ? '{\n  "conditions": []\n}'
                      : activeTab === "payload_template"
                      ? '{\n  "FormFields": [\n    {"FieldName": "...", "FieldValue": "{{.fieldName}}"}\n  ]\n}'
                      : '{\n  "1own": "firstSignerEmail"\n}'
                  }
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
                {currentValidation.valid ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    Valid JSON
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span className="truncate max-w-md">{currentValidation.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center gap-2 mr-auto">
            {!allValid && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Fix validation errors before saving
              </span>
            )}
          </div>
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
              });
              onOpenChange(false);
            }}
            disabled={!allValid}
          >
            Save all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
