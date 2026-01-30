/**
 * GitHub API Wrapper for BlogVlog
 * Handles authentication, file operations, and media uploads
 */

class GitHubAPI {
    constructor() {
        this.token = localStorage.getItem('github_token');
        this.baseUrl = CONFIG.apiBase;
        this.owner = CONFIG.owner;
        this.repo = CONFIG.repo;
        this.branch = CONFIG.branch;
    }

    /**
     * Set the authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    /**
     * Clear the authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('github_token');
    }

    /**
     * Check if a token is stored
     */
    hasToken() {
        return !!this.token;
    }

    /**
     * Get authorization headers
     */
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Validate the stored token by making a test API call
     */
    async validateToken() {
        if (!this.token) {
            return { valid: false, error: 'No token provided' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const user = await response.json();
                return { valid: true, user };
            } else if (response.status === 401) {
                return { valid: false, error: 'Invalid token' };
            } else {
                return { valid: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get file contents from the repository
     */
    async getFile(path) {
        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
            const response = await fetch(url, {
                headers: this.token ? this.getHeaders() : {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 404) {
                return { exists: false, content: null, sha: null };
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const content = atob(data.content);

            return {
                exists: true,
                content,
                sha: data.sha
            };
        } catch (error) {
            throw new Error(`Failed to get file: ${error.message}`);
        }
    }

    /**
     * Create or update a file in the repository
     */
    async createOrUpdateFile(path, content, message, sha = null) {
        if (!this.token) {
            throw new Error('Authentication required');
        }

        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

            const body = {
                message,
                content: btoa(unescape(encodeURIComponent(content))),
                branch: this.branch
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to save file: ${error.message}`);
        }
    }

    /**
     * Upload a binary file (image, video, audio) to the media folder
     */
    async uploadMedia(file, type) {
        if (!this.token) {
            throw new Error('Authentication required');
        }

        // Validate file size
        if (file.size > CONFIG.maxFileSize) {
            throw new Error(`File too large. Maximum size is ${Math.round(CONFIG.maxFileSize / 1024 / 1024)} MB`);
        }

        // Determine the media path based on type
        let mediaPath;
        if (type.startsWith('image/')) {
            mediaPath = CONFIG.mediaPaths.images;
        } else if (type.startsWith('video/')) {
            mediaPath = CONFIG.mediaPaths.videos;
        } else if (type.startsWith('audio/')) {
            mediaPath = CONFIG.mediaPaths.audio;
        } else {
            throw new Error('Unsupported media type');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.name.split('.').pop().toLowerCase();
        const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const path = `${mediaPath}/${filename}`;

        // Convert file to base64
        const base64Content = await this.fileToBase64(file);

        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    message: `Upload media: ${filename}`,
                    content: base64Content,
                    branch: this.branch
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            return {
                path,
                url: result.content.download_url,
                sha: result.content.sha
            };
        } catch (error) {
            throw new Error(`Failed to upload media: ${error.message}`);
        }
    }

    /**
     * Convert a File object to base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get all posts from posts.json
     */
    async getPosts() {
        try {
            const result = await this.getFile(CONFIG.postsFile);

            if (!result.exists) {
                return { posts: [], sha: null };
            }

            const posts = JSON.parse(result.content);
            return { posts, sha: result.sha };
        } catch (error) {
            throw new Error(`Failed to get posts: ${error.message}`);
        }
    }

    /**
     * Get a single post by ID
     */
    async getPost(id) {
        const { posts } = await this.getPosts();
        return posts.find(post => post.id === id) || null;
    }

    /**
     * Create a new post
     */
    async createPost(title, content, mediaPaths = []) {
        if (!this.token) {
            throw new Error('Authentication required');
        }

        const { posts, sha } = await this.getPosts();

        const newPost = {
            id: Date.now().toString(),
            title: title || null,
            content,
            media: mediaPaths,
            createdAt: new Date().toISOString()
        };

        posts.unshift(newPost); // Add to beginning of array

        await this.createOrUpdateFile(
            CONFIG.postsFile,
            JSON.stringify(posts, null, 2),
            `Add post: ${title || newPost.id}`,
            sha
        );

        return newPost;
    }

    /**
     * Get the raw URL for a media file
     */
    getMediaUrl(path) {
        return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
    }
}

// Create global instance
const githubAPI = new GitHubAPI();
