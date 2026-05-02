export default {
  "name": "stealthql-saas",
  "tables": {
    "invoices": {
      "columns": {
        "amountCents": {
          "required": true,
          "type": "money"
        },
        "createdAt": {
          "type": "date"
        },
        "customerName": {
          "required": true,
          "type": "text"
        },
        "id": {
          "primary": true,
          "type": "text"
        },
        "internalNote": {
          "type": "longText"
        },
        "orgId": {
          "required": true,
          "type": "text"
        },
        "status": {
          "default": "draft",
          "type": "status"
        }
      },
      "indexes": [
        [
          "orgId"
        ],
        [
          "status"
        ],
        [
          "orgId",
          "status"
        ]
      ],
      "searchIndexes": {
        "default": [
          "customerName",
          "status"
        ]
      },
      "tenant": {
        "field": "orgId"
      }
    },
    "memberships": {
      "columns": {
        "createdAt": {
          "type": "date"
        },
        "disabledAt": {
          "type": "date"
        },
        "id": {
          "primary": true,
          "type": "text"
        },
        "invitedAt": {
          "type": "date"
        },
        "joinedAt": {
          "type": "date"
        },
        "orgId": {
          "required": true,
          "type": "text"
        },
        "role": {
          "default": "member",
          "type": "status"
        },
        "status": {
          "default": "active",
          "type": "status"
        },
        "suspendedAt": {
          "type": "date"
        },
        "twoFactorRequired": {
          "default": false,
          "type": "checkbox"
        },
        "userId": {
          "required": true,
          "type": "text"
        }
      },
      "indexes": [
        [
          "orgId"
        ],
        [
          "userId"
        ],
        [
          "orgId",
          "role"
        ],
        [
          "orgId",
          "status"
        ]
      ],
      "tenant": {
        "field": "orgId"
      }
    },
    "organizations": {
      "columns": {
        "createdAt": {
          "type": "date"
        },
        "id": {
          "primary": true,
          "type": "text"
        },
        "name": {
          "required": true,
          "type": "text"
        },
        "plan": {
          "default": "free",
          "type": "status"
        },
        "slug": {
          "required": true,
          "type": "text"
        }
      },
      "indexes": [
        [
          "slug"
        ],
        [
          "plan"
        ]
      ]
    },
    "projects": {
      "columns": {
        "createdAt": {
          "type": "date"
        },
        "id": {
          "primary": true,
          "type": "text"
        },
        "name": {
          "required": true,
          "type": "text"
        },
        "orgId": {
          "required": true,
          "type": "text"
        },
        "ownerId": {
          "required": true,
          "type": "text"
        },
        "status": {
          "default": "active",
          "type": "status"
        },
        "visibility": {
          "default": "private",
          "type": "status"
        }
      },
      "indexes": [
        [
          "orgId"
        ],
        [
          "ownerId"
        ],
        [
          "visibility"
        ],
        [
          "status"
        ],
        [
          "orgId",
          "visibility"
        ]
      ],
      "searchIndexes": {
        "default": [
          "name"
        ]
      },
      "tenant": {
        "field": "orgId"
      }
    },
    "users": {
      "columns": {
        "avatarUrl": {
          "type": "url"
        },
        "createdAt": {
          "type": "date"
        },
        "disabledAt": {
          "type": "date"
        },
        "email": {
          "required": true,
          "type": "email"
        },
        "emailVerifiedAt": {
          "type": "date"
        },
        "id": {
          "primary": true,
          "type": "text"
        },
        "name": {
          "required": true,
          "type": "text"
        },
        "orgId": {
          "required": true,
          "type": "text"
        },
        "phone": {
          "type": "phone"
        },
        "phoneVerifiedAt": {
          "type": "date"
        },
        "role": {
          "default": "member",
          "type": "status"
        },
        "signedUpAt": {
          "type": "date"
        },
        "status": {
          "default": "active",
          "type": "status"
        },
        "suspendedAt": {
          "type": "date"
        },
        "twoFactorRequired": {
          "default": false,
          "type": "checkbox"
        }
      },
      "indexes": [
        [
          "orgId"
        ],
        [
          "email"
        ],
        [
          "status"
        ],
        [
          "role"
        ],
        [
          "orgId",
          "role"
        ],
        [
          "orgId",
          "status"
        ]
      ],
      "tenant": {
        "field": "orgId"
      }
    }
  }
};
