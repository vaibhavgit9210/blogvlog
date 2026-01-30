/**
 * Admin Page Logic
 * Handles authentication, post creation, and media uploads
 */

// State
let mediaFiles = [];
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

/**
 * Initialize admin page
 */
async function initAdmin() {
    // Check for existing token
    if (githubAPI.hasToken()) {
        const result = await githubAPI.validateToken();
        if (result.valid) {
            showEditor(result.user);
            return;
        } else {
            githubAPI.clearToken();
        }
    }

    showTokenModal();
}

/**
 * Show the token input modal
 */
function showTokenModal() {
    const modal = document.getElementById('token-modal');
    modal.classList.add('active');

    const form = document.getElementById('token-form');
    form.onsubmit = handleTokenSubmit;
}

/**
 * Handle token form submission
 */
async function handleTokenSubmit(e) {
    e.preventDefault();

    const tokenInput = document.getElementById('token-input');
    const submitBtn = document.getElementById('token-submit');
    const errorEl = document.getElementById('token-error');

    const token = tokenInput.value.trim();

    if (!token) {
        errorEl.textContent = 'Please enter a token';
        return;
    }

    // Disable form while validating
    submitBtn.disabled = true;
    submitBtn.textContent = 'Validating...';
    errorEl.textContent = '';

    githubAPI.setToken(token);
    const result = await githubAPI.validateToken();

    if (result.valid) {
        const modal = document.getElementById('token-modal');
        modal.classList.remove('active');
        showEditor(result.user);
    } else {
        githubAPI.clearToken();
        errorEl.textContent = result.error || 'Invalid token';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Connect';
    }
}

/**
 * Show the post editor
 */
function showEditor(user) {
    // Update status
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    statusDot.classList.add('connected');
    statusText.textContent = `Connected as ${user.login}`;

    // Show editor
    document.getElementById('editor-section').classList.remove('hidden');

    // Setup form
    setupEditor();
}

/**
 * Setup the post editor
 */
function setupEditor() {
    // Setup drop zone
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.onclick = () => fileInput.click();

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    };

    dropZone.ondragleave = () => {
        dropZone.classList.remove('dragover');
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    };

    fileInput.onchange = () => {
        handleFiles(fileInput.files);
        fileInput.value = ''; // Reset for same file selection
    };

    // Setup form submission
    document.getElementById('post-form').onsubmit = handlePostSubmit;

    // Setup logout
    document.getElementById('logout-btn').onclick = handleLogout;
}

/**
 * Handle file selection/drop
 */
function handleFiles(files) {
    for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/') &&
            !file.type.startsWith('video/') &&
            !file.type.startsWith('audio/')) {
            showToast('Unsupported file type: ' + file.name, 'error');
            continue;
        }

        // Validate file size
        if (file.size > CONFIG.maxFileSize) {
            const maxMB = Math.round(CONFIG.maxFileSize / 1024 / 1024);
            showToast(`File too large (max ${maxMB} MB): ${file.name}`, 'error');
            continue;
        }

        // Add to media files
        mediaFiles.push(file);
        renderMediaPreview();
    }
}

/**
 * Render media preview thumbnails
 */
function renderMediaPreview() {
    const container = document.getElementById('media-preview');
    container.innerHTML = '';

    mediaFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'media-preview-item';

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            item.appendChild(video);
        } else if (file.type.startsWith('audio/')) {
            const icon = document.createElement('div');
            icon.className = 'media-type-icon';
            icon.textContent = '🎵';
            item.appendChild(icon);
        }

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            mediaFiles.splice(index, 1);
            renderMediaPreview();
        };
        item.appendChild(removeBtn);

        container.appendChild(item);
    });
}

/**
 * Handle post form submission
 */
async function handlePostSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (!content) {
        showToast('Content is required', 'error');
        return;
    }

    isSubmitting = true;
    const submitBtn = document.getElementById('submit-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    submitBtn.disabled = true;
    progressContainer.classList.remove('hidden');

    try {
        const mediaPaths = [];

        // Upload media files
        if (mediaFiles.length > 0) {
            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                const progress = Math.round((i / mediaFiles.length) * 50);
                progressBar.style.width = progress + '%';
                progressText.textContent = `Uploading ${file.name}...`;

                const result = await githubAPI.uploadMedia(file, file.type);
                mediaPaths.push(result.path);
            }
        }

        // Create post
        progressBar.style.width = '75%';
        progressText.textContent = 'Creating post...';

        await githubAPI.createPost(title, content, mediaPaths);

        progressBar.style.width = '100%';
        progressText.textContent = 'Done!';

        showToast('Post created successfully!', 'success');

        // Reset form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        mediaFiles = [];
        renderMediaPreview();

        // Redirect to home after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        progressContainer.classList.add('hidden');
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    githubAPI.clearToken();
    window.location.reload();
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
