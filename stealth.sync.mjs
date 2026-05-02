export default {
  "shapes": {
    "myInvoices": {
      "fields": [
        "id",
        "orgId",
        "customerName",
        "amountCents",
        "status"
      ],
      "read": {
        "eq": [
          "row.orgId",
          "actor.activeOrgId"
        ]
      },
      "table": "invoices"
    },
    "myMemberships": {
      "read": {
        "eq": [
          "row.orgId",
          "actor.activeOrgId"
        ]
      },
      "table": "memberships"
    },
    "myOrganization": {
      "read": {
        "eq": [
          "row.id",
          "actor.activeOrgId"
        ]
      },
      "table": "organizations"
    },
    "myProjects": {
      "read": {
        "eq": [
          "row.orgId",
          "actor.activeOrgId"
        ]
      },
      "table": "projects"
    },
    "publicProjects": {
      "read": {
        "visibility": "public"
      },
      "table": "projects"
    }
  }
};
