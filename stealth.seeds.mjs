export default {
  "invoices": [
    {
      "amountCents": 4900,
      "createdAt": "2026-01-06T00:00:00.000Z",
      "customerName": "Northstar Labs",
      "id": "inv_acme_001",
      "internalNote": "Discount approved by founder.",
      "orgId": "org_acme",
      "status": "open"
    },
    {
      "amountCents": 12900,
      "createdAt": "2026-01-07T00:00:00.000Z",
      "customerName": "Beta Works",
      "id": "inv_beta_001",
      "internalNote": "Needs procurement contact.",
      "orgId": "org_beta",
      "status": "draft"
    }
  ],
  "memberships": [
    {
      "createdAt": "2026-01-01T00:00:00.000Z",
      "disabledAt": null,
      "id": "mem_alice_acme",
      "invitedAt": null,
      "joinedAt": "2026-01-01T00:00:00.000Z",
      "orgId": "org_acme",
      "role": "admin",
      "status": "active",
      "suspendedAt": null,
      "twoFactorRequired": false,
      "userId": "user_alice"
    },
    {
      "createdAt": "2026-01-02T00:00:00.000Z",
      "disabledAt": null,
      "id": "mem_bob_beta",
      "invitedAt": null,
      "joinedAt": "2026-01-02T00:00:00.000Z",
      "orgId": "org_beta",
      "role": "member",
      "status": "active",
      "suspendedAt": null,
      "twoFactorRequired": false,
      "userId": "user_bob"
    }
  ],
  "organizations": [
    {
      "createdAt": "2026-01-01T00:00:00.000Z",
      "id": "org_acme",
      "name": "Acme Labs",
      "plan": "pro",
      "slug": "acme"
    },
    {
      "createdAt": "2026-01-02T00:00:00.000Z",
      "id": "org_beta",
      "name": "Beta Works",
      "plan": "free",
      "slug": "beta"
    }
  ],
  "projects": [
    {
      "createdAt": "2026-01-03T00:00:00.000Z",
      "id": "proj_acme_private",
      "name": "Acme private launch",
      "orgId": "org_acme",
      "ownerId": "user_alice",
      "status": "active",
      "visibility": "private"
    },
    {
      "createdAt": "2026-01-04T00:00:00.000Z",
      "id": "proj_beta_private",
      "name": "Beta private launch",
      "orgId": "org_beta",
      "ownerId": "user_bob",
      "status": "active",
      "visibility": "private"
    },
    {
      "createdAt": "2026-01-05T00:00:00.000Z",
      "id": "proj_public_demo",
      "name": "Public capsule demo",
      "orgId": "org_acme",
      "ownerId": "user_alice",
      "status": "active",
      "visibility": "public"
    }
  ],
  "users": [
    {
      "createdAt": "2026-01-01T00:00:00.000Z",
      "disabledAt": null,
      "email": "alice@example.com",
      "emailVerifiedAt": "2026-01-01T00:00:00.000Z",
      "id": "user_alice",
      "name": "Alice",
      "orgId": "org_acme",
      "phone": "+15550101001",
      "phoneVerifiedAt": null,
      "role": "admin",
      "signedUpAt": "2026-01-01T00:00:00.000Z",
      "status": "active",
      "suspendedAt": null,
      "twoFactorRequired": false
    },
    {
      "createdAt": "2026-01-02T00:00:00.000Z",
      "disabledAt": null,
      "email": "bob@example.com",
      "emailVerifiedAt": "2026-01-02T00:00:00.000Z",
      "id": "user_bob",
      "name": "Bob",
      "orgId": "org_beta",
      "phone": "+15550101002",
      "phoneVerifiedAt": null,
      "role": "member",
      "signedUpAt": "2026-01-02T00:00:00.000Z",
      "status": "active",
      "suspendedAt": null,
      "twoFactorRequired": false
    }
  ]
};
