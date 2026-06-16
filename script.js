document.addEventListener('DOMContentLoaded', async () => {
    const contentDiv = document.getElementById('markdown-content');
    const tocNav = document.getElementById('toc');
    const searchInput = document.getElementById('search-input');
    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backToTopBtn = document.getElementById('back-to-top');

    // Configure marked options with highlight.js
    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
    });

    try {
        // Fetch the markdown content
        const response = await fetch('cookbook.md');
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }
        const markdown = await response.text();

        // Parse markdown to HTML
        const rawHtml = marked.parse(markdown);
        
        // Sanitize the HTML before inserting (good practice)
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        
        // Render content
        contentDiv.innerHTML = cleanHtml;

        // Generate Table of Contents
        generateTOC();

        // Setup Copy Buttons
        setupCopyButtons();

        // Capture the DOM state after TOC and buttons are generated
        const originalHtml = contentDiv.innerHTML;

        // Initialize features
        setupSearch(originalHtml);
        setupSidebarToggle();
        setupSidebarResizer();
        setupBackToTop();
        highlightActiveSection();
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div style="color: #ef4444; padding: 2rem; border: 1px solid #ef4444; border-radius: 8px; background: rgba(239, 68, 68, 0.1);">
                <h3>Error Loading Cookbook</h3>
                <p>${error.message}</p>
                <p style="margin-top: 1rem; font-size: 0.9em; color: #9ca3af;">
                    Make sure you're running this via a web server (e.g., using run.sh) and not just opening the file directly in the browser.
                </p>
            </div>
        `;
    }

    function setupCopyButtons() {
        const codeBlocks = contentDiv.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.setAttribute('aria-label', 'Copy code');
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            wrapper.appendChild(btn);
        });

        // Event delegation to handle clicks even after content resets
        contentDiv.addEventListener('click', (e) => {
            const btn = e.target.closest('.copy-btn');
            if (!btn) return;
            
            const wrapper = btn.closest('.code-wrapper');
            const code = wrapper.querySelector('code').innerText;
            
            navigator.clipboard.writeText(code).then(() => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-primary)" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                setTimeout(() => {
                    if (document.body.contains(btn)) {
                        btn.innerHTML = originalHTML;
                    }
                }, 2000);
            });
        });
    }

    function generateTOC() {
        const headings = contentDiv.querySelectorAll('h2, h3');
        let tocHtml = '';

        headings.forEach(heading => {
            // Create id from heading text if not present
            if (!heading.id) {
                heading.id = heading.textContent
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
            }

            const level = heading.tagName.toLowerCase();
            const className = level === 'h3' ? 'toc-item toc-h3' : 'toc-item';
            
            // Skip the first generic "Table of Contents" h3 if it exists in markdown
            if (heading.textContent.toLowerCase() === 'table of contents') return;

            tocHtml += `<a href="#${heading.id}" class="${className}" data-id="${heading.id}">${heading.textContent}</a>`;
        });

        tocNav.innerHTML = tocHtml;

        // Add smooth scrolling
        document.querySelectorAll('.toc-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                
                if (targetEl) {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                    }

                    // Account for fixed header
                    const headerOffset = 80;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    function highlightActiveSection() {
        const headings = Array.from(contentDiv.querySelectorAll('h2, h3'));
        const tocLinks = Array.from(document.querySelectorAll('.toc-item'));

        window.addEventListener('scroll', () => {
            let current = '';
            
            // Add offset for the fixed header
            const scrollPos = window.scrollY + 100;

            headings.forEach(heading => {
                if (heading.offsetTop <= scrollPos) {
                    current = heading.id;
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.id === current) {
                    link.classList.add('active');
                }
            });
        });
    }

    function setupSearch(originalHtml) {
        let matches = [];
        let currentMatchIndex = -1;

        // Handle Enter key for cycling through matches
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && matches.length > 0) {
                e.preventDefault();
                
                // Reset styling of previously active match
                if (currentMatchIndex >= 0 && currentMatchIndex < matches.length) {
                    matches[currentMatchIndex].style.backgroundColor = 'var(--accent-primary)';
                    matches[currentMatchIndex].style.color = '#0f172a';
                }
                
                // Cycle index
                if (e.shiftKey) {
                    currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
                } else {
                    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
                }
                
                // Highlight and scroll to new active match
                const activeMatch = matches[currentMatchIndex];
                activeMatch.style.backgroundColor = '#fb923c'; // Orange highlight for active
                activeMatch.style.color = '#fff';
                
                const headerOffset = 100;
                const elementPosition = activeMatch.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.trim().toLowerCase();
            
            // Always reset the content first to clear previous searches
            contentDiv.innerHTML = originalHtml;
            matches = [];
            currentMatchIndex = -1;
            
            if (!term) return;

            // 1. Highlight text nodes
            const walker = document.createTreeWalker(contentDiv, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue.toLowerCase().includes(term)) {
                    nodesToReplace.push(node);
                }
            }

            nodesToReplace.forEach(n => {
                const temp = document.createElement('span');
                const escapedText = n.nodeValue
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
                
                // Escape regex special characters in the search term
                const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${safeTerm})`, 'gi');
                
                temp.innerHTML = escapedText.replace(regex, '<mark class="search-match" style="background-color: var(--accent-primary); color: #0f172a; border-radius: 2px; padding: 0 2px; transition: all 0.2s;">$1</mark>');
                
                while (temp.firstChild) {
                    n.parentNode.insertBefore(temp.firstChild, n);
                }
                n.parentNode.removeChild(n);
            });

            // Gather all match elements
            matches = Array.from(contentDiv.querySelectorAll('mark.search-match'));

            // 2. Filter tables (hide rows that don't match)
            const tables = contentDiv.querySelectorAll('table');
            tables.forEach(table => {
                const rows = table.querySelectorAll('tr:not(:first-child)');
                let hasVisibleRow = false;
                
                // If the table header has the term, keep all rows visible
                const headerText = table.querySelector('tr:first-child').textContent.toLowerCase();
                if (headerText.includes(term)) {
                    return; // skip hiding rows
                }

                rows.forEach(row => {
                    if (row.textContent.toLowerCase().includes(term)) {
                        row.style.display = '';
                        hasVisibleRow = true;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                // Hide table completely if no rows match
                if (!hasVisibleRow) {
                    table.style.display = 'none';
                }
            });

            // 3. Scroll to the first match automatically
            if (matches.length > 0) {
                currentMatchIndex = 0;
                const activeMatch = matches[0];
                activeMatch.style.backgroundColor = '#fb923c';
                activeMatch.style.color = '#fff';

                const headerOffset = 100;
                const elementPosition = activeMatch.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            } else {
                // If no highlighted matches, maybe scroll to a visible table row
                const visibleRow = contentDiv.querySelector('tr:not([style*="display: none"])');
                if (visibleRow) {
                    const headerOffset = 100;
                    const elementPosition = visibleRow.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    }

    function setupSidebarToggle() {
        const isMobile = () => window.innerWidth <= 768;
        const closeBtn = document.getElementById('close-sidebar');
        
        menuBtn.addEventListener('click', () => {
            if (isMobile()) {
                sidebar.classList.toggle('open');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.remove('open');
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }

        // Close when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (isMobile() && 
                !sidebar.contains(e.target) && 
                !menuBtn.contains(e.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });

        // Reset state appropriately when resizing window
        window.addEventListener('resize', () => {
            if (!isMobile() && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    function setupSidebarResizer() {
        const resizer = document.getElementById('resizer');
        if (!resizer) return;
        
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // Calculate new width
            let newWidth = e.clientX;
            
            // Set min and max width constraints
            if (newWidth < 200) newWidth = 200;
            if (newWidth > 600) newWidth = 600;
            
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
            }
        });
    }

    function setupBackToTop() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
