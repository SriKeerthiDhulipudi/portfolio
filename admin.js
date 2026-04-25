// Initialize Quill Editor
const quill = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write your blog post here...'
});

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Authentication State
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    fetchData();
  } else {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginError.textContent = error.message;
    loginError.style.display = 'block';
  } else {
    loginError.style.display = 'none';
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

let editingId = null;
let editingTable = null;

// Fetch Data for Dashboard
async function fetchData() {
  fetchBlogs();
  fetchExperience();
  fetchProjects();
  fetchGallery();
}

/* --- BLOGS --- */
async function fetchBlogs() {
  const { data, error } = await supabaseClient.from('blogs').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('blogs-list');
  list.innerHTML = '';
  if (data) {
    data.forEach(blog => {
      const div = document.createElement('div');
      div.className = 'data-item';
      div.innerHTML = `
        <div>
          <h4>${blog.title}</h4>
          <p>${blog.summary}</p>
        </div>
        <div>
          <button class="action-btn" style="background: var(--accent); color: #000;" onclick="editBlog(${blog.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteBlog(${blog.id})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

async function editBlog(id) {
  const { data } = await supabaseClient.from('blogs').select('*').eq('id', id).single();
  if (data) {
    editingId = id;
    editingTable = 'blogs';
    document.getElementById('blog-title').value = data.title;
    document.getElementById('blog-summary').value = data.summary;
    quill.root.innerHTML = data.content;
    document.querySelector('#blogs h3').textContent = "Editing Blog";
    document.querySelector('#blog-form button').textContent = "Save Changes";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.getElementById('blog-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('blog-title').value;
  const summary = document.getElementById('blog-summary').value;
  const content = quill.root.innerHTML;

  let result;
  if (editingId && editingTable === 'blogs') {
    result = await supabaseClient.from('blogs').update({ title, summary, content }).eq('id', editingId);
  } else {
    result = await supabaseClient.from('blogs').insert([{ title, summary, content }]);
  }

  if (!result.error) {
    resetForm('blog');
    fetchBlogs();
  } else {
    alert("Error: " + result.error.message);
  }
});

/* --- EXPERIENCE --- */
async function fetchExperience() {
  const { data, error } = await supabaseClient.from('experience').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('exp-list');
  list.innerHTML = '';
  if (data) {
    data.forEach(exp => {
      const div = document.createElement('div');
      div.className = 'data-item';
      div.innerHTML = `
        <div>
          <h4>${exp.role} at ${exp.company}</h4>
          <p>${exp.duration}</p>
        </div>
        <div>
          <button class="action-btn" style="background: var(--accent); color: #000;" onclick="editExperience(${exp.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteExperience(${exp.id})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

async function editExperience(id) {
  const { data } = await supabaseClient.from('experience').select('*').eq('id', id).single();
  if (data) {
    editingId = id;
    editingTable = 'experience';
    document.getElementById('exp-role').value = data.role;
    document.getElementById('exp-company').value = data.company;
    document.getElementById('exp-duration').value = data.duration;
    document.getElementById('exp-desc').value = data.description;
    document.querySelector('#experience h3').textContent = "Editing Experience";
    document.querySelector('#exp-form button').textContent = "Save Changes";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.getElementById('exp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const role = document.getElementById('exp-role').value;
  const company = document.getElementById('exp-company').value;
  const duration = document.getElementById('exp-duration').value;
  const description = document.getElementById('exp-desc').value;

  let result;
  if (editingId && editingTable === 'experience') {
    result = await supabaseClient.from('experience').update({ role, company, duration, description }).eq('id', editingId);
  } else {
    result = await supabaseClient.from('experience').insert([{ role, company, duration, description }]);
  }

  if (!result.error) {
    resetForm('exp');
    fetchExperience();
  }
});

/* --- PROJECTS --- */
async function fetchProjects() {
  const { data, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('proj-list');
  list.innerHTML = '';
  if (data) {
    data.forEach(proj => {
      const div = document.createElement('div');
      div.className = 'data-item';
      div.innerHTML = `
        <div>
          <h4>${proj.title}</h4>
          <p>${proj.technologies}</p>
        </div>
        <div>
          <button class="action-btn" style="background: var(--accent); color: #000;" onclick="editProject(${proj.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteProject(${proj.id})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

async function editProject(id) {
  const { data } = await supabaseClient.from('projects').select('*').eq('id', id).single();
  if (data) {
    editingId = id;
    editingTable = 'projects';
    document.getElementById('proj-title').value = data.title;
    document.getElementById('proj-image').value = data.image_url;
    document.getElementById('proj-tech').value = data.technologies;
    document.getElementById('proj-problem').value = data.problem;
    document.getElementById('proj-solution').value = data.solution;
    document.getElementById('proj-impact').value = data.impact;
    document.getElementById('proj-live').value = data.live_url || '';
    document.getElementById('proj-code').value = data.code_url || '';
    document.querySelector('#projects h3').textContent = "Editing Project";
    document.querySelector('#proj-form button').textContent = "Save Changes";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.getElementById('proj-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fields = {
    title: document.getElementById('proj-title').value,
    image_url: document.getElementById('proj-image').value,
    technologies: document.getElementById('proj-tech').value,
    problem: document.getElementById('proj-problem').value,
    solution: document.getElementById('proj-solution').value,
    impact: document.getElementById('proj-impact').value,
    live_url: document.getElementById('proj-live').value,
    code_url: document.getElementById('proj-code').value
  };

  let result;
  if (editingId && editingTable === 'projects') {
    result = await supabaseClient.from('projects').update(fields).eq('id', editingId);
  } else {
    result = await supabaseClient.from('projects').insert([fields]);
  }

  if (!result.error) {
    resetForm('proj');
    fetchProjects();
  }
});

/* --- GALLERY --- */
async function fetchGallery() {
  const { data, error } = await supabaseClient.from('gallery').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('gallery-list');
  list.innerHTML = '';
  if (data) {
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'data-item';
      div.innerHTML = `
        <div>
          <h4>${item.title}</h4>
          <p>${item.category}</p>
        </div>
        <div>
          <button class="action-btn" style="background: var(--accent); color: #000;" onclick="editGallery(${item.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteGallery(${item.id})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

async function editGallery(id) {
  const { data } = await supabaseClient.from('gallery').select('*').eq('id', id).single();
  if (data) {
    editingId = id;
    editingTable = 'gallery';
    document.getElementById('gallery-title').value = data.title;
    document.getElementById('gallery-image').value = data.image_url;
    document.getElementById('gallery-category').value = data.category;
    document.querySelector('#gallery h3').textContent = "Editing Gallery Image";
    document.querySelector('#gallery-form button').textContent = "Save Changes";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.getElementById('gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('gallery-title').value;
  const image_url = document.getElementById('gallery-image').value;
  const category = document.getElementById('gallery-category').value;

  let result;
  if (editingId && editingTable === 'gallery') {
    result = await supabaseClient.from('gallery').update({ title, image_url, category }).eq('id', editingId);
  } else {
    result = await supabaseClient.from('gallery').insert([{ title, image_url, category }]);
  }

  if (!result.error) {
    resetForm('gallery');
    fetchGallery();
  }
});

// Helper to reset forms
function resetForm(prefix) {
  const form = document.getElementById(`${prefix}-form`);
  form.reset();
  if (prefix === 'blog') quill.setContents([]);
  
  editingId = null;
  editingTable = null;
  
  // Reset UI labels
  const titles = { blog: "Write a New Blog", exp: "Add Experience", proj: "Add Project", gallery: "Add Gallery Image" };
  const btns = { blog: "Publish Blog", exp: "Add Experience", proj: "Add Project", gallery: "Add to Gallery" };
  
  const sectionId = prefix === 'proj' ? 'projects' : (prefix === 'exp' ? 'experience' : prefix);
  document.querySelector(`#${sectionId} h3`).textContent = titles[prefix];
  document.querySelector(`#${prefix}-form button`).textContent = btns[prefix];
}

// Delete functions
async function deleteBlog(id) { if (confirm("Delete this blog?")) { await supabaseClient.from('blogs').delete().eq('id', id); fetchBlogs(); } }
async function deleteExperience(id) { if (confirm("Delete this experience?")) { await supabaseClient.from('experience').delete().eq('id', id); fetchExperience(); } }
async function deleteProject(id) { if (confirm("Delete this project?")) { await supabaseClient.from('projects').delete().eq('id', id); fetchProjects(); } }
async function deleteGallery(id) { if (confirm("Delete this image?")) { await supabaseClient.from('gallery').delete().eq('id', id); fetchGallery(); } }

