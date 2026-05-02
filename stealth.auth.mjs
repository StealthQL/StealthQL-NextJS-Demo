export default {
  "actors": {
    "alice": {
      "activeMembership": {
        "orgId": "org_acme",
        "role": "admin",
        "roles": [
          "admin"
        ],
        "status": "active"
      },
      "activeOrgId": "org_acme",
      "email": "alice@example.com",
      "id": "user_alice",
      "memberships": [
        {
          "joinedAt": "2026-01-01T00:00:00.000Z",
          "orgId": "org_acme",
          "role": "admin",
          "roles": [
            "admin"
          ],
          "status": "active"
        }
      ],
      "name": "Alice",
      "orgIds": [
        "org_acme"
      ],
      "phone": "+15550101001",
      "platformRoles": [],
      "roles": [
        "admin"
      ],
      "signedUpAt": "2026-01-01T00:00:00.000Z",
      "status": "active",
      "twoFactorRequired": false
    },
    "anonymous": {
      "activeMembership": null,
      "activeOrgId": null,
      "id": "anon",
      "memberships": [],
      "orgIds": [],
      "platformRoles": [],
      "roles": [
        "anonymous"
      ],
      "status": "anonymous"
    },
    "bob": {
      "activeMembership": {
        "orgId": "org_beta",
        "role": "member",
        "roles": [
          "member"
        ],
        "status": "active"
      },
      "activeOrgId": "org_beta",
      "email": "bob@example.com",
      "id": "user_bob",
      "memberships": [
        {
          "joinedAt": "2026-01-02T00:00:00.000Z",
          "orgId": "org_beta",
          "role": "member",
          "roles": [
            "member"
          ],
          "status": "active"
        }
      ],
      "name": "Bob",
      "orgIds": [
        "org_beta"
      ],
      "phone": "+15550101002",
      "platformRoles": [],
      "roles": [
        "member"
      ],
      "signedUpAt": "2026-01-02T00:00:00.000Z",
      "status": "active",
      "twoFactorRequired": false
    },
    "support": {
      "activeMembership": null,
      "activeOrgId": null,
      "email": "support@stealthql.com",
      "id": "support_1",
      "memberships": [],
      "orgIds": [],
      "platformRoles": [
        "support"
      ],
      "roles": []
    }
  },
  "authConfig": {
    "actorMapping": {
      "email": "users.email",
      "id": "users.id",
      "orgIds": "memberships.orgId",
      "roles": "memberships.role"
    },
    "csrf": {
      "allowMissingOriginWithFetchMetadata": true,
      "requireOriginForUnsafeMethods": true
    },
    "hostedAuth": {
      "anonymousUsers": true,
      "emailOtp": true,
      "emailPassword": true,
      "emailVerification": true,
      "magicLink": true,
      "oauth": [
        "google",
        "github"
      ],
      "passwordReset": true,
      "refreshTokenRotation": true
    },
    "localEmulator": {
      "enabled": true,
      "invites": true,
      "magicLinks": true,
      "signInAs": true,
      "testUsers": true
    },
    "memberContract": {
      "factors": [
        "magic",
        "sms",
        "totp"
      ],
      "fields": {
        "disabledAt": "disabledAt",
        "email": "email",
        "emailVerifiedAt": "emailVerifiedAt",
        "id": "id",
        "name": "name",
        "phone": "phone",
        "phoneVerifiedAt": "phoneVerifiedAt",
        "signedUpAt": "signedUpAt",
        "status": "status",
        "suspendedAt": "suspendedAt",
        "twoFactorRequired": "twoFactorRequired"
      },
      "membershipFields": {
        "disabledAt": "disabledAt",
        "id": "id",
        "invitedAt": "invitedAt",
        "joinedAt": "joinedAt",
        "orgId": "orgId",
        "role": "role",
        "status": "status",
        "suspendedAt": "suspendedAt",
        "twoFactorRequired": "twoFactorRequired",
        "userId": "userId"
      },
      "membershipTable": "memberships",
      "requiredFactors": 2,
      "statuses": {
        "active": "active",
        "deleted": "deleted",
        "disabled": "disabled",
        "invited": "invited",
        "suspended": "suspended"
      },
      "userTable": "users"
    },
    "mode": "capsule-native",
    "oauth": {
      "allowedCallbackOrigins": []
    },
    "organizations": {
      "adminRole": "admin",
      "defaultRole": "member",
      "membershipTable": "memberships",
      "roleField": "role",
      "table": "organizations",
      "userTable": "users"
    },
    "production": {
      "allowedOrigins": [],
      "allowedRedirectOrigins": [],
      "requireHttps": true
    },
    "sessions": {
      "accessTokenMinutes": 60,
      "cookieName": "stealth_session",
      "refreshTokenDays": 30,
      "refreshTokenRotation": true,
      "sameSite": "Lax",
      "secureCookies": true
    },
    "setupGoal": "email/password, magic links, local actors, invites, organizations, roles, and sessions"
  },
  "dataVisibility": {
    "invoices": {
      "aiReadable": "redacted branches only",
      "allowedInPreviewBranches": "redacted",
      "cloudReadable": "hosted mode only",
      "encryptedBy": "workspace",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": false,
        "evidencePacket": true,
        "externalShare": true,
        "mobileDevice": true,
        "server": true,
        "supportExport": false
      },
      "stored": "customer-owned-or-hosted",
      "supportReadable": false
    },
    "invoices.internalNote": {
      "aiReadable": false,
      "cloudReadable": false,
      "encryptedBy": "customer",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": false,
        "evidencePacket": true,
        "externalShare": false,
        "mobileDevice": false,
        "server": true,
        "supportExport": false
      },
      "stored": "customer-owned preferred",
      "supportReadable": false
    },
    "memberships": {
      "aiReadable": "redacted branches only",
      "cloudReadable": "hosted mode only",
      "encryptedBy": "workspace",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": false,
        "evidencePacket": true,
        "externalShare": false,
        "mobileDevice": true,
        "server": true,
        "supportExport": false
      },
      "stored": "materializer-selected",
      "supportReadable": false
    },
    "projects": {
      "aiReadable": "redacted branches only",
      "cloudReadable": "only when materialized",
      "encryptedBy": "workspace",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": true,
        "evidencePacket": true,
        "externalShare": true,
        "mobileDevice": true,
        "server": true,
        "supportExport": false
      },
      "stored": "materializer-selected",
      "supportReadable": false
    },
    "users.email": {
      "aiReadable": false,
      "cloudReadable": true,
      "encryptedBy": "runtime",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": false,
        "evidencePacket": true,
        "externalShare": false,
        "mobileDevice": true,
        "server": true,
        "supportExport": false
      },
      "stored": "hosted-or-local",
      "supportReadable": false
    },
    "users.phone": {
      "aiReadable": false,
      "cloudReadable": true,
      "encryptedBy": "runtime",
      "mayExistOn": {
        "aiPrompt": false,
        "browserCache": false,
        "evidencePacket": true,
        "externalShare": false,
        "mobileDevice": true,
        "server": true,
        "supportExport": false
      },
      "stored": "hosted-or-local",
      "supportReadable": false
    }
  },
  "fieldPolicies": {
    "invoices": {
      "internalNote": {
        "insert": {
          "includes": [
            "actor.activeMembership.roles",
            "admin"
          ]
        },
        "mask": "[redacted]",
        "read": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        },
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      }
    },
    "memberships": {
      "disabledAt": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "orgId": {
        "update": false
      },
      "role": {
        "insert": {
          "any": [
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "input.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            },
            {
              "includes": [
                "actor.scopes",
                "users:role:write"
              ]
            }
          ]
        },
        "update": {
          "any": [
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "row.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            },
            {
              "includes": [
                "actor.scopes",
                "users:role:write"
              ]
            }
          ]
        }
      },
      "status": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "suspendedAt": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "twoFactorRequired": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "userId": {
        "update": false
      }
    },
    "organizations": {
      "id": {
        "update": false
      }
    },
    "projects": {
      "orgId": {
        "update": false
      },
      "ownerId": {
        "update": false
      }
    },
    "users": {
      "disabledAt": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "email": {
        "mask": "[private email]",
        "read": {
          "any": [
            {
              "eq": [
                "row.id",
                "actor.id"
              ]
            },
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "row.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            }
          ]
        }
      },
      "orgId": {
        "update": false
      },
      "phone": {
        "mask": "[private phone]",
        "read": {
          "any": [
            {
              "eq": [
                "row.id",
                "actor.id"
              ]
            },
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "row.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            }
          ]
        }
      },
      "role": {
        "insert": {
          "any": [
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "input.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            },
            {
              "includes": [
                "actor.scopes",
                "users:role:write"
              ]
            }
          ]
        },
        "update": {
          "any": [
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "row.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            },
            {
              "includes": [
                "actor.scopes",
                "users:role:write"
              ]
            }
          ]
        }
      },
      "status": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "suspendedAt": {
        "update": {
          "all": [
            {
              "includes": [
                "actor.activeMembership.roles",
                "admin"
              ]
            },
            {
              "eq": [
                "row.orgId",
                "actor.activeOrgId"
              ]
            }
          ]
        }
      },
      "twoFactorRequired": {
        "update": {
          "any": [
            {
              "eq": [
                "row.id",
                "actor.id"
              ]
            },
            {
              "all": [
                {
                  "includes": [
                    "actor.activeMembership.roles",
                    "admin"
                  ]
                },
                {
                  "eq": [
                    "row.orgId",
                    "actor.activeOrgId"
                  ]
                }
              ]
            },
            {
              "includes": [
                "actor.scopes",
                "provisioning:write"
              ]
            }
          ]
        }
      }
    }
  },
  "functionPolicies": {
    "createProject": {
      "execute": {
        "any": [
          {
            "exists": "actor.activeOrgId"
          },
          {
            "includes": [
              "actor.scopes",
              "projects:write"
            ]
          }
        ]
      }
    },
    "sendInvoiceReminder": {
      "execute": {
        "any": [
          {
            "exists": "actor.activeOrgId"
          },
          {
            "includes": [
              "actor.scopes",
              "billing:write"
            ]
          }
        ]
      }
    }
  },
  "policies": {
    "invoices": {
      "delete": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "billing:delete"
            ]
          }
        ]
      },
      "insert": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "input.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "billing:write"
            ]
          }
        ]
      },
      "read": {
        "any": [
          {
            "eq": [
              "row.orgId",
              "actor.activeOrgId"
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "billing:read"
            ]
          }
        ]
      },
      "update": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "billing:write"
            ]
          }
        ]
      }
    },
    "memberships": {
      "delete": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "users:delete"
            ]
          }
        ]
      },
      "insert": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "input.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "read": {
        "any": [
          {
            "eq": [
              "row.userId",
              "actor.id"
            ]
          },
          {
            "eq": [
              "row.orgId",
              "actor.activeOrgId"
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "update": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      }
    },
    "organizations": {
      "delete": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.id",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "insert": {
        "any": [
          {
            "includes": [
              "actor.activeMembership.roles",
              "admin"
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "read": {
        "any": [
          {
            "eq": [
              "row.id",
              "actor.activeOrgId"
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "update": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.id",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      }
    },
    "projects": {
      "delete": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "projects:delete"
            ]
          }
        ]
      },
      "insert": {
        "any": [
          {
            "all": [
              {
                "eq": [
                  "input.orgId",
                  "actor.activeOrgId"
                ]
              },
              {
                "eq": [
                  "input.ownerId",
                  "actor.id"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "projects:write"
            ]
          }
        ]
      },
      "read": {
        "any": [
          {
            "visibility": "public"
          },
          {
            "eq": [
              "row.orgId",
              "actor.activeOrgId"
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "projects:read"
            ]
          }
        ]
      },
      "update": {
        "any": [
          {
            "all": [
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              },
              {
                "eq": [
                  "row.ownerId",
                  "actor.id"
                ]
              }
            ]
          },
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "projects:write"
            ]
          }
        ]
      }
    },
    "users": {
      "delete": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "users:delete"
            ]
          }
        ]
      },
      "insert": {
        "any": [
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "input.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "read": {
        "any": [
          {
            "eq": [
              "row.id",
              "actor.id"
            ]
          },
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      },
      "update": {
        "any": [
          {
            "eq": [
              "row.id",
              "actor.id"
            ]
          },
          {
            "all": [
              {
                "includes": [
                  "actor.activeMembership.roles",
                  "admin"
                ]
              },
              {
                "eq": [
                  "row.orgId",
                  "actor.activeOrgId"
                ]
              }
            ]
          },
          {
            "includes": [
              "actor.scopes",
              "provisioning:write"
            ]
          }
        ]
      }
    }
  },
  "serviceAccounts": {
    "system": {
      "id": "svc_system",
      "scopes": [
        "provisioning:write",
        "users:delete",
        "users:role:write",
        "projects:read",
        "projects:write",
        "projects:delete",
        "billing:read",
        "billing:write",
        "billing:delete",
        "share:issue",
        "share:manage"
      ],
      "tokenEnv": "STEALTHQL_SERVICE_TOKEN"
    }
  }
};
