# n8n Configuration for LinkedIn Post Generator

## Output Format Required

Your n8n workflow should return JSON in this format:

```json
[
  {
    "output": "📊 Your Post Title Here\n\nYour post content with proper Unicode formatting...\n\n🔑 Key Points:\n• Point one\n• Point two\n• Point three\n\n─────────────────\n\n🔗 Read more: https://example.com\n\n#Hashtag1 #Hashtag2 #Hashtag3"
  }
]
```

## N8N flow configuration

Expected response:
```json
{
  "name": "LinkedIn Post Generator from URL",
  "nodes": [
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "name": "Return Post",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        736,
        -176
      ],
      "id": "103663ae-f155-45db-8351-f195f0b74f03"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=**Role:**\nAct as a recognized Technical Thought Leader and LinkedIn Algorithm Specialist. Your tone is authoritative, insightful, and professional.\n\n**Task:**\nAnalyze the provided content and write a high-engagement LinkedIn post that breaks down the technical complexity for a professional audience.\n\n**Narrative Structure (Strictly Follow This Arc):**\n1. **The Headline:** A punchy, bold title using Unicode characters.\n2. **The Hook (The Problem):** Start with a counter-intuitive statement or a common technical pain point related to the content.\n3. **The Pivot (The Solution):** Briefly explain the technical solution or methodology described in the content. Focus on the \"how\" and \"mechanics.\"\n4. **The Payoff (The Insight):** Conclude with a strategic insight or \"lesson learned.\" Why does this technical detail matter for the bigger picture?\n5. **The Engagement:** End with a short, thought-provoking question.\n\n**Formatting & Constraints:**\n- **Typography:** You **must** use Unicode text modifiers for key emphasis (e.g., 𝐇𝐞𝐚𝐝𝐥𝐢𝐧𝐞𝐬 or 𝗕𝗼𝐥𝐝 𝗧𝗲𝘅𝘁) to make the font stand out in the LinkedIn feed.\n- **Visual Appeal:** Use relevant **emojis** (e.g., ⚙️, 🚀, 💡, 🛑) and **bullet points** (e.g., 🔹, ▪️, 👉) to organize the text.\n- **Length:** Strictly under 250 words.\n- **Scannability:** Use short paragraphs (1-2 sentences max).\n- **Artifact Extraction:** Extract all technical artifacts (system screenshots, CLI outputs, POC data URLs/links) and group them exclusively under a specific \"📸 Screenshots/Assets\" header.\n- **Style:** Avoid buzzwords; Avoid any markdown things even dont use asterisk; use concrete technical terminology.\n- **Output:** Provide ONLY the post content. No conversational fillers.\n\n**Output Template:**\n[𝐇𝐄𝐀𝐃𝐋𝐈𝐍𝐄 𝐈𝐍 𝐁𝐎𝐋𝐃 𝐂𝐀𝐏𝐒]\n\n[Hook with Emoji]\n\n[Body: Problem -> Solution -> Insight using 𝗕𝗼𝐥𝗱 𝗨𝗻𝗶𝗰𝗼𝗱𝗲 for emphasis and bullets]\n\n[Question/Call to Action]\n\n🔗 Link: {{ $('Get Linkedin URL').item.json.linkgen }}\n\n📸 **Screenshots/Assets:**\n[List extracted artifacts here]\n\n[Hashtags]\n\n[Share & Follow]\n____\nFound this helpful? Repost it! ♻️ And don't forget to follow me for more daily insights.\n\n[/Share & Follow]\n\n**Input Content:**\n{{ $json.data.markdown }}",
        "options": {}
      },
      "id": "12aa099b-8bb4-4ce1-bec4-d7b416e48369",
      "name": "Social Media Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "position": [
        416,
        -176
      ],
      "typeVersion": 1.6
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      "typeVersion": 1,
      "position": [
        432,
        0
      ],
      "id": "bbe00120-c96c-4748-88db-8b262ac5db58",
      "name": "Google Gemini Chat Model",
      "credentials": {
        "googlePalmApi": {
          "id": "g5L0rLsRGOH9YjPU",
          "name": "Google Gemini(PaLM) Api account"
        }
      }
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "linkgen",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "9b722244-b7c3-4ca3-900b-34a872134637",
      "name": "Webhook1",
      "type": "n8n-nodes-base.webhook",
      "position": [
        -208,
        -176
      ],
      "webhookId": "9024e29e-9080-4cf5-9a6b-0d918468f195",
      "typeVersion": 2
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "3ee42e4c-3cee-4934-97e7-64c96b5691ed",
              "name": "linkgen",
              "type": "string",
              "value": "={{ $json.body.blog_url }}"
            }
          ]
        },
        "options": {}
      },
      "id": "32fb0a45-9910-4ff5-8f03-b30f58f59a30",
      "name": "Get Linkedin URL",
      "type": "n8n-nodes-base.set",
      "position": [
        0,
        -176
      ],
      "typeVersion": 3.4
    },
    {
      "parameters": {
        "operation": "scrape",
        "url": "={{ $json.linkgen }}",
        "requestOptions": {}
      },
      "type": "@mendable/n8n-nodes-firecrawl.firecrawl",
      "typeVersion": 1,
      "position": [
        208,
        -176
      ],
      "id": "f1f3aa4c-b146-4946-877e-e541e4534ffd",
      "name": "scrap",
      "credentials": {
        "firecrawlApi": {
          "id": "6BJT5KNTG915Bbcs",
          "name": "Firecrawl account"
        }
      }
    }
  ],
  "pinData": {},
  "connections": {
    "Google Gemini Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Social Media Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Social Media Agent": {
      "main": [
        [
          {
            "node": "Return Post",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook1": {
      "main": [
        [
          {
            "node": "Get Linkedin URL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Linkedin URL": {
      "main": [
        [
          {
            "node": "scrap",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "scrap": {
      "main": [
        [
          {
            "node": "Social Media Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "availableInMCP": false
  },
  "versionId": "aebffbe5-3f76-4980-a1c9-0a0d5991321a",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "34fec829c7e9a71f0962677a69d00cfd6118b38bb74c521b563f5c118da9340f"
  },
  "id": "NPOVCxn1shqrNFPh",
  "tags": []
}
```
