// ─── Custodian Form Rule ─────────────────────────────────────────────
// Each row = "If conditions are met, render this form (and later call these endpoints)."

export type Custodian = "Fidelity" | "Schwab" | "Pershing";

export type TransactionType =
  | "New account"
  | "Money movement"
  | "Transfer of assets"
  | "Account maintenance";

export type RegistrationType =
  | "Individual"
  | "Joint"
  | "IRA"
  | "Trust"
  | "Entity"
  | "Partnership";

export interface CustodianFormRule {
  id: string;
  custodian: Custodian;
  transactionType: TransactionType;
  registrationType: RegistrationType;
  formTemplateId: string;
  formTemplateName: string;

  /**
   * JSON rule definition: the real matching logic.
   * Conditions like custodian = Fidelity, transaction_type = open_new_account, etc.
   * V1: raw JSON string edited in a textarea modal.
   * Future: structured conditions edited in a visual rule builder.
   */
  rulesJson: string;

  /**
   * JSON defining which fields receive e-signature tags.
   * e.g. {"1own": "firstSignerEmail", "2own": "secondSignerEmail"}
   */
  eSignatureMappingJson: string;

  /**
   * List of API endpoints this form calls.
   * Every custodian form calls Quik PDF. Some (Pershing) also call a custodian-specific API.
   * Each endpoint carries its own payloadTemplateJson.
   */
  endpoints: EndpointConfig[];

  enabled: boolean;
  updatedAt: string;
}

export type EndpointUsage = "pdf" | "action";

export interface EndpointConfig {
  id: string;
  name: string;
  type: "quik_pdf" | "pershing_api" | "box" | "custom";
  endpointUsage: EndpointUsage;
  url?: string;
  payloadTemplateJson?: string;
}

// ─── Client Form Rule ────────────────────────────────────────────────
// Client forms (Guardian, Mercer) with complex inclusion rules.

export type ClientFormType =
  | "PDF"
  | "Disclosure"
  | "Signature addendum"
  | "Supplemental";

export type RoleType =
  | "per_account"
  | "per_person"
  | "per_distinct_owner"
  | "per_signer"
  | "global";

export type ClientOrg = "Guardian" | "Park Avenue" | "Mercer";

export interface ClientFormRule {
  id: string;
  clientOrg: ClientOrg;
  formName: string;
  formType: ClientFormType;
  roleType: RoleType;

  /**
   * JSON rule definition for client form inclusion logic.
   * Can include geographic rules, count-based rules, etc.
   * V1: raw JSON string.
   * Future: visual rule builder supporting complex nesting.
   */
  rulesJson: string;

  eSignatureMappingJson: string;

  description: string;
  enabled: boolean;
  updatedAt: string;
}

// ─── Global Endpoint Registry ────────────────────────────────────────

export interface GlobalEndpoint {
  id: string;
  label: string;
  serviceId: string;
  serviceName: string;
  endpointId: string;
  endpointName: string;
  endpointUsage: EndpointUsage;
  url?: string;
}

export interface EndpointService {
  id: string;
  name: string;
  endpoints: { id: string; name: string; url?: string }[];
}

// ─── Shared ──────────────────────────────────────────────────────────

export interface RulesValidationResult {
  valid: boolean;
  error?: string;
}
