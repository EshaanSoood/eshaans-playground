
## 1. PRD – “Eshaan’s Playground” Blog

### 1. Overview

**Project name:**
Eshaan’s Playground

**Base URL:**
`blog.eshaansood.in` (note: main site is `www.eshaansood.in` – keep consistent spelling when wiring DNS)

**Primary purpose:**
A blog to showcase non-music dev projects and the process behind them — written as narrative “chapters” of your journey from asking a friend to build your site to shipping your own Next.js projects in ~9 months.

**Success criteria:**

* Looks legit to developers and hiring managers.
* Codebase is *extremely* clean:

  * No random global CSS
  * No unnecessary overrides
  * Minimal duplication
* Site is fast and accessible.
* Both devs and non-devs can land here and feel the work is thoughtful and high-quality.
* Supports your goal of getting hired as an accessibility consultant.

**Target audience:**

* Developers (front-end / full-stack / web).
* Hiring managers / tech leads.
* People interested in accessibility and thoughtful UX.

**Tone & personality:**

* Conversational and human.
* Willing to go deep on technical details when relevant.
* Narrative storytelling, but with solid technical substance.

---

### 2. Information Architecture & Routing

**Base domain:**
`blog.eshaansood.in`

**Routing model:**

* **Home:** `/`

  * Short intro about you.
  * List of latest posts (card layout).
* **Timeline:** `/timeline`

  * Chronological “post library”.
  * Each entry shows:

    * Title
    * Date
    * Short headline/summary
    * Project color accent.
* **Post pages:** `/<slug>`

  * Flat URL structure: `blog.eshaansood.in/my-first-post`.
* **Projects index:** `/projects`

  * Time-line style, but filtered to select posts grouped by project.
  * Each project is like a “series” of chapters.
* **Per-project pages (v1.x if time allows):** `/projects/[projectId]`

  * Shows posts belonging to that project, in order.

**Header navigation:**

* Text logo: “Eshaan’s Playground”.
* Links (for now):

  * “Timeline” → `/timeline`
  * “Projects” → `/projects`
  * “Main site” → `https://www.eshaansood.in`
  * “Contact” → `https://www.eshaansood.in#contact` (or whatever your main contact section is)

**Footer:**

* Super minimal:

  * Social links: GitHub, LinkedIn, Instagram.
  * Maybe a small “© Eshaan Sood” line.
  * Optional: link back to main site.

---

### 3. Content Model

**Format:**

* All posts are **MDX** files stored under `/posts`.
* MDX so you can:

  * Use headings, text, images, code blocks.
  * Optionally embed React components later if needed.

**Post frontmatter (YAML):**

Required/expected fields:

* `title: string`
* `date: string` (ISO: `YYYY-MM-DD`)
* `summary: string` (short 1–2 sentence description)
* `tags: string[]` (optional for now, but supported)
* `slug: string` (optional; can be derived from filename if omitted)
* `coverImage?: string` (URL or local path)
* `projectId?: string` (e.g. `"playground"`, `"portfolio-site"`, used for color-coding & grouping)
* `projectRepoUrl?: string`
* `liveDemoUrl?: string`

**Post body:**

* Narrative content (chapters of your journey).
* Headings, paragraphs, inline code, code blocks, images.
* At the top of the rendered post (not necessarily in the MDX itself), show:

  * Title
  * Meta (date, read time, tags)
* Near the bottom:

  * Author mini-bio
  * Repo link and live demo link (if present)
  * Share buttons.

**Types of posts:**

* **Chapter posts** – narrative progression of your learning journey.
* **Project-focused posts** – describing specific project builds, decisions, accessibility thinking, etc.

**Project grouping:**

* Projects are defined implicitly via `projectId` in frontmatter.
* `/projects`:

  * Lists distinct projects (unique `projectId` values).
  * For each project, show:

    * Project label (name derived from config mapping, e.g. `projectId → displayName`).
    * Small description (from a config file).
    * A subset of posts (chapters) belonging to that project.

---

### 4. UX & Layout Requirements

#### 4.1 Global Layout

* Clean, centered layout with comfortable whitespace.
* Content column **medium width** (good readability).
* Header can be sticky or static; no special behavior required in v1.
* Layout should not feel heavy or over-designed.

#### 4.2 Home (`/`)

* Section 1: Short intro about you

  * A few lines explaining who you are and what this blog is.
* Section 2: Latest posts list

  * Card layout:

    * Title
    * Date
    * Summary
    * Project color accent (border/left stripe/badge).
  * Sorted **Newest → Oldest**.
* Optional small links to:

  * Timeline
  * Projects
  * Main site

#### 4.3 Timeline (`/timeline`)

* Full-screen accessible list of posts arranged in **chronological order** (oldest → newest or vice versa; choose whichever feels more natural, but keep consistent).
* Each row/card:

  * Date
  * Title
  * One-line “headline” or summary.
  * Project accent color.
* Clicking an entry opens that post’s page.

#### 4.4 Projects (`/projects`)

* Group posts by `projectId`.
* For each project:

  * Project name + short description (from config).
  * Project color.
  * Ordered list of posts (chapters) with date and title.
* This page is essentially a curated, project-filtered timeline.

#### 4.5 Single Post Page (`/<slug>`)

* **Reading experience:**

  * Medium-width content column.
  * No table of contents for v1.
  * Show **reading time estimate**.
* **Meta at top:**

  * Title
  * Date
  * Tags
  * Read time
  * Project badge with color (if `projectId`).
* **Body:**

  * MDX-rendered text, headings, lists, code blocks, images.
* **Post footer:**

  * Short author bio (1–2 sentences, with your name + role).
  * Links to repo and live demo if available.
  * Share buttons:

    * Facebook share link
    * LinkedIn share link
    * “Copy link” button (copies current URL to clipboard).
  * Optional “Back to timeline” link.

---

### 5. Visual Design

**Overall vibe:**

* Minimalist.
* Mostly **black and white**.
* A few **colored accents** (per project).
* “Techie” vibe — clean, no fluff.

**Color scheme:**

* Light + dark mode with toggle.
* Palette:

  * Neutral base: grayscale for background, border, text.
  * Accent(s): project colors (e.g. 3–6 colors defined in Tailwind theme).
  * Exact colors can be simple Tailwind defaults initially (`blue`, `emerald`, `violet`, etc.).

**Typography:**

* Primary font: **Inter** (via `next/font`).
* Body text: sans serif.
* Headings: same family, maybe heavier weights.
* Code: monospace (using a system font stack or Prism theme).

**Code blocks:**

* Syntax highlighting theme: **GitHub-like**.
* Blocks should be:

  * Scrollable horizontally if needed.
  * Clearly distinct from body text.

---

### 6. Features & Integrations

**Search:**

* No search in v1.

**Tags / categories:**

* Posts can have tags in frontmatter.
* No dedicated `/tags` page needed for v1.

**Analytics:**

* None in v1.

**Comments:**

* None in v1.

**Newsletter / email capture:**

* None in v1.

**Social / linkouts:**

* Footer (and optionally header icons) for:

  * GitHub
  * LinkedIn
  * Instagram

---

### 7. Technical Requirements

**Stack:**

* **Next.js** (App Router preferred).
* **Nextra** blog theme on top of Next.js.
* **Tailwind CSS** for all styling.
* **MDX** for content.
* Deployed on **Vercel**.

**Routing & data:**

* Static generation only:

  * Build-time generation of:

    * Home
    * Timeline
    * Projects
    * Posts
* No server-side rendering.
* No environment variables required for v1.

**Content source:**

* Local `/posts` directory in the repo.
* Posts are added/updated via git commits.

**Styling constraints (non-negotiable):**

* Tailwind should be the primary styling mechanism.
* No “trash” CSS:

  * Avoid big monolithic global CSS.
  * If a tiny bit of custom CSS is absolutely required, keep it:

    * Very small
    * Well-organized
    * Documented.
* No random overrides that fight Tailwind.
* No unnecessary component duplication.

---

### 8. Interop with Main Site

**Main site:** `https://www.eshaansood.in`

From blog → main site:

* Header “Home” / “Main site” link to main website.
* Header or footer “Contact” link to main site contact section.
* Styling will be kept simple now; more detailed visual cohesion can be done later (share palette, logo, etc.).

---

### 9. Scope

**Must-have for v1:**

* Clean Next.js + Nextra + Tailwind codebase.
* `/`, `/timeline`, `/projects`, and `/<slug>` working.
* MDX-based posts in `/posts`.
* Card-style list of posts on home.
* Timeline page.
* Project grouping via `projectId`.
* Color-coded project accents.
* Light/dark mode toggle.
* Meta info on post pages:

  * Date, tags, read time.
* Post footer with author bio and repo/demo links.
* Share buttons (Facebook, LinkedIn, copy link).
* Deployment on Vercel.

**Nice-to-have for later versions (v1.x+):**

* Tag listing page.
* Search.
* Per-project detail pages (`/projects/[projectId]`).
* Analytics.
* Comments.
* Newsletter.

---