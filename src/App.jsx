import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock3,
  Code2,
  Command,
  Copy,
  Download,
  FileDown,
  FileText,
  FileUp,
  Flag,
  Hash,
  Heading1,
  Heading2,
  Home,
  LayoutGrid,
  ListChecks,
  Maximize2,
  MessageSquareText,
  Minimize2,
  MoreHorizontal,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Plus,
  Quote,
  Rows3,
  Search,
  SlidersHorizontal,
  Star,
  Sun,
  Table2,
  Tags,
  Trash2,
  Type,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'nova-workspace-pages-v1';
const LEGACY_STORAGE_KEYS = ['codex-notion-inspired-workspace-v1'];
const THEME_STORAGE_KEY = 'nova-workspace-theme';
const LEGACY_THEME_STORAGE_KEYS = ['codex-nova-workspace-theme'];

const themes = [
  { id: 'light', label: 'Light', icon: Sun, swatches: ['#f7f8f6', '#2f6f68', '#f1e5c8'] },
  { id: 'dark', label: 'Dark', icon: Moon, swatches: ['#121514', '#7fc8ba', '#f0ca7a'] },
  { id: 'forest', label: 'Forest', icon: Palette, swatches: ['#eef5ed', '#32775f', '#b76e45'] },
  { id: 'rose', label: 'Rose', icon: Palette, swatches: ['#fff7f7', '#9a4f64', '#3e6c83'] },
  { id: 'midnight', label: 'Midnight', icon: Moon, swatches: ['#111827', '#7aa2f7', '#d6a95f'] },
  { id: 'ocean', label: 'Ocean', icon: Palette, swatches: ['#f4fbfa', '#217d8d', '#d8845d'] },
  { id: 'iris', label: 'Iris', icon: Palette, swatches: ['#faf8ff', '#7159b8', '#57a99a'] },
  { id: 'sunrise', label: 'Sunrise', icon: Sun, swatches: ['#fff8f4', '#b65f48', '#3f7f8c'] },
  { id: 'mint', label: 'Mint', icon: Palette, swatches: ['#f3fbf7', '#278568', '#c07a94'] },
  { id: 'graphite', label: 'Graphite', icon: Moon, swatches: ['#141414', '#d2a85d', '#6fc3b2'] },
  { id: 'neon', label: 'Neon', icon: Moon, swatches: ['#0f1217', '#67e8f9', '#f472b6'] },
  { id: 'mono', label: 'Mono', icon: Palette, swatches: ['#f6f6f3', '#30302e', '#9f8f73'] },
  { id: 'cloud', label: 'Cloud', icon: Sun, swatches: ['#f8fafc', '#2563eb', '#10b981'] },
  { id: 'meadow', label: 'Meadow', icon: Palette, swatches: ['#f7fbf3', '#3f7d57', '#7c3aed'] },
  { id: 'candy', label: 'Candy', icon: Palette, swatches: ['#fff7fc', '#db2777', '#0891b2'] },
  { id: 'cobalt', label: 'Cobalt', icon: Moon, swatches: ['#101623', '#38bdf8', '#f472b6'] },
  { id: 'aurora', label: 'Aurora', icon: Moon, swatches: ['#0d1614', '#22c55e', '#a78bfa'] },
  { id: 'citrine', label: 'Citrine', icon: Sun, swatches: ['#fbfbf1', '#4f8a6b', '#c9971a'] },
  { id: 'blueprint', label: 'Blueprint', icon: Moon, background: true, swatches: ['#0d1628', '#60a5fa', '#fbbf24'] },
  { id: 'notebook', label: 'Notebook', icon: Sun, background: true, swatches: ['#fbfcf8', '#4f46e5', '#e36b83'] },
  { id: 'studio', label: 'Studio', icon: Palette, background: true, swatches: ['#171a1f', '#a3e635', '#38bdf8'] },
  { id: 'canvas', label: 'Canvas', icon: Sun, background: true, swatches: ['#f9faf4', '#2f7a67', '#d95d68'] },
  { id: 'terminal', label: 'Terminal', icon: Moon, background: true, swatches: ['#08110d', '#4ade80', '#f8d66d'] },
  { id: 'prism', label: 'Prism', icon: Palette, background: true, swatches: ['#f8fbff', '#0ea5e9', '#e879f9'] },
];

const commandGroups = [
  {
    label: 'Basic blocks',
    items: [
      { type: 'paragraph', label: 'Text', hint: 'Start writing with plain text', icon: Type },
      { type: 'heading1', label: 'Heading 1', hint: 'Big section heading', icon: Heading1 },
      { type: 'heading2', label: 'Heading 2', hint: 'Smaller section heading', icon: Heading2 },
      { type: 'todo', label: 'To-do', hint: 'Track a task with a checkbox', icon: CheckSquare },
    ],
  },
  {
    label: 'Rich blocks',
    items: [
      { type: 'quote', label: 'Quote', hint: 'Capture an important note', icon: Quote },
      { type: 'callout', label: 'Callout', hint: 'Highlight context or a warning', icon: MessageSquareText },
      { type: 'toggle', label: 'Toggle', hint: 'Collapse detail under a title', icon: ChevronRight },
      { type: 'date', label: 'Date', hint: 'Add a dated note marker', icon: CalendarDays },
      { type: 'code', label: 'Code', hint: 'Keep a command or snippet readable', icon: Code2 },
      { type: 'table', label: 'Table', hint: 'Make a lightweight database', icon: Table2 },
      { type: 'divider', label: 'Divider', hint: 'Separate ideas visually', icon: Rows3 },
    ],
  },
];

const allCommands = commandGroups.flatMap((group) => group.items);
const priorityOptions = ['Low', 'Normal', 'High', 'Urgent'];
const assistantModes = [
  { id: 'coach', label: 'Coach', icon: Star },
  { id: 'writer', label: 'Writer', icon: Quote },
  { id: 'pm', label: 'PM', icon: Flag },
  { id: 'study', label: 'Study', icon: BookOpen },
];
const assistantPowerTools = [
  { id: 'mission', label: 'Mission control', hint: 'Best move, pressure, and workspace pulse', icon: Maximize2 },
  { id: 'launch', label: 'Launch plan', hint: 'Milestones and acceptance checks', icon: Flag },
  { id: 'writerpack', label: 'Writer pack', hint: 'TLDR, hook, headline, and close', icon: Quote },
  { id: 'cleanup', label: 'Cleanup pass', hint: 'Tidy stale tasks and weak structure', icon: CheckSquare },
];

function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowStamp() {
  return new Date().toISOString();
}

function todayDateValue() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function normalizeDateInputValue(value, fallback = '') {
  if (typeof value !== 'string' || !value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

function getNoteDate(page) {
  return normalizeDateInputValue(page.noteDate, normalizeDateInputValue(page.createdAt, todayDateValue()));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDueDate(value) {
  if (!value) return '';
  const normalized = normalizeDateInputValue(value, value);
  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatFullDate(value) {
  const normalized = normalizeDateInputValue(value, todayDateValue());
  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return normalized;
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function readStoredJson(primaryKey, legacyKeys = []) {
  for (const key of [primaryKey, ...legacyKeys]) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;
      const parsed = JSON.parse(value);
      if (key !== primaryKey) {
        localStorage.setItem(primaryKey, value);
      }
      return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

function readStoredValue(primaryKey, legacyKeys = []) {
  for (const key of [primaryKey, ...legacyKeys]) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;
      if (key !== primaryKey) {
        localStorage.setItem(primaryKey, value);
      }
      return value;
    } catch {
      continue;
    }
  }
  return null;
}

function createParagraph(text = '') {
  return { id: createId('block'), type: 'paragraph', text };
}

function createBlock(type = 'paragraph', text = '') {
  if (type === 'table') {
    return {
      id: createId('block'),
      type,
      columns: ['Task', 'Status', 'Owner'],
      rows: [
        ['Draft outline', 'In progress', 'You'],
        ['Review notes', 'Next', 'Team'],
        ['Publish', 'Later', ''],
      ],
    };
  }

  if (type === 'divider') {
    return { id: createId('block'), type };
  }

  if (type === 'todo') {
    return { id: createId('block'), type, text, checked: false };
  }

  if (type === 'date') {
    return { id: createId('block'), type, date: todayDateValue(), text };
  }

  if (type === 'toggle') {
    return { id: createId('block'), type, text: text || 'Toggle heading', body: '', open: true };
  }

  return { id: createId('block'), type, text };
}

function cloneBlock(block) {
  if (block.type === 'table') {
    return {
      ...block,
      id: createId('block'),
      columns: [...block.columns],
      rows: block.rows.map((row) => [...row]),
    };
  }

  return { ...block, id: createId('block') };
}

function createPage({
  title,
  icon,
  section = 'Private',
  status = 'Draft',
  tags = [],
  blocks,
  favorite = false,
  priority = 'Normal',
  noteDate = todayDateValue(),
  dueDate = '',
}) {
  return {
    id: createId('page'),
    title,
    icon,
    section,
    status,
    tags,
    favorite,
    priority,
    noteDate,
    dueDate,
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
    blocks: blocks?.length ? blocks : [createParagraph('')],
  };
}

function starterPages() {
  return [
    createPage({
      title: 'Product roadmap',
      icon: '🚀',
      section: 'Teamspace',
      status: 'In progress',
      tags: ['launch', 'planning'],
      favorite: true,
      priority: 'High',
      blocks: [
        createBlock('heading1', 'Q2 priorities'),
        createBlock(
          'paragraph',
          'Shape the next release around fewer, better workflows: faster capture, cleaner review, and a workspace that feels calm under pressure.',
        ),
        createBlock('todo', 'Finalize launch scope'),
        { ...createBlock('todo', 'Share design review notes'), checked: true },
        createBlock('callout', 'Tip: type / on any empty line to turn it into a heading, task, table, callout, quote, or divider.'),
        createBlock('table'),
      ],
    }),
    createPage({
      title: 'Meeting notes',
      icon: '📝',
      section: 'Private',
      status: 'Review',
      tags: ['sync'],
      priority: 'Normal',
      blocks: [
        createBlock('heading1', 'Weekly sync'),
        createBlock('paragraph', 'Date: Friday. Attendees: Design, Engineering, Product.'),
        createBlock('heading2', 'Decisions'),
        createBlock('todo', 'Confirm beta customer list'),
        createBlock('quote', 'Keep the page useful while the conversation is still happening.'),
      ],
    }),
    createPage({
      title: 'Personal dashboard',
      icon: '🏠',
      section: 'Private',
      status: 'Active',
      tags: ['today', 'personal'],
      favorite: true,
      priority: 'Low',
      blocks: [
        createBlock('heading1', 'Today'),
        createBlock('todo', 'Triage inbox'),
        createBlock('todo', 'Draft project memo'),
        createBlock('todo', 'Plan tomorrow'),
        createBlock('divider'),
        createBlock('paragraph', 'A quiet place for quick notes, links, and loose ends.'),
      ],
    }),
  ];
}

function makeTemplate(kind) {
  if (kind === 'project') {
    return createPage({
      title: 'Untitled project',
      icon: '📌',
      section: 'Teamspace',
      status: 'In progress',
      tags: ['project'],
      priority: 'High',
      blocks: [
        createBlock('heading1', 'Overview'),
        createBlock('paragraph', 'What are we building, why now, and what does success look like?'),
        createBlock('heading2', 'Tasks'),
        createBlock('todo', 'Define milestones'),
        createBlock('todo', 'Assign owners'),
        createBlock('table'),
      ],
    });
  }

  if (kind === 'daily') {
    const dateValue = todayDateValue();
    return createPage({
      title: `Daily note - ${formatDueDate(dateValue)}`,
      icon: '📅',
      section: 'Journal',
      status: 'Active',
      tags: ['daily', 'today'],
      priority: 'Normal',
      noteDate: dateValue,
      blocks: [
        createBlock('heading1', formatFullDate(dateValue)),
        createBlock('date', 'Wins, notes, and useful context.'),
        createBlock('heading2', 'Plan'),
        createBlock('todo', 'Choose the most important task'),
        createBlock('todo', 'Capture follow-ups before the end of the day'),
        createBlock('heading2', 'Notes'),
        createBlock('paragraph', ''),
      ],
    });
  }

  if (kind === 'notes') {
    return createPage({
      title: 'Untitled notes',
      status: 'Draft',
      tags: ['notes'],
      priority: 'Normal',
      icon: '📝',
      blocks: [
        createBlock('heading1', 'Notes'),
        createBlock('date', 'What happened today?'),
        createBlock('paragraph', ''),
        createBlock('heading2', 'Action items'),
        createBlock('todo', ''),
      ],
    });
  }

  return createPage({
    title: 'Untitled',
    status: 'Draft',
    tags: [],
    icon: '📄',
    blocks: [createParagraph('')],
  });
}

export default function App() {
  const [pages, setPages] = useState(() => {
    const storedPages = readStoredJson(STORAGE_KEY, LEGACY_STORAGE_KEYS);
    return storedPages ? normalizeImportedPages(storedPages) : starterPages();
  });
  const [currentPageId, setCurrentPageId] = useState(() => pages[0]?.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [slashState, setSlashState] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneApp());
  const [theme, setTheme] = useState(() => readStoredValue(THEME_STORAGE_KEY, LEGACY_THEME_STORAGE_KEYS) || 'light');
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [toast, setToast] = useState('');
  const [introVisible, setIntroVisible] = useState(true);
  const [focusSprint, setFocusSprint] = useState({ running: false, seconds: 25 * 60 });
  const startupActionHandled = useRef(false);

  const currentPage = pages.find((page) => page.id === currentPageId) ?? pages[0];
  const currentInsights = useMemo(() => currentPage ? getAssistantInsights(currentPage, pages) : null, [currentPage, pages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    const resolvedTheme = themes.some((item) => item.id === theme) ? theme : 'light';
    document.documentElement.dataset.theme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColorFor(resolvedTheme));
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
  }, [theme]);

  useEffect(() => {
    if (!pages.some((page) => page.id === currentPageId)) {
      setCurrentPageId(pages[0]?.id);
    }
  }, [currentPageId, pages]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (startupActionHandled.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('action') !== 'new-page') return;

    startupActionHandled.current = true;
    addPage('blank');
    window.history.replaceState({}, '', '/');
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIntroVisible(false), 2300);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!focusSprint.running) return undefined;
    if (focusSprint.seconds <= 0) {
      setFocusSprint({ running: false, seconds: 25 * 60 });
      setToast('Focus sprint complete');
      return undefined;
    }

    const interval = window.setInterval(() => {
      setFocusSprint((current) => (
        current.running && current.seconds > 0
          ? { ...current, seconds: current.seconds - 1 }
          : current
      ));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [focusSprint.running, focusSprint.seconds]);

  const availableStatuses = useMemo(() => {
    return ['All', ...new Set(pages.map((page) => page.status || 'Draft'))];
  }, [pages]);

  const availableTags = useMemo(() => {
    return ['All', ...new Set(pages.flatMap((page) => page.tags ?? []))];
  }, [pages]);

  const availablePriorities = useMemo(() => {
    return ['All', ...new Set([...priorityOptions, ...pages.map((page) => page.priority || 'Normal')])];
  }, [pages]);

  const filteredPages = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pages.filter((page) => {
      const matchesStatus = statusFilter === 'All' || (page.status || 'Draft') === statusFilter;
      const matchesTag = tagFilter === 'All' || (page.tags ?? []).includes(tagFilter);
      const matchesPriority = priorityFilter === 'All' || (page.priority || 'Normal') === priorityFilter;
      if (!matchesStatus || !matchesTag || !matchesPriority) return false;
      if (!term) return true;

      const inTitle = page.title.toLowerCase().includes(term);
      const inBlocks = page.blocks.some((block) =>
        [block.text, block.date].filter(Boolean).some((value) => value.toLowerCase().includes(term)),
      );
      const inMeta = [page.section, page.status, page.priority, page.noteDate, page.dueDate, ...(page.tags ?? [])]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
      return inTitle || inBlocks || inMeta;
    });
  }, [pages, search, statusFilter, tagFilter, priorityFilter]);

  const favoritePages = filteredPages.filter((page) => page.favorite);
  const groupedPages = groupPages(filteredPages);
  const recentPages = useMemo(() => getRecentPages(pages, currentPage?.id), [currentPage?.id, pages]);
  const taskQueue = useMemo(() => getTaskQueue(pages), [pages]);
  const workspaceStats = useMemo(() => getWorkspaceStats(pages), [pages]);

  function commitPages(updater) {
    setPages((existing) => {
      const nextPages = typeof updater === 'function' ? updater(existing) : updater;
      return nextPages;
    });
  }

  function updateCurrentPage(patch) {
    commitPages((existing) =>
      existing.map((page) =>
        page.id === currentPage.id ? { ...page, ...patch, updatedAt: nowStamp() } : page,
      ),
    );
  }

  function updateBlock(blockId, patch) {
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        return {
          ...page,
          updatedAt: nowStamp(),
          blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
        };
      }),
    );
  }

  function replaceBlock(blockId, nextBlock) {
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        return {
          ...page,
          updatedAt: nowStamp(),
          blocks: page.blocks.map((block) => (block.id === blockId ? nextBlock : block)),
        };
      }),
    );
  }

  function insertBlock(afterId, type = 'paragraph', text = '') {
    const nextBlock = createBlock(type, text);
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        const index = page.blocks.findIndex((block) => block.id === afterId);
        const nextBlocks = [...page.blocks];
        nextBlocks.splice(index + 1, 0, nextBlock);
        return { ...page, updatedAt: nowStamp(), blocks: nextBlocks };
      }),
    );
    setTimeout(() => focusBlock(nextBlock.id), 30);
    return nextBlock;
  }

  function duplicateBlock(blockId) {
    const sourceBlock = currentPage.blocks.find((block) => block.id === blockId);
    if (!sourceBlock) return;

    const nextBlock = cloneBlock(sourceBlock);
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        const index = page.blocks.findIndex((block) => block.id === blockId);
        const nextBlocks = [...page.blocks];
        nextBlocks.splice(index + 1, 0, nextBlock);
        return { ...page, updatedAt: nowStamp(), blocks: nextBlocks };
      }),
    );
    setActiveBlockId(nextBlock.id);
    setTimeout(() => focusBlock(nextBlock.id), 30);
  }

  function moveBlock(blockId, direction) {
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        const index = page.blocks.findIndex((block) => block.id === blockId);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= page.blocks.length) return page;

        const nextBlocks = [...page.blocks];
        const [block] = nextBlocks.splice(index, 1);
        nextBlocks.splice(nextIndex, 0, block);
        return { ...page, updatedAt: nowStamp(), blocks: nextBlocks };
      }),
    );
    setActiveBlockId(blockId);
    setTimeout(() => focusBlock(blockId), 30);
  }

  function quickCapture(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const nextBlock = createParagraph(cleanText);
    commitPages((existing) =>
      existing.map((page) =>
        page.id === currentPage.id
          ? { ...page, updatedAt: nowStamp(), blocks: [...page.blocks, nextBlock] }
          : page,
      ),
    );
    setToast('Captured to current page');
    setTimeout(() => focusBlock(nextBlock.id), 30);
  }

  function quickTask(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const nextBlock = createBlock('todo', cleanText);
    commitPages((existing) =>
      existing.map((page) =>
        page.id === currentPage.id
          ? { ...page, updatedAt: nowStamp(), blocks: [...page.blocks, nextBlock] }
          : page,
      ),
    );
    setToast('Task added to current page');
    setTimeout(() => focusBlock(nextBlock.id), 30);
  }

  function toggleWorkspaceTask(pageId, blockId, checked = true) {
    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== pageId) return page;

        return {
          ...page,
          updatedAt: nowStamp(),
          blocks: page.blocks.map((block) =>
            block.id === blockId && block.type === 'todo' ? { ...block, checked } : block,
          ),
        };
      }),
    );
    setToast(checked ? 'Task completed' : 'Task reopened');
  }

  function appendBlocksToCurrentPage(blocks, message) {
    if (!blocks.length) return;
    commitPages((existing) =>
      existing.map((page) =>
        page.id === currentPage.id
          ? { ...page, updatedAt: nowStamp(), blocks: [...page.blocks, ...blocks] }
          : page,
      ),
    );
    setToast(message);
    setTimeout(() => focusBlock(blocks[0].id), 30);
  }

  function createCustomTable(columns, rows) {
    return { ...createBlock('table'), columns, rows };
  }

  function runAssistantAction(action, payload = '') {
    const insights = getAssistantInsights(currentPage, pages);

    if (action === 'answer' && payload) {
      appendBlocksToCurrentPage(
        [createBlock('callout', `Nova AI answer: ${payload}`)],
        'Assistant answer inserted',
      );
      return;
    }

    if (action === 'summary') {
      appendBlocksToCurrentPage(
        [createBlock('callout', `Nova AI summary: ${insights.summary}`)],
        'Assistant summary inserted',
      );
      return;
    }

    if (action === 'brief') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI smart brief'),
          createBlock('callout', insights.summary),
          createBlock('paragraph', `Signal: ${insights.signal}`),
          createBlock('paragraph', `Best next move: ${insights.bestMove}`),
          createBlock('quote', insights.decisionPrompt),
        ],
        'Assistant smart brief inserted',
      );
      return;
    }

    if (action === 'status') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI status report'),
          createBlock('callout', insights.statusReport.snapshot),
          createBlock('paragraph', `Progress: ${insights.statusReport.progress}`),
          createBlock('paragraph', `Risk: ${insights.statusReport.risk}`),
          createBlock('todo', insights.statusReport.next),
        ],
        'Assistant status report inserted',
      );
      return;
    }

    if (action === 'points') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI key points'),
          ...insights.keyPoints.map((item) => createBlock('paragraph', `Key point: ${item}`)),
        ],
        'Assistant key points inserted',
      );
      return;
    }

    if (action === 'polish') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI polished draft'),
          ...insights.polishedDraft.map((item) => createBlock('paragraph', item)),
        ],
        'Assistant polished draft inserted',
      );
      return;
    }

    if (action === 'decision') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI decision log'),
          createBlock('callout', insights.decisionLog.summary),
          createBlock('paragraph', `Decision: ${insights.decisionLog.decision}`),
          createBlock('paragraph', `Why: ${insights.decisionLog.why}`),
          createBlock('todo', insights.decisionLog.followUp),
        ],
        'Assistant decision log inserted',
      );
      return;
    }

    if (action === 'agenda') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI meeting agenda'),
          ...insights.agendaItems.map((item) => createBlock('todo', item)),
        ],
        'Assistant meeting agenda inserted',
      );
      return;
    }

    if (action === 'timeline') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI timeline'),
          ...insights.timelineItems.flatMap((item) => [
            { ...createBlock('date', item.label), date: item.date },
            createBlock('todo', item.action),
          ]),
        ],
        'Assistant timeline inserted',
      );
      return;
    }

    if (action === 'study') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI study cards'),
          createCustomTable(
            ['Question', 'Answer'],
            insights.studyCards.map((card) => [card.question, card.answer]),
          ),
        ],
        'Assistant study cards inserted',
      );
      return;
    }

    if (action === 'risks') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI risk register'),
          createCustomTable(
            ['Risk', 'Signal', 'Mitigation'],
            insights.riskRegister.map((item) => [item.risk, item.signal, item.mitigation]),
          ),
        ],
        'Assistant risk register inserted',
      );
      return;
    }

    if (action === 'priority') {
      const matrix = insights.priorityMatrix;
      const maxRows = Math.max(matrix.now.length, matrix.next.length, matrix.later.length);
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI priority matrix'),
          createCustomTable(
            ['Now', 'Next', 'Later'],
            Array.from({ length: maxRows }, (_, index) => [
              matrix.now[index] || '',
              matrix.next[index] || '',
              matrix.later[index] || '',
            ]),
          ),
        ],
        'Assistant priority matrix inserted',
      );
      return;
    }

    if (action === 'focus') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI 30-minute focus plan'),
          createCustomTable(
            ['Timebox', 'Move', 'Done when'],
            insights.focusPlan.map((item) => [item.time, item.action, item.outcome]),
          ),
        ],
        'Assistant focus plan inserted',
      );
      return;
    }

    if (action === 'handoff') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI handoff note'),
          createBlock('callout', insights.summary),
          createBlock('paragraph', `Context: ${insights.handoffNote.context}`),
          createBlock('paragraph', `Decision: ${insights.handoffNote.decision}`),
          createBlock('paragraph', `Risk: ${insights.handoffNote.risk}`),
          createBlock('todo', insights.handoffNote.next),
          ...insights.handoffNote.questions.map((item) => createBlock('todo', item)),
        ],
        'Assistant handoff note inserted',
      );
      return;
    }

    if (action === 'quality') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI quality check'),
          ...insights.qualityChecks.map((item) => createBlock('todo', item)),
        ],
        'Assistant quality check inserted',
      );
      return;
    }

    if (action === 'workspace') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI workspace brief'),
          createBlock('callout', insights.workspaceBrief.summary),
          ...insights.workspaceBrief.lines.map((item) => createBlock('paragraph', item)),
          createCustomTable(
            ['Page', 'Why it matters'],
            insights.workspaceBrief.topPages.map((item) => [`${item.icon || '-'} ${item.title}`, item.reason]),
          ),
        ],
        'Assistant workspace brief inserted',
      );
      return;
    }

    if (action === 'mission') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI mission control'),
          createBlock('callout', insights.statusReport.snapshot),
          createCustomTable(
            ['Signal', 'Readout', 'Move'],
            [
              ['Page score', `${insights.score}/100`, insights.bestMove],
              ['Workspace pulse', insights.workspaceBrief.summary, insights.workspaceBrief.topPages[0]?.reason || 'No active pressure detected'],
              ['Risk', insights.statusReport.risk, insights.riskRegister[0]?.mitigation || insights.bestMove],
              ['Focus', insights.focus, insights.focusPlan[1]?.action || insights.bestMove],
            ],
          ),
          createBlock('todo', insights.bestMove),
        ],
        'Assistant mission control inserted',
      );
      return;
    }

    if (action === 'launch') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI launch plan'),
          createCustomTable(
            ['Phase', 'Move', 'Done when'],
            insights.launchPlan.map((item) => [item.phase, item.move, item.done]),
          ),
          createBlock('heading2', 'Acceptance checks'),
          ...insights.qualityChecks.slice(0, 4).map((item) => createBlock('todo', item)),
        ],
        'Assistant launch plan inserted',
      );
      return;
    }

    if (action === 'writerpack') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI writer pack'),
          createBlock('callout', `TLDR: ${insights.writingPack.tldr}`),
          createBlock('paragraph', `Headline: ${insights.writingPack.headline}`),
          createBlock('paragraph', `Hook: ${insights.writingPack.hook}`),
          ...insights.writingPack.bullets.map((item) => createBlock('paragraph', `Point: ${item}`)),
          createBlock('quote', insights.writingPack.close),
        ],
        'Assistant writer pack inserted',
      );
      return;
    }

    if (action === 'cleanup') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI cleanup pass'),
          createBlock('callout', insights.cleanupPlan.summary),
          ...insights.cleanupPlan.items.map((item) => createBlock('todo', item)),
        ],
        'Assistant cleanup pass inserted',
      );
      return;
    }

    if (action === 'okr') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI OKR plan'),
          createBlock('callout', `Objective: ${insights.okrPlan.objective}`),
          createCustomTable(
            ['Key result', 'Measure'],
            insights.okrPlan.keyResults,
          ),
          ...insights.okrPlan.initiatives.map((item) => createBlock('todo', item)),
        ],
        'Assistant OKR plan inserted',
      );
      return;
    }

    if (action === 'knowledge') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI knowledge base card'),
          createCustomTable(
            ['Question', 'Answer'],
            insights.knowledgeCard.map((item) => [item.question, item.answer]),
          ),
        ],
        'Assistant knowledge card inserted',
      );
      return;
    }

    if (action === 'automate') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI automation ideas'),
          createCustomTable(
            ['Trigger', 'Action', 'Why'],
            insights.automationIdeas.map((item) => [item.trigger, item.action, item.reason]),
          ),
        ],
        'Assistant automation ideas inserted',
      );
      return;
    }

    if (action === 'related') {
      if (!insights.relatedPages.length) {
        setToast('No related pages found');
        return;
      }

      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI related pages'),
          ...insights.relatedPages.map((item) => createBlock('paragraph', `${item.icon || '-'} ${item.title} / ${item.reason}`)),
        ],
        'Assistant related pages inserted',
      );
      return;
    }

    if (action === 'plan') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI action plan'),
          ...insights.nextActions.map((item) => createBlock('todo', item)),
        ],
        'Assistant action plan inserted',
      );
      return;
    }

    if (action === 'outline') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'Context'),
          createBlock('paragraph', insights.contextStarter),
          createBlock('heading2', 'Decisions'),
          createBlock('paragraph', insights.decisionPrompt),
          createBlock('heading2', 'Next steps'),
          ...insights.nextActions.slice(0, 3).map((item) => createBlock('todo', item)),
        ],
        'Assistant outline inserted',
      );
      return;
    }

    if (action === 'questions') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI follow-up questions'),
          ...insights.questions.map((item) => createBlock('todo', item)),
        ],
        'Assistant questions inserted',
      );
      return;
    }

    if (action === 'sweep') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI task sweep'),
          createBlock('callout', insights.taskSweep),
          ...insights.taskSweepItems.map((item) => createBlock('todo', item)),
        ],
        'Assistant task sweep inserted',
      );
      return;
    }

    if (action === 'review') {
      appendBlocksToCurrentPage(
        [
          createBlock('heading2', 'AI review'),
          createBlock('callout', insights.review),
          createBlock('paragraph', `Focus: ${insights.focus}`),
        ],
        'Assistant review inserted',
      );
      return;
    }

    if (action === 'title') {
      updateCurrentPage({ title: insights.suggestedTitle });
      setToast('Assistant title applied');
      return;
    }

    if (action === 'metadata') {
      updateCurrentPage({
        status: insights.metadata.status,
        priority: insights.metadata.priority,
        dueDate: currentPage.dueDate || insights.metadata.dueDate,
        tags: insights.metadata.tags,
      });
      setToast('Assistant properties applied');
      return;
    }

    if (action === 'tags') {
      const nextTags = [...new Set([...(currentPage.tags ?? []), ...insights.suggestedTags])].slice(0, 8);
      updateCurrentPage({ tags: nextTags });
      setToast(nextTags.length > (currentPage.tags ?? []).length ? 'Assistant tags added' : 'No new tags to add');
    }
  }

  function deleteBlock(blockId) {
    const blockIndex = currentPage.blocks.findIndex((block) => block.id === blockId);
    if (currentPage.blocks.length === 1) {
      updateBlock(blockId, { text: '', checked: false });
      return;
    }

    commitPages((existing) =>
      existing.map((page) => {
        if (page.id !== currentPage.id) return page;
        return {
          ...page,
          updatedAt: nowStamp(),
          blocks: page.blocks.filter((block) => block.id !== blockId),
        };
      }),
    );

    const previousBlock = currentPage.blocks[Math.max(0, blockIndex - 1)];
    if (previousBlock) {
      setTimeout(() => focusBlock(previousBlock.id), 30);
    }
  }

  function applyCommand(blockId, type) {
    const block = currentPage.blocks.find((item) => item.id === blockId);
    if (!block) return;
    const text = block.text ?? '';
    const slashIndex = text.lastIndexOf('/');
    const cleanText = slashIndex >= 0 ? text.slice(0, slashIndex).trimEnd() : text;
    const nextBlock = createBlock(type, cleanText);
    replaceBlock(blockId, { ...nextBlock, id: blockId });
    setSlashState(null);
    setTimeout(() => focusBlock(blockId), 30);
  }

  function addPage(kind = 'blank') {
    if (kind === 'daily') {
      const today = todayDateValue();
      const existingDailyPage = pages.find((page) =>
        getNoteDate(page) === today && (page.tags ?? []).includes('daily'),
      );

      if (existingDailyPage) {
        setCurrentPageId(existingDailyPage.id);
        setSearch('');
        setStatusFilter('All');
        setTagFilter('All');
        setPriorityFilter('All');
        setToast('Opened today note');
        return;
      }
    }

    const nextPage = makeTemplate(kind);
    commitPages((existing) => [nextPage, ...existing]);
    setCurrentPageId(nextPage.id);
    setSearch('');
    setStatusFilter('All');
    setTagFilter('All');
    setPriorityFilter('All');
    setTimeout(() => {
      const titleInput = document.querySelector('[data-page-title]');
      titleInput?.focus();
      titleInput?.select();
    }, 50);
  }

  function duplicatePage() {
    const clone = {
      ...currentPage,
      id: createId('page'),
      title: `${currentPage.title} copy`,
      favorite: false,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
      blocks: currentPage.blocks.map(cloneBlock),
    };
    commitPages((existing) => [clone, ...existing]);
    setCurrentPageId(clone.id);
  }

  function deletePage(pageId) {
    if (pages.length === 1) {
      addPage('blank');
    }
    commitPages((existing) => existing.filter((page) => page.id !== pageId));
  }

  function resetWorkspace() {
    const fresh = starterPages();
    setPages(fresh);
    setCurrentPageId(fresh[0].id);
    setSearch('');
    setStatusFilter('All');
    setTagFilter('All');
    setPriorityFilter('All');
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  }

  function changeTheme(nextTheme) {
    setTheme(nextTheme);
    setAppearanceOpen(false);
  }

  function exportCurrentPage() {
    const markdown = pageToMarkdown(currentPage);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${slugifyFilename(currentPage.title || 'untitled')}.md`);
    setToast('Markdown page exported');
  }

  function exportWorkspaceData() {
    const payload = {
      app: 'Nova Workspace',
      version: 1,
      exportedAt: nowStamp(),
      pages,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `nova-workspace-backup-${backupDateStamp()}.json`);
    setToast('Workspace backup downloaded');
  }

  async function importWorkspaceData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const importedPages = normalizeImportedPages(payload);
      if (!importedPages.length) {
        throw new Error('No pages found');
      }

      setPages(importedPages);
      setCurrentPageId(importedPages[0].id);
      setSearch('');
      setStatusFilter('All');
      setTagFilter('All');
      setPriorityFilter('All');
      setToast(`Imported ${importedPages.length} pages`);
    } catch {
      setToast('Could not import that backup');
    } finally {
      event.target.value = '';
    }
  }

  function runCommand(action) {
    action();
    setCommandOpen(false);
    setCommandQuery('');
  }

  function selectPage(pageId) {
    setCurrentPageId(pageId);
    setCommandOpen(false);
    setCommandQuery('');
  }

  function toggleFocusSprint() {
    setFocusSprint((current) => ({
      running: !current.running,
      seconds: current.seconds <= 0 ? 25 * 60 : current.seconds,
    }));
  }

  function resetFocusSprint() {
    setFocusSprint({ running: false, seconds: 25 * 60 });
  }

  function addSmartTask() {
    const nextTask = currentInsights?.bestMove || 'Choose the next useful action.';
    insertBlock(currentPage.blocks.at(-1)?.id, 'todo', nextTask);
    setToast('Smart task added');
  }

  if (!currentPage) {
    return null;
  }

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'} ${focusMode ? 'focus-mode' : ''}`}>
      {introVisible && <NovaIntro onDismiss={() => setIntroVisible(false)} />}
      <Sidebar
        pages={pages}
        currentPageId={currentPage.id}
        favoritePages={favoritePages}
        groupedPages={groupedPages}
        recentPages={recentPages}
        taskQueue={taskQueue}
        workspaceStats={workspaceStats}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        availableStatuses={availableStatuses}
        availableTags={availableTags}
        availablePriorities={availablePriorities}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSelectPage={selectPage}
        onAddPage={addPage}
        onOpenCommands={() => setCommandOpen(true)}
        onQuickCapture={quickCapture}
        onQuickTask={quickTask}
        onToggleTask={toggleWorkspaceTask}
      />

      <main className="workspace">
        <Topbar
          page={currentPage}
          theme={theme}
          appearanceOpen={appearanceOpen}
          sidebarOpen={sidebarOpen}
          focusMode={focusMode}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onToggleAppearance={() => setAppearanceOpen((open) => !open)}
          onToggleFocus={() => setFocusMode((active) => !active)}
          onExport={exportCurrentPage}
          onExportWorkspace={exportWorkspaceData}
          onImportWorkspace={importWorkspaceData}
          onOpenCommands={() => setCommandOpen(true)}
          onThemeChange={changeTheme}
          onDuplicate={duplicatePage}
          onDelete={() => deletePage(currentPage.id)}
          onReset={resetWorkspace}
          canInstall={Boolean(installPrompt) && !isInstalled}
          onInstall={installApp}
        />

        <div className="theme-band" aria-hidden="true" />

        <div className="content-grid">
          <section className="editor-shell" aria-label="Page editor">
            <PageCommandCenter
              page={currentPage}
              insights={currentInsights}
              workspaceStats={workspaceStats}
              focusSprint={focusSprint}
              onToggleSprint={toggleFocusSprint}
              onResetSprint={resetFocusSprint}
              onAssistantAction={runAssistantAction}
              onAddSmartTask={addSmartTask}
              onUpdatePage={updateCurrentPage}
            />
            <PageHeader page={currentPage} onUpdatePage={updateCurrentPage} />

            <div className="block-list">
              {currentPage.blocks.map((block) => (
                <Block
                  key={block.id}
                  block={block}
                  isActive={activeBlockId === block.id}
                  slashState={slashState}
                  setSlashState={setSlashState}
                  onFocus={() => setActiveBlockId(block.id)}
                  onUpdate={(patch) => updateBlock(block.id, patch)}
                  onEnter={() => insertBlock(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                  onApplyCommand={applyCommand}
                />
              ))}
            </div>

            <button
              type="button"
              className="add-block-button"
              onClick={() => insertBlock(currentPage.blocks.at(-1)?.id)}
            >
              <Plus size={16} />
              Add a block
            </button>
          </section>

          {!focusMode && (
            <Inspector
              page={currentPage}
              pages={pages}
              onUpdatePage={updateCurrentPage}
              onInsertBlock={(type) => insertBlock(currentPage.blocks.at(-1)?.id, type)}
              onAssistantAction={runAssistantAction}
              onSelectPage={selectPage}
              onFocusBlock={(blockId) => {
                setActiveBlockId(blockId);
                setTimeout(() => focusBlock(blockId), 30);
              }}
            />
          )}
        </div>
      </main>

      {commandOpen && (
        <CommandPalette
          pages={pages}
          query={commandQuery}
          setQuery={setCommandQuery}
          onClose={() => setCommandOpen(false)}
          onRun={runCommand}
          onSelectPage={selectPage}
          onAddPage={addPage}
          onToggleFocus={() => setFocusMode((active) => !active)}
          onExportPage={exportCurrentPage}
          onExportWorkspace={exportWorkspaceData}
          onAssistantAction={runAssistantAction}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function groupPages(pages) {
  return pages.reduce((groups, page) => {
    const key = page.section || 'Private';
    groups[key] = groups[key] ? [...groups[key], page] : [page];
    return groups;
  }, {});
}

function NovaIntro({ onDismiss }) {
  return (
    <section className="nova-intro" aria-label="Nova Workspace intro">
      <div className="nova-intro-card">
        <span className="workspace-logo intro-logo" aria-hidden="true">
          <span className="logo-orbit logo-orbit-one" />
          <span className="logo-orbit logo-orbit-two" />
          <span className="logo-core" />
          <span className="logo-spark" />
        </span>
        <div className="intro-copy">
          <span>Welcome to</span>
          <h1>Nova Workspace</h1>
          <p>Made by Cris</p>
        </div>
        <div className="intro-loader" aria-hidden="true">
          <span />
        </div>
        <button type="button" onClick={onDismiss}>
          Enter workspace
        </button>
      </div>
    </section>
  );
}

function getRecentPages(pages, currentPageId) {
  return [...pages]
    .filter((page) => page.id !== currentPageId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);
}

function getTaskQueue(pages) {
  return pages
    .flatMap((page) =>
      page.blocks
        .filter((block) => block.type === 'todo' && !block.checked)
        .map((block) => ({
          blockId: block.id,
          pageId: page.id,
          pageTitle: page.title || 'Untitled',
          pageIcon: page.icon,
          text: block.text || 'Untitled task',
          dueDate: page.dueDate,
          priority: page.priority || 'Normal',
          updatedAt: page.updatedAt,
        })),
    )
    .sort((a, b) => {
      const dueA = dateDeltaFromToday(a.dueDate);
      const dueB = dateDeltaFromToday(b.dueDate);
      const dueSort = (dueA ?? 9999) - (dueB ?? 9999);
      if (dueSort !== 0) return dueSort;

      const prioritySort = priorityOptions.indexOf(b.priority) - priorityOptions.indexOf(a.priority);
      if (prioritySort !== 0) return prioritySort;

      return new Date(b.updatedAt) - new Date(a.updatedAt);
    })
    .slice(0, 6);
}

function getWorkspaceStats(pages) {
  const tasks = pages.flatMap((page) => page.blocks.filter((block) => block.type === 'todo'));
  const openTasks = tasks.filter((task) => !task.checked).length;
  const dueNow = pages.filter((page) => {
    const delta = dateDeltaFromToday(page.dueDate);
    return delta !== null && delta <= 0;
  }).length;
  const updatedToday = pages.filter((page) => daysSince(page.updatedAt) === 0).length;

  return {
    pages: pages.length,
    openTasks,
    dueNow,
    updatedToday,
  };
}

function isStandaloneApp() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function themeColorFor(theme) {
  return themes.find((item) => item.id === theme)?.swatches?.[1] ?? '#2f6f68';
}

function focusBlock(blockId) {
  const element = document.querySelector(`[data-block-input="${blockId}"]`);
  element?.focus();
  if (element?.setSelectionRange) {
    const length = element.value.length;
    element.setSelectionRange(length, length);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function backupDateStamp() {
  return new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
}

function normalizeImportedPages(payload) {
  const rawPages = Array.isArray(payload) ? payload : payload?.pages;
  if (!Array.isArray(rawPages)) return [];

  return rawPages
    .filter((page) => page && typeof page === 'object')
    .map((page) => {
      const blocks = Array.isArray(page.blocks) && page.blocks.length
        ? page.blocks.map(normalizeImportedBlock)
        : [createParagraph('')];

      return {
        id: typeof page.id === 'string' && page.id ? page.id : createId('page'),
        title: typeof page.title === 'string' ? page.title : 'Untitled',
        icon: typeof page.icon === 'string' ? page.icon : 'ðŸ“„',
        section: typeof page.section === 'string' ? page.section : 'Private',
        status: typeof page.status === 'string' ? page.status : 'Draft',
        tags: Array.isArray(page.tags) ? page.tags.filter((tag) => typeof tag === 'string').slice(0, 8) : [],
        favorite: Boolean(page.favorite),
        priority: priorityOptions.includes(page.priority) ? page.priority : 'Normal',
        noteDate: normalizeDateInputValue(page.noteDate, normalizeDateInputValue(page.createdAt, todayDateValue())),
        dueDate: normalizeDateInputValue(page.dueDate),
        createdAt: typeof page.createdAt === 'string' ? page.createdAt : nowStamp(),
        updatedAt: typeof page.updatedAt === 'string' ? page.updatedAt : nowStamp(),
        blocks,
      };
    });
}

function normalizeImportedBlock(block) {
  if (!block || typeof block !== 'object') return createParagraph('');
  const id = typeof block.id === 'string' && block.id ? block.id : createId('block');
  const type = typeof block.type === 'string' ? block.type : 'paragraph';

  if (type === 'table') {
    return {
      id,
      type,
      columns: Array.isArray(block.columns) && block.columns.length ? block.columns.map(String) : ['Task', 'Status', 'Owner'],
      rows: Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map(String) : []) : [],
    };
  }

  if (type === 'divider') return { id, type };
  if (type === 'todo') return { id, type, text: String(block.text ?? ''), checked: Boolean(block.checked) };
  if (type === 'date') {
    return {
      id,
      type,
      date: normalizeDateInputValue(block.date, todayDateValue()),
      text: String(block.text ?? ''),
    };
  }
  if (type === 'toggle') {
    return {
      id,
      type,
      text: String(block.text ?? 'Toggle heading'),
      body: String(block.body ?? ''),
      open: block.open !== false,
    };
  }
  return { id, type, text: String(block.text ?? '') };
}

function getPageStats(page) {
  const text = page.blocks.map(getBlockText).join(' ');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const todos = page.blocks.filter((block) => block.type === 'todo').length;
  const done = page.blocks.filter((block) => block.type === 'todo' && block.checked).length;
  const dates = page.blocks.filter((block) => block.type === 'date').length;
  const readTime = Math.max(1, Math.ceil(words / 220));
  return { words, todos, done, dates, readTime };
}

function getBlockText(block) {
  if (block.type === 'table') return block.rows.flat().join(' ');
  if (block.type === 'divider') return '';
  if (block.type === 'date') return [block.date, block.text].filter(Boolean).join(' ');
  if (block.type === 'toggle') return [block.text, block.body].filter(Boolean).join(' ');
  return block.text ?? '';
}

function getPagePlainText(page) {
  return page.blocks.map(getBlockText).filter(Boolean).join(' ');
}

function cleanInlineText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function compactText(value, maxLength = 150) {
  const text = cleanInlineText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function uniqueItems(items) {
  return [...new Set(items.map(cleanInlineText).filter(Boolean))];
}

function getMeaningfulLines(page) {
  return page.blocks
    .flatMap((block) => {
      if (block.type === 'table') return block.rows.map((row) => row.filter(Boolean).join(' / '));
      return getBlockText(block);
    })
    .map(cleanInlineText)
    .filter((text) => text.length > 12);
}

function getOpenTaskTexts(page) {
  return page.blocks
    .filter((block) => block.type === 'todo' && !block.checked)
    .map((block) => cleanInlineText(block.text))
    .filter(Boolean);
}

function getRiskLines(lines) {
  const riskWords = ['blocked', 'blocker', 'risk', 'stuck', 'waiting', 'urgent', 'overdue', 'late', 'issue'];
  return lines.filter((line) => riskWords.some((word) => line.toLowerCase().includes(word))).slice(0, 3);
}

function inferPageIntent(page) {
  const haystack = `${page.title} ${page.section} ${page.status} ${(page.tags ?? []).join(' ')} ${getPagePlainText(page)}`.toLowerCase();
  if (haystack.includes('daily') || haystack.includes('journal') || haystack.includes('today')) return 'Daily planning';
  if (haystack.includes('meeting') || haystack.includes('agenda') || haystack.includes('standup')) return 'Meeting notes';
  if (haystack.includes('roadmap') || haystack.includes('project') || haystack.includes('launch')) return 'Project planning';
  if (haystack.includes('research') || haystack.includes('idea') || haystack.includes('explore')) return 'Research notes';
  if (haystack.includes('task') || haystack.includes('todo') || haystack.includes('next')) return 'Task tracking';
  return 'Working note';
}

function addDaysToDateValue(days) {
  const date = new Date(`${todayDateValue()}T00:00:00`);
  date.setDate(date.getDate() + days);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function toTitleCase(value) {
  return cleanInlineText(value)
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function getSuggestedTitle(page, intent, heading, lines) {
  const currentTitle = cleanInlineText(page.title);
  const genericTitle = !currentTitle || /^(untitled|new page|notes|daily note)$/i.test(currentTitle);
  if (!genericTitle && currentTitle.length > 4) return compactText(currentTitle, 54);

  const source = cleanInlineText(heading || lines.find((line) => line.length > 18) || intent);
  const stripped = source
    .replace(/^(todo|task|note|idea|meeting|project|daily)\s*[:/-]\s*/i, '')
    .replace(/\s+/g, ' ');
  return compactText(toTitleCase(stripped || intent), 54);
}

function getAssistantMetadata(page, stats, openTasks, dueDelta, riskLines, suggestedTags) {
  const status = stats.todos && stats.done === stats.todos
    ? 'Done'
    : dueDelta !== null && dueDelta < 0
      ? 'Review'
      : openTasks || stats.words > 80
        ? 'In progress'
        : 'Draft';
  const priority = dueDelta !== null && dueDelta < 0
    ? 'Urgent'
    : riskLines.length || openTasks > 3
      ? 'High'
      : page.priority || 'Normal';
  const dueDate = page.dueDate || (['High', 'Urgent'].includes(priority) ? addDaysToDateValue(priority === 'Urgent' ? 1 : 3) : '');
  const tags = uniqueItems([...(page.tags ?? []), ...suggestedTags]).slice(0, 8);

  return { status, priority, dueDate, tags };
}

function getAssistantKeywords(page) {
  const stopWords = new Set([
    'about',
    'after',
    'again',
    'also',
    'because',
    'before',
    'could',
    'from',
    'have',
    'into',
    'note',
    'notes',
    'page',
    'that',
    'this',
    'todo',
    'with',
    'would',
  ]);
  return new Set(
    `${page.title} ${page.section} ${(page.tags ?? []).join(' ')} ${getPagePlainText(page)}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word))
      .slice(0, 70),
  );
}

function getRelatedPages(page, pages = []) {
  const sourceTags = new Set(page.tags ?? []);
  const sourceWords = getAssistantKeywords(page);

  return pages
    .filter((item) => item.id !== page.id)
    .map((item) => {
      const sharedTags = (item.tags ?? []).filter((tag) => sourceTags.has(tag));
      const targetWords = getAssistantKeywords(item);
      const overlaps = [...sourceWords].filter((word) => targetWords.has(word)).slice(0, 3);
      const sameSection = item.section === page.section ? 1 : 0;
      const score = sharedTags.length * 5 + overlaps.length * 2 + sameSection;
      const reason = sharedTags.length
        ? `Shares ${sharedTags.map((tag) => `#${tag}`).join(', ')}`
        : overlaps.length
          ? `Overlaps on ${overlaps.join(', ')}`
          : sameSection
            ? `Same section: ${item.section}`
            : 'Nearby workspace context';

      return {
        id: item.id,
        icon: item.icon,
        title: item.title || 'Untitled',
        reason,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 4);
}

function getTimelineItems(nextActions, dueDate) {
  const actions = nextActions.length ? nextActions : ['Clarify the next useful step.'];
  const dateValues = [
    todayDateValue(),
    addDaysToDateValue(1),
    dueDate || addDaysToDateValue(3),
  ];

  return dateValues.map((date, index) => ({
    date,
    label: index === 0 ? 'Start' : index === 1 ? 'Follow up' : 'Review',
    action: actions[index] || actions.at(-1),
  }));
}

function getAgendaItems(keyPoints, questions, nextActions) {
  return uniqueItems([
    'Confirm the goal for this page.',
    ...keyPoints.slice(0, 2).map((point) => `Discuss: ${point}`),
    ...questions.slice(0, 2),
    nextActions[0] ? `Close with: ${nextActions[0]}` : 'Close with one owner and one date.',
  ]).slice(0, 6);
}

function getStudyCards(page, keyPoints, intent) {
  const title = page.title || intent;
  const sourcePoints = keyPoints.length ? keyPoints : ['Add clearer notes before studying this page.'];
  return sourcePoints.slice(0, 5).map((point, index) => ({
    question: index === 0 ? `What is the main idea of ${title}?` : `What should you remember about point ${index + 1}?`,
    answer: point,
  }));
}

function getWorkspaceBrief(pages = []) {
  const totals = pages.reduce(
    (acc, page) => {
      const stats = getPageStats(page);
      const open = stats.todos - stats.done;
      const dueDelta = dateDeltaFromToday(page.dueDate);
      const status = (page.status || 'Draft').toLowerCase();
      acc.openTasks += open;
      acc.doneTasks += stats.done;
      acc.totalTasks += stats.todos;
      acc.dueNow += dueDelta !== null && dueDelta <= 0 ? 1 : 0;
      acc.overdue += dueDelta !== null && dueDelta < 0 ? 1 : 0;
      acc.updatedToday += daysSince(page.updatedAt) === 0 ? 1 : 0;
      acc.donePages += status === 'done' ? 1 : 0;
      acc.activePages += ['active', 'in progress', 'review'].includes(status) ? 1 : 0;
      (page.tags ?? []).forEach((tag) => {
        acc.tags[tag] = (acc.tags[tag] ?? 0) + 1;
      });
      return acc;
    },
    {
      openTasks: 0,
      doneTasks: 0,
      totalTasks: 0,
      dueNow: 0,
      overdue: 0,
      updatedToday: 0,
      donePages: 0,
      activePages: 0,
      tags: {},
    },
  );
  const topTags = Object.entries(totals.tags)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([tag]) => `#${tag}`);
  const topPages = pages
    .map((page) => {
      const stats = getPageStats(page);
      const open = stats.todos - stats.done;
      const dueDelta = dateDeltaFromToday(page.dueDate);
      const priority = page.priority || 'Normal';
      const score = open * 4
        + (dueDelta !== null && dueDelta <= 0 ? 18 : 0)
        + priorityOptions.indexOf(priority) * 5
        + (daysSince(page.updatedAt) > 7 ? 3 : 0);
      const reason = [
        open ? `${open} open task${open === 1 ? '' : 's'}` : '',
        dueDelta !== null && dueDelta <= 0 ? (dueDelta < 0 ? 'overdue' : 'due today') : '',
        priority !== 'Normal' ? `${priority.toLowerCase()} priority` : '',
      ].filter(Boolean).join(' / ') || 'recent context';

      return {
        id: page.id,
        icon: page.icon,
        title: page.title || 'Untitled',
        reason,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 3);

  return {
    summary: `${pages.length} pages, ${totals.openTasks} open tasks, ${totals.dueNow} due now, and ${totals.updatedToday} updated today.`,
    lines: [
      `${totals.activePages} active or review pages, ${totals.donePages} done pages, ${totals.doneTasks}/${totals.totalTasks || 0} workspace tasks complete.`,
      topTags.length ? `Strongest tags: ${topTags.join(', ')}.` : 'No strong tag pattern yet.',
      totals.overdue ? `${totals.overdue} page${totals.overdue === 1 ? '' : 's'} should be rescheduled or closed.` : 'No overdue pages found.',
      topPages[0] ? `Highest leverage page: ${topPages[0].title} (${topPages[0].reason}).` : 'Create a page to start the workspace brief.',
    ],
    topPages,
  };
}

function getRiskRegisterItems(riskLines, dueDelta, openTasks, stats, bestMove, dueText) {
  const items = riskLines.map((line) => ({
    risk: 'Named blocker',
    signal: compactText(line, 120),
    mitigation: bestMove,
  }));

  if (dueDelta !== null && dueDelta < 0) {
    items.push({
      risk: 'Overdue date',
      signal: dueText,
      mitigation: 'Reschedule the date or close the work today.',
    });
  }

  if (openTasks > 3) {
    items.push({
      risk: 'Too many open loops',
      signal: `${openTasks} tasks are still open.`,
      mitigation: 'Pick one owner-style next task and defer the rest.',
    });
  }

  if (stats.words > 90 && !stats.todos) {
    items.push({
      risk: 'Passive notes',
      signal: `${stats.words} words but no tracked tasks.`,
      mitigation: 'Convert the strongest sentence into one to-do.',
    });
  }

  if (stats.words < 30) {
    items.push({
      risk: 'Thin context',
      signal: 'The page may not explain enough for a future review.',
      mitigation: 'Add a purpose line and the next decision.',
    });
  }

  if (!items.length) {
    items.push({
      risk: 'Momentum drift',
      signal: 'No hard blocker detected.',
      mitigation: bestMove,
    });
  }

  return items.slice(0, 5);
}

function getPriorityMatrixItems(nextActions, openTaskTexts, riskLines) {
  const now = uniqueItems([
    ...riskLines.slice(0, 1).map((line) => `Resolve: ${compactText(line, 78)}`),
    ...nextActions.slice(0, 2),
  ]).slice(0, 3);
  const next = uniqueItems([
    ...openTaskTexts.slice(0, 3),
    ...nextActions.slice(2, 4),
  ]).slice(0, 3);
  const later = [
    'Link this page to related workspace context.',
    'Convert finished notes into a short reference summary.',
    'Archive or close stale tasks after the next review.',
  ];

  return {
    now: now.length ? now : ['Choose one concrete next move.'],
    next: next.length ? next : ['Add the follow-up after the first move is done.'],
    later,
  };
}

function getFocusPlanItems(bestMove, nextActions, questions) {
  return [
    {
      time: '0-5 min',
      action: 'Read the page once and mark the one outcome that matters.',
      outcome: 'One visible outcome is written or confirmed.',
    },
    {
      time: '5-20 min',
      action: bestMove,
      outcome: 'The page has one real forward move completed or clarified.',
    },
    {
      time: '20-30 min',
      action: nextActions[1] || questions[0] || 'Capture the next decision.',
      outcome: 'The next review is obvious without rereading everything.',
    },
  ];
}

function getQualityChecks(page, stats, outlineItems, riskLines, nextActions) {
  return uniqueItems([
    page.title ? 'Title is present.' : 'Add a title that states the purpose.',
    outlineItems.length >= 2 ? 'Structure is scannable.' : 'Add at least two headings or date markers.',
    stats.todos ? 'Tasks are trackable.' : 'Add one to-do so the note can create action.',
    (page.tags ?? []).length ? 'Tags are present.' : 'Add 1-3 tags for retrieval.',
    riskLines.length ? 'Risks or blockers are named.' : 'Name the main blocker or assumption.',
    nextActions[0] ? `Recommended fix: ${nextActions[0]}` : '',
  ]).slice(0, 6);
}

function getLaunchPlanItems(nextActions, riskRegister, timelineItems) {
  const actions = nextActions.length ? nextActions : ['Define the first useful milestone.'];
  return [
    {
      phase: 'Align',
      move: actions[0],
      done: 'Goal, owner, and success check are clear.',
    },
    {
      phase: 'Build',
      move: actions[1] || 'Convert the strongest note into concrete work.',
      done: 'The work can be reviewed without guessing context.',
    },
    {
      phase: 'Review',
      move: riskRegister[0]?.mitigation || 'Run through risks and open questions.',
      done: 'Blockers, assumptions, and follow-ups are named.',
    },
    {
      phase: 'Ship',
      move: timelineItems.at(-1)?.action || actions.at(-1),
      done: 'Result, decision, and next date are captured.',
    },
  ];
}

function getWritingPack(suggestedTitle, summary, keyPoints, bestMove) {
  const strongestPoint = keyPoints[0] || 'This page needs one sharper point.';
  return {
    headline: suggestedTitle,
    hook: `Start with the change: ${compactText(strongestPoint, 120)}`,
    tldr: compactText(summary, 190),
    bullets: keyPoints.slice(0, 4),
    close: `Close with this move: ${bestMove}`,
  };
}

function getKnowledgeCardItems(page, keyPoints, questions, studyCards) {
  const topic = page.title || 'this page';
  return uniqueItems([
    `What is ${topic}?|${keyPoints[0] || 'A working note that needs one clear definition.'}`,
    ...studyCards.slice(0, 3).map((card) => `${card.question}|${card.answer}`),
    ...questions.slice(0, 2).map((question) => `${question}|Answer this before the page is considered complete.`),
  ])
    .map((item) => {
      const [question, answer] = item.split('|');
      return { question, answer: answer || 'Add an answer.' };
    })
    .slice(0, 6);
}

function getCleanupPlanItems(page, stats, outlineItems, openTaskTexts, riskLines, nextActions) {
  return uniqueItems([
    stats.words > 140 ? 'Cut or summarize repeated context near the top.' : 'Add one more durable context sentence.',
    outlineItems.length < 2 ? 'Add headings for Context, Decision, and Next steps.' : 'Keep headings short and scannable.',
    openTaskTexts.length > 2 ? `Reduce open tasks from ${openTaskTexts.length} to the top 3.` : '',
    riskLines.length ? 'Move the blocker into a risk or callout block.' : 'Name one assumption or risk before finishing.',
    !(page.tags ?? []).length ? 'Add retrieval tags so the page is findable later.' : 'Check whether the current tags still match the content.',
    nextActions[0],
  ]).slice(0, 6);
}

function getOkrPlanItems(suggestedTitle, bestMove, keyPoints, questions) {
  return {
    objective: `Make ${suggestedTitle} clear, useful, and moving.`,
    keyResults: [
      ['Clarity', keyPoints[0] ? 'Reader understands the main point in under 30 seconds.' : 'Add one main point.'],
      ['Momentum', bestMove],
      ['Confidence', questions[0] ? `Answer: ${questions[0]}` : 'Capture the next open question.'],
    ],
    initiatives: uniqueItems([
      bestMove,
      'Review the page after the next work session.',
      'Capture the final decision and archive stale context.',
    ]).slice(0, 4),
  };
}

function getAutomationIdeas(page, dueText, taskText, bestMove) {
  const title = page.title || 'this page';
  return [
    {
      trigger: 'When a task is completed',
      action: `Append a result note to ${title}.`,
      reason: 'Keeps progress visible without rereading the page.',
    },
    {
      trigger: 'When the page is overdue',
      action: 'Ask whether to reschedule, finish, or archive it.',
      reason: dueText,
    },
    {
      trigger: 'When the page has no tasks',
      action: `Suggest: ${bestMove}`,
      reason: taskText,
    },
    {
      trigger: 'When the page is marked Done',
      action: 'Insert a short decision and outcome summary.',
      reason: 'Turns finished work into reusable knowledge.',
    },
  ];
}

function getSuggestedTags(page) {
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'this',
    'that',
    'from',
    'into',
    'note',
    'notes',
    'page',
    'task',
    'today',
    'untitled',
  ]);
  const words = `${page.title} ${getPagePlainText(page)}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
  const counts = words.reduce((items, word) => {
    items[word] = (items[word] ?? 0) + 1;
    return items;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !(page.tags ?? []).includes(word))
    .slice(0, 5);
}

function getAssistantInsights(page, pages = []) {
  const stats = getPageStats(page);
  const outlineItems = getOutlineItems(page);
  const meaningfulLines = getMeaningfulLines(page);
  const plainText = getPagePlainText(page).trim();
  const openTasks = stats.todos - stats.done;
  const openTaskTexts = getOpenTaskTexts(page);
  const heading = page.blocks.find((block) => ['heading1', 'heading2'].includes(block.type) && block.text)?.text;
  const firstMeaningfulLine = meaningfulLines[0];
  const dueDelta = dateDeltaFromToday(page.dueDate);
  const suggestedTags = getSuggestedTags(page);
  const riskLines = getRiskLines(meaningfulLines);
  const staleDays = daysSince(page.updatedAt);
  const completion = stats.todos ? Math.round((stats.done / stats.todos) * 100) : 0;
  const intent = inferPageIntent(page);
  const dueText = dueDelta === null
    ? 'No due date'
    : dueDelta < 0
      ? `${Math.abs(dueDelta)} days overdue`
      : dueDelta === 0
        ? 'Due today'
        : `Due in ${dueDelta} days`;
  const taskText = stats.todos
    ? `${stats.done}/${stats.todos} tasks complete`
    : 'No tasks yet';
  const suggestedTitle = getSuggestedTitle(page, intent, heading, meaningfulLines);
  const metadata = getAssistantMetadata(page, stats, openTasks, dueDelta, riskLines, suggestedTags);
  const keyPoints = uniqueItems([
    heading,
    ...meaningfulLines.filter((line) => !openTaskTexts.includes(line)).slice(0, 5),
    riskLines[0],
  ])
    .map((item) => compactText(item, 130))
    .slice(0, 5);

  const summary = plainText
    ? `${page.title || 'Untitled'} reads like ${intent.toLowerCase()}: ${stats.words} words, ${openTasks} open tasks, ${outlineItems.length} outline points, and ${dueText.toLowerCase()}.${firstMeaningfulLine ? ` Main thread: ${compactText(firstMeaningfulLine, 140)}` : ''}`
    : 'This page is still mostly blank. Start with a heading, one clear note, and one next action so it becomes useful immediately.';

  const nextActions = [];
  if (!heading) nextActions.push('Add a clear heading that states the purpose of the page.');
  if (!stats.todos) nextActions.push('Add one concrete next action so the page has momentum.');
  if (openTasks > 3) nextActions.push('Pick the most important open task and move it near the top.');
  if (!(page.tags ?? []).length) nextActions.push('Add 1-3 tags so this page is easier to find later.');
  if (!page.dueDate && ['High', 'Urgent'].includes(page.priority || 'Normal')) {
    nextActions.push('Set a due date because this page is marked high priority.');
  }
  if (dueDelta !== null && dueDelta < 0) nextActions.push('Review the overdue date and either finish or reschedule it.');
  if (outlineItems.length < 2 && stats.words > 80) nextActions.push('Break the page into headings so it scans faster.');
  if (riskLines.length) nextActions.push('Resolve or name the blocker before adding more detail.');
  if (!nextActions.length) nextActions.push('Write a short decision, blocker, or next step to keep the page moving.');

  const questions = [];
  if (!heading) questions.push('What should this page help you decide or finish?');
  if (openTasks > 0) questions.push('Which open task is the first real move?');
  if (!page.dueDate && ['High', 'Urgent'].includes(page.priority || 'Normal')) questions.push('What date should this be finished by?');
  if (!riskLines.length && (page.status || 'Draft') !== 'Done') questions.push('What could block this page from moving forward?');
  if (stats.words > 60) questions.push('What decision should be obvious after reading this?');
  if (!(page.tags ?? []).length) questions.push('Which tags would make this easy to find later?');
  if (!questions.length) questions.push('What would make this page useful the next time you open it?');

  const bestMove = nextActions[0];
  const resolvedKeyPoints = keyPoints.length ? keyPoints : ['Add one clear note, one decision, and one next action.'];
  const relatedPages = getRelatedPages(page, pages);
  const timelineItems = getTimelineItems(nextActions.slice(0, 3), page.dueDate || metadata.dueDate);
  const agendaItems = getAgendaItems(resolvedKeyPoints, questions, nextActions);
  const studyCards = getStudyCards(page, resolvedKeyPoints, intent);
  const decisionPrompt = stats.words > 40
    ? 'Decision to capture: what changed, what is decided, and what remains open?'
    : 'Decision to capture: why does this page exist?';
  const signal = riskLines[0]
    ? `Possible blocker: ${compactText(riskLines[0], 130)}`
    : openTasks
      ? `${openTasks} open task${openTasks === 1 ? '' : 's'} need a clear order.`
      : dueDelta !== null
        ? dueText
        : `${intent} with ${stats.readTime} min read time.`;
  const decisionLog = {
    summary: signal,
    decision: stats.words > 40 ? decisionPrompt : `Decide what ${page.title || 'this page'} is for.`,
    why: riskLines[0] ? `The page mentions a possible blocker: ${compactText(riskLines[0], 150)}` : `This keeps the ${intent.toLowerCase()} moving instead of becoming passive notes.`,
    followUp: bestMove,
  };
  const polishedDraft = [
    `Purpose: ${suggestedTitle || page.title || intent}.`,
    `Current state: ${summary}`,
    resolvedKeyPoints[0] ? `Useful context: ${resolvedKeyPoints[0]}` : 'Useful context: add one specific note before this becomes a durable reference.',
    `Next move: ${bestMove}`,
  ];
  const contextStarter = firstMeaningfulLine
    ? `Current thread: ${compactText(firstMeaningfulLine, 160)}`
    : `Use this section to capture the context behind ${page.title || 'this page'}.`;
  const taskSweepItems = uniqueItems([
    ...openTaskTexts.slice(0, 4).map((task) => `Clarify or finish: ${task}`),
    ...nextActions,
  ]).slice(0, 5);
  const taskSweep = stats.todos
    ? `${taskText}. ${openTasks ? 'Sequence the open tasks and close anything stale.' : 'All tasks are complete; capture the result or next decision.'}`
    : 'No task blocks yet. Add a small next step so the note can turn into action.';

  const review = [
    intent,
    `${stats.words} words`,
    taskText,
    outlineItems.length ? `${outlineItems.length} outline markers` : 'no outline yet',
    dueText.toLowerCase(),
    staleDays ? `${staleDays} days since edit` : 'edited today',
  ].join(' / ');

  const focus = openTasks
    ? 'Finish or clarify one open task before adding more notes.'
    : stats.words < 40
      ? 'Capture enough context that future-you can understand why this page exists.'
      : 'Turn the strongest note into either a decision or an action.';
  const assistantScore = Math.min(100, Math.max(5, Math.round(
    (Math.min(stats.words, 300) / 300) * 28
    + (heading ? 14 : 0)
    + Math.min(stats.todos, 5) * 7
    + Math.min(outlineItems.length, 4) * 6
    + (page.tags?.length ? 12 : 0)
    + (page.dueDate ? 8 : 0)
    + (riskLines.length ? -6 : 0)
    + (dueDelta !== null && dueDelta < 0 ? -8 : 0),
  )));
  const statusReport = {
    snapshot: summary,
    progress: `${taskText}. Score ${assistantScore}.`,
    risk: riskLines[0] || (dueDelta !== null && dueDelta < 0 ? dueText : 'No explicit blocker found.'),
    next: bestMove,
  };
  const riskRegister = getRiskRegisterItems(riskLines, dueDelta, openTasks, stats, bestMove, dueText);
  const priorityMatrix = getPriorityMatrixItems(nextActions, openTaskTexts, riskLines);
  const focusPlan = getFocusPlanItems(bestMove, nextActions, questions);
  const launchPlan = getLaunchPlanItems(nextActions, riskRegister, timelineItems);
  const writingPack = getWritingPack(suggestedTitle, summary, resolvedKeyPoints, bestMove);
  const knowledgeCard = getKnowledgeCardItems(page, resolvedKeyPoints, questions, studyCards);
  const cleanupPlan = {
    summary: stats.words || stats.todos
      ? `Clean this page by tightening structure, reducing stale work, and making the next move obvious.`
      : 'Start by adding enough content for cleanup to have something useful to improve.',
    items: getCleanupPlanItems(page, stats, outlineItems, openTaskTexts, riskLines, nextActions),
  };
  const okrPlan = getOkrPlanItems(suggestedTitle, bestMove, resolvedKeyPoints, questions);
  const automationIdeas = getAutomationIdeas(page, dueText, taskText, bestMove);
  const handoffNote = {
    context: contextStarter,
    decision: decisionLog.decision,
    risk: riskRegister[0]?.signal || signal,
    next: bestMove,
    questions: uniqueItems(questions).slice(0, 3),
  };
  const qualityChecks = getQualityChecks(page, stats, outlineItems, riskLines, nextActions);
  const workspaceBrief = getWorkspaceBrief(pages);

  return {
    summary,
    nextActions: nextActions.slice(0, 5),
    questions: uniqueItems(questions).slice(0, 5),
    review,
    focus,
    suggestedTags,
    suggestedTitle,
    metadata,
    keyPoints: resolvedKeyPoints,
    polishedDraft,
    relatedPages,
    agendaItems,
    timelineItems,
    studyCards,
    decisionLog,
    stats,
    openTasks,
    completion,
    intent,
    dueText,
    taskText,
    bestMove,
    decisionPrompt,
    contextStarter,
    signal,
    riskLines,
    taskSweep,
    taskSweepItems,
    statusReport,
    riskRegister,
    priorityMatrix,
    focusPlan,
    launchPlan,
    writingPack,
    knowledgeCard,
    cleanupPlan,
    okrPlan,
    automationIdeas,
    handoffNote,
    qualityChecks,
    workspaceBrief,
    quickPrompts: ['What should I do next?', 'Mission control', 'Launch plan', 'Writer pack', 'Cleanup pass', 'Workspace brief'],
    score: assistantScore,
  };
}

function answerAssistantQuestion(page, question, insights = getAssistantInsights(page)) {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return insights.bestMove;

  if (normalized.includes('summary') || normalized.includes('summarize')) {
    return insights.summary;
  }

  if (normalized.includes('status report') || normalized.includes('progress report') || normalized.includes('standup')) {
    return `Status report: ${insights.statusReport.snapshot} Progress: ${insights.statusReport.progress} Risk: ${insights.statusReport.risk} Next: ${insights.statusReport.next}`;
  }

  if (normalized.includes('workspace')) {
    return `Workspace brief: ${insights.workspaceBrief.summary} ${insights.workspaceBrief.lines.join(' ')}`;
  }

  if (normalized.includes('mission') || normalized.includes('control') || normalized.includes('dashboard')) {
    return `Mission control: page score ${insights.score}/100. ${insights.statusReport.snapshot} Workspace pulse: ${insights.workspaceBrief.summary} Best move: ${insights.bestMove}`;
  }

  if (normalized.includes('launch') || normalized.includes('ship')) {
    return `Launch plan: ${insights.launchPlan.map((item) => `${item.phase}: ${item.move}`).join(' ')}`;
  }

  if (normalized.includes('writer pack') || normalized.includes('write pack') || normalized.includes('hook') || normalized.includes('headline')) {
    return `Writer pack: Headline: ${insights.writingPack.headline}. Hook: ${insights.writingPack.hook}. TLDR: ${insights.writingPack.tldr}. Close: ${insights.writingPack.close}`;
  }

  if (normalized.includes('cleanup') || normalized.includes('clean up') || normalized.includes('tidy')) {
    return `Cleanup pass: ${insights.cleanupPlan.summary} ${insights.cleanupPlan.items.join(' ')}`;
  }

  if (normalized.includes('okr') || normalized.includes('objective') || normalized.includes('key result')) {
    return `OKR plan: ${insights.okrPlan.objective} ${insights.okrPlan.keyResults.map((item) => `${item[0]}: ${item[1]}`).join(' ')}`;
  }

  if (normalized.includes('faq') || normalized.includes('knowledge base') || normalized.includes('knowledge card')) {
    return `Knowledge card: ${insights.knowledgeCard.map((item) => `${item.question} ${item.answer}`).join(' ')}`;
  }

  if (normalized.includes('automate') || normalized.includes('automation')) {
    return `Automation ideas: ${insights.automationIdeas.map((item) => `${item.trigger}: ${item.action}`).join(' ')}`;
  }

  if (normalized.includes('focus') || normalized.includes('timebox') || normalized.includes('30')) {
    return `Focus plan: ${insights.focusPlan.map((item) => `${item.time}: ${item.action}`).join(' ')}`;
  }

  if (normalized.includes('handoff') || normalized.includes('handover')) {
    return `Handoff: ${insights.handoffNote.context} Decision: ${insights.handoffNote.decision} Risk: ${insights.handoffNote.risk} Next: ${insights.handoffNote.next}`;
  }

  if (normalized.includes('quality') || normalized.includes('checklist') || normalized.includes('check')) {
    return `Quality check: ${insights.qualityChecks.join(' ')}`;
  }

  if (normalized.includes('priority matrix') || normalized.includes('prioritize') || normalized.includes('matrix')) {
    return `Priority matrix: Now: ${insights.priorityMatrix.now.join(' ')} Next: ${insights.priorityMatrix.next.join(' ')} Later: ${insights.priorityMatrix.later.join(' ')}`;
  }

  if (normalized.includes('risk') || normalized.includes('block') || normalized.includes('problem')) {
    if (normalized.includes('register')) {
      return `Risk register: ${insights.riskRegister.map((item) => `${item.risk}: ${item.signal}. Mitigation: ${item.mitigation}`).join(' ')}`;
    }
    if (insights.riskLines.length) return `Watch this first: ${compactText(insights.riskLines[0], 170)}`;
    return `No explicit blocker found. The main risk is drift: ${insights.bestMove}`;
  }

  if (normalized.includes('task') || normalized.includes('todo') || normalized.includes('next') || normalized.includes('do')) {
    return `${insights.bestMove} ${insights.openTasks ? insights.taskSweep : 'After that, capture a decision or next dated follow-up.'}`;
  }

  if (normalized.includes('key point') || normalized.includes('important') || normalized.includes('main points')) {
    return insights.keyPoints.map((item, index) => `${index + 1}. ${item}`).join(' ');
  }

  if (normalized.includes('metadata') || normalized.includes('property') || normalized.includes('status') || normalized.includes('priority')) {
    const due = insights.metadata.dueDate ? `, due ${formatDueDate(insights.metadata.dueDate)}` : '';
    const tags = insights.metadata.tags.length ? `, tags ${insights.metadata.tags.map((tag) => `#${tag}`).join(' ')}` : '';
    return `Suggested properties: ${insights.metadata.status}, ${insights.metadata.priority} priority${due}${tags}.`;
  }

  if (normalized.includes('title') || normalized.includes('name')) {
    return `Suggested title: ${insights.suggestedTitle}.`;
  }

  if (normalized.includes('polish') || normalized.includes('rewrite') || normalized.includes('clean')) {
    return insights.polishedDraft.join(' ');
  }

  if (normalized.includes('agenda') || normalized.includes('meeting')) {
    return `Agenda: ${insights.agendaItems.join(' ')}`;
  }

  if (normalized.includes('timeline') || normalized.includes('schedule')) {
    return `Timeline: ${insights.timelineItems.map((item) => `${formatDueDate(item.date)} ${item.action}`).join(' ')}`;
  }

  if (normalized.includes('study') || normalized.includes('quiz') || normalized.includes('flashcard')) {
    return `Study cards: ${insights.studyCards.map((card) => `${card.question} ${card.answer}`).join(' ')}`;
  }

  if (normalized.includes('related') || normalized.includes('similar')) {
    return insights.relatedPages.length
      ? `Related pages: ${insights.relatedPages.map((item) => `${item.title} (${item.reason})`).join(', ')}.`
      : 'No strongly related pages yet. Add tags or more context to connect this page to the workspace.';
  }

  if (normalized.includes('decision')) {
    return `${insights.decisionLog.summary} ${insights.decisionLog.decision} Follow-up: ${insights.decisionLog.followUp}`;
  }

  if (normalized.includes('date') || normalized.includes('due') || normalized.includes('when')) {
    return `${insights.dueText}. ${page.dueDate ? `The current due date is ${formatDueDate(page.dueDate)}.` : 'Set one if this page is tied to a deadline.'}`;
  }

  if (normalized.includes('tag')) {
    return insights.suggestedTags.length
      ? `Suggested tags: ${insights.suggestedTags.map((tag) => `#${tag}`).join(', ')}.`
      : 'The current tags already cover the strongest repeated terms I can see.';
  }

  if (normalized.includes('outline') || normalized.includes('structure')) {
    return insights.nextActions.find((item) => item.toLowerCase().includes('heading')) || 'The page structure is workable. Add Decisions and Next steps if this note needs to drive action.';
  }

  return `${insights.summary} Best next move: ${insights.bestMove}`;
}

function frameAssistantAnswer(answer, mode, insights) {
  const base = cleanInlineText(answer);
  if (!base) return '';

  if (mode === 'writer') {
    return `${base} Writer pass: ${insights.polishedDraft[0]}`;
  }

  if (mode === 'pm') {
    return `${base} PM lens: owner, deadline, risk. Next accountable move: ${insights.bestMove}`;
  }

  if (mode === 'study') {
    const card = insights.studyCards[0];
    return `${base} Recall check: ${card ? `${card.question} ${card.answer}` : insights.questions[0]}`;
  }

  return `${base} Coach lens: ${insights.focus}`;
}

function daysSince(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - target) / 86400000));
}

function dateDeltaFromToday(value) {
  const normalized = normalizeDateInputValue(value);
  if (!normalized) return null;
  const today = new Date(`${todayDateValue()}T00:00:00`);
  const target = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - today) / 86400000);
}

function getPageHealth(page) {
  const stats = getPageStats(page);
  const staleDays = daysSince(page.updatedAt);
  const dueDelta = dateDeltaFromToday(page.dueDate);
  const openTasks = stats.todos - stats.done;

  const freshness = staleDays <= 1
    ? { label: 'Fresh', detail: 'Edited recently', tone: 'good', icon: Clock3 }
    : { label: 'Review', detail: `${staleDays} days since edit`, tone: 'warn', icon: Clock3 };

  const due = dueDelta === null
    ? { label: 'No due date', detail: 'Optional', tone: 'neutral', icon: CalendarDays }
    : dueDelta < 0
      ? { label: 'Overdue', detail: `${Math.abs(dueDelta)} days late`, tone: 'danger', icon: CalendarDays }
      : dueDelta === 0
        ? { label: 'Due today', detail: 'Needs attention', tone: 'warn', icon: CalendarDays }
        : { label: 'Scheduled', detail: `Due in ${dueDelta} days`, tone: 'good', icon: CalendarDays };

  const tasks = stats.todos === 0
    ? { label: 'No tasks', detail: 'Pure notes', tone: 'neutral', icon: CheckSquare }
    : openTasks === 0
      ? { label: 'Tasks done', detail: `${stats.done}/${stats.todos} complete`, tone: 'good', icon: CheckSquare }
      : { label: 'Open tasks', detail: `${openTasks} left`, tone: 'warn', icon: CheckSquare };

  return [freshness, due, tasks];
}

function getOutlineItems(page) {
  return page.blocks
    .filter((block) => ['heading1', 'heading2', 'date'].includes(block.type))
    .map((block) => {
      const label = block.type === 'date'
        ? `${formatDueDate(block.date || todayDateValue())}${block.text ? ` / ${block.text}` : ''}`
        : block.text || getBlockLabel(block.type);

      return {
        id: block.id,
        type: block.type,
        label,
        level: block.type === 'heading2' ? 2 : 1,
        icon: block.type === 'date' ? CalendarDays : getBlockIcon(block.type),
      };
    })
    .filter((item) => item.label.trim());
}

function pageToMarkdown(page) {
  const title = page.title || 'Untitled';
  const tags = page.tags?.length ? `\nTags: ${page.tags.map((tag) => `#${tag}`).join(' ')}` : '';
  const lines = [
    `# ${page.icon || ''} ${title}`.trim(),
    '',
    `Date: ${formatDueDate(getNoteDate(page))}`,
    `Status: ${page.status || 'Draft'}`,
    `Priority: ${page.priority || 'Normal'}`,
    ...(page.dueDate ? [`Due: ${formatDueDate(page.dueDate)}`] : []),
    `Section: ${page.section || 'Private'}${tags}`,
    `Updated: ${formatDate(page.updatedAt)}`,
    '',
  ];

  page.blocks.forEach((block) => {
    if (block.type === 'heading1') lines.push(`## ${block.text || 'Heading'}`, '');
    else if (block.type === 'heading2') lines.push(`### ${block.text || 'Heading'}`, '');
    else if (block.type === 'todo') lines.push(`- [${block.checked ? 'x' : ' '}] ${block.text || 'To-do'}`);
    else if (block.type === 'quote') lines.push(`> ${block.text || 'Quote'}`, '');
    else if (block.type === 'callout') lines.push('> [!NOTE]', `> ${block.text || 'Callout'}`, '');
    else if (block.type === 'toggle') lines.push(`<details>`, `<summary>${block.text || 'Toggle'}</summary>`, '', block.body || '', '', `</details>`, '');
    else if (block.type === 'date') lines.push(`**Date:** ${formatDueDate(block.date || todayDateValue())}`, block.text || '', '');
    else if (block.type === 'code') lines.push('```', block.text || '', '```', '');
    else if (block.type === 'divider') lines.push('', '---', '');
    else if (block.type === 'table') lines.push(...tableToMarkdown(block), '');
    else lines.push(block.text || '', '');
  });

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function tableToMarkdown(block) {
  const columns = block.columns.map(escapeMarkdownTableCell);
  const rows = block.rows.map((row) => row.map(escapeMarkdownTableCell));
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ];
}

function escapeMarkdownTableCell(value = '') {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function slugifyFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'untitled';
}

function Sidebar({
  pages,
  currentPageId,
  favoritePages,
  groupedPages,
  recentPages,
  taskQueue,
  workspaceStats,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  tagFilter,
  setTagFilter,
  priorityFilter,
  setPriorityFilter,
  availableStatuses,
  availableTags,
  availablePriorities,
  sidebarOpen,
  setSidebarOpen,
  onSelectPage,
  onAddPage,
  onOpenCommands,
  onQuickCapture,
  onQuickTask,
  onToggleTask,
}) {
  const [composerMode, setComposerMode] = useState('note');
  const [composerText, setComposerText] = useState('');
  const [openPanels, setOpenPanels] = useState({ tasks: true, recent: false });
  const filtersActive = Boolean(search.trim()) || statusFilter !== 'All' || tagFilter !== 'All' || priorityFilter !== 'All';

  function submitComposer(event) {
    event.preventDefault();
    if (composerMode === 'task') {
      onQuickTask(composerText);
    } else {
      onQuickCapture(composerText);
    }
    setComposerText('');
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('All');
    setTagFilter('All');
    setPriorityFilter('All');
  }

  function togglePanel(panel) {
    setOpenPanels((existing) => ({ ...existing, [panel]: !existing[panel] }));
  }

  return (
    <aside className="sidebar" aria-label="Workspace navigation">
      <div className="sidebar-header">
        <button type="button" className="workspace-switcher" onClick={() => setSidebarOpen(true)}>
          <span className="workspace-logo" aria-hidden="true">
            <span className="logo-orbit logo-orbit-one" />
            <span className="logo-orbit logo-orbit-two" />
            <span className="logo-core" />
            <span className="logo-spark" />
          </span>
          <span>
            <strong>Nova Workspace</strong>
            <small>{pages.length} pages</small>
          </span>
        </button>
        <button
          type="button"
          className="icon-button"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <div className="workspace-metrics" aria-label="Workspace stats">
        <span>
          <strong>{workspaceStats.openTasks}</strong>
          <small>Open</small>
        </span>
        <span>
          <strong>{workspaceStats.dueNow}</strong>
          <small>Due</small>
        </span>
        <span>
          <strong>{workspaceStats.updatedToday}</strong>
          <small>Today</small>
        </span>
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pages"
          aria-label="Search pages"
        />
      </label>

      <div className="filter-heading">
        <span>Filters</span>
        {filtersActive && (
          <button type="button" onClick={clearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      <div className="sidebar-filters" aria-label="Page filters">
        <div className="filter-row">
          <SlidersHorizontal size={14} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            {availableStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <Tags size={14} />
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Filter by tag">
            {availableTags.map((tag) => (
              <option key={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <Flag size={14} />
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Filter by priority">
            {availablePriorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="quick-actions">
        <button type="button" onClick={() => onAddPage('blank')}>
          <Plus size={16} />
          New
        </button>
        <button type="button" onClick={() => onAddPage('notes')}>
          <BookOpen size={16} />
          Notes
        </button>
        <button type="button" onClick={() => onAddPage('project')}>
          <LayoutGrid size={16} />
          Project
        </button>
        <button type="button" onClick={() => onAddPage('daily')}>
          <CalendarDays size={16} />
          Today
        </button>
        <button type="button" className="wide-action" onClick={onOpenCommands}>
          <Command size={16} />
          Command
        </button>
      </div>

      <form className="quick-composer" onSubmit={submitComposer}>
        <div className="composer-tabs" role="group" aria-label="Quick add type">
          <button
            type="button"
            className={composerMode === 'note' ? 'active' : ''}
            onClick={() => setComposerMode('note')}
          >
            <Plus size={14} />
            Note
          </button>
          <button
            type="button"
            className={composerMode === 'task' ? 'active' : ''}
            onClick={() => setComposerMode('task')}
          >
            <CheckSquare size={14} />
            Task
          </button>
        </div>
        <div className="composer-row">
          <input
            value={composerText}
            onChange={(event) => setComposerText(event.target.value)}
            placeholder={composerMode === 'task' ? 'Add a task' : 'Capture a quick note'}
            aria-label={composerMode === 'task' ? 'Add a quick task' : 'Capture a quick note'}
          />
          <button type="submit" title={composerMode === 'task' ? 'Add quick task' : 'Add quick note'}>
            {composerMode === 'task' ? <CheckSquare size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </form>

      <section className="side-panel task-panel" aria-label="Open tasks">
        <button
          type="button"
          className="side-panel-heading panel-toggle"
          onClick={() => togglePanel('tasks')}
          aria-expanded={openPanels.tasks}
        >
          <span>Open tasks</span>
          <span className="panel-count">{taskQueue.length}</span>
          {openPanels.tasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openPanels.tasks && (
          taskQueue.length > 0 ? (
            <div className="task-queue-list">
              {taskQueue.map((task) => (
                <div className="task-queue-item" key={`${task.pageId}-${task.blockId}`}>
                  <button
                    type="button"
                    className="task-check"
                    title="Complete task"
                    aria-label={`Complete ${task.text}`}
                    onClick={() => onToggleTask(task.pageId, task.blockId, true)}
                  >
                    <Circle size={15} />
                  </button>
                  <button type="button" className="task-jump" onClick={() => onSelectPage(task.pageId)} title={task.text}>
                    <span>{task.text}</span>
                    <small>{task.pageIcon} {task.pageTitle}{task.dueDate ? ` / Due ${formatDueDate(task.dueDate)}` : ''}</small>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No open tasks</p>
          )
        )}
      </section>

      {recentPages.length > 0 && (
        <section className="side-panel recent-panel" aria-label="Recent pages">
          <button
            type="button"
            className="side-panel-heading panel-toggle"
            onClick={() => togglePanel('recent')}
            aria-expanded={openPanels.recent}
          >
            <span>Recent</span>
            <span className="panel-count">{recentPages.length}</span>
            {openPanels.recent ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {openPanels.recent && (
            <div className="recent-list">
              {recentPages.map((page) => (
                <button key={page.id} type="button" className="recent-link" onClick={() => onSelectPage(page.id)}>
                  <span className="page-emoji" aria-hidden="true">{page.icon}</span>
                  <span>
                    <strong>{page.title || 'Untitled'}</strong>
                    <small>Edited {formatDate(page.updatedAt)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <nav className="page-nav">
        {favoritePages.length > 0 && (
          <PageGroup
            title="Favorites"
            pages={favoritePages}
            currentPageId={currentPageId}
            onSelectPage={onSelectPage}
          />
        )}

        {Object.entries(groupedPages).map(([section, sectionPages]) => (
          <PageGroup
            key={section}
            title={section}
            pages={sectionPages}
            currentPageId={currentPageId}
            onSelectPage={onSelectPage}
          />
        ))}
      </nav>
    </aside>
  );
}

function PageGroup({ title, pages, currentPageId, onSelectPage }) {
  return (
    <section className="page-group">
      <div className="group-label">{title}</div>
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          className={`page-link ${page.id === currentPageId ? 'active' : ''}`}
          onClick={() => onSelectPage(page.id)}
        >
          <span className="page-emoji" aria-hidden="true">
            {page.icon}
          </span>
          <span className="page-link-body">
            <span className="page-link-title">{page.title || 'Untitled'}</span>
            <span className="page-link-subtitle">{page.status || 'Draft'} / {page.priority || 'Normal'}{page.tags?.[0] ? ` / ${page.tags[0]}` : ''}</span>
          </span>
          {page.favorite && <Star className="page-star" size={14} fill="currentColor" />}
        </button>
      ))}
    </section>
  );
}

function Topbar({
  page,
  theme,
  appearanceOpen,
  sidebarOpen,
  focusMode,
  onToggleSidebar,
  onToggleAppearance,
  onToggleFocus,
  onExport,
  onExportWorkspace,
  onImportWorkspace,
  onOpenCommands,
  onThemeChange,
  onDuplicate,
  onDelete,
  onReset,
  canInstall,
  onInstall,
}) {
  const activeTheme = themes.find((item) => item.id === theme) ?? themes[0];
  const ThemeIcon = activeTheme.icon;

  return (
    <header className="topbar">
      <div className="topbar-left">
        {!sidebarOpen && (
          <button type="button" className="icon-button" title="Open sidebar" onClick={onToggleSidebar}>
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="breadcrumb">
          <Home size={16} />
          <ChevronRight size={14} />
          <span>{page.title || 'Untitled'}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="saved-state">
          <Clock3 size={15} />
          Edited {formatDate(page.updatedAt)}
        </span>
        <span className="theme-status" title={`Theme: ${activeTheme.label}`}>
          <ThemeIcon size={15} />
          {activeTheme.label}
        </span>
        {canInstall && (
          <button type="button" className="install-button" onClick={onInstall}>
            <Download size={16} />
            Install
          </button>
        )}
        <button
          type="button"
          className="icon-button optional-action"
          title="Command palette"
          onMouseDown={(event) => {
            event.preventDefault();
            onOpenCommands();
          }}
          onClick={onOpenCommands}
        >
          <Command size={17} />
        </button>
        <button type="button" className="icon-button optional-action" title="Export Markdown" onClick={onExport}>
          <FileDown size={17} />
        </button>
        <button type="button" className="icon-button optional-action" title="Export workspace backup" onClick={onExportWorkspace}>
          <Download size={17} />
        </button>
        <label className="icon-button optional-action file-import-button" title="Import workspace backup">
          <FileUp size={17} />
          <input type="file" accept="application/json,.json" onChange={onImportWorkspace} />
        </label>
        <button
          type="button"
          className={`icon-button optional-action ${focusMode ? 'active' : ''}`}
          title={focusMode ? 'Exit focus mode' : 'Focus mode'}
          onClick={onToggleFocus}
        >
          {focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
        <button type="button" className="icon-button optional-action" title="Duplicate page" onClick={onDuplicate}>
          <Copy size={17} />
        </button>
        <button type="button" className="icon-button optional-action" title="Reset demo workspace" onClick={onReset}>
          <Archive size={17} />
        </button>
        <button type="button" className="icon-button danger" title="Delete page" onClick={onDelete}>
          <Trash2 size={17} />
        </button>
        <button
          type="button"
          className={`icon-button more-action ${appearanceOpen ? 'active' : ''}`}
          title={appearanceOpen ? 'Collapse themes' : 'Show themes'}
          aria-controls="appearance-panel"
          aria-expanded={appearanceOpen}
          onClick={onToggleAppearance}
        >
          <MoreHorizontal size={18} />
        </button>
        {appearanceOpen && (
          <div className="topbar-menu" role="dialog" aria-label="Appearance">
            <div className="panel-heading">
              <span>Appearance</span>
              <Palette size={15} />
            </div>
            <div className="theme-grid" role="radiogroup" aria-label="Theme">
              {themes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`theme-choice ${theme === item.id ? 'active' : ''}`}
                    onClick={() => onThemeChange(item.id)}
                    role="radio"
                    aria-checked={theme === item.id}
                  >
                    <span className="theme-choice-head">
                      <Icon size={15} />
                      {item.label}
                      {item.background && <span className="theme-badge">BG</span>}
                    </span>
                    <span className="theme-swatches" aria-hidden="true">
                      {item.swatches.map((color) => (
                        <span key={color} style={{ background: color }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function CommandPalette({
  pages,
  query,
  setQuery,
  onClose,
  onRun,
  onSelectPage,
  onAddPage,
  onToggleFocus,
  onExportPage,
  onExportWorkspace,
  onAssistantAction,
}) {
  const term = query.trim().toLowerCase();
  const actions = [
    { label: 'New page', hint: 'Create a blank page', icon: Plus, run: () => onRun(() => onAddPage('blank')) },
    { label: 'New notes page', hint: 'Start a notes template', icon: BookOpen, run: () => onRun(() => onAddPage('notes')) },
    { label: 'New project page', hint: 'Start a project template', icon: LayoutGrid, run: () => onRun(() => onAddPage('project')) },
    { label: 'Open today note', hint: 'Create or open today journal page', icon: CalendarDays, run: () => onRun(() => onAddPage('daily')) },
    { label: 'Toggle focus mode', hint: 'Hide navigation and panels', icon: Maximize2, run: () => onRun(onToggleFocus) },
    { label: 'AI summary', hint: 'Insert a page summary from Nova AI', icon: Star, run: () => onRun(() => onAssistantAction('summary')) },
    { label: 'AI smart brief', hint: 'Insert context, signal, and best next move', icon: FileText, run: () => onRun(() => onAssistantAction('brief')) },
    { label: 'AI status report', hint: 'Insert progress, risk, and next move', icon: FileText, run: () => onRun(() => onAssistantAction('status')) },
    { label: 'AI risk register', hint: 'Build a risk table with mitigation', icon: Flag, run: () => onRun(() => onAssistantAction('risks')) },
    { label: 'AI priority matrix', hint: 'Split work into now, next, and later', icon: SlidersHorizontal, run: () => onRun(() => onAssistantAction('priority')) },
    { label: 'AI focus plan', hint: 'Create a 30-minute execution plan', icon: Clock3, run: () => onRun(() => onAssistantAction('focus')) },
    { label: 'AI handoff note', hint: 'Package context, decision, risk, and questions', icon: FileUp, run: () => onRun(() => onAssistantAction('handoff')) },
    { label: 'AI quality check', hint: 'Audit the page for missing structure', icon: CheckSquare, run: () => onRun(() => onAssistantAction('quality')) },
    { label: 'AI workspace brief', hint: 'Summarize all pages and workspace pressure', icon: Home, run: () => onRun(() => onAssistantAction('workspace')) },
    { label: 'AI mission control', hint: 'Insert a premium dashboard for page and workspace pressure', icon: Maximize2, run: () => onRun(() => onAssistantAction('mission')) },
    { label: 'AI launch plan', hint: 'Create milestones, moves, and acceptance checks', icon: Flag, run: () => onRun(() => onAssistantAction('launch')) },
    { label: 'AI writer pack', hint: 'Draft headline, hook, TLDR, points, and close', icon: Quote, run: () => onRun(() => onAssistantAction('writerpack')) },
    { label: 'AI cleanup pass', hint: 'Generate a page cleanup checklist', icon: CheckSquare, run: () => onRun(() => onAssistantAction('cleanup')) },
    { label: 'AI OKR plan', hint: 'Turn the page into objective and key results', icon: Circle, run: () => onRun(() => onAssistantAction('okr')) },
    { label: 'AI knowledge card', hint: 'Create FAQ-style reusable knowledge', icon: BookOpen, run: () => onRun(() => onAssistantAction('knowledge')) },
    { label: 'AI automation ideas', hint: 'Suggest useful triggers and actions', icon: Command, run: () => onRun(() => onAssistantAction('automate')) },
    { label: 'AI action plan', hint: 'Turn suggestions into to-do blocks', icon: ListChecks, run: () => onRun(() => onAssistantAction('plan')) },
    { label: 'AI outline', hint: 'Insert context, decisions, and next steps', icon: Hash, run: () => onRun(() => onAssistantAction('outline')) },
    { label: 'AI key points', hint: 'Extract the strongest points on this page', icon: Star, run: () => onRun(() => onAssistantAction('points')) },
    { label: 'AI polish draft', hint: 'Insert a cleaner rewritten version', icon: Quote, run: () => onRun(() => onAssistantAction('polish')) },
    { label: 'AI decision log', hint: 'Insert decision, rationale, and follow-up', icon: Circle, run: () => onRun(() => onAssistantAction('decision')) },
    { label: 'AI meeting agenda', hint: 'Turn this page into agenda items', icon: BookOpen, run: () => onRun(() => onAssistantAction('agenda')) },
    { label: 'AI timeline', hint: 'Insert a short dated execution timeline', icon: CalendarDays, run: () => onRun(() => onAssistantAction('timeline')) },
    { label: 'AI study cards', hint: 'Create a question and answer table', icon: Table2, run: () => onRun(() => onAssistantAction('study')) },
    { label: 'AI related pages', hint: 'Insert similar workspace pages', icon: Archive, run: () => onRun(() => onAssistantAction('related')) },
    { label: 'AI apply properties', hint: 'Suggest status, priority, due date, and tags', icon: SlidersHorizontal, run: () => onRun(() => onAssistantAction('metadata')) },
    { label: 'AI rename page', hint: 'Apply the assistant title suggestion', icon: Type, run: () => onRun(() => onAssistantAction('title')) },
    { label: 'AI questions', hint: 'Insert page-aware follow-up questions', icon: MessageSquareText, run: () => onRun(() => onAssistantAction('questions')) },
    { label: 'AI task sweep', hint: 'Organize open tasks into a focused sweep', icon: CheckSquare, run: () => onRun(() => onAssistantAction('sweep')) },
    { label: 'AI review', hint: 'Insert a short page review', icon: MessageSquareText, run: () => onRun(() => onAssistantAction('review')) },
    { label: 'Export current page', hint: 'Download Markdown', icon: FileDown, run: () => onRun(onExportPage) },
    { label: 'Backup workspace', hint: 'Download all pages as JSON', icon: Download, run: () => onRun(onExportWorkspace) },
  ];
  const visibleActions = actions.filter((action) =>
    `${action.label} ${action.hint}`.toLowerCase().includes(term),
  );
  const visiblePages = pages
    .filter((page) =>
      `${page.title} ${page.section} ${page.status} ${page.priority} ${page.noteDate} ${(page.tags ?? []).join(' ')}`.toLowerCase().includes(term),
    )
    .slice(0, 7);

  function runFirstMatch() {
    if (visibleActions[0]) {
      visibleActions[0].run();
      return;
    }

    if (visiblePages[0]) {
      onSelectPage(visiblePages[0].id);
    }
  }

  return (
    <div className="command-overlay" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search">
          <Command size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                runFirstMatch();
              }
            }}
            placeholder="Search pages or run a command"
          />
          <button type="button" className="icon-button" title="Close command palette" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="command-results">
          {visibleActions.length > 0 && (
            <div className="command-group">
              <div className="command-label">Actions</div>
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} type="button" onClick={action.run}>
                    <span className="command-icon"><Icon size={17} /></span>
                    <span>
                      <strong>{action.label}</strong>
                      <small>{action.hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {visiblePages.length > 0 && (
            <div className="command-group">
              <div className="command-label">Pages</div>
              {visiblePages.map((page) => (
                <button key={page.id} type="button" onClick={() => onSelectPage(page.id)}>
                  <span className="command-icon">{page.icon}</span>
                  <span>
                    <strong>{page.title || 'Untitled'}</strong>
                    <small>{page.status || 'Draft'} / {page.section || 'Private'}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {!visibleActions.length && !visiblePages.length && (
            <div className="command-empty">No matches</div>
          )}
        </div>
      </section>
    </div>
  );
}

function PageCommandCenter({
  page,
  insights,
  workspaceStats,
  focusSprint,
  onToggleSprint,
  onResetSprint,
  onAssistantAction,
  onAddSmartTask,
  onUpdatePage,
}) {
  if (!insights) return null;
  const stats = insights.stats;
  const dueDelta = dateDeltaFromToday(page.dueDate);
  const completion = stats.todos ? Math.round((stats.done / stats.todos) * 100) : 0;
  const pressure = dueDelta === null
    ? 'No deadline'
    : dueDelta < 0
      ? `${Math.abs(dueDelta)}d late`
      : dueDelta === 0
        ? 'Due today'
        : `${dueDelta}d left`;

  return (
    <section className="page-command-center" aria-label="Page command center">
      <div className="command-center-head">
        <span className="command-center-kicker">
          <Command size={14} />
          Command center
        </span>
        <div className="command-center-status">
          <span>{insights.intent}</span>
          <strong>{insights.score}/100</strong>
        </div>
      </div>

      <div className="command-center-grid">
        <span>
          <small>Readiness</small>
          <strong>{insights.score}%</strong>
          <em>Nova score</em>
        </span>
        <span>
          <small>Tasks</small>
          <strong>{stats.done}/{stats.todos}</strong>
          <em>{completion}% done</em>
        </span>
        <span>
          <small>Pressure</small>
          <strong>{pressure}</strong>
          <em>{insights.dueText}</em>
        </span>
        <span>
          <small>Workspace</small>
          <strong>{workspaceStats.openTasks}</strong>
          <em>open tasks</em>
        </span>
      </div>

      <div className="command-center-focus">
        <div>
          <small>Next best move</small>
          <strong>{insights.bestMove}</strong>
        </div>
        <div className="sprint-timer" aria-label={`Focus sprint ${formatTimer(focusSprint.seconds)}`}>
          <Clock3 size={15} />
          <strong>{formatTimer(focusSprint.seconds)}</strong>
        </div>
      </div>

      <div className="command-center-actions">
        <button type="button" className="primary-action" onClick={() => onAssistantAction('mission')}>
          <Maximize2 size={15} />
          Mission
        </button>
        <button type="button" onClick={onToggleSprint}>
          <Clock3 size={15} />
          {focusSprint.running ? 'Pause' : 'Sprint'}
        </button>
        <button type="button" onClick={onResetSprint}>
          <Circle size={15} />
          Reset
        </button>
        <button type="button" onClick={onAddSmartTask}>
          <Plus size={15} />
          Smart task
        </button>
        <button type="button" onClick={() => onAssistantAction('cleanup')}>
          <CheckSquare size={15} />
          Cleanup
        </button>
        <button type="button" onClick={() => onAssistantAction('writerpack')}>
          <Quote size={15} />
          Writer
        </button>
      </div>

      <div className="command-center-quick-set">
        <span>Status</span>
        {['Draft', 'Active', 'Review', 'Done'].map((status) => (
          <button
            key={status}
            type="button"
            className={(page.status || 'Draft') === status ? 'active' : ''}
            onClick={() => onUpdatePage({ status })}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="command-center-quick-set">
        <span>Due</span>
        <button type="button" className={page.dueDate === todayDateValue() ? 'active' : ''} onClick={() => onUpdatePage({ dueDate: todayDateValue() })}>
          Today
        </button>
        <button type="button" className={page.dueDate === addDaysToDateValue(1) ? 'active' : ''} onClick={() => onUpdatePage({ dueDate: addDaysToDateValue(1) })}>
          Tomorrow
        </button>
        <button type="button" onClick={() => onUpdatePage({ dueDate: '' })}>
          Clear
        </button>
      </div>
    </section>
  );
}

function PageHeader({ page, onUpdatePage }) {
  const stats = getPageStats(page);
  const tags = page.tags ?? [];

  return (
    <header className="page-header">
      <div className="page-icon-row">
        <input
          className="page-icon-input"
          value={page.icon}
          maxLength={4}
          onChange={(event) => onUpdatePage({ icon: event.target.value || '📄' })}
          aria-label="Page icon"
        />
        <button
          type="button"
          className={`favorite-pill ${page.favorite ? 'is-favorite' : ''}`}
          onClick={() => onUpdatePage({ favorite: !page.favorite })}
        >
          <Star size={15} fill={page.favorite ? 'currentColor' : 'none'} />
          {page.favorite ? 'Favorited' : 'Favorite'}
        </button>
      </div>
      <input
        data-page-title
        className="page-title-input"
        value={page.title}
        onChange={(event) => onUpdatePage({ title: event.target.value })}
        placeholder="Untitled"
        aria-label="Page title"
      />
      <div className="page-meta">
        <span>
          <Hash size={14} />
          {page.section}
        </span>
        <span>
          <CalendarDays size={14} />
          {formatDueDate(getNoteDate(page))}
        </span>
        <span>
          <ListChecks size={14} />
          {page.status || 'Draft'}
        </span>
        <span>
          <Flag size={14} />
          {page.priority || 'Normal'}
        </span>
        {page.dueDate && (
          <span>
            <CalendarDays size={14} />
            Due {formatDueDate(page.dueDate)}
          </span>
        )}
        <span>
          <FileText size={14} />
          {page.blocks.length} blocks
        </span>
        <span>
          <Clock3 size={14} />
          {stats.readTime} min read
        </span>
      </div>
      {tags.length > 0 && (
        <div className="page-tags" aria-label="Page tags">
          {tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              <Tags size={13} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

function Block({
  block,
  isActive,
  slashState,
  setSlashState,
  onFocus,
  onUpdate,
  onEnter,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onApplyCommand,
}) {
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const showSlashMenu = slashState?.blockId === block.id;

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
    if (bodyRef.current && document.activeElement !== bodyRef.current) {
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  }, [block.text, block.body, block.open]);

  function handleChange(event) {
    const value = event.target.value;
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
    onUpdate({ text: value });

    const slashIndex = value.lastIndexOf('/');
    if (slashIndex >= 0 && value.slice(slashIndex).length <= 24) {
      setSlashState({ blockId: block.id, query: value.slice(slashIndex + 1).toLowerCase() });
    } else if (showSlashMenu) {
      setSlashState(null);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && showSlashMenu) {
      setSlashState(null);
      return;
    }

    if (showSlashMenu && event.key === 'Enter') {
      event.preventDefault();
      const command = getFilteredCommands(slashState.query)[0];
      if (command) onApplyCommand(block.id, command.type);
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey && block.type !== 'table') {
      event.preventDefault();
      onEnter();
    }

    if (event.key === 'Backspace' && !event.currentTarget.value) {
      event.preventDefault();
      onDelete();
    }
  }

  if (block.type === 'divider') {
    return (
      <div className={`block-row divider-row ${isActive ? 'active' : ''}`}>
        <button type="button" className="block-grip" title="Divider block" onClick={onFocus}>
          <Rows3 size={16} />
        </button>
        <hr />
        <BlockActions onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
      </div>
    );
  }

  if (block.type === 'table') {
    return (
      <div className={`block-row table-row ${isActive ? 'active' : ''}`} onFocus={onFocus}>
        <button type="button" className="block-grip" title="Table block">
          <Table2 size={16} />
        </button>
        <EditableTable block={block} onUpdate={onUpdate} />
        <BlockActions onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
      </div>
    );
  }

  if (block.type === 'date') {
    return (
      <div className={`block-row text-row ${isActive ? 'active' : ''} block-date`}>
        <button type="button" className="block-grip" title="Date block">
          <CalendarDays size={16} />
        </button>

        <div className="date-block-shell">
          <input
            type="date"
            className="date-block-input"
            value={block.date || todayDateValue()}
            onChange={(event) => onUpdate({ date: event.target.value })}
            onFocus={onFocus}
            aria-label="Date block date"
          />
          <div className="block-input-shell">
            <textarea
              ref={inputRef}
              data-block-input={block.id}
              value={block.text || ''}
              rows={1}
              className="block-input"
              placeholder={placeholderFor(block.type)}
              onChange={handleChange}
              onFocus={onFocus}
              onKeyDown={handleKeyDown}
              spellCheck="true"
            />
            {showSlashMenu && (
              <SlashMenu
                query={slashState.query}
                onPick={(type) => onApplyCommand(block.id, type)}
              />
            )}
          </div>
        </div>

        <BlockActions onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
      </div>
    );
  }

  if (block.type === 'toggle') {
    return (
      <div className={`block-row toggle-row ${isActive ? 'active' : ''}`}>
        <button
          type="button"
          className="block-grip"
          title="Toggle block"
          onClick={() => onUpdate({ open: !block.open })}
          aria-label={block.open ? 'Collapse toggle' : 'Expand toggle'}
        >
          {block.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="toggle-block-shell">
          <div className="block-input-shell toggle-title-shell">
            <textarea
              ref={inputRef}
              data-block-input={block.id}
              value={block.text || ''}
              rows={1}
              className="block-input toggle-title-input"
              placeholder="Toggle heading"
              onChange={handleChange}
              onFocus={onFocus}
              onKeyDown={handleKeyDown}
              spellCheck="true"
            />
            {showSlashMenu && (
              <SlashMenu
                query={slashState.query}
                onPick={(type) => onApplyCommand(block.id, type)}
              />
            )}
          </div>
          {block.open && (
            <textarea
              ref={bodyRef}
              value={block.body || ''}
              rows={2}
              className="toggle-body-input"
              placeholder="Hidden detail, notes, or checklist context"
              onChange={(event) => {
                event.target.style.height = 'auto';
                event.target.style.height = `${event.target.scrollHeight}px`;
                onUpdate({ body: event.target.value });
              }}
              onFocus={onFocus}
              spellCheck="true"
            />
          )}
        </div>

        <BlockActions onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
      </div>
    );
  }

  const Icon = getBlockIcon(block.type);

  return (
    <div className={`block-row text-row ${isActive ? 'active' : ''} block-${block.type}`}>
      <button type="button" className="block-grip" title={`${getBlockLabel(block.type)} block`}>
        <Icon size={16} />
      </button>

      {block.type === 'todo' && (
        <button
          type="button"
          className={`todo-check ${block.checked ? 'checked' : ''}`}
          onClick={() => onUpdate({ checked: !block.checked })}
          aria-label={block.checked ? 'Mark incomplete' : 'Mark complete'}
        >
          {block.checked ? <CheckSquare size={17} /> : <Circle size={17} />}
        </button>
      )}

      <div className="block-input-shell">
        <textarea
          ref={inputRef}
          data-block-input={block.id}
          value={block.text || ''}
          rows={1}
          className="block-input"
          placeholder={placeholderFor(block.type)}
          onChange={handleChange}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          spellCheck="true"
        />
        {showSlashMenu && (
          <SlashMenu
            query={slashState.query}
            onPick={(type) => onApplyCommand(block.id, type)}
          />
        )}
      </div>

      <BlockActions onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
    </div>
  );
}

function BlockActions({ onDuplicate, onMoveUp, onMoveDown, onDelete }) {
  return (
    <span className="block-actions" aria-label="Block actions">
      <button type="button" className="block-action" title="Move block up" aria-label="Move block up" onClick={onMoveUp}>
        <ChevronUp size={14} />
      </button>
      <button type="button" className="block-action" title="Move block down" aria-label="Move block down" onClick={onMoveDown}>
        <ChevronDown size={14} />
      </button>
      <button type="button" className="block-action" title="Duplicate block" aria-label="Duplicate block" onClick={onDuplicate}>
        <Copy size={14} />
      </button>
      <button type="button" className="block-action danger" title="Remove block" aria-label="Remove block" onClick={onDelete}>
        <Trash2 size={14} />
      </button>
    </span>
  );
}

function EditableTable({ block, onUpdate }) {
  function updateCell(rowIndex, columnIndex, value) {
    const rows = block.rows.map((row, index) =>
      index === rowIndex ? row.map((cell, cellIndex) => (cellIndex === columnIndex ? value : cell)) : row,
    );
    onUpdate({ rows });
  }

  function addRow() {
    onUpdate({ rows: [...block.rows, block.columns.map(() => '')] });
  }

  return (
    <div className="table-block">
      <table>
        <thead>
          <tr>
            {block.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${block.id}-${rowIndex}`}>
              {row.map((cell, columnIndex) => (
                <td key={`${block.id}-${rowIndex}-${columnIndex}`}>
                  <input
                    value={cell}
                    onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                    aria-label={`${block.columns[columnIndex]} row ${rowIndex + 1}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="table-add-row" onClick={addRow}>
        <Plus size={15} />
        Row
      </button>
    </div>
  );
}

function SlashMenu({ query, onPick }) {
  const commands = getFilteredCommands(query);

  return (
    <div className="slash-menu" role="menu">
      {commands.length === 0 ? (
        <div className="slash-empty">No blocks found</div>
      ) : (
        commandGroups.map((group) => {
          const items = group.items.filter((item) => commands.includes(item));
          if (!items.length) return null;
          return (
            <div className="slash-group" key={group.label}>
              <div className="slash-group-label">{group.label}</div>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.type} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onPick(item.type)}>
                    <span className="slash-icon">
                      <Icon size={17} />
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

function getFilteredCommands(query = '') {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return allCommands;
  return allCommands.filter((item) => `${item.label} ${item.hint} ${item.type}`.toLowerCase().includes(trimmed));
}

function getBlockIcon(type) {
  const command = allCommands.find((item) => item.type === type);
  return command?.icon ?? Type;
}

function getBlockLabel(type) {
  const command = allCommands.find((item) => item.type === type);
  return command?.label ?? 'Text';
}

function placeholderFor(type) {
  if (type === 'heading1') return 'Heading 1';
  if (type === 'heading2') return 'Heading 2';
  if (type === 'todo') return 'To-do';
  if (type === 'quote') return 'Quote';
  if (type === 'callout') return 'Callout';
  if (type === 'toggle') return 'Toggle heading';
  if (type === 'date') return 'Add a note for this date';
  if (type === 'code') return 'Paste code or a command';
  return "Type '/' for commands";
}

function AssistantPanel({ page, pages, onRunAction, onUpdatePage, onSelectPage }) {
  const insights = getAssistantInsights(page, pages);
  const tags = page.tags ?? [];
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [assistantMode, setAssistantMode] = useState('coach');
  const scoreLabel = insights.score >= 78 ? 'Sharp' : insights.score >= 52 ? 'Building' : 'Needs shape';
  const signalCards = [
    { label: 'Mode', value: insights.intent, icon: LayoutGrid },
    { label: 'Tasks', value: insights.taskText, icon: CheckSquare },
    { label: 'Due', value: insights.dueText, icon: CalendarDays },
  ];

  useEffect(() => {
    setQuestion('');
    setAnswer('');
  }, [page.id]);

  function addTag(tag) {
    onUpdatePage({ tags: [...new Set([...tags, tag])].slice(0, 8) });
  }

  function runQuestion(nextQuestion = question) {
    setAnswer(frameAssistantAnswer(answerAssistantQuestion(page, nextQuestion, insights), assistantMode, insights));
  }

  function askAssistant(event) {
    event.preventDefault();
    runQuestion();
  }

  function usePrompt(prompt) {
    setQuestion(prompt);
    runQuestion(prompt);
  }

  return (
    <section className="inspector-panel compact-panel assistant-panel">
      <div className="panel-heading">
        <span>Nova AI</span>
        <Star size={15} />
      </div>
      <div className="assistant-overview">
        <div className="assistant-score-card" aria-label={`Assistant score ${insights.score}`}>
          <strong>{insights.score}</strong>
          <span>{scoreLabel}</span>
        </div>
        <div className="assistant-summary">
          <strong>{insights.signal}</strong>
          <p>{insights.summary}</p>
        </div>
      </div>
      <div className="assistant-score" aria-hidden="true">
        <span style={{ width: `${insights.score}%` }} />
      </div>
      <div className="assistant-signal-grid">
        {signalCards.map((item) => {
          const Icon = item.icon;
          return (
            <span key={item.label} className="assistant-signal">
              <Icon size={13} />
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </span>
          );
        })}
      </div>
      <div className="assistant-mode" role="tablist" aria-label="Assistant mode">
        {assistantModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              className={assistantMode === mode.id ? 'active' : ''}
              onClick={() => setAssistantMode(mode.id)}
              role="tab"
              aria-selected={assistantMode === mode.id}
            >
              <Icon size={13} />
              {mode.label}
            </button>
          );
        })}
      </div>
      <div className="assistant-next-move">
        <small>Best next move</small>
        <strong>{insights.bestMove}</strong>
      </div>
      <div className="assistant-recommendations">
        <span>
          <small>Suggested title</small>
          <strong>{insights.suggestedTitle}</strong>
        </span>
        <span>
          <small>Properties</small>
          <strong>{insights.metadata.status} / {insights.metadata.priority}</strong>
        </span>
      </div>
      <div className="assistant-power-tools" aria-label="Assistant power tools">
        {assistantPowerTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button key={tool.id} type="button" onClick={() => onRunAction(tool.id)}>
              <Icon size={15} />
              <span>
                <strong>{tool.label}</strong>
                <small>{tool.hint}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="assistant-actions" aria-label="Assistant actions">
        <button type="button" className="primary-action" onClick={() => onRunAction('brief')}>
          <FileText size={15} />
          Brief
        </button>
        <button type="button" onClick={() => onRunAction('status')}>
          <FileText size={15} />
          Status
        </button>
        <button type="button" onClick={() => onRunAction('risks')}>
          <Flag size={15} />
          Risks
        </button>
        <button type="button" onClick={() => onRunAction('priority')}>
          <SlidersHorizontal size={15} />
          Priority
        </button>
        <button type="button" onClick={() => onRunAction('focus')}>
          <Clock3 size={15} />
          Focus
        </button>
        <button type="button" onClick={() => onRunAction('handoff')}>
          <FileUp size={15} />
          Handoff
        </button>
        <button type="button" onClick={() => onRunAction('quality')}>
          <CheckSquare size={15} />
          Quality
        </button>
        <button type="button" onClick={() => onRunAction('workspace')}>
          <Home size={15} />
          Workspace
        </button>
        <button type="button" onClick={() => onRunAction('okr')}>
          <Circle size={15} />
          OKR
        </button>
        <button type="button" onClick={() => onRunAction('knowledge')}>
          <BookOpen size={15} />
          FAQ
        </button>
        <button type="button" onClick={() => onRunAction('automate')}>
          <Command size={15} />
          Auto
        </button>
        <button type="button" onClick={() => onRunAction('summary')}>
          <FileText size={15} />
          Summary
        </button>
        <button type="button" onClick={() => onRunAction('plan')}>
          <ListChecks size={15} />
          Plan
        </button>
        <button type="button" onClick={() => onRunAction('points')}>
          <Star size={15} />
          Points
        </button>
        <button type="button" onClick={() => onRunAction('polish')}>
          <Quote size={15} />
          Polish
        </button>
        <button type="button" onClick={() => onRunAction('decision')}>
          <Circle size={15} />
          Decide
        </button>
        <button type="button" onClick={() => onRunAction('agenda')}>
          <BookOpen size={15} />
          Agenda
        </button>
        <button type="button" onClick={() => onRunAction('timeline')}>
          <CalendarDays size={15} />
          Timeline
        </button>
        <button type="button" onClick={() => onRunAction('study')}>
          <Table2 size={15} />
          Study
        </button>
        <button type="button" onClick={() => onRunAction('outline')}>
          <Hash size={15} />
          Outline
        </button>
        <button type="button" onClick={() => onRunAction('title')}>
          <Type size={15} />
          Title
        </button>
        <button type="button" onClick={() => onRunAction('metadata')}>
          <SlidersHorizontal size={15} />
          Props
        </button>
        <button type="button" onClick={() => onRunAction('questions')}>
          <MessageSquareText size={15} />
          Questions
        </button>
        <button type="button" onClick={() => onRunAction('sweep')}>
          <CheckSquare size={15} />
          Sweep
        </button>
        <button type="button" onClick={() => onRunAction('related')} disabled={!insights.relatedPages.length}>
          <Archive size={15} />
          Related
        </button>
        <button type="button" onClick={() => onRunAction('review')}>
          <MessageSquareText size={15} />
          Review
        </button>
        <button type="button" onClick={() => onRunAction('tags')} disabled={!insights.suggestedTags.length}>
          <Tags size={15} />
          Tags
        </button>
      </div>
      <form className="assistant-chat" onSubmit={askAssistant}>
        <div className="assistant-chat-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                runQuestion(event.currentTarget.value);
              }
            }}
            placeholder="Ask about this page"
            aria-label="Ask Nova AI"
          />
          <button type="submit">
            <MessageSquareText size={14} />
          </button>
        </div>
        <div className="assistant-prompts">
          {insights.quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => usePrompt(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
        {answer && (
          <div className="assistant-answer-card">
            <p className="assistant-answer">{answer}</p>
            <div className="assistant-answer-actions">
              <button type="button" onClick={() => onRunAction('answer', answer)}>
                <Plus size={13} />
                Insert
              </button>
              <button type="button" onClick={() => setAnswer('')}>
                <X size={13} />
                Clear
              </button>
            </div>
          </div>
        )}
      </form>
      <div className="assistant-points" aria-label="Assistant key points">
        {insights.keyPoints.slice(0, 3).map((point) => (
          <span key={point}>{point}</span>
        ))}
      </div>
      {insights.relatedPages.length > 0 && (
        <div className="assistant-related" aria-label="Assistant related pages">
          {insights.relatedPages.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelectPage?.(item.id)}>
              <strong>{item.icon} {item.title}</strong>
              <small>{item.reason}</small>
            </button>
          ))}
        </div>
      )}
      <div className="assistant-suggestions">
        {insights.nextActions.map((action) => (
          <span key={action}>
            <CheckSquare size={13} />
            {action}
          </span>
        ))}
      </div>
      {insights.suggestedTags.length > 0 && (
        <div className="assistant-tags" aria-label="Suggested tags">
          {insights.suggestedTags.map((tag) => (
            <button key={tag} type="button" onClick={() => addTag(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Inspector({ page, pages, onUpdatePage, onInsertBlock, onFocusBlock, onAssistantAction, onSelectPage }) {
  const done = page.blocks.filter((block) => block.type === 'todo' && block.checked).length;
  const todos = page.blocks.filter((block) => block.type === 'todo').length;
  const progress = todos ? Math.round((done / todos) * 100) : 0;
  const stats = getPageStats(page);
  const tagText = (page.tags ?? []).join(', ');
  const outlineItems = getOutlineItems(page);
  const healthItems = getPageHealth(page);

  return (
    <aside className="inspector" aria-label="Page tools">
      <AssistantPanel page={page} pages={pages} onRunAction={onAssistantAction} onUpdatePage={onUpdatePage} onSelectPage={onSelectPage} />

      <section className="inspector-panel compact-panel">
        <div className="panel-heading">
          <span>Properties</span>
          <Hash size={15} />
        </div>
        <label className="property-field">
          <span>Section</span>
          <select value={page.section} onChange={(event) => onUpdatePage({ section: event.target.value })}>
            <option>Private</option>
            <option>Teamspace</option>
            <option>Archive</option>
            <option>Shared</option>
          </select>
        </label>
        <label className="property-field">
          <span>Note date</span>
          <input
            type="date"
            value={getNoteDate(page)}
            onChange={(event) => onUpdatePage({ noteDate: event.target.value })}
          />
        </label>
        <label className="property-field">
          <span>Status</span>
          <select value={page.status || 'Draft'} onChange={(event) => onUpdatePage({ status: event.target.value })}>
            <option>Draft</option>
            <option>Active</option>
            <option>In progress</option>
            <option>Review</option>
            <option>Done</option>
          </select>
        </label>
        <label className="property-field">
          <span>Priority</span>
          <select value={page.priority || 'Normal'} onChange={(event) => onUpdatePage({ priority: event.target.value })}>
            {priorityOptions.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
        <label className="property-field">
          <span>Due date</span>
          <input
            type="date"
            value={page.dueDate || ''}
            onChange={(event) => onUpdatePage({ dueDate: event.target.value })}
          />
        </label>
        <label className="property-field">
          <span>Icon</span>
          <input value={page.icon} maxLength={4} onChange={(event) => onUpdatePage({ icon: event.target.value || '📄' })} />
        </label>
        <label className="property-field">
          <span>Tags</span>
          <input
            key={page.id}
            defaultValue={tagText}
            placeholder="design, launch"
            onBlur={(event) => onUpdatePage({ tags: parseTags(event.target.value) })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
        </label>
      </section>

      <section className="inspector-panel compact-panel">
        <div className="panel-heading">
          <span>Progress</span>
          <ListChecks size={15} />
        </div>
        <div className="progress-meter" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>{todos ? `${done} of ${todos} tasks complete` : 'No tasks on this page yet'}</p>
      </section>

      <section className="inspector-panel compact-panel health-panel">
        <div className="panel-heading">
          <span>Page health</span>
          <Clock3 size={15} />
        </div>
        <div className="health-list">
          {healthItems.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.label} className={`health-chip ${item.tone}`}>
                <Icon size={14} />
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            );
          })}
        </div>
      </section>

      <section className="inspector-panel compact-panel outline-panel">
        <div className="panel-heading">
          <span>Outline</span>
          <Hash size={15} />
        </div>
        {outlineItems.length > 0 ? (
          <div className="outline-list">
            {outlineItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`outline-link level-${item.level}`}
                  onClick={() => onFocusBlock(item.id)}
                  title={item.label}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p>Add headings or Date blocks to build an outline.</p>
        )}
      </section>

      <section className="inspector-panel compact-panel">
        <div className="panel-heading">
          <span>Insights</span>
          <FileText size={15} />
        </div>
        <div className="stats-grid">
          <span>
            <strong>{stats.words}</strong>
            Words
          </span>
          <span>
            <strong>{stats.readTime}</strong>
            Min read
          </span>
          <span>
            <strong>{stats.done}/{stats.todos}</strong>
            Tasks
          </span>
          <span>
            <strong>{stats.dates}</strong>
            Dates
          </span>
        </div>
      </section>

      <section className="inspector-panel compact-panel insert-panel">
        <div className="panel-heading">
          <span>Add blocks</span>
          <Plus size={15} />
        </div>
        <div className="insert-grid">
          {allCommands.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.type} type="button" title={item.label} onClick={() => onInsertBlock(item.type)}>
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

    </aside>
  );
}

function parseTags(value) {
  return [...new Set(
    value
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean)
      .slice(0, 8),
  )];
}
