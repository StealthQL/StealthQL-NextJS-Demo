export default [
  {
    "action": "read",
    "actor": "alice",
    "expect": true,
    "name": "Alice can read her org project",
    "rowId": "proj_acme_private",
    "table": "projects"
  },
  {
    "action": "read",
    "actor": "bob",
    "expect": false,
    "name": "Bob cannot read Alice private project",
    "rowId": "proj_acme_private",
    "table": "projects"
  },
  {
    "action": "read",
    "actor": "anonymous",
    "expect": true,
    "name": "Anonymous can read public project",
    "rowId": "proj_public_demo",
    "table": "projects"
  },
  {
    "action": "insert",
    "actor": "anonymous",
    "expect": false,
    "input": {
      "id": "proj_bad",
      "name": "bad",
      "orgId": "org_acme",
      "ownerId": "anon"
    },
    "name": "Anonymous cannot create project",
    "table": "projects"
  },
  {
    "action": "read",
    "actor": "alice",
    "expect": true,
    "name": "Alice can read Acme membership",
    "rowId": "mem_alice_acme",
    "table": "memberships"
  },
  {
    "action": "read",
    "actor": "bob",
    "expect": false,
    "name": "Bob cannot read Acme membership",
    "rowId": "mem_alice_acme",
    "table": "memberships"
  },
  {
    "action": "read",
    "actor": "support",
    "expect": false,
    "name": "Support cannot read customer invoices by default",
    "rowId": "inv_acme_001",
    "table": "invoices"
  },
  {
    "actor": "bob",
    "expect": true,
    "forbiddenFields": [
      "internalNote"
    ],
    "kind": "share.read",
    "name": "Bob can read delegated invoices without internal notes",
    "requiredFields": [
      "id",
      "customerName",
      "amountCents",
      "status"
    ],
    "rowId": "inv_acme_001",
    "shareId": "acmeInvoicesForBob"
  }
];
