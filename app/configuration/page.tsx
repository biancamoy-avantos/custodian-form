"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChildFormRow {
  id: string;
  level: number;
  displayCondition: string;
  childForm: string;
  payloadTemplate: string;
  eSignatureMapping: string;
}

// ─── Sample Data ────────────────────────────────────────────────────────────

const FORM_OPTIONS = [
  "Fidelity Brokerage Ap...",
  "Fidelity IRA Account...",
  "Fidelity Inherited IRA...",
  "Fidelity FFOS Trust A...",
  "Schwab One Account...",
  "Schwab IRA Account...",
  "Pershing LLC - Partne...",
  "Pershing LLC - Inheri...",
];

const initialChildForms: ChildFormRow[] = [
  {
    id: "1",
    level: 1,
    displayCondition: `{"Custodian":"Fidelity","fidelityCategory":"Open a new account","fidelityAccountType":"Brokerage"}`,
    childForm: "Fidelity Brokerage Ap...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1rep.BDCompany","FieldValue":""},{"primaryAuthorizedAgentOrAdviserInformation":{}},{"FieldName":"FIELD491.txt1.01","FieldValue":""},{"FieldName":"1p.dbaNumber1"},{"FieldName":"1rep.GNum","FieldValue":""},{"primaryAuthorizedAgentOrAdvisor":""}]}`,
    eSignatureMapping: `{"1own":"firstSignerEmail","2own":"secondSignerEmail"}`,
  },
  {
    id: "2",
    level: 2,
    displayCondition: `{"Custodian":"Fidelity","fidelityCategory":"Open a new account","fidelityAccountType":"IRA"}`,
    childForm: "Fidelity IRA Account...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1rep.BDCompany","FieldValue":""},{"primaryAuthorizedFirmName":""},{"FieldName":"FIELD16.1.txt1.01","FieldValue":""},{"FieldName":"1p.dbaNumber1"},{"FieldValue":"1rep.BDCompany"}]}`,
    eSignatureMapping: ``,
  },
  {
    id: "3",
    level: 3,
    displayCondition: `{"Custodian":"Fidelity","fidelityCategory":"Open a new account","fidelityAccountType":"Inherited IRA"}`,
    childForm: "Fidelity Inherited IRA...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1acc.AccountNumber"},{"edValue":""},{"accountNumber1":""},{"FieldName":"FIDEN131.1.txt1.04","FieldName":"1rep.BDCompany","FieldValue":""},{"primaryAuthorizedFirmName":""}]}`,
    eSignatureMapping: `{"1own":"firstSignerEmail","2own":"secondSignerEmail"}`,
  },
  {
    id: "4",
    level: 4,
    displayCondition: `{"Custodian":"Fidelity","fidelityCategory":"Open a new account","fidelityAccountType":"FFOS Trust"}`,
    childForm: "Fidelity FFOS Trust A...",
    payloadTemplate: `{"FormFields":[{"FieldName":"FIDEN131.1.txt1.0","FieldValue":""},{"dchzNumber1":""},{"FieldName":"1rep.BDCompany","FieldValue":""},{"primaryAuthorizedAdvisorFirmName":""},{"FieldName":"1rep.GNum","FieldValue":""},{"primaryAuthorizedAdvisorForm":""}]}`,
    eSignatureMapping: ``,
  },
  {
    id: "5",
    level: 5,
    displayCondition: `{"Custodian":"Schwab","schwabCategory":"Open a new account","schwabAccountType":"Individual"}`,
    childForm: "Schwab One Account...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1rep.BDCompany","FieldValue":""},{"iaMasterAccountNumber":""},{"FieldName":"1rep.ServiceTeam"},{"FieldName":"1.serviceTeam1"},{"FieldName":"1rep.FullName","FieldValue":""},{"FieldValue":"1accountNumber"}]}`,
    eSignatureMapping: `{"1own":"firstSignerEmail","2own":"secondSignerEmail"}`,
  },
  {
    id: "6",
    level: 6,
    displayCondition: `{"Custodian":"Schwab","schwabCategory":"Open a new account","schwabAccountType":"IRA"}`,
    childForm: "Schwab IRA Account...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1rep.BDCompany","FieldValue":""},{"iaMasterAccountNumber":""},{"FieldName":"1rep.ServiceTeam"},{"FieldName":"1.serviceTeam1"},{"FieldName":"1rep.FullName","FieldValue":""},{"FieldValue":"1accountNumber"}]}`,
    eSignatureMapping: `{"1own":"firstSignerEmail"}`,
  },
  {
    id: "7",
    level: 7,
    displayCondition: `{"Custodian":"Pershing LLC","pershingLLCCategory":"Open a new account","pershingLLCAccountType":"Partnership Account Form"}`,
    childForm: "Pershing LLC - Partne...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1acc.Reg","FieldValue":""},{"accountField1":""},{"FieldName":"1acc.AccountNum","FieldValue":""},{"FieldName":"1.entEntityName","entityField":""},{"entityName":"1outField.FullName","FieldValue":""},{"p.or.tax.adjustedIndex":""}]}`,
    eSignatureMapping: ``,
  },
  {
    id: "8",
    level: 8,
    displayCondition: `{"Custodian":"Pershing LLC","pershingLLCCategory":"Open a new account","pershingLLCAccountType":"Inherited IRA Application"}`,
    childForm: "Pershing LLC - Inheri...",
    payloadTemplate: `{"FormFields":[{"FieldName":"1acc.Reg","FieldValue":""},{"financialOrganization":""},{"FieldName":"1acc.AccountNum.Prefix"},{"accountNumberPrefix1":""},{"FieldName":"1rep.Repnum","FieldValue":""},{"FieldName":"1acc.RegTypeEntry"}]}`,
    eSignatureMapping: ``,
  },
];

// ─── JSON Display Component ─────────────────────────────────────────────────

function JsonCell({ value, maxLines = 8 }: { value: string; maxLines?: number }) {
  if (!value) {
    return <span className="text-gray-300 text-xs italic">—</span>;
  }
  return (
    <div
      className="font-mono text-[10.5px] leading-[1.5] text-gray-600 bg-gray-50 rounded px-2 py-1.5 overflow-hidden border border-gray-100"
      style={{
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        wordBreak: "break-all",
      }}
    >
      {value}
    </div>
  );
}

// ─── Level Badge ────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: number }) {
  return (
    <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center">
      <span className="text-xs font-semibold text-gray-600">{level}</span>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function CustodianFormConfigurationPage() {
  const [l1Config, setL1Config] = useState("custodian-forms-l1");
  const [l2Config, setL2Config] = useState("custodian-forms-l2");
  const [pdfPreview, setPdfPreview] = useState("pdf-preview");
  const [envelopeGeneration, setEnvelopeGeneration] = useState("envelope-metadata");
  const [envelopeMetadata, setEnvelopeMetadata] = useState("envelope-metadata");
  const [childForms, setChildForms] = useState<ChildFormRow[]>(initialChildForms);

  const addNewChildForm = () => {
    const newRow: ChildFormRow = {
      id: String(Date.now()),
      level: childForms.length + 1,
      displayCondition: "",
      childForm: "",
      payloadTemplate: "",
      eSignatureMapping: "",
    };
    setChildForms([...childForms, newRow]);
  };

  const removeChildForm = (id: string) => {
    setChildForms(
      childForms
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, level: i + 1 }))
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-10 py-10">
          {/* Page Header */}
          <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight mb-8">
            Custodian Form Configuration
          </h1>

          {/* Config Section */}
          <div className="space-y-6 mb-10">
            {/* Row 1: L1 + L2 Config */}
            <div className="grid grid-cols-2 gap-8">
              {/* L1 Configuration Form */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Form Options
                  </label>
                </div>
                <label className="text-sm font-medium text-gray-700 block">
                  L1 Configuration Form
                </label>
                <Select value={l1Config} onValueChange={setL1Config}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custodian-forms-l1">
                      Custodian Forms L1 Configuration
                    </SelectItem>
                    <SelectItem value="custodian-forms-l1-v2">
                      Custodian Forms L1 Config v2
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  The fields from this form determine which child form is rendered.
                </p>
              </div>

              {/* L2 Configuration Form */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    &nbsp;
                  </label>
                </div>
                <label className="text-sm font-medium text-gray-700 block">
                  L2 Configuration Form
                </label>
                <Select value={l2Config} onValueChange={setL2Config}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custodian-forms-l2">
                      Custodian Forms L2 Configuration
                    </SelectItem>
                    <SelectItem value="custodian-forms-l2-v2">
                      Custodian Forms L2 Config v2
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  The fields from this form determine which child form is rendered.
                </p>
              </div>
            </div>

            {/* Row 2: PDF Preview + Envelope Generation */}
            <div className="grid grid-cols-2 gap-8">
              {/* PDF Preview Template Endpoint */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  PDF Preview Template Endpoint
                </label>
                <label className="text-sm font-medium text-gray-700 block">
                  Endpoint Configuration
                </label>
                <Select value={pdfPreview} onValueChange={setPdfPreview}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf-preview">PDF Preview</SelectItem>
                    <SelectItem value="pdf-preview-v2">PDF Preview v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Envelope Generation Endpoint */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Envelope Generation Endpoint
                </label>
                <label className="text-sm font-medium text-gray-700 block">
                  Endpoint Configuration
                </label>
                <Select
                  value={envelopeGeneration}
                  onValueChange={setEnvelopeGeneration}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="envelope-metadata">
                      Envelope Metadata
                    </SelectItem>
                    <SelectItem value="envelope-generation-v2">
                      Envelope Generation v2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Envelope Metadata Endpoint */}
            <div className="max-w-[calc(50%-1rem)] space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Envelope Metadata Endpoint
              </label>
              <label className="text-sm font-medium text-gray-700 block">
                Endpoint Configuration
              </label>
              <Select value={envelopeMetadata} onValueChange={setEnvelopeMetadata}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="envelope-metadata">
                    Envelope Metadata
                  </SelectItem>
                  <SelectItem value="envelope-metadata-v2">
                    Envelope Metadata v2
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-8" />

          {/* Child Forms Section */}
          <div>
            <h2 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-6">
              Child Forms
            </h2>

            {/* Child Forms Table */}
            <div className="space-y-0">
              {/* Table Header */}
              <div className="grid grid-cols-[56px_1fr_180px_1fr_1fr] gap-3 pb-3 border-b border-gray-200">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pl-1">
                  Level
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Child Form Display Condition
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Child Form
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Child Form Payload Template
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Child Form E-Signature Mapping
                </div>
              </div>

              {/* Table Rows */}
              {childForms.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[56px_1fr_180px_1fr_1fr] gap-3 py-4 border-b border-gray-100 items-start group"
                >
                  {/* Level */}
                  <div className="flex items-center justify-center pt-1">
                    <LevelBadge level={row.level} />
                  </div>

                  {/* Display Condition */}
                  <div>
                    <JsonCell value={row.displayCondition} maxLines={6} />
                  </div>

                  {/* Child Form Dropdown */}
                  <div>
                    <Select
                      value={row.childForm}
                      onValueChange={(val) =>
                        setChildForms(
                          childForms.map((f) =>
                            f.id === row.id ? { ...f, childForm: val } : f
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payload Template */}
                  <div>
                    <JsonCell value={row.payloadTemplate} maxLines={6} />
                  </div>

                  {/* E-Signature Mapping */}
                  <div className="relative">
                    <JsonCell value={row.eSignatureMapping} maxLines={6} />
                    {/* Delete button on hover */}
                    <button
                      onClick={() => removeChildForm(row.id)}
                      className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <Button
                variant="outline"
                onClick={addNewChildForm}
                className="gap-2 text-sm font-medium uppercase tracking-wide border-gray-900 text-gray-900 hover:bg-gray-50 rounded-sm px-5 h-10"
              >
                <Plus className="h-4 w-4" />
                Add New Child Form
              </Button>

              <Button className="text-sm font-medium uppercase tracking-wide bg-gray-900 hover:bg-gray-800 text-white rounded-sm px-8 h-10">
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
