export default {
  "buckets": {
    "projectFiles": {
      "maxBytes": 10485760,
      "read": {
        "eq": [
          "row.orgId",
          "actor.activeOrgId"
        ]
      },
      "visibility": {
        "cloudReadable": false,
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
        "stored": "local-filesystem-or-object-storage"
      },
      "write": {
        "eq": [
          "input.orgId",
          "actor.activeOrgId"
        ]
      }
    },
    "publicAssets": {
      "maxBytes": 5242880,
      "read": true,
      "visibility": {
        "cloudReadable": true,
        "encryptedBy": "runtime",
        "mayExistOn": {
          "aiPrompt": false,
          "browserCache": true,
          "evidencePacket": true,
          "externalShare": true,
          "mobileDevice": true,
          "server": true,
          "supportExport": false
        },
        "stored": "edge-readable"
      },
      "write": {
        "includes": [
          "actor.activeMembership.roles",
          "admin"
        ]
      }
    },
    "signatures": {
      "maxBytes": 1048576,
      "read": {
        "eq": [
          "row.orgId",
          "actor.activeOrgId"
        ]
      },
      "visibility": {
        "aiReadable": false,
        "cloudReadable": false,
        "encryptedBy": "workspace",
        "mayExistOn": {
          "aiPrompt": false,
          "browserCache": false,
          "evidencePacket": true,
          "externalShare": false,
          "mobileDevice": false,
          "server": true,
          "supportExport": false
        },
        "stored": "local-filesystem-or-object-storage",
        "supportReadable": false
      },
      "write": {
        "eq": [
          "input.orgId",
          "actor.activeOrgId"
        ]
      }
    }
  }
};
