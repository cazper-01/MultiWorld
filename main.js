// Main Homepage Logic
import { db } from './firebaseConfig.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { checkAuthState, logoutAdmin } from './auth.js';

let allPosts = [];
let currentUser = null;

// Initialize homepage
document.addEventListener('DOMContentLoaded', function () {
  // Check authentication state
  checkAuthState((user) => {
    currentUser = user;
    updateNavigation();
  });

  // Load posts
  loadPosts();

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      logoutAdmin().then(() => {
        window.location.href = 'index.html';
      });
    });
  }

  // Setup category filters
  const categoryLinks = document.querySelectorAll('.category-filter');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const category = this.dataset.category;
      filterArticles(category);
    });
  });

  // Admin button
  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', function () {
      window.location.href = 'admin-login.html';
    });
  }
});

/**
 * Update navigation based on authentication state
 */
function updateNavigation() {
  const adminBtn = document.getElementById('adminBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (currentUser) {
    if (adminBtn) adminBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    if (adminBtn) adminBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
}

/**
 * Load all posts from Firestore in real-time
 */
function loadPosts() {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    // Real-time listener
    onSnapshot(q, (snapshot) => {
      allPosts = [];
      snapshot.forEach((doc) => {
        allPosts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Display all posts initially
      displayArticles(allPosts);
    });
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

/**
 * Display articles in the grid
 */
function displayArticles(posts) {
  const articlesContainer = document.getElementById('articlesContainer');

  if (!articlesContainer) return;

  if (posts.length === 0) {
    articlesContainer.innerHTML = '<div class="empty-state"><p>No articles found.</p></div>';
    return;
  }

  articlesContainer.innerHTML = posts.map(post => `
    <div class="article-card" onclick="viewArticle('${post.id}')">
      <img src="${post.imageUrl}" alt="${post.title}" class="article-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
      <div class="article-content">
        <span class="article-category">${post.category}</span>
        <h2 class="article-title">${post.title}</h2>
        <p class="article-description">${post.shortDescription}</p>
        <a href="fullarticle.html?id=${post.id}" class="article-read-more">Read More →</a>
      </div>
    </div>
  `).join('');
}

/**
 * Filter articles by category
 */
function filterArticles(category) {
  if (category === 'all') {
    displayArticles(allPosts);
  } else {
    const filtered = allPosts.filter(post => post.category === category);
    displayArticles(filtered);
  }
}

/**
 * Navigate to full article page
 */
function viewArticle(postId) {
  window.location.href = `fullarticle.html?id=${postId}`;
}

// Make functions global for HTML onclick handlers
window.viewArticle = viewArticle;
window.filterArticles = filterArticles;
