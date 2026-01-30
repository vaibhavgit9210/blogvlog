/**
 * Home Page Logic
 * Fetches and displays the list of posts
 */

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

/**
 * Load and display all posts
 */
async function loadPosts() {
    const container = document.getElementById('posts-container');

    // Show loading state
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading posts<span class="blink">...</span></p>
        </div>
    `;

    try {
        const { posts } = await githubAPI.getPosts();

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No posts yet!</p>
                    <a href="admin.html" class="btn">Create your first post</a>
                </div>
            `;
            return;
        }

        // Render post list
        container.innerHTML = '<div class="post-list"></div>';
        const postList = container.querySelector('.post-list');

        posts.forEach(post => {
            const postEl = createPostItem(post);
            postList.appendChild(postEl);
        });

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <p>Error loading posts: ${escapeHtml(error.message)}</p>
                <button class="btn mt-2" onclick="loadPosts()">Retry</button>
            </div>
        `;
    }
}

/**
 * Create a post item element
 */
function createPostItem(post) {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.onclick = () => window.location.href = `post.html?id=${post.id}`;

    const title = post.title || 'Untitled';
    const date = formatDate(post.createdAt);
    const preview = truncateText(post.content, 150);

    div.innerHTML = `
        <span class="post-date">${date}</span>
        <h2>${escapeHtml(title)}</h2>
        <p class="post-preview">${escapeHtml(preview)}</p>
    `;

    return div;
}

/**
 * Format ISO date to readable string
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Truncate text to a maximum length
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
