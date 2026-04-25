document.addEventListener('DOMContentLoaded', async () => {
  // Check if Supabase is properly configured
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    console.warn("Supabase not initialized. Dynamic content will not be loaded.");
    return;
  }

  try {
    // Fetch Blogs
    const { data: blogs, error: blogsError } = await supabaseClient.from('blogs').select('*').order('created_at', { ascending: false });
    const blogsContainer = document.getElementById('blogs-container');
    if (blogs && blogs.length > 0) {
      blogsContainer.innerHTML = ''; // clear loading state
      blogs.forEach(blog => {
        const div = document.createElement('div');
        div.className = 'blog-card reveal';
        // Open modal or link to blog
        div.innerHTML = `
          <div class="blog-title">${blog.title}</div>
          <div class="blog-summary">${blog.summary}</div>
          <a href="#" class="blog-link" onclick="openBlogModal('${blog.id}'); return false;">Read More →</a>
        `;
        blogsContainer.appendChild(div);
      });
    } else if (!blogsError) {
      blogsContainer.innerHTML = '<div style="color: var(--muted); font-size: 0.9rem;">No blogs available yet.</div>';
    } else {
      blogsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.9rem;">Error loading blogs: Please setup Supabase table.</div>`;
    }

    // Fetch Experience
    const { data: exp, error: expError } = await supabaseClient.from('experience').select('*').order('created_at', { ascending: false });
    const expContainer = document.getElementById('experience-container');
    if (exp && exp.length > 0) {
      // We prepend to existing static items, or we can replace entirely. Let's prepend.
      exp.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'internship-card';
        div.innerHTML = `
          <div class="internship-title">${item.role}</div>
          <div class="internship-company">${item.company}</div>
          <div class="internship-date">${item.duration}</div>
          <div class="internship-desc">${item.description}</div>
        `;
        expContainer.insertBefore(div, expContainer.firstChild);
      });
    }

    // Fetch Projects
    const { data: projs, error: projError } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
    const projContainer = document.getElementById('projects-container');
    if (projs && projs.length > 0) {
      // Prepend to existing
      projs.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'project-card reveal';
        div.innerHTML = `
          <img src="${item.image_url}" alt="${item.title}" class="project-img" onerror="this.onerror=null;this.src='';this.classList.add('project-img-placeholder');"/>
          <div class="project-body">
            <div class="project-techs">
              ${item.technologies.split(',').map(tech => `<span class="project-tech">${tech.trim()}</span>`).join('')}
            </div>
            <div class="project-title">${item.title}</div>
            <p class="problem-solution"><strong>Problem:</strong> ${item.problem}</p>
            <p class="problem-solution"><strong>Solution:</strong> ${item.solution}</p>
            <div class="project-impact">→ ${item.impact}</div>
            <div class="project-links">
              ${item.live_url ? `<a href="${item.live_url}" target="_blank" class="link-live">Live Demo</a>` : ''}
              ${item.code_url ? `<a href="${item.code_url}" target="_blank" class="link-code">Source Code</a>` : ''}
            </div>
          </div>
        `;
        projContainer.insertBefore(div, projContainer.firstChild);
      });
    }

    // Re-run scroll reveal for new items
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Fetch Gallery
    const { data: gallery, error: galleryError } = await supabaseClient.from('gallery').select('*').order('created_at', { ascending: false });
    const galleryContainer = document.getElementById('gallery-container');
    if (gallery && gallery.length > 0) {
      galleryContainer.innerHTML = '';
      gallery.forEach(item => {
        const div = document.createElement('div');
        div.className = 'project-card reveal';
        div.innerHTML = `
          <img src="${item.image_url}" alt="${item.title}" class="project-img" onerror="this.onerror=null;this.src='';this.classList.add('project-img-placeholder');"/>
          <div class="project-body">
            <div class="project-title">${item.title}</div>
            <p style="color: var(--muted); font-size: 0.85rem;">${item.category}</p>
          </div>
        `;
        galleryContainer.appendChild(div);
      });
      // Re-run observer for gallery
      document.querySelectorAll('#gallery .reveal').forEach(el => observer.observe(el));
    } else if (!galleryError) {
      galleryContainer.innerHTML = '<div style="color: var(--muted); font-size: 0.9rem;">No gallery images yet.</div>';
    }

    // Fetch Certificates
    const { data: certs, error: certError } = await supabaseClient.from('certificates').select('*').order('created_at', { ascending: false });
    const certContainer = document.getElementById('certificates-container');
    if (certs && certs.length > 0) {
      if (certContainer) {
        certContainer.innerHTML = '';
        certs.forEach(item => {
          const div = document.createElement('div');
          div.className = 'project-card reveal';
          div.innerHTML = `
            <img src="${item.image_url}" alt="${item.title}" class="project-img" onerror="this.onerror=null;this.src='';this.classList.add('project-img-placeholder');"/>
            <div class="project-body">
              <div class="project-title">${item.title}</div>
              <p style="color: var(--muted); font-size: 0.85rem;">Issued by ${item.issued_by}</p>
            </div>
          `;
          certContainer.appendChild(div);
        });
        document.querySelectorAll('#certificates .reveal').forEach(el => observer.observe(el));
      }
    } else if (!certError && certContainer) {
      certContainer.innerHTML = '<div style="color: var(--muted); font-size: 0.9rem;">No certificates added yet.</div>';
    }


  } catch (err) {
    console.error("Error fetching dynamic content:", err);
  }
});

// Blog Modal Logic (Simple modal for reading blogs)
window.openBlogModal = async function(id) {
  const { data, error } = await supabaseClient.from('blogs').select('*').eq('id', id).single();
  if (data) {
    let modal = document.getElementById('blog-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'blog-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
      modal.style.zIndex = '9999';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.padding = '2rem';
      
      const content = document.createElement('div');
      content.style.backgroundColor = 'var(--card)';
      content.style.padding = '2.5rem';
      content.style.borderRadius = '12px';
      content.style.maxWidth = '800px';
      content.style.width = '100%';
      content.style.maxHeight = '90vh';
      content.style.overflowY = 'auto';
      content.style.position = 'relative';
      content.style.border = '1px solid var(--border)';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '1rem';
      closeBtn.style.right = '1.5rem';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'var(--text)';
      closeBtn.style.fontSize = '2rem';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => modal.style.display = 'none';
      
      const body = document.createElement('div');
      body.id = 'blog-modal-body';
      
      content.appendChild(closeBtn);
      content.appendChild(body);
      modal.appendChild(content);
      document.body.appendChild(modal);
    }
    
    document.getElementById('blog-modal-body').innerHTML = `
      <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 1rem; color: var(--text);">${data.title}</h2>
      <p style="color: var(--muted); margin-bottom: 2rem;">${data.summary}</p>
      <div style="line-height: 1.8; color: var(--text); font-family: 'Inter', sans-serif;" class="ql-editor">
        ${data.content}
      </div>
    `;
    modal.style.display = 'flex';
  }
}
