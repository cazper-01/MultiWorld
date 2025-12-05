// Admin JavaScript Module
import { db } from './firebaseConfig.js';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getCurrentUser, logoutAdmin, checkAuthState } from './auth.js';

let allPosts = [];
let currentEditId = null;
let currentUser = null;

/**
 * Initialize admin panel
 */
export function initializeAdmin() {
  checkAuthState((user) => {
    currentUser = user;
    if (!currentUser) {
      window.location.href = 'admin-login.html';
      return;
    }
    setupAdminPanel();
  });
}

/**
 * Setup admin panel UI and event listeners
 */
function setupAdminPanel() {
  // Load posts
  loadAdminPosts();

  // Setup section navigation
  const sidebarLinks = document.querySelectorAll('.admin-sidebar a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const sectionId = this.dataset.section;
      showSection(sectionId);
      
      // Update active state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Setup form submission
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', handleFormSubmit);
  }

  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      logoutAdmin().then(() => {
        window.location.href = 'index.html';
      });
    });
  }

  // Setup cancel button
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      resetForm();
      showSection('view-posts');
      document.querySelector('[data-section="view-posts"]').classList.add('active');
    });
  }
}

/**
 * Show specific admin section
 */
function showSection(sectionId) {
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => section.classList.remove('active'));

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Load all posts for admin view
 */
function loadAdminPosts() {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
      allPosts = [];
      snapshot.forEach((doc) => {
        allPosts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      displayAdminPosts();
    }, (error) => {
      console.error('Error loading posts:', error);
      showMessage('Error loading posts', 'error');
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
    showMessage('Error setting up listener', 'error');
  }
}

/**
 * Display posts in admin table
 */
function displayAdminPosts() {
  const postsTableBody = document.getElementById('postsTableBody');
  if (!postsTableBody) return;

  if (allPosts.length === 0) {
    postsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #999; padding: 40px;">
          No posts yet. Create your first post!
        </td>
      </tr>
    `;
    return;
  }

  postsTableBody.innerHTML = allPosts.map(post => `
    <tr>
      <td>
        <img src="${post.imageUrl}" alt="${post.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50?text=No+Img'">
      </td>
      <td>
        <strong>${post.title}</strong>
        <br>
        <small style="color: #999;">${post.category}</small>
      </td>
      <td>${post.shortDescription.substring(0, 50)}...</td>
      <td>
        <div class="action-buttons">
          <button class="btn-primary btn-small" onclick="editPost('${post.id}')">Edit</button>
          <button class="btn-danger btn-small" onclick="deletePost('${post.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Handle form submission for creating/updating posts
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const category = document.getElementById('postCategory').value;
  const imageUrl = document.getElementById('postImage').value.trim();
  const shortDescription = document.getElementById('postShortDesc').value.trim();
  const fullArticle = document.getElementById('postFullArticle').value.trim();

  if (!title || !category || !imageUrl || !shortDescription || !fullArticle) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  const postData = {
    title,
    category,
    imageUrl,
    shortDescription,
    fullArticle,
    updatedAt: serverTimestamp()
  };

  try {
    if (currentEditId) {
      // Update existing post
      const postRef = doc(db, 'posts', currentEditId);
      await updateDoc(postRef, postData);
      showMessage('Post updated successfully!', 'success');
    } else {
      // Create new post
      postData.createdAt = serverTimestamp();
      await addDoc(collection(db, 'posts'), postData);
      showMessage('Post created successfully!', 'success');
    }

    resetForm();
    showSection('view-posts');
    document.querySelector('[data-section="view-posts"]').classList.add('active');
  } catch (error) {
    console.error('Error saving post:', error);
    showMessage('Error saving post: ' + error.message, 'error');
  }
}

/**
 * Edit a post
 */
window.editPost = function (postId) {
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;

  currentEditId = postId;
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postCategory').value = post.category;
  document.getElementById('postImage').value = post.imageUrl;
  document.getElementById('postShortDesc').value = post.shortDescription;
  document.getElementById('postFullArticle').value = post.fullArticle;

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Update Post';
  }

  showSection('add-post');
  document.querySelector('[data-section="add-post"]').classList.add('active');
  document.getElementById('postTitle').focus();
};

/**
 * Delete a post
 */
window.deletePost = async function (postId) {
  if (!confirm('Are you sure you want to delete this post?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'posts', postId));
    showMessage('Post deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting post:', error);
    showMessage('Error deleting post: ' + error.message, 'error');
  }
};

/**
 * Reset form
 */
function resetForm() {
  document.getElementById('postForm').reset();
  currentEditId = null;
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Create Post';
  }
}

/**
 * Show success/error messages
 */
function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.success-message, .error-message');
  existingMessages.forEach(msg => msg.remove());

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = type === 'success' ? 'success-message' : 'error-message';
  messageEl.textContent = message;
  messageEl.style.display = 'block';

  // Insert at top of main content
  const adminMain = document.querySelector('.admin-main');
  if (adminMain) {
    adminMain.insertBefore(messageEl, adminMain.firstChild);
    setTimeout(() => messageEl.remove(), 4000);
  }
}

// Make functions global
window.editPost = window.editPost;
window.deletePost = window.deletePost;
