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
        const response = await fetch('cookbook.md?v=' + Date.now());
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
        setupSmoothScrolling();
        
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
    }

    function highlightActiveSection() {
        window.addEventListener('scroll', () => {
            const headings = contentDiv.querySelectorAll('h2, h3');
            const tocLinks = document.querySelectorAll('.toc-item');
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
        const searchCount = document.getElementById('search-count');
        const searchClear = document.getElementById('search-clear');
        const searchShortcut = document.querySelector('.search-shortcut');

        // Global hotkey: '/' or 'Ctrl+K' / 'Cmd+K' to focus search
        window.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isTyping = activeTag === 'input' || activeTag === 'textarea';

            if ((e.key === '/' && !isTyping) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });

        // Clear button click
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });
        }

        // Shortcut badge click
        if (searchShortcut) {
            searchShortcut.addEventListener('click', () => {
                searchInput.focus();
                searchInput.select();
            });
        }

        // Handle Enter key for cycling and Escape for canceling
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
                return;
            }

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

                if (searchCount) {
                    searchCount.textContent = `${currentMatchIndex + 1}/${matches.length}`;
                }
                
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
            const rawTerm = e.target.value.trim().toLowerCase();
            
            // Always reset content first
            contentDiv.innerHTML = originalHtml;
            setupCopyButtons();
            matches = [];
            currentMatchIndex = -1;

            if (!rawTerm) {
                if (searchCount) searchCount.style.display = 'none';
                if (searchClear) searchClear.style.display = 'none';
                if (searchShortcut) searchShortcut.style.display = '';
                return;
            }

            if (searchClear) searchClear.style.display = 'inline-block';
            if (searchShortcut) searchShortcut.style.display = 'none';

            // Tokenize query words & filter common stop words
            const stopWords = new Set(['and', 'or', 'the', 'a', 'an', 'to', 'in', 'of', 'for', 'with', 'on', 'at', 'is']);
            const rawTokens = rawTerm.split(/\s+/).filter(Boolean);
            let tokens = rawTokens.filter(t => !stopWords.has(t));
            if (tokens.length === 0) tokens = rawTokens;

            // 1. Filter tables (hide non-matching rows, keep matching rows visible)
            const tables = contentDiv.querySelectorAll('table');
            tables.forEach(table => {
                const rows = table.querySelectorAll('tr:not(:first-child)');
                let hasVisibleRow = false;
                
                // If the table header contains all tokens, keep all rows
                const headerText = table.querySelector('tr:first-child')?.textContent.toLowerCase() || '';
                if (tokens.every(token => headerText.includes(token))) {
                    return;
                }

                rows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    // Matches if all query tokens appear in row or exact raw term appears
                    const matchesAll = tokens.every(token => rowText.includes(token)) || rowText.includes(rawTerm);
                    if (matchesAll) {
                        row.style.display = '';
                        hasVisibleRow = true;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                if (!hasVisibleRow) {
                    table.style.display = 'none';
                } else {
                    table.style.display = '';
                }
            });

            // 2. Highlight text nodes matching tokens or full query
            const walker = document.createTreeWalker(contentDiv, NodeFilter.SHOW_TEXT, {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    // Skip hidden table rows/tables
                    if (parent.closest('tr[style*="display: none"]') || parent.closest('table[style*="display: none"]')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }, false);

            const nodesToReplace = [];
            let node;
            while (node = walker.nextNode()) {
                const valLower = node.nodeValue.toLowerCase();
                if (tokens.some(token => valLower.includes(token))) {
                    nodesToReplace.push(node);
                }
            }

            // Create regex matching rawTerm first (if multiple words), then individual tokens
            const uniqueTokens = [...new Set([rawTerm, ...tokens])]
                .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .sort((a, b) => b.length - a.length);
            const regex = new RegExp(`(${uniqueTokens.join('|')})`, 'gi');

            nodesToReplace.forEach(n => {
                const parent = n.parentNode;
                if (!parent) return;
                const temp = document.createElement('span');
                const escapedText = n.nodeValue
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
                
                temp.innerHTML = escapedText.replace(regex, '<mark class="search-match" style="background-color: var(--accent-primary); color: #0f172a; border-radius: 2px; padding: 0 2px; transition: all 0.2s;">$1</mark>');
                
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, n);
                }
                parent.removeChild(n);
            });

            // Gather all visible match elements
            matches = Array.from(contentDiv.querySelectorAll('mark.search-match'));

            // Update match count badge
            if (searchCount) {
                searchCount.style.display = 'inline-block';
                if (matches.length > 0) {
                    searchCount.textContent = `1/${matches.length}`;
                } else {
                    searchCount.textContent = '0 found';
                }
            }

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
                // If no highlighted marks, scroll to first visible matching table row
                const visibleRow = contentDiv.querySelector('table:not([style*="display: none"]) tr:not([style*="display: none"]):not(:first-child)');
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

    function setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const targetId = link.getAttribute('href').substring(1);
            if (!targetId) return;
            
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                
                // Close sidebar on mobile after clicking
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }

                // Account for fixed header
                const headerOffset = 90;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    }
});
