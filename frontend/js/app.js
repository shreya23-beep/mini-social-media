const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user'));

if (!token || !currentUser) {
  window.location.href = 'auth.html';
}

const currentUserId = currentUser.id || currentUser._id;
const greetingEl = document.getElementById('nav-user-greeting');
if (greetingEl) {
  greetingEl.textContent = `@${currentUser.username}`;
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'auth.html';
  });
}

// ----------------- IMAGE COMPRESSION HELPER -----------------
function compressImage(file, maxDimension = 1080, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// ----------------- POSTS & FEED -----------------
async function loadPosts() {
  const feed = document.getElementById('feed-container');
  if (!feed) return;

  try {
    const res = await fetch(`${API_BASE}/posts`);
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = '<p style="text-align:center; color:#8e8e8e; padding: 20px;">No posts yet. Share your first photo!</p>';
      return;
    }

    feed.innerHTML = '';
    for (const post of posts) {
      const postId = post.id || post._id;
      const isOwner = parseInt(post.userId) === parseInt(currentUserId) || parseInt(post.user?.id) === parseInt(currentUserId);
      const isLiked = post.likes && post.likes.some((u) => parseInt(u.id || u._id) === parseInt(currentUserId));
      const likesCount = post.likes ? post.likes.length : 0;

      const postCard = document.createElement('article');
      postCard.className = 'card';
      postCard.id = `post-card-${postId}`;
      postCard.innerHTML = `
        <div class="post-header">
          <div class="post-user-info">
            <img src="${post.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="post-avatar" />
            <span class="post-author">@${escapeHTML(post.user?.username || 'Unknown')}</span>
          </div>
          ${isOwner ? `<button class="btn-delete-post" onclick="deletePost('${postId}')">🗑️ Delete</button>` : ''}
        </div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post" />` : ''}
        <div class="post-body">
          <div class="post-actions">
            <button class="action-btn" onclick="toggleLike('${postId}', this)">
              ${isLiked ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="likes-count"><span class="count">${likesCount}</span> likes</div>
          <div class="caption">
            <strong class="post-author">@${escapeHTML(post.user?.username || 'Unknown')}</strong> ${escapeHTML(post.content)}
          </div>
          <div class="comments-container" id="comments-list-${postId}"></div>
          <form class="comment-form" onsubmit="submitComment(event, '${postId}')">
            <input type="text" placeholder="Add a comment..." required />
            <button type="submit" style="border:none; background:none; color:#6366f1; font-weight:600; cursor:pointer;">Post</button>
          </form>
        </div>
      `;
      feed.appendChild(postCard);
      loadComments(postId);
    }
  } catch (err) {
    console.error('Error loading posts:', err);
    feed.innerHTML = '<p style="color:red; text-align:center;">Failed to load posts.</p>';
  }
}

const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value;
    const fileInput = document.getElementById('post-image-file');
    const file = fileInput ? fileInput.files[0] : null;

    let imageUrl = null;
    if (file) {
      try {
        imageUrl = await compressImage(file, 1080, 0.75);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, imageUrl }),
      });

      if (res.ok) {
        document.getElementById('post-content').value = '';
        if (fileInput) fileInput.value = '';
        loadPosts();
      } else {
        const data = await res.json();
        alert(data.message || data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Create post error:', err);
      alert('Error creating post');
    }
  });
}

async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      document.getElementById(`post-card-${postId}`)?.remove();
    } else {
      const data = await res.json();
      alert(data.message || data.error || 'Error deleting post');
    }
  } catch (err) {
    console.error('Delete post error:', err);
  }
}

async function toggleLike(postId, button) {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      button.innerHTML = data.isLiked ? '❤️' : '🤍';
      const countEl = button.closest('.post-body').querySelector('.likes-count .count');
      if (countEl) countEl.textContent = data.likesCount;
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    const comments = await res.json();
    const list = document.getElementById(`comments-list-${postId}`);
    if (!list) return;

    list.innerHTML = comments
      .map(
        (c) => `
        <div>
          <strong>@${escapeHTML(c.user?.username || 'Unknown')}:</strong> ${escapeHTML(c.text)}
        </div>
      `
      )
      .join('');
  } catch (err) {
    console.error(err);
  }
}

async function submitComment(e, postId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: input.value.trim() }),
    });

    if (res.ok) {
      input.value = '';
      loadComments(postId);
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------- STORIES FEATURE -----------------
let currentStoryViewingId = null;

async function loadStories() {
  const tray = document.getElementById('stories-container');
  if (!tray) return;

  try {
    const res = await fetch(`${API_BASE}/stories`);
    const stories = await res.json();

    tray.innerHTML = `
      <div class="story-bubble" onclick="triggerStoryUpload()">
        <div class="story-ring add-story">+</div>
        <span class="story-label">Your story</span>
      </div>
    `;

    if (!Array.isArray(stories)) return;

    stories.forEach((story) => {
      const bubble = document.createElement('div');
      bubble.className = 'story-bubble';
      bubble.onclick = () => viewStory(story);
      bubble.innerHTML = `
        <div class="story-ring">
          <img src="${story.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="story-avatar" />
        </div>
        <span class="story-label">${escapeHTML(story.user?.username || 'User')}</span>
      `;
      tray.appendChild(bubble);
    });
  } catch (err) {
    console.error('Stories loading error:', err);
  }
}

function triggerStoryUpload() {
  const input = document.getElementById('story-file-picker');
  if (input) {
    input.value = '';
    input.click();
  }
}

async function handleStoryUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const currentToken = localStorage.getItem('token');
  if (!currentToken) {
    alert('Session expired. Please log in again.');
    window.location.href = 'auth.html';
    return;
  }

  try {
    const mediaUrl = await compressImage(file, 800, 0.75);

    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ mediaUrl }),
    });

    const data = await res.json();

    if (res.ok) {
      loadStories();
    } else {
      console.error('Server error response:', data);
      alert(`Could not post story: ${data.message || data.error || 'Server error'}`);
    }
  } catch (err) {
    console.error('Story upload failed:', err);
    alert(`Failed to upload story: ${err.message}`);
  }
}

function viewStory(story) {
  currentStoryViewingId = story.id;
  document.getElementById('modal-story-img').src = story.mediaUrl;
  document.getElementById('modal-story-avatar').src = story.user?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  document.getElementById('modal-story-author').textContent = `@${story.user?.username}`;

  const deleteBtn = document.getElementById('modal-story-delete-btn');
  if (deleteBtn) {
    const isOwner = parseInt(story.userId) === parseInt(currentUserId) || parseInt(story.user?.id) === parseInt(currentUserId);
    deleteBtn.style.display = isOwner ? 'block' : 'none';
  }

  document.getElementById('story-modal').style.display = 'flex';
}

function closeStory() {
  document.getElementById('story-modal').style.display = 'none';
  currentStoryViewingId = null;
}

async function deleteCurrentStory() {
  if (!currentStoryViewingId) return;
  if (!confirm('Are you sure you want to delete this story?')) return;

  try {
    const res = await fetch(`${API_BASE}/stories/${currentStoryViewingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      closeStory();
      loadStories();
    } else {
      const data = await res.json();
      alert(data.message || 'Error deleting story');
    }
  } catch (err) {
    console.error('Delete story error:', err);
  }
}

// ----------------- DIRECT MESSAGING & INVITE LINK -----------------
let allChatUsers = [];
let activeChatUserId = null;
let chatPollingInterval = null;

async function openMessages() {
  document.getElementById('dm-modal').style.display = 'flex';
  loadChatUsers();
}

function closeMessages() {
  document.getElementById('dm-modal').style.display = 'none';
  if (chatPollingInterval) clearInterval(chatPollingInterval);
}

// Copies a direct chat URL containing your user ID & username
function copyChatInviteLink() {
  const inviteUrl = `${window.location.origin}${window.location.pathname}?chatWithId=${currentUserId}&chatWithUser=${encodeURIComponent(currentUser.username)}`;
  
  navigator.clipboard.writeText(inviteUrl).then(() => {
    alert(`Invite link copied to clipboard!\n\n${inviteUrl}\n\nOpen this in an Incognito window or share it with a friend.`);
  }).catch(() => {
    prompt('Copy your chat link below:', inviteUrl);
  });
}

// Automatically detects invite link parameters (?chatWithId=...) on page load
function checkInviteLinkParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const inviteUserId = urlParams.get('chatWithId');
  const inviteUsername = urlParams.get('chatWithUser');

  if (inviteUserId && parseInt(inviteUserId) !== parseInt(currentUserId)) {
    openMessages();
    selectChatUser(parseInt(inviteUserId), inviteUsername || 'User');
  }
}

async function loadChatUsers() {
  try {
    const res = await fetch(`${API_BASE}/messages/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allChatUsers = await res.json();
    renderUsersList(allChatUsers);
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

function renderUsersList(users) {
  const usersList = document.getElementById('dm-users');
  if (!usersList) return;

  if (!Array.isArray(users) || users.length === 0) {
    usersList.innerHTML = `
      <div style="padding:15px; font-size:12px; color:#9ca3af; text-align:center;">
        No other accounts found.<br><br>
        <button class="btn-nav" style="font-size:11px; padding:4px 8px;" onclick="copyChatInviteLink()">🔗 Copy Invite Link</button>
      </div>`;
    return;
  }

  usersList.innerHTML = users
    .map(
      (u) => `
    <div class="dm-user-item ${activeChatUserId === u.id ? 'active' : ''}" onclick="selectChatUser(${u.id}, '${escapeHTML(u.username)}')">
      <img src="${u.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" style="width:32px; height:32px; border-radius:50%; object-fit: cover;" />
      <strong>@${escapeHTML(u.username)}</strong>
    </div>
  `
    )
    .join('');
}

function searchUsers(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderUsersList(allChatUsers);
    return;
  }
  const filtered = allChatUsers.filter((u) => u.username.toLowerCase().includes(q));
  renderUsersList(filtered);
}

async function selectChatUser(userId, username) {
  activeChatUserId = userId;
  document.getElementById('dm-active-user-name').textContent = `Chat with @${username}`;
  document.getElementById('dm-send-form').style.display = 'flex';

  renderUsersList(allChatUsers);
  loadChatMessages();

  if (chatPollingInterval) clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(loadChatMessages, 3000);
}

async function loadChatMessages() {
  if (!activeChatUserId) return;
  const container = document.getElementById('dm-messages-container');
  try {
    const res = await fetch(`${API_BASE}/messages/${activeChatUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const msgs = await res.json();

    if (!Array.isArray(msgs) || msgs.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#9ca3af; margin-top:20px;">No messages yet. Say hi!</p>';
      return;
    }

    container.innerHTML = msgs
      .map((m) => {
        const isMine = parseInt(m.senderId) === parseInt(currentUserId);
        return `<div class="msg-bubble ${isMine ? 'msg-mine' : 'msg-theirs'}">${escapeHTML(m.text)}</div>`;
      })
      .join('');

    container.scrollTop = container.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('dm-input-text');
  const text = input.value.trim();
  if (!text || !activeChatUserId) return;

  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiverId: activeChatUserId, text }),
    });

    if (res.ok) {
      input.value = '';
      loadChatMessages();
    }
  } catch (err) {
    console.error(err);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Bootstrapping
loadPosts();
loadStories();
checkInviteLinkParam();