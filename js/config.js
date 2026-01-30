// Repository configuration
const CONFIG = {
    owner: 'vaibhavgit9210',
    repo: 'blogvlog',
    branch: 'main',

    // GitHub API base URL
    apiBase: 'https://api.github.com',

    // Media paths
    mediaPaths: {
        images: 'media/images',
        videos: 'media/videos',
        audio: 'media/audio'
    },

    // File size limit (GitHub API limit is ~50MB, using 37MB for safety)
    maxFileSize: 37 * 1024 * 1024, // 37 MB in bytes

    // Posts index file
    postsFile: 'posts/posts.json'
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.mediaPaths);
