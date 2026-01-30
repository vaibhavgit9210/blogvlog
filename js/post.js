/**
 * Post Viewer Logic
 * Displays a single post with its content and media
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});

/**
 * Load and display a single post
 */
async function loadPost() {
    const container = document.getElementById('post-container');

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        showError('No post ID provided');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading post<span class="blink">...</span></p>
        </div>
    `;

    try {
        const post = await githubAPI.getPost(postId);

        if (!post) {
            showError('Post not found');
            return;
        }

        renderPost(post);

    } catch (error) {
        showError(`Error loading post: ${error.message}`);
    }
}

/**
 * Render the post content
 */
function renderPost(post) {
    const container = document.getElementById('post-container');

    const title = post.title || 'Untitled';
    const date = formatDate(post.createdAt);

    // Build media HTML
    let mediaHtml = '';
    if (post.media && post.media.length > 0) {
        mediaHtml = '<div class="post-media">';
        post.media.forEach(mediaPath => {
            mediaHtml += renderMediaItem(mediaPath);
        });
        mediaHtml += '</div>';
    }

    // Render content with line breaks preserved
    const contentHtml = escapeHtml(post.content);

    container.innerHTML = `
        <a href="index.html" class="back-link">Back to posts</a>
        <article class="post-content">
            <h1>${escapeHtml(title)}</h1>
            <span class="post-date">${date}</span>
            ${mediaHtml}
            <div class="post-body">${contentHtml}</div>
        </article>
    `;
}

/**
 * Render a media item based on its type
 */
function renderMediaItem(path) {
    const url = githubAPI.getMediaUrl(path);
    const ext = path.split('.').pop().toLowerCase();

    // Determine media type from extension
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

    if (imageExts.includes(ext)) {
        return `
            <div class="media-item">
                <img src="${url}" alt="Post image" loading="lazy">
            </div>
        `;
    }

    if (videoExts.includes(ext)) {
        return `
            <div class="media-item">
                <video controls preload="metadata">
                    <source src="${url}" type="video/${ext === 'mov' ? 'quicktime' : ext}">
                    Your browser does not support video playback.
                </video>
            </div>
        `;
    }

    if (audioExts.includes(ext)) {
        return `
            <div class="media-item">
                <audio controls preload="metadata">
                    <source src="${url}" type="audio/${ext === 'm4a' ? 'mp4' : ext}">
                    Your browser does not support audio playback.
                </audio>
            </div>
        `;
    }

    // Unknown type - show as link
    return `
        <div class="media-item">
            <a href="${url}" target="_blank" class="btn btn-secondary">Download: ${path.split('/').pop()}</a>
        </div>
    `;
}

/**
 * Show error state
 */
function showError(message) {
    const container = document.getElementById('post-container');
    container.innerHTML = `
        <a href="index.html" class="back-link">Back to posts</a>
        <div class="error-state">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Format ISO date to readable string
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
