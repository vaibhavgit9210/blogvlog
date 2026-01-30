# BlogVlog - 8-Bit Blog Platform

A retro-styled blogging platform hosted entirely on GitHub Pages. Create posts with text, images, video, and audio through an admin interface that commits directly to GitHub.

## Features

- **8-Bit Styling**: NES-inspired color palette, pixel fonts, CRT scanline effects
- **No Build Tools**: Pure HTML/CSS/JS that works directly on GitHub Pages
- **Media Support**: Upload images, videos, and audio files directly
- **GitHub API Integration**: Posts are stored as commits in your repository

## Quick Start

### 1. Fork or Clone

Fork this repository or clone it to your own GitHub account.

### 2. Update Configuration

Edit `js/config.js` with your repository details:

```javascript
const CONFIG = {
    owner: 'YOUR_GITHUB_USERNAME',
    repo: 'YOUR_REPO_NAME',
    branch: 'main',
    // ...
};
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### 4. Create a Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a name (e.g., "BlogVlog Admin")
4. Select the `repo` scope (for private repos) or `public_repo` (for public repos)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

### 5. Start Blogging

1. Visit your GitHub Pages URL
2. Click **Admin** in the navigation
3. Enter your Personal Access Token
4. Create your first post!

## File Structure

```
blogvlog/
├── index.html          # Home page - lists all posts
├── post.html           # Single post viewer
├── admin.html          # Admin interface
├── css/
│   └── style.css       # 8-bit styling
├── js/
│   ├── config.js       # Repository configuration
│   ├── github-api.js   # GitHub API wrapper
│   ├── admin.js        # Admin page logic
│   ├── home.js         # Home page logic
│   └── post.js         # Post viewer logic
├── posts/
│   └── posts.json      # Index of all posts
└── media/
    ├── images/         # Uploaded images
    ├── videos/         # Uploaded videos
    └── audio/          # Uploaded audio
```

## Media Limits

| Media Type | Max Size | Notes |
|------------|----------|-------|
| Images | ~37 MB | Recommend < 5 MB for fast loading |
| Videos | ~37 MB | ~2-3 min at 720p; use YouTube for longer |
| Audio | ~37 MB | ~35 min at 128kbps MP3 |

## Local Development

Simply open `index.html` in your browser. The site works locally for viewing, but you'll need a GitHub token to create posts.

## Troubleshooting

### "Invalid token" error
- Make sure you copied the entire token (starts with `ghp_`)
- Verify the token has `repo` or `public_repo` scope
- Tokens expire - generate a new one if needed

### Posts not appearing
- Wait a few seconds for GitHub Pages to update
- Hard refresh the page (Ctrl/Cmd + Shift + R)
- Check if `posts/posts.json` was updated in your repo

### Media not loading
- Large files may take time to propagate through GitHub's CDN
- Check the file was uploaded in `media/` folder
- Verify the file size is under 37 MB

## License

MIT License - feel free to use and modify!

---

Made with 🎮 and ❤️
