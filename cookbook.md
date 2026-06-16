# VIM COOKBOOK
## Competitive Programming Edition

---

### TABLE OF CONTENTS

1. [Vim Modes](#vim-modes)
2. [Essential Navigation](#essential-navigation)
3. [Editing & Refactoring](#editing--refactoring)
4. [Search & Replace](#search--replace)
5. [File & Window Management](#file--window-management)
6. [Compilation & Execution](#compilation--execution)
7. [Plugins & Shortcuts](#plugins--shortcuts)
8. [Advanced Features](#advanced-features)
9. [Quick Reference Tables](#quick-reference-tables)
10. [CP Workflow Examples](#cp-workflow-examples)
11. [APPENDIX: Complete .vimrc Configuration](#appendix-complete-vimrc-configuration)

---

## VIM MODES

### Understanding Modal Editing

**Normal Mode** (Press `Esc`)
- Default mode for navigation and commands
- 80% of your time should be here
- Keys perform actions (not text insertion)

**Insert Mode** (Press `i`, `a`, `o`)
- Text entry mode (like normal editors)
- Exit with `Esc`

**Visual Mode** (Press `v`, `V`, `Ctrl+v`)
- Text selection mode
- `v` = character-wise
- `V` = line-wise  
- `Ctrl+v` = block-wise

**Command-Line Mode** (Press `:`, `/`, `?`)
- For commands, search, and save/quit

---

## ESSENTIAL NAVIGATION

### Basic Movement (Normal Mode)

| Key | Action |
|-----|--------|
| `h` `j` `k` `l` | Left, Down, Up, Right |
| `w` | Jump forward to next word |
| `b` | Jump backward to previous word |
| `e` | Jump to end of current/next word |
| `0` | Jump to beginning of line |
| `^` | Jump to first non-blank character |
| `$` | Jump to end of line |
| `gg` | Jump to top of file (line 1) |
| `G` | Jump to bottom of file |
| `15G` or `15gg` | Jump to line 15 |

### Smart Navigation

| Key | Action |
|-----|--------|
| `f{char}` | Jump forward to {char} on current line |
| `F{char}` | Jump backward to {char} |
| `t{char}` | Jump to *before* {char} |
| `T{char}` | Jump to *after* {char} |
| `%` | Jump to matching bracket `{ }` `( )` `[ ]` |
| `*` | Search for word under cursor (forward) |
| `#` | Search for word under cursor (backward) |
| `Ctrl+d` | Scroll down half page |
| `Ctrl+u` | Scroll up half page |

### Marks (Teleportation)

| Command | Action |
|---------|--------|
| `m{a-z}` | Set mark (e.g., `ms` sets mark 's') |
| `` `{a-z}` `` | Jump to mark (e.g., `` `s ``) |
| `` `` `` | Jump back to last position before jump |

---

## EDITING & REFACTORING

### Basic Editing (Normal Mode)

| Key | Action |
|-----|--------|
| `x` | Delete character under cursor |
| `dd` | Delete (cut) entire line |
| `dw` | Delete to end of word |
| `yy` | Yank (copy) entire line |
| `p` | Paste after cursor/below line |
| `P` | Paste before cursor/above line |
| `u` | Undo |
| `Ctrl+r` | Redo |
| `.` | Repeat last change |
| `r{char}` | Replace character under cursor |
| `~` | Toggle case of character |

### Text Objects (Verb + Noun)

| Command | Action |
|---------|--------|
| `ciw` | Change inner word |
| `caw` | Change a word (includes surrounding space) |
| `ci"` | Change inside double quotes |
| `ci'` | Change inside single quotes |
| `ci(` | Change inside parentheses |
| `ci[` | Change inside brackets |
| `ci{` | Change inside braces |
| `daw` | Delete a word |
| `diw` | Delete inner word |

---

## SEARCH & REPLACE

### Basic Search (Normal Mode)

| Command | Action |
|---------|--------|
| `/pattern` | Search forward |
| `?pattern` | Search backward |
| `n` | Next match |
| `N` | Previous match |
| `*` | Search word under cursor (forward) |
| `#` | Search word under cursor (backward) |

### Find and Replace (Command Mode)

| Command | Action |
|---------|--------|
| `:s/old/new/` | Replace first occurrence on current line |
| `:s/old/new/g` | Replace all occurrences on current line |
| `:%s/old/new/g` | Replace all occurrences in entire file |
| `:%s/old/new/gc` | Replace all in file with confirmation prompt |
| `:5,10s/old/new/g` | Replace in lines 5 through 10 |

### Universal Search (Multi-File)

| Command | Action |
|---------|--------|
| `:vimgrep /pattern/ **/*.cpp` | Search all .cpp files in directory tree |
| `:copen` | Open results window (Quickfix list) |
| `:cnext` or `:cn` | Jump to next search result |
| `:cprev` or `:cp` | Jump to previous search result |
| `:cclose` | Close results window |

---

## FILE & WINDOW MANAGEMENT

### File Operations (Command Mode)

| Command | Action |
|---------|--------|
| `:w` | Save file |
| `:q` | Quit current window |
| `:q!` | Quit without saving (force) |
| `:wq` or `:x` or `ZZ` | Save and quit |
| `:e filename` | Open or create a new file |
| `:saveas filename` | Save current buffer as a new file |

### Window Splits

| Command | Action |
|---------|--------|
| `:vsplit` or `:vs` | Open vertical split |
| `:split` or `:sp` | Open horizontal split |
| `:vsplit filename` | Open specific file in vertical split |

### Window Navigation (Normal Mode)

| Key | Action |
|-----|--------|
| `Ctrl+w` then `h` | Move to left window |
| `Ctrl+w` then `j` | Move to window below |
| `Ctrl+w` then `k` | Move to window above |
| `Ctrl+w` then `l` | Move to right window |
| `Ctrl+w` then `=` | Equalize all window sizes |
| `Ctrl+w` then `c` or `q` | Close current window |
| `Ctrl+w` then `o` | Close all other windows (keep only current) |

### File Browser (netrw)

| Key | Action |
|-----|--------|
| `<leader>e` (`,e`) | Toggle file browser |
| `Enter` | Open file or enter directory |
| `-` | Go up one directory level |
| `R` | Refresh directory listing |
| `q` | Close file browser window |
| `D` | Delete file/directory |

---

## COMPILATION & EXECUTION

### Your Custom Shortcuts (C++ files only)

| Key | Action |
|-----|--------|
| `<F5>` | Save, compile (C++17, -O2, -Wall), and run normally |
| `<F6>` | Save, compile, and run with `input.txt` / `output.txt` redirection |
| `<F7>` | Clear terminal screen |

### Terminal in Vim (For Debugging)

| Command | Action |
|---------|--------|
| `:term` | Open terminal in horizontal split |
| `:vterm` | Open terminal in vertical split |
| `:term gdb ./main` | Open terminal with gdb ready |
| `Ctrl+\` then `Ctrl+n` | Exit terminal insert mode to normal mode |
| `i` | Enter terminal insert mode |

---

## PLUGINS & SHORTCUTS

### vim-commentary

| Key | Mode | Action |
|-----|------|--------|
| `gcc` | Normal | Toggle comment on current line |
| `gc` | Visual | Toggle comment on selected lines |

### vim-surround

| Key | Mode | Action |
|-----|------|--------|
| `cs"'` | Normal | Change surrounding `"` to `'` |
| `ds"` | Normal | Delete surrounding `"` |
| `ysiw[` | Normal | Wrap inner word in `[ ]` |
| `S{` | Visual | Wrap visual selection in `{ }` |

---

## ADVANCED FEATURES

You now have a battle-tested foundation. You know how to navigate, edit, search, and compile. 

To take your Vim skills from "functional" to **" Competitive Programming speedrun"**, here are the most high-leverage, advanced tips and tricks. These are the features that make Vim veterans look like they are using magic.

### 1. Macros: The Ultimate CP Superpower
A macro records a sequence of keystrokes and replays them. This is invaluable for formatting input, generating test cases, or refactoring repetitive code.

**The Workflow:**
1. **`q{letter}`**: Start recording a macro into register `{letter}` (e.g., `qa` records to register 'a').
2. **Perform your actions**: Do exactly what you want to repeat (e.g., change a word, add a semicolon, move down a line).
3. **`q`**: Stop recording.
4. **`@{letter}`**: Replay the macro (e.g., `@a`).
5. **`10@a`**: Replay the macro 10 times.

**CP Example: Generating `cin` statements**
You have a line of variables: `int n, m, k, q;` and you want to read them.
1. Move cursor to `n`.
2. Press `qa` (start recording to 'a').
3. Press `cw` (change word), type `cin >> n`, press `Esc`.
4. Press `f,` (find the next comma).
5. Press `q` (stop recording).
6. Now, press `3@a`. Vim will automatically transform `m, k, q;` into `cin >> m; cin >> k; cin >> q;` in a fraction of a second.

### 2. Marks: Instant Teleportation
In CP, you often jump between your `main()` function, your `solve()` function, and your global variables. Scrolling is slow. Marks are instant teleportation points.

* **`m{a-z}`**: Set a mark. (e.g., move to your `solve()` function and press `ms` to set mark 's').
* **`'{a-z}`** or **`` `{a-z}`**: Jump to that mark. (e.g., press `` `s `` to instantly teleport back to your `solve()` function).
* **`` `` ``** (backtick, backtick): Jump back to the *exact position* you were at before your last jump. This is a lifesaver after using `*` to search or `Ctrl+]` to jump to a definition.

### 3. Named Registers: Safe Copy/Paste
By default, Vim uses the "unnamed register" (`"`). If you `yy` (copy) a line, then `dd` (delete) another line, your copied line is overwritten by the deleted line. This is frustrating.

**The Solution: Use Named Registers (`a` through `z`)**
* **`"ayy`**: Yank (copy) the current line into register 'a'.
* **`"add`**: Delete the current line into register 'a' (without overwriting your default clipboard).
* **`"ap`**: Paste from register 'a'.

*CP Workflow*: You find a useful snippet in an old file. Yank it with `"ayy`. Go to your new file. Delete a broken line with `dd` (this goes to the default register, leaving 'a' untouched). Paste your safe snippet with `"ap`.

### 4. Built-in Diffing: The CP Debugger’s Best Friend
When your code fails a test case, you need to compare your `output.txt` with the `expected.txt` (or `ans.txt`). You do not need an external diff tool.

**From the Terminal:**
```bash
vim -d output.txt expected.txt
```
This opens Vim in "diff mode". 
* Differences are highlighted.
* **`]c`** (Normal mode): Jump to the next difference.
* **`[c`** (Normal mode): Jump to the previous difference.
* **`do`** (diff obtain): Pull the change from the other window into the current one.
* **`dp`** (diff put): Push the change from the current window to the other one.
* **`:diffoff`**: Turn off diff mode.

### 5. Folding: Hiding the Boilerplate
Your CP template might be 50+ lines of `#include`s, `#define`s, and helper functions. When you are actively writing logic, this is visual noise.

* **`zc`**: Close (fold) the block of code under the cursor (e.g., a function or a `#ifdef` block).
* **`zo`**: Open (unfold) the block under the cursor.
* **`zM`**: Close **all** folds in the file (great for collapsing your entire template).
* **`zR`**: Open **all** folds in the file.

*Tip*: Add `set foldmethod=indent` to your `.vimrc`. This automatically creates folds based on your C++ indentation levels, making `zM` and `zR` work flawlessly without manual setup.

### 6. The "Oh No" Recovery: Time Travel
Made a massive mistake? Deleted the wrong function? Vim has a built-in time machine.

* **`:earlier 1m`**: Revert the file to how it looked 1 minute ago.
* **`:earlier 5`**: Revert the file to how it looked 5 changes ago.
* **`:later 1m`**: Move forward in time (if you went too far back).

This is vastly superior to standard `u` (undo) because it works based on *time*, not just keystrokes, and survives closing and reopening the file (thanks to Vim's swap files).

### 7. Command-Line Window: Editing Complex Commands
If you are typing a long `:vimgrep` or a complex `:%s/.../.../` command and realize you made a typo, don't mash Backspace.

1. Press **`q:`** (in Normal mode).
2. Vim opens a new window containing your **command-line history**.
3. You can use normal Vim motions (`j`, `k`, `w`, `b`, `0`, `$`) to navigate this history, edit an old command, or fix a typo in your current long command.
4. Press **`Enter`** to execute the command under the cursor.
*(Note: `q/` does the exact same thing for your search history).*

### 8. Session Management: Pause and Resume
If you are in the middle of a virtual contest or working on a complex problem with multiple splits (`main.cpp`, `input.txt`, `output.txt`, and a `:term` window), you can save the entire layout.

* **`:mksession! my_contest.vim`**: Saves the current layout, open files, and folds to a file.
* **`:source my_contest.vim`**: Restores that exact layout later.
* *Pro Tip*: Start Vim from the terminal with `vim -S my_contest.vim` to instantly load your saved workspace.

### How to Practice These (The "One-a-Day" Rule)
Do not try to learn all of this at once. You will get overwhelmed. 

* **Day 1**: Practice **Marks** (`ms` and `` `s ``). Use them every time you jump between `main` and `solve`.
* **Day 2**: Practice **Named Registers** (`"ayy`, `"ap`). Use them whenever you copy code you intend to keep.
* **Day 3**: Practice **Macros** (`qa`, `@a`). Try it the next time you have to format a list of inputs.
* **Day 4**: Use **Diff Mode** (`vim -d`) the next time you get a Wrong Answer.

Vim is not about memorizing 100 commands. It is about internalizing a small, powerful set of composable actions until they become an extension of your hands. You are well on your way.

### Exercise: The CP Speedrun Challenge
Let's put all of this together by writing a simple C++ program from scratch.

**Task:** Write a program that reads `t` test cases. For each testcase, read 4 integers `n, a, b, c` and print their sum.

1. **Open Vim:** Run `vim solve.cpp` in your terminal.
2. **Template & Fold:** Use `i` to enter Insert mode and write your standard C++ template (`#include <iostream>...`). Press `Esc`. Type `zc` to **fold** the boilerplate out of your way.
3. **Teleportation:** Inside `int main()`, type `int t; cin >> t; while(t--) solve();`. Type `mm` to set a **mark** 'm' here.
4. **Fast Jump:** Type `gg` to go to the top, press `o` to open a new line, and type `void solve() {`. Press `` `m `` to instantly **teleport** back to `main()` if you need to check a variable, then `''` to jump back to `solve()`.
5. **Macros:** Inside `solve()`, type `int n, a, b, c;`. Put your cursor on `n`. Type `qa` to start recording. Type `cwcin >> n<Esc>`. Type `f,`. Type `q` to stop. Now type `3@a` to magically generate the rest of the `cin` statements!
6. **Time Travel:** Accidentally press `dd` and delete a critical line? Or maybe you wiped the whole function? Type `:earlier 1m` to travel back in time 1 minute.
7. **Diffing:** Save and exit with `:wq`. Compile your code `<F5>`. Create a dummy `expected.txt`. Run `vim -d output.txt expected.txt` to instantly highlight any wrong answers.

Try to run through this exercise until the keystrokes feel entirely natural.

---

## QUICK REFERENCE TABLES

### Numbers + Commands (Power Combos)

| Command | Action |
|---------|--------|
| `5w` | Jump 5 words forward |
| `3dd` | Delete 3 lines |
| `10j` | Move down 10 lines (use with relativenumber!) |
| `2fa` | Find the 2nd occurrence of 'a' on the line |
| `5yy` | Yank 5 lines |

### Command-Line Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+a` | Move to beginning of command line |
| `Ctrl+e` | Move to end of command line |
| `Ctrl+w` | Delete word backward in command line |
| `Ctrl+u` | Delete to beginning of command line |
| `Ctrl+r "` | Paste from default register into command line |
| `q:` | Open command-line history window |
| `q/` | Open search history window |

---

## CP WORKFLOW EXAMPLES

### Example 1: Fast Variable Declaration
**Task:** Convert `int n, m, k;` to `cin >> n; cin >> m; cin >> k;`
1. Position cursor on `n`
2. `qa` (start recording to 'a')
3. `cw` `cin >> n;` `<Esc>`
4. `f,` (find comma)
5. `q` (stop recording)
6. `2@a` (play macro twice)

### Example 2: Change All Variable Names Safely
**Task:** Change `max_val` to `maximum_value`
1. Position cursor on `max_val`
2. `*` (highlight all occurrences)
3. `:%s//maximum_value/gc` (Vim auto-fills `max_val` between slashes)
4. Press `a` to replace all safely

### Example 3: Compare Output Files
1. Exit Vim. Run: `vim -d output.txt expected.txt`
2. Use `]c` to jump between differences.
3. Fix code, recompile (`<F5>`), and repeat.

---

## APPENDIX: COMPLETE .VIMRC CONFIGURATION

*Copy this entire block into `~/.vimrc`. Ensure you have installed `vim-plug` first.*

```vim
" ==============================================================================
" VIM CONFIGURATION FOR COMPETITIVE PROGRAMMING (C++)
" ==============================================================================

" 1. Foundation & UI
set nocompatible            " Disable Vi compatibility, use modern Vim features
syntax on                   " Enable syntax highlighting
filetype plugin indent on   " Enable filetype detection, plugins, and indentation
set number                  " Show absolute line numbers
set relativenumber          " Show relative line numbers (great for jumping, e.g., 5j)
set cursorline              " Highlight the current line for better visibility
set showmatch               " Briefly jump to matching bracket when typed
set hidden                  " Allow switching buffers without saving first
set incsearch               " Show matches as you type the search pattern
set hlsearch                " Highlight all matches of the last search

" 2. Plugin Management (vim-plug)
call plug#begin('~/.vim/plugged')

" Essential lightweight plugins for CP
Plug 'tpope/vim-commentary'   " Press 'gcc' to comment a line, 'gc' to comment a selection
Plug 'tpope/vim-surround'     " Easily change/delete/add surrounding characters

call plug#end()

" 3. C++ Smart Indentation
set autoindent              " Copy indent from current line when starting a new one
set smartindent             " Smart auto-indenting for C-like languages
set cindent                 " Strict C/C++ indentation rules (handles { } perfectly)
set tabstop=4               " A <Tab> character counts as 4 spaces
set shiftwidth=4            " Number of spaces to use for auto-indent and >> / <<
set softtabstop=4           " Makes <Tab> and <Backspace> feel like 4 spaces
set expandtab               " Convert <Tab> keystrokes to spaces (prevents mixed tabs/spaces)
set smarttab                " <Tab> at the beginning of a line inserts shiftwidth spaces

" 4. Navigation & Window Management
let mapleader = ","         " Set the 'leader' key to comma (used for custom shortcuts)
set splitright              " Open vertical splits to the right
set splitbelow              " Open horizontal splits below
set scrolloff=8             " Keep 8 lines of context above/below the cursor
set sidescrolloff=15        " Keep 15 columns of context left/right of the cursor

" 5. Built-in File Browser (netrw)
let g:netrw_banner = 0                " Hide the netrw banner
let g:netrw_liststyle = 3             " Tree-like view
let g:netrw_browse_split = 4          " Open files in the previous window
let g:netrw_altv = 1                  " Open vertical splits to the right
let g:netrw_winsize = 25              " File browser takes up 25% of the screen width

" Shortcut to toggle file browser (Press <Leader>e, which is ,e)
nnoremap <leader>e :Vex<CR>           

" 6. Competitive Programming Compilation & Execution Shortcuts
" Note: These only apply to .cpp files. 
" % is the current filename, %< is the filename without the extension.

" <F5>: Save, compile with C++17 & O2 optimization, and run normally
autocmd FileType cpp nnoremap <F5> :w<CR>:!g++ -std=c++17 -O2 -Wall % -o %< && time ./%<<CR>

" <F6>: Save, compile, and run with input.txt / output.txt redirection
autocmd FileType cpp nnoremap <F6> :w<CR>:!g++ -std=c++17 -O2 -Wall % -o %< && time ./%< < input.txt > output.txt<CR>

" <F7>: Clear the terminal screen (useful before running to keep output clean)
autocmd FileType cpp nnoremap <F7> :!clear<CR>

" 7. Optional: System Clipboard Support (Uncomment if using vim-gtk3 or vim-x11)
" nnoremap <leader>y "+y          " Copy to system clipboard
" nnoremap <leader>p "+p          " Paste from system clipboard

" ==============================================================================
" END OF CONFIGURATION
" ==============================================================================
```
