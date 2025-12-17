# Drafts & Screenshots Workflow

## 📋 Understanding the Difference

### **Drafts** (Review Details)
- **What**: JSON data with review information (text, rating, platform, etc.)
- **When to save**: While editing/creating reviews
- **Purpose**: Work-in-progress, can edit and come back later
- **Storage**: `drafts` table in Supabase
- **No image**: Just the data

### **Screenshots** (Final Images)
- **What**: Actual PNG/JPG image files
- **When to save**: After generating/downloading the screenshot
- **Purpose**: Final output, ready to use
- **Storage**: Supabase Storage + `saved_screenshots` table
- **Linked to draft**: Can optionally link screenshot to a draft

## 🔄 Complete Workflow

### 1. **Create Draft** (Save Review Details)
```
User fills form → Clicks "Save Draft"
     ↓
Saves to drafts table (JSON data)
     ↓
Appears in sidebar
```

### 2. **Edit Draft**
```
User clicks draft in sidebar
     ↓
Loads review data into editor
     ↓
User edits → Clicks "Update Draft"
     ↓
Updates draft in database
```

### 3. **Generate Screenshot** (Download)
```
User clicks "Download"
     ↓
html2canvas generates image
     ↓
Downloads to user's computer
     ↓
(Optional: Can save to Supabase Storage)
```

### 4. **Save Screenshot** (Future Feature)
```
After downloading, user can click "Save Screenshot"
     ↓
Uploads image to Supabase Storage
     ↓
Creates record in saved_screenshots table
     ↓
Links to draft (optional)
```

## 🎨 UI Components

### **DraftsSidebar** (Left Panel)
- Shows all user's drafts
- "New Draft" button
- Click draft to load it
- Delete draft button
- Similar to OpenAI chat sidebar

### **ReviewEditor** (Main Area)
- Platform selector
- Review form
- Preview
- "Save Draft" / "Update Draft" button
- "Download" button

## 📝 When to Save What

| Action | What Gets Saved | Where |
|--------|----------------|-------|
| **Save Draft** | Review details (JSON) | `drafts` table |
| **Update Draft** | Updated review details | `drafts` table |
| **Download** | Nothing saved (just downloads) | User's computer |
| **Save Screenshot** (future) | Image file | Supabase Storage + `saved_screenshots` table |

## 🚀 Current Implementation

✅ **Drafts Sidebar** - Shows all drafts, create new, select, delete
✅ **Save Draft** - Saves review details to database
✅ **Update Draft** - Updates existing draft
✅ **Load Draft** - Loads draft into editor when selected
✅ **Download Screenshot** - Generates and downloads image

## 🔮 Future Enhancements

- [ ] Auto-save drafts as user types
- [ ] Draft naming/renaming
- [ ] Save screenshot to Supabase Storage
- [ ] Gallery view of saved screenshots
- [ ] Export multiple screenshots

