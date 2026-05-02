export default {
  "shares": {
    "supportRedactedAcme": {
      "label": "Acme support share (redacted)",
      "owner": "alice",
      "principal": { "actor": "support" },
      "resource": { "table": "invoices", "type": "table" },
      "filter": { "eq": ["row.orgId", "org_acme"] },
      "fields": ["id", "customerName", "status"],
      "hiddenFields": ["amountCents", "internalNote", "orgId", "createdAt"],
      "grants": ["read"],
      "mode": "readonly",
      "expiresAt": "2027-01-01T00:00:00.000Z",
      "revoked": false
    },
    "supportRedactedAcmeRevoked": {
      "label": "Revoked support share",
      "owner": "alice",
      "principal": { "actor": "support" },
      "resource": { "table": "invoices", "type": "table" },
      "filter": { "eq": ["row.orgId", "org_acme"] },
      "fields": ["id", "customerName", "status"],
      "hiddenFields": ["amountCents", "internalNote", "orgId", "createdAt"],
      "grants": ["read"],
      "mode": "readonly",
      "expiresAt": "2027-01-01T00:00:00.000Z",
      "revoked": true
    },
    "supportRedactedAcmeExpired": {
      "label": "Expired support share",
      "owner": "alice",
      "principal": { "actor": "support" },
      "resource": { "table": "invoices", "type": "table" },
      "filter": { "eq": ["row.orgId", "org_acme"] },
      "fields": ["id", "customerName", "status"],
      "hiddenFields": ["amountCents", "internalNote", "orgId", "createdAt"],
      "grants": ["read"],
      "mode": "readonly",
      "expiresAt": "2000-01-01T00:00:00.000Z",
      "revoked": false
    },
    "acmeInvoicePageForBob": {
      "label": "Acme invoice page for Bob",
      "owner": "alice",
      "principal": { "actor": "bob" },
      "resource": { "id": "inv_acme_001", "table": "invoices", "type": "row" },
      "fields": ["id", "customerName", "amountCents", "status"],
      "grants": ["read", "sign"],
      "mode": "readonly",
      "expiresAt": "2027-01-01T00:00:00.000Z",
      "revoked": false,
      "actions": {
        "sign": {
          "documentTemplate": "invoice-approval-v1",
          "documentVersion": "1",
          "lockAfterSign": true,
          "requires": ["fullName", "consent", "signatureImage"],
          "signatureBucket": "signatures",
          "type": "contract-signature"
        }
      }
    },
    "acmeInvoicesForBob": {
      "label": "Acme invoices for Bob",
      "owner": "alice",
      "principal": { "actor": "bob" },
      "resource": { "table": "invoices", "type": "table" },
      "filter": { "eq": ["row.orgId", "org_acme"] },
      "fields": ["id", "customerName", "amountCents", "status"],
      "hiddenFields": ["internalNote"],
      "grants": ["read", "propose:update"],
      "mode": "proposal",
      "writes": "proposal",
      "csvRoundTrip": true,
      "expiresAt": "2027-01-01T00:00:00.000Z",
      "proposalFields": ["status"],
      "revoked": false
    }
  }
};
