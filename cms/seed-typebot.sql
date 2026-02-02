-- Variables
\set workspace_id 'cml51jvwq0000o92zv55rvb30'
\set typebot_id 'real-estate-concierge-id'
\set public_id 'real-estate-concierge'

-- 1. Ensure Workspace Exists (if not, create one)
INSERT INTO "Workspace" (id, name, plan, "createdAt", "updatedAt")
VALUES (:'workspace_id', 'My Workspace', 'FREE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Typebot (The Builder Version)
INSERT INTO "Typebot" (
    id,
    "workspaceId",
    name,
    "publicId",
    groups,
    variables,
    edges,
    theme,
    settings,
    "createdAt",
    "updatedAt",
    "isArchived",
    "isClosed"
) VALUES (
    :'typebot_id',
    :'workspace_id',
    'Real Estate Concierge',
    :'public_id',
    '[
      {
        "id": "group1",
        "title": "Start",
        "blocks": [
          {
            "id": "block1",
            "type": "start",
            "label": "Start"
          },
          {
            "id": "block2",
            "type": "text",
            "content": {
              "richText": [
                {
                  "type": "p",
                  "children": [
                    {
                      "text": "Welcome to "
                    },
                    {
                      "text": "{{AgencyName}}",
                      "bold": true
                    },
                    {
                      "text": "! I am your personal assistant."
                    }
                  ]
                }
              ]
            }
          },
          {
             "id": "block3",
             "type": "text",
             "content": {
                "richText": [{"type": "p", "children": [{"text": "How can I help you find your dream home today?"}]}]
             }
          },
          {
            "id": "block4",
            "type": "text-input",
            "options": {
                "labels": {
                    "placeholder": "Type your budget or location..."
                },
                "variableId": "var1"
            }
          }
        ],
        "graphCoordinates": { "x": 0, "y": 0 }
      },
      {
        "id": "group2",
        "title": "End",
        "blocks": [
            {
                "id": "block5",
                "type": "text",
                "content": {
                    "richText": [{"type": "p", "children": [{"text": "Perfect! Searching our database for listings matching \""}] },{"type": "p", "children": [{"text": "{{User Input}}"}] },{"type": "p", "children": [{"text": "\"..."}]}]
                }
            }
        ],
        "graphCoordinates": { "x": 0, "y": 300 }
      }
    ]',
    '[
        {"id": "var1", "name": "User Input"},
        {"id": "var2", "name": "AgencyName"},
        {"id": "var3", "name": "PrimaryColor"}
    ]',
    '[
        {
            "id": "edge1",
            "from": { "blockId": "block4", "path": "default" },
            "to": { "groupId": "group2" }
        }
    ]',
    '{
      "general": {
        "font": "Inter",
        "background": { "type": "Color", "content": "#ffffff" }
      },
      "chat": {
        "hostBubbles": { "backgroundColor": "#000000", "color": "#ffffff" },
        "guestBubbles": { "backgroundColor": "#F7F8FF", "color": "#000000" }
      }
    }',
    '{}',
    NOW(),
    NOW(),
    false,
    false
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert PublicTypebot (The Published Version)
INSERT INTO "PublicTypebot" (
    id,
    "typebotId",
    groups,
    variables,
    edges,
    theme,
    settings,
    "createdAt",
    "updatedAt",
    version
) 
SELECT 
    'public-real-estate-concierge-id',
    id,
    groups,
    variables,
    edges,
    theme,
    settings,
    NOW(),
    NOW(),
    '6'
FROM "Typebot"
WHERE id = :'typebot_id'
ON CONFLICT ("typebotId") DO UPDATE SET
    groups = EXCLUDED.groups,
    variables = EXCLUDED.variables,
    edges = EXCLUDED.edges,
    theme = EXCLUDED.theme,
    settings = EXCLUDED.settings,
    "updatedAt" = NOW();
