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

## Unicode Characters to Use

### Headers/Titles
Use emojis and Unicode bold characters:
- 📊 📈 📉 💡 🚀 🎯 ✨ 🔥 💪 ⭐

### Separators
```
─────────────────
═════════════════
━━━━━━━━━━━━━━━━━
```

### Bullet Points
```
• Standard bullet
→ Arrow bullet
▸ Triangle bullet
✓ Checkmark
✗ Cross mark
```

### Section Headers
```
🔑 Key Takeaways:
💡 Pro Tips:
📌 Important Points:
🎯 Main Goals:
⚡ Quick Facts:
```

### Emphasis
Use Unicode bold/italic or emojis:
```
𝐁𝐨𝐥𝐝 𝐓𝐞𝐱𝐭 (Unicode bold)
*Italic text* (with asterisks)
```

## Example n8n Workflow Structure

1. **HTTP Request Node** - Fetch blog content
2. **AI Node (GPT/Claude)** - Generate post with Unicode formatting
3. **Code Node** - Format output as JSON
4. **Respond to Webhook** - Return formatted JSON

## Sample AI Prompt

```
Generate a LinkedIn post from the following blog content. 

IMPORTANT: Format the output using Unicode characters and emojis ONLY. Do NOT use markdown syntax.

Use:
- Emojis for visual interest (📊 💡 🚀 etc.)
- Unicode bullets (•) for lists
- Unicode separators (─────)
- Plain text with proper line breaks

Structure:
1. Eye-catching title with emoji
2. Opening hook (2-3 lines)
3. Main content with bullet points (• )
4. Separator line (─────)
5. Call to action or link
6. Relevant hashtags (3-5)

Blog content:
{blog_content}
```

## Testing Your n8n Workflow

Test with this POST request:
```bash
curl -X POST "https://your-n8n-url/webhook/linkgen" \
  -H "Content-Type: application/json" \
  -d '{"blog_url": "https://example.com/blog-post"}'
```

Expected response:
```json
[
  {
    "output": "📊 Title\n\nContent...\n\n• Point 1\n• Point 2\n\n─────\n\n#Tag1 #Tag2"
  }
]
```

## Copy-Paste Ready Format

The output should be immediately paste-able into LinkedIn without any modifications. LinkedIn will:
- ✓ Display emojis correctly
- ✓ Show Unicode characters
- ✓ Preserve line breaks
- ✓ Make links clickable automatically
- ✓ Recognize hashtags

## Important Notes

❌ **Don't Use:**
- Markdown syntax (**bold**, *italic*, `code`)
- HTML tags
- Image markdown ![](url)

✓ **Do Use:**
- Plain Unicode text
- Emojis
- Line breaks
- Bullet points (•)
- Separators (─────)
