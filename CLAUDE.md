# BlogVlog - 8-Bit Blog Platform

## Overview
A retro-styled blogging platform hosted on GitHub Pages. Posts are created via an admin interface that commits directly to GitHub.

## Architecture
- **Vanilla HTML/CSS/JS** - No build tools
- **GitHub REST API** - For committing posts and media
- **Google Fonts** - Press Start 2P pixel font

## Key Files
- `index.html` - Home page listing all posts
- `post.html` - Single post viewer (?id=xxx)
- `admin.html` - Admin interface for creating posts
- `posts/posts.json` - Index of all posts (metadata array)
- `js/config.js` - Repository configuration
- `js/github-api.js` - GitHub API wrapper

## Post Structure
Posts are stored in `posts/posts.json` as an array:
```json
[
  {
    "id": "1704067200000",
    "title": "Optional Title",
    "content": "Post content...",
    "media": ["media/images/file.jpg"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Media Limits
- Images: ~37 MB (recommend < 5 MB)
- Videos: ~37 MB (~2-3 min 720p)
- Audio: ~37 MB (~35 min 128kbps MP3)

## Development
Open HTML files directly in browser for local testing.
GitHub Pages serves from main branch root.

## Admin Authentication
Uses GitHub Personal Access Token (PAT) stored in localStorage.
Required scopes: `repo` (for private repos) or `public_repo` (for public repos).
