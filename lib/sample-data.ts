import type { CustodianFormRule, ClientFormRule, EndpointConfig, GlobalEndpoint, EndpointService } from "./types";

const QUIK_PDF: EndpointConfig = { id: "ep-quik", name: "Quik PDF", type: "quik_pdf", endpointUsage: "pdf" };
const PERSHING_API: EndpointConfig = { id: "ep-pershing", name: "Pershing API", type: "pershing_api", endpointUsage: "action", url: "https://api.pershing.com/v1/accounts" };

// Realistic Fidelity payload template (trimmed excerpt from actual production config)
const FIDELITY_BROKERAGE_PAYLOAD = JSON.stringify({
  FormFields: [
    { FieldName: "1rep.BDCompany", FieldValue: "{{.primaryAuthorizedAgentOrAdvisorFirmName}}" },
    { FieldName: "FIDEL0481.txt1.01.1", FieldValue: "{{.dtcNumber}}" },
    { FieldName: "1rep.GNum", FieldValue: "{{.primaryAuthorizedAgentOrAdvisorFirmNumber}}" },
    { FieldName: "1acc.RegType", FieldValue: '{{if eq .typeOfRegistration "Individual"}}1{{else if eq .typeOfRegistration "Tenants with Rights of Survivorship"}}3{{else if eq .typeOfRegistration "Community Property"}}6{{else}}{{""}}{{end}}' },
    { FieldName: "1own.FName", FieldValue: "{{.firstName}}" },
    { FieldName: "1own.MName", FieldValue: "{{.middleName}}" },
    { FieldName: "1own.LName", FieldValue: "{{.lastName}}" },
    { FieldName: "1own.SSN", FieldValue: "{{.ssn}}" },
    { FieldName: "1own.DOB", FieldValue: "{{.dateOfBirth}}" },
    { FieldName: "1own.H.Mobile", FieldValue: "{{.mobilePhoneNumber}}" },
    { FieldName: "1own.H.Email", FieldValue: "{{.email}}" },
    { FieldName: "User.D321.PermAddr123", FieldValue: "{{.permanentAddressOfAccount}}" },
    { FieldName: "User.D321.PermCity", FieldValue: "{{.city}}" },
    { FieldName: "User.D321.PermState", FieldValue: "{{.stateOrProvince}}" },
    { FieldName: "User.D321.PermZip", FieldValue: "{{.zipOrPostalCode}}" },
    { FieldName: "User.D321.PermCountry", FieldValue: "{{.country}}" },
    { FieldName: "1own.CitizenshipType", FieldValue: '{{if eq .citizenship "U.S. Citizen"}}1{{else if eq .citizenship "Foreign Citizen"}}6{{else}}0{{end}}' },
    { FieldName: "1own.EmployStatus", FieldValue: '{{if eq .incomeSource "Employed"}}1{{else if eq .incomeSource "Self-Employed"}}2{{else if eq .incomeSource "Retired"}}3{{else if eq .incomeSource "Not Employed"}}4{{else}}0{{end}}' },
    { FieldName: "1own.Employer", FieldValue: "{{.employerName}}" },
    { FieldName: "1own.Occupation", FieldValue: "{{.occupation}}" },
    { FieldName: "1contact.FName", FieldValue: "{{.trustedContactFirstName}}" },
    { FieldName: "1contact.LName", FieldValue: "{{.trustedContactLastName}}" },
    { FieldName: "1contact.H.Email", FieldValue: "{{.trustedContactEmail}}" },
  ],
  HostFormOnQuik: true,
  QuikFormID: "481",
}, null, 2);

const FIDELITY_IRA_PAYLOAD = JSON.stringify({
  FormFields: [
    { FieldName: "1rep.BDCompany", FieldValue: "{{.primaryAuthorizedAgentOrAdvisorFirmName}}" },
    { FieldName: "1rep.GNum", FieldValue: "{{.primaryAuthorizedAgentOrAdvisorFirmNumber}}" },
    { FieldName: "1own.FName", FieldValue: "{{.firstName}}" },
    { FieldName: "1own.LName", FieldValue: "{{.lastName}}" },
    { FieldName: "1own.SSN", FieldValue: "{{.ssn}}" },
    { FieldName: "1own.DOB", FieldValue: "{{.dateOfBirth}}" },
    { FieldName: "1own.H.Email", FieldValue: "{{.email}}" },
    { FieldName: "1acc.IRAType", FieldValue: '{{if eq .iraType "Traditional"}}1{{else if eq .iraType "Roth"}}2{{else}}0{{end}}' },
  ],
  HostFormOnQuik: true,
  QuikFormID: "610",
}, null, 2);

const SCHWAB_PAYLOAD = JSON.stringify({
  FormFields: [
    { FieldName: "rep.ServiceTeam", FieldValue: "{{.serviceTeam}}" },
    { FieldName: "rep.FullName", FieldValue: "{{.rep.FullName}}" },
    { FieldName: "rep.RepNum", FieldValue: "{{.rep.RepNum}}" },
    { FieldName: "1aMasterAccountNumber", FieldValue: "{{.masterAccountNumber}}" },
    { FieldName: "1own.FName", FieldValue: "{{.firstName}}" },
    { FieldName: "1own.LName", FieldValue: "{{.lastName}}" },
    { FieldName: "1own.SSN", FieldValue: "{{.ssn}}" },
  ],
}, null, 2);

const PERSHING_PAYLOAD = JSON.stringify({
  FormFields: [
    { FieldName: "1rep.Reg.No", FieldValue: "{{.registrationNumber}}" },
    { FieldName: "1acc.AccountField", FieldValue: "{{.accountField}}" },
    { FieldName: "1ent.EntityName", FieldValue: '{{.entityName}}' },
    { FieldName: "1ent.TaxID", FieldValue: "{{.entityTin}}" },
    { FieldName: "1own.FullName", FieldValue: "{{.ownerFullName}}" },
  ],
}, null, 2);

const FIDELITY_ESIG = JSON.stringify({
  "1own": "firstSignerEmail",
  "2own": "secondSignerEmail",
}, null, 2);

const SCHWAB_ESIG = JSON.stringify({
  "1own": "firstSignerEmail",
  "2own": "secondSignerEmail",
}, null, 2);

const PERSHING_ESIG = JSON.stringify({
  "1own": "firstSignerEmail",
}, null, 2);

const EMPTY_JSON = JSON.stringify({}, null, 2);

export const CUSTODIAN_FORM_RULES: CustodianFormRule[] = [
  {
    id: "cfr-1",
    custodian: "Fidelity",
    transactionType: "New account",
    registrationType: "Individual",
    formTemplateId: "tmpl-fid-brokerage",
    formTemplateName: "Fidelity Brokerage Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
        { field: "account_type", operator: "eq", value: "brokerage" },
        { field: "registration_type", operator: "eq", value: "individual" },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_BROKERAGE_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-25T14:30:00Z",
  },
  {
    id: "cfr-2",
    custodian: "Fidelity",
    transactionType: "New account",
    registrationType: "IRA",
    formTemplateId: "tmpl-fid-ira",
    formTemplateName: "Fidelity IRA Account Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
        { field: "registration_type", operator: "eq", value: "ira" },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_IRA_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-24T10:00:00Z",
  },
  {
    id: "cfr-3",
    custodian: "Fidelity",
    transactionType: "New account",
    registrationType: "Trust",
    formTemplateId: "tmpl-fid-inherited-ira",
    formTemplateName: "Fidelity Inherited IRA Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "account_type", operator: "eq", value: "inherited_ira" },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_IRA_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: false,
    updatedAt: "2026-02-20T08:00:00Z",
  },
  {
    id: "cfr-4",
    custodian: "Schwab",
    transactionType: "New account",
    registrationType: "Individual",
    formTemplateId: "tmpl-sch-one",
    formTemplateName: "Schwab One Account Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Schwab" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
        { field: "registration_type", operator: "in", value: ["individual", "joint"] },
      ],
    }, null, 2),
    payloadTemplateJson: SCHWAB_PAYLOAD,
    eSignatureMappingJson: SCHWAB_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-22T16:00:00Z",
  },
  {
    id: "cfr-5",
    custodian: "Schwab",
    transactionType: "New account",
    registrationType: "IRA",
    formTemplateId: "tmpl-sch-ira",
    formTemplateName: "Schwab IRA Account Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Schwab" },
        { field: "registration_type", operator: "eq", value: "ira" },
      ],
    }, null, 2),
    payloadTemplateJson: SCHWAB_PAYLOAD,
    eSignatureMappingJson: SCHWAB_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-21T12:00:00Z",
  },
  {
    id: "cfr-6",
    custodian: "Pershing",
    transactionType: "New account",
    registrationType: "Partnership",
    formTemplateId: "tmpl-per-partnership",
    formTemplateName: "Pershing LLC – Partnership Account Form",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Pershing" },
        { field: "account_type", operator: "eq", value: "partnership" },
      ],
    }, null, 2),
    payloadTemplateJson: PERSHING_PAYLOAD,
    eSignatureMappingJson: PERSHING_ESIG,
    endpoints: [QUIK_PDF, PERSHING_API],
    enabled: true,
    updatedAt: "2026-02-18T09:00:00Z",
  },
  {
    id: "cfr-7",
    custodian: "Pershing",
    transactionType: "New account",
    registrationType: "IRA",
    formTemplateId: "tmpl-per-inherited",
    formTemplateName: "Pershing LLC – Inherited IRA Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Pershing" },
        { field: "registration_type", operator: "eq", value: "ira" },
        { field: "account_subtype", operator: "eq", value: "inherited" },
      ],
    }, null, 2),
    payloadTemplateJson: PERSHING_PAYLOAD,
    eSignatureMappingJson: PERSHING_ESIG,
    endpoints: [QUIK_PDF, PERSHING_API],
    enabled: true,
    updatedAt: "2026-02-17T11:30:00Z",
  },
  {
    id: "cfr-8",
    custodian: "Fidelity",
    transactionType: "Transfer of assets",
    registrationType: "Individual",
    formTemplateId: "tmpl-fid-toa",
    formTemplateName: "Fidelity FFOS Trust Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "transaction_type", operator: "eq", value: "transfer_of_assets" },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_BROKERAGE_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-15T14:00:00Z",
  },
  {
    id: "cfr-9",
    custodian: "Schwab",
    transactionType: "Transfer of assets",
    registrationType: "Individual",
    formTemplateId: "tmpl-sch-toa",
    formTemplateName: "Schwab Transfer of Assets Form",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Schwab" },
        { field: "transaction_type", operator: "eq", value: "transfer_of_assets" },
      ],
    }, null, 2),
    payloadTemplateJson: SCHWAB_PAYLOAD,
    eSignatureMappingJson: SCHWAB_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-14T10:30:00Z",
  },
  {
    id: "cfr-10",
    custodian: "Pershing",
    transactionType: "New account",
    registrationType: "Individual",
    formTemplateId: "tmpl-per-individual",
    formTemplateName: "Pershing Individual Brokerage Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Pershing" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
        { field: "registration_type", operator: "eq", value: "individual" },
      ],
    }, null, 2),
    payloadTemplateJson: PERSHING_PAYLOAD,
    eSignatureMappingJson: PERSHING_ESIG,
    endpoints: [QUIK_PDF, PERSHING_API],
    enabled: true,
    updatedAt: "2026-02-13T15:00:00Z",
  },
  {
    id: "cfr-11",
    custodian: "Fidelity",
    transactionType: "New account",
    registrationType: "Joint",
    formTemplateId: "tmpl-fid-joint",
    formTemplateName: "Fidelity Joint Account Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
        { field: "registration_type", operator: "eq", value: "joint" },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_BROKERAGE_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-12T09:45:00Z",
  },
  {
    id: "cfr-12",
    custodian: "Schwab",
    transactionType: "Money movement",
    registrationType: "Individual",
    formTemplateId: "tmpl-sch-wire",
    formTemplateName: "Schwab Wire Transfer Authorization",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Schwab" },
        { field: "transaction_type", operator: "eq", value: "money_movement" },
        { field: "movement_type", operator: "eq", value: "wire" },
      ],
    }, null, 2),
    payloadTemplateJson: SCHWAB_PAYLOAD,
    eSignatureMappingJson: SCHWAB_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-11T13:00:00Z",
  },
  {
    id: "cfr-13",
    custodian: "Pershing",
    transactionType: "New account",
    registrationType: "Entity",
    formTemplateId: "tmpl-per-entity",
    formTemplateName: "Pershing LLC – Entity Account Form",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Pershing" },
        { field: "registration_type", operator: "eq", value: "entity" },
      ],
    }, null, 2),
    payloadTemplateJson: PERSHING_PAYLOAD,
    eSignatureMappingJson: PERSHING_ESIG,
    endpoints: [QUIK_PDF, PERSHING_API],
    enabled: false,
    updatedAt: "2026-02-10T08:15:00Z",
  },
  {
    id: "cfr-14",
    custodian: "Fidelity",
    transactionType: "New account",
    registrationType: "Entity",
    formTemplateId: "tmpl-fid-entity",
    formTemplateName: "Fidelity Entity Account Application",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "custodian", operator: "eq", value: "Fidelity" },
        { field: "registration_type", operator: "in", value: ["entity", "llc", "corporation"] },
      ],
    }, null, 2),
    payloadTemplateJson: FIDELITY_BROKERAGE_PAYLOAD,
    eSignatureMappingJson: FIDELITY_ESIG,
    endpoints: [QUIK_PDF],
    enabled: true,
    updatedAt: "2026-02-09T17:00:00Z",
  },
];

export const CLIENT_FORM_RULES: ClientFormRule[] = [
  {
    id: "clf-1",
    clientOrg: "Guardian",
    formName: "Guardian New Account Disclosure",
    formType: "Disclosure",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Guardian" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
      ],
      inclusion: "one_per_account",
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: EMPTY_JSON,
    description: "Standard disclosure included with every new account opening for Guardian.",
    enabled: true,
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "clf-2",
    clientOrg: "Guardian",
    formName: "Guardian Privacy Notice",
    formType: "Disclosure",
    roleType: "per_distinct_owner",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Guardian" },
      ],
      inclusion: "one_per_distinct_owner",
      dedup_by: "owner_ssn",
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: JSON.stringify({ "1own": "ownerSignerEmail" }, null, 2),
    description: "Privacy notice sent once per unique owner (deduped by SSN).",
    enabled: true,
    updatedAt: "2026-02-24T09:00:00Z",
  },
  {
    id: "clf-3",
    clientOrg: "Park Avenue",
    formName: "Park Avenue Suitability Questionnaire",
    formType: "PDF",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Park Avenue" },
        { field: "account_type", operator: "in", value: ["brokerage", "advisory"] },
      ],
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "ClientName", FieldValue: "{{.clientFullName}}" },
        { FieldName: "AccountType", FieldValue: "{{.accountType}}" },
        { FieldName: "RiskTolerance", FieldValue: "{{.riskTolerance}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "firstSignerEmail" }, null, 2),
    description: "Suitability questionnaire required for brokerage and advisory accounts.",
    enabled: true,
    updatedAt: "2026-02-23T16:00:00Z",
  },
  {
    id: "clf-4",
    clientOrg: "Guardian",
    formName: "Nevada State Disclosure",
    formType: "Disclosure",
    roleType: "per_person",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Guardian" },
        { field: "owner_state", operator: "eq", value: "NV" },
      ],
      inclusion: "one_per_person",
      geographic: true,
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: EMPTY_JSON,
    description: "Required disclosure for owners residing in Nevada.",
    enabled: true,
    updatedAt: "2026-02-22T11:00:00Z",
  },
  {
    id: "clf-5",
    clientOrg: "Mercer",
    formName: "Mercer Signature Addendum",
    formType: "Signature addendum",
    roleType: "per_signer",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Mercer" },
        { field: "signer_count", operator: "gt", value: 3 },
      ],
      inclusion: "when_signer_overflow",
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: JSON.stringify({
      "1own": "firstSignerEmail",
      "2own": "secondSignerEmail",
      "3own": "thirdSignerEmail",
      "4own": "fourthSignerEmail",
    }, null, 2),
    description: "Additional signature page when more than 3 signers are present.",
    enabled: true,
    updatedAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "clf-6",
    clientOrg: "Mercer",
    formName: "Mercer Advisory Agreement",
    formType: "PDF",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Mercer" },
        { field: "account_type", operator: "eq", value: "advisory" },
      ],
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "AdvisorName", FieldValue: "{{.advisorName}}" },
        { FieldName: "AccountNumber", FieldValue: "{{.accountNumber}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "clientSignerEmail" }, null, 2),
    description: "Advisory agreement required for all Mercer advisory accounts.",
    enabled: false,
    updatedAt: "2026-02-19T08:00:00Z",
  },
  {
    id: "clf-7",
    clientOrg: "Park Avenue",
    formName: "California Privacy Rights Disclosure",
    formType: "Disclosure",
    roleType: "per_distinct_owner",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Park Avenue" },
        { field: "owner_state", operator: "eq", value: "CA" },
      ],
      inclusion: "one_per_distinct_owner",
      geographic: true,
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: EMPTY_JSON,
    description: "CCPA disclosure for California-based owners.",
    enabled: true,
    updatedAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "clf-8",
    clientOrg: "Mercer",
    formName: "Mercer IRA Custodial Agreement",
    formType: "PDF",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Mercer" },
        { field: "registration_type", operator: "eq", value: "ira" },
      ],
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "AccountHolder", FieldValue: "{{.accountHolderName}}" },
        { FieldName: "IRAType", FieldValue: "{{.iraType}}" },
        { FieldName: "BeneficiaryName", FieldValue: "{{.beneficiaryName}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "accountHolderEmail" }, null, 2),
    description: "Custodial agreement for Mercer IRA accounts.",
    enabled: true,
    updatedAt: "2026-02-17T14:30:00Z",
  },
  {
    id: "clf-9",
    clientOrg: "Guardian",
    formName: "Guardian Beneficiary Designation Form",
    formType: "PDF",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Guardian" },
        { field: "has_beneficiary", operator: "eq", value: true },
      ],
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "OwnerName", FieldValue: "{{.ownerFullName}}" },
        { FieldName: "BeneficiaryName", FieldValue: "{{.beneficiaryName}}" },
        { FieldName: "BeneficiaryRelationship", FieldValue: "{{.beneficiaryRelationship}}" },
        { FieldName: "BeneficiaryPercentage", FieldValue: "{{.beneficiaryPercentage}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "ownerSignerEmail" }, null, 2),
    description: "Beneficiary designation required when beneficiaries are specified.",
    enabled: true,
    updatedAt: "2026-02-16T11:00:00Z",
  },
  {
    id: "clf-10",
    clientOrg: "Park Avenue",
    formName: "Park Avenue Fee Disclosure",
    formType: "Disclosure",
    roleType: "per_account",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Park Avenue" },
        { field: "account_type", operator: "eq", value: "advisory" },
      ],
      inclusion: "one_per_account",
    }, null, 2),
    payloadTemplateJson: EMPTY_JSON,
    eSignatureMappingJson: EMPTY_JSON,
    description: "Fee schedule disclosure for advisory accounts.",
    enabled: true,
    updatedAt: "2026-02-15T09:15:00Z",
  },
  {
    id: "clf-11",
    clientOrg: "Mercer",
    formName: "Mercer Anti-Money Laundering Certification",
    formType: "PDF",
    roleType: "per_person",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Mercer" },
        { field: "transaction_type", operator: "eq", value: "open_new_account" },
      ],
      inclusion: "one_per_person",
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "FullName", FieldValue: "{{.ownerFullName}}" },
        { FieldName: "SSN", FieldValue: "{{.ssn}}" },
        { FieldName: "DOB", FieldValue: "{{.dateOfBirth}}" },
        { FieldName: "Address", FieldValue: "{{.permanentAddress}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "signerEmail" }, null, 2),
    description: "AML certification required for each person on new accounts.",
    enabled: true,
    updatedAt: "2026-02-14T16:45:00Z",
  },
  {
    id: "clf-12",
    clientOrg: "Guardian",
    formName: "Guardian W-9 Tax Certification",
    formType: "PDF",
    roleType: "per_distinct_owner",
    rulesJson: JSON.stringify({
      conditions: [
        { field: "client_org", operator: "eq", value: "Guardian" },
        { field: "owner_citizenship", operator: "eq", value: "US" },
      ],
      inclusion: "one_per_distinct_owner",
      dedup_by: "owner_ssn",
    }, null, 2),
    payloadTemplateJson: JSON.stringify({
      FormFields: [
        { FieldName: "Name", FieldValue: "{{.ownerFullName}}" },
        { FieldName: "SSN", FieldValue: "{{.ssn}}" },
        { FieldName: "Address", FieldValue: "{{.permanentAddress}}" },
      ],
    }, null, 2),
    eSignatureMappingJson: JSON.stringify({ "1own": "ownerSignerEmail" }, null, 2),
    description: "W-9 tax form for US citizen owners, deduped by SSN.",
    enabled: true,
    updatedAt: "2026-02-13T10:00:00Z",
  },
];

export const FORM_TEMPLATES = [
  { id: "tmpl-fid-brokerage", name: "Fidelity Brokerage Application" },
  { id: "tmpl-fid-ira", name: "Fidelity IRA Account Application" },
  { id: "tmpl-fid-inherited-ira", name: "Fidelity Inherited IRA Application" },
  { id: "tmpl-fid-toa", name: "Fidelity FFOS Trust Application" },
  { id: "tmpl-fid-joint", name: "Fidelity Joint Account Application" },
  { id: "tmpl-fid-entity", name: "Fidelity Entity Account Application" },
  { id: "tmpl-sch-one", name: "Schwab One Account Application" },
  { id: "tmpl-sch-ira", name: "Schwab IRA Account Application" },
  { id: "tmpl-sch-toa", name: "Schwab Transfer of Assets Form" },
  { id: "tmpl-sch-wire", name: "Schwab Wire Transfer Authorization" },
  { id: "tmpl-per-individual", name: "Pershing Individual Brokerage Application" },
  { id: "tmpl-per-partnership", name: "Pershing LLC – Partnership Account Form" },
  { id: "tmpl-per-inherited", name: "Pershing LLC – Inherited IRA Application" },
  { id: "tmpl-per-entity", name: "Pershing LLC – Entity Account Form" },
];

// ─── Endpoint Service Catalog ────────────────────────────────────────

export const ENDPOINT_SERVICES: EndpointService[] = [
  {
    id: "svc-quik",
    name: "Quik PDF Service",
    endpoints: [
      { id: "ep-quik-generate", name: "Generate PDF", url: "https://api.quikforms.com/v1/generate" },
      { id: "ep-quik-prefill", name: "Prefill PDF", url: "https://api.quikforms.com/v1/prefill" },
    ],
  },
  {
    id: "svc-pershing",
    name: "Pershing Account API",
    endpoints: [
      { id: "ep-pershing-open", name: "Open Account", url: "https://api.pershing.com/v1/accounts" },
      { id: "ep-pershing-update", name: "Update Account", url: "https://api.pershing.com/v1/accounts/update" },
      { id: "ep-pershing-transfer", name: "Transfer Assets", url: "https://api.pershing.com/v1/transfers" },
    ],
  },
  {
    id: "svc-box",
    name: "Box Document API",
    endpoints: [
      { id: "ep-box-upload", name: "Upload Document", url: "https://api.box.com/2.0/files" },
      { id: "ep-box-sign", name: "Request Signature", url: "https://api.box.com/2.0/sign_requests" },
    ],
  },
];

export const DEFAULT_GLOBAL_ENDPOINTS: GlobalEndpoint[] = [
  {
    id: "gep-quik-pdf",
    label: "Quik PDF",
    serviceId: "svc-quik",
    serviceName: "Quik PDF Service",
    endpointId: "ep-quik-generate",
    endpointName: "Generate PDF",
    endpointUsage: "pdf",
    url: "https://api.quikforms.com/v1/generate",
  },
  {
    id: "gep-pershing-open",
    label: "Pershing API",
    serviceId: "svc-pershing",
    serviceName: "Pershing Account API",
    endpointId: "ep-pershing-open",
    endpointName: "Open Account",
    endpointUsage: "action",
    url: "https://api.pershing.com/v1/accounts",
  },
];
