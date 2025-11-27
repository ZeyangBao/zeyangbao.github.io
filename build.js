const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// ============================================================================
// TEMPLATES
// ============================================================================

function generateNav(activePage) {
    return `  <nav>
    <div class="container">
      <div class="logo">Zeyang Bao</div>
      <ul>
        <li><a href="${activePage === 'index' ? '' : '../'}index.html"${activePage === 'index' ? ' class="active"' : ''}>Home</a></li>
        <li><a href="${activePage === 'experience' ? '' : '../'}experience.html"${activePage === 'experience' ? ' class="active"' : ''}>Experience</a></li>
        <li><a href="${activePage === 'writing' ? '' : '../'}writing.html"${activePage === 'writing' ? ' class="active"' : ''}>Writing</a></li>
      </ul>
    </div>
  </nav>`;
}

function generateFooter() {
    return `  <footer>
    <div class="container">
      <p>&copy; 2024 Zeyang Bao. All rights reserved.</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem;">
        Built with HTML & CSS • Hosted on GitHub Pages
      </p>
    </div>
  </footer>`;
}

function generatePostPage(post, content) {
    const pathPrefix = '../';

    return `<!DOCTYPE HTML>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${post.title} - Zeyang Bao</title>

    <meta name="author" content="Zeyang Bao">
    <meta name="description" content="${post.excerpt}">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="${pathPrefix}images/favicon/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" href="${pathPrefix}stylesheet.css">

    <style>
        .post-content {
            max-width: 700px;
            margin: 0 auto;
            font-size: 1.1rem;
            line-height: 1.8;
        }

        .post-content h2 {
            margin-top: 2.5rem;
            margin-bottom: 1rem;
        }

        .post-content h3 {
            margin-top: 2rem;
            margin-bottom: 0.75rem;
        }

        .post-content p {
            margin-bottom: 1.5rem;
        }

        .post-content ul,
        .post-content ol {
            margin-bottom: 1.5rem;
            margin-left: 2rem;
        }

        .post-content li {
            margin-bottom: 0.5rem;
        }

        .post-content code {
            background: var(--background-color);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: var(--accent-color);
        }

        .post-content pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 1.5rem;
        }

        .post-content pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }

        .post-content blockquote {
            border-left: 4px solid var(--accent-color);
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: var(--text-light);
        }

        .post-header {
            text-align: center;
            padding: 3rem 0 2rem;
            background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
        }

        .post-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .post-meta-header {
            display: flex;
            gap: 2rem;
            justify-content: center;
            color: var(--text-light);
            font-size: 1rem;
        }

        .author-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 2rem;
            background: var(--background-color);
            border-radius: 12px;
            margin: 3rem 0;
        }

        .author-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }

        .author-info h3 {
            margin-bottom: 0.25rem;
        }

        .author-info p {
            margin-bottom: 0;
            color: var(--text-light);
        }
    </style>
</head>

<body>
${generateNav('post')}

    <!-- Post Header -->
    <header class="post-header">
        <div class="container content-wrapper">
            <h1 class="post-title">${post.title}</h1>
            <div class="post-meta-header">
                <span>📅 ${post.date}</span>
                <span>⏱️ ${post.readTime}</span>
                <span>✍️ Zeyang Bao</span>
            </div>
            <div class="blog-tags mt-2">
${post.tags.map(tag => `                <span class="tag">${tag}</span>`).join('\n')}
            </div>
        </div>
    </header>

    <!-- Post Content -->
    <article>
        <div class="container">
            <div class="post-content">

${content}

                <hr style="margin: 3rem 0; border: none; border-top: 1px solid var(--border-color);">

                <div class="author-section">
                    <div class="author-info">
                        <h3>Zeyang Bao</h3>
                        <p>AI Engineer at Google, working on NotebookLM. Passionate about building AI systems that
                            enhance human knowledge and understanding.</p>
                        <div class="social-links" style="margin-top: 1rem;">
                            <a href="${pathPrefix}index.html" style="font-size: 0.9rem;">← Back to Home</a>
                            <a href="${pathPrefix}writing.html" style="font-size: 0.9rem; margin-left: 1rem;">← All Posts</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </article>

${generateFooter()}
</body>

</html>`;
}

// ============================================================================
// BUILD FUNCTIONS
// ============================================================================

function buildPosts() {
    console.log('Building posts...');

    const postsDir = path.join(__dirname, 'content', 'posts');
    const outputDir = path.join(__dirname, 'posts');

    if (!fs.existsSync(postsDir)) {
        console.log('  No posts directory found, skipping...');
        return [];
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const posts = [];

    for (const file of files) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Convert markdown to HTML
        const htmlContent = md.render(content);

        // Indent the HTML content properly
        const indentedContent = htmlContent
            .split('\n')
            .map(line => line ? '                ' + line : '')
            .join('\n');

        // Generate the full HTML page
        const html = generatePostPage(data, indentedContent);

        // Write to output
        const outputFile = path.join(outputDir, file.replace('.md', '.html'));
        fs.writeFileSync(outputFile, html);

        console.log(`  ✓ Generated ${file.replace('.md', '.html')}`);

        // Store post metadata for writing page
        posts.push({
            ...data,
            slug: file.replace('.md', '.html'),
            filename: file.replace('.md', '')
        });
    }

    return posts;
}

function buildWritingPage(posts) {
    console.log('Building writing page...');

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const postCards = posts.map(post => {
        return `                <!-- Blog Post -->
                <article class="blog-card">
                    <div class="blog-card-content">
                        <div class="blog-meta">
                            <span>📅 ${post.date}</span>
                            <span>⏱️ ${post.readTime}</span>
                        </div>
                        <h2 class="blog-title">
                            <a href="posts/${post.slug}">${post.title}</a>
                        </h2>
                        <p class="blog-excerpt">
                            ${post.excerpt}
                        </p>
                        <div class="blog-tags">
${post.tags.map(tag => `                            <span class="tag">${tag}</span>`).join('\n')}
                        </div>
                    </div>
                </article>`;
    }).join('\n\n');

    const html = `<!DOCTYPE HTML>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Writing - Zeyang Bao</title>

    <meta name="author" content="Zeyang Bao">
    <meta name="description" content="Blog posts and writings by Zeyang Bao on AI, machine learning, and technology.">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="images/favicon/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" href="stylesheet.css">
</head>

<body>
${generateNav('writing')}

    <!-- Page Header -->
    <section class="hero" style="padding: 3rem 0;">
        <div class="container content-wrapper text-center">
            <h1>Writing</h1>
            <p style="font-size: 1.1rem; color: var(--text-light); max-width: 600px; margin: 1rem auto;">
                Thoughts on AI, machine learning, and building intelligent systems
            </p>
        </div>
    </section>

    <!-- Blog Posts -->
    <section>
        <div class="container content-wrapper">
            <div class="blog-grid">

${postCards}

            </div>
        </div>
    </section>

    <!-- Call to Action -->
    <section
        style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white;">
        <div class="container content-wrapper text-center">
            <h2 style="color: white;">Stay Updated</h2>
            <p style="font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
                Want to be notified when I publish new posts? Follow me on social media or subscribe to my newsletter.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="#" class="btn btn-secondary" style="background: white; color: var(--primary-color);">
                    Subscribe to Newsletter
                </a>
                <a href="#" class="btn btn-secondary" style="border-color: white; color: white;">
                    Follow on Twitter
                </a>
            </div>
        </div>
    </section>

${generateFooter()}
</body>

</html>`;

    fs.writeFileSync(path.join(__dirname, 'writing.html'), html);
    console.log('  ✓ Generated writing.html');
}

function buildHomepage() {
    console.log('Building homepage...');

    const dataPath = path.join(__dirname, 'content', 'homepage.yml');

    if (!fs.existsSync(dataPath)) {
        console.log('  No homepage.yml found, skipping...');
        return;
    }

    const data = yaml.load(fs.readFileSync(dataPath, 'utf-8'));

    const socialLinksHTML = data.social_links.map(link =>
        `            <a href="${link.url}" class="social-link">${link.text}</a>`
    ).join('\n');

    const interestsHTML = data.research_interests.map(interest =>
        `        <div class="interest-card">
          <h3>${interest.icon} ${interest.title}</h3>
          <p>${interest.description}</p>
        </div>`
    ).join('\n\n');

    const featuredWorkHTML = data.featured_work.map(work =>
        `        <div class="card">
          <h3>${work.title}</h3>
          <p class="blog-meta">
            <span>📅 ${work.date}</span>
            <span>🏢 ${work.company}</span>
          </p>
          <p>
            ${work.description}
          </p>
          <div class="blog-tags">
${work.tags.map(tag => `            <span class="tag">${tag}</span>`).join('\n')}
          </div>
        </div>`
    ).join('\n\n');

    const newsHTML = data.news.map(item =>
        `        <div class="timeline-item">
          <p class="timeline-date">${item.date}</p>
          <h3 class="timeline-title">${item.title}</h3>
          <p class="timeline-description">
            ${item.description}
          </p>
        </div>`
    ).join('\n\n');

    const html = `<!DOCTYPE HTML>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Zeyang Bao - AI Engineer at Google</title>

  <meta name="author" content="Zeyang Bao">
  <meta name="description"
    content="Zeyang Bao is an AI Engineer at Google working on the NotebookLM team, focusing on large language models and AI-powered knowledge management.">
  <meta name="keywords"
    content="Zeyang Bao, AI Engineer, Google, NotebookLM, Machine Learning, LLM, Artificial Intelligence">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="shortcut icon" href="images/favicon/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" type="text/css" href="stylesheet.css">
</head>

<body>
${generateNav('index')}

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>${data.bio.name}</h1>
          <p class="hero-subtitle">${data.bio.title}</p>
          <p class="hero-company">${data.bio.company}</p>
          <p class="hero-bio">
            ${data.bio.description}
          </p>

          <div class="social-links">
${socialLinksHTML}
          </div>
        </div>

        <div>
          <img src="${data.bio.image}" alt="${data.bio.name}" class="profile-image">
        </div>
      </div>
    </div>
  </section>

  <!-- Research Interests -->
  <section>
    <div class="container">
      <h2 class="section-title">Research Interests</h2>
      <div class="interests-grid">
${interestsHTML}
      </div>
    </div>
  </section>

  <!-- Featured Work -->
  <section style="background: white;">
    <div class="container">
      <h2 class="section-title">Featured Work</h2>

      <div class="blog-grid">
${featuredWorkHTML}
      </div>
    </div>
  </section>

  <!-- News & Updates -->
  <section>
    <div class="container content-wrapper">
      <h2 class="section-title">News & Updates</h2>

      <div class="timeline">
${newsHTML}
      </div>
    </div>
  </section>

${generateFooter()}
</body>

</html>`;

    fs.writeFileSync(path.join(__dirname, 'index.html'), html);
    console.log('  ✓ Generated index.html');
}

function buildExperiencePage() {
    console.log('Building experience page...');

    const dataPath = path.join(__dirname, 'content', 'experiences.yml');

    if (!fs.existsSync(dataPath)) {
        console.log('  No experiences.yml found, skipping...');
        return;
    }

    const data = yaml.load(fs.readFileSync(dataPath, 'utf-8'));

    const experienceHTML = data.experience.map(job =>
        `                <div class="timeline-item">
                    <p class="timeline-date">${job.date}</p>
                    <h3 class="timeline-title">${job.title}</h3>
                    <p class="timeline-company">${job.company} • ${job.team ? job.team + ' • ' : ''}${job.location}</p>
                    <div class="timeline-description">
                        <p>${job.description}</p>
                        ${job.tags ? `<div class="blog-tags mt-2">
${job.tags.map(tag => `                            <span class="tag">${tag}</span>`).join('\n')}
                        </div>` : ''}
                    </div>
                </div>`
    ).join('\n\n');

    const educationHTML = data.education.map(edu =>
        `                <div class="timeline-item">
                    <p class="timeline-date">${edu.date}</p>
                    <h3 class="timeline-title">${edu.degree}</h3>
                    <p class="timeline-company">${edu.school}</p>
                    <div class="timeline-description">
                        <p>${edu.description}</p>
                    </div>
                </div>`
    ).join('\n\n');

    const publicationsHTML = data.publications ? `
    <!-- Publications -->
    <section style="background: white;">
        <div class="container content-wrapper">
            <h2>Publications</h2>
            <div class="blog-grid">
${data.publications.map(pub => `                <div class="card">
                    <h3><a href="${pub.link}" target="_blank" class="external-link">${pub.title}</a></h3>
                    <p class="blog-meta">
                        <span>📅 ${pub.year}</span>
                        <span>📄 ${pub.venue}</span>
                    </p>
                    <p>${pub.authors}</p>
                </div>`).join('\n')}
            </div>
        </div>
    </section>` : '';

    const html = `<!DOCTYPE HTML>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Experience - Zeyang Bao</title>

    <meta name="author" content="Zeyang Bao">
    <meta name="description"
        content="Professional experience and education of Zeyang Bao.">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="images/favicon/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" href="stylesheet.css">
</head>

<body>
${generateNav('experience')}

    <!-- Page Header -->
    <section class="hero" style="padding: 3rem 0;">
        <div class="container content-wrapper text-center">
            <h1>Professional Experience</h1>
            <p style="font-size: 1.1rem; color: var(--text-light); max-width: 600px; margin: 1rem auto;">
                My journey in AI engineering, from education to building production systems
            </p>
        </div>
    </section>

    <!-- Work Experience -->
    <section>
        <div class="container content-wrapper">
            <h2>Work Experience</h2>

            <div class="timeline">
${experienceHTML}
            </div>
        </div>
    </section>

    <!-- Education -->
    <section style="background: white;">
        <div class="container content-wrapper">
            <h2>Education</h2>

            <div class="timeline">
${educationHTML}
            </div>
        </div>
    </section>

${publicationsHTML}

${generateFooter()}
</body>

</html>`;

    fs.writeFileSync(path.join(__dirname, 'experience.html'), html);
    console.log('  ✓ Generated experience.html');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
    console.log('🏗️  Building website...\n');

    const posts = buildPosts();
    buildWritingPage(posts);
    buildHomepage();
    buildExperiencePage();

    console.log('\n✨ Build complete!');
}

main();
