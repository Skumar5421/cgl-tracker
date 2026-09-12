/**
 * Mission CGL 2027 & Railway Tracker
 * Pure Vanilla JavaScript Application Engine
 * 
 * Features:
 * 1. Aspirant Command Center Homepage:
 *    - Main "Total Hours Today" circular SVG display
 *    - Compact "Subject-wise Hours Breakdown" summary card
 *    - Dedicated "Weak Areas" card (populated from Mock PDF analysis)
 *    - "Break & Inactivity Tracker" card (today vs. yesterday comparison)
 *    - Dynamic Accountability Quote Box (comparison-aware + rotates every 2h)
 * 2. Crucial Auto Subject-to-Break Switching Logic:
 *    - Stopping/Pausing any subject stopwatch immediately starts Break Timer
 *    - Starting any subject stopwatch automatically pauses Break Timer, adds duration to today's break, and saves to localStorage
 * 3. Habit Tracker & Customization:
 *    - Input field & "+ Add Habit" button for custom daily disciplines
 *    - Linked to streak engine & calendar green dots
 *    - Edit & delete capabilities
 * 4. Gamification & Bug-Free Reward Modal Fix:
 *    - Calendar view tracking green dots for successful days
 *    - Streak engine (7, 15, 30, 45, 60 days treasure chest unlocks)
 *    - Guaranteed bug-free modal close (Close ×, action button, overlay click, Esc key)
 * 5. Edit & Reset Controls Everywhere:
 *    - Edit subject time, break time, habit titles, history logs, weak areas
 *    - Sectional reset buttons & Master Factory Reset
 * 6. 5:00 AM Automatic Reset Engine & Mozilla PDF.js Mock Scorecard Analyzer
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CONSTANTS & INITIAL DATA
  // ==========================================================================

  const STORAGE_KEY = 'MISSION_CGL_2027_TRACKER_V4';
  const WEEKLY_TASKS_STORAGE_KEY = 'cgl_weekly_tasks';

  // --- FIREBASE AUTHENTICATION & FIRESTORE CLOUD CONFIGURATION ---
  const FIREBASE_CONFIG = {
    projectId: "trusty-province-nvxch",
    appId: "1:1033535223289:web:30796821a315ab5e13b928",
    apiKey: "AIzaSyChqbDFD-Ykg0Xov73Du358ph4UinnK4VM",
    authDomain: "trusty-province-nvxch.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-ssccgl2027railwa-e9a1048a-ded4-4ad7-a7f7-d97e4ad16b4a",
    storageBucket: "trusty-province-nvxch.firebasestorage.app",
    messagingSenderId: "1033535223289"
  };

  let firebaseAuth = null;
  let firestoreDb = null;
  let currentUser = null;
  let cloudSyncTimeout = null;
  let isSyncingToCloud = false;
  let lastCloudSyncTimestamp = null;
  let cloudQuotaExceeded = false;

  // 25+ Hard-Hitting Strict Anti-Procrastination Quotes
  const DISCIPLINE_QUOTES = [
    {
      quote: "35 Lakh applicants registered for SSC CGL. Only 8,000 will get a 4600 Grade Pay desk in New Delhi. While you hesitate at 5:00 AM, someone in a small town library has already solved 50 trigonometry questions.",
      context: "Rule of 35 Lakh Aspirants • Brahma Muhurta 5 AM"
    },
    {
      quote: "Brahma Muhurta (5:00 AM) is not a suggestion; it is the only quiet window before the noise of the world steals your focus. If you can't conquer your warm blanket, don't dream of conquering Tier 2.",
      context: "Early Morning Sacrifice • 5:00 AM Standard"
    },
    {
      quote: "The Railway NTPC exam had 1.25 Crore candidates for 35,000 posts. That is a 0.28% acceptance rate. If you skip General Awareness today, you are actively choosing rejection.",
      context: "Railway Recruitment Board Reality Check"
    },
    {
      quote: "Maths speed is not born from luck; it is forged by solving 320 questions every single day until percentage calculations happen in your subconscious without pen and paper.",
      context: "320 Questions Daily Mission • Quantitative Aptitude"
    },
    {
      quote: "Your parents tell their friends you are preparing for a Central Government officer post. Don't turn their pride into an apology. Sit down and start the stopwatch.",
      context: "Accountability & Family Sacrifice"
    },
    {
      quote: "A mock test score of 120 means nothing when cutoffs hover above 145+. Every silly calculation error you ignore today will cost you 2.5 negative marks on exam day.",
      context: "Mock Diagnostic Reality • Tier 1 Normalization"
    },
    {
      quote: "Motivation is an illusion invented by amateurs. High-ranking ASOs and Inspectors didn't feel inspired every morning—they sat down and worked because quitting was not an option.",
      context: "Discipline > Fleeting Motivation"
    },
    {
      quote: "When you scroll on social media, remember your direct competitor is revising Modern History dates and Vocab flashcards. The exam paper will show no mercy.",
      context: "The Competitive Cutoff Law"
    },
    {
      quote: "Consistency beats genius. The aspirant who studies 8 honest hours every day will crush the one who studies 14 hours once a week and sleeps for the next three days.",
      context: "Pacing & Endurance Strategy"
    },
    {
      quote: "Excise Inspector, CSS ASO, MEA Desk, Income Tax Inspector. These seats don't belong to who wanted it more—they belong to who solved more questions with precision under pressure.",
      context: "4600 Grade Pay Aspiration"
    },
    {
      quote: "Do not fool yourself with passive video watching. Staring at someone else solve questions on YouTube is entertainment, not preparation. Pick up the rough sheet and solve.",
      context: "Active Recall vs Passive Illusion"
    },
    {
      quote: "Sleep when your target is dead. If today's 320 questions are unfinished, your night has not started yet.",
      context: "Target Fulfillment Law"
    }
  ];

  // Milestone Feature Ideas Unlocked at Specific Streaks
  const MILESTONES = [
    {
      streak: 7,
      title: "Night Owl Obsidian Dark Mode & Ambient Audio",
      desc: "Unlocked at 7 Days: Specialized high-contrast obsidian focus theme with binaural alpha wave focus ambience.",
      icon: "🥉"
    },
    {
      streak: 15,
      title: "Pomodoro Interval Cycles & Lo-Fi Focus Synthesizer",
      desc: "Unlocked at 15 Days: Procedural 50/10 intense focus sprints with procedural rain and train track ambience.",
      icon: "🥈"
    },
    {
      streak: 30,
      title: "Custom Spaced Repetition Flashcard Engine",
      desc: "Unlocked at 30 Days: Automated weakness topic flashcard system with Leitner active recall intervals.",
      icon: "🥇"
    },
    {
      streak: 45,
      title: "Audio Reality-Check Mentor Alerts",
      desc: "Unlocked at 45 Days: Procedural voice-check alerts prompting you when inactive for over 45 minutes.",
      icon: "💎"
    },
    {
      streak: 60,
      title: "SSC CGL 2027 Rank Predictor & Cutoff Simulator",
      desc: "Unlocked at 60 Days: Advanced statistical normalization model estimating your raw score vs projected 4600 GP cutoffs.",
      icon: "👑"
    }
  ];

  // Default Core Subjects
  const DEFAULT_SUBJECTS = [
    { id: 'maths', name: 'Mathematics (Quantitative Aptitude)', shortName: 'Maths', icon: '📐', color: 'emerald', seconds: 0, isRunning: false, isDefault: true },
    { id: 'english', name: 'English Language & Comprehension', shortName: 'English', icon: '📖', color: 'sky', seconds: 0, isRunning: false, isDefault: true },
    { id: 'reasoning', name: 'Reasoning & General Intelligence', shortName: 'Reasoning', icon: '🧩', color: 'violet', seconds: 0, isRunning: false, isDefault: true },
    { id: 'ga', name: 'General Awareness (GK & GS)', shortName: 'General Awareness', icon: '🏛️', color: 'amber', seconds: 0, isRunning: false, isDefault: true },
    { id: 'mocks', name: 'Full Mock & Sectional Analysis', shortName: 'Mock Tests', icon: '📊', color: 'rose', seconds: 0, isRunning: false, isDefault: true }
  ];

  // Default Daily Habits
  const DEFAULT_HABITS = [
    { id: 'h1', title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: false },
    { id: 'h2', title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: false },
    { id: 'h3', title: '320 Daily Maths Questions Mission', completed: false },
    { id: 'h4', title: 'GS Static GK Revision (Polity / History / Science)', completed: false },
    { id: 'h5', title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: false }
  ];

  // Default Initial Weak Areas
  const DEFAULT_WEAK_AREAS = [
    {
      id: 'w1',
      subject: 'Maths',
      topic: 'Geometry: Tangents, Incircle & Circumcircle Theorems',
      advice: 'Solve 60 PYQ theorems without looking at answer keys. Focus on time per question.',
      resolved: false
    },
    {
      id: 'w2',
      subject: 'English',
      topic: 'Active/Passive Voice & Direct/Indirect Speech Exceptions',
      advice: 'Revise tense conversion tables and solve 40 high-difficulty sentences.',
      resolved: false
    },
    {
      id: 'w3',
      subject: 'Reasoning',
      topic: 'Matrix Coding & Missing Number Puzzles (Pacing Deficit)',
      advice: 'Time cap each puzzle to 45 seconds. Skip immediately if pattern is elusive.',
      resolved: false
    },
    {
      id: 'w4',
      subject: 'GA',
      topic: 'Constitutional Articles & Amendments (Articles 12-51A)',
      advice: 'Write Fundamental Rights and DPSPs from memory on blank paper.',
      resolved: false
    }
  ];

  // Default Spaced Repetition Chapters
  function getDefaultChapters() {
    const todayStr = getStudyCycleDate(new Date());
    const d = new Date();
    const subDays = (days) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() - days);
      return getStudyCycleDate(copy);
    };

    return [
      { id: 'c1', subject: 'Maths', title: 'Number System & Divisibility Rules', lastRevised: subDays(1), revisionCount: 4 },
      { id: 'c2', subject: 'Maths', title: 'Trigonometry Maxima & Minima', lastRevised: subDays(5), revisionCount: 2 },
      { id: 'c3', subject: 'Maths', title: 'Algebra Polynomial Identities', lastRevised: subDays(8), revisionCount: 1 },
      { id: 'c4', subject: 'English', title: 'Subject-Verb Agreement Rules', lastRevised: subDays(0), revisionCount: 5 },
      { id: 'c5', subject: 'English', title: 'Idioms & One-Word Substitution (1-200)', lastRevised: subDays(4), revisionCount: 3 },
      { id: 'c6', subject: 'English', title: 'Reading Comprehension Speed Drills', lastRevised: subDays(9), revisionCount: 2 },
      { id: 'c7', subject: 'Reasoning', title: 'Syllogism (Possibility Cases & Venn)', lastRevised: subDays(2), revisionCount: 3 },
      { id: 'c8', subject: 'Reasoning', title: 'Blood Relations Coded Family Trees', lastRevised: subDays(7), revisionCount: 1 },
      { id: 'c9', subject: 'GA', title: 'Indian National Movement (1885-1947)', lastRevised: subDays(1), revisionCount: 4 },
      { id: 'c10', subject: 'GA', title: 'River Basins & Himalayan Geography', lastRevised: subDays(11), revisionCount: 1 }
    ];
  }

  // ==========================================================================
  // 2. HELPER FUNCTIONS: DATE, TIME & 5:00 AM CYCLE BOUNDARIES
  // ==========================================================================

  // Returns YYYY-MM-DD for the active study cycle (day shifts at 5:00 AM)
  function getStudyCycleDate(dateObj = new Date()) {
    const d = new Date(dateObj);
    if (d.getHours() < 5) {
      d.setDate(d.getDate() - 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format YYYY-MM-DD or ISO date string to human-readable date (e.g., "Sep 11, 2026")
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = String(dateStr).split('T')[0].split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dObj = new Date(y, m, d);
        if (!isNaN(dObj.getTime())) {
          return dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      console.warn('Date formatting error:', e);
    }
    return String(dateStr);
  }

  // ==========================================================================
  // WEEKLY & MONTHLY CALENDAR SYNCHRONIZATION HELPERS
  // ==========================================================================

  // Returns the Monday (YYYY-MM-DD) for any given date string or Date object
  function getMondayOfWeek(inputDate = new Date()) {
    let d;
    if (typeof inputDate === 'string') {
      const parts = inputDate.split('T')[0].split('-');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(inputDate);
      }
    } else {
      d = new Date(inputDate);
    }
    if (isNaN(d.getTime())) d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayStr = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }

  // Returns Month key (YYYY-MM) for any given date string or Date object
  function getMonthKey(inputDate = new Date()) {
    let d;
    if (typeof inputDate === 'string') {
      const parts = inputDate.split('T')[0].split('-');
      if (parts.length >= 2) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      } else {
        d = new Date(inputDate);
      }
    } else {
      d = new Date(inputDate);
    }
    if (isNaN(d.getTime())) d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Formats YYYY-MM to human display (e.g., "September 2026")
  function formatMonthDisplay(monthKey) {
    if (!monthKey) return '';
    try {
      const parts = monthKey.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = new Date(y, m, 1);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    } catch (e) {
      console.warn('Month format error:', e);
    }
    return String(monthKey);
  }

  // Shifts a Monday string by offset weeks (+1 or -1)
  function shiftWeek(mondayStr, offsetWeeks = 1) {
    if (!mondayStr) mondayStr = getMondayOfWeek(getStudyCycleDate());
    const parts = mondayStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d + (offsetWeeks * 7));
    return getMondayOfWeek(dt);
  }

  // Shifts a Month key by offset months (+1 or -1)
  function shiftMonth(monthKey, offsetMonths = 1) {
    if (!monthKey) monthKey = getMonthKey(getStudyCycleDate());
    const parts = monthKey.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const dt = new Date(y, m + offsetMonths, 1);
    return getMonthKey(dt);
  }

  // Returns array of 7 day descriptors (Monday through Sunday) for a week
  function getDaysOfWeek(mondayStr) {
    if (!mondayStr) mondayStr = getMondayOfWeek(getStudyCycleDate());
    const parts = mondayStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = [];
    const todayStr = getStudyCycleDate();

    for (let i = 0; i < 7; i++) {
      const dt = new Date(y, m, d + i);
      const currYear = dt.getFullYear();
      const currMonth = String(dt.getMonth() + 1).padStart(2, '0');
      const currDay = String(dt.getDate()).padStart(2, '0');
      const dateStr = `${currYear}-${currMonth}-${currDay}`;

      days.push({
        date: dateStr,
        dayName: dayNames[i],
        shortName: dayNames[i].substring(0, 3),
        displayDate: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: dateStr === todayStr
      });
    }
    return days;
  }

  // Format seconds to hh:mm:ss
  function formatHMS(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  // Format seconds to compact mm:ss or hh:mm:ss
  function formatMS(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  function getDaysAgo(dateStr) {
    if (!dateStr) return 999;
    const today = new Date(getStudyCycleDate());
    const past = new Date(dateStr);
    const diffTime = today.getTime() - past.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Play subtle feedback chime
  function playChime(type = 'start') {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'pause' || type === 'break') {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(440.00, audioCtx.currentTime + 0.18); // A4
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'reward') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3);
          o.start(audioCtx.currentTime + i * 0.1);
          o.stop(audioCtx.currentTime + i * 0.1 + 0.3);
        });
      }
    } catch (e) {
      // AudioContext policy safe fallback
    }
  }

  function getPastCycleDate(daysAgo) {
    const cycleDateStr = getStudyCycleDate();
    const d = new Date(cycleDateStr + 'T12:00:00');
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getFutureCycleDate(daysAhead) {
    const cycleDateStr = getStudyCycleDate();
    const d = new Date(cycleDateStr + 'T12:00:00');
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getNextSundayDate() {
    const today = new Date(getStudyCycleDate() + 'T12:00:00');
    const dayOfWeek = today.getDay(); // 0 is Sunday
    let daysUntilSunday = (7 - dayOfWeek) % 7;
    if (daysUntilSunday === 0) daysUntilSunday = 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    const y = nextSunday.getFullYear();
    const m = String(nextSunday.getMonth() + 1).padStart(2, '0');
    const day = String(nextSunday.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDayOfWeekShort(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch(e) {
      return '';
    }
  }

  function formatMonthDayShort(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch(e) {
      return dateStr;
    }
  }

  // Default Seed Data for Daily Targets & Revision Hub
  function getDefaultDateTargets() {
    const today = getStudyCycleDate();
    const yesterday = getPastCycleDate(1);
    const twoDaysAgo = getPastCycleDate(2);
    const threeDaysAgo = getPastCycleDate(3);
    const tomorrow = getFutureCycleDate(1);
    const upcomingSunday = getNextSundayDate();

    const targets = {};

    targets[threeDaysAgo] = {
      mathsDone: 310,
      mathsTarget: 320,
      mathsCompleted: false,
      tasks: [
        { id: 'dt_3_1', title: 'Mensuration 2D & 3D formulas & 60 PYQs', subject: 'Maths', targetQty: '60 Qs', priority: 'high', status: 'completed', createdAt: threeDaysAgo },
        { id: 'dt_3_2', title: 'English Reading Comprehension 4 Passages Drill', subject: 'English', targetQty: '4 Passages', priority: 'normal', status: 'completed', createdAt: threeDaysAgo },
        { id: 'dt_3_3', title: 'Syllogism Only-a-few cases 50 speed questions', subject: 'Reasoning', targetQty: '50 Qs', priority: 'normal', status: 'completed', createdAt: threeDaysAgo }
      ]
    };

    targets[twoDaysAgo] = {
      mathsDone: 320,
      mathsTarget: 320,
      mathsCompleted: true,
      tasks: [
        { id: 'dt_2_1', title: 'Trigonometry Maxima & Minima 80 Questions', subject: 'Maths', targetQty: '80 Qs', priority: 'high', status: 'completed', createdAt: twoDaysAgo },
        { id: 'dt_2_2', title: 'Direct & Indirect Speech Narration Rules Drill', subject: 'English', targetQty: '50 Qs', priority: 'normal', status: 'completed', createdAt: twoDaysAgo },
        { id: 'dt_2_3', title: 'Modern History 1857-1947 Viceroy Timeline Revise', subject: 'GA', targetQty: '2 Hrs', priority: 'normal', status: 'completed', createdAt: twoDaysAgo }
      ]
    };

    targets[yesterday] = {
      mathsDone: 320,
      mathsTarget: 320,
      mathsCompleted: true,
      tasks: [
        { id: 'dt_1_1', title: 'Geometry Circles & Tangent Theorem 80 PYQs', subject: 'Maths', targetQty: '80 Qs', priority: 'high', status: 'completed', createdAt: yesterday },
        { id: 'dt_1_2', title: 'Full Length Tier-1 Mock 3 & Detailed Analysis', subject: 'Mock Test', targetQty: '1 Mock + 1.5h Review', priority: 'high', status: 'completed', createdAt: yesterday },
        { id: 'dt_1_3', title: '100 High-Frequency Blackbook Vocab Flashcards', subject: 'English', targetQty: '100 Words', priority: 'normal', status: 'completed', createdAt: yesterday },
        { id: 'dt_1_4', title: 'Coded Blood Relations Speed Practice', subject: 'Reasoning', targetQty: '40 Qs', priority: 'low', status: 'completed', createdAt: yesterday }
      ]
    };

    targets[today] = {
      mathsDone: 0,
      mathsTarget: 320,
      mathsCompleted: false,
      tasks: [
        { id: 'dt_0_1', title: 'Solve 320 Maths questions (Arithmetic + Advanced)', subject: 'Maths', targetQty: '320 Qs', priority: 'high', status: 'inprogress', createdAt: today },
        { id: 'dt_0_2', title: 'Subject-Verb Agreement Inversion Rules Revision (R1)', subject: 'English', targetQty: '40 Qs', priority: 'high', status: 'pending', createdAt: today },
        { id: 'dt_0_3', title: 'Articles 12-51A Polity Fundamental Rights active recall', subject: 'GA', targetQty: '1.5 Hrs', priority: 'normal', status: 'pending', createdAt: today },
        { id: 'dt_0_4', title: 'Coding-Decoding Pattern Matrix Drills', subject: 'Reasoning', targetQty: '50 Qs', priority: 'normal', status: 'pending', createdAt: today }
      ]
    };

    targets[tomorrow] = {
      mathsDone: 0,
      mathsTarget: 320,
      mathsCompleted: false,
      tasks: [
        { id: 'dt_f1_1', title: 'Time, Speed & Distance Relative Speed Trains 80 Qs', subject: 'Maths', targetQty: '80 Qs', priority: 'high', status: 'pending', createdAt: tomorrow },
        { id: 'dt_f1_2', title: 'Active/Passive Voice Imperative Sentences Spaced Revise (R3)', subject: 'English', targetQty: '50 Qs', priority: 'normal', status: 'pending', createdAt: tomorrow },
        { id: 'dt_f1_3', title: 'Ancient History Indus Valley & Vedic Era Short Notes', subject: 'GA', targetQty: '2 Hrs', priority: 'normal', status: 'pending', createdAt: tomorrow }
      ]
    };

    if (!targets[upcomingSunday]) {
      targets[upcomingSunday] = {
        mathsDone: 0,
        mathsTarget: 320,
        mathsCompleted: false,
        tasks: [
          { id: 'dt_sun_1', title: '🏆 All-India Live Tier-1 Full Mock Test (Strict 60 Mins Exam Simulation)', subject: 'Mock Test', targetQty: '1 Full Mock', priority: 'high', status: 'pending', createdAt: upcomingSunday },
          { id: 'dt_sun_2', title: 'Deep 3-Hour Error Diagnostic & Negative Mark Analysis', subject: 'Mock Test', targetQty: '3 Hours', priority: 'high', status: 'pending', createdAt: upcomingSunday },
          { id: 'dt_sun_3', title: 'Weekly Formula Vault & Spaced Repetition Mega-Revision', subject: 'Revision', targetQty: 'All Topics', priority: 'normal', status: 'pending', createdAt: upcomingSunday }
        ]
      };
    }

    return targets;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const escapeHTML = escapeHtml;

  // Target Exam Information
  const DEFAULT_TARGET_EXAM = {
    title: 'SSC CGL 2027 TIER-1 & RAILWAY NTPC',
    date: '2027-09-15'
  };

  // Default Customized Syllabus Tracker Data
  const DEFAULT_SYLLABUS = [
    // Quantitative Aptitude
    { id: 'syl_m1', subject: 'maths', title: 'Percentage & Fractional Values (1/1 to 1/25)', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_m2', subject: 'maths', title: 'Profit, Loss & Successive Discount', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_m3', subject: 'maths', title: 'Ratio, Proportion & Mixture Alligation', weightage: 'Medium (1-2 Qs)', status: 'In Progress' },
    { id: 'syl_m4', subject: 'maths', title: 'Time, Speed, Distance & Trains (Relative Speed)', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_m5', subject: 'maths', title: 'Time and Work, Pipes & Cisterns', weightage: 'Medium (1-2 Qs)', status: 'Not Started' },
    { id: 'syl_m6', subject: 'maths', title: 'Geometry: Triangles, Similarity & Congruency', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_m7', subject: 'maths', title: 'Geometry: Circles, Chords & Tangent Theorems', weightage: 'High (3-4 Qs)', status: 'Not Started' },
    { id: 'syl_m8', subject: 'maths', title: 'Trigonometry: Identities & Maxima/Minima', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_m9', subject: 'maths', title: 'Algebra: Polynomials & Symmetric Equations', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_m10', subject: 'maths', title: 'Mensuration 2D & 3D (Cylinder, Cone, Frustum)', weightage: 'Medium (1-2 Qs)', status: 'Not Started' },
    { id: 'syl_m11', subject: 'maths', title: 'Data Interpretation: Bar, Pie & Histogram', weightage: 'High (3-4 Qs)', status: 'Completed' },

    // English Language
    { id: 'syl_e1', subject: 'english', title: 'Subject-Verb Agreement & Inversion Rules', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_e2', subject: 'english', title: 'Tenses & Conditional Sentences', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_e3', subject: 'english', title: 'Active & Passive Voice Transformations', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_e4', subject: 'english', title: 'Direct & Indirect Speech (Narration Rules)', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_e5', subject: 'english', title: 'Vocabulary: 1000 High-Frequency Blackbook Words', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_e6', subject: 'english', title: 'Idioms & Phrases (PYQ 2018-2024 Drill)', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_e7', subject: 'english', title: 'One Word Substitution (Root Words & Etymology)', weightage: 'Medium (1-2 Qs)', status: 'Completed' },
    { id: 'syl_e8', subject: 'english', title: 'Reading Comprehension & Cloze Test Speed Drills', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_e9', subject: 'english', title: 'Para Jumbles (Sentence Rearrangement Logic)', weightage: 'Medium (1-2 Qs)', status: 'Not Started' },

    // Reasoning & General Intelligence
    { id: 'syl_r1', subject: 'reasoning', title: 'Coding-Decoding & Letter Shift Patterns', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_r2', subject: 'reasoning', title: 'Syllogism (Possibility & Standard Venn Cases)', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_r3', subject: 'reasoning', title: 'Blood Relations (Coded & Direct Family Trees)', weightage: 'Medium (1-2 Qs)', status: 'Completed' },
    { id: 'syl_r4', subject: 'reasoning', title: 'Direction & Distance Sense Diagrams', weightage: 'Medium (1-2 Qs)', status: 'Completed' },
    { id: 'syl_r5', subject: 'reasoning', title: 'Analogy & Number Series Set Matching', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_r6', subject: 'reasoning', title: 'Mathematical Operations & Symbol Swaps', weightage: 'Medium (1-2 Qs)', status: 'In Progress' },
    { id: 'syl_r7', subject: 'reasoning', title: 'Non-Verbal: Mirror, Water Images & Paper Folding', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_r8', subject: 'reasoning', title: 'Dice & Cube Folding Rules', weightage: 'Medium (1-2 Qs)', status: 'Completed' },
    { id: 'syl_r9', subject: 'reasoning', title: 'Seating Arrangement (Circular & Linear Puzzles)', weightage: 'High (3-4 Qs)', status: 'Not Started' },

    // General Awareness
    { id: 'syl_g1', subject: 'ga', title: 'Polity: Preamble, Fundamental Rights & Duties (12-51A)', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_g2', subject: 'ga', title: 'Polity: President, Parliament & Supreme Court', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_g3', subject: 'ga', title: 'Modern History: 1857 Revolt to Indian Independence 1947', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_g4', subject: 'ga', title: 'Ancient & Medieval History (Dynasties & Architecture)', weightage: 'Medium (1-2 Qs)', status: 'Not Started' },
    { id: 'syl_g5', subject: 'ga', title: 'Geography: River Drainage Systems & Mountain Passes', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_g6', subject: 'ga', title: 'Static GK: Classical Dances, Festivals & Instruments', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_g7', subject: 'ga', title: 'Science: Human Physiology, Vitamins & Diseases', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_g8', subject: 'ga', title: 'Economy: National Income, Inflation & Five Year Plans', weightage: 'Medium (1-2 Qs)', status: 'Not Started' },
    { id: 'syl_g9', subject: 'ga', title: 'Current Affairs: Government Schemes, Sports & Summits', weightage: 'High (3-4 Qs)', status: 'In Progress' },

    // Railway NTPC Special
    { id: 'syl_rw1', subject: 'railway', title: 'Railway History, Zones & Headquarters in India', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_rw2', subject: 'railway', title: 'General Science Physics: Mechanics, Optics & Units', weightage: 'High (3-4 Qs)', status: 'In Progress' },
    { id: 'syl_rw3', subject: 'railway', title: 'General Science Chemistry: Periodic Table & Reactions', weightage: 'High (3-4 Qs)', status: 'Not Started' },
    { id: 'syl_rw4', subject: 'railway', title: 'Speed Maths & Elementary Statistics (Mean, Median, Mode)', weightage: 'High (3-4 Qs)', status: 'Completed' },
    { id: 'syl_rw5', subject: 'railway', title: 'Computer Basics, Memory Units & Protocols', weightage: 'Medium (1-2 Qs)', status: 'Completed' }
  ];

  // Default Subject-Wise Multi-Stage Revision System (R1=Day 3, R2=Day 7, R3=Day 15, R4=Day 30)
  const DEFAULT_REVISION_TOPICS = [
    {
      id: 'rev1',
      subject: 'Maths',
      title: 'Percentage, Fractional Multipliers & Base Change',
      completedDate: getPastCycleDate(2),
      r1Done: true,
      r2Done: false,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev2',
      subject: 'Maths',
      title: 'Trigonometry Maxima & Minima Values',
      completedDate: getPastCycleDate(6),
      r1Done: true,
      r2Done: true,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev3',
      subject: 'English',
      title: 'Subject-Verb Agreement Inversion Rules',
      completedDate: getPastCycleDate(3),
      r1Done: true,
      r2Done: false,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev4',
      subject: 'English',
      title: 'Active & Passive Voice Imperative Sentences',
      completedDate: getPastCycleDate(14),
      r1Done: true,
      r2Done: true,
      r3Done: true,
      r4Done: false
    },
    {
      id: 'rev5',
      subject: 'Reasoning',
      title: 'Syllogism Only A Few & Possibility Cases',
      completedDate: getPastCycleDate(7),
      r1Done: true,
      r2Done: true,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev6',
      subject: 'Reasoning',
      title: 'Coded Blood Relations Family Trees',
      completedDate: getPastCycleDate(1),
      r1Done: false,
      r2Done: false,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev7',
      subject: 'GA',
      title: 'Fundamental Rights & DPSPs (Articles 12-51A)',
      completedDate: getPastCycleDate(5),
      r1Done: true,
      r2Done: false,
      r3Done: false,
      r4Done: false
    },
    {
      id: 'rev8',
      subject: 'GA',
      title: 'Governor Generals, Viceroys & Major Charter Acts',
      completedDate: getPastCycleDate(29),
      r1Done: true,
      r2Done: true,
      r3Done: true,
      r4Done: false
    }
  ];

  // Default Exam Formula & Short-Trick Vault Items
  const DEFAULT_VAULT_ITEMS = [
    {
      id: 'v1',
      subject: 'Maths',
      title: 'Successive Percentage Net Formula',
      formula: 'Net Change % = a + b + (a * b) / 100',
      tip: 'Use positive for profit/markup, negative for loss/discount. Two successive discounts d1 and d2 = (d1 + d2 - (d1 * d2)/100)%.'
    },
    {
      id: 'v2',
      subject: 'Maths',
      title: 'Circle Tangent-Secant External Point Theorem',
      formula: 'PT² = PA × PB',
      tip: 'Where PT is the length of tangent from external point P to point of tangency T, and PAB is secant intersecting circle at A and B.'
    },
    {
      id: 'v3',
      subject: 'Maths',
      title: 'Algebra: If x + 1/x = k',
      formula: 'x² + 1/x² = k² - 2\nx³ + 1/x³ = k³ - 3k\nx⁵ + 1/x⁵ = (x² + 1/x²)(x³ + 1/x³) - (x + 1/x)',
      tip: 'High-frequency in SSC CGL Tier 1 and Tier 2. Note: If x - 1/x = k, x² + 1/x² = k² + 2.'
    },
    {
      id: 'v4',
      subject: 'English',
      title: 'Correlative Conjunctions Nearest Subject Rule',
      formula: 'Neither...nor / Either...or / Not only...but also ➔ Verb agrees with the NEAREST subject',
      tip: 'Example: Neither the teacher nor the students WERE present. / Neither the students nor the teacher WAS present.'
    },
    {
      id: 'v5',
      subject: 'English',
      title: 'Inversion After Restrictive / Negative Adverbs',
      formula: 'Hardly / Scarcely / Seldom / No sooner + Auxiliary Verb + Subject + Main Verb',
      tip: 'Hardly had he arrived WHEN the train left. No sooner did he enter THAN everyone clapped.'
    },
    {
      id: 'v6',
      subject: 'Reasoning',
      title: 'Clock Hands Angle Formula',
      formula: 'Angle θ = |30H - (11/2)M|',
      tip: 'Where H is hours (1-12) and M is minutes (0-59). If θ > 180°, the reflex angle is 360° - θ.'
    },
    {
      id: 'v7',
      subject: 'Reasoning',
      title: 'Calendar Century Codes & Odd Days',
      formula: 'Day Index = (Date + Month Code + Century Code + Year + Year/4) % 7',
      tip: 'Century codes: 1600: 6, 1700: 4, 1800: 2, 1900: 0, 2000: 6. Remainder 0 = Sunday, 1 = Monday...'
    },
    {
      id: 'v8',
      subject: 'GA',
      title: 'Three Battles of Panipat Chronology',
      formula: '1st: 1526 (Babur vs Ibrahim Lodi)\n2nd: 1556 (Akbar & Bairam Khan vs Hemu)\n3rd: 1761 (Ahmad Shah Abdali vs Marathas)',
      tip: 'Remember 1526, 1556 (exactly 30 yrs later), and 1761.'
    },
    {
      id: 'v9',
      subject: 'GA',
      title: 'Fundamental Rights Article Categorization',
      formula: 'Equality (14-18) | Freedom (19-22) | Anti-Exploitation (23-24) | Religion (25-28) | Culture (29-30) | Remedies (32)',
      tip: 'Dr. B.R. Ambedkar designated Article 32 (Constitutional Remedies) as the "Heart and Soul of the Constitution".'
    }
  ];

  function getDefaultEnergyHistory() {
    return [
      { date: getPastCycleDate(1), rating: 4, reflection: 'Solid speed in 320 Maths questions. Finished Geometry PYQs with good accuracy.' },
      { date: getPastCycleDate(2), rating: 5, reflection: 'Peak flow zone from 5:00 AM Brahma Muhurta. Mastered English reading comprehension.' },
      { date: getPastCycleDate(3), rating: 4, reflection: 'Completed 10.8 study hours. Controlled afternoon break, no afternoon slump.' },
      { date: getPastCycleDate(4), rating: 3, reflection: 'Steady pace. Reasoning speed drills took extra effort but finished target.' },
      { date: getPastCycleDate(5), rating: 4, reflection: 'Rapid calculation drills and comprehensive GS modern history notes revision.' }
    ];
  }

  // Aspirant Daily Journal: 5 Subjective Criteria Standards
  const DEFAULT_JOURNAL_CRITERIA = [
    { id: 'schedule', title: 'Schedule Discipline', label: 'Followed planned study timetable & avoided procrastination' },
    { id: 'maths', title: 'Maths 320 Qs Drill', label: 'Completed 320 Maths questions or deep problem-solving drill' },
    { id: 'breaks', title: 'Break Time Control', label: 'Kept breaks short and monitored; zero doomscrolling or social media' },
    { id: 'revision', title: 'Active Spaced Revision', label: 'Revised previous notes, flashcards & static GK spaced repetition' },
    { id: 'mindset', title: 'Focus & Mental Stamina', label: 'Maintained high mental stamina, positive grit & distraction refusal' }
  ];

  // Default Sample Journal Entries (Past 3 Days Seed for Immediate Calendar Sync)
  function getDefaultJournalEntries() {
    return [
      {
        date: getPastCycleDate(1),
        notes: "Completed 320 Maths questions with 88% accuracy on Mensuration & Algebra PYQs. Kept breaks strictly under 1h 15m. Need to polish Static GK Classical Dances and President Articles before mock test.",
        overallExecution: 'good',
        evaluations: {
          schedule: true,
          maths: true,
          breaks: true,
          revision: true,
          mindset: true
        },
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        date: getPastCycleDate(2),
        notes: "High energy day! Mastered Active/Passive voice inverted cases in English. Practiced 60 Syllogism questions in Reasoning without a single error. Slept on time at 10:30 PM for 5 AM wake up.",
        overallExecution: 'good',
        evaluations: {
          schedule: true,
          maths: true,
          breaks: true,
          revision: false,
          mindset: true
        },
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        date: getPastCycleDate(3),
        notes: "Solid 11-hour deep work session. Hit 320 Maths questions early in the morning. Spaced repetition R1 flashcards completed. Afternoon walk cleared mental fatigue.",
        overallExecution: 'good',
        evaluations: {
          schedule: true,
          maths: true,
          breaks: true,
          revision: true,
          mindset: true
        },
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
  }

  // Default Sample Mock Test Scores (Full & Sectional Mocks)
  function getDefaultMockScores() {
    return [
      {
        id: 'mock_f1',
        type: 'full',
        title: 'Testbook SSC CGL Tier 1 Full Mock 1',
        date: getPastCycleDate(14),
        score: 124.5,
        maxScore: 200,
        percentage: 62.25,
        percentile: 76.4,
        accuracy: 78.5,
        sections: { maths: 31.0, english: 37.5, reasoning: 43.5, ga: 12.5 },
        notes: 'High negative marking in GA. Time pressure in last 5 Maths questions.',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'mock_s1',
        type: 'sectional',
        subject: 'maths',
        title: 'Oliveboard Maths Sectional Drill - Geometry & Mensuration',
        date: getPastCycleDate(12),
        score: 36.0,
        maxScore: 50,
        percentage: 72.0,
        percentile: 81.2,
        accuracy: 82.0,
        notes: 'Circle tangent theorems solved fast. Need to drill 3D Mensuration frustum formula.',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
      },
      {
        id: 'mock_f2',
        type: 'full',
        title: 'Testbook SSC CGL Tier 1 Full Mock 2',
        date: getPastCycleDate(10),
        score: 133.0,
        maxScore: 200,
        percentage: 66.5,
        percentile: 83.1,
        accuracy: 82.8,
        sections: { maths: 37.0, english: 41.5, reasoning: 44.0, ga: 10.5 },
        notes: 'Maths improved by 6 marks. English vocab questions were direct from SP Bakshi.',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'mock_s2',
        type: 'sectional',
        subject: 'english',
        title: 'English Comprehension & Cloze Test Speed Drill',
        date: getPastCycleDate(8),
        score: 44.5,
        maxScore: 50,
        percentage: 89.0,
        percentile: 93.4,
        accuracy: 94.0,
        notes: 'Flawless error spotting. 1 silly error in active-passive voice.',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
      },
      {
        id: 'mock_f3',
        type: 'full',
        title: 'SuperPro SSC CGL Tier 1 Live All-India Mock',
        date: getPastCycleDate(6),
        score: 141.5,
        maxScore: 200,
        percentage: 70.75,
        percentile: 89.6,
        accuracy: 86.4,
        sections: { maths: 42.0, english: 43.0, reasoning: 45.5, ga: 11.0 },
        notes: 'Crossed 140 cutoff threshold! Reasoning completed in 14 minutes.',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 'mock_s3',
        type: 'sectional',
        subject: 'reasoning',
        title: 'Reasoning Non-Verbal & Coding-Decoding Speed Sprint',
        date: getPastCycleDate(4),
        score: 47.5,
        maxScore: 50,
        percentage: 95.0,
        percentile: 97.2,
        accuracy: 98.0,
        notes: 'Only 1 question missed in blood relations. Time taken: 11 mins.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'mock_s4',
        type: 'sectional',
        subject: 'ga',
        title: 'Static GK Classical Dances, Battles & Articles Drill',
        date: getPastCycleDate(3),
        score: 30.5,
        maxScore: 50,
        percentage: 61.0,
        percentile: 79.5,
        accuracy: 74.0,
        notes: 'Polity articles revisions paid off. Need to revise Modern History viceroys.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'mock_f4',
        type: 'full',
        title: 'Testbook SSC CGL Tier 1 Full Mock 3 (Latest)',
        date: getPastCycleDate(1),
        score: 152.0,
        maxScore: 200,
        percentage: 76.0,
        percentile: 94.8,
        accuracy: 89.2,
        sections: { maths: 46.5, english: 44.5, reasoning: 47.0, ga: 14.0 },
        notes: 'Personal Best! 152 marks. Strong confidence boost for Tier 1 4600 GP target.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
  }

  // ==========================================================================
  // 3. APPLICATION STATE ENGINE
  // ==========================================================================

  let state = {
    activeCycleDate: getStudyCycleDate(),
    targetHours: 10.0,
    isBreakDay: false,
    soundEnabled: true,

    // Target Exam Info
    targetExamTitle: DEFAULT_TARGET_EXAM.title,
    targetExamDate: DEFAULT_TARGET_EXAM.date,

    // Subjects & Stopwatches
    subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),

    // Break & Inactivity Tracking
    todayBreakSeconds: 0,
    yesterdayBreakSeconds: 0,
    isBreakTimerRunning: false,
    currentBreakSessionStart: null,

    // 320 Maths Target
    mathsQuestionsDone: 0,

    // Habits
    habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),

    // Weak Areas Radar
    weakAreas: JSON.parse(JSON.stringify(DEFAULT_WEAK_AREAS)),

    // Syllabus Checklist
    syllabus: JSON.parse(JSON.stringify(DEFAULT_SYLLABUS)),
    activeSyllabusSubject: 'all',
    activeSyllabusStatus: 'all',

    // Subject-wise Revision System
    revisionTopics: JSON.parse(JSON.stringify(DEFAULT_REVISION_TOPICS)),
    activeRevisionFilter: 'all',

    // Daily Targets & Revision Hub
    selectedTargetDate: getStudyCycleDate(),
    dateTargets: getDefaultDateTargets(),

    // Energy & Focus Rating
    energyRatingToday: null,
    energyHistory: getDefaultEnergyHistory(),

    // Formula & Short-Trick Vault
    vaultItems: JSON.parse(JSON.stringify(DEFAULT_VAULT_ITEMS)),
    activeVaultFilter: 'all',
    vaultSearchQuery: '',

    // Spaced Repetition Chapters
    spacedRepChapters: getDefaultChapters(),

    // Streaks & History
    consecutiveStreak: 0,
    claimedMilestones: [],
    history: [], // Array of daily logs archived at 5:00 AM
    mockAnalysisHistory: [],
    selectedCalendarDate: getStudyCycleDate(),

    // Dedicated Aspirant Journal & Subjective Day Evaluation
    journalEntries: getDefaultJournalEntries(),
    selectedJournalDate: getStudyCycleDate(),

    // Dedicated Mock Score Trends & Historical Performance Analytics
    mockScores: getDefaultMockScores(),
    mockChartActiveTab: 'full', // 'full' | 'sectional' | 'accuracy'
    mockHistoryFilter: 'all', // 'all' | 'full' | 'maths' | 'english' | 'reasoning' | 'ga'
    mockSearchQuery: ''
  };

  // Active Intervals & Chart Reference
  let globalTickInterval = null;
  let quoteRotationInterval = null;
  let currentQuoteIndex = 0;
  let mockChartInstance = null;

  function getDefaultHistory() {
    return [
      {
        date: getPastCycleDate(1),
        totalStudySeconds: 10.5 * 3600,
        breakSeconds: 1.25 * 3600, // 1h 15m
        mathsQuestions: 320,
        habitsCompleted: 4,
        totalHabits: 5,
        isBreakDay: false,
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: true },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: true },
          { title: '320 Daily Maths Questions Mission', completed: true },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: true },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: false }
        ],
        subjectBreakdown: [
          { name: 'Quantitative Aptitude (Maths 320Qs)', seconds: 3.5 * 3600 },
          { name: 'General Intelligence & Reasoning', seconds: 2.5 * 3600 },
          { name: 'English Language & Comprehension', seconds: 2.5 * 3600 },
          { name: 'General Awareness (Static GK + CA)', seconds: 2.0 * 3600 }
        ]
      },
      {
        date: getPastCycleDate(2),
        totalStudySeconds: 10.0 * 3600,
        breakSeconds: 1.4 * 3600, // 1h 24m
        mathsQuestions: 320,
        habitsCompleted: 5,
        totalHabits: 5,
        isBreakDay: false,
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: true },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: true },
          { title: '320 Daily Maths Questions Mission', completed: true },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: true },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: true }
        ],
        subjectBreakdown: [
          { name: 'Quantitative Aptitude (Maths 320Qs)', seconds: 3.5 * 3600 },
          { name: 'General Intelligence & Reasoning', seconds: 2.0 * 3600 },
          { name: 'English Language & Comprehension', seconds: 2.5 * 3600 },
          { name: 'General Awareness (Static GK + CA)', seconds: 2.0 * 3600 }
        ]
      },
      {
        date: getPastCycleDate(3),
        totalStudySeconds: 11.0 * 3600,
        breakSeconds: 0.9 * 3600, // 54m
        mathsQuestions: 320,
        habitsCompleted: 5,
        totalHabits: 5,
        isBreakDay: false,
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: true },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: true },
          { title: '320 Daily Maths Questions Mission', completed: true },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: true },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: true }
        ],
        subjectBreakdown: [
          { name: 'Quantitative Aptitude (Maths 320Qs)', seconds: 4.0 * 3600 },
          { name: 'General Intelligence & Reasoning', seconds: 2.5 * 3600 },
          { name: 'English Language & Comprehension', seconds: 2.5 * 3600 },
          { name: 'General Awareness (Static GK + CA)', seconds: 2.0 * 3600 }
        ]
      },
      {
        date: getPastCycleDate(4),
        totalStudySeconds: 9.5 * 3600,
        breakSeconds: 1.6 * 3600, // 1h 36m
        mathsQuestions: 310,
        habitsCompleted: 4,
        totalHabits: 5,
        isBreakDay: false,
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: true },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: true },
          { title: '320 Daily Maths Questions Mission', completed: true },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: false },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: true }
        ],
        subjectBreakdown: [
          { name: 'Quantitative Aptitude (Maths 320Qs)', seconds: 3.0 * 3600 },
          { name: 'General Intelligence & Reasoning', seconds: 2.5 * 3600 },
          { name: 'English Language & Comprehension', seconds: 2.5 * 3600 },
          { name: 'General Awareness (Static GK + CA)', seconds: 1.5 * 3600 }
        ]
      },
      {
        date: getPastCycleDate(5),
        totalStudySeconds: 10.8 * 3600,
        breakSeconds: 1.1 * 3600,
        mathsQuestions: 320,
        habitsCompleted: 5,
        totalHabits: 5,
        isBreakDay: false,
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: true },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: true },
          { title: '320 Daily Maths Questions Mission', completed: true },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: true },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: true }
        ],
        subjectBreakdown: [
          { name: 'Quantitative Aptitude (Maths 320Qs)', seconds: 3.8 * 3600 },
          { name: 'General Intelligence & Reasoning', seconds: 2.5 * 3600 },
          { name: 'English Language & Comprehension', seconds: 2.5 * 3600 },
          { name: 'General Awareness (Static GK + CA)', seconds: 2.0 * 3600 }
        ]
      },
      {
        date: getPastCycleDate(6),
        totalStudySeconds: 0,
        breakSeconds: 0,
        mathsQuestions: 0,
        habitsCompleted: 0,
        totalHabits: 5,
        isBreakDay: true, // Planned break day
        goalMet: true,
        habitsSnapshot: [
          { title: 'Wake up 5:00 AM (Brahma Muhurta Routine)', completed: false },
          { title: 'The Hindu Editorial & Daily Vocab (50 Words)', completed: false },
          { title: '320 Daily Maths Questions Mission', completed: false },
          { title: 'GS Static GK Revision (Polity / History / Science)', completed: false },
          { title: '1 Full Tier 1 Mock Test + In-Depth Scorecard Analysis', completed: false }
        ],
        subjectBreakdown: []
      }
    ];
  }

  // Initial Seed for Weekly To-Do Planner (Mon to Sun with tick/cross items)
  function getDefaultWeeklyTodos() {
    const currentMonday = getMondayOfWeek(getStudyCycleDate());
    const parts = currentMonday.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const makeDate = (offsetDays) => {
      const dt = new Date(y, m, d + offsetDays);
      const yr = dt.getFullYear();
      const mo = String(dt.getMonth() + 1).padStart(2, '0');
      const da = String(dt.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${da}`;
    };

    return {
      [currentMonday]: [
        // Monday
        {
          id: 'wt_mon_1',
          date: makeDate(0),
          dayName: 'Monday',
          title: 'Maths Arithmetic: 50 Qs Percentage & Profit-Loss PYQs',
          subject: 'Maths',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 500000
        },
        {
          id: 'wt_mon_2',
          date: makeDate(0),
          dayName: 'Monday',
          title: 'English Vocab: 50 Idioms & Phrases + 1 Editorial Analysis',
          subject: 'English',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 400000
        },
        // Tuesday
        {
          id: 'wt_tue_1',
          date: makeDate(1),
          dayName: 'Tuesday',
          title: 'Reasoning: 35 Qs Syllogism & Coding-Decoding Speed Drill',
          subject: 'Reasoning',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 350000
        },
        {
          id: 'wt_tue_2',
          date: makeDate(1),
          dayName: 'Tuesday',
          title: 'GS History: Modern India 1857 Revolt to Gandhian Movements',
          subject: 'GS',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 300000
        },
        // Wednesday
        {
          id: 'wt_wed_1',
          date: makeDate(2),
          dayName: 'Wednesday',
          title: 'Maths Advance: 40 Qs Triangle Congruence & Geometry Theorems',
          subject: 'Maths',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 250000
        },
        {
          id: 'wt_wed_2',
          date: makeDate(2),
          dayName: 'Wednesday',
          title: 'English Grammar: 30 Qs Subject-Verb Agreement & Error Spotting',
          subject: 'English',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 200000
        },
        // Thursday
        {
          id: 'wt_thu_1',
          date: makeDate(3),
          dayName: 'Thursday',
          title: 'GS Polity: Articles 1-51A (Fundamental Rights & DPSPs)',
          subject: 'GS',
          completed: false,
          status: 'crossed',
          createdAt: Date.now() - 150000
        },
        {
          id: 'wt_thu_2',
          date: makeDate(3),
          dayName: 'Thursday',
          title: 'Speed Calculations: Tables 1-30, Squares to 50 & Cubes to 30',
          subject: 'Maths',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 100000
        },
        // Friday
        {
          id: 'wt_fri_1',
          date: makeDate(4),
          dayName: 'Friday',
          title: 'English Vocab: 50 One Word Substitutions + 2 Cloze Tests',
          subject: 'English',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 80000
        },
        {
          id: 'wt_fri_2',
          date: makeDate(4),
          dayName: 'Friday',
          title: 'Reasoning: Non-Verbal Series & Figure Completion 40 Qs',
          subject: 'Reasoning',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 60000
        },
        // Saturday
        {
          id: 'wt_sat_1',
          date: makeDate(5),
          dayName: 'Saturday',
          title: 'Weekly Comprehensive Weak Chapters Revision & Error Diary',
          subject: 'Revision',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 40000
        },
        {
          id: 'wt_sat_2',
          date: makeDate(5),
          dayName: 'Saturday',
          title: 'Sectional Speed Mocks: 25 Qs Maths & 25 Qs Reasoning in 35 min',
          subject: 'Mock',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 20000
        },
        // Sunday
        {
          id: 'wt_sun_1',
          date: makeDate(6),
          dayName: 'Sunday',
          title: 'Full-Length Tier-1 Mock Exam (Target: 150+ Raw Score)',
          subject: 'Mock',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 10000
        },
        {
          id: 'wt_sun_2',
          date: makeDate(6),
          dayName: 'Sunday',
          title: '2-Hour Post-Mortem Analysis: Log All Silly Mistakes in Error Notebook',
          subject: 'Revision',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 5000
        }
      ]
    };
  }

  // Initial Seed for Monthly Targets & Milestones
  function getDefaultMonthlyTargets() {
    const currentMonth = getMonthKey(getStudyCycleDate());
    return {
      [currentMonth]: [
        {
          id: 'mt_1',
          title: 'Complete 12 Full-Length Tier-1 Mock Exams with Deep Post-Mortem',
          subject: 'Mock Tests',
          category: 'Mocks',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 500000
        },
        {
          id: 'mt_2',
          title: 'Finish Complete Arithmetic Syllabus (Profit-Loss, SI/CI, Time & Work, Speed-Distance)',
          subject: 'Maths',
          category: 'Syllabus',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 400000
        },
        {
          id: 'mt_3',
          title: 'Master 1,200 High-Frequency Blackbook Vocab (Idioms, OWS, Synonyms)',
          subject: 'English',
          category: 'Revision',
          completed: true,
          status: 'completed',
          createdAt: Date.now() - 300000
        },
        {
          id: 'mt_4',
          title: 'Complete Indian Constitution Polity Articles & Modern History Timeline',
          subject: 'General Awareness',
          category: 'Syllabus',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 200000
        },
        {
          id: 'mt_5',
          title: 'Maintain 25+ Green Dots Consistency Calendar with Zero Unexcused Misses',
          subject: 'General',
          category: 'Discipline',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 100000
        },
        {
          id: 'mt_6',
          title: 'Achieve 45+ Raw Score in Reasoning Sectional Mocks Consistently',
          subject: 'Reasoning',
          category: 'Mocks',
          completed: false,
          status: 'pending',
          createdAt: Date.now() - 50000
        }
      ]
    };
  }

  // Pristine Zero-Data State Factory for Complete Master Factory Reset
  function getEmptyPristineState() {
    const todayStr = getStudyCycleDate();
    return {
      activeCycleDate: todayStr,
      targetHours: 10.0,
      isBreakDay: false,
      soundEnabled: true,
      targetExamTitle: DEFAULT_TARGET_EXAM.title,
      targetExamDate: DEFAULT_TARGET_EXAM.date,
      subjects: DEFAULT_SUBJECTS.map(s => ({
        ...s,
        seconds: 0,
        isRunning: false,
        lastStartTime: null
      })),
      todayBreakSeconds: 0,
      yesterdayBreakSeconds: 0,
      isBreakTimerRunning: false,
      currentBreakSessionStart: null,
      mathsQuestionsDone: 0,
      habits: DEFAULT_HABITS.map(h => ({
        ...h,
        streak: 0,
        completedDays: {},
        todayCompleted: false
      })),
      weakAreas: [],
      syllabus: DEFAULT_SYLLABUS.map(sub => ({
        ...sub,
        status: 'Pending'
      })),
      activeSyllabusSubject: 'all',
      activeSyllabusStatus: 'all',
      revisionTopics: [],
      activeRevisionFilter: 'all',
      selectedTargetDate: todayStr,
      dateTargets: {},
      weeklyTodos: {},
      weeklyTasks: [],
      monthlyTargets: {},
      selectedTodoWeekStart: getMondayOfWeek(todayStr),
      selectedTodoMonth: getMonthKey(todayStr),
      revisionActiveTab: 'daily',
      todoHubActiveView: 'weekly',
      todoMonthlyFilter: 'all',
      todoWeeklySubjectFilter: 'all',
      todoMonthlySubjectFilter: 'all',
      editingWeeklyTaskId: null,
      editingMonthlyTargetId: null,
      energyRatingToday: null,
      energyHistory: [],
      vaultItems: [],
      activeVaultFilter: 'all',
      vaultSearchQuery: '',
      spacedRepChapters: [],
      consecutiveStreak: 0,
      claimedMilestones: [],
      history: [],
      mockAnalysisHistory: [],
      selectedCalendarDate: todayStr,
      journalEntries: [],
      selectedJournalDate: todayStr,
      mockScores: [],
      mockChartActiveTab: 'full',
      mockHistoryFilter: 'all',
      mockSearchQuery: '',
      activeSubjectId: null,
      activeSubjectStartTime: null,
      lastActiveTimestamp: Date.now()
    };
  }

  // Default Initial State Factory for Fresh First-Runs
  function getInitialDefaultState() {
    return {
      activeCycleDate: getStudyCycleDate(),
      targetHours: 10.0,
      isBreakDay: false,
      soundEnabled: true,
      targetExamTitle: DEFAULT_TARGET_EXAM.title,
      targetExamDate: DEFAULT_TARGET_EXAM.date,
      subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
      todayBreakSeconds: 0,
      yesterdayBreakSeconds: 4500,
      isBreakTimerRunning: false,
      currentBreakSessionStart: null,
      mathsQuestionsDone: 0,
      habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
      weakAreas: JSON.parse(JSON.stringify(DEFAULT_WEAK_AREAS)),
      syllabus: JSON.parse(JSON.stringify(DEFAULT_SYLLABUS)),
      activeSyllabusSubject: 'all',
      activeSyllabusStatus: 'all',
      revisionTopics: JSON.parse(JSON.stringify(DEFAULT_REVISION_TOPICS)),
      activeRevisionFilter: 'all',
      selectedTargetDate: getStudyCycleDate(),
      dateTargets: getDefaultDateTargets(),
      weeklyTodos: getDefaultWeeklyTodos(),
      monthlyTargets: getDefaultMonthlyTargets(),
      selectedTodoWeekStart: getMondayOfWeek(getStudyCycleDate()),
      selectedTodoMonth: getMonthKey(getStudyCycleDate()),
      revisionActiveTab: 'daily',
      todoHubActiveView: 'weekly',
      todoMonthlyFilter: 'all',
      editingWeeklyTaskId: null,
      editingMonthlyTargetId: null,
      energyRatingToday: null,
      energyHistory: getDefaultEnergyHistory(),
      vaultItems: JSON.parse(JSON.stringify(DEFAULT_VAULT_ITEMS)),
      activeVaultFilter: 'all',
      vaultSearchQuery: '',
      spacedRepChapters: getDefaultChapters(),
      consecutiveStreak: 6,
      claimedMilestones: [],
      history: getDefaultHistory(),
      mockAnalysisHistory: [],
      selectedCalendarDate: getStudyCycleDate(),
      journalEntries: getDefaultJournalEntries(),
      selectedJournalDate: getStudyCycleDate(),
      mockScores: getDefaultMockScores(),
      mockChartActiveTab: 'full',
      mockHistoryFilter: 'all',
      mockSearchQuery: '',
      activeSubjectId: null,
      activeSubjectStartTime: null,
      lastActiveTimestamp: Date.now()
    };
  }

  // Synchronize elapsed study and break time based on real wall-clock timestamps
  // This guarantees accurate tracking even when browser tabs are backgrounded or throttled.
  function syncElapsedActiveTime() {
    const now = Date.now();
    const runningSubject = state.subjects.find(s => s.isRunning);

    if (runningSubject) {
      const anchor = runningSubject.lastStartTime || state.activeSubjectStartTime || state.lastActiveTimestamp || now;
      const elapsedMs = now - anchor;
      if (elapsedMs >= 1000) {
        const fullSecs = Math.floor(elapsedMs / 1000);
        runningSubject.seconds = (runningSubject.seconds || 0) + fullSecs;
        // Keep fractional millisecond remainder in the anchor for continuous sub-second accuracy
        const newAnchor = anchor + (fullSecs * 1000);
        runningSubject.lastStartTime = newAnchor;
        state.activeSubjectStartTime = newAnchor;
      }
    }

    state.lastActiveTimestamp = now;
  }

  // Load from LocalStorage
  function loadState() {
    let saved = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    if (saved && typeof saved === 'object') {
      // User data exists in localStorage: NEVER overwrite user data or empty lists with defaults!
      state = Object.assign({}, saved);

      // Safe fallbacks for older schemas or missing fields without overwriting empty arrays
      if (!Array.isArray(state.subjects)) state.subjects = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
      if (!Array.isArray(state.habits)) state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      if (!Array.isArray(state.history)) state.history = [];
      if (!Array.isArray(state.syllabus)) state.syllabus = [];
      if (!Array.isArray(state.revisionTopics)) state.revisionTopics = [];
      if (!state.dateTargets || typeof state.dateTargets !== 'object') state.dateTargets = {};
      if (!Array.isArray(state.vaultItems)) state.vaultItems = [];
      if (!Array.isArray(state.spacedRepChapters)) state.spacedRepChapters = [];
      if (!Array.isArray(state.energyHistory)) state.energyHistory = [];
      if (!Array.isArray(state.journalEntries)) state.journalEntries = [];
      if (!Array.isArray(state.mockScores)) state.mockScores = [];
      if (!Array.isArray(state.weakAreas)) state.weakAreas = [];
      if (!Array.isArray(state.claimedMilestones)) state.claimedMilestones = [];
      if (!Array.isArray(state.mockAnalysisHistory)) state.mockAnalysisHistory = [];
      if (!state.weeklyTodos || typeof state.weeklyTodos !== 'object') state.weeklyTodos = {};
      if (!Array.isArray(state.weeklyTasks)) state.weeklyTasks = getAllWeeklyTasks();
      if (!state.monthlyTargets || typeof state.monthlyTargets !== 'object') state.monthlyTargets = {};
      if (!state.selectedTodoWeekStart) state.selectedTodoWeekStart = getMondayOfWeek(getStudyCycleDate());
      if (!state.selectedTodoMonth) state.selectedTodoMonth = getMonthKey(getStudyCycleDate());
      if (!state.revisionActiveTab) state.revisionActiveTab = 'daily';
      if (!state.todoHubActiveView) state.todoHubActiveView = 'weekly';
      if (!state.todoMonthlyFilter) state.todoMonthlyFilter = 'all';
      if (!state.todoWeeklySubjectFilter) state.todoWeeklySubjectFilter = 'all';
      if (!state.todoMonthlySubjectFilter) state.todoMonthlySubjectFilter = 'all';
      if (state.targetHours === undefined) state.targetHours = 10.0;
      if (state.soundEnabled === undefined) state.soundEnabled = true;
      if (!state.targetExamTitle) state.targetExamTitle = DEFAULT_TARGET_EXAM.title;
      if (!state.targetExamDate) state.targetExamDate = DEFAULT_TARGET_EXAM.date;

      // Sync and hydrate weekly tasks from cgl_weekly_tasks in localStorage
      try {
        const rawWeekly = localStorage.getItem(WEEKLY_TASKS_STORAGE_KEY);
        if (rawWeekly) {
          const parsedWeekly = JSON.parse(rawWeekly);
          if (Array.isArray(parsedWeekly) && parsedWeekly.length > 0) {
            state.weeklyTasks = parsedWeekly;
            parsedWeekly.forEach(t => {
              if (t && t.date) {
                const wStart = t.weekStart || getMondayOfWeek(t.date);
                if (!state.weeklyTodos[wStart]) {
                  state.weeklyTodos[wStart] = [];
                }
                const idx = state.weeklyTodos[wStart].findIndex(item => item.id === t.id);
                if (idx === -1) {
                  state.weeklyTodos[wStart].push(t);
                } else {
                  state.weeklyTodos[wStart][idx] = t;
                }
              }
            });
          }
        } else {
          // Initialize cgl_weekly_tasks in localStorage if not already present
          saveWeeklyTasksToLocalStorage();
        }
      } catch (err) {
        console.warn('Error reading cgl_weekly_tasks from localStorage:', err);
      }

      // Hydrate subjects with shortName, icon, and color if upgrading from older session
      state.subjects.forEach(s => {
        if (!s.shortName) {
          if (s.id === 'maths' || (s.name && s.name.toLowerCase().includes('math'))) s.shortName = 'Maths';
          else if (s.id === 'english' || (s.name && s.name.toLowerCase().includes('eng'))) s.shortName = 'English';
          else if (s.id === 'reasoning' || (s.name && s.name.toLowerCase().includes('reason'))) s.shortName = 'Reasoning';
          else if (s.id === 'ga' || (s.name && (s.name.toLowerCase().includes('general awareness') || s.name.toLowerCase().includes('gk') || s.name.toLowerCase().includes('gs')))) s.shortName = 'General Awareness';
          else if (s.id === 'mocks' || (s.name && s.name.toLowerCase().includes('mock'))) s.shortName = 'Mock Tests';
          else s.shortName = s.name || 'Subject';
        }
        if (!s.icon) {
          const lower = (s.shortName || s.name || '').toLowerCase();
          if (lower.includes('math')) s.icon = '📐';
          else if (lower.includes('eng')) s.icon = '📖';
          else if (lower.includes('reason')) s.icon = '🧩';
          else if (lower.includes('awar') || lower.includes('gk') || lower.includes('gs') || lower.includes('hist') || lower.includes('polity')) s.icon = '🏛️';
          else if (lower.includes('mock')) s.icon = '📊';
          else if (lower.includes('comp')) s.icon = '💻';
          else if (lower.includes('type') || lower.includes('typing')) s.icon = '⌨️';
          else s.icon = '⚡';
        }
        if (!s.color) {
          const lower = (s.shortName || s.name || '').toLowerCase();
          if (lower.includes('math')) s.color = 'emerald';
          else if (lower.includes('eng')) s.color = 'sky';
          else if (lower.includes('reason')) s.color = 'violet';
          else if (lower.includes('awar') || lower.includes('gk') || lower.includes('gs')) s.color = 'amber';
          else if (lower.includes('mock')) s.color = 'rose';
          else if (lower.includes('comp')) s.color = 'cyan';
          else s.color = 'teal';
        }
        if (s.isDefault === undefined) {
          s.isDefault = ['maths', 'english', 'reasoning', 'ga', 'mocks'].includes(s.id);
        }
      });

      // Reconcile background elapsed time if app was restored with an active subject
      const now = Date.now();
      const runningSub = state.subjects.find(s => s.isRunning);
      if (runningSub) {
        const anchor = runningSub.lastStartTime || state.activeSubjectStartTime || state.lastActiveTimestamp || now;
        const elapsedSecs = Math.max(0, Math.floor((now - anchor) / 1000));
        if (elapsedSecs > 0) {
          runningSub.seconds = (runningSub.seconds || 0) + elapsedSecs;
        }
        runningSub.lastStartTime = now;
        state.activeSubjectStartTime = now;
      }
      state.lastActiveTimestamp = now;
    } else {
      // Brand new clean first-run or post-reset: initialize clean zero-data state
      state = getEmptyPristineState();
      state.weeklyTasks = [];
      saveWeeklyTasksToLocalStorage();
      saveState();
    }

    if (!state.selectedCalendarDate) {
      state.selectedCalendarDate = getStudyCycleDate();
    }
    if (!state.selectedJournalDate) {
      state.selectedJournalDate = getStudyCycleDate();
    }
    if (!state.selectedTargetDate) {
      state.selectedTargetDate = getStudyCycleDate();
    }
    if (!state.activeSyllabusSubject) state.activeSyllabusSubject = 'all';
    if (!state.activeSyllabusStatus) state.activeSyllabusStatus = 'all';
    if (!state.activeRevisionFilter) state.activeRevisionFilter = 'all';
    if (!state.activeVaultFilter) state.activeVaultFilter = 'all';
    if (state.vaultSearchQuery === undefined) state.vaultSearchQuery = '';
    if (!state.mockChartActiveTab) state.mockChartActiveTab = 'full';
    if (!state.mockHistoryFilter) state.mockHistoryFilter = 'all';
    if (state.mockSearchQuery === undefined) state.mockSearchQuery = '';

    // Perform 5:00 AM Cycle check immediately
    check5amDailyCycleReset();
  }

  // --- WEEKLY TASKS STORAGE ENGINE & LOCALSTORAGE SYNC ---
  // Helper to extract all weekly tasks across all weeks as a flat array
  function getAllWeeklyTasks() {
    const tasksMap = new Map();
    if (state.weeklyTodos && typeof state.weeklyTodos === 'object') {
      Object.keys(state.weeklyTodos).forEach(weekKey => {
        const list = state.weeklyTodos[weekKey];
        if (Array.isArray(list)) {
          list.forEach(t => {
            if (t && t.id) {
              if (!t.weekStart) t.weekStart = weekKey;
              tasksMap.set(t.id, t);
            }
          });
        }
      });
    }
    if (Array.isArray(state.weeklyTasks)) {
      state.weeklyTasks.forEach(t => {
        if (t && t.id) {
          if (!tasksMap.has(t.id)) {
            tasksMap.set(t.id, t);
          }
        }
      });
    }
    return Array.from(tasksMap.values());
  }

  // Force immediate saving of the updated weekly tasks array into browser localStorage under 'cgl_weekly_tasks'
  function saveWeeklyTasksToLocalStorage() {
    try {
      const allTasks = getAllWeeklyTasks();
      state.weeklyTasks = allTasks;
      localStorage.setItem(WEEKLY_TASKS_STORAGE_KEY, JSON.stringify(allTasks));
      return allTasks;
    } catch (e) {
      console.error('Error saving cgl_weekly_tasks to localStorage:', e);
      return [];
    }
  }

  // Save to LocalStorage & Debounced Cloud Sync
  function saveState(skipCloudSync = false) {
    try {
      saveWeeklyTasksToLocalStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }

    // Trigger debounced cloud synchronization if user is authenticated
    if (!skipCloudSync && currentUser && firestoreDb) {
      scheduleCloudSync();
    }
  }

  // Calculate Total Study Seconds logged today across all subjects
  function calculateTotalStudySeconds() {
    return state.subjects.reduce((sum, s) => sum + (s.seconds || 0), 0);
  }

  // ==========================================================================
  // 4. AUTOMATIC SUBJECT-TO-BREAK SWITCHING LOGIC (CRUCIAL REQUIREMENT)
  // ==========================================================================

  /**
   * Called whenever ANY subject timer is started.
   * Logic:
   * 1. Sync ongoing timers to ensure precision.
   * 2. If Break Timer is currently running, automatically pause it!
   *    Calculate how long the break lasted, add it to today's total break hours, and save.
   * 3. Pause any other currently running subject timer (only one runs at a time).
   * 4. Start the target subject timer with precise timestamp anchoring.
   */
  function startSubjectTimer(subjectId) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Synchronize any running timer prior to transition
    syncElapsedActiveTime();

    // 1. Auto-pause Break Timer if running
    if (state.isBreakTimerRunning) {
      stopBreakTimer();
    }

    // 2. Pause any other running subjects
    state.subjects.forEach(s => {
      if (s.id !== subjectId && s.isRunning) {
        s.isRunning = false;
        s.lastStartTime = null;
      }
    });

    // 3. Start target subject with timestamp anchor
    const now = Date.now();
    subject.isRunning = true;
    subject.lastStartTime = now;
    state.activeSubjectId = subjectId;
    state.activeSubjectStartTime = now;
    state.lastActiveTimestamp = now;

    playChime('start');
    saveState();
    updateUI();
  }

  /**
   * Called whenever ANY subject timer is paused or stopped.
   * Logic:
   * 1. Sync elapsed seconds and pause/stop the subject timer.
   * 2. Check if any subject is still running. If NO other subject is running:
   *    AUTOMATICALLY START THE BREAK/INACTIVITY TIMER IMMEDIATELY!
   */
  function pauseSubjectTimer(subjectId) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    syncElapsedActiveTime();

    subject.isRunning = false;
    subject.lastStartTime = null;
    state.activeSubjectId = null;
    state.activeSubjectStartTime = null;
    state.lastActiveTimestamp = Date.now();

    playChime('pause');

    // Check if any other subject is running
    const anyRunning = state.subjects.some(s => s.isRunning);
    if (!anyRunning) {
      // Auto-start Break Timer immediately!
      startBreakTimer(true);
    }

    saveState();
    updateUI();
  }

  /**
   * Starts the Break / Inactivity Timer.
   */
  function startBreakTimer(isAuto = false) {
    syncElapsedActiveTime();

    // If subjects were running, stop them
    state.subjects.forEach(s => {
      s.isRunning = false;
      s.lastStartTime = null;
    });
    state.activeSubjectId = null;
    state.activeSubjectStartTime = null;

    state.isBreakTimerRunning = true;
    state.currentBreakSessionStart = Date.now();
    state.lastActiveTimestamp = Date.now();

    playChime('break');
    saveState();
    updateUI();
  }

  /**
   * Stops the Break / Inactivity Timer, calculates the session elapsed seconds,
   * adds to todayBreakSeconds, and saves to localStorage.
   */
  function stopBreakTimer() {
    if (!state.isBreakTimerRunning) return;

    if (state.currentBreakSessionStart) {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.currentBreakSessionStart) / 1000));
      state.todayBreakSeconds += elapsedSeconds;
    }

    state.isBreakTimerRunning = false;
    state.currentBreakSessionStart = null;
    state.lastActiveTimestamp = Date.now();
    saveState();
    updateUI();
  }

  // ==========================================================================
  // 5. 5:00 AM AUTOMATIC RESET & DAILY ARCHIVE ENGINE
  // ==========================================================================

  function check5amDailyCycleReset() {
    const currentCycle = getStudyCycleDate();
    if (state.activeCycleDate && state.activeCycleDate !== currentCycle) {
      // Finalize running break if active
      if (state.isBreakTimerRunning && state.currentBreakSessionStart) {
        const elapsed = Math.max(0, Math.floor((Date.now() - state.currentBreakSessionStart) / 1000));
        state.todayBreakSeconds += elapsed;
        state.isBreakTimerRunning = false;
        state.currentBreakSessionStart = null;
      }

      // 1. Archive yesterday's data into history
      const totalStudySecs = calculateTotalStudySeconds();
      const targetSecs = (state.targetHours || 10.0) * 3600;
      const habitsDone = state.habits.filter(h => h.completed).length;
      const totalHabits = state.habits.length;
      const goalMet = totalStudySecs >= targetSecs || (totalHabits > 0 && habitsDone >= Math.ceil(totalHabits * 0.8));

      const logEntry = {
        date: state.activeCycleDate,
        totalStudySeconds: totalStudySecs,
        breakSeconds: state.todayBreakSeconds,
        mathsQuestions: state.mathsQuestionsDone,
        habitsCompleted: habitsDone,
        totalHabits: totalHabits,
        isBreakDay: state.isBreakDay,
        goalMet: goalMet,
        habitsSnapshot: state.habits.map(h => ({ title: h.title, completed: h.completed })),
        subjectBreakdown: state.subjects.map(s => ({ name: s.name, seconds: s.seconds }))
      };

      // Check if entry already exists
      const existingIdx = state.history.findIndex(h => h.date === state.activeCycleDate);
      if (existingIdx >= 0) {
        state.history[existingIdx] = logEntry;
      } else {
        state.history.unshift(logEntry);
      }

      // 2. Set yesterday's break time for direct comparison!
      state.yesterdayBreakSeconds = state.todayBreakSeconds;

      // 3. Update streak
      if (goalMet || state.isBreakDay) {
        state.consecutiveStreak = (state.consecutiveStreak || 0) + 1;
        checkMilestoneUnlocks(state.consecutiveStreak);
      } else {
        state.consecutiveStreak = 0;
      }

      // 4. Reset today's counters for new 5:00 AM cycle
      state.subjects.forEach(s => {
        s.seconds = 0;
        s.isRunning = false;
      });
      state.todayBreakSeconds = 0;
      state.mathsQuestionsDone = 0;
      state.isBreakDay = false;
      state.isBreakTimerRunning = false;
      state.currentBreakSessionStart = null;

      // Uncheck habits for the new day
      state.habits.forEach(h => {
        h.completed = false;
      });

      // Update active cycle date
      state.activeCycleDate = currentCycle;
      saveState();
    }
  }

  // Check if consecutive streak unlocked a new milestone
  function checkMilestoneUnlocks(streak) {
    const eligible = MILESTONES.filter(m => m.streak <= streak);
    eligible.forEach(m => {
      if (!state.claimedMilestones.includes(m.streak)) {
        // Trigger Treasure Chest Unlock Modal
        openRewardModal(m);
      }
    });
  }

  // ==========================================================================
  // 6. DYNAMIC ACCOUNTABILITY & COMPARISON ENGINE
  // ==========================================================================

  function updateAccountabilityQuote() {
    const quoteHeader = document.getElementById('quote-accountability-header');
    const quoteStatusTag = document.getElementById('quote-status-tag');
    const quoteNotice = document.getElementById('quote-comparison-notice');
    const quoteText = document.getElementById('quote-text');
    const quoteContext = document.getElementById('quote-context');

    if (!quoteNotice || !quoteText) return;

    // Calculate current running break duration
    let currentTotalBreakSecs = state.todayBreakSeconds;
    if (state.isBreakTimerRunning && state.currentBreakSessionStart) {
      currentTotalBreakSecs += Math.floor((Date.now() - state.currentBreakSessionStart) / 1000);
    }

    const yBreak = state.yesterdayBreakSeconds || 0;
    const diffSecs = currentTotalBreakSecs - yBreak;
    const diffMins = Math.round(Math.abs(diffSecs) / 60);

    // Dynamic feedback based on break comparison
    if (yBreak === 0) {
      quoteNotice.className = "p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 mb-3 leading-relaxed font-sans";
      quoteNotice.innerHTML = `<strong>Day 1 Baseline Mode:</strong> "Kal ka comparison kal hoga—aaj har ek minute monitor karo. Har ghanta Tier 1 cutoffs ke nazdeek le jaayega!"`;
      if (quoteStatusTag) quoteStatusTag.textContent = "BASELINE BREAK MONITORING";
    } else if (diffSecs > 0) {
      // Taken MORE break than yesterday -> STRICT WARNING
      quoteNotice.className = "p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 mb-3 leading-relaxed font-sans";
      quoteNotice.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Strict Warning:</span> "Kal itni break li, aaj hum isse kam break lenge aur zyada study karenge! You have already exceeded yesterday's break by <strong>${diffMins} minutes</strong>. Close social media and get back to your study desk immediately!"`;
      if (quoteStatusTag) quoteStatusTag.textContent = "EXCESS BREAK WARNING • ACCOUNTABILITY";
    } else {
      // Taken LESS break than yesterday -> FOCUS DISCIPLINE PRAISE
      quoteNotice.className = "p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 mb-3 leading-relaxed font-sans";
      quoteNotice.innerHTML = `<span class="text-emerald-400 font-bold">⚡ Controlled Focus:</span> "Great discipline! You have kept your break <strong>${diffMins} minutes less</strong> than yesterday. Maintain this relentless pacing for SSC CGL 2027 & Railway NTPC."`;
      if (quoteStatusTag) quoteStatusTag.textContent = "CONTROLLED BREAK DISCIPLINE";
    }

    // Display selected rotating anti-procrastination quote
    const cur = DISCIPLINE_QUOTES[currentQuoteIndex % DISCIPLINE_QUOTES.length];
    quoteText.textContent = `"${cur.quote}"`;
    if (quoteContext) quoteContext.textContent = cur.context;
  }

  // ==========================================================================
  // 7. UI RENDERING & COMPONENT MANAGERS
  // ==========================================================================

  function updateUI() {
    updateCountdownTicker();
    update5amCountdown();
    renderHomeView();
    renderSubjectCards();
    renderHabitsList();
    renderWeakAreas();
    renderSyllabus();
    renderTargetHub();
    renderSpacedRepetition();
    renderCalendar();
    renderDayInspectionCard();
    renderMilestones();
    renderEnergyRating();
    renderEnergyHistory();
    renderVault();
    renderJournal();
    renderTodoHub();
    renderMockTrends();
    renderHistoryTable();
    updateSidebarStatus();
    updateAccountabilityQuote();
  }

  // --- 7A. HOMEPAGE ("ASPIRANT COMMAND CENTER") ---
  function renderHomeView() {
    const totalStudySecs = calculateTotalStudySeconds();
    const targetSecs = (state.targetHours || 10.0) * 3600;
    const pct = Math.min(100, Math.round((totalStudySecs / targetSecs) * 100));

    // a) Main "Total Hours Today" circular display
    const totalDisplay = document.getElementById('home-total-hours-display');
    const targetStat = document.getElementById('home-target-stat');
    const targetPct = document.getElementById('home-target-pct');
    const circle = document.getElementById('home-progress-circle');

    if (totalDisplay) totalDisplay.textContent = formatHMS(totalStudySecs);
    if (targetStat) targetStat.textContent = `${state.targetHours.toFixed(1)}h`;
    if (targetPct) targetPct.textContent = `(${pct}%)`;

    if (circle) {
      const radius = 100;
      const circumference = 2 * Math.PI * radius; // ~628.3
      const offset = circumference - (pct / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
      circle.style.stroke = pct >= 100 ? '#10b981' : '#10b981';
    }

    // Active Timer Status Badge
    const statusBadge = document.getElementById('home-timer-status-badge');
    const activeSubject = state.subjects.find(s => s.isRunning);
    if (statusBadge) {
      if (activeSubject) {
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span class="text-emerald-300 font-bold">Active: ${activeSubject.name.split('(')[0].trim()}</span>`;
      } else if (state.isBreakTimerRunning) {
        let curBreakSecs = 0;
        if (state.currentBreakSessionStart) {
          curBreakSecs = Math.floor((Date.now() - state.currentBreakSessionStart) / 1000);
        }
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span class="text-amber-300 font-bold">On Break (${formatMS(curBreakSecs)})</span>`;
      } else {
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-500"></span><span>All Timers Idle • Ready to Focus</span>`;
      }
    }

    // Break Day Toggle Button
    const breakDayBtn = document.getElementById('home-break-day-toggle');
    if (breakDayBtn) {
      if (state.isBreakDay) {
        breakDayBtn.className = "px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40";
        breakDayBtn.textContent = "✓ Break Day Active";
      } else {
        breakDayBtn.className = "px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition";
        breakDayBtn.textContent = "☕ Mark Break Day";
      }
    }

    // b) Compact "Subject-wise Hours Breakdown" summary card
    renderSubjectBreakdown();

    // d) "Break & Inactivity Tracker" card
    let currentTotalBreakSecs = state.todayBreakSeconds;
    let sessionSecs = 0;
    if (state.isBreakTimerRunning && state.currentBreakSessionStart) {
      sessionSecs = Math.floor((Date.now() - state.currentBreakSessionStart) / 1000);
      currentTotalBreakSecs += sessionSecs;
    }

    const todayBreakDisp = document.getElementById('home-break-today-display');
    const yesterdayBreakDisp = document.getElementById('home-break-yesterday-display');
    const curSessionLabel = document.getElementById('home-break-current-session-label');
    const diffBadge = document.getElementById('home-break-diff-badge');
    const breakStateBadge = document.getElementById('home-break-state-badge');
    const manualBreakBtn = document.getElementById('btn-manual-break-toggle');

    if (todayBreakDisp) todayBreakDisp.textContent = formatHMS(currentTotalBreakSecs);
    if (yesterdayBreakDisp) yesterdayBreakDisp.textContent = formatHMS(state.yesterdayBreakSeconds || 0);

    if (curSessionLabel) {
      if (state.isBreakTimerRunning) {
        curSessionLabel.innerHTML = `<span class="text-amber-400 font-bold">Active Break Session: ${formatMS(sessionSecs)}</span>`;
      } else {
        curSessionLabel.textContent = `Auto-linked to subject timers`;
      }
    }

    if (breakStateBadge) {
      if (state.isBreakTimerRunning) {
        breakStateBadge.className = "px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 break-active-pulse";
        breakStateBadge.textContent = "🟢 Break Timer Running";
      } else {
        breakStateBadge.className = "px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700";
        breakStateBadge.textContent = "⏸️ Study Mode Active";
      }
    }

    if (manualBreakBtn) {
      if (state.isBreakTimerRunning) {
        manualBreakBtn.textContent = "⏸️ Pause Break Timer";
        manualBreakBtn.className = "px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition active:scale-95";
      } else {
        manualBreakBtn.textContent = "☕ Start Manual Break";
        manualBreakBtn.className = "px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition active:scale-95";
      }
    }

    // Direct comparison difference badge
    if (diffBadge) {
      const yBreak = state.yesterdayBreakSeconds || 0;
      const diff = currentTotalBreakSecs - yBreak;
      const diffMins = Math.round(Math.abs(diff) / 60);

      if (yBreak === 0) {
        diffBadge.className = "text-[11px] font-semibold mt-1 text-slate-400";
        diffBadge.textContent = "First tracking cycle (no yesterday record yet)";
      } else if (diff > 0) {
        diffBadge.className = "text-[11px] font-bold mt-1 text-rose-400";
        diffBadge.textContent = `+${diffMins} mins more break than yesterday! Warning!`;
      } else if (diff < 0) {
        diffBadge.className = "text-[11px] font-bold mt-1 text-emerald-400";
        diffBadge.textContent = `-${diffMins} mins less break than yesterday! Excellent discipline!`;
      } else {
        diffBadge.className = "text-[11px] font-semibold mt-1 text-slate-300";
        diffBadge.textContent = "Break time is identical to yesterday.";
      }
    }

    // Top Header Break Status Pill
    const topBreakPill = document.getElementById('top-break-active-pill');
    const topBreakTime = document.getElementById('top-break-active-time');
    if (topBreakPill && topBreakTime) {
      if (state.isBreakTimerRunning) {
        topBreakPill.classList.remove('hidden');
        topBreakPill.classList.add('flex');
        topBreakTime.textContent = formatMS(sessionSecs);
      } else {
        topBreakPill.classList.add('hidden');
        topBreakPill.classList.remove('flex');
      }
    }

    // Top Header 5 AM Countdown
    update5amCountdown();

    // Top Header Streak
    const topStreak = document.getElementById('top-streak-count');
    if (topStreak) topStreak.textContent = `${state.consecutiveStreak || 0} Days`;
  }

  // --- 7B. SUBJECT-WISE BREAKDOWN SUMMARY CARD (HOMEPAGE b) ---
  function renderSubjectBreakdown() {
    const list = document.getElementById('home-subject-breakdown-list');
    const totalTag = document.getElementById('home-breakdown-total-tag');
    if (!list) return;

    const totalStudySecs = calculateTotalStudySeconds();
    if (totalTag) {
      totalTag.textContent = `Total: ${(totalStudySecs / 3600).toFixed(1)} hrs`;
    }

    if (!state.subjects || state.subjects.length === 0) {
      list.innerHTML = `<p class="text-xs text-slate-500">No subjects configured</p>`;
      return;
    }

    list.innerHTML = state.subjects.map(s => {
      const hrs = (s.seconds / 3600).toFixed(1);
      const pct = totalStudySecs > 0 ? Math.round((s.seconds / totalStudySecs) * 100) : 0;
      const cleanName = s.name.split('(')[0].trim();

      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-slate-200 flex items-center gap-1.5">
              ${s.isRunning ? '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>' : '<span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>'}
              ${cleanName}
            </span>
            <div class="flex items-center gap-2 font-mono">
              <span class="text-slate-400 text-[11px]">${pct}%</span>
              <span class="font-bold text-slate-100">${formatHMS(s.seconds)}</span>
            </div>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full ${s.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/80'} transition-all duration-300"
              style="width: ${pct}%"
            ></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 7C. WEAK AREAS RADAR CARD (HOMEPAGE c) ---
  function renderWeakAreas() {
    const container = document.getElementById('home-weak-areas-container');
    if (!container) return;

    if (!state.weakAreas || state.weakAreas.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-500 space-y-1">
          <p class="text-xs">No weak areas logged yet.</p>
          <p class="text-[11px] text-slate-600">Analyze a mock PDF or click "+ Add" above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.weakAreas.map(w => {
      const subjectColors = {
        'Maths': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        'English': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        'Reasoning': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        'GA': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        'Mock': 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      };
      const badgeClass = subjectColors[w.subject] || 'text-slate-400 bg-slate-800 border-slate-700';

      return `
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 group hover:border-slate-700 transition">
          <div class="flex items-start gap-2.5 flex-1">
            <button
              data-toggle-weakness="${w.id}"
              class="mt-0.5 w-4 h-4 rounded border ${w.resolved ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold flex items-center justify-center text-[10px]' : 'border-slate-600 hover:border-emerald-400'} transition"
              title="${w.resolved ? 'Mark unresolved' : 'Mark resolved'}"
            >
              ${w.resolved ? '✓' : ''}
            </button>
            <div class="space-y-0.5 flex-1">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${badgeClass}">
                  ${w.subject}
                </span>
                <span class="text-xs font-semibold ${w.resolved ? 'line-through text-slate-500' : 'text-slate-200'}">
                  ${w.topic}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 leading-snug">
                ${w.advice}
              </p>
            </div>
          </div>
          <button
            data-delete-weakness="${w.id}"
            class="text-slate-600 hover:text-rose-400 text-xs transition opacity-0 group-hover:opacity-100"
            title="Delete from Radar"
          >
            ✕
          </button>
        </div>
      `;
    }).join('');

    // Attach listeners for weak area toggle & delete
    container.querySelectorAll('[data-toggle-weakness]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-weakness');
        const item = state.weakAreas.find(w => w.id === id);
        if (item) {
          item.resolved = !item.resolved;
          saveState();
          renderWeakAreas();
        }
      });
    });

    container.querySelectorAll('[data-delete-weakness]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-weakness');
        state.weakAreas = state.weakAreas.filter(w => w.id !== id);
        saveState();
        renderWeakAreas();
      });
    });
  }

  // --- 7D. SUBJECT STOPWATCHES & 320 MATHS TARGET (SECTION 2) ---
  function renderSubjectCards() {
    const grid = document.getElementById('subjects-cards-grid');
    if (!grid) return;

    // Maths Questions Bar
    const mathsCount = document.getElementById('maths-qs-count');
    const mathsPct = document.getElementById('maths-qs-pct');
    const mathsBar = document.getElementById('maths-qs-bar');
    const done = state.mathsQuestionsDone || 0;
    const mPct = Math.min(100, Math.round((done / 320) * 100));

    if (mathsCount) mathsCount.textContent = done;
    if (mathsPct) mathsPct.textContent = `${mPct}%`;
    if (mathsBar) mathsBar.style.width = `${mPct}%`;

    // Render each subject stopwatch
    grid.innerHTML = state.subjects.map(s => {
      return `
        <div class="p-5 rounded-3xl bg-[#0b1120] border ${s.isRunning ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10' : 'border-slate-800'} space-y-4 transition">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                ${s.isRunning ? '<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-600"></span>'}
                <h4 class="text-sm font-bold text-white">${s.name}</h4>
              </div>
              <span class="text-[11px] font-mono text-slate-400">
                ${s.isRunning ? 'Running • Auto-links to Break' : 'Stopped'}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                data-edit-subject-time="${s.id}"
                class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
                title="Manually correct hours, minutes, seconds"
              >
                ✏️ Edit
              </button>
              ${!s.isDefault ? `
                <button
                  data-delete-subject="${s.id}"
                  class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 text-[11px] transition"
                  title="Remove custom subject"
                >
                  ✕
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Digital Readout -->
          <div class="py-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span class="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              ${formatHMS(s.seconds)}
            </span>
          </div>

          <!-- Action Controls -->
          <div class="flex items-center gap-2">
            ${s.isRunning ? `
              <button
                data-pause-subject="${s.id}"
                class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>⏸️ Pause (Starts Break)</span>
              </button>
            ` : `
              <button
                data-start-subject="${s.id}"
                class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition active:scale-95 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <span>▶ Start Focus</span>
              </button>
            `}

            <button
              data-reset-subject="${s.id}"
              class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-mono transition"
              title="Reset this stopwatch to 0"
            >
              Reset
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Stopwatch Button Listeners
    grid.querySelectorAll('[data-start-subject]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-start-subject');
        startSubjectTimer(id);
      });
    });

    grid.querySelectorAll('[data-pause-subject]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-pause-subject');
        pauseSubjectTimer(id);
      });
    });

    grid.querySelectorAll('[data-reset-subject]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-reset-subject');
        const s = state.subjects.find(sub => sub.id === id);
        if (s && confirm(`Reset time for ${s.name}?`)) {
          s.seconds = 0;
          s.isRunning = false;
          s.lastStartTime = null;
          if (state.activeSubjectId === id) {
            state.activeSubjectId = null;
            state.activeSubjectStartTime = null;
          }
          saveState();
          updateUI();
        }
      });
    });

    grid.querySelectorAll('[data-edit-subject-time]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-edit-subject-time');
        openEditSubjectModal(id);
      });
    });

    grid.querySelectorAll('[data-delete-subject]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-subject');
        if (confirm('Delete this custom subject?')) {
          state.subjects = state.subjects.filter(sub => sub.id !== id);
          saveState();
          updateUI();
        }
      });
    });
  }

  // --- 7E. HABIT TRACKER & CUSTOMIZATION (SECTION 3) ---
  function renderHabitsList() {
    const container = document.getElementById('habits-list-container');
    const doneSpan = document.getElementById('habits-completed-count');
    const totalSpan = document.getElementById('habits-total-count');
    const pctSpan = document.getElementById('habits-pct-count');

    if (!container) return;

    const total = state.habits.length;
    const completed = state.habits.filter(h => h.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (doneSpan) doneSpan.textContent = completed;
    if (totalSpan) totalSpan.textContent = total;
    if (pctSpan) pctSpan.textContent = `${pct}%`;

    if (total === 0) {
      container.innerHTML = `<div class="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 text-center text-xs text-slate-500">No habits added yet. Use the input field above to add your daily disciplines.</div>`;
      return;
    }

    container.innerHTML = state.habits.map(h => {
      return `
        <div class="p-4 rounded-2xl bg-[#0b1120] border ${h.completed ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800'} flex items-center justify-between gap-3 transition">
          <label class="flex items-center gap-3 cursor-pointer flex-1 select-none">
            <input
              type="checkbox"
              data-toggle-habit="${h.id}"
              ${h.completed ? 'checked' : ''}
              class="w-5 h-5 rounded-md accent-emerald-500 cursor-pointer"
            />
            <span class="text-sm font-semibold ${h.completed ? 'line-through text-slate-400' : 'text-slate-100'}">
              ${h.title}
            </span>
          </label>

          <div class="flex items-center gap-1.5">
            <button
              data-edit-habit="${h.id}"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title="Edit habit title"
            >
              ✏️ Edit
            </button>
            <button
              data-delete-habit="${h.id}"
              class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 text-xs transition"
              title="Delete habit"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach habit listeners
    container.querySelectorAll('[data-toggle-habit]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-habit');
        const habit = state.habits.find(h => h.id === id);
        if (habit) {
          habit.completed = e.currentTarget.checked;
          if (habit.completed) playChime('start');
          saveState();
          renderHabitsList();
          renderCalendar(); // Re-sync calendar green dots
          renderDayInspectionCard();
        }
      });
    });

    container.querySelectorAll('[data-edit-habit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-edit-habit');
        openEditHabitModal(id);
      });
    });

    container.querySelectorAll('[data-delete-habit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-habit');
        if (confirm('Delete this habit?')) {
          state.habits = state.habits.filter(h => h.id !== id);
          saveState();
          renderHabitsList();
          renderCalendar();
          renderDayInspectionCard();
        }
      });
    });
  }

  // --- 7F. SPACED REPETITION & REVISION HUB (SECTION 5) ---
  let activeRepFilter = 'all';

  function renderSpacedRepetition() {
    const list = document.getElementById('spaced-rep-list');
    if (!list) return;

    let items = state.spacedRepChapters || [];
    if (activeRepFilter === 'overdue') {
      items = items.filter(c => getDaysAgo(c.lastRevised) >= 7);
    } else if (activeRepFilter === 'soon') {
      items = items.filter(c => {
        const d = getDaysAgo(c.lastRevised);
        return d >= 3 && d <= 6;
      });
    } else if (activeRepFilter === 'safe') {
      items = items.filter(c => getDaysAgo(c.lastRevised) <= 2);
    }

    if (items.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">No chapters match this filter.</div>`;
      return;
    }

    list.innerHTML = items.map(c => {
      const days = getDaysAgo(c.lastRevised);
      let badgeHtml = '';
      let borderClass = 'border-slate-800';

      if (days >= 7) {
        badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 Forgetting Curve Alert (${days}d ago)</span>`;
        borderClass = 'border-rose-900/60 bg-rose-950/10';
      } else if (days >= 3) {
        badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Time to Revise (${days}d ago)</span>`;
        borderClass = 'border-amber-900/60 bg-amber-950/10';
      } else {
        badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Safe (${days === 0 ? 'Today' : `${days}d ago`})</span>`;
        borderClass = 'border-emerald-900/60 bg-emerald-950/10';
      }

      return `
        <div class="p-4 rounded-2xl bg-[#0b1120] border ${borderClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">${c.subject}</span>
              <h4 class="text-sm font-bold text-white">${c.title}</h4>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Last: ${c.lastRevised || 'Never'}</span>
              <span>•</span>
              <span>🔁 ${c.revisionCount || 0} Revisions</span>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            ${badgeHtml}
            <button
              data-revise-chapter="${c.id}"
              class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition active:scale-95 shadow-sm"
            >
              ✓ Revised Today
            </button>
            <button
              data-delete-chapter="${c.id}"
              class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
              title="Delete chapter"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Action listeners for Spaced Repetition
    list.querySelectorAll('[data-revise-chapter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-revise-chapter');
        const c = state.spacedRepChapters.find(ch => ch.id === id);
        if (c) {
          c.lastRevised = getStudyCycleDate();
          c.revisionCount = (c.revisionCount || 0) + 1;
          playChime('start');
          saveState();
          renderSpacedRepetition();
        }
      });
    });

    list.querySelectorAll('[data-delete-chapter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-chapter');
        if (confirm('Delete this chapter?')) {
          state.spacedRepChapters = state.spacedRepChapters.filter(ch => ch.id !== id);
          saveState();
          renderSpacedRepetition();
        }
      });
    });
  }

  // --- 7F1. TARGET EXAM COUNTDOWN TICKER & LIVE DIGITAL CLOCK ---
  function updateCountdownTicker() {
    const titleEl = document.getElementById('home-exam-title');
    const dateLabel = document.getElementById('home-exam-target-date-label');
    const daysEl = document.getElementById('ticker-days');
    const hoursEl = document.getElementById('ticker-hours');
    const minsEl = document.getElementById('ticker-minutes');
    const secsEl = document.getElementById('ticker-seconds');
    const inlineDatePicker = document.getElementById('inline-exam-date-picker');

    const liveClockEl = document.getElementById('top-live-clock');
    const liveDateEl = document.getElementById('top-live-date');
    const tickerLiveClockEl = document.getElementById('ticker-current-time');
    const tickerLiveDateEl = document.getElementById('ticker-current-date');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (liveClockEl) liveClockEl.textContent = timeStr;
    if (liveDateEl) liveDateEl.textContent = dateStr;
    if (tickerLiveClockEl) tickerLiveClockEl.textContent = timeStr;
    if (tickerLiveDateEl) tickerLiveDateEl.textContent = `(${dateStr})`;

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const examTitle = state.targetExamTitle || DEFAULT_TARGET_EXAM.title;
    const targetDateStr = state.targetExamDate || DEFAULT_TARGET_EXAM.date;

    if (titleEl) titleEl.textContent = examTitle;

    // Never overwrite inline input while user is actively interacting with date picker
    if (inlineDatePicker && document.activeElement !== inlineDatePicker) {
      if (inlineDatePicker.value !== targetDateStr) {
        inlineDatePicker.value = targetDateStr;
      }
    }

    try {
      if (targetDateStr && targetDateStr.includes('-')) {
        const parts = targetDateStr.split('-');
        const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const formatted = dObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        if (dateLabel) dateLabel.textContent = `Target: ${formatted}`;
      } else if (dateLabel) {
        dateLabel.textContent = `Target: ${targetDateStr}`;
      }
    } catch (e) {
      if (dateLabel) dateLabel.textContent = `Target: ${targetDateStr}`;
    }

    let targetTime = 0;
    try {
      if (targetDateStr && targetDateStr.includes('-')) {
        const parts = targetDateStr.split('-');
        targetTime = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 9, 0, 0).getTime();
      } else if (targetDateStr) {
        targetTime = new Date(targetDateStr).getTime();
      }
    } catch (e) {
      targetTime = 0;
    }

    const diff = Math.max(0, targetTime - now.getTime());

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    daysEl.textContent = String(days).padStart(3, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  // --- 7F2. CUSTOMIZED SYLLABUS CHECKLIST ---
  function renderSyllabus() {
    const list = document.getElementById('syllabus-chapters-list');
    if (!list) return;

    const completedCountEl = document.getElementById('syllabus-completed-count');
    const totalCountEl = document.getElementById('syllabus-total-count');
    const pctCountEl = document.getElementById('syllabus-pct-count');
    const progressBar = document.getElementById('syllabus-progress-bar');

    // Update active tab styles
    document.querySelectorAll('#syllabus-subject-tabs button').forEach(btn => {
      const sub = btn.getAttribute('data-syl-subject');
      if (sub === state.activeSyllabusSubject) {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white transition whitespace-nowrap shadow-md shadow-emerald-500/20';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition whitespace-nowrap';
      }
    });

    // Update active filter chip styles
    document.querySelectorAll('#syllabus-status-filter-chips button').forEach(btn => {
      const filter = btn.getAttribute('data-status-filter');
      if (filter === state.activeSyllabusStatus) {
        btn.className = 'px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold';
      } else {
        btn.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px]';
      }
    });

    // Subject pool for progress calculation
    let subjectPool = state.syllabus || [];
    if (state.activeSyllabusSubject !== 'all') {
      subjectPool = subjectPool.filter(t => t.subject.toLowerCase() === state.activeSyllabusSubject.toLowerCase());
    }

    const totalTopics = subjectPool.length;
    const completedTopics = subjectPool.filter(t => t.status === 'Completed').length;
    const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    if (completedCountEl) completedCountEl.textContent = completedTopics;
    if (totalCountEl) totalCountEl.textContent = totalTopics;
    if (pctCountEl) pctCountEl.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;

    // Filter by status for display list
    let displayList = subjectPool;
    if (state.activeSyllabusStatus !== 'all') {
      displayList = displayList.filter(t => t.status === state.activeSyllabusStatus);
    }

    if (displayList.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-xs text-slate-500">No topics match the selected subject and filter status.</div>`;
      return;
    }

    const subjectLabels = {
      maths: '📐 Quantitative Aptitude',
      english: '📖 English Language',
      reasoning: '🧩 Reasoning & GI',
      ga: '🌍 General Awareness',
      railway: '🚆 Railway NTPC Special'
    };

    list.innerHTML = displayList.map(item => {
      let statusClass = 'bg-slate-800 text-slate-400 border-slate-700';
      let statusIcon = '⭕';
      if (item.status === 'Completed') {
        statusClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        statusIcon = '✅';
      } else if (item.status === 'In Progress') {
        statusClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        statusIcon = '⏳';
      }

      return `
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <button
              data-toggle-syllabus-status="${item.id}"
              class="px-2.5 py-1 rounded-lg border ${statusClass} text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95 hover:opacity-90"
              title="Click to cycle status: Not Started ➔ In Progress ➔ Completed"
            >
              <span>${statusIcon}</span>
              <span>${item.status}</span>
            </button>
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-semibold text-white truncate">${item.title}</h4>
              <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span class="font-mono text-emerald-400/90">${subjectLabels[item.subject] || item.subject}</span>
                <span>•</span>
                <span class="text-slate-500 font-mono">${item.weightage || 'Medium (1-2 Qs)'}</span>
              </div>
            </div>
          </div>
          <button
            data-delete-syllabus-topic="${item.id}"
            class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition shrink-0"
            title="Remove topic"
          >
            ✕
          </button>
        </div>
      `;
    }).join('');

    // Attach topic status toggler
    list.querySelectorAll('[data-toggle-syllabus-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-syllabus-status');
        const topic = state.syllabus.find(t => t.id === id);
        if (topic) {
          if (topic.status === 'Not Started') {
            topic.status = 'In Progress';
          } else if (topic.status === 'In Progress') {
            topic.status = 'Completed';
            playChime('start');
          } else {
            topic.status = 'Not Started';
          }
          saveState();
          renderSyllabus();
        }
      });
    });

    list.querySelectorAll('[data-delete-syllabus-topic]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-syllabus-topic');
        if (confirm('Remove this topic from your syllabus checklist?')) {
          state.syllabus = state.syllabus.filter(t => t.id !== id);
          saveState();
          renderSyllabus();
        }
      });
    });
  }

  // --- 7F3. DAILY TARGETS & REVISION HUB ENGINE ---

  function getDateTargetEntry(dateStr) {
    if (!state.dateTargets) state.dateTargets = {};
    if (!state.dateTargets[dateStr]) {
      state.dateTargets[dateStr] = {
        mathsDone: (dateStr === state.activeCycleDate) ? (state.mathsQuestionsDone || 0) : 0,
        mathsTarget: 320,
        mathsCompleted: false,
        tasks: []
      };
    }
    // If viewing active cycle date, synchronize mathsDone with live state
    if (dateStr === state.activeCycleDate) {
      state.dateTargets[dateStr].mathsDone = state.mathsQuestionsDone || 0;
      state.dateTargets[dateStr].mathsCompleted = (state.mathsQuestionsDone || 0) >= (state.dateTargets[dateStr].mathsTarget || 320);
    }
    return state.dateTargets[dateStr];
  }

  function renderTargetHub() {
    if (!state.selectedTargetDate) state.selectedTargetDate = getStudyCycleDate();
    const curDate = state.selectedTargetDate;
    const activeCycle = state.activeCycleDate || getStudyCycleDate();

    // 1. Sync Date Picker Input & Display Label
    const datePicker = document.getElementById('target-hub-date-picker');
    if (datePicker && datePicker.value !== curDate) {
      datePicker.value = curDate;
    }

    const dateDisplay = document.getElementById('target-hub-date-display');
    if (dateDisplay) {
      if (curDate === activeCycle) {
        dateDisplay.textContent = 'Today (Live)';
        dateDisplay.className = 'hidden sm:inline-block text-xs font-mono font-bold text-emerald-400 pl-1 border-l border-slate-800';
      } else if (curDate === getPastCycleDate(1)) {
        dateDisplay.textContent = 'Yesterday (Log)';
        dateDisplay.className = 'hidden sm:inline-block text-xs font-mono font-bold text-slate-400 pl-1 border-l border-slate-800';
      } else if (curDate === getFutureCycleDate(1)) {
        dateDisplay.textContent = 'Tomorrow (Plan)';
        dateDisplay.className = 'hidden sm:inline-block text-xs font-mono font-bold text-cyan-400 pl-1 border-l border-slate-800';
      } else {
        dateDisplay.textContent = formatMonthDayShort(curDate);
        dateDisplay.className = 'hidden sm:inline-block text-xs font-mono font-semibold text-slate-300 pl-1 border-l border-slate-800';
      }
    }

    // 2. Context Status Banner
    const contextBanner = document.getElementById('target-hub-context-banner');
    if (contextBanner) {
      if (curDate === activeCycle) {
        contextBanner.className = 'p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono';
        contextBanner.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-300">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="font-bold uppercase tracking-wider">ACTIVE STUDY CYCLE (LIVE TODAY):</span>
            <span class="text-slate-300">${curDate}</span>
          </div>
          <div class="text-[11px] text-emerald-400 font-sans">
            ⚡ Linked to live stopwatches & active 320 Maths questions tracker.
          </div>
        `;
      } else if (curDate < activeCycle) {
        const dToday = new Date(activeCycle + 'T12:00:00');
        const dCur = new Date(curDate + 'T12:00:00');
        const diffDays = Math.round((dToday - dCur) / 86400000);
        contextBanner.className = 'p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono';
        contextBanner.innerHTML = `
          <div class="flex items-center gap-2 text-slate-300">
            <span class="text-sm">🕒</span>
            <span class="font-bold text-amber-400 uppercase tracking-wider">PAST DATE ARCHIVE (${diffDays} days ago):</span>
            <span class="text-white font-bold">${curDate}</span>
          </div>
          <div class="text-[11px] text-slate-400 font-sans">
            📜 Viewing historical targets log. Completed status and notes persist date-wise.
          </div>
        `;
      } else {
        const dToday = new Date(activeCycle + 'T12:00:00');
        const dCur = new Date(curDate + 'T12:00:00');
        const diffDays = Math.round((dCur - dToday) / 86400000);
        contextBanner.className = 'p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono';
        contextBanner.innerHTML = `
          <div class="flex items-center gap-2 text-cyan-300">
            <span class="text-sm">📅</span>
            <span class="font-bold uppercase tracking-wider">FUTURE SCHEDULED TARGET (${diffDays} days ahead):</span>
            <span class="text-white font-bold">${curDate}</span>
          </div>
          <div class="text-[11px] text-cyan-400 font-sans">
            🚀 Pre-plan upcoming Sunday mocks and study targets. Stays scheduled until this day arrives!
          </div>
        `;
      }
    }

    // 3. Render Subcomponents
    renderTargetTimelineStrip();
    renderDateMathsMission();
    renderDateTasks();
    renderRevisionSystem();
  }

  // --- 7F3.1 TIMELINE STRIP NAVIGATION ---
  function renderTargetTimelineStrip() {
    const strip = document.getElementById('target-hub-timeline-strip');
    if (!strip) return;

    const activeCycle = state.activeCycleDate || getStudyCycleDate();
    const curSelected = state.selectedTargetDate || activeCycle;
    const nextSunday = getNextSundayDate();

    // Generate dates: 3 days past, today, 3 days future + Sunday mock if outside range
    const dateList = [
      getPastCycleDate(3),
      getPastCycleDate(2),
      getPastCycleDate(1),
      activeCycle,
      getFutureCycleDate(1),
      getFutureCycleDate(2),
      getFutureCycleDate(3)
    ];

    if (!dateList.includes(nextSunday)) {
      dateList.push(nextSunday);
    }
    // Also ensure currently selected date is present in strip
    if (!dateList.includes(curSelected)) {
      dateList.push(curSelected);
      dateList.sort();
    }

    strip.innerHTML = dateList.map(dStr => {
      const isSelected = dStr === curSelected;
      const isToday = dStr === activeCycle;
      const isSunday = new Date(dStr + 'T12:00:00').getDay() === 0;
      const dayOfWeek = formatDayOfWeekShort(dStr);
      const dayMonth = formatMonthDayShort(dStr);

      const entry = getDateTargetEntry(dStr);
      const tasks = entry.tasks || [];
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const mathsDone = entry.mathsDone || 0;
      const mathsTarget = entry.mathsTarget || 320;
      const isMathsConquered = mathsDone >= mathsTarget;

      let cardClasses = 'target-timeline-card min-w-[130px] p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between select-none ';
      if (isSelected) {
        cardClasses += 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30';
      } else if (isToday) {
        cardClasses += 'bg-slate-900/90 border-slate-700 hover:border-emerald-500/60';
      } else if (isSunday) {
        cardClasses += 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60';
      } else {
        cardClasses += 'bg-slate-900/60 border-slate-800 hover:border-slate-700';
      }

      let tagHtml = '';
      if (isToday) {
        tagHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500 text-slate-950">TODAY</span>`;
      } else if (dStr === getPastCycleDate(1)) {
        tagHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800">YESTERDAY</span>`;
      } else if (dStr === getFutureCycleDate(1)) {
        tagHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60">TOMORROW</span>`;
      } else if (isSunday) {
        tagHtml = `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60">SUNDAY MOCK</span>`;
      }

      return `
        <button
          data-select-target-date="${dStr}"
          class="${cardClasses}"
          type="button"
        >
          <div class="flex items-center justify-between gap-1 mb-2">
            <span class="text-xs font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}">${dayOfWeek}, ${dayMonth}</span>
            ${tagHtml}
          </div>

          <div class="space-y-1 text-[11px] font-mono">
            <div class="flex items-center justify-between text-slate-400">
              <span>Maths:</span>
              <span class="${isMathsConquered ? 'text-emerald-400 font-bold' : (mathsDone > 0 ? 'text-cyan-400 font-semibold' : 'text-slate-500')}">
                ${isMathsConquered ? '✓ ' : ''}${mathsDone}/${mathsTarget}
              </span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Tasks:</span>
              <span class="${totalTasks > 0 && completedTasks === totalTasks ? 'text-emerald-400 font-bold' : (completedTasks > 0 ? 'text-amber-400' : 'text-slate-500')}">
                ${completedTasks}/${totalTasks} ${totalTasks > 0 && completedTasks === totalTasks ? '✓' : ''}
              </span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    strip.querySelectorAll('[data-select-target-date]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dateVal = e.currentTarget.getAttribute('data-select-target-date');
        if (dateVal) {
          state.selectedTargetDate = dateVal;
          saveState();
          renderTargetHub();
        }
      });
    });
  }

  // --- 7F3.2 DATE-SPECIFIC 320 MATHS MISSION ---
  function renderDateMathsMission() {
    const curDate = state.selectedTargetDate || getStudyCycleDate();
    const activeCycle = state.activeCycleDate || getStudyCycleDate();
    const entry = getDateTargetEntry(curDate);

    const doneCount = entry.mathsDone || 0;
    const targetCount = entry.mathsTarget || 320;
    const isConquered = doneCount >= targetCount;
    const pct = Math.min(100, Math.round((doneCount / targetCount) * 100));

    // Label
    const dateLabelEl = document.getElementById('hub-maths-date-label');
    if (dateLabelEl) {
      if (curDate === activeCycle) {
        dateLabelEl.textContent = 'Today (Live)';
      } else if (curDate === getPastCycleDate(1)) {
        dateLabelEl.textContent = 'Yesterday (' + formatMonthDayShort(curDate) + ')';
      } else if (curDate === getFutureCycleDate(1)) {
        dateLabelEl.textContent = 'Tomorrow (' + formatMonthDayShort(curDate) + ')';
      } else {
        dateLabelEl.textContent = formatMonthDayShort(curDate);
      }
    }

    // Counts & Percentage
    const doneEl = document.getElementById('hub-maths-done-count');
    const targetEl = document.getElementById('hub-maths-target-count');
    const pctEl = document.getElementById('hub-maths-pct');
    if (doneEl) doneEl.textContent = doneCount;
    if (targetEl) targetEl.textContent = targetCount;
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Progress bar
    const barEl = document.getElementById('hub-maths-progress-bar');
    if (barEl) {
      barEl.style.width = `${pct}%`;
      if (isConquered) {
        barEl.className = 'h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-300 shadow-md shadow-emerald-500/30';
      } else if (pct >= 50) {
        barEl.className = 'h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300';
      } else {
        barEl.className = 'h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 transition-all duration-300';
      }
    }

    // Input
    const inputEl = document.getElementById('input-hub-maths-done');
    if (inputEl) inputEl.value = doneCount;

    // Conquered Status Button
    const btnConquered = document.getElementById('btn-toggle-maths-conquered');
    if (btnConquered) {
      if (isConquered) {
        btnConquered.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 text-slate-950 border border-emerald-400 shadow-md shadow-emerald-500/30 transition flex items-center gap-1.5';
        btnConquered.innerHTML = `<span>✓</span> 320 Conquered!`;
      } else {
        btnConquered.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700 transition flex items-center gap-1.5';
        btnConquered.innerHTML = `<span>⚡</span> Mark Conquered`;
      }
    }
  }

  // --- 7F3.3 DATE-SPECIFIC CUSTOM TARGETS & TASKS ---
  function renderDateTasks() {
    const curDate = state.selectedTargetDate || getStudyCycleDate();
    const activeCycle = state.activeCycleDate || getStudyCycleDate();
    const entry = getDateTargetEntry(curDate);
    const tasks = entry.tasks || [];

    // Header labels
    const tasksDateLabel = document.getElementById('hub-tasks-date-label');
    if (tasksDateLabel) {
      if (curDate === activeCycle) tasksDateLabel.textContent = 'Today';
      else if (curDate === getPastCycleDate(1)) tasksDateLabel.textContent = 'Yesterday';
      else if (curDate === getFutureCycleDate(1)) tasksDateLabel.textContent = 'Tomorrow';
      else tasksDateLabel.textContent = formatMonthDayShort(curDate);
    }

    // Progress Badge
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const totalCount = tasks.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const progressBadge = document.getElementById('hub-date-tasks-progress-badge');
    if (progressBadge) {
      progressBadge.textContent = `${completedCount} / ${totalCount} (${pct}%)`;
      if (totalCount > 0 && completedCount === totalCount) {
        progressBadge.className = 'text-emerald-400 font-bold';
      } else if (completedCount > 0) {
        progressBadge.className = 'text-amber-400 font-bold';
      } else {
        progressBadge.className = 'text-slate-400 font-bold';
      }
    }

    // List container
    const list = document.getElementById('date-custom-targets-list');
    if (!list) return;

    if (tasks.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
          <span class="text-2xl">📋</span>
          <p class="text-xs font-semibold text-slate-300">No custom targets scheduled for this date.</p>
          <p class="text-[11px] text-slate-500 font-sans">
            Use the quick input above or click "+ Add Custom Target" to assign mock drills, chapter revisions, or problem sets for ${curDate}.
          </p>
        </div>
      `;
      return;
    }

    list.innerHTML = tasks.map(t => {
      const status = t.status || 'pending';
      let statusBtnHtml = '';
      let itemBg = 'bg-slate-900/90 border-slate-800';

      if (status === 'completed') {
        itemBg = 'bg-emerald-950/20 border-emerald-500/40';
        statusBtnHtml = `
          <button
            data-cycle-task-status="${t.id}"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 transition flex items-center gap-1"
            title="Click to change status"
          >
            <span>✓</span> Done
          </button>
        `;
      } else if (status === 'inprogress') {
        itemBg = 'bg-cyan-950/20 border-cyan-500/40';
        statusBtnHtml = `
          <button
            data-cycle-task-status="${t.id}"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 transition flex items-center gap-1"
            title="Click to change status"
          >
            <span>⚡</span> In Progress
          </button>
        `;
      } else if (status === 'missed') {
        itemBg = 'bg-rose-950/20 border-rose-500/40';
        statusBtnHtml = `
          <button
            data-cycle-task-status="${t.id}"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 transition flex items-center gap-1"
            title="Click to change status"
          >
            <span>✕</span> Missed
          </button>
        `;
      } else {
        // Pending
        statusBtnHtml = `
          <button
            data-cycle-task-status="${t.id}"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 hover:bg-slate-700 transition flex items-center gap-1"
            title="Click to change status"
          >
            <span>⏳</span> Pending
          </button>
        `;
      }

      // Priority badge
      let priorityBadge = '';
      if (t.priority === 'high') {
        priorityBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">High ⚡</span>`;
      } else if (t.priority === 'low') {
        priorityBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">Low</span>`;
      }

      return `
        <div class="p-3.5 rounded-2xl border ${itemBg} transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700">
          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">${escapeHtml(t.subject || 'General')}</span>
              ${priorityBadge}
              ${t.targetQty ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60">${escapeHtml(t.targetQty)}</span>` : ''}
            </div>
            <h4 class="text-xs sm:text-sm font-semibold text-white leading-snug break-words ${status === 'completed' ? 'line-through text-slate-400' : ''}">
              ${escapeHtml(t.title)}
            </h4>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            ${statusBtnHtml}
            <button
              data-delete-task="${t.id}"
              class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs"
              title="Delete target"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Status toggle listeners: pending -> inprogress -> completed -> missed -> pending
    list.querySelectorAll('[data-cycle-task-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-cycle-task-status');
        const task = tasks.find(t => t.id === id);
        if (task) {
          const current = task.status || 'pending';
          if (current === 'pending') task.status = 'inprogress';
          else if (current === 'inprogress') {
            task.status = 'completed';
            playChime('start');
          } else if (current === 'completed') task.status = 'missed';
          else task.status = 'pending';

          saveState();
          renderDateTasks();
          renderTargetTimelineStrip();
        }
      });
    });

    // Delete task listener
    list.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-task');
        if (confirm('Delete this target from this date?')) {
          entry.tasks = entry.tasks.filter(t => t.id !== id);
          saveState();
          renderDateTasks();
          renderTargetTimelineStrip();
        }
      });
    });
  }

  // --- 7F3.4 MULTI-STAGE REVISION ENGINE (R1-R4) ---
  function renderRevisionSystem() {
    const list = document.getElementById('revision-topics-list');
    if (!list) return;

    const curSelectedDate = state.selectedTargetDate || getStudyCycleDate();

    // Update filter tabs styling
    document.querySelectorAll('#revision-subject-filter-tabs button').forEach(btn => {
      const filter = btn.getAttribute('data-rev-filter');
      if (filter === state.activeRevisionFilter) {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white transition whitespace-nowrap shadow-md shadow-emerald-500/20';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition whitespace-nowrap';
      }
    });

    let items = state.revisionTopics || [];
    
    // Support filtering by "Due on Selected Date"
    if (state.activeRevisionFilter === 'due') {
      items = items.filter(t => {
        const daysElapsed = getDaysAgo(t.completedDate);
        let nextStage = null;
        let targetDays = 0;
        if (!t.r1Done) { nextStage = 'R1'; targetDays = 3; }
        else if (!t.r2Done) { nextStage = 'R2'; targetDays = 7; }
        else if (!t.r3Done) { nextStage = 'R3'; targetDays = 15; }
        else if (!t.r4Done) { nextStage = 'R4'; targetDays = 30; }

        if (!nextStage) return false;
        
        // Calculate the specific calendar date this stage is due
        const compDateObj = new Date(t.completedDate + 'T12:00:00');
        compDateObj.setDate(compDateObj.getDate() + targetDays);
        const y = compDateObj.getFullYear();
        const m = String(compDateObj.getMonth() + 1).padStart(2, '0');
        const day = String(compDateObj.getDate()).padStart(2, '0');
        const dueDateStr = `${y}-${m}-${day}`;

        return dueDateStr === curSelectedDate || targetDays <= daysElapsed;
      });
    } else if (state.activeRevisionFilter !== 'all') {
      items = items.filter(t => (t.subject || '').toLowerCase() === state.activeRevisionFilter.toLowerCase());
    }

    if (items.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-xs text-slate-500">No revision topics match this filter. Click "+ Add Revision Topic" above.</div>`;
      return;
    }

    list.innerHTML = items.map(t => {
      const daysElapsed = getDaysAgo(t.completedDate);
      
      // Determine next due stage
      let nextStage = null;
      let targetDays = 0;
      if (!t.r1Done) {
        nextStage = 'R1';
        targetDays = 3;
      } else if (!t.r2Done) {
        nextStage = 'R2';
        targetDays = 7;
      } else if (!t.r3Done) {
        nextStage = 'R3';
        targetDays = 15;
      } else if (!t.r4Done) {
        nextStage = 'R4';
        targetDays = 30;
      }

      let dueBadgeHtml = '';
      if (!nextStage) {
        dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">✓ Mastered</span>`;
      } else {
        const daysLeft = targetDays - daysElapsed;
        if (daysLeft < 0) {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">⚠️ ${nextStage} OVERDUE (${Math.abs(daysLeft)}d)</span>`;
        } else if (daysLeft === 0) {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">⚡ ${nextStage} DUE TODAY!</span>`;
        } else {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">${nextStage} in ${daysLeft}d</span>`;
        }
      }

      const renderStagePill = (label, isDone, stageKey) => {
        return `
          <button
            data-toggle-stage="${t.id}"
            data-stage="${stageKey}"
            class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${isDone ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'}"
            title="Click to toggle ${label} completed"
          >
            ${isDone ? '✓ ' : ''}${label}
          </button>
        `;
      };

      return `
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 hover:border-slate-700 transition">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">${escapeHtml(t.subject)}</span>
                <h4 class="text-xs sm:text-sm font-bold text-white">${escapeHtml(t.title)}</h4>
              </div>
              <p class="text-[10px] text-slate-400 mt-0.5 font-mono">
                Learned: ${t.completedDate} • Elapsed: <strong>${daysElapsed} days</strong>
              </p>
            </div>
            <div class="flex items-center gap-1.5 self-end sm:self-center">
              ${dueBadgeHtml}
              <button
                data-delete-revision-topic="${t.id}"
                class="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition text-xs"
                title="Delete topic"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Interval Stages: R1 (Day 3), R2 (Day 7), R3 (Day 15), R4 (Day 30) -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-800/80">
            <span class="text-[10px] text-slate-500 font-mono">Stages:</span>
            ${renderStagePill('R1 (3d)', t.r1Done, 'r1Done')}
            ${renderStagePill('R2 (7d)', t.r2Done, 'r2Done')}
            ${renderStagePill('R3 (15d)', t.r3Done, 'r3Done')}
            ${renderStagePill('R4 (30d)', t.r4Done, 'r4Done')}
          </div>
        </div>
      `;
    }).join('');

    // Toggle interval listener
    list.querySelectorAll('[data-toggle-stage]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-stage');
        const stage = e.currentTarget.getAttribute('data-stage');
        const topic = state.revisionTopics.find(t => t.id === id);
        if (topic && stage) {
          topic[stage] = !topic[stage];
          if (topic[stage]) playChime('start');
          saveState();
          renderRevisionSystem();
        }
      });
    });

    list.querySelectorAll('[data-delete-revision-topic]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-revision-topic');
        if (confirm('Delete this revision topic?')) {
          state.revisionTopics = state.revisionTopics.filter(t => t.id !== id);
          saveState();
          renderRevisionSystem();
        }
      });
    });
  }

  // --- 7F4. ENERGY & FOCUS RATING ENGINE ---
  let selectedEnergyRating = 5;

  const ENERGY_DESCRIPTIONS = {
    1: '⚡ 1/5: Drained & Mental Fatigue • Need a 15m walk, power nap, or lighter revision.',
    2: '⚡⚡ 2/5: Low Stamina • Distracted or sleepy. Switch to active question solving!',
    3: '⚡⚡⚡ 3/5: Steady Baseline • Consistent focus, maintaining daily study pace.',
    4: '⚡⚡⚡⚡ 4/5: Sharp & Fast • High recall, quick maths arithmetic, zero hesitation.',
    5: '⚡⚡⚡⚡⚡ 5/5: Peak Flow Zone • Brahma Muhurta mastery, deep immersion, zero distraction!'
  };

  function renderEnergyRating() {
    const descEl = document.getElementById('energy-rating-description');
    const reflectionInput = document.getElementById('input-energy-reflection');

    if (state.energyRatingToday) {
      selectedEnergyRating = state.energyRatingToday.rating || 5;
      if (reflectionInput && !reflectionInput.value && state.energyRatingToday.reflection) {
        reflectionInput.value = state.energyRatingToday.reflection;
      }
    }

    if (descEl) {
      descEl.textContent = ENERGY_DESCRIPTIONS[selectedEnergyRating] || ENERGY_DESCRIPTIONS[5];
    }

    document.querySelectorAll('#energy-rating-buttons button').forEach(btn => {
      const val = parseInt(btn.getAttribute('data-energy'), 10);
      if (val === selectedEnergyRating) {
        btn.className = 'energy-btn px-4 py-3 rounded-2xl bg-emerald-500/25 border-2 border-emerald-400 text-white font-mono font-bold flex flex-col items-center gap-1 transition shadow-lg shadow-emerald-500/20';
      } else {
        btn.className = 'energy-btn px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 font-mono font-semibold flex flex-col items-center gap-1 hover:border-slate-500 transition';
      }
    });
  }

  function renderEnergyHistory() {
    const list = document.getElementById('energy-history-list');
    if (!list) return;

    const history = state.energyHistory || [];
    if (history.length === 0) {
      list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">No energy ratings logged yet.</p>`;
      return;
    }

    list.innerHTML = history.slice(0, 10).map(entry => {
      const stars = '⚡'.repeat(entry.rating);
      return `
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-300 font-bold">${entry.date}</span>
            <span class="text-emerald-400 font-bold">${stars} (${entry.rating}/5)</span>
          </div>
          <p class="text-xs text-slate-400 italic">"${entry.reflection || 'Consistent study cycle logged.'}"</p>
        </div>
      `;
    }).join('');
  }

  // --- 7F5. FORMULA & SHORT-TRICK VAULT ---
  function renderVault() {
    const grid = document.getElementById('vault-items-grid');
    if (!grid) return;

    // Filter tabs styling
    document.querySelectorAll('#vault-subject-filter-tabs button').forEach(btn => {
      const filter = btn.getAttribute('data-vault-filter');
      if (filter === state.activeVaultFilter) {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white transition whitespace-nowrap shadow-md shadow-emerald-500/20';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition whitespace-nowrap';
      }
    });

    let items = state.vaultItems || [];
    if (state.activeVaultFilter !== 'all') {
      items = items.filter(v => v.subject.toLowerCase() === state.activeVaultFilter.toLowerCase());
    }

    if (state.vaultSearchQuery && state.vaultSearchQuery.trim()) {
      const q = state.vaultSearchQuery.toLowerCase().trim();
      items = items.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.formula.toLowerCase().includes(q) || 
        (v.tip && v.tip.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500">No formula cards found matching your filter. Click "+ Add Formula / Trick" to store one.</div>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      return `
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">${item.subject}</span>
              <button
                data-delete-vault-item="${item.id}"
                class="p-1 rounded text-slate-500 hover:text-rose-400 text-xs transition"
                title="Delete formula"
              >
                ✕
              </button>
            </div>
            <h4 class="text-sm font-bold text-white">${item.title}</h4>
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
${item.formula}
            </div>
            ${item.tip ? `<p class="text-[11px] text-slate-400 leading-relaxed"><span class="text-amber-400 font-mono">💡 Pro-Tip:</span> ${item.tip}</p>` : ''}
          </div>

          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-end">
            <button
              data-copy-vault="${item.id}"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition active:scale-95"
            >
              <span>📋</span>
              <span class="copy-label">Copy Formula</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach copy and delete listeners
    grid.querySelectorAll('[data-copy-vault]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-copy-vault');
        const item = state.vaultItems.find(v => v.id === id);
        if (item) {
          const textToCopy = `${item.title}\n\n${item.formula}${item.tip ? `\n\nTip: ${item.tip}` : ''}`;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
              const label = btn.querySelector('.copy-label');
              if (label) {
                const old = label.textContent;
                label.textContent = 'Copied! ✓';
                setTimeout(() => { label.textContent = old; }, 1500);
              }
            }).catch(() => {
              prompt('Copy to clipboard: Ctrl+C, Enter', textToCopy);
            });
          } else {
            prompt('Copy to clipboard: Ctrl+C, Enter', textToCopy);
          }
        }
      });
    });

    grid.querySelectorAll('[data-delete-vault-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-vault-item');
        if (confirm('Delete this formula from your vault?')) {
          state.vaultItems = state.vaultItems.filter(v => v.id !== id);
          saveState();
          renderVault();
        }
      });
    });
  }

  // --- 7G. GAMIFIED CALENDAR & TREASURE BOXES (SECTION 6) ---
  let calViewMonth = new Date().getMonth();
  let calViewYear = new Date().getFullYear();

  function renderCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    const monthLabel = document.getElementById('cal-month-year-label');
    const streakCounter = document.getElementById('cal-streak-counter-number');

    if (!grid) return;
    if (streakCounter) streakCounter.textContent = state.consecutiveStreak || 0;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (monthLabel) monthLabel.textContent = `${monthNames[calViewMonth]} ${calViewYear}`;

    grid.innerHTML = '';

    const firstDayIndex = new Date(calViewYear, calViewMonth, 1).getDay();
    const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calViewYear, calViewMonth, 0).getDate();

    // Fill previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.innerHTML = `<span class="text-[10px] font-mono text-slate-600">${daysInPrevMonth - i}</span>`;
      grid.appendChild(cell);
    }

    const todayStr = getStudyCycleDate();
    if (!state.selectedCalendarDate) {
      state.selectedCalendarDate = todayStr;
    }

    // Fill current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      const dateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = (dateStr === todayStr);
      const isSelected = (dateStr === state.selectedCalendarDate);

      // Check history entry or today's running state
      let log = state.history.find(h => h.date === dateStr);
      let goalMet = false;
      let partial = false;
      let isBreak = false;

      if (isToday) {
        const totalSecs = calculateTotalStudySeconds();
        const targetSecs = (state.targetHours || 10.0) * 3600;
        const habitsDone = state.habits.filter(h => h.completed).length;
        const totalHabits = state.habits.length;
        goalMet = totalSecs >= targetSecs || (totalHabits > 0 && habitsDone >= Math.ceil(totalHabits * 0.8));
        partial = totalSecs > 1800;
        isBreak = state.isBreakDay;
      } else if (log) {
        goalMet = log.goalMet;
        partial = (log.totalStudySeconds || 0) > 1800;
        isBreak = log.isBreakDay;
      }

      let stateClass = '';
      let dotHtml = '';

      if (goalMet) {
        stateClass = 'goal-met';
        dotHtml = `<span class="w-2 h-2 rounded-full bg-emerald-400 mx-auto shadow-sm shadow-emerald-400/50"></span>`;
      } else if (isBreak) {
        stateClass = 'break-day';
        dotHtml = `<span class="w-2 h-2 rounded-full bg-sky-400 mx-auto"></span>`;
      } else if (partial) {
        stateClass = 'partial';
        dotHtml = `<span class="w-2 h-2 rounded-full bg-amber-400 mx-auto"></span>`;
      }

      const hasJournal = state.journalEntries && state.journalEntries.some(j => j.date === dateStr);

      cell.className = `cal-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${stateClass}`;
      cell.title = `Click to inspect habits & metrics for ${dateStr}${hasJournal ? ' (Journal entry recorded)' : ''}`;
      cell.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold ${isToday ? 'text-emerald-400' : 'text-slate-300'}">${d}</span>
          ${hasJournal ? '<span class="text-[9px]" title="Daily Journal Entry Available">📓</span>' : ''}
        </div>
        ${dotHtml}
      `;

      cell.addEventListener('click', () => {
        state.selectedCalendarDate = dateStr;
        renderCalendar();
        renderDayInspectionCard();
      });

      grid.appendChild(cell);
    }
  }

  // --- INTERACTIVE DATE DETAILS & HISTORY INSPECTION CARD ---
  function renderDayInspectionCard() {
    const panel = document.getElementById('cal-day-detail-panel');
    if (!panel) return;

    const todayStr = getStudyCycleDate();
    const selectedDate = state.selectedCalendarDate || todayStr;
    const isToday = (selectedDate === todayStr);
    const log = state.history.find(h => h.date === selectedDate);

    // Format display date nicely
    let formattedDate = selectedDate;
    try {
      const parts = selectedDate.split('-');
      const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      formattedDate = dObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      formattedDate = selectedDate;
    }

    // Determine metrics
    let totalStudySecs = 0;
    let totalBreakSecs = 0;
    let mathsQs = 0;
    let goalMet = false;
    let isBreakDay = false;
    let habitsList = [];

    if (isToday) {
      totalStudySecs = calculateTotalStudySeconds();
      totalBreakSecs = state.todayBreakSeconds;
      if (state.isBreakTimerRunning && state.currentBreakSessionStart) {
        totalBreakSecs += Math.floor((Date.now() - state.currentBreakSessionStart) / 1000);
      }
      mathsQs = state.mathsQuestionsDone;
      isBreakDay = state.isBreakDay;
      const targetSecs = (state.targetHours || 10.0) * 3600;
      const habitsDone = state.habits.filter(h => h.completed).length;
      const totalHabits = state.habits.length;
      goalMet = totalStudySecs >= targetSecs || (totalHabits > 0 && habitsDone >= Math.ceil(totalHabits * 0.8));
      habitsList = state.habits.map(h => ({ title: h.title, completed: h.completed }));
    } else if (log) {
      totalStudySecs = log.totalStudySeconds || 0;
      totalBreakSecs = log.breakSeconds || 0;
      mathsQs = log.mathsQuestions || 0;
      goalMet = log.goalMet;
      isBreakDay = log.isBreakDay;
      if (log.habitsSnapshot && log.habitsSnapshot.length > 0) {
        habitsList = log.habitsSnapshot;
      } else {
        const doneCount = log.habitsCompleted || 0;
        habitsList = state.habits.map((h, idx) => ({
          title: h.title,
          completed: idx < doneCount
        }));
      }
    }

    const studyHrs = (totalStudySecs / 3600).toFixed(1);
    const breakHrs = (totalBreakSecs / 3600).toFixed(1);
    const completedHabitsCount = habitsList.filter(h => h.completed).length;
    const totalHabitsCount = habitsList.length;

    // Status Badge
    let statusBadgeHtml = '';
    if (isBreakDay) {
      statusBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-sky-500/20 text-sky-400 border border-sky-500/40">🔵 Planned Break Day</span>`;
    } else if (goalMet) {
      statusBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">🟢 Goal Met (Green Dot)</span>`;
    } else if (totalStudySecs > 1800) {
      statusBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Partial Day</span>`;
    } else if (!isToday && !log) {
      statusBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">⚪ No Record Logged</span>`;
    } else {
      statusBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40">❌ Target Missed</span>`;
    }

    // Habits breakdown items
    let habitsItemsHtml = '';
    if (habitsList.length > 0) {
      habitsItemsHtml = habitsList.map(h => `
        <div class="p-2.5 rounded-xl ${h.completed ? 'bg-emerald-950/20 border border-emerald-500/30' : 'bg-slate-900/60 border border-slate-800'} flex items-center justify-between gap-3 transition">
          <span class="text-xs font-medium ${h.completed ? 'text-slate-100' : 'text-slate-400'} flex items-center gap-2">
            <span>${h.completed ? '🟢' : '⚪'}</span>
            ${h.title}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap ${h.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}">
            ${h.completed ? '✓ COMPLETED' : '✕ MISSED'}
          </span>
        </div>
      `).join('');
    } else {
      habitsItemsHtml = `<p class="text-xs text-slate-500 italic py-2">No habit checklist recorded for this calendar date.</p>`;
    }

    // Journal Sync record
    const journalEntry = state.journalEntries ? state.journalEntries.find(j => j.date === selectedDate) : null;
    let journalSnippetHtml = '';
    if (journalEntry) {
      const evals = journalEntry.evaluations || {};
      const passedCount = Object.values(evals).filter(v => v === true).length;
      let execBadge = '';
      if (journalEntry.overallExecution === 'good') {
        execBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✔ Good Execution</span>`;
      } else if (journalEntry.overallExecution === 'poor') {
        execBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">✘ Lacked Discipline</span>`;
      } else {
        execBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">📝 In Progress</span>`;
      }

      journalSnippetHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-200 flex items-center gap-1.5">
              <span>📓</span> Daily Aspirant Journal Record
            </span>
            ${execBadge}
          </div>
          <p class="text-xs text-slate-300 italic line-clamp-2 leading-relaxed font-sans">
            "${escapeHtml(journalEntry.notes || 'No text notes written')}"
          </p>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-[11px] font-mono text-slate-400">
              Discipline: <strong class="text-emerald-400">${passedCount}/5 ✔ Passed</strong>
            </span>
            <button id="btn-inspect-open-journal" class="px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-mono font-semibold transition flex items-center gap-1 border border-emerald-500/30">
              <span>✏️ Open in Journal</span>
            </button>
          </div>
        </div>
      `;
    } else {
      journalSnippetHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-slate-500">📓</span>
            <span class="text-xs text-slate-400">No journal entry recorded for ${selectedDate}.</span>
          </div>
          <button id="btn-inspect-write-journal" class="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-1 border border-slate-700">
            <span>+ Write Journal</span>
          </button>
        </div>
      `;
    }

    // Weekly To-Do Planner Tasks for this specific selected date
    const inspectedWeekMon = getMondayOfWeek(selectedDate);
    const inspectedWeekTodos = (state.weeklyTodos && state.weeklyTodos[inspectedWeekMon]) || [];
    const inspectedDayTodos = inspectedWeekTodos.filter(t => t.date === selectedDate);
    const inspectedDayTodosDone = inspectedDayTodos.filter(t => t.completed).length;

    let todosSnippetHtml = `
      <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-200 flex items-center gap-1.5">
            <span>📅</span> Weekly Planner Goals for this Day
          </span>
          <span class="text-[11px] font-mono font-bold ${inspectedDayTodosDone === inspectedDayTodos.length && inspectedDayTodos.length > 0 ? 'text-emerald-400' : 'text-slate-400'}">
            ${inspectedDayTodosDone}/${inspectedDayTodos.length} Completed
          </span>
        </div>
        <div class="space-y-1.5">
          ${inspectedDayTodos.length > 0 ? inspectedDayTodos.map(t => `
            <div class="p-2 rounded-xl ${t.completed ? 'bg-emerald-950/25 border border-emerald-500/30' : (t.status === 'crossed' ? 'bg-rose-950/25 border border-rose-500/30' : 'bg-slate-950/70 border border-slate-800')} flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  data-inspect-todo-toggle="${t.id}"
                  class="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] cursor-pointer transition ${t.completed ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30' : (t.status === 'crossed' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30' : 'bg-slate-800 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-300')}"
                  title="Toggle task completion status"
                >
                  ${t.completed ? '✓' : (t.status === 'crossed' ? '✕' : '○')}
                </button>
                <span class="truncate ${t.completed ? 'line-through text-slate-400' : (t.status === 'crossed' ? 'line-through text-rose-300/80' : 'text-slate-200')}">
                  ${escapeHtml(t.title)}
                </span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0">
                ${escapeHtml(t.subject || 'Task')}
              </span>
            </div>
          `).join('') : '<p class="text-xs text-slate-500 italic py-1">No to-do goals scheduled for this day yet.</p>'}
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
          <span class="text-[10px] font-mono text-slate-500">Week: ${inspectedWeekMon}</span>
          <button id="btn-inspect-open-todo-hub" class="px-3 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-mono font-semibold transition flex items-center gap-1 border border-sky-500/30 cursor-pointer">
            <span>📆 Open Week in To-Do Hub</span>
          </button>
        </div>
      </div>
    `;

    // Action button at bottom
    let actionBtnHtml = '';
    if (isToday) {
      actionBtnHtml = `
        <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span class="text-emerald-400 font-bold">⚡ Today is Active:</span>
          <span>Checking/unchecking habits in the manager above instantly recalculates today's green dot status.</span>
        </div>
      `;
    } else if (log) {
      actionBtnHtml = `
        <div class="flex items-center justify-between gap-3 pt-1">
          <span class="text-[11px] text-slate-500 font-mono">Archived at 5:00 AM cycle</span>
          <button id="btn-edit-inspected-day" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5">
            <span>✏️ Edit Day's Record</span>
          </button>
        </div>
      `;
    } else {
      actionBtnHtml = `
        <div class="flex items-center justify-between gap-3 pt-1">
          <span class="text-[11px] text-slate-500 font-mono">Empty calendar date</span>
          <button id="btn-create-inspected-day" class="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5">
            <span>+ Add Log for ${selectedDate}</span>
          </button>
        </div>
      `;
    }

    panel.innerHTML = `
      <!-- Card Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base">📅</span>
            <h3 class="text-sm font-bold text-white font-mono">${formattedDate}</h3>
            ${isToday ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">TODAY</span>' : ''}
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Day Inspection & Accountability Breakdown</p>
        </div>
        <div>
          ${statusBadgeHtml}
        </div>
      </div>

      <!-- 3 Metrics Breakdown -->
      <div class="grid grid-cols-3 gap-3 font-mono">
        <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-slate-400 uppercase tracking-wider">Study Time</div>
          <div class="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">${studyHrs}h</div>
          <div class="text-[10px] text-slate-500">${formatHMS(totalStudySecs)}</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-slate-400 uppercase tracking-wider">Break Time</div>
          <div class="text-base sm:text-lg font-extrabold text-amber-400 mt-0.5">${breakHrs}h</div>
          <div class="text-[10px] text-slate-500">${formatHMS(totalBreakSecs)}</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-slate-400 uppercase tracking-wider">Maths Target</div>
          <div class="text-base sm:text-lg font-extrabold text-slate-200 mt-0.5">${mathsQs}</div>
          <div class="text-[10px] text-slate-500">of 320 Qs</div>
        </div>
      </div>

      <!-- Habits Completed vs Missed Breakdown -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-200 flex items-center gap-1.5">
            <span>📋</span> Habits Breakdown for this Day
          </span>
          <span class="font-mono text-[11px] font-bold text-emerald-400">
            ${completedHabitsCount} / ${totalHabitsCount} Completed
          </span>
        </div>
        <div class="space-y-1.5">
          ${habitsItemsHtml}
        </div>
      </div>

      <!-- Calendar Sync: Weekly To-Do Hub Planner Goals for this Date -->
      ${todosSnippetHtml}

      <!-- Calendar Sync: Aspirant Daily Journal -->
      ${journalSnippetHtml}

      <!-- Action Footer -->
      <div class="border-t border-slate-800/80 pt-3">
        ${actionBtnHtml}
      </div>
    `;

    // Hook Weekly To-Do list interactions from Calendar Day Inspector
    const btnOpenTodoHub = panel.querySelector('#btn-inspect-open-todo-hub');
    if (btnOpenTodoHub) {
      btnOpenTodoHub.addEventListener('click', () => {
        state.selectedTodoWeekStart = inspectedWeekMon;
        navigateTo('todo-hub');
      });
    }

    panel.querySelectorAll('[data-inspect-todo-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-inspect-todo-toggle');
        const weekTodos = state.weeklyTodos[inspectedWeekMon];
        if (weekTodos) {
          const task = weekTodos.find(t => t.id === taskId);
          if (task) {
            if (task.completed) {
              task.completed = false;
              task.status = 'pending';
            } else {
              task.completed = true;
              task.status = 'completed';
            }
            saveState();
            renderDayInspectionCard();
            renderCalendar();
          }
        }
      });
    });

    // Hook edit or create buttons
    const btnEdit = panel.querySelector('#btn-edit-inspected-day');
    if (btnEdit && log) {
      btnEdit.addEventListener('click', () => {
        const idx = state.history.findIndex(h => h.date === selectedDate);
        if (idx >= 0) openEditHistoryModal(idx);
      });
    }

    const btnOpenJournal = panel.querySelector('#btn-inspect-open-journal');
    if (btnOpenJournal) {
      btnOpenJournal.addEventListener('click', () => {
        state.selectedJournalDate = selectedDate;
        navigateTo('journal');
      });
    }

    const btnWriteJournal = panel.querySelector('#btn-inspect-write-journal');
    if (btnWriteJournal) {
      btnWriteJournal.addEventListener('click', () => {
        state.selectedJournalDate = selectedDate;
        navigateTo('journal');
      });
    }

    const btnCreate = panel.querySelector('#btn-create-inspected-day');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const newLog = {
          date: selectedDate,
          totalStudySeconds: 8 * 3600,
          breakSeconds: 1 * 3600,
          mathsQuestions: 320,
          habitsCompleted: state.habits.length,
          totalHabits: state.habits.length,
          isBreakDay: false,
          goalMet: true,
          habitsSnapshot: state.habits.map(h => ({ title: h.title, completed: true })),
          subjectBreakdown: []
        };
        state.history.unshift(newLog);
        saveState();
        renderHistoryTable();
        renderCalendar();
        renderDayInspectionCard();
        openEditHistoryModal(0);
      });
    }
  }

  function renderMilestones() {
    const container = document.getElementById('treasure-chests-container');
    if (!container) return;

    const streak = state.consecutiveStreak || 0;

    container.innerHTML = MILESTONES.map(m => {
      const isUnlocked = streak >= m.streak;
      const isClaimed = state.claimedMilestones.includes(m.streak);

      let statusBadge = '';
      let cardClass = 'locked';

      if (isClaimed) {
        cardClass = 'claimed';
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">✓ Claimed</span>`;
      } else if (isUnlocked) {
        cardClass = 'unlocked';
        statusBadge = `<button data-claim-milestone="${m.streak}" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-md hover:bg-emerald-600 animate-pulse">🎁 Open Chest</button>`;
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-800 border border-slate-700">🔒 ${m.streak - streak} Days Left</span>`;
      }

      return `
        <div class="milestone-card ${cardClass} flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${m.icon}</span>
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <h4 class="text-xs sm:text-sm font-bold text-white">${m.title}</h4>
              </div>
              <p class="text-[11px] text-slate-400 leading-tight">${m.desc}</p>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-claim-milestone]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const streakNum = parseInt(e.currentTarget.getAttribute('data-claim-milestone'), 10);
        const m = MILESTONES.find(item => item.streak === streakNum);
        if (m) {
          if (!state.claimedMilestones.includes(streakNum)) {
            state.claimedMilestones.push(streakNum);
            saveState();
          }
          openRewardModal(m);
        }
      });
    });
  }

  // --- 7H. HISTORY TABLE & RESETS (SECTION 7) ---
  function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    const badge = document.getElementById('history-total-days-badge');
    if (!tbody) return;

    if (badge) badge.textContent = `${state.history.length} Records`;

    if (state.history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500">No past daily logs archived yet. Days auto-archive at 5:00 AM daily.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.history.map((log, index) => {
      const studyHrs = (log.totalStudySeconds / 3600).toFixed(1);
      const breakHrs = (log.breakSeconds / 3600).toFixed(1);

      return `
        <tr class="hover:bg-slate-900/50 transition">
          <td class="py-2.5 px-3 font-semibold text-white">${log.date}</td>
          <td class="py-2.5 px-3 text-emerald-400 font-bold">${studyHrs} hrs (${formatMS(log.totalStudySeconds)})</td>
          <td class="py-2.5 px-3 text-amber-400">${breakHrs} hrs (${formatMS(log.breakSeconds)})</td>
          <td class="py-2.5 px-3 text-slate-300">${log.mathsQuestions || 0}</td>
          <td class="py-2.5 px-3 text-slate-300">${log.habitsCompleted || 0} / ${log.totalHabits || 0}</td>
          <td class="py-2.5 px-3">
            ${log.goalMet ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Goal Met</span>' : log.isBreakDay ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400">Break Day</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">Under Target</span>'}
          </td>
          <td class="py-2.5 px-3 text-right space-x-1.5">
            <button data-edit-history-entry="${index}" class="text-xs text-slate-300 hover:text-emerald-400 transition">✏️ Edit</button>
            <button data-delete-history-entry="${index}" class="text-xs text-slate-500 hover:text-rose-400 transition">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-edit-history-entry]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-edit-history-entry'), 10);
        openEditHistoryModal(idx);
      });
    });

    tbody.querySelectorAll('[data-delete-history-entry]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-delete-history-entry'), 10);
        if (confirm('Delete this history record?')) {
          state.history.splice(idx, 1);
          saveState();
          renderHistoryTable();
          renderCalendar();
        }
      });
    });
  }

  // ==========================================================================
  // 7F-2. CALENDAR-CONNECTED WEEKLY & MONTHLY TO-DO HUB ENGINE
  // ==========================================================================

  function findSubjectObject(subjectQuery) {
    if (!subjectQuery) return null;
    const q = String(subjectQuery).trim().toLowerCase();
    return (state.subjects || []).find(s => {
      const sId = (s.id || '').toLowerCase();
      const sShort = (s.shortName || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      return sId === q || sShort === q || sName === q || sName.includes(q) || q.includes(sShort);
    }) || null;
  }

  function getSubjectBadge(subject) {
    const sObj = findSubjectObject(subject);
    if (sObj) {
      const color = sObj.color || 'emerald';
      const badgeClass = `subj-badge-${color}`;
      return {
        id: sObj.id,
        displayName: sObj.shortName || sObj.name,
        fullName: sObj.name,
        icon: sObj.icon || '⚡',
        color: color,
        badgeClass: badgeClass
      };
    }
    // Fallbacks for standard presets
    const raw = String(subject || 'General').trim();
    const lower = raw.toLowerCase();
    if (lower.includes('math')) return { id: 'maths', displayName: 'Maths', icon: '📐', color: 'emerald', badgeClass: 'subj-badge-emerald' };
    if (lower.includes('eng')) return { id: 'english', displayName: 'English', icon: '📖', color: 'sky', badgeClass: 'subj-badge-sky' };
    if (lower.includes('reason')) return { id: 'reasoning', displayName: 'Reasoning', icon: '🧩', color: 'violet', badgeClass: 'subj-badge-violet' };
    if (lower.includes('ga') || lower.includes('gk') || lower.includes('gs') || lower.includes('aware')) return { id: 'ga', displayName: 'General Awareness', icon: '🏛️', color: 'amber', badgeClass: 'subj-badge-amber' };
    if (lower.includes('mock')) return { id: 'mocks', displayName: 'Mock Tests', icon: '📊', color: 'rose', badgeClass: 'subj-badge-rose' };
    if (lower.includes('rev')) return { id: 'revision', displayName: 'Revision', icon: '🔄', color: 'fuchsia', badgeClass: 'subj-badge-fuchsia' };
    if (lower.includes('comp')) return { id: 'computer', displayName: 'Computer', icon: '💻', color: 'cyan', badgeClass: 'subj-badge-cyan' };
    if (lower.includes('type')) return { id: 'typing', displayName: 'Typing', icon: '⌨️', color: 'teal', badgeClass: 'subj-badge-teal' };

    return {
      id: raw.toLowerCase().replace(/\s+/g, '_'),
      displayName: raw,
      fullName: raw,
      icon: '⚡',
      color: 'teal',
      badgeClass: 'subj-badge-teal'
    };
  }

  function getSubjectBadgeClass(subject) {
    const b = getSubjectBadge(subject);
    return b.badgeClass;
  }

  function matchesSubject(taskSubject, filterSubject) {
    if (!filterSubject || filterSubject === 'all') return true;
    if (!taskSubject) return false;
    const taskBadge = getSubjectBadge(taskSubject);
    const filterBadge = getSubjectBadge(filterSubject);
    if (taskBadge.id === filterBadge.id) return true;
    const tName = (taskBadge.displayName || '').toLowerCase();
    const fName = (filterBadge.displayName || '').toLowerCase();
    return tName === fName || tName.includes(fName) || fName.includes(tName);
  }

  function renderSubjectOptionsHtml(selectedVal, includeAll = false) {
    let html = includeAll ? `<option value="all" ${selectedVal === 'all' ? 'selected' : ''}>All Subjects</option>` : '';
    const subjects = (state.subjects && state.subjects.length > 0) ? state.subjects : DEFAULT_SUBJECTS;
    subjects.forEach(s => {
      const val = s.shortName || s.name;
      const isSelected = (selectedVal && (selectedVal === val || selectedVal === s.id || selectedVal === s.name));
      html += `<option value="${escapeHtml(val)}" ${isSelected ? 'selected' : ''}>${s.icon || '⚡'} ${escapeHtml(val)}</option>`;
    });
    // Add extra useful options if not already present
    const hasRevision = subjects.some(s => (s.shortName || s.name).toLowerCase().includes('revision'));
    if (!hasRevision) {
      const isSelected = (selectedVal === 'Revision');
      html += `<option value="Revision" ${isSelected ? 'selected' : ''}>🔄 Revision & Speed</option>`;
    }
    const hasGeneral = subjects.some(s => (s.shortName || s.name).toLowerCase().includes('general'));
    if (!hasGeneral) {
      const isSelected = (selectedVal === 'General' || selectedVal === 'Other');
      html += `<option value="General" ${isSelected ? 'selected' : ''}>⚡ General & Routine</option>`;
    }
    return html;
  }

  function populateSubjectSelectElement(selectEl, selectedVal, includeAll = false) {
    if (!selectEl) return;
    const currentVal = selectedVal !== undefined ? selectedVal : selectEl.value;
    selectEl.innerHTML = renderSubjectOptionsHtml(currentVal, includeAll);
    if (currentVal) {
      selectEl.value = currentVal;
    }
  }

  function getCategoryBadgeClass(category) {
    switch (category) {
      case 'Syllabus':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'Mocks':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'Revision':
        return 'bg-pink-500/20 text-pink-300 border border-pink-500/30';
      case 'Discipline':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Custom':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  }

  // Switch Hub Tabs (Daily Hub | Weekly Planner | Monthly Milestones)
  function switchHubTab(tabName) {
    if (!['daily', 'weekly', 'monthly'].includes(tabName)) {
      tabName = 'daily';
    }
    state.revisionActiveTab = tabName;
    saveState();

    const tabDaily = document.getElementById('tab-btn-hub-daily');
    const tabWeekly = document.getElementById('tab-btn-hub-weekly');
    const tabMonthly = document.getElementById('tab-btn-hub-monthly');
    const indicator = document.getElementById('hub-active-tab-indicator');

    const viewDaily = document.getElementById('hub-view-daily');
    const viewWeekly = document.getElementById('hub-view-weekly');
    const viewMonthly = document.getElementById('hub-view-monthly');

    if (tabDaily) tabDaily.classList.toggle('active', tabName === 'daily');
    if (tabWeekly) tabWeekly.classList.toggle('active', tabName === 'weekly');
    if (tabMonthly) tabMonthly.classList.toggle('active', tabName === 'monthly');

    if (viewDaily) viewDaily.classList.toggle('hidden', tabName !== 'daily');
    if (viewWeekly) viewWeekly.classList.toggle('hidden', tabName !== 'weekly');
    if (viewMonthly) viewMonthly.classList.toggle('hidden', tabName !== 'monthly');

    if (indicator) {
      if (tabName === 'weekly') {
        indicator.textContent = 'Weekly Planner (Mon–Sun) Active';
      } else if (tabName === 'monthly') {
        indicator.textContent = 'Monthly Milestones Active';
      } else {
        indicator.textContent = 'Daily Hub Active';
      }
    }

    if (tabName === 'weekly') {
      renderWeeklyView();
    } else if (tabName === 'monthly') {
      renderMonthlyView();
    } else {
      renderTargetHub();
      renderRevisionSystem();
    }
  }

  // Master Render for Revision & To-Do Hub Views
  function renderTodoHub() {
    const section = document.getElementById('section-revision');
    if (!section) return;

    // Safety checks for state attributes
    if (!state.selectedTodoWeekStart) {
      state.selectedTodoWeekStart = getMondayOfWeek(getStudyCycleDate());
    }
    if (!state.selectedTodoMonth) {
      state.selectedTodoMonth = getMonthKey(getStudyCycleDate());
    }
    if (!state.revisionActiveTab) {
      state.revisionActiveTab = 'daily';
    }
    if (!state.weeklyTodos || typeof state.weeklyTodos !== 'object') {
      state.weeklyTodos = {};
    }
    if (!state.monthlyTargets || typeof state.monthlyTargets !== 'object') {
      state.monthlyTargets = {};
    }

    const currentTab = state.revisionActiveTab || 'daily';
    const tabDaily = document.getElementById('tab-btn-hub-daily');
    const tabWeekly = document.getElementById('tab-btn-hub-weekly');
    const tabMonthly = document.getElementById('tab-btn-hub-monthly');
    const indicator = document.getElementById('hub-active-tab-indicator');

    const viewDaily = document.getElementById('hub-view-daily');
    const viewWeekly = document.getElementById('hub-view-weekly');
    const viewMonthly = document.getElementById('hub-view-monthly');

    if (tabDaily) tabDaily.classList.toggle('active', currentTab === 'daily');
    if (tabWeekly) tabWeekly.classList.toggle('active', currentTab === 'weekly');
    if (tabMonthly) tabMonthly.classList.toggle('active', currentTab === 'monthly');

    if (viewDaily) viewDaily.classList.toggle('hidden', currentTab !== 'daily');
    if (viewWeekly) viewWeekly.classList.toggle('hidden', currentTab !== 'weekly');
    if (viewMonthly) viewMonthly.classList.toggle('hidden', currentTab !== 'monthly');

    if (indicator) {
      if (currentTab === 'weekly') {
        indicator.textContent = 'Weekly Planner (Mon–Sun) Active';
      } else if (currentTab === 'monthly') {
        indicator.textContent = 'Monthly Milestones Active';
      } else {
        indicator.textContent = 'Daily Hub Active';
      }
    }

    renderWeeklyView();
    renderMonthlyView();
  }

  // --- RENDER WEEKLY VIEW (MON TO SUN: 7 DAYS) ---
  function renderWeeklyView(weekDays) {
    const currentWeekStart = state.selectedTodoWeekStart || getMondayOfWeek(getStudyCycleDate());
    state.selectedTodoWeekStart = currentWeekStart;
    if (!weekDays || !Array.isArray(weekDays) || weekDays.length !== 7) {
      weekDays = getDaysOfWeek(currentWeekStart);
    }

    // Weekly Period Labels & Date Picker
    const periodLabel = document.getElementById('todo-hub-period-label');
    const subPeriodLabel = document.getElementById('todo-hub-sub-period-label');
    const jumpDatePicker = document.getElementById('todo-hub-jump-date-picker');

    const exactRangeStr = (weekDays.length === 7)
      ? `${weekDays[0].shortName}, ${weekDays[0].displayDate} - ${weekDays[6].shortName}, ${weekDays[6].displayDate}`
      : 'Weekly Planner';
    const yearStr = weekDays.length === 7 ? weekDays[0].date.split('-')[0] : '';

    if (periodLabel && weekDays.length === 7) {
      periodLabel.textContent = `Week of ${exactRangeStr}, ${yearStr}`;
    }
    if (subPeriodLabel) subPeriodLabel.textContent = `Monday to Sunday Sync • 5:00 AM Cycle Boundary`;
    if (jumpDatePicker) jumpDatePicker.value = currentWeekStart;

    // Weekly Progress Stats
    const weekTodos = state.weeklyTodos[currentWeekStart] || [];
    const totalCount = weekTodos.length;
    const completedCount = weekTodos.filter(t => t.completed).length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const statCompleted = document.getElementById('todo-hub-stat-completed');
    const statTotal = document.getElementById('todo-hub-stat-total');
    const statPct = document.getElementById('todo-hub-stat-pct');
    const progressBar = document.getElementById('todo-hub-progress-bar');

    if (statCompleted) statCompleted.textContent = completedCount;
    if (statTotal) statTotal.textContent = totalCount;
    if (statPct) statPct.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;

    // Populate Explicit Weekly Task Subject Select
    const selectWeeklySubj = document.getElementById('select-weekly-task-subject');
    if (selectWeeklySubj) {
      populateSubjectSelectElement(selectWeeklySubj, selectWeeklySubj.value || 'Maths');
    }

    // Weekly Subject-Wise Filter Tabs
    const weeklySubjFilterBar = document.getElementById('weekly-subject-filters-bar');
    if (weeklySubjFilterBar) {
      const currentSubjFilter = state.todoWeeklySubjectFilter || 'all';
      const totalAll = weekTodos.length;
      let filterHtml = `
        <button
          type="button"
          data-weekly-subj-filter="all"
          class="todo-subj-filter-pill ${currentSubjFilter === 'all' ? 'active' : ''}"
        >
          <span>🎯 All</span> <span class="opacity-70 font-mono">(${totalAll})</span>
        </button>
      `;

      const subjects = (state.subjects && state.subjects.length > 0) ? state.subjects : DEFAULT_SUBJECTS;
      subjects.forEach(s => {
        const sName = s.shortName || s.name;
        const count = weekTodos.filter(t => matchesSubject(t.subject, sName)).length;
        const isActive = (currentSubjFilter === sName);
        filterHtml += `
          <button
            type="button"
            data-weekly-subj-filter="${escapeHtml(sName)}"
            class="todo-subj-filter-pill ${isActive ? 'active' : ''}"
          >
            <span>${s.icon || '⚡'} ${escapeHtml(sName)}</span>
            <span class="opacity-75 font-mono">(${count})</span>
          </button>
        `;
      });

      weeklySubjFilterBar.innerHTML = filterHtml;

      weeklySubjFilterBar.querySelectorAll('[data-weekly-subj-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          state.todoWeeklySubjectFilter = e.currentTarget.getAttribute('data-weekly-subj-filter');
          saveState();
          renderWeeklyView(weekDays);
        });
      });
    }

    // Wire Manage Custom Subjects Button
    const btnManageSubjWeekly = document.getElementById('btn-manage-subjects-weekly');
    if (btnManageSubjWeekly) {
      btnManageSubjWeekly.onclick = () => openSubjectManagerModal();
    }

    // Update Top-Level Weekly Date Range Banners & Day Selector
    const rangeBadge = document.getElementById('weekly-active-date-range-badge');
    const rangeText = document.getElementById('weekly-active-date-range-text');
    const rangeYear = document.getElementById('weekly-active-date-range-year');
    const rangeStats = document.getElementById('weekly-range-stats-summary');
    const selectWeeklyDay = document.getElementById('select-weekly-task-day');

    if (rangeBadge) rangeBadge.textContent = exactRangeStr;
    if (rangeText) rangeText.textContent = exactRangeStr;
    if (rangeYear) rangeYear.textContent = yearStr;
    if (rangeStats) rangeStats.textContent = `${completedCount} / ${totalCount} Done (${pct}%)`;

    if (selectWeeklyDay && weekDays.length === 7) {
      const prevSelectedVal = selectWeeklyDay.value;
      selectWeeklyDay.innerHTML = weekDays.map(day => `
        <option value="${day.date}" ${day.isToday ? 'selected' : ''}>
          ${day.dayName} (${day.shortName}, ${day.displayDate})${day.isToday ? ' • TODAY' : ''}
        </option>
      `).join('');
      if (prevSelectedVal && weekDays.some(d => d.date === prevSelectedVal)) {
        selectWeeklyDay.value = prevSelectedVal;
      }
    }

    const grid = document.getElementById('todo-weekly-days-grid');
    if (!grid) return;

    const activeSubjFilter = state.todoWeeklySubjectFilter || 'all';

    grid.innerHTML = weekDays.map(day => {
      const allDayTasks = weekTodos.filter(t => t.date === day.date);
      const dayTasks = (activeSubjFilter === 'all')
        ? allDayTasks
        : allDayTasks.filter(t => matchesSubject(t.subject, activeSubjFilter));
      const dayCompletedCount = allDayTasks.filter(t => t.completed).length;
      const isDayAllDone = allDayTasks.length > 0 && dayCompletedCount === allDayTasks.length;

      const tasksHtml = dayTasks.length === 0
        ? `<div class="p-3 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-[11px] italic">
             ${activeSubjFilter === 'all' ? `No study goals mapped for ${day.shortName}.` : `No ${escapeHtml(activeSubjFilter)} goals for ${day.shortName}.`}
           </div>`
        : dayTasks.map(task => {
            const isEditing = (state.editingWeeklyTaskId === task.id);

            if (isEditing) {
              return `
                <div class="p-2.5 rounded-xl bg-slate-900 border border-sky-500/60 shadow-lg space-y-2">
                  <input
                    type="text"
                    id="input-edit-weekly-${task.id}"
                    value="${escapeHtml(task.title)}"
                    class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-sky-400"
                    placeholder="Task title..."
                  />
                  <div class="flex items-center justify-between gap-1.5">
                    <select id="select-edit-weekly-${task.id}" class="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-200 font-mono">
                      ${renderSubjectOptionsHtml(task.subject)}
                    </select>
                    <div class="flex items-center gap-1">
                      <button type="button" data-save-weekly-edit="${task.id}" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition cursor-pointer">
                        Save
                      </button>
                      <button type="button" data-cancel-weekly-edit class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }

            const isDone = task.completed;
            const isCrossed = (task.status === 'crossed');
            const taskBadge = getSubjectBadge(task.subject);

            return `
              <div class="todo-task-item ${isDone ? 'completed' : (isCrossed ? 'crossed' : '')} p-2 rounded-xl transition">
                <div class="flex items-start gap-1.5 flex-1 min-w-0">
                  <!-- Interactive Tick & Cross Status Controls -->
                  <div class="flex items-center gap-1 pt-0.5 shrink-0">
                    <button
                      type="button"
                      data-todo-tick="${task.id}"
                      class="todo-status-tick-btn ${isDone ? 'active' : ''}"
                      title="Mark Goal Achieved (Tick ✓)"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      data-todo-cross="${task.id}"
                      class="todo-status-cross-btn ${isCrossed ? 'active' : ''}"
                      title="Mark Goal Missed / Incomplete (Cross ✕)"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Task Title & Subject Pill -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${taskBadge.badgeClass}">
                        ${taskBadge.icon} ${escapeHtml(taskBadge.displayName)}
                      </span>
                      <span class="todo-task-title text-xs font-medium leading-snug ${isDone ? 'line-through text-slate-400' : (isCrossed ? 'line-through text-rose-300/80' : 'text-slate-200')}">
                        ${escapeHtml(task.title)}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Inline Edit & Delete Operations -->
                <div class="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    data-edit-weekly-task="${task.id}"
                    class="todo-action-btn edit"
                    title="Edit task inline"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    data-delete-weekly-task="${task.id}"
                    class="todo-action-btn delete"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            `;
          }).join('');

      return `
        <div class="todo-day-card flex flex-col justify-between ${day.isToday ? 'is-today' : ''}">
          <div>
            <!-- Day Card Header -->
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-white text-xs font-mono uppercase tracking-wider">${day.shortName}</span>
                <span class="text-[11px] font-mono text-slate-400 font-semibold">${day.displayDate}</span>
                ${day.isToday ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">TODAY</span>' : ''}
              </div>
              <div class="text-[10px] font-mono font-bold ${isDayAllDone ? 'text-emerald-400' : 'text-slate-400'}">
                ${dayCompletedCount}/${allDayTasks.length} Done
              </div>
            </div>

            <!-- Task Items Container -->
            <div class="space-y-2 mb-3">
              ${tasksHtml}
            </div>
          </div>

          <!-- Bottom: Add Task Mini-Form & Quick Presets -->
          <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div class="flex items-center gap-1">
              <input
                type="text"
                id="input-add-task-${day.date}"
                placeholder="Add ${day.shortName} goal..."
                class="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
                data-day-input="${day.date}"
              />
              <select id="select-subject-${day.date}" class="px-1.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-sky-500">
                ${renderSubjectOptionsHtml('Maths')}
              </select>
              <button
                type="button"
                data-add-task-btn="${day.date}"
                data-day-name="${day.dayName}"
                class="w-7 h-7 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold flex items-center justify-center text-sm transition cursor-pointer shadow-sm shadow-sky-500/20 shrink-0"
                title="Add Goal"
              >
                +
              </button>
            </div>
            <!-- Quick Preset Mission Chips -->
            <div class="flex items-center gap-1 flex-wrap">
              <button type="button" data-quick-preset-day="${day.date}" data-preset-title="320 Maths Qs Mission" data-preset-subj="Maths" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 transition cursor-pointer">
                + 320 Maths Qs
              </button>
              <button type="button" data-quick-preset-day="${day.date}" data-preset-title="50 English Vocab + Editorial" data-preset-subj="English" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 transition cursor-pointer">
                + Vocab
              </button>
              <button type="button" data-quick-preset-day="${day.date}" data-preset-title="1 Full Tier-1 Mock Exam" data-preset-subj="Mock Tests" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer">
                + Mock
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Day Grid Interaction Listeners
    // 1. Tick Button Click
    grid.querySelectorAll('[data-todo-tick]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-todo-tick');
        const tasks = state.weeklyTodos[currentWeekStart];
        if (tasks) {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            if (task.completed) {
              task.completed = false;
              task.status = 'pending';
            } else {
              task.completed = true;
              task.status = 'completed';
            }
            saveWeeklyTasksToLocalStorage();
            saveState();
            renderWeeklyView(weekDays);
            renderTodoHub();
            renderCalendar();
            renderDayInspectionCard();
          }
        }
      });
    });

    // 2. Cross Button Click
    grid.querySelectorAll('[data-todo-cross]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-todo-cross');
        const tasks = state.weeklyTodos[currentWeekStart];
        if (tasks) {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            if (task.status === 'crossed') {
              task.status = 'pending';
              task.completed = false;
            } else {
              task.status = 'crossed';
              task.completed = false;
            }
            saveWeeklyTasksToLocalStorage();
            saveState();
            renderWeeklyView(weekDays);
            renderTodoHub();
            renderCalendar();
            renderDayInspectionCard();
          }
        }
      });
    });

    // 3. Inline Edit Trigger
    grid.querySelectorAll('[data-edit-weekly-task]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-edit-weekly-task');
        state.editingWeeklyTaskId = taskId;
        renderWeeklyView(weekDays);

        // Auto-focus input
        setTimeout(() => {
          const editInput = document.getElementById(`input-edit-weekly-${taskId}`);
          if (editInput) {
            editInput.focus();
            editInput.select();
            editInput.addEventListener('keydown', (ke) => {
              if (ke.key === 'Enter') {
                saveWeeklyEditHandler(taskId);
              } else if (ke.key === 'Escape') {
                state.editingWeeklyTaskId = null;
                renderWeeklyView(weekDays);
              }
            });
          }
        }, 30);
      });
    });

    const saveWeeklyEditHandler = (taskId) => {
      const editInput = document.getElementById(`input-edit-weekly-${taskId}`);
      const editSelect = document.getElementById(`select-edit-weekly-${taskId}`);
      if (!editInput || !editInput.value.trim()) return;

      const tasks = state.weeklyTodos[currentWeekStart];
      if (tasks) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.title = editInput.value.trim();
          if (editSelect) task.subject = editSelect.value;
          state.editingWeeklyTaskId = null;
          saveWeeklyTasksToLocalStorage();
          saveState();
          renderWeeklyView(weekDays);
          renderTodoHub();
          renderCalendar();
          renderDayInspectionCard();
        }
      }
    };

    // 4. Save Edit Button
    grid.querySelectorAll('[data-save-weekly-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-save-weekly-edit');
        saveWeeklyEditHandler(taskId);
      });
    });

    // 5. Cancel Edit Button
    grid.querySelectorAll('[data-cancel-weekly-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.editingWeeklyTaskId = null;
        renderWeeklyView(weekDays);
      });
    });

    // 6. Delete Task
    grid.querySelectorAll('[data-delete-weekly-task]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-delete-weekly-task');
        if (confirm('Delete this goal from weekly planner?')) {
          if (state.weeklyTodos[currentWeekStart]) {
            state.weeklyTodos[currentWeekStart] = state.weeklyTodos[currentWeekStart].filter(t => t.id !== taskId);
            if (Array.isArray(state.weeklyTasks)) {
              state.weeklyTasks = state.weeklyTasks.filter(t => t.id !== taskId);
            }
            saveWeeklyTasksToLocalStorage();
            saveState();
            renderWeeklyView(weekDays);
            renderTodoHub();
            renderCalendar();
            renderDayInspectionCard();
          }
        }
      });
    });

    // 7. Add Task from Day Mini-Form
    grid.querySelectorAll('[data-add-task-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetDate = e.currentTarget.getAttribute('data-add-task-btn');
        const dayName = e.currentTarget.getAttribute('data-day-name') || 'Day';
        executeAddTask(targetDate, dayName);
      });
    });

    grid.querySelectorAll('[data-day-input]').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const targetDate = e.currentTarget.getAttribute('data-day-input');
          executeAddTask(targetDate, 'Day');
        }
      });
    });

    const executeAddTask = (targetDate, dayName) => {
      const input = document.getElementById(`input-add-task-${targetDate}`);
      const select = document.getElementById(`select-subject-${targetDate}`);
      if (!input || !input.value.trim()) return;

      const exactRangeStr = (weekDays.length === 7)
        ? `${weekDays[0].shortName}, ${weekDays[0].displayDate} - ${weekDays[6].shortName}, ${weekDays[6].displayDate}`
        : 'Weekly Planner';

      const newTask = {
        id: 'wt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: targetDate,
        dayName: dayName,
        title: input.value.trim(),
        subject: select ? select.value : 'Other',
        dateRange: exactRangeStr,
        weekRange: exactRangeStr,
        weekStart: currentWeekStart,
        completed: false,
        status: 'pending',
        createdAt: Date.now()
      };

      if (!state.weeklyTodos[currentWeekStart]) {
        state.weeklyTodos[currentWeekStart] = [];
      }
      state.weeklyTodos[currentWeekStart].push(newTask);
      if (!Array.isArray(state.weeklyTasks)) state.weeklyTasks = getAllWeeklyTasks();
      else if (!state.weeklyTasks.some(t => t.id === newTask.id)) state.weeklyTasks.push(newTask);

      saveWeeklyTasksToLocalStorage();
      saveState();
      input.value = '';
      renderWeeklyView(weekDays);
      renderTodoHub();
      renderCalendar();
      renderDayInspectionCard();
    };

    // 8. Quick Preset Mission Chips
    grid.querySelectorAll('[data-quick-preset-day]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetDate = e.currentTarget.getAttribute('data-quick-preset-day');
        const presetTitle = e.currentTarget.getAttribute('data-preset-title');
        const presetSubj = e.currentTarget.getAttribute('data-preset-subj') || 'Other';

        const exactRangeStr = (weekDays.length === 7)
          ? `${weekDays[0].shortName}, ${weekDays[0].displayDate} - ${weekDays[6].shortName}, ${weekDays[6].displayDate}`
          : 'Weekly Planner';

        const newTask = {
          id: 'wt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          date: targetDate,
          dayName: 'Day',
          title: presetTitle,
          subject: presetSubj,
          dateRange: exactRangeStr,
          weekRange: exactRangeStr,
          weekStart: currentWeekStart,
          completed: false,
          status: 'pending',
          createdAt: Date.now()
        };

        if (!state.weeklyTodos[currentWeekStart]) {
          state.weeklyTodos[currentWeekStart] = [];
        }
        state.weeklyTodos[currentWeekStart].push(newTask);
        if (!Array.isArray(state.weeklyTasks)) state.weeklyTasks = getAllWeeklyTasks();
        else if (!state.weeklyTasks.some(t => t.id === newTask.id)) state.weeklyTasks.push(newTask);

        saveWeeklyTasksToLocalStorage();
        saveState();
        renderWeeklyView(weekDays);
        renderTodoHub();
        renderCalendar();
        renderDayInspectionCard();
      });
    });
  }

  // --- RENDER MONTHLY VIEW (STRATEGIC MILESTONES & TARGETS) ---
  function renderMonthlyView() {
    const listContainer = document.getElementById('monthly-targets-list-container');
    const badgeLabel = document.getElementById('monthly-badge-label');
    const periodLabel = document.getElementById('monthly-period-label');
    const jumpDatePicker = document.getElementById('monthly-jump-date-picker');

    const currentMonth = state.selectedTodoMonth || getMonthKey(getStudyCycleDate());
    state.selectedTodoMonth = currentMonth;

    const monthDisplay = formatMonthDisplay(currentMonth);
    const monthHeadingStr = `${monthDisplay} Milestones`;

    if (badgeLabel) badgeLabel.textContent = monthDisplay;
    if (periodLabel) periodLabel.textContent = monthDisplay;
    if (jumpDatePicker) jumpDatePicker.value = currentMonth;

    const headingTitleText = document.getElementById('monthly-heading-title-text');
    if (headingTitleText) headingTitleText.textContent = monthHeadingStr;

    // Populate Explicit Monthly Milestone Subject Select
    const selectMonthlySubj = document.getElementById('select-monthly-milestone-subject');
    if (selectMonthlySubj) {
      populateSubjectSelectElement(selectMonthlySubj, selectMonthlySubj.value || 'Maths');
    }

    const allTargets = state.monthlyTargets[currentMonth] || [];
    const catFilter = state.todoMonthlyFilter || 'all';
    const subjFilter = state.todoMonthlySubjectFilter || 'all';

    // Monthly Subject-Wise Filter Tabs
    const monthlySubjFilterBar = document.getElementById('monthly-subject-filters-bar');
    if (monthlySubjFilterBar) {
      const totalAll = allTargets.length;
      let filterHtml = `
        <button
          type="button"
          data-monthly-subj-filter="all"
          class="todo-subj-filter-pill ${subjFilter === 'all' ? 'active' : ''}"
        >
          <span>🎯 All</span> <span class="opacity-70 font-mono">(${totalAll})</span>
        </button>
      `;

      const subjects = (state.subjects && state.subjects.length > 0) ? state.subjects : DEFAULT_SUBJECTS;
      subjects.forEach(s => {
        const sName = s.shortName || s.name;
        const count = allTargets.filter(t => matchesSubject(t.subject, sName)).length;
        const isActive = (subjFilter === sName);
        filterHtml += `
          <button
            type="button"
            data-monthly-subj-filter="${escapeHtml(sName)}"
            class="todo-subj-filter-pill ${isActive ? 'active' : ''}"
          >
            <span>${s.icon || '⚡'} ${escapeHtml(sName)}</span>
            <span class="opacity-75 font-mono">(${count})</span>
          </button>
        `;
      });

      monthlySubjFilterBar.innerHTML = filterHtml;

      monthlySubjFilterBar.querySelectorAll('[data-monthly-subj-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          state.todoMonthlySubjectFilter = e.currentTarget.getAttribute('data-monthly-subj-filter');
          saveState();
          renderMonthlyView();
        });
      });
    }

    // Wire Manage Custom Subjects Button inside Monthly View
    const btnManageSubjMonthly = document.getElementById('btn-manage-subjects-monthly');
    if (btnManageSubjMonthly) {
      btnManageSubjMonthly.onclick = () => openSubjectManagerModal();
    }

    // Monthly Progress Stats
    const totalCount = allTargets.length;
    const completedCount = allTargets.filter(t => t.completed).length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const statCompleted = document.getElementById('monthly-stat-completed');
    const statTotal = document.getElementById('monthly-stat-total');
    const statPct = document.getElementById('monthly-stat-pct');
    const progressBar = document.getElementById('monthly-progress-bar');
    const headingStatsSummary = document.getElementById('monthly-heading-stats-summary');

    if (statCompleted) statCompleted.textContent = completedCount;
    if (statTotal) statTotal.textContent = totalCount;
    if (statPct) statPct.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (headingStatsSummary) headingStatsSummary.textContent = `${completedCount} / ${totalCount} Done (${pct}%)`;

    if (!listContainer) return;

    const filteredTargets = allTargets.filter(t => {
      const matchCat = (catFilter === 'all' || t.category === catFilter);
      const matchSubj = (subjFilter === 'all' || matchesSubject(t.subject, subjFilter));
      return matchCat && matchSubj;
    });

    if (filteredTargets.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center rounded-3xl bg-[#0b1120] border border-slate-800 text-slate-400 space-y-2">
          <div class="text-3xl">🎯</div>
          <h4 class="text-sm font-bold text-white">No Monthly Targets for this View</h4>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            ${catFilter === 'all' && subjFilter === 'all'
              ? `Establish your core syllabus targets, mock milestones, or discipline benchmarks for ${formatMonthDisplay(currentMonth)} using the form above.`
              : `No targets found matching the current filters (Category: ${catFilter}, Subject: ${subjFilter}) for ${formatMonthDisplay(currentMonth)}.`}
          </p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredTargets.map(target => {
      const isEditing = (state.editingMonthlyTargetId === target.id);

      if (isEditing) {
        return `
          <div class="p-4 rounded-2xl bg-slate-900 border border-sky-500/60 shadow-lg space-y-3">
            <input
              type="text"
              id="input-edit-monthly-${target.id}"
              value="${escapeHtml(target.title)}"
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-sky-400"
              placeholder="Monthly target title..."
            />
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-mono text-slate-400">Subject:</span>
                  <select id="select-edit-monthly-subject-${target.id}" class="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono">
                    ${renderSubjectOptionsHtml(target.subject || 'Maths')}
                  </select>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-mono text-slate-400">Category:</span>
                  <select id="select-edit-monthly-${target.id}" class="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono">
                    <option value="Syllabus" ${target.category === 'Syllabus' ? 'selected' : ''}>📚 Core Syllabus</option>
                    <option value="Mocks" ${target.category === 'Mocks' ? 'selected' : ''}>📊 Mocks & Scores</option>
                    <option value="Revision" ${target.category === 'Revision' ? 'selected' : ''}>🔄 Speed & Revision</option>
                    <option value="Discipline" ${target.category === 'Discipline' ? 'selected' : ''}>⚡ Discipline & Routine</option>
                    <option value="Custom" ${target.category === 'Custom' ? 'selected' : ''}>✨ Custom Milestone</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-1.5 ml-auto">
                <button type="button" data-save-monthly-edit="${target.id}" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer">
                  Save
                </button>
                <button type="button" data-cancel-monthly-edit class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        `;
      }

      const isDone = target.completed;
      const isCrossed = (target.status === 'crossed');
      const subjBadge = getSubjectBadge(target.subject || 'General');

      return `
        <div class="todo-task-item ${isDone ? 'completed' : (isCrossed ? 'crossed' : '')} flex items-center justify-between p-3.5 rounded-2xl border transition">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Interactive Tick & Cross Status Controls -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                data-monthly-tick="${target.id}"
                class="todo-status-tick-btn ${isDone ? 'active' : ''}"
                title="Mark Target Achieved (Tick ✓)"
              >
                ✓
              </button>
              <button
                type="button"
                data-monthly-cross="${target.id}"
                class="todo-status-cross-btn ${isCrossed ? 'active' : ''}"
                title="Mark Target Incomplete / Abandoned (Cross ✕)"
              >
                ✕
              </button>
            </div>

            <!-- Title & Subject/Category Badges -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${subjBadge.badgeClass}">
                  ${subjBadge.icon} ${escapeHtml(subjBadge.displayName)}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${getCategoryBadgeClass(target.category)}">
                  ${escapeHtml(target.category || 'Target')}
                </span>
                <span class="text-sm font-semibold leading-snug ${isDone ? 'line-through text-slate-400' : (isCrossed ? 'line-through text-rose-300/80' : 'text-slate-100')}">
                  ${escapeHtml(target.title)}
                </span>
              </div>
            </div>
          </div>

          <!-- Inline Edit & Delete Operations -->
          <div class="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              data-edit-monthly-target="${target.id}"
              class="todo-action-btn edit"
              title="Edit target inline"
            >
              ✏️
            </button>
            <button
              type="button"
              data-delete-monthly-target="${target.id}"
              class="todo-action-btn delete"
              title="Delete target"
            >
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Monthly Targets Listeners
    // 1. Tick Button Click
    listContainer.querySelectorAll('[data-monthly-tick]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-monthly-tick');
        const targets = state.monthlyTargets[currentMonth];
        if (targets) {
          const target = targets.find(t => t.id === targetId);
          if (target) {
            if (target.completed) {
              target.completed = false;
              target.status = 'pending';
            } else {
              target.completed = true;
              target.status = 'completed';
            }
            saveState();
            renderTodoHub();
          }
        }
      });
    });

    // 2. Cross Button Click
    listContainer.querySelectorAll('[data-monthly-cross]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-monthly-cross');
        const targets = state.monthlyTargets[currentMonth];
        if (targets) {
          const target = targets.find(t => t.id === targetId);
          if (target) {
            if (target.status === 'crossed') {
              target.status = 'pending';
              target.completed = false;
            } else {
              target.status = 'crossed';
              target.completed = false;
            }
            saveState();
            renderTodoHub();
          }
        }
      });
    });

    // 3. Inline Edit Trigger
    listContainer.querySelectorAll('[data-edit-monthly-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-edit-monthly-target');
        state.editingMonthlyTargetId = targetId;
        renderMonthlyView();

        setTimeout(() => {
          const editInput = document.getElementById(`input-edit-monthly-${targetId}`);
          if (editInput) {
            editInput.focus();
            editInput.select();
            editInput.addEventListener('keydown', (ke) => {
              if (ke.key === 'Enter') {
                saveMonthlyEditHandler(targetId);
              } else if (ke.key === 'Escape') {
                state.editingMonthlyTargetId = null;
                renderMonthlyView();
              }
            });
          }
        }, 30);
      });
    });

    const saveMonthlyEditHandler = (targetId) => {
      const editInput = document.getElementById(`input-edit-monthly-${targetId}`);
      const editSelect = document.getElementById(`select-edit-monthly-${targetId}`);
      const editSubjSelect = document.getElementById(`select-edit-monthly-subject-${targetId}`);
      if (!editInput || !editInput.value.trim()) return;

      const targets = state.monthlyTargets[currentMonth];
      if (targets) {
        const target = targets.find(t => t.id === targetId);
        if (target) {
          target.title = editInput.value.trim();
          if (editSelect) target.category = editSelect.value;
          if (editSubjSelect) target.subject = editSubjSelect.value;
          state.editingMonthlyTargetId = null;
          saveState();
          renderTodoHub();
        }
      }
    };

    // 4. Save Edit Button
    listContainer.querySelectorAll('[data-save-monthly-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-save-monthly-edit');
        saveMonthlyEditHandler(targetId);
      });
    });

    // 5. Cancel Edit Button
    listContainer.querySelectorAll('[data-cancel-monthly-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.editingMonthlyTargetId = null;
        renderMonthlyView();
      });
    });

    // 6. Delete Target
    listContainer.querySelectorAll('[data-delete-monthly-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-delete-monthly-target');
        if (confirm('Delete this monthly milestone target?')) {
          if (state.monthlyTargets[currentMonth]) {
            state.monthlyTargets[currentMonth] = state.monthlyTargets[currentMonth].filter(t => t.id !== targetId);
            saveState();
            renderTodoHub();
          }
        }
      });
    });
  }

  // --- BIND TO-DO HUB GLOBAL CONTROLS & LISTENERS ---
  function bindTodoHubEvents() {
    // 1. Hub Master View Switcher Tabs (Daily Hub | Weekly Planner | Monthly Milestones)
    document.querySelectorAll('.hub-view-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-hub-tab') || e.currentTarget.getAttribute('data-tab');
        if (tab) {
          switchHubTab(tab);
        }
      });
    });

    // 2. Weekly Period Navigation Controls
    const btnWeeklyPrev = document.getElementById('btn-todo-prev');
    if (btnWeeklyPrev) {
      btnWeeklyPrev.addEventListener('click', () => {
        state.selectedTodoWeekStart = shiftWeek(state.selectedTodoWeekStart, -1);
        saveState();
        renderWeeklyView();
      });
    }

    const btnWeeklyNext = document.getElementById('btn-todo-next');
    if (btnWeeklyNext) {
      btnWeeklyNext.addEventListener('click', () => {
        state.selectedTodoWeekStart = shiftWeek(state.selectedTodoWeekStart, 1);
        saveState();
        renderWeeklyView();
      });
    }

    const btnWeeklyToday = document.getElementById('btn-todo-today');
    if (btnWeeklyToday) {
      btnWeeklyToday.addEventListener('click', () => {
        state.selectedTodoWeekStart = getMondayOfWeek(getStudyCycleDate());
        saveState();
        renderWeeklyView();
      });
    }

    const weeklyJumpDatePicker = document.getElementById('todo-hub-jump-date-picker');
    if (weeklyJumpDatePicker) {
      weeklyJumpDatePicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          state.selectedTodoWeekStart = getMondayOfWeek(val);
          saveState();
          renderWeeklyView();
        }
      });
    }

    // 3. Monthly Period Navigation Controls
    const btnMonthlyPrev = document.getElementById('btn-monthly-prev');
    if (btnMonthlyPrev) {
      btnMonthlyPrev.addEventListener('click', () => {
        state.selectedTodoMonth = shiftMonth(state.selectedTodoMonth, -1);
        saveState();
        renderMonthlyView();
      });
    }

    const btnMonthlyNext = document.getElementById('btn-monthly-next');
    if (btnMonthlyNext) {
      btnMonthlyNext.addEventListener('click', () => {
        state.selectedTodoMonth = shiftMonth(state.selectedTodoMonth, 1);
        saveState();
        renderMonthlyView();
      });
    }

    const btnMonthlyToday = document.getElementById('btn-monthly-today');
    if (btnMonthlyToday) {
      btnMonthlyToday.addEventListener('click', () => {
        state.selectedTodoMonth = getMonthKey(getStudyCycleDate());
        saveState();
        renderMonthlyView();
      });
    }

    const monthlyJumpDatePicker = document.getElementById('monthly-jump-date-picker');
    if (monthlyJumpDatePicker) {
      monthlyJumpDatePicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          state.selectedTodoMonth = val;
          saveState();
          renderMonthlyView();
        }
      });
    }

    // 4. Switch between To-Do Hub and Habits/Calendar
    const btnSwitchToCal = document.getElementById('btn-todo-switch-to-calendar');
    if (btnSwitchToCal) {
      btnSwitchToCal.addEventListener('click', () => {
        navigateTo('calendar');
      });
    }

    const btnGotoHub = document.getElementById('btn-goto-todo-hub');
    if (btnGotoHub) {
      btnGotoHub.addEventListener('click', () => {
        navigateTo('todo-hub');
      });
    }

    // 5. Add Explicit Weekly Task Form Handler
    const formAddWeekly = document.getElementById('form-add-weekly-task');
    const btnSubmitWeekly = document.getElementById('btn-submit-weekly-task');

    const handleAddWeeklyTaskSubmit = (e) => {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }

      const inputTitle = document.getElementById('input-weekly-task-title');
      const selectDay = document.getElementById('select-weekly-task-day');
      const selectSubj = document.getElementById('select-weekly-task-subject');

      if (!inputTitle || !inputTitle.value.trim()) {
        if (inputTitle) inputTitle.focus();
        return false;
      }

      const currentWeekStart = state.selectedTodoWeekStart || getMondayOfWeek(getStudyCycleDate());
      state.selectedTodoWeekStart = currentWeekStart;
      const weekDays = getDaysOfWeek(currentWeekStart);

      const exactRangeStr = (weekDays.length === 7)
        ? `${weekDays[0].shortName}, ${weekDays[0].displayDate} - ${weekDays[6].shortName}, ${weekDays[6].displayDate}`
        : 'Weekly Planner';

      const targetDate = (selectDay && selectDay.value) ? selectDay.value : (weekDays[0] ? weekDays[0].date : currentWeekStart);
      const targetDayObj = weekDays.find(d => d.date === targetDate) || weekDays[0];
      const targetDayName = targetDayObj ? targetDayObj.dayName : 'Monday';

      const taskText = inputTitle.value.trim();
      const subjectCategory = (selectSubj && selectSubj.value) ? selectSubj.value.trim() : 'Maths';

      const newTask = {
        id: 'wt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: targetDate,
        dayName: targetDayName,
        title: taskText,
        subject: subjectCategory,
        dateRange: exactRangeStr,
        weekRange: exactRangeStr,
        weekStart: currentWeekStart,
        completed: false,
        status: 'pending',
        createdAt: Date.now()
      };

      if (!state.weeklyTodos || typeof state.weeklyTodos !== 'object') {
        state.weeklyTodos = {};
      }
      if (!Array.isArray(state.weeklyTodos[currentWeekStart])) {
        state.weeklyTodos[currentWeekStart] = [];
      }
      state.weeklyTodos[currentWeekStart].push(newTask);

      if (!Array.isArray(state.weeklyTasks)) {
        state.weeklyTasks = getAllWeeklyTasks();
      } else if (!state.weeklyTasks.some(t => t.id === newTask.id)) {
        state.weeklyTasks.push(newTask);
      }

      // Force immediate saving of updated weekly tasks array into localStorage under 'cgl_weekly_tasks'
      saveWeeklyTasksToLocalStorage();
      saveState();

      // Clear input title field
      inputTitle.value = '';

      // Instantly call the render function for the Weekly Planner tab so the new task appears without refresh
      renderWeeklyView(weekDays);
      renderTodoHub();
      renderCalendar();
      renderDayInspectionCard();

      playChime('success');
      return false;
    };

    if (formAddWeekly) {
      formAddWeekly.onsubmit = handleAddWeeklyTaskSubmit;
      formAddWeekly.addEventListener('submit', handleAddWeeklyTaskSubmit);
    }
    if (btnSubmitWeekly) {
      btnSubmitWeekly.addEventListener('click', (e) => {
        const inputTitle = document.getElementById('input-weekly-task-title');
        if (inputTitle && inputTitle.value.trim()) {
          handleAddWeeklyTaskSubmit(e);
        }
      });
    }

    // 6. Add Monthly Milestone Form Handler
    const formAddMonthly = document.getElementById('form-add-monthly-milestone') || document.getElementById('form-add-monthly-target');
    if (formAddMonthly) {
      formAddMonthly.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputTitle = document.getElementById('input-monthly-milestone-title') || document.getElementById('input-monthly-target-title');
        const selectCat = document.getElementById('select-monthly-milestone-category') || document.getElementById('select-monthly-target-category');
        const selectSubj = document.getElementById('select-monthly-milestone-subject');
        if (!inputTitle || !inputTitle.value.trim()) return;

        const currentMonth = state.selectedTodoMonth || getMonthKey(getStudyCycleDate());
        const newTarget = {
          id: 'mt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: inputTitle.value.trim(),
          category: selectCat ? selectCat.value : 'Custom',
          subject: selectSubj ? selectSubj.value : 'General',
          completed: false,
          status: 'pending',
          createdAt: Date.now()
        };

        if (!state.monthlyTargets[currentMonth]) {
          state.monthlyTargets[currentMonth] = [];
        }
        state.monthlyTargets[currentMonth].push(newTarget);
        saveState();
        inputTitle.value = '';
        renderMonthlyView();
      });
    }

    // 7. Monthly Filter Buttons
    document.querySelectorAll('.todo-monthly-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        state.todoMonthlyFilter = filter;
        document.querySelectorAll('.todo-monthly-filter').forEach(b => {
          if (b.getAttribute('data-filter') === filter) {
            b.className = 'todo-monthly-filter px-3 py-1 rounded-lg transition font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-pointer';
          } else {
            b.className = 'todo-monthly-filter px-3 py-1 rounded-lg transition text-slate-400 hover:text-white cursor-pointer';
          }
        });
        renderMonthlyView();
      });
    });
  }

  // --- 7G. INDEPENDENT DAILY ASPIRANT JOURNAL & SELF-EVALUATION ENGINE ---

  function renderJournal() {
    const section = document.getElementById('section-journal');
    if (!section) return;

    const todayStr = getStudyCycleDate();
    if (!state.selectedJournalDate) {
      state.selectedJournalDate = todayStr;
    }
    const curDate = state.selectedJournalDate;
    const isToday = (curDate === todayStr);

    // 1. Update Date Picker & Date Heading
    const datePicker = document.getElementById('journal-date-picker');
    const dateHeading = document.getElementById('journal-selected-date-heading');
    const statusBadge = document.getElementById('journal-entry-status-badge');
    const notesInput = document.getElementById('journal-notes-input');
    const wordCounter = document.getElementById('journal-word-counter');
    const scoreBadge = document.getElementById('journal-eval-score-badge');
    const checklistContainer = document.getElementById('journal-criteria-checklist');
    const archiveList = document.getElementById('journal-entries-archive-list');
    const totalEntriesBadge = document.getElementById('journal-total-entries-badge');
    const resetDateLabel = document.getElementById('reset-journal-date-label');

    if (datePicker) {
      datePicker.value = curDate;
    }

    if (resetDateLabel) {
      resetDateLabel.textContent = isToday ? 'Today' : curDate;
    }

    let formattedDate = curDate;
    try {
      const parts = curDate.split('-');
      const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      formattedDate = dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      formattedDate = curDate;
    }

    if (dateHeading) {
      dateHeading.textContent = `${formattedDate}${isToday ? ' (Today)' : ''}`;
    }

    // Find entry for currently active selectedJournalDate
    const existingEntry = state.journalEntries.find(j => j.date === curDate);

    // Update Status Badge
    if (statusBadge) {
      if (existingEntry) {
        if (existingEntry.overallExecution === 'good') {
          statusBadge.className = 'px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          statusBadge.textContent = 'Saved • ✔ Good Execution';
        } else if (existingEntry.overallExecution === 'poor') {
          statusBadge.className = 'px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30';
          statusBadge.textContent = 'Saved • ✘ Lacked Discipline';
        } else {
          statusBadge.className = 'px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30';
          statusBadge.textContent = 'Saved • In Progress';
        }
      } else {
        statusBadge.className = 'px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700';
        statusBadge.textContent = 'Draft (Unsaved)';
      }
    }

    // 2. Set Text Area Content
    if (notesInput) {
      if (notesInput.getAttribute('data-active-date') !== curDate) {
        notesInput.value = existingEntry ? (existingEntry.notes || '') : '';
        notesInput.setAttribute('data-active-date', curDate);
      }
      const words = (notesInput.value || '').trim().split(/\s+/).filter(Boolean).length;
      if (wordCounter) {
        wordCounter.textContent = `${words} word${words === 1 ? '' : 's'}`;
      }
    }

    // 3. Render Overall Execution Dual Verdict
    const btnExecGood = document.getElementById('btn-journal-exec-good');
    const btnExecPoor = document.getElementById('btn-journal-exec-poor');

    if (btnExecGood && btnExecPoor) {
      btnExecGood.classList.remove('selected-good');
      btnExecPoor.classList.remove('selected-poor');

      if (existingEntry) {
        if (existingEntry.overallExecution === 'good') {
          btnExecGood.classList.add('selected-good');
        } else if (existingEntry.overallExecution === 'poor') {
          btnExecPoor.classList.add('selected-poor');
        }
      }
    }

    // 4. Render Subjective Criteria Checklist ([✔] and [✘] interactive buttons)
    if (checklistContainer) {
      const evaluations = (existingEntry && existingEntry.evaluations) ? existingEntry.evaluations : {};
      let passedCount = 0;

      checklistContainer.innerHTML = DEFAULT_JOURNAL_CRITERIA.map(c => {
        const val = evaluations[c.id]; // true, false, or undefined/null
        if (val === true) passedCount++;

        return `
          <div class="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-700">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>${val === true ? '🟢' : (val === false ? '🔴' : '⚪')}</span>
                <span>${c.title}</span>
              </div>
              <p class="text-[11px] text-slate-400 leading-snug">${c.label}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                data-journal-eval-crit="${c.id}"
                data-journal-eval-val="true"
                class="journal-tick-btn px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition ${val === true ? 'selected' : 'border-slate-800 bg-slate-900 text-slate-400'}"
                title="Mark as Satisfied / Passed"
              >
                <span>✔</span>
                <span>Pass</span>
              </button>
              <button
                type="button"
                data-journal-eval-crit="${c.id}"
                data-journal-eval-val="false"
                class="journal-cross-btn px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition ${val === false ? 'selected' : 'border-slate-800 bg-slate-900 text-slate-400'}"
                title="Mark as Missed / Failed"
              >
                <span>✘</span>
                <span>Fail</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (scoreBadge) {
        scoreBadge.textContent = `${passedCount} / ${DEFAULT_JOURNAL_CRITERIA.length} ✔ Passed`;
        scoreBadge.className = passedCount >= 4 ? 'font-bold text-emerald-400 text-sm' : (passedCount >= 2 ? 'font-bold text-amber-400 text-sm' : 'font-bold text-rose-400 text-sm');
      }

      // Attach click events to criteria evaluation buttons
      checklistContainer.querySelectorAll('button[data-journal-eval-crit]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const critId = e.currentTarget.getAttribute('data-journal-eval-crit');
          const targetVal = e.currentTarget.getAttribute('data-journal-eval-val') === 'true';

          let entry = state.journalEntries.find(j => j.date === curDate);
          if (!entry) {
            entry = {
              date: curDate,
              notes: notesInput ? notesInput.value : '',
              overallExecution: null,
              evaluations: {},
              updatedAt: new Date().toISOString()
            };
            state.journalEntries.unshift(entry);
          }
          if (!entry.evaluations) entry.evaluations = {};

          // Toggle if already selected
          if (entry.evaluations[critId] === targetVal) {
            entry.evaluations[critId] = null;
          } else {
            entry.evaluations[critId] = targetVal;
            playChime('start');
          }

          saveState();
          renderJournal();
          renderCalendar();
          renderDayInspectionCard();
        });
      });
    }

    // 5. Render Historical Archive
    if (archiveList) {
      if (totalEntriesBadge) {
        totalEntriesBadge.textContent = `${state.journalEntries.length} Recorded Entries`;
      }

      if (state.journalEntries.length === 0) {
        archiveList.innerHTML = `
          <div class="text-center py-8 text-xs text-slate-500 font-mono space-y-2">
            <span class="text-2xl block">📓</span>
            <p>No past journal entries recorded yet. Write your thoughts and evaluate today's cycle above!</p>
          </div>
        `;
      } else {
        const sorted = [...state.journalEntries].sort((a, b) => b.date.localeCompare(a.date));

        archiveList.innerHTML = sorted.map(entry => {
          let entryFormatted = entry.date;
          try {
            const parts = entry.date.split('-');
            const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            entryFormatted = dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          } catch (e) {
            entryFormatted = entry.date;
          }

          const evals = entry.evaluations || {};
          const passed = Object.values(evals).filter(v => v === true).length;
          const isSelectedEntry = (entry.date === curDate);

          let execBadge = '';
          if (entry.overallExecution === 'good') {
            execBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✔ Good Execution</span>`;
          } else if (entry.overallExecution === 'poor') {
            execBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">✘ Lacked Discipline</span>`;
          } else {
            execBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">📝 In Progress</span>`;
          }

          return `
            <div class="journal-entry-card p-4 space-y-3 ${isSelectedEntry ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : ''}">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white font-mono">${entryFormatted}</span>
                  ${entry.date === todayStr ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">TODAY</span>' : ''}
                  ${isSelectedEntry ? '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold font-mono">ACTIVE IN EDITOR</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                  ${execBadge}
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-slate-800/90 text-slate-300 border border-slate-700">
                    ${passed}/5 ✔ Passed
                  </span>
                </div>
              </div>

              <!-- Reflection Text Snippet -->
              <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                ${escapeHtml(entry.notes || '(No text notes written for this day)')}
              </p>

              <!-- Controls: Complete Edit & Delete -->
              <div class="flex items-center justify-between pt-1 text-[11px] font-mono border-t border-slate-800/60">
                <span class="text-slate-500">Sync: Calendar Linked</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    data-edit-journal-date="${entry.date}"
                    class="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1 active:scale-95"
                  >
                    <span>✏️ Edit Entry</span>
                  </button>
                  <button
                    type="button"
                    data-delete-journal-date="${entry.date}"
                    class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition flex items-center gap-1 active:scale-95"
                    title="Delete this date's journal record"
                  >
                    <span>🗑️ Delete</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Hook Edit & Delete button handlers in Archive
        archiveList.querySelectorAll('[data-edit-journal-date]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const targetDate = e.currentTarget.getAttribute('data-edit-journal-date');
            state.selectedJournalDate = targetDate;
            const notesEl = document.getElementById('journal-notes-input');
            if (notesEl) {
              notesEl.removeAttribute('data-active-date');
            }
            renderJournal();
            if (notesEl) {
              notesEl.focus();
              notesEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        });

        archiveList.querySelectorAll('[data-delete-journal-date]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const targetDate = e.currentTarget.getAttribute('data-delete-journal-date');
            if (confirm(`Permanently delete the journal entry for ${targetDate}?`)) {
              state.journalEntries = state.journalEntries.filter(j => j.date !== targetDate);
              saveState();
              renderJournal();
              renderCalendar();
              renderDayInspectionCard();
            }
          });
        });
      }
    }
  }

  // ==========================================================================
  // 7I. MOCK SCORE TREND GRAPH & PERFORMANCE ANALYTICS ENGINE
  // ==========================================================================

  function renderMockTrends() {
    // 1. Check container presence
    const sectionEl = document.getElementById('section-mock-trends');
    if (!sectionEl) return;

    if (!Array.isArray(state.mockScores)) state.mockScores = [];
    if (!state.mockChartActiveTab) state.mockChartActiveTab = 'full';
    if (!state.mockHistoryFilter) state.mockHistoryFilter = 'all';

    const fullMocks = state.mockScores.filter(m => m.type === 'full').sort((a, b) => new Date(a.date) - new Date(b.date));
    const secMocks = state.mockScores.filter(m => m.type === 'sectional').sort((a, b) => new Date(a.date) - new Date(b.date));
    const allMocksChronological = [...state.mockScores].sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Summary KPI Metrics Calculations
    // KPI 1: Average Full Mock Score
    const kpiAvgScore = document.getElementById('mock-kpi-avg-score');
    const kpiAvgPct = document.getElementById('mock-kpi-avg-pct');
    const kpiCutoffGap = document.getElementById('mock-kpi-cutoff-gap');

    let avgFull = 0;
    if (fullMocks.length > 0) {
      const sumFull = fullMocks.reduce((acc, m) => acc + (parseFloat(m.score) || 0), 0);
      avgFull = sumFull / fullMocks.length;
      const pct = (avgFull / 200) * 100;
      if (kpiAvgScore) kpiAvgScore.textContent = avgFull.toFixed(1);
      if (kpiAvgPct) kpiAvgPct.textContent = `${pct.toFixed(1)}%`;

      const gap = avgFull - 145.0;
      if (kpiCutoffGap) {
        if (gap >= 0) {
          kpiCutoffGap.innerHTML = `<span class="text-emerald-400 font-bold">+${gap.toFixed(1)}</span> above Tier 1 safe cutoff (145.0)`;
        } else {
          kpiCutoffGap.innerHTML = `<span class="text-amber-400 font-bold">${gap.toFixed(1)}</span> from Tier 1 safe cutoff (145.0)`;
        }
      }
    } else {
      if (kpiAvgScore) kpiAvgScore.textContent = '--';
      if (kpiAvgPct) kpiAvgPct.textContent = '--%';
      if (kpiCutoffGap) kpiCutoffGap.textContent = 'Log first full mock';
    }

    // KPI 2: Highest Score (Personal Best)
    const kpiHighestScore = document.getElementById('mock-kpi-highest-score');
    const kpiHighestTitle = document.getElementById('mock-kpi-highest-title');
    if (fullMocks.length > 0) {
      const highest = fullMocks.reduce((max, m) => (m.score > max.score ? m : max), fullMocks[0]);
      if (kpiHighestScore) kpiHighestScore.textContent = highest.score.toFixed(1);
      if (kpiHighestTitle) {
        kpiHighestTitle.textContent = `${highest.title || 'Full Mock'} (${formatDisplayDate(highest.date)})`;
        kpiHighestTitle.title = highest.title;
      }
    } else if (state.mockScores.length > 0) {
      const highest = state.mockScores.reduce((max, m) => (m.score > max.score ? m : max), state.mockScores[0]);
      if (kpiHighestScore) kpiHighestScore.textContent = highest.score.toFixed(1);
      if (kpiHighestTitle) kpiHighestTitle.textContent = `${highest.title} (${highest.score}/${highest.maxScore})`;
    } else {
      if (kpiHighestScore) kpiHighestScore.textContent = '--';
      if (kpiHighestTitle) kpiHighestTitle.textContent = 'No mocks logged yet';
    }

    // KPI 3: Recent Performance Trajectory (Momentum Velocity)
    const kpiTrajectoryBadge = document.getElementById('mock-kpi-trajectory-badge');
    const kpiTrajectoryDetail = document.getElementById('mock-kpi-trajectory-detail');
    const bannerIcon = document.getElementById('mock-trajectory-icon');
    const bannerHeading = document.getElementById('mock-trajectory-heading');
    const bannerExplanation = document.getElementById('mock-trajectory-explanation');

    if (fullMocks.length >= 2) {
      const earliest = fullMocks[0];
      const latest = fullMocks[fullMocks.length - 1];
      const prev = fullMocks[fullMocks.length - 2];
      const totalGrowth = latest.score - earliest.score;
      const recentJump = latest.score - prev.score;

      if (totalGrowth >= 4 || recentJump >= 4) {
        if (kpiTrajectoryBadge) {
          kpiTrajectoryBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
          kpiTrajectoryBadge.textContent = '▲ Upward (+';
          kpiTrajectoryBadge.textContent += `${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toFixed(1)} pts)`;
        }
        if (kpiTrajectoryDetail) {
          kpiTrajectoryDetail.textContent = `Surged from ${earliest.score.toFixed(1)} to ${latest.score.toFixed(1)} (${fullMocks.length} mocks)`;
        }
        if (bannerIcon) bannerIcon.textContent = '🚀';
        if (bannerHeading) bannerHeading.textContent = 'Ascending Score Trajectory Detected (+';
        if (bannerHeading) bannerHeading.textContent += `${totalGrowth.toFixed(1)} Marks Gain)`;
        if (bannerExplanation) {
          bannerExplanation.textContent = `Your Full Mock score climbed steadily from ${earliest.score.toFixed(1)} to ${latest.score.toFixed(1)}. Positive revision momentum is translating directly to exam readiness.`;
        }
      } else if (totalGrowth <= -4 || recentJump <= -5) {
        if (kpiTrajectoryBadge) {
          kpiTrajectoryBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40';
          kpiTrajectoryBadge.textContent = `▼ Score Dip (${totalGrowth.toFixed(1)} pts)`;
        }
        if (kpiTrajectoryDetail) {
          kpiTrajectoryDetail.textContent = `Dropped from ${earliest.score.toFixed(1)} to ${latest.score.toFixed(1)}. Audit negative marks.`;
        }
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (bannerHeading) bannerHeading.textContent = `Score Dip Warning (${totalGrowth.toFixed(1)} Marks)`;
        if (bannerExplanation) {
          bannerExplanation.textContent = `Recent tests indicate score leakage. Audit negative marking in GA and time mismanagement in Maths advanced chapters.`;
        }
      } else {
        if (kpiTrajectoryBadge) {
          kpiTrajectoryBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40';
          kpiTrajectoryBadge.textContent = '⚖️ Steady / Flat';
        }
        if (kpiTrajectoryDetail) {
          kpiTrajectoryDetail.textContent = `Floating in ${earliest.score.toFixed(1)} - ${latest.score.toFixed(1)} range (±${Math.abs(totalGrowth).toFixed(1)} pts)`;
        }
        if (bannerIcon) bannerIcon.textContent = '⚖️';
        if (bannerHeading) bannerHeading.textContent = 'Score Plateau Detected (Preparation Stagnation)';
        if (bannerExplanation) {
          bannerExplanation.textContent = `Scores are stable but stagnating around the ${avgFull.toFixed(1)} mark. Break this ceiling by aggressive topical drills on weak areas.`;
        }
      }
    } else if (fullMocks.length === 1) {
      if (kpiTrajectoryBadge) {
        kpiTrajectoryBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700';
        kpiTrajectoryBadge.textContent = 'Baseline Logged';
      }
      if (kpiTrajectoryDetail) kpiTrajectoryDetail.textContent = 'Log 1 more full mock to compute trajectory';
      if (bannerIcon) bannerIcon.textContent = '📊';
      if (bannerHeading) bannerHeading.textContent = 'Initial Benchmark Recorded';
      if (bannerExplanation) bannerExplanation.textContent = 'Log your next test to generate real-time momentum velocity and trend curves.';
    } else {
      if (kpiTrajectoryBadge) {
        kpiTrajectoryBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700';
        kpiTrajectoryBadge.textContent = 'Awaiting Data';
      }
      if (kpiTrajectoryDetail) kpiTrajectoryDetail.textContent = 'Log mocks to compute trajectory';
      if (bannerIcon) bannerIcon.textContent = '🎯';
      if (bannerHeading) bannerHeading.textContent = 'No Mock Tests Recorded Yet';
      if (bannerExplanation) bannerExplanation.textContent = 'Use the quick log console below to enter your latest full or sectional scores.';
    }

    // KPI 4: Sectional Index (Strongest & Focus Areas)
    const kpiStrongest = document.getElementById('mock-kpi-strongest-section');
    const kpiWeakest = document.getElementById('mock-kpi-weakest-section');

    const subjectStats = {
      maths: { total: 0, count: 0, label: 'Maths' },
      english: { total: 0, count: 0, label: 'English' },
      reasoning: { total: 0, count: 0, label: 'Reasoning' },
      ga: { total: 0, count: 0, label: 'GA / GK' }
    };

    state.mockScores.forEach(m => {
      if (m.type === 'full' && m.sections) {
        if (m.sections.maths !== undefined && m.sections.maths !== null) {
          subjectStats.maths.total += parseFloat(m.sections.maths);
          subjectStats.maths.count++;
        }
        if (m.sections.english !== undefined && m.sections.english !== null) {
          subjectStats.english.total += parseFloat(m.sections.english);
          subjectStats.english.count++;
        }
        if (m.sections.reasoning !== undefined && m.sections.reasoning !== null) {
          subjectStats.reasoning.total += parseFloat(m.sections.reasoning);
          subjectStats.reasoning.count++;
        }
        if (m.sections.ga !== undefined && m.sections.ga !== null) {
          subjectStats.ga.total += parseFloat(m.sections.ga);
          subjectStats.ga.count++;
        }
      } else if (m.type === 'sectional' && m.subject && subjectStats[m.subject]) {
        subjectStats[m.subject].total += parseFloat(m.score);
        subjectStats[m.subject].count++;
      }
    });

    const evaluatedSections = Object.keys(subjectStats)
      .map(k => ({
        key: k,
        label: subjectStats[k].label,
        avg: subjectStats[k].count > 0 ? subjectStats[k].total / subjectStats[k].count : null,
        pct: subjectStats[k].count > 0 ? ((subjectStats[k].total / subjectStats[k].count) / 50) * 100 : null
      }))
      .filter(s => s.avg !== null)
      .sort((a, b) => b.avg - a.avg);

    if (evaluatedSections.length > 0) {
      const strongest = evaluatedSections[0];
      const weakest = evaluatedSections[evaluatedSections.length - 1];
      if (kpiStrongest) {
        kpiStrongest.textContent = `${strongest.label} (${strongest.avg.toFixed(1)}/50)`;
        kpiStrongest.title = `Avg: ${strongest.avg.toFixed(1)} Marks (${strongest.pct.toFixed(0)}%)`;
      }
      if (kpiWeakest) {
        kpiWeakest.textContent = `${weakest.label} (${weakest.avg.toFixed(1)}/50)`;
        kpiWeakest.title = `Avg: ${weakest.avg.toFixed(1)} Marks (${weakest.pct.toFixed(0)}%)`;
      }
    } else {
      if (kpiStrongest) kpiStrongest.textContent = '--';
      if (kpiWeakest) kpiWeakest.textContent = '--';
    }

    // KPI 5: Total Mocks Count & Split
    const kpiTotalCount = document.getElementById('mock-kpi-total-count');
    const kpiCountSplit = document.getElementById('mock-kpi-count-split');
    if (kpiTotalCount) kpiTotalCount.textContent = state.mockScores.length;
    if (kpiCountSplit) {
      kpiCountSplit.textContent = `${fullMocks.length} Full • ${secMocks.length} Sectional`;
    }

    // 3. Render Chart.js Graph
    renderMockChart();

    // 4. Render Historical Archive List
    renderMockArchiveList();
  }

  // --- Render Chart.js or Interactive SVG Trend Graph ---
  function renderMockChart() {
    const canvas = document.getElementById('mock-trends-canvas');
    if (!canvas) return;

    // Update active tab buttons visual state
    const btnFull = document.getElementById('btn-chart-view-full');
    const btnSec = document.getElementById('btn-chart-view-sectional');
    const btnAcc = document.getElementById('btn-chart-view-accuracy');

    const activeTab = state.mockChartActiveTab || 'full';

    [btnFull, btnSec, btnAcc].forEach(btn => {
      if (!btn) return;
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition active:scale-95';
    });

    if (activeTab === 'full' && btnFull) {
      btnFull.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition active:scale-95';
    } else if (activeTab === 'sectional' && btnSec) {
      btnSec.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 text-slate-950 transition active:scale-95';
    } else if (activeTab === 'accuracy' && btnAcc) {
      btnAcc.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500 text-slate-950 transition active:scale-95';
    }

    // Clean up previous instance
    if (mockChartInstance) {
      try {
        mockChartInstance.destroy();
      } catch (err) {
        console.warn('Error destroying chart instance:', err);
      }
      mockChartInstance = null;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js CDN not yet ready. Showing fallback presentation.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build Chart Dataset based on activeTab
    if (activeTab === 'full') {
      const fullMocks = state.mockScores
        .filter(m => m.type === 'full')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (fullMocks.length === 0) {
        // Render Empty Placeholder Chart
        mockChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
            datasets: [{
              label: 'No Full Mocks Logged',
              data: [0, 0, 0, 0],
              borderColor: '#334155',
              borderDash: [5, 5],
              pointRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
        return;
      }

      const labels = fullMocks.map((m, idx) => {
        const shortDate = m.date ? m.date.slice(5) : `T${idx + 1}`;
        return `M${idx + 1} (${shortDate})`;
      });

      const scores = fullMocks.map(m => parseFloat(m.score) || 0);
      const cutoffLine = fullMocks.map(() => 145.0);

      // Create gradient for under-the-curve
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      mockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Full Mock Score (/200)',
              data: scores,
              borderColor: '#10b981',
              backgroundColor: gradient,
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#0f172a',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#34d399'
            },
            {
              label: 'Safe Tier 1 Cutoff (145.0)',
              data: cutoffLine,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [6, 6],
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              labels: {
                color: '#cbd5e1',
                font: { family: 'ui-monospace, monospace', size: 11 },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              borderColor: '#334155',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                title: function(items) {
                  const idx = items[0].dataIndex;
                  const item = fullMocks[idx];
                  return `${item.title || 'Full Mock'} • ${formatDisplayDate(item.date)}`;
                },
                afterBody: function(items) {
                  const idx = items[0].dataIndex;
                  const item = fullMocks[idx];
                  const lines = [];
                  if (item.percentile) lines.push(`Percentile: ${item.percentile}%`);
                  if (item.accuracy) lines.push(`Accuracy: ${item.accuracy}%`);
                  if (item.sections) {
                    lines.push(`Maths: ${item.sections.maths ?? '-'} | Eng: ${item.sections.english ?? '-'} | Reas: ${item.sections.reasoning ?? '-'} | GA: ${item.sections.ga ?? '-'}`);
                  }
                  if (item.notes) lines.push(`Note: "${item.notes}"`);
                  return lines;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(51, 65, 85, 0.25)', drawBorder: false },
              ticks: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 10 } }
            },
            y: {
              min: Math.max(0, Math.floor((Math.min(...scores) - 20) / 10) * 10),
              max: 200,
              grid: { color: 'rgba(51, 65, 85, 0.35)', drawBorder: false },
              ticks: {
                color: '#94a3b8',
                font: { family: 'ui-monospace, monospace', size: 10 },
                stepSize: 20
              }
            }
          }
        }
      });
    } else if (activeTab === 'sectional') {
      // Show Sectional Breakdown (Maths, English, Reasoning, GA /50)
      const testList = state.mockScores
        .filter(m => (m.type === 'full' && m.sections) || (m.type === 'sectional'))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = testList.map((m, idx) => {
        const shortDate = m.date ? m.date.slice(5) : `T${idx + 1}`;
        return `T${idx + 1} (${shortDate})`;
      });

      const mathsData = testList.map(m => {
        if (m.type === 'full') return m.sections?.maths ?? null;
        return m.subject === 'maths' ? m.score : null;
      });

      const englishData = testList.map(m => {
        if (m.type === 'full') return m.sections?.english ?? null;
        return m.subject === 'english' ? m.score : null;
      });

      const reasoningData = testList.map(m => {
        if (m.type === 'full') return m.sections?.reasoning ?? null;
        return m.subject === 'reasoning' ? m.score : null;
      });

      const gaData = testList.map(m => {
        if (m.type === 'full') return m.sections?.ga ?? null;
        return m.subject === 'ga' ? m.score : null;
      });

      mockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Maths (/50)',
              data: mathsData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2.5,
              spanGaps: true,
              pointRadius: 4,
              tension: 0.3
            },
            {
              label: 'English (/50)',
              data: englishData,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderWidth: 2.5,
              spanGaps: true,
              pointRadius: 4,
              tension: 0.3
            },
            {
              label: 'Reasoning (/50)',
              data: reasoningData,
              borderColor: '#c084fc',
              backgroundColor: 'rgba(192, 132, 252, 0.1)',
              borderWidth: 2.5,
              spanGaps: true,
              pointRadius: 4,
              tension: 0.3
            },
            {
              label: 'GA / GK (/50)',
              data: gaData,
              borderColor: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderWidth: 2.5,
              spanGaps: true,
              pointRadius: 4,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: { color: '#cbd5e1', font: { family: 'ui-monospace, monospace', size: 11 }, usePointStyle: true }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(51, 65, 85, 0.25)' },
              ticks: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 10 } }
            },
            y: {
              min: 0,
              max: 50,
              grid: { color: 'rgba(51, 65, 85, 0.35)' },
              ticks: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 10 }, stepSize: 10 }
            }
          }
        }
      });
    } else if (activeTab === 'accuracy') {
      // Percentile & Accuracy (%) Trend
      const testsWithStats = state.mockScores
        .filter(m => (m.accuracy !== undefined && m.accuracy !== null) || (m.percentile !== undefined && m.percentile !== null))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = testsWithStats.map((m, idx) => {
        const shortDate = m.date ? m.date.slice(5) : `T${idx + 1}`;
        return `T${idx + 1} (${shortDate})`;
      });

      const accuracyData = testsWithStats.map(m => m.accuracy ?? null);
      const percentileData = testsWithStats.map(m => m.percentile ?? null);

      mockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Accuracy Rate (%)',
              data: accuracyData,
              borderColor: '#10b981',
              borderWidth: 2.5,
              spanGaps: true,
              tension: 0.3,
              pointRadius: 4
            },
            {
              label: 'Percentile Rank (%)',
              data: percentileData,
              borderColor: '#c084fc',
              borderWidth: 2.5,
              spanGaps: true,
              tension: 0.3,
              pointRadius: 4
            },
            {
              label: '90% Benchmark Threshold',
              data: labels.map(() => 90),
              borderColor: '#f59e0b',
              borderWidth: 1.5,
              borderDash: [5, 5],
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: { color: '#cbd5e1', font: { family: 'ui-monospace, monospace', size: 11 }, usePointStyle: true }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(51, 65, 85, 0.25)' },
              ticks: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 10 } }
            },
            y: {
              min: 50,
              max: 100,
              grid: { color: 'rgba(51, 65, 85, 0.35)' },
              ticks: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 10 }, stepSize: 10 }
            }
          }
        }
      });
    }
  }

  // --- Render Logged Mock Records Archive List ---
  function renderMockArchiveList() {
    const archiveList = document.getElementById('mock-entries-archive-list');
    const badgeEl = document.getElementById('mock-history-total-count-badge');
    if (!archiveList) return;

    const filter = state.mockHistoryFilter || 'all';
    const query = (state.mockSearchQuery || '').toLowerCase().trim();

    // Update filter buttons styling
    document.querySelectorAll('.mock-filter-btn').forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filter) {
        btn.className = 'mock-filter-btn px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 active:scale-95';
      } else {
        btn.className = 'mock-filter-btn px-3 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:text-white active:scale-95';
      }
    });

    // Filter Mocks
    let filtered = [...state.mockScores];

    if (filter === 'full') {
      filtered = filtered.filter(m => m.type === 'full');
    } else if (filter === 'maths') {
      filtered = filtered.filter(m => m.subject === 'maths' || (m.type === 'full' && m.sections?.maths !== undefined));
    } else if (filter === 'english') {
      filtered = filtered.filter(m => m.subject === 'english' || (m.type === 'full' && m.sections?.english !== undefined));
    } else if (filter === 'reasoning') {
      filtered = filtered.filter(m => m.subject === 'reasoning' || (m.type === 'full' && m.sections?.reasoning !== undefined));
    } else if (filter === 'ga') {
      filtered = filtered.filter(m => m.subject === 'ga' || (m.type === 'full' && m.sections?.ga !== undefined));
    }

    if (query) {
      filtered = filtered.filter(m => {
        const titleMatch = (m.title || '').toLowerCase().includes(query);
        const notesMatch = (m.notes || '').toLowerCase().includes(query);
        const dateMatch = (m.date || '').includes(query);
        const subjectMatch = (m.subject || '').toLowerCase().includes(query);
        return titleMatch || notesMatch || dateMatch || subjectMatch;
      });
    }

    // Sort descending by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (badgeEl) {
      badgeEl.textContent = `${filtered.length} of ${state.mockScores.length} Tests Logged`;
    }

    if (filtered.length === 0) {
      archiveList.innerHTML = `
        <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <div class="text-3xl">📭</div>
          <div class="text-sm font-bold text-white">No Mock Records Found</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            ${query ? `No tests matched your search query "${query}". Try searching another topic.` : 'No test attempts logged yet for this category filter. Use the console above to log your first score!'}
          </p>
        </div>
      `;
      return;
    }

    archiveList.innerHTML = filtered.map(mock => {
      const isFull = mock.type === 'full';
      const pct = mock.percentage !== undefined ? mock.percentage : ((mock.score / mock.maxScore) * 100);

      let typeBadge = '';
      if (isFull) {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">FULL MOCK (/200)</span>`;
      } else {
        const subLabels = { maths: 'MATHS', english: 'ENGLISH', reasoning: 'REASONING', ga: 'GA / GK' };
        const subColors = {
          maths: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          english: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          reasoning: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          ga: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
        const subKey = mock.subject || 'maths';
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${subColors[subKey] || 'bg-slate-800 text-slate-300 border-slate-700'}">SECTIONAL: ${subLabels[subKey] || subKey.toUpperCase()} (/50)</span>`;
      }

      // Sectional chips if full mock
      let sectionalChipsHtml = '';
      if (isFull && mock.sections) {
        sectionalChipsHtml = `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
            <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span class="text-slate-400">Maths:</span>
              <span class="font-bold text-emerald-400">${mock.sections.maths ?? '--'} / 50</span>
            </div>
            <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span class="text-slate-400">English:</span>
              <span class="font-bold text-sky-400">${mock.sections.english ?? '--'} / 50</span>
            </div>
            <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span class="text-slate-400">Reasoning:</span>
              <span class="font-bold text-purple-400">${mock.sections.reasoning ?? '--'} / 50</span>
            </div>
            <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span class="text-slate-400">GA / GK:</span>
              <span class="font-bold text-amber-400">${mock.sections.ga ?? '--'} / 50</span>
            </div>
          </div>
        `;
      }

      // Notes block
      const notesHtml = mock.notes ? `
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <span class="text-slate-500 select-none">💡</span>
          <span class="italic">${escapeHTML(mock.notes)}</span>
        </div>
      ` : '';

      return `
        <div class="mock-entry-card p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3" data-mock-card-id="${mock.id}">
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                ${typeBadge}
                <span class="text-xs font-mono text-slate-400">📅 ${formatDisplayDate(mock.date)}</span>
              </div>
              <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                ${escapeHTML(mock.title || 'Untitled Mock Test')}
              </h4>
            </div>

            <!-- Score Pill & Action Buttons -->
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <div class="text-lg font-black font-mono ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-300' : 'text-rose-400'}">
                  ${parseFloat(mock.score).toFixed(1)} <span class="text-xs text-slate-500 font-normal">/ ${mock.maxScore}</span>
                </div>
                <div class="text-[10px] font-mono text-slate-400">
                  ${pct.toFixed(1)}% ${mock.percentile ? `• ${mock.percentile}%ile` : ''} ${mock.accuracy ? `• ${mock.accuracy}% Acc` : ''}
                </div>
              </div>

              <!-- Edit & Delete Controls -->
              <div class="flex items-center gap-1">
                <button
                  class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition active:scale-95"
                  data-edit-mock-id="${mock.id}"
                  title="Edit mock score details"
                >
                  ✏️
                </button>
                <button
                  class="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs border border-slate-700 hover:border-rose-500/40 transition active:scale-95"
                  data-delete-mock-id="${mock.id}"
                  title="Delete this mock entry"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          ${sectionalChipsHtml}
          ${notesHtml}

        </div>
      `;
    }).join('');

    // Attach Edit & Delete Listeners
    archiveList.querySelectorAll('[data-edit-mock-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mockId = e.currentTarget.getAttribute('data-edit-mock-id');
        openEditMockModal(mockId);
      });
    });

    archiveList.querySelectorAll('[data-delete-mock-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mockId = e.currentTarget.getAttribute('data-delete-mock-id');
        const mock = state.mockScores.find(m => m.id === mockId);
        if (!mock) return;
        if (confirm(`Permanently delete scorecard for "${mock.title}"?`)) {
          state.mockScores = state.mockScores.filter(m => m.id !== mockId);
          saveState();
          renderMockTrends();
        }
      });
    });
  }

  // --- Open & Populate Modal to Edit Mock Record ---
  function openEditMockModal(mockId) {
    const mock = state.mockScores.find(m => m.id === mockId);
    if (!mock) return;

    const modalId = 'modal-edit-mock';
    const form = document.getElementById('form-modal-edit-mock');
    if (!form) return;

    // Populate inputs
    const inputId = document.getElementById('edit-mock-id');
    const inputType = document.getElementById('edit-mock-type');
    const inputTitle = document.getElementById('edit-mock-title');
    const inputDate = document.getElementById('edit-mock-date');
    const inputScore = document.getElementById('edit-mock-score');
    const inputMax = document.getElementById('edit-mock-max-score');
    const containerSubject = document.getElementById('edit-mock-subject-container');
    const inputSubject = document.getElementById('edit-mock-subject');
    const containerPercentile = document.getElementById('edit-mock-percentile-container');
    const inputPercentile = document.getElementById('edit-mock-percentile');
    const boxSectional = document.getElementById('edit-mock-sectional-box');
    const inputMaths = document.getElementById('edit-mock-maths');
    const inputEnglish = document.getElementById('edit-mock-english');
    const inputReasoning = document.getElementById('edit-mock-reasoning');
    const inputGa = document.getElementById('edit-mock-ga');
    const inputNotes = document.getElementById('edit-mock-notes');

    if (inputId) inputId.value = mock.id;
    if (inputType) inputType.value = mock.type;
    if (inputTitle) inputTitle.value = mock.title || '';
    if (inputDate) inputDate.value = mock.date || getStudyCycleDate();
    if (inputScore) inputScore.value = mock.score !== undefined ? mock.score : '';
    if (inputMax) inputMax.value = mock.maxScore || (mock.type === 'full' ? 200 : 50);
    if (inputPercentile) inputPercentile.value = mock.percentile || '';
    if (inputNotes) inputNotes.value = mock.notes || '';

    if (mock.type === 'sectional') {
      if (containerSubject) containerSubject.classList.remove('hidden');
      if (boxSectional) boxSectional.classList.add('hidden');
      if (inputSubject) inputSubject.value = mock.subject || 'maths';
    } else {
      if (containerSubject) containerSubject.classList.add('hidden');
      if (boxSectional) boxSectional.classList.remove('hidden');
      if (inputMaths) inputMaths.value = mock.sections?.maths !== undefined ? mock.sections.maths : '';
      if (inputEnglish) inputEnglish.value = mock.sections?.english !== undefined ? mock.sections.english : '';
      if (inputReasoning) inputReasoning.value = mock.sections?.reasoning !== undefined ? mock.sections.reasoning : '';
      if (inputGa) inputGa.value = mock.sections?.ga !== undefined ? mock.sections.ga : '';
    }

    openModal(modalId);
  }

  function updateSidebarStatus() {
    const cycleDate = document.getElementById('sidebar-cycle-date');
    const targetHours = document.getElementById('sidebar-target-hours');
    const mathsQs = document.getElementById('sidebar-maths-qs');

    if (cycleDate) cycleDate.textContent = state.activeCycleDate || '--';
    if (targetHours) targetHours.textContent = `${state.targetHours.toFixed(1)} Hours`;
    if (mathsQs) mathsQs.textContent = `${state.mathsQuestionsDone || 0} / 320`;
  }

  function update5amCountdown() {
    const el = document.getElementById('top-5am-countdown');
    const subEl = document.getElementById('ticker-5am-countdown-sub');
    if (!el && !subEl) return;

    const now = new Date();
    const next5am = new Date(now);
    if (now.getHours() >= 5) {
      next5am.setDate(next5am.getDate() + 1);
    }
    next5am.setHours(5, 0, 0, 0);

    const diff = Math.max(0, next5am.getTime() - now.getTime());
    const totalSecs = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const formattedTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (el) {
      el.textContent = `5 AM in ${formattedTime}`;
    }
    if (subEl) {
      subEl.textContent = formattedTime;
    }
  }

  // ==========================================================================
  // 8. GUARANTEED BUG-FREE MODAL ENGINE (CLOSE X, OVERLAY CLICK, ESC KEY)
  // ==========================================================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('active');
    });
  }

  function openRewardModal(milestone) {
    const icon = document.getElementById('reward-icon-display');
    const badge = document.getElementById('reward-streak-badge');
    const title = document.getElementById('reward-title-display');
    const desc = document.getElementById('reward-desc-display');

    if (icon) icon.textContent = milestone.icon || '🎁';
    if (badge) badge.textContent = `🔥 ${milestone.streak}-DAY STREAK UNLOCKED!`;
    if (title) title.textContent = milestone.title || 'New Feature Unlocked!';
    if (desc) desc.textContent = milestone.desc || 'Ruthless consistency pays off.';

    playChime('reward');
    openModal('modal-reward');
  }

  function openEditSubjectModal(subjectId) {
    const s = state.subjects.find(sub => sub.id === subjectId);
    if (!s) return;

    const title = document.getElementById('modal-edit-subject-title');
    const inputId = document.getElementById('edit-subject-id');
    const inputH = document.getElementById('edit-subject-hrs');
    const inputM = document.getElementById('edit-subject-mins');
    const inputS = document.getElementById('edit-subject-secs');

    if (title) title.textContent = `Edit Time: ${s.name}`;
    if (inputId) inputId.value = s.id;

    const total = s.seconds || 0;
    if (inputH) inputH.value = Math.floor(total / 3600);
    if (inputM) inputM.value = Math.floor((total % 3600) / 60);
    if (inputS) inputS.value = total % 60;

    openModal('modal-edit-subject-time');
  }

  function openEditBreakModal() {
    let currentTotalBreakSecs = state.todayBreakSeconds;
    if (state.isBreakTimerRunning && state.currentBreakSessionStart) {
      currentTotalBreakSecs += Math.floor((Date.now() - state.currentBreakSessionStart) / 1000);
    }

    const inputH = document.getElementById('edit-break-hrs');
    const inputM = document.getElementById('edit-break-mins');
    const inputS = document.getElementById('edit-break-secs');

    if (inputH) inputH.value = Math.floor(currentTotalBreakSecs / 3600);
    if (inputM) inputM.value = Math.floor((currentTotalBreakSecs % 3600) / 60);
    if (inputS) inputS.value = currentTotalBreakSecs % 60;

    openModal('modal-edit-break-time');
  }

  function openEditHabitModal(habitId) {
    const h = state.habits.find(item => item.id === habitId);
    if (!h) return;

    const inputId = document.getElementById('edit-habit-id');
    const inputTitle = document.getElementById('edit-habit-title');

    if (inputId) inputId.value = h.id;
    if (inputTitle) inputTitle.value = h.title;

    openModal('modal-edit-habit');
  }

  function openEditHistoryModal(index) {
    const log = state.history[index];
    if (!log) return;

    const inputIdx = document.getElementById('edit-history-index');
    const inputStudy = document.getElementById('edit-history-study-hrs');
    const inputBreak = document.getElementById('edit-history-break-hrs');
    const inputMaths = document.getElementById('edit-history-maths-qs');

    if (inputIdx) inputIdx.value = index;
    if (inputStudy) inputStudy.value = (log.totalStudySeconds / 3600).toFixed(1);
    if (inputBreak) inputBreak.value = (log.breakSeconds / 3600).toFixed(1);
    if (inputMaths) inputMaths.value = log.mathsQuestions || 0;

    openModal('modal-edit-history');
  }

  // --- 8G. CUSTOM SUBJECT & CURRICULUM MANAGER MODAL ---
  function openSubjectManagerModal() {
    state.editingManagerSubjectId = null;
    renderSubjectManagerList();
    openModal('modal-manage-subjects');
  }

  function renderSubjectManagerList() {
    const listContainer = document.getElementById('subject-manager-list');
    const countEl = document.getElementById('subject-manager-count');
    if (!Array.isArray(state.subjects)) {
      state.subjects = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
    }

    if (countEl) countEl.textContent = state.subjects.length;
    if (!listContainer) return;

    if (state.subjects.length === 0) {
      listContainer.innerHTML = `
        <div class="p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
          <div class="text-2xl">📚</div>
          <h5 class="text-xs font-bold text-white">No Subjects Configured</h5>
          <p class="text-[11px] text-slate-400">Add a subject above or click "Restore Core Subjects" to load defaults.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = state.subjects.map(s => {
      const isEditing = (state.editingManagerSubjectId === s.id);
      const badge = getSubjectBadge(s.shortName || s.name);

      if (isEditing) {
        return `
          <div class="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/60 shadow-lg space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div class="sm:col-span-5">
                <label class="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Subject Full Name</label>
                <input
                  type="text"
                  id="edit-sm-name-${s.id}"
                  value="${escapeHtml(s.name)}"
                  class="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div class="sm:col-span-3">
                <label class="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Short Tag</label>
                <input
                  type="text"
                  id="edit-sm-short-${s.id}"
                  value="${escapeHtml(s.shortName || s.name)}"
                  class="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Icon</label>
                <input
                  type="text"
                  id="edit-sm-icon-${s.id}"
                  value="${escapeHtml(s.icon || '⚡')}"
                  maxlength="4"
                  class="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Color</label>
                <select id="edit-sm-color-${s.id}" class="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono">
                  <option value="emerald" ${s.color === 'emerald' ? 'selected' : ''}>🟢 Emerald</option>
                  <option value="sky" ${s.color === 'sky' ? 'selected' : ''}>🔵 Sky</option>
                  <option value="violet" ${s.color === 'violet' ? 'selected' : ''}>🟣 Violet</option>
                  <option value="amber" ${s.color === 'amber' ? 'selected' : ''}>🟠 Amber</option>
                  <option value="rose" ${s.color === 'rose' ? 'selected' : ''}>🔴 Rose</option>
                  <option value="cyan" ${s.color === 'cyan' ? 'selected' : ''}>🩵 Cyan</option>
                  <option value="fuchsia" ${s.color === 'fuchsia' ? 'selected' : ''}>🌸 Fuchsia</option>
                  <option value="teal" ${s.color === 'teal' ? 'selected' : ''}>🌊 Teal</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                data-save-sm-edit="${s.id}"
                class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer"
              >
                Save Changes
              </button>
              <button
                type="button"
                data-cancel-sm-edit
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${badge.badgeClass}">
              ${s.icon || '⚡'}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold text-white leading-tight truncate">${escapeHtml(s.name)}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${badge.badgeClass}">
                  ${escapeHtml(s.shortName || s.name)}
                </span>
                ${s.isDefault ? `
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                    Core
                  </span>
                ` : `
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                    Custom
                  </span>
                `}
              </div>
              <span class="text-[11px] font-mono text-slate-400 block mt-0.5">
                Logged Time: ${formatHMS(s.seconds || 0)}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              data-edit-sm="${s.id}"
              class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
              title="Edit Subject Details"
            >
              ✏️
            </button>
            <button
              type="button"
              data-delete-sm="${s.id}"
              class="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-slate-800 text-xs transition cursor-pointer"
              title="Delete Subject"
            >
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Listeners to Subject Manager Items
    // 1. Edit Trigger
    listContainer.querySelectorAll('[data-edit-sm]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-edit-sm');
        state.editingManagerSubjectId = id;
        renderSubjectManagerList();
      });
    });

    // 2. Cancel Edit
    listContainer.querySelectorAll('[data-cancel-sm-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.editingManagerSubjectId = null;
        renderSubjectManagerList();
      });
    });

    // 3. Save Edit
    listContainer.querySelectorAll('[data-save-sm-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-save-sm-edit');
        const s = state.subjects.find(item => item.id === id);
        if (!s) return;

        const inputName = document.getElementById(`edit-sm-name-${id}`);
        const inputShort = document.getElementById(`edit-sm-short-${id}`);
        const inputIcon = document.getElementById(`edit-sm-icon-${id}`);
        const selectColor = document.getElementById(`edit-sm-color-${id}`);

        if (!inputName || !inputName.value.trim()) {
          alert('Subject name is required.');
          return;
        }

        s.name = inputName.value.trim();
        s.shortName = (inputShort && inputShort.value.trim()) ? inputShort.value.trim() : s.name;
        s.icon = (inputIcon && inputIcon.value.trim()) ? inputIcon.value.trim() : '⚡';
        if (selectColor) s.color = selectColor.value;

        state.editingManagerSubjectId = null;
        saveState();
        playChime('success');

        renderSubjectManagerList();
        renderWeeklyView();
        renderMonthlyView();
        renderSubjectCards();
        renderSubjectBreakdown();
      });
    });

    // 4. Delete Subject
    listContainer.querySelectorAll('[data-delete-sm]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-sm');
        const s = state.subjects.find(item => item.id === id);
        if (!s) return;

        if (state.subjects.length <= 1) {
          alert('At least one subject must remain in your curriculum.');
          return;
        }

        const msg = s.isDefault
          ? `Delete core subject "${s.name}"? You can restore default subjects anytime.`
          : `Delete custom subject "${s.name}"?`;

        if (confirm(msg)) {
          state.subjects = state.subjects.filter(item => item.id !== id);
          if (state.activeSubjectId === id) {
            state.activeSubjectId = null;
            state.activeSubjectStartTime = null;
          }
          saveState();

          renderSubjectManagerList();
          renderWeeklyView();
          renderMonthlyView();
          renderSubjectCards();
          renderSubjectBreakdown();
        }
      });
    });
  }

  function bindSubjectManagerModalControls() {
    // 1. Emoji Picker Chips
    const chipsContainer = document.getElementById('subject-icon-picker-chips');
    const inputIcon = document.getElementById('input-new-subject-icon');
    if (chipsContainer && inputIcon) {
      chipsContainer.querySelectorAll('.subj-icon-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const icon = e.currentTarget.getAttribute('data-icon');
          if (icon) {
            inputIcon.value = icon;
            chipsContainer.querySelectorAll('.subj-icon-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
          }
        });
      });
    }

    // 2. Create Custom Subject Form
    const formCreate = document.getElementById('form-create-custom-subject');
    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputName = document.getElementById('input-new-subject-name');
        const inputShort = document.getElementById('input-new-subject-short');
        const selectColor = document.getElementById('select-new-subject-color');
        const iconVal = (inputIcon && inputIcon.value.trim()) ? inputIcon.value.trim() : '⚡';

        if (!inputName || !inputName.value.trim()) return;

        const name = inputName.value.trim();
        const shortName = (inputShort && inputShort.value.trim()) ? inputShort.value.trim() : name;
        const color = selectColor ? selectColor.value : 'emerald';

        const newSubj = {
          id: 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: name,
          shortName: shortName,
          icon: iconVal,
          color: color,
          seconds: 0,
          isRunning: false,
          isDefault: false
        };

        if (!Array.isArray(state.subjects)) state.subjects = [];
        state.subjects.push(newSubj);
        saveState();

        inputName.value = '';
        if (inputShort) inputShort.value = '';
        playChime('success');

        renderSubjectManagerList();
        renderWeeklyView();
        renderMonthlyView();
        renderSubjectCards();
        renderSubjectBreakdown();
      });
    }

    // 3. Restore Default Core Subjects
    const btnRestore = document.getElementById('btn-restore-default-subjects');
    if (btnRestore) {
      btnRestore.addEventListener('click', () => {
        if (confirm('Restore standard core subjects (Maths, English, Reasoning, GA, Mock Tests)? Any existing custom subjects and logged times will be preserved.')) {
          DEFAULT_SUBJECTS.forEach(def => {
            const exists = state.subjects.some(s => s.id === def.id || (s.shortName || s.name).toLowerCase() === (def.shortName || def.name).toLowerCase());
            if (!exists) {
              state.subjects.push(JSON.parse(JSON.stringify(def)));
            }
          });
          saveState();
          playChime('success');
          renderSubjectManagerList();
          renderWeeklyView();
          renderMonthlyView();
          renderSubjectCards();
          renderSubjectBreakdown();
        }
      });
    }

    // 4. Header & Tab buttons opening Subject Manager
    const btnOpenSubjMgrHub = document.getElementById('btn-open-subject-manager-hub');
    if (btnOpenSubjMgrHub) {
      btnOpenSubjMgrHub.addEventListener('click', () => openSubjectManagerModal());
    }
  }

  // ==========================================================================
  // 9. NAVIGATION & SECTION SWITCHING
  // ==========================================================================

  function navigateTo(sectionKey) {
    if (sectionKey === 'habits') {
      sectionKey = 'calendar';
    }

    let targetHubTab = null;
    if (sectionKey === 'todo-hub') {
      sectionKey = 'revision';
      targetHubTab = 'weekly';
    }

    // Hide all sections
    const sections = ['home', 'subjects', 'syllabus', 'revision', 'calendar', 'journal', 'mock-trends', 'energy', 'vault', 'mock-pdf', 'history', 'settings'];
    sections.forEach(sec => {
      const el = document.getElementById(`section-${sec}`);
      if (el) {
        if (sec === sectionKey) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Update active class in sidebar links
    document.querySelectorAll('#sidebar-nav .nav-link').forEach(btn => {
      const linkNav = btn.getAttribute('data-nav');
      if (linkNav === sectionKey || (sectionKey === 'calendar' && linkNav === 'habits') || (sectionKey === 'revision' && linkNav === 'todo-hub' && targetHubTab)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (sectionKey === 'home') {
      updateCountdownTicker();
      renderHomeView();
      renderWeakAreas();
    } else if (sectionKey === 'subjects') {
      renderSubjectCards();
    } else if (sectionKey === 'syllabus') {
      renderSyllabus();
    } else if (sectionKey === 'revision') {
      if (targetHubTab) {
        switchHubTab(targetHubTab);
      } else {
        renderTodoHub();
        renderTargetHub();
        renderRevisionSystem();
      }
    } else if (sectionKey === 'calendar') {
      renderCalendar();
      renderDayInspectionCard();
      renderHabitsList();
      renderMilestones();
    } else if (sectionKey === 'journal') {
      renderJournal();
    } else if (sectionKey === 'mock-trends') {
      renderMockTrends();
    } else if (sectionKey === 'energy') {
      renderEnergyRating();
      renderEnergyHistory();
    } else if (sectionKey === 'vault') {
      renderVault();
    } else if (sectionKey === 'history') {
      renderHistoryTable();
    }

    // Close sidebar drawer
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100', 'pointer-events-auto');
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100', 'pointer-events-auto');
    }
  }

  // ==========================================================================
  // 10. MOZILLA PDF.JS & TESSERACT CLIENT-SIDE OCR & MOCK ANALYSIS INTEGRATION
  // ==========================================================================

  // Perform client-side OCR recognition on an HTMLCanvasElement, Blob, or File
  async function runOcrOnImageSource(imageSource, onProgress) {
    // @ts-ignore
    if (typeof window === 'undefined' || !window.Tesseract) {
      throw new Error('Tesseract OCR engine is not loaded. Please verify your internet connection.');
    }

    try {
      // @ts-ignore
      const result = await window.Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => {
          if (onProgress && m && typeof m.progress === 'number') {
            const statusLabel = m.status === 'recognizing text' ? 'Recognizing text' : (m.status || 'Processing');
            onProgress(statusLabel, Math.min(1, Math.max(0, m.progress)));
          }
        }
      });
      return (result && result.data && result.data.text) ? String(result.data.text).trim() : '';
    } catch (ocrErr) {
      console.warn('Tesseract recognition warning:', ocrErr);
      throw ocrErr;
    }
  }

  // Render PDF pages to high-resolution canvases and perform OCR fallback
  async function extractOcrFromPdfDocument(pdf, onProgress) {
    let fullOcrText = '';
    const maxPages = Math.min(pdf.numPages || 1, 5);

    for (let i = 1; i <= maxPages; i++) {
      if (onProgress) {
        onProgress(`Rendering Page ${i} of ${maxPages} for OCR...`, 0.1 + (i - 1) / maxPages * 0.8);
      }

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.8 }); // 1.8x scale for sharp text readability
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (!ctx) continue;

      // Render PDF page to canvas
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Run OCR on rendered canvas
      const pageText = await runOcrOnImageSource(canvas, (status, pct) => {
        if (onProgress) {
          const overallPct = ((i - 1) + pct) / maxPages;
          onProgress(`OCR Page ${i}/${maxPages}: ${status} (${Math.round(pct * 100)}%)`, overallPct);
        }
      });

      if (pageText) {
        fullOcrText += `\n--- PAGE ${i} (OCR Extracted) ---\n` + pageText;
      }
    }

    return fullOcrText.trim();
  }

  // Unified extractor: Supports native text PDFs, scanned/image-based PDFs via OCR fallback, and screenshot image files
  async function extractTextFromUploadedFile(file, onProgress) {
    const fileNameLower = (file.name || '').toLowerCase();
    const isImageFile = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileNameLower);

    // 1. Direct Image File (Screenshot of scorecard)
    if (isImageFile) {
      if (onProgress) onProgress('Scanning scorecard screenshot via OCR engine...', 0.2);
      const ocrText = await runOcrOnImageSource(file, onProgress);
      return { text: ocrText, method: 'ocr_image' };
    }

    // 2. PDF Document
    // @ts-ignore
    if (typeof window === 'undefined' || !window.pdfjsLib) {
      throw new Error('PDF.js library is not available. Please check your network.');
    }

    try {
      // @ts-ignore
      if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // @ts-ignore
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    } catch (e) {
      // Worker options setup fallback
    }

    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    // Step A: Attempt fast native PDF vector text layer extraction
    if (onProgress) onProgress('Checking PDF text stream...', 0.1);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = '';
      if (content && Array.isArray(content.items)) {
        pageText = content.items
          .map((item) => {
            if (item && typeof item.str === 'string') return item.str;
            if (item && item.chars && Array.isArray(item.chars)) {
              return item.chars.map((c) => (c && c.c) || '').join('');
            }
            return '';
          })
          .filter(Boolean)
          .join(' ');
      }
      fullText += `\n--- PAGE ${i} ---\n` + pageText;
    }

    const cleanNativeText = fullText.replace(/---\s*PAGE\s*\d+\s*---/gi, '').trim();
    const alphaNumCount = (cleanNativeText.match(/[a-zA-Z0-9]/g) || []).length;

    // If native text is found with sufficient content, return immediately!
    if (alphaNumCount >= 25) {
      return { text: fullText.trim(), method: 'native_pdf' };
    }

    // Step B: Scanned / Image-based PDF detected -> Trigger OCR Fallback!
    if (onProgress) onProgress('Scanned PDF detected. Starting automatic client-side OCR fallback...', 0.15);
    const ocrExtracted = await extractOcrFromPdfDocument(pdf, onProgress);
    return { text: ocrExtracted, method: 'ocr_pdf' };
  }

  async function runMockAnalysis() {
    const outputBox = document.getElementById('mock-analysis-output');
    const statusPill = document.getElementById('mock-status-pill');
    const selectMockType = document.getElementById('select-mock-type');
    const mockType = selectMockType ? selectMockType.value : 'full';
    const fileInput = document.getElementById('mock-pdf-file-input');
    const rawTextArea = document.getElementById('mock-raw-text');

    let textToAnalyze = '';
    let fileName = '';
    let extractionMethod = 'manual';

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      fileName = file.name;
      if (statusPill) statusPill.textContent = 'Reading Document...';
      if (outputBox) {
        outputBox.innerHTML = `
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
            <div class="flex items-center gap-2 text-emerald-400 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span id="mock-extract-status-text">Extracting text & checking for scanned images...</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div id="mock-extract-progress-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-300 w-1/4 animate-pulse"></div>
            </div>
            <p class="text-[11px] text-slate-400">Processing ${escapeHtml(fileName)} (PDF.js + OCR Engine)</p>
          </div>
        `;
      }

      const updateProgressUI = (msg, pct) => {
        const textEl = document.getElementById('mock-extract-status-text');
        const barEl = document.getElementById('mock-extract-progress-bar');
        if (textEl) textEl.textContent = msg;
        if (barEl && typeof pct === 'number') {
          barEl.style.width = `${Math.min(100, Math.max(10, Math.round(pct * 100)))}%`;
        }
        if (statusPill) {
          statusPill.textContent = msg.length > 25 ? msg.slice(0, 25) + '...' : msg;
        }
      };

      try {
        const result = await extractTextFromUploadedFile(file, updateProgressUI);
        textToAnalyze = result.text || '';
        extractionMethod = result.method;

        // Populate raw text area so the user can inspect what OCR/PDF.js extracted
        if (rawTextArea && (!rawTextArea.value || !rawTextArea.value.trim())) {
          rawTextArea.value = textToAnalyze;
        }
      } catch (err) {
        console.error('File text extraction error:', err);
        if (statusPill) statusPill.textContent = 'Scanned PDF Detected';
        if (outputBox) {
          outputBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-2.5">
              <div class="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <span>⚠️</span>
                <span>Scanned PDF or Image Detected</span>
              </div>
              <p class="text-slate-300 leading-relaxed">
                Could not automatically OCR text from this file (${escapeHtml(err.message || String(err))}).
              </p>
              <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p class="text-amber-400 font-semibold text-xs">
                  👉 Scanned PDF detected. Please paste raw scorecard text in <strong>Mode 2 (Direct Text Input)</strong> instead.
                </p>
                <button type="button" id="btn-switch-to-mode2" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition">
                  ✏️ Jump to Mode 2 Text Area
                </button>
              </div>
            </div>
          `;
          const switchBtn = document.getElementById('btn-switch-to-mode2');
          if (switchBtn) {
            switchBtn.addEventListener('click', () => {
              const rawArea = document.getElementById('mock-raw-text');
              if (rawArea) {
                rawArea.focus();
                rawArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            });
          }
        }
        return;
      }
    } else if (rawTextArea && rawTextArea.value.trim()) {
      textToAnalyze = rawTextArea.value.trim();
      extractionMethod = 'direct_text';
    } else {
      alert('Please upload a PDF scorecard / screenshot or paste mock results text.');
      return;
    }

    // Check if the extracted text contains meaningful alphanumeric characters
    const meaningfulText = textToAnalyze.replace(/---\s*PAGE\s*\d+.*---\s*/gi, '').trim();
    const alphaNumCount = (meaningfulText.match(/[a-zA-Z0-9]/g) || []).length;

    if (!meaningfulText || alphaNumCount < 15) {
      if (statusPill) statusPill.textContent = 'Scanned PDF Detected';
      if (outputBox) {
        outputBox.innerHTML = `
          <div class="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-2.5">
            <div class="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <span>⚠️</span>
              <span>Scanned PDF / Screenshot Detected</span>
            </div>
            <p class="text-slate-300 leading-relaxed">
              No readable text could be recognized from this document. It may be too low resolution or a blank page.
            </p>
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <p class="text-amber-400 font-semibold text-xs">
                👉 Scanned PDF detected. Please paste raw scorecard text in <strong>Mode 2 (Direct Text Input)</strong> instead.
              </p>
              <button type="button" id="btn-switch-to-mode2" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition">
                ✏️ Jump to Mode 2 Text Area
              </button>
            </div>
          </div>
        `;
        const switchBtn = document.getElementById('btn-switch-to-mode2');
        if (switchBtn) {
          switchBtn.addEventListener('click', () => {
            const rawArea = document.getElementById('mock-raw-text');
            if (rawArea) {
              rawArea.focus();
              rawArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
      }
      return;
    }

    // Ensure textToAnalyze is a clean plain text string and limit payload size safely
    textToAnalyze = String(textToAnalyze).trim().slice(0, 100000);

    const isOcrUsed = extractionMethod.startsWith('ocr');
    if (statusPill) statusPill.textContent = isOcrUsed ? 'OCR Complete • Analyzing...' : 'Analyzing with Gemini AI...';
    if (outputBox) {
      outputBox.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Querying Gemini AI mock diagnostic model...</span>
          </div>
          ${isOcrUsed ? '<p class="text-[11px] text-sky-400">✓ OCR successfully recognized text from image/scanned scorecard</p>' : ''}
        </div>
      `;
    }

    try {
      const endpoint = fileName ? '/api/gemini/analyze-pdf-mock' : '/api/gemini/analyze-mock';
      const payload = fileName ? { extractedText: textToAnalyze, pdfFileName: fileName } : { rawText: textToAnalyze, mockType };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Safely read text first to prevent JSON parse crashes on HTML error responses
      const rawResText = await res.text();
      let data;
      try {
        data = JSON.parse(rawResText);
      } catch (parseErr) {
        if (res.ok && rawResText && !rawResText.trim().startsWith('<')) {
          data = { analysis: rawResText };
        } else {
          const cleanErr = rawResText.replace(/<[^>]*>?/gm, '').trim();
          throw new Error(cleanErr.slice(0, 300) || `Server returned HTTP ${res.status}`);
        }
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze mock');
      }

      if (statusPill) statusPill.textContent = 'Analysis Complete';
      playChime('reward');

      // Normalize data response
      let parsedData = data;
      if (data.analysis && typeof data.analysis === 'string') {
        try {
          const cleaned = data.analysis.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleaned);
        } catch (_e) {
          parsedData = { overallVerdict: data.analysis, rawMarkdown: data.analysis };
        }
      }

      // Render comprehensive structured diagnostic report
      renderMockDiagnosticReport(parsedData, outputBox);

      // Automatically populate or enrich Weak Areas Radar on homepage!
      if (parsedData.weakPoints && Array.isArray(parsedData.weakPoints)) {
        parsedData.weakPoints.slice(0, 3).forEach((wp, i) => {
          const topicStr = String(wp).slice(0, 60);
          if (!state.weakAreas.some(w => w.topic.toLowerCase() === topicStr.toLowerCase())) {
            state.weakAreas.unshift({
              id: 'mock_weak_' + Date.now() + '_' + i,
              subject: 'Mock',
              topic: topicStr,
              advice: 'Auto-extracted from latest Mock Diagnostic. Solve 50 PYQ drills.',
              resolved: false
            });
          }
        });
        // Limit to 8 radar items
        state.weakAreas = state.weakAreas.slice(0, 8);
        saveState();
        renderWeakAreas();
      }

    } catch (err) {
      if (statusPill) statusPill.textContent = 'Analysis Failed';
      if (outputBox) {
        let cleanMsg = err.message || String(err);
        try {
          const parsed = JSON.parse(cleanMsg);
          if (parsed && parsed.error && parsed.error.message) {
            cleanMsg = parsed.error.message;
          }
        } catch (_e) {}

        const isBusy = cleanMsg.includes('503') || cleanMsg.includes('UNAVAILABLE') || cleanMsg.includes('high demand') || cleanMsg.includes('busy');

        outputBox.innerHTML = `
          <div class="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/80 text-rose-200 text-xs space-y-3">
            <div class="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <span>⚠️</span>
              <span>${isBusy ? 'AI Model Temporarily Busy' : 'Mock Diagnostic Error'}</span>
            </div>
            <p class="text-slate-300 leading-relaxed font-sans">
              ${isBusy 
                ? 'The Gemini AI model is currently experiencing high temporary demand spikes. Your scorecard text is safely saved above.' 
                : escapeHtml(cleanMsg)}
            </p>
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button type="button" id="btn-retry-mock-analysis" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
                <span>🔄</span>
                <span>Retry AI Diagnostic Now</span>
              </button>
              <button type="button" id="btn-offline-mock-parse" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5">
                <span>⚡</span>
                <span>Instant Rule-Based Score Parse</span>
              </button>
            </div>
          </div>
        `;

        const retryBtn = document.getElementById('btn-retry-mock-analysis');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            runMockAnalysis();
          });
        }

        const offlineBtn = document.getElementById('btn-offline-mock-parse');
        if (offlineBtn) {
          offlineBtn.addEventListener('click', () => {
            const raw = rawTextArea ? rawTextArea.value : textToAnalyze;
            if (!raw || !raw.trim()) {
              alert('No scorecard text available to parse.');
              return;
            }
            const fallbackResult = parseMockLocally(raw, mockType);
            if (statusPill) statusPill.textContent = 'Offline Analysis Done';
            renderMockDiagnosticReport(fallbackResult, outputBox, true);
          });
        }
      }
    }
  }

  // Helper to determine subject CSS badge class for mock diagnostics
  function getMockAnalysisSubjectBadgeClass(subj) {
    const s = String(subj || '').toLowerCase();
    if (s.includes('quant') || s.includes('math')) return 'subj-badge-quant';
    if (s.includes('reason') || s.includes('intel')) return 'subj-badge-reasoning';
    if (s.includes('eng')) return 'subj-badge-english';
    if (s.includes('ga') || s.includes('gk') || s.includes('aware') || s.includes('general')) return 'subj-badge-ga';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  }

  // Render the Enhanced AI Diagnostic Output Report in Clean Card & Table Formats
  function renderMockDiagnosticReport(data, outputBox, isOfflineFallback = false) {
    if (!outputBox) return;

    // Handle pure raw markdown fallback if JSON couldn't be formed
    if (data.rawMarkdown && !data.questionAnalysis) {
      outputBox.innerHTML = `
        <div class="space-y-4">
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>✨ AI Performance Diagnostic Report</span>
            <span class="font-mono text-[11px] text-slate-400">SSC CGL 2027 Diagnostic</span>
          </div>
          <div class="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-slate-900 border border-slate-800">${escapeHtml(data.rawMarkdown)}</div>
        </div>
      `;
      return;
    }

    const totalMarks = data.totalMarks || 200;
    const score = typeof data.score === 'number' ? data.score : 0;
    const accuracy = typeof data.accuracyPercent === 'number' ? data.accuracyPercent : 0;
    const correct = data.correct || 0;
    const wrong = data.wrong || 0;
    const attempted = data.attempted || (correct + wrong);
    const unattempted = typeof data.unattempted === 'number' ? data.unattempted : Math.max(0, (data.totalQuestions || 100) - attempted);
    const negativeLost = typeof data.negativeMarksLost === 'number' ? data.negativeMarksLost : (wrong * 0.5);

    const questions = Array.isArray(data.questionAnalysis) ? data.questionAnalysis : [];
    const sections = Array.isArray(data.sectionBreakdown) ? data.sectionBreakdown : [];

    // Construct Question Cards HTML
    const renderQuestionCardsHtml = (filteredQuestions) => {
      if (!filteredQuestions || filteredQuestions.length === 0) {
        return `
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <span class="text-2xl">🎉</span>
            <p class="text-slate-300 text-xs font-semibold">No negative marks or errors recorded for this filter.</p>
            <p class="text-slate-500 text-[11px]">All attempted questions in this subject met accuracy benchmarks.</p>
          </div>
        `;
      }

      return `
        <div class="space-y-4">
          ${filteredQuestions.map((q, idx) => {
            const subjBadge = getMockAnalysisSubjectBadgeClass(q.subject);
            const qNum = escapeHtml(q.questionNumber || `Q.${idx + 1}`);
            const qSubj = escapeHtml(q.subject || 'General');
            const qTopic = escapeHtml(q.topic || 'Core Concept');
            const qError = escapeHtml(q.userError || 'Conceptual error or hasty calculation slip.');
            const qSol = escapeHtml(q.correctAnswerAndExplanation || 'Review core step-by-step logic and formula.');
            const qTrick = escapeHtml(q.shortcutTrick || 'Use option elimination or standard shortcut formula.');
            const qFix = escapeHtml(q.actionableFix || 'Solve 10 similar PYQ drill questions before next mock.');

            return `
              <div class="diagnostic-q-card p-4 space-y-3.5" data-subject="${qSubj}">
                <!-- Card Header -->
                <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold ${subjBadge}">
                      ${qSubj}
                    </span>
                    <span class="font-mono font-extrabold text-sm text-white">${qNum}</span>
                    <span class="text-slate-500 font-mono text-xs">•</span>
                    <span class="text-xs font-bold text-slate-200 tracking-wide">${qTopic}</span>
                  </div>
                  <button type="button" class="btn-track-mock-weak px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-mono text-[10.5px] font-semibold transition flex items-center gap-1" data-topic="${qTopic}" data-subject="${qSubj}" data-fix="${qFix}">
                    <span>+</span>
                    <span>Track in Radar</span>
                  </button>
                </div>

                <!-- 4 Structural Diagnostic Quadrants -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <!-- 1. Your Error / What Went Wrong -->
                  <div class="diagnostic-box-error p-3 space-y-1">
                    <div class="text-[11px] font-bold font-mono text-rose-400 flex items-center gap-1.5">
                      <span>❌</span>
                      <span>1. YOUR ERROR / WHAT WENT WRONG</span>
                    </div>
                    <p class="text-xs text-rose-100/90 leading-relaxed font-sans">${qError}</p>
                  </div>

                  <!-- 2. Correct Answer & Detailed Explanation -->
                  <div class="diagnostic-box-solution p-3 space-y-1">
                    <div class="text-[11px] font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                      <span>✅</span>
                      <span>2. CORRECT ANSWER & EXPLANATION</span>
                    </div>
                    <p class="text-xs text-emerald-100/90 leading-relaxed font-sans">${qSol}</p>
                  </div>

                  <!-- 3. Shortcut Trick / 10-Second Method -->
                  <div class="diagnostic-box-trick p-3 space-y-1">
                    <div class="text-[11px] font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>3. SHORTCUT TRICK / EXAM TECHNIQUE</span>
                    </div>
                    <p class="text-xs text-cyan-100/90 leading-relaxed font-sans">${qTrick}</p>
                  </div>

                  <!-- 4. Actionable Fix For Next Mock -->
                  <div class="diagnostic-box-fix p-3 space-y-1">
                    <div class="text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>4. ACTIONABLE FIX FOR NEXT MOCK</span>
                    </div>
                    <p class="text-xs text-amber-100/90 leading-relaxed font-sans">${qFix}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    };

    // Construct Comparative Table HTML
    const renderQuestionTableHtml = (filteredQuestions) => {
      if (!filteredQuestions || filteredQuestions.length === 0) {
        return `
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 font-mono">
            No questions to display for this filter.
          </div>
        `;
      }

      return `
        <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase">
                <th class="py-2.5 px-3 whitespace-nowrap">Q# & Subject</th>
                <th class="py-2.5 px-3">Topic / Concept</th>
                <th class="py-2.5 px-3 text-rose-300">1. What Went Wrong</th>
                <th class="py-2.5 px-3 text-emerald-300">2. Correct Solution</th>
                <th class="py-2.5 px-3 text-cyan-300">3. Shortcut Trick</th>
                <th class="py-2.5 px-3 text-amber-300">4. Actionable Fix</th>
                <th class="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${filteredQuestions.map((q, idx) => {
                const subjBadge = getMockAnalysisSubjectBadgeClass(q.subject);
                const qNum = escapeHtml(q.questionNumber || `Q.${idx + 1}`);
                const qSubj = escapeHtml(q.subject || 'General');
                const qTopic = escapeHtml(q.topic || 'Core Concept');
                const qError = escapeHtml(q.userError || 'Conceptual error or calculation slip.');
                const qSol = escapeHtml(q.correctAnswerAndExplanation || 'Review core step-by-step logic.');
                const qTrick = escapeHtml(q.shortcutTrick || 'Option elimination / formula trick.');
                const qFix = escapeHtml(q.actionableFix || 'Solve 10 similar PYQs.');

                return `
                  <tr class="hover:bg-slate-900/40 transition">
                    <td class="py-3 px-3 align-top whitespace-nowrap font-mono">
                      <div class="font-bold text-white">${qNum}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${subjBadge}">${qSubj}</span>
                    </td>
                    <td class="py-3 px-3 align-top font-semibold text-slate-200 min-w-[140px]">${qTopic}</td>
                    <td class="py-3 px-3 align-top text-rose-200/90 bg-rose-950/10 min-w-[180px]">${qError}</td>
                    <td class="py-3 px-3 align-top text-emerald-200/90 bg-emerald-950/10 min-w-[190px]">${qSol}</td>
                    <td class="py-3 px-3 align-top text-cyan-200/90 bg-cyan-950/10 min-w-[180px]">${qTrick}</td>
                    <td class="py-3 px-3 align-top text-amber-200/90 bg-amber-950/10 min-w-[180px]">${qFix}</td>
                    <td class="py-3 px-3 align-top text-center">
                      <button type="button" class="btn-track-mock-weak p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-xs font-mono transition" title="Add topic to Radar" data-topic="${qTopic}" data-subject="${qSubj}" data-fix="${qFix}">
                        + Radar
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    // Calculate subject counts for filter tabs
    const quantCount = questions.filter(q => (q.subject || '').toLowerCase().includes('quant') || (q.subject || '').toLowerCase().includes('math')).length;
    const reasoningCount = questions.filter(q => (q.subject || '').toLowerCase().includes('reason') || (q.subject || '').toLowerCase().includes('intel')).length;
    const englishCount = questions.filter(q => (q.subject || '').toLowerCase().includes('eng')).length;
    const gaCount = questions.filter(q => (q.subject || '').toLowerCase().includes('ga') || (q.subject || '').toLowerCase().includes('gk') || (q.subject || '').toLowerCase().includes('aware')).length;

    outputBox.innerHTML = `
      <div class="space-y-5">
        <!-- Top Status Banner -->
        <div class="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-base">${isOfflineFallback ? '⚡' : '✨'}</span>
            <div>
              <span class="text-xs font-bold text-emerald-300 font-mono">
                ${isOfflineFallback ? 'Instant Rule-Based Scorecard Diagnostic' : 'Gemini AI Deep Forensic Mock Report'}
              </span>
              <p class="text-[11px] text-slate-400">SSC CGL 2027 • Negative Penalty: -0.5 Tier 1</p>
            </div>
          </div>
          ${isOfflineFallback ? `
            <button type="button" id="btn-re-ai-parse-top" class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition flex items-center gap-1.5">
              <span>🤖</span>
              <span>Run Full AI Diagnostic</span>
            </button>
          ` : `
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              ✓ AI Model Verified
            </span>
          `}
        </div>

        <!-- 1. Executive Performance Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AGGREGATE SCORE</div>
            <div class="text-lg font-extrabold ${score >= 130 ? 'text-emerald-400' : (score >= 100 ? 'text-amber-400' : 'text-rose-400')} mt-0.5">
              ${score} <span class="text-xs text-slate-500 font-normal">/ ${totalMarks}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${Math.round((score / totalMarks) * 100)}% of Max Marks</div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACCURACY</div>
            <div class="text-lg font-extrabold ${accuracy >= 85 ? 'text-emerald-400' : (accuracy >= 70 ? 'text-white' : 'text-rose-400')} mt-0.5">
              ${accuracy}%
            </div>
            <div class="text-[10px] ${accuracy >= 85 ? 'text-emerald-400' : 'text-amber-400'} mt-0.5">
              ${accuracy >= 85 ? 'High Precision' : 'Accuracy Risk'}
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CORRECT</div>
            <div class="text-lg font-extrabold text-emerald-400 mt-0.5">${correct}</div>
            <div class="text-[10px] text-emerald-400/80 mt-0.5">+${correct * 2} Marks Gained</div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WRONG</div>
            <div class="text-lg font-extrabold text-rose-400 mt-0.5">${wrong}</div>
            <div class="text-[10px] text-rose-400/80 mt-0.5">-${negativeLost} Negative Penalty</div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ATTEMPTED</div>
            <div class="text-lg font-extrabold text-sky-400 mt-0.5">${attempted}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${unattempted} Skipped</div>
          </div>
        </div>

        <!-- 2. Sectional Breakdown Cards (if available) -->
        ${sections.length > 0 ? `
          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold font-mono text-slate-300 uppercase">📊 Sectional Score & Accuracy Matrix</span>
              <span class="text-[11px] font-mono text-slate-500">Tier 1 Benchmarks</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              ${sections.map(sec => {
                const badge = getMockAnalysisSubjectBadgeClass(sec.name);
                const sScore = typeof sec.score === 'number' ? sec.score : 0;
                const sMax = sec.totalMarks || 50;
                const sAcc = typeof sec.accuracy === 'number' ? sec.accuracy : 0;
                return `
                  <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold px-2 py-0.5 rounded font-mono ${badge}">${escapeHtml(sec.name)}</span>
                      <span class="font-mono text-xs font-bold text-white">${sScore} / ${sMax}</span>
                    </div>
                    <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div class="h-full ${sAcc >= 80 ? 'bg-emerald-500' : (sAcc >= 65 ? 'bg-amber-500' : 'bg-rose-500')}" style="width: ${Math.min(100, Math.max(5, sAcc))}%"></div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Acc: <strong class="text-slate-200">${sAcc}%</strong></span>
                      <span>✓ ${sec.correct || 0} | ✗ ${sec.wrong || 0}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. Question-by-Question Deep Diagnostic Section -->
        <div class="space-y-3.5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base">📋</span>
                <h4 class="text-sm font-bold text-white font-mono uppercase tracking-wide">Question-by-Question Forensic Analysis</h4>
                <span class="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold">
                  ${questions.length} Diagnostic Cards
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Post-mortem of errors, correct explanations, shortcut tricks, and next-mock action fixes.</p>
            </div>

            <!-- View Switcher (Card vs Table) -->
            <div class="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono self-start sm:self-auto">
              <button type="button" id="diag-view-cards" class="px-3 py-1 rounded-lg transition font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                📇 Card View
              </button>
              <button type="button" id="diag-view-table" class="px-3 py-1 rounded-lg transition font-bold text-slate-400 hover:text-white">
                📊 Table View
              </button>
            </div>
          </div>

          <!-- Subject Filter Pills -->
          <div class="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button type="button" class="diag-filter-tab active px-3 py-1 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition" data-filter="all">
              All Questions (${questions.length})
            </button>
            <button type="button" class="diag-filter-tab px-3 py-1 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition" data-filter="quant">
              Maths / Quant (${quantCount})
            </button>
            <button type="button" class="diag-filter-tab px-3 py-1 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition" data-filter="reasoning">
              Reasoning (${reasoningCount})
            </button>
            <button type="button" class="diag-filter-tab px-3 py-1 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition" data-filter="english">
              English (${englishCount})
            </button>
            <button type="button" class="diag-filter-tab px-3 py-1 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition" data-filter="ga">
              General Awareness (${gaCount})
            </button>
          </div>

          <!-- Dynamic Questions Output Container (Cards or Table) -->
          <div id="diag-questions-container">
            ${renderQuestionCardsHtml(questions)}
          </div>
        </div>

        <!-- 4. Strategic Highlights & Continuous Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <!-- Strong Points -->
          ${Array.isArray(data.strongPoints) && data.strongPoints.length > 0 ? `
            <div class="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <span class="text-xs font-bold text-emerald-300 uppercase font-mono flex items-center gap-1.5">
                <span>🌟</span> Strong & High-Speed Areas
              </span>
              <ul class="space-y-1 text-xs text-slate-300">
                ${data.strongPoints.map(sp => `<li class="flex items-start gap-1.5"><span class="text-emerald-400 font-bold">✓</span><span>${escapeHtml(sp)}</span></li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Weak Points -->
          ${Array.isArray(data.weakPoints) && data.weakPoints.length > 0 ? `
            <div class="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <span class="text-xs font-bold text-rose-300 uppercase font-mono flex items-center gap-1.5">
                <span>⚠️</span> High-Risk Concepts (Negative Traps)
              </span>
              <ul class="space-y-1 text-xs text-slate-300">
                ${data.weakPoints.map(wp => `<li class="flex items-start gap-1.5"><span class="text-rose-400 font-bold">✗</span><span>${escapeHtml(wp)}</span></li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Continuous Recommendations & Mentor Verdict -->
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="space-y-1">
            <span class="text-xs font-bold text-sky-400 uppercase font-mono flex items-center gap-1.5">
              <span>🎯</span> Mentor Verdict & Immediate Action Plan
            </span>
            <p class="text-slate-200 text-xs leading-relaxed font-sans font-medium">${escapeHtml(data.overallVerdict || 'Maintain regular mock cadence and revise all error cards before the next test.')}</p>
          </div>

          ${Array.isArray(data.continuousRecommendations) && data.continuousRecommendations.length > 0 ? `
            <div class="pt-2 border-t border-slate-800 space-y-1.5">
              <span class="text-[11px] font-bold text-slate-400 uppercase font-mono">Continuous Directives:</span>
              <ul class="space-y-1 text-xs text-slate-300">
                ${data.continuousRecommendations.map(r => `<li class="flex items-start gap-1.5"><span class="text-sky-400">⚡</span><span>${escapeHtml(r)}</span></li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Bind Question Filter Tabs and View Switcher
    let currentFilter = 'all';
    let currentViewMode = 'cards'; // 'cards' | 'table'

    const filterQuestions = () => {
      if (currentFilter === 'all') return questions;
      return questions.filter(q => {
        const s = (q.subject || '').toLowerCase();
        if (currentFilter === 'quant') return s.includes('quant') || s.includes('math');
        if (currentFilter === 'reasoning') return s.includes('reason') || s.includes('intel');
        if (currentFilter === 'english') return s.includes('eng');
        if (currentFilter === 'ga') return s.includes('ga') || s.includes('gk') || s.includes('aware');
        return true;
      });
    };

    const updateQuestionsDisplay = () => {
      const qContainer = document.getElementById('diag-questions-container');
      if (!qContainer) return;
      const filtered = filterQuestions();
      if (currentViewMode === 'cards') {
        qContainer.innerHTML = renderQuestionCardsHtml(filtered);
      } else {
        qContainer.innerHTML = renderQuestionTableHtml(filtered);
      }
      bindTrackButtons();
    };

    // Filter tab events
    outputBox.querySelectorAll('.diag-filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        outputBox.querySelectorAll('.diag-filter-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.getAttribute('data-filter') || 'all';
        updateQuestionsDisplay();
      });
    });

    // View switcher events
    const btnCards = document.getElementById('diag-view-cards');
    const btnTable = document.getElementById('diag-view-table');

    if (btnCards && btnTable) {
      btnCards.addEventListener('click', () => {
        currentViewMode = 'cards';
        btnCards.className = 'px-3 py-1 rounded-lg transition font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40';
        btnTable.className = 'px-3 py-1 rounded-lg transition font-bold text-slate-400 hover:text-white';
        updateQuestionsDisplay();
      });

      btnTable.addEventListener('click', () => {
        currentViewMode = 'table';
        btnTable.className = 'px-3 py-1 rounded-lg transition font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40';
        btnCards.className = 'px-3 py-1 rounded-lg transition font-bold text-slate-400 hover:text-white';
        updateQuestionsDisplay();
      });
    }

    // Top retry AI button if offline
    const reAiTopBtn = document.getElementById('btn-re-ai-parse-top');
    if (reAiTopBtn) {
      reAiTopBtn.addEventListener('click', runMockAnalysis);
    }

    // Bind "+ Track in Radar" buttons
    const bindTrackButtons = () => {
      outputBox.querySelectorAll('.btn-track-mock-weak').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const topic = e.currentTarget.getAttribute('data-topic');
          const subject = e.currentTarget.getAttribute('data-subject') || 'Mock';
          const fix = e.currentTarget.getAttribute('data-fix') || 'Revise key concepts and solve 30 PYQs.';

          if (!topic) return;

          const exists = state.weakAreas.some(w => w.topic.toLowerCase() === topic.toLowerCase());
          if (exists) {
            e.currentTarget.textContent = '✓ Already in Radar';
            e.currentTarget.classList.replace('text-rose-300', 'text-emerald-400');
            return;
          }

          state.weakAreas.unshift({
            id: 'mock_weak_' + Date.now(),
            subject: subject.slice(0, 20),
            topic: topic.slice(0, 60),
            advice: fix.slice(0, 100),
            resolved: false
          });
          state.weakAreas = state.weakAreas.slice(0, 10);
          saveState();
          renderWeakAreas();
          playChime('reward');

          e.currentTarget.textContent = '✓ Added to Radar';
          e.currentTarget.classList.replace('text-rose-300', 'text-emerald-400');
        });
      });
    };

    bindTrackButtons();
  }

  // Instant Rule-Based Local Scorecard Parser (Heuristic Fallback)
  function parseMockLocally(rawText, mockType) {
    const isSectional = mockType === 'sectional';
    const totalQuestions = isSectional ? 25 : 100;
    const totalMarks = isSectional ? 50 : 200;

    let score = null;
    let correct = null;
    let wrong = null;
    let attempted = null;
    let accuracy = null;

    const scoreMatch = rawText.match(/(?:Score|Marks Obtained|Total Score|Marks|Marks:)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (scoreMatch) score = parseFloat(scoreMatch[1]);

    const correctMatch = rawText.match(/(?:Correct|Right|Correct Questions)\s*[:=-]?\s*([0-9]+)/i);
    if (correctMatch) correct = parseInt(correctMatch[1], 10);

    const wrongMatch = rawText.match(/(?:Wrong|Incorrect|Incorrect Questions|Negative)\s*[:=-]?\s*([0-9]+)/i);
    if (wrongMatch) wrong = parseInt(wrongMatch[1], 10);

    const attemptedMatch = rawText.match(/(?:Attempted|Questions Attempted)\s*[:=-]?\s*([0-9]+)/i);
    if (attemptedMatch) attempted = parseInt(attemptedMatch[1], 10);

    const accMatch = rawText.match(/(?:Accuracy|Accuracy %)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (accMatch) accuracy = parseFloat(accMatch[1]);

    if (correct !== null && wrong !== null) {
      if (attempted === null) attempted = correct + wrong;
      if (score === null) score = Math.max(0, (correct * 2) - (wrong * 0.5));
      if (accuracy === null && attempted > 0) accuracy = Math.round((correct / attempted) * 100);
    } else if (score !== null && correct === null) {
      correct = Math.round(score / 2);
    }

    // Construct heuristic topic cards for any wrong answers or detected subjects
    const questionAnalysis = [];
    const lowerRaw = rawText.toLowerCase();

    if (lowerRaw.includes('math') || lowerRaw.includes('quant') || lowerRaw.includes('algebra') || lowerRaw.includes('trigo') || lowerRaw.includes('arithmetic')) {
      questionAnalysis.push({
        questionNumber: 'Maths Concept Drill',
        subject: 'Quantitative Aptitude',
        topic: 'Speed Maths & Arithmetic Application',
        userError: 'Calculation slip or excessive time spent on multistep equations under exam timer.',
        correctAnswerAndExplanation: 'Focus on digital sum, unit digit checks, and LCM efficiency methods to bypass heavy arithmetic.',
        shortcutTrick: 'Use Digital Root / Remainder method to eliminate 3 out of 4 options in < 15 seconds.',
        actionableFix: 'Practice 20 speed calculation drills on squaring and cube roots daily.'
      });
    }

    if (lowerRaw.includes('reason') || lowerRaw.includes('syllogism') || lowerRaw.includes('coding') || lowerRaw.includes('series')) {
      questionAnalysis.push({
        questionNumber: 'Reasoning Concept Drill',
        subject: 'General Intelligence & Reasoning',
        topic: 'Syllogism & Logical Deduction',
        userError: 'Confused "Only a Few" with "Some" leading to incorrect conclusion validation.',
        correctAnswerAndExplanation: '"Only a few A are B" implies both "Some A are B" AND "Some A are not B".',
        shortcutTrick: 'Draw Venn diagrams with dotted boundary for the "Only a few" restriction.',
        actionableFix: 'Solve 15 Pyq Syllogism questions specifically focusing on possibility cases.'
      });
    }

    if (lowerRaw.includes('eng') || lowerRaw.includes('error') || lowerRaw.includes('grammar') || lowerRaw.includes('vocab')) {
      questionAnalysis.push({
        questionNumber: 'English Concept Drill',
        subject: 'English Comprehension',
        topic: 'Error Spotting (Subject-Verb Agreement)',
        userError: 'Overlooked intervening prepositional phrase and matched verb to incorrect noun.',
        correctAnswerAndExplanation: 'Subject separated by "as well as / along with / together with" takes the verb according to the first subject.',
        shortcutTrick: 'Cross out parenthetical phrases (e.g., [as well as his friends]) to see the true singular/plural core subject.',
        actionableFix: 'Revise 12 Golden Rules of Subject-Verb Agreement in SP Bakshi / Neetu Singh Vol 1.'
      });
    }

    if (lowerRaw.includes('ga') || lowerRaw.includes('gk') || lowerRaw.includes('polity') || lowerRaw.includes('history')) {
      questionAnalysis.push({
        questionNumber: 'GA Concept Drill',
        subject: 'General Awareness',
        topic: 'Constitutional Articles & Amendments',
        userError: 'Rushed guess on Article numbers leading to -0.5 negative penalty.',
        correctAnswerAndExplanation: 'Tier 1 frequently asks Articles 12-51A (Fundamental Rights & DPSP).',
        shortcutTrick: 'Group Articles into thematic clusters: Rights (14-32), DPSP (36-51), President (52-62).',
        actionableFix: 'Review the 1-page Polity Quick Reference Chart and avoid low-probability guesses.'
      });
    }

    // Default fallback question card if text had no subject keywords
    if (questionAnalysis.length === 0 && (wrong || 0) > 0) {
      questionAnalysis.push({
        questionNumber: 'Negative Mark Diagnosis',
        subject: 'Quantitative Aptitude',
        topic: 'Speed & Accuracy Balance',
        userError: `${wrong} questions answered incorrectly resulted in -${(wrong * 0.5)} negative marks lost.`,
        correctAnswerAndExplanation: 'In SSC CGL Tier 1, skipping doubtful questions is better than random guesses due to -0.5 penalty.',
        shortcutTrick: 'Use 2-Round Test Taking Strategy: Round 1 for 100% certain items; Round 2 for calculated eliminations.',
        actionableFix: 'Implement strict 50-50 elimination rule before making any calculated guess.'
      });
    }

    return {
      totalQuestions,
      totalMarks,
      attempted: attempted !== null ? attempted : (correct || 0) + (wrong || 0),
      unattempted: Math.max(0, totalQuestions - (attempted || 0)),
      correct: correct !== null ? correct : 0,
      wrong: wrong !== null ? wrong : 0,
      score: score !== null ? score : 0,
      negativeMarksLost: (wrong || 0) * 0.5,
      accuracyPercent: accuracy !== null ? accuracy : (attempted && attempted > 0 ? Math.round(((correct || 0) / attempted) * 100) : 0),
      overallVerdict: `Parsed from document text: ${correct || 0} Correct, ${wrong || 0} Wrong • ${accuracy || 0}% Accuracy.`,
      questionAnalysis,
      strongPoints: (correct || 0) > 0 ? ['Scorecard data imported successfully', 'Consistent attempt volume'] : [],
      weakPoints: (wrong || 0) > 0 ? [`${wrong} negative marks recorded - review error cards below`] : []
    };
  }

  // ==========================================================================
  // 11. EVENT LISTENERS & DOM HOOKS
  // ==========================================================================

  function bindEvents() {
    // --- Navigation ---
    document.querySelectorAll('#sidebar-nav .nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const navTarget = e.currentTarget.getAttribute('data-nav');
        navigateTo(navTarget);
      });
    });

    const openSidebarBtn = document.getElementById('btn-open-sidebar');
    const closeSidebarBtn = document.getElementById('btn-close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Quick links from Homepage to sections
    const gotoStopwatches = document.getElementById('btn-goto-stopwatches');
    if (gotoStopwatches) {
      gotoStopwatches.addEventListener('click', () => navigateTo('subjects'));
    }

    const gotoMockAnalyzer = document.getElementById('btn-goto-mock-analyzer');
    if (gotoMockAnalyzer) {
      gotoMockAnalyzer.addEventListener('click', () => navigateTo('mock-pdf'));
    }

    const topStreakBadge = document.getElementById('top-streak-badge');
    if (topStreakBadge) {
      topStreakBadge.addEventListener('click', () => navigateTo('calendar'));
    }

    // Weekly & Monthly To-Do Hub Event Binder
    bindTodoHubEvents();

    // --- Target Exam Countdown Ticker Controls ---
    const btnEditDate = document.getElementById('btn-edit-exam-date');
    const btnEditCountdown = document.getElementById('btn-edit-exam-countdown');
    const openCountdownModal = () => {
      const titleInput = document.getElementById('edit-countdown-title');
      const dateInput = document.getElementById('edit-countdown-date');
      if (titleInput) titleInput.value = state.targetExamTitle || DEFAULT_TARGET_EXAM.title;
      if (dateInput) dateInput.value = state.targetExamDate || DEFAULT_TARGET_EXAM.date;
      openModal('modal-edit-countdown');
    };
    if (btnEditDate) btnEditDate.addEventListener('click', openCountdownModal);
    if (btnEditCountdown) btnEditCountdown.addEventListener('click', openCountdownModal);

    // Direct Interactive Calendar Date Picker Listener
    const inlineDatePicker = document.getElementById('inline-exam-date-picker');
    if (inlineDatePicker) {
      const applyInlineDate = (val) => {
        if (!val) return;
        const cleanVal = val.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanVal)) {
          state.targetExamDate = cleanVal;
          saveState();
          updateCountdownTicker();
        }
      };

      inlineDatePicker.addEventListener('change', (e) => {
        applyInlineDate(e.target.value);
        playChime('start');
      });
      inlineDatePicker.addEventListener('input', (e) => {
        applyInlineDate(e.target.value);
      });
    }

    // Modal Preset Buttons
    const btnPresetDec26 = document.getElementById('btn-preset-dec26');
    if (btnPresetDec26) {
      btnPresetDec26.addEventListener('click', () => {
        const dateInput = document.getElementById('edit-countdown-date');
        if (dateInput) {
          dateInput.value = '2026-12-26';
          dateInput.focus();
        }
      });
    }

    const btnPresetSep27 = document.getElementById('btn-preset-sep27');
    if (btnPresetSep27) {
      btnPresetSep27.addEventListener('click', () => {
        const dateInput = document.getElementById('edit-countdown-date');
        if (dateInput) {
          dateInput.value = '2027-09-15';
          dateInput.focus();
        }
      });
    }

    const formEditCountdown = document.getElementById('form-edit-countdown');
    if (formEditCountdown) {
      formEditCountdown.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('edit-countdown-title');
        const dateInput = document.getElementById('edit-countdown-date');
        if (titleInput && titleInput.value.trim()) {
          state.targetExamTitle = titleInput.value.trim();
        }
        if (dateInput && dateInput.value && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.value.trim())) {
          state.targetExamDate = dateInput.value.trim();
        }
        saveState();
        closeModal('modal-edit-countdown');
        updateCountdownTicker();
        playChime('start');
      });
    }

    // --- Syllabus Checklist Listeners ---
    const btnAddSyllabus = document.getElementById('btn-add-syllabus-topic');
    if (btnAddSyllabus) {
      btnAddSyllabus.addEventListener('click', () => openModal('modal-add-syllabus-topic'));
    }

    const formAddSyllabus = document.getElementById('form-add-syllabus-topic');
    if (formAddSyllabus) {
      formAddSyllabus.addEventListener('submit', (e) => {
        e.preventDefault();
        const sub = document.getElementById('syl-subject').value;
        const title = document.getElementById('syl-topic-title').value.trim();
        const weightage = document.getElementById('syl-weightage').value;
        if (title) {
          state.syllabus.push({
            id: 'syl_' + Date.now(),
            subject: sub,
            title,
            weightage,
            status: 'Not Started'
          });
          saveState();
          closeModal('modal-add-syllabus-topic');
          formAddSyllabus.reset();
          renderSyllabus();
        }
      });
    }

    document.querySelectorAll('#syllabus-subject-tabs button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeSyllabusSubject = e.currentTarget.getAttribute('data-syl-subject');
        renderSyllabus();
      });
    });

    document.querySelectorAll('#syllabus-status-filter-chips button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeSyllabusStatus = e.currentTarget.getAttribute('data-status-filter');
        renderSyllabus();
      });
    });

    const btnResetSyllabus = document.getElementById('btn-reset-syllabus');
    if (btnResetSyllabus) {
      btnResetSyllabus.addEventListener('click', () => {
        if (confirm('Reset syllabus checklist back to full default SSC CGL & Railway syllabus?')) {
          state.syllabus = JSON.parse(JSON.stringify(DEFAULT_SYLLABUS));
          saveState();
          renderSyllabus();
        }
      });
    }

    // --- Daily Targets & Revision Hub Listeners ---
    function shiftTargetDate(offsetDays) {
      if (!state.selectedTargetDate) state.selectedTargetDate = getStudyCycleDate();
      const d = new Date(state.selectedTargetDate + 'T12:00:00');
      d.setDate(d.getDate() + offsetDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      state.selectedTargetDate = `${y}-${m}-${day}`;
      saveState();
      renderTargetHub();
    }

    const btnPrevDay = document.getElementById('btn-target-prev-day');
    if (btnPrevDay) {
      btnPrevDay.addEventListener('click', () => shiftTargetDate(-1));
    }

    const btnNextDay = document.getElementById('btn-target-next-day');
    if (btnNextDay) {
      btnNextDay.addEventListener('click', () => shiftTargetDate(1));
    }

    const targetDatePicker = document.getElementById('target-hub-date-picker');
    if (targetDatePicker) {
      targetDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          state.selectedTargetDate = e.target.value;
          saveState();
          renderTargetHub();
        }
      });
    }

    const btnTargetYesterday = document.getElementById('btn-target-yesterday');
    if (btnTargetYesterday) {
      btnTargetYesterday.addEventListener('click', () => {
        state.selectedTargetDate = getPastCycleDate(1);
        saveState();
        renderTargetHub();
      });
    }

    const btnTargetToday = document.getElementById('btn-target-today');
    if (btnTargetToday) {
      btnTargetToday.addEventListener('click', () => {
        state.selectedTargetDate = getStudyCycleDate();
        saveState();
        renderTargetHub();
      });
    }

    const btnTargetTomorrow = document.getElementById('btn-target-tomorrow');
    if (btnTargetTomorrow) {
      btnTargetTomorrow.addEventListener('click', () => {
        state.selectedTargetDate = getFutureCycleDate(1);
        saveState();
        renderTargetHub();
      });
    }

    const btnTargetSundayMock = document.getElementById('btn-target-sunday-mock');
    if (btnTargetSundayMock) {
      btnTargetSundayMock.addEventListener('click', () => {
        state.selectedTargetDate = getNextSundayDate();
        saveState();
        renderTargetHub();
      });
    }

    // 320-Maths Controls for Selected Date
    const btnToggleMaths = document.getElementById('btn-toggle-maths-conquered');
    if (btnToggleMaths) {
      btnToggleMaths.addEventListener('click', () => {
        const curDate = state.selectedTargetDate || getStudyCycleDate();
        const entry = getDateTargetEntry(curDate);
        const targetVal = entry.mathsTarget || 320;
        if (entry.mathsDone >= targetVal) {
          entry.mathsDone = 0;
          entry.mathsCompleted = false;
        } else {
          entry.mathsDone = targetVal;
          entry.mathsCompleted = true;
          playChime('start');
        }

        if (curDate === state.activeCycleDate) {
          state.mathsQuestionsDone = entry.mathsDone;
        }

        saveState();
        renderDateMathsMission();
        renderTargetTimelineStrip();
        if (curDate === state.activeCycleDate) renderHomeView();
      });
    }

    const btnApplyMaths = document.getElementById('btn-apply-hub-maths');
    const inputMathsDone = document.getElementById('input-hub-maths-done');
    function applyCustomMathsDone() {
      if (!inputMathsDone) return;
      const val = Math.max(0, parseInt(inputMathsDone.value, 10) || 0);
      const curDate = state.selectedTargetDate || getStudyCycleDate();
      const entry = getDateTargetEntry(curDate);
      entry.mathsDone = val;
      entry.mathsCompleted = val >= (entry.mathsTarget || 320);

      if (curDate === state.activeCycleDate) {
        state.mathsQuestionsDone = val;
      }

      if (entry.mathsCompleted) playChime('start');
      saveState();
      renderDateMathsMission();
      renderTargetTimelineStrip();
      if (curDate === state.activeCycleDate) renderHomeView();
    }

    if (btnApplyMaths) btnApplyMaths.addEventListener('click', applyCustomMathsDone);
    if (inputMathsDone) {
      inputMathsDone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCustomMathsDone();
        }
      });
    }

    document.querySelectorAll('.btn-maths-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const step = parseInt(e.currentTarget.getAttribute('data-maths-step'), 10) || 0;
        const curDate = state.selectedTargetDate || getStudyCycleDate();
        const entry = getDateTargetEntry(curDate);
        entry.mathsDone = Math.max(0, (entry.mathsDone || 0) + step);
        entry.mathsCompleted = entry.mathsDone >= (entry.mathsTarget || 320);

        if (curDate === state.activeCycleDate) {
          state.mathsQuestionsDone = entry.mathsDone;
        }

        if (entry.mathsCompleted) playChime('start');
        saveState();
        renderDateMathsMission();
        renderTargetTimelineStrip();
        if (curDate === state.activeCycleDate) renderHomeView();
      });
    });

    // Inline Task Form for Selected Date
    const formInlineTask = document.getElementById('form-inline-add-date-task');
    if (formInlineTask) {
      formInlineTask.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('input-inline-task-title');
        const subjectSelect = document.getElementById('select-inline-task-subject');
        const quotaInput = document.getElementById('input-inline-task-quota');
        const prioritySelect = document.getElementById('select-inline-task-priority');

        const title = titleInput ? titleInput.value.trim() : '';
        const subject = subjectSelect ? subjectSelect.value : 'General';
        const quota = quotaInput ? quotaInput.value.trim() : '';
        const priority = prioritySelect ? prioritySelect.value : 'normal';

        if (title) {
          const curDate = state.selectedTargetDate || getStudyCycleDate();
          const entry = getDateTargetEntry(curDate);
          if (!entry.tasks) entry.tasks = [];

          entry.tasks.push({
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title,
            subject,
            targetQty: quota,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString()
          });

          playChime('start');
          saveState();
          formInlineTask.reset();
          renderDateTasks();
          renderTargetTimelineStrip();
        }
      });
    }

    // Modal: Add Daily Target Button & Form
    const btnAddDailyTarget = document.getElementById('btn-add-daily-target');
    if (btnAddDailyTarget) {
      btnAddDailyTarget.addEventListener('click', () => {
        const modalDateInput = document.getElementById('modal-target-date');
        if (modalDateInput) modalDateInput.value = state.selectedTargetDate || getStudyCycleDate();
        openModal('modal-add-daily-target');
      });
    }

    const formModalAddTarget = document.getElementById('form-modal-add-target');
    if (formModalAddTarget) {
      formModalAddTarget.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateInput = document.getElementById('modal-target-date');
        const titleInput = document.getElementById('modal-target-title');
        const subjectSelect = document.getElementById('modal-target-subject');
        const quotaInput = document.getElementById('modal-target-quota');
        const prioritySelect = document.getElementById('modal-target-priority');

        const targetDate = dateInput ? dateInput.value : (state.selectedTargetDate || getStudyCycleDate());
        const title = titleInput ? titleInput.value.trim() : '';
        const subject = subjectSelect ? subjectSelect.value : 'General';
        const quota = quotaInput ? quotaInput.value.trim() : '';
        const priority = prioritySelect ? prioritySelect.value : 'normal';

        if (title && targetDate) {
          const entry = getDateTargetEntry(targetDate);
          if (!entry.tasks) entry.tasks = [];

          entry.tasks.push({
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title,
            subject,
            targetQty: quota,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString()
          });

          // If target is scheduled for currently viewed date, switch to that date or stay
          state.selectedTargetDate = targetDate;

          playChime('start');
          saveState();
          closeModal('modal-add-daily-target');
          formModalAddTarget.reset();
          renderTargetHub();
        }
      });
    }

    // --- Subject-Wise Revision System Listeners ---
    const btnAddRevision = document.getElementById('btn-add-revision-topic');
    if (btnAddRevision) {
      btnAddRevision.addEventListener('click', () => {
        const dateInput = document.getElementById('rev-topic-date') || document.getElementById('rev-completion-date');
        if (dateInput) dateInput.value = state.selectedTargetDate || getStudyCycleDate();
        openModal('modal-add-revision-topic');
      });
    }

    const formAddRevision = document.getElementById('form-add-revision-topic');
    if (formAddRevision) {
      formAddRevision.addEventListener('submit', (e) => {
        e.preventDefault();
        const subEl = document.getElementById('rev-topic-subject') || document.getElementById('rev-subject');
        const titleEl = document.getElementById('rev-topic-title');
        const dateEl = document.getElementById('rev-topic-date') || document.getElementById('rev-completion-date');
        
        const sub = subEl ? subEl.value : 'Maths';
        const title = titleEl ? titleEl.value.trim() : '';
        const date = (dateEl && dateEl.value) ? dateEl.value : getStudyCycleDate();
        if (title) {
          state.revisionTopics.unshift({
            id: 'rev_' + Date.now(),
            subject: sub,
            title,
            completedDate: date,
            r1Done: false,
            r2Done: false,
            r3Done: false,
            r4Done: false
          });
          playChime('start');
          saveState();
          closeModal('modal-add-revision-topic');
          formAddRevision.reset();
          renderRevisionSystem();
        }
      });
    }

    document.querySelectorAll('#revision-subject-filter-tabs button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeRevisionFilter = e.currentTarget.getAttribute('data-rev-filter');
        renderRevisionSystem();
      });
    });

    const btnResetRevision = document.getElementById('btn-reset-revision');
    if (btnResetRevision) {
      btnResetRevision.addEventListener('click', () => {
        if (confirm('Reset Daily Targets & Revision Hub to standard default schedule?')) {
          state.revisionTopics = JSON.parse(JSON.stringify(DEFAULT_REVISION_TOPICS));
          state.dateTargets = getDefaultDateTargets();
          state.selectedTargetDate = getStudyCycleDate();
          saveState();
          renderTargetHub();
        }
      });
    }

    // --- Energy & Focus Rating Engine Listeners ---
    document.querySelectorAll('#energy-rating-buttons button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedEnergyRating = parseInt(e.currentTarget.getAttribute('data-energy'), 10);
        renderEnergyRating();
      });
    });

    const btnSaveEnergy = document.getElementById('btn-save-energy-rating');
    if (btnSaveEnergy) {
      btnSaveEnergy.addEventListener('click', () => {
        const reflectionInput = document.getElementById('input-energy-reflection');
        const reflectionText = reflectionInput ? reflectionInput.value.trim() : '';
        const todayDate = getStudyCycleDate();

        state.energyRatingToday = {
          date: todayDate,
          rating: selectedEnergyRating,
          reflection: reflectionText
        };

        const existingIdx = (state.energyHistory || []).findIndex(e => e.date === todayDate);
        if (existingIdx >= 0) {
          state.energyHistory[existingIdx] = state.energyRatingToday;
        } else {
          state.energyHistory.unshift(state.energyRatingToday);
        }

        playChime('start');
        saveState();
        renderEnergyRating();
        renderEnergyHistory();
        alert(`Logged focus score: ${selectedEnergyRating}/5 for today's study cycle!`);
      });
    }

    const btnResetEnergyToday = document.getElementById('btn-reset-energy-today');
    if (btnResetEnergyToday) {
      btnResetEnergyToday.addEventListener('click', () => {
        if (confirm("Reset today's energy & focus rating?")) {
          const todayDate = getStudyCycleDate();
          state.energyRatingToday = null;
          state.energyHistory = (state.energyHistory || []).filter(e => e.date !== todayDate);
          selectedEnergyRating = 5;
          const reflectionInput = document.getElementById('input-energy-reflection');
          if (reflectionInput) reflectionInput.value = '';
          saveState();
          renderEnergyRating();
          renderEnergyHistory();
        }
      });
    }

    // --- Formula & Short-Trick Vault Listeners ---
    const btnAddVault = document.getElementById('btn-add-vault-item');
    if (btnAddVault) {
      btnAddVault.addEventListener('click', () => openModal('modal-add-vault-item'));
    }

    const formAddVault = document.getElementById('form-add-vault-item');
    if (formAddVault) {
      formAddVault.addEventListener('submit', (e) => {
        e.preventDefault();
        const sub = document.getElementById('vault-subject').value;
        const title = document.getElementById('vault-title').value.trim();
        const formula = document.getElementById('vault-formula').value.trim();
        const tip = document.getElementById('vault-tip').value.trim();

        if (title && formula) {
          state.vaultItems.unshift({
            id: 'v_' + Date.now(),
            subject: sub,
            title,
            formula,
            tip
          });
          saveState();
          closeModal('modal-add-vault-item');
          formAddVault.reset();
          renderVault();
        }
      });
    }

    document.querySelectorAll('#vault-subject-filter-tabs button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeVaultFilter = e.currentTarget.getAttribute('data-vault-filter');
        renderVault();
      });
    });

    const inputVaultSearch = document.getElementById('input-vault-search');
    if (inputVaultSearch) {
      inputVaultSearch.addEventListener('input', (e) => {
        state.vaultSearchQuery = e.target.value;
        renderVault();
      });
    }

    const btnResetVault = document.getElementById('btn-reset-vault');
    if (btnResetVault) {
      btnResetVault.addEventListener('click', () => {
        if (confirm('Restore default formula and short-trick cards in vault?')) {
          state.vaultItems = JSON.parse(JSON.stringify(DEFAULT_VAULT_ITEMS));
          saveState();
          renderVault();
        }
      });
    }

    // --- Break Day Toggle ---
    const breakDayToggle = document.getElementById('home-break-day-toggle');
    if (breakDayToggle) {
      breakDayToggle.addEventListener('click', () => {
        state.isBreakDay = !state.isBreakDay;
        saveState();
        renderHomeView();
        renderCalendar();
      });
    }

    // --- Break Controls ---
    const manualBreakBtn = document.getElementById('btn-manual-break-toggle');
    if (manualBreakBtn) {
      manualBreakBtn.addEventListener('click', () => {
        if (state.isBreakTimerRunning) {
          stopBreakTimer();
        } else {
          startBreakTimer(false);
        }
      });
    }

    const editBreakBtn = document.getElementById('btn-edit-break-time');
    if (editBreakBtn) {
      editBreakBtn.addEventListener('click', openEditBreakModal);
    }

    const resetBreakBtn = document.getElementById('btn-reset-break-today');
    if (resetBreakBtn) {
      resetBreakBtn.addEventListener('click', () => {
        if (confirm("Reset today's break counter to 00h 00m 00s?")) {
          state.todayBreakSeconds = 0;
          state.isBreakTimerRunning = false;
          state.currentBreakSessionStart = null;
          saveState();
          updateUI();
        }
      });
    }

    // Form Edit Break Time Submit
    const formEditBreak = document.getElementById('form-edit-break-time');
    if (formEditBreak) {
      formEditBreak.addEventListener('submit', (e) => {
        e.preventDefault();
        const h = parseInt(document.getElementById('edit-break-hrs').value, 10) || 0;
        const m = parseInt(document.getElementById('edit-break-mins').value, 10) || 0;
        const s = parseInt(document.getElementById('edit-break-secs').value, 10) || 0;
        state.todayBreakSeconds = (h * 3600) + (m * 60) + s;
        if (state.isBreakTimerRunning) {
          state.currentBreakSessionStart = Date.now();
        }
        saveState();
        closeModal('modal-edit-break-time');
        updateUI();
      });
    }

    // --- Dynamic Accountability Quote Rotation ---
    const rotateQuoteBtn = document.getElementById('btn-rotate-quote');
    if (rotateQuoteBtn) {
      rotateQuoteBtn.addEventListener('click', () => {
        currentQuoteIndex++;
        updateAccountabilityQuote();
      });
    }

    // --- 320 Maths Target Quick Buttons ---
    const btnMaths10 = document.getElementById('btn-maths-add-10');
    const btnMaths25 = document.getElementById('btn-maths-add-25');
    const btnMaths50 = document.getElementById('btn-maths-add-50');
    const btnMathsReset = document.getElementById('btn-maths-reset');

    if (btnMaths10) btnMaths10.addEventListener('click', () => { state.mathsQuestionsDone = (state.mathsQuestionsDone || 0) + 10; saveState(); renderSubjectCards(); updateSidebarStatus(); });
    if (btnMaths25) btnMaths25.addEventListener('click', () => { state.mathsQuestionsDone = (state.mathsQuestionsDone || 0) + 25; saveState(); renderSubjectCards(); updateSidebarStatus(); });
    if (btnMaths50) btnMaths50.addEventListener('click', () => { state.mathsQuestionsDone = (state.mathsQuestionsDone || 0) + 50; saveState(); renderSubjectCards(); updateSidebarStatus(); });
    if (btnMathsReset) btnMathsReset.addEventListener('click', () => { if (confirm('Reset maths questions today?')) { state.mathsQuestionsDone = 0; saveState(); renderSubjectCards(); updateSidebarStatus(); } });

    // --- Subject Form Edit Time Submit ---
    const formEditSubject = document.getElementById('form-edit-subject-time');
    if (formEditSubject) {
      formEditSubject.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-subject-id').value;
        const s = state.subjects.find(sub => sub.id === id);
        if (s) {
          const h = parseInt(document.getElementById('edit-subject-hrs').value, 10) || 0;
          const m = parseInt(document.getElementById('edit-subject-mins').value, 10) || 0;
          const sec = parseInt(document.getElementById('edit-subject-secs').value, 10) || 0;
          s.seconds = (h * 3600) + (m * 60) + sec;
          if (s.isRunning) {
            const now = Date.now();
            s.lastStartTime = now;
            state.activeSubjectStartTime = now;
          }
          saveState();
          closeModal('modal-edit-subject-time');
          updateUI();
        }
      });
    }

    // --- Add Custom Subject ---
    const addSubjectBtn = document.getElementById('btn-add-custom-subject');
    if (addSubjectBtn) {
      addSubjectBtn.addEventListener('click', () => {
        const name = prompt('Enter custom subject name (e.g. Current Affairs, Typing Speed Drills):');
        if (name && name.trim()) {
          state.subjects.push({
            id: 'custom_' + Date.now(),
            name: name.trim(),
            seconds: 0,
            isRunning: false,
            isDefault: false
          });
          saveState();
          updateUI();
        }
      });
    }

    const resetSubjectsAll = document.getElementById('btn-reset-subjects-all');
    if (resetSubjectsAll) {
      resetSubjectsAll.addEventListener('click', () => {
        if (confirm("Reset ALL subject stopwatches to 0?")) {
          state.subjects.forEach(s => {
            s.seconds = 0;
            s.isRunning = false;
            s.lastStartTime = null;
          });
          state.activeSubjectId = null;
          state.activeSubjectStartTime = null;
          saveState();
          updateUI();
        }
      });
    }

    // --- Habits Tracker ---
    const formAddHabit = document.getElementById('form-add-habit');
    if (formAddHabit) {
      formAddHabit.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('input-new-habit-title');
        if (titleInput && titleInput.value.trim()) {
          state.habits.push({
            id: 'h_' + Date.now(),
            title: titleInput.value.trim(),
            completed: false
          });
          titleInput.value = '';
          saveState();
          renderHabitsList();
          renderCalendar();
        }
      });
    }

    const btnResetHabitsToday = document.getElementById('btn-reset-habits-today');
    if (btnResetHabitsToday) {
      btnResetHabitsToday.addEventListener('click', () => {
        state.habits.forEach(h => h.completed = false);
        saveState();
        renderHabitsList();
        renderCalendar();
      });
    }

    const btnRestoreDefaultHabits = document.getElementById('btn-restore-default-habits');
    if (btnRestoreDefaultHabits) {
      btnRestoreDefaultHabits.addEventListener('click', () => {
        if (confirm('Restore default habits list?')) {
          state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
          saveState();
          renderHabitsList();
          renderCalendar();
        }
      });
    }

    const formEditHabit = document.getElementById('form-edit-habit');
    if (formEditHabit) {
      formEditHabit.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-habit-id').value;
        const newTitle = document.getElementById('edit-habit-title').value.trim();
        const h = state.habits.find(item => item.id === id);
        if (h && newTitle) {
          h.title = newTitle;
          saveState();
          closeModal('modal-edit-habit');
          renderHabitsList();
        }
      });
    }

    // --- Weakness Radar Controls ---
    const btnHomeAddWeakness = document.getElementById('btn-home-add-weakness');
    if (btnHomeAddWeakness) {
      btnHomeAddWeakness.addEventListener('click', () => openModal('modal-add-weakness'));
    }

    const btnResetWeakAreas = document.getElementById('btn-reset-weak-areas');
    if (btnResetWeakAreas) {
      btnResetWeakAreas.addEventListener('click', () => {
        if (confirm('Clear all items from Weak Areas Radar?')) {
          state.weakAreas = [];
          saveState();
          renderWeakAreas();
        }
      });
    }

    const formAddWeakness = document.getElementById('form-add-weakness');
    if (formAddWeakness) {
      formAddWeakness.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('weakness-subject').value;
        const topic = document.getElementById('weakness-topic').value.trim();
        const advice = document.getElementById('weakness-advice').value.trim();

        if (topic && advice) {
          state.weakAreas.unshift({
            id: 'w_' + Date.now(),
            subject,
            topic,
            advice,
            resolved: false
          });
          saveState();
          closeModal('modal-add-weakness');
          formAddWeakness.reset();
          renderWeakAreas();
        }
      });
    }

    // --- Spaced Repetition Controls ---
    const btnAddChapter = document.getElementById('btn-add-chapter');
    if (btnAddChapter) {
      btnAddChapter.addEventListener('click', () => openModal('modal-add-chapter'));
    }

    const btnResetSpacedRep = document.getElementById('btn-reset-spaced-repetition');
    if (btnResetSpacedRep) {
      btnResetSpacedRep.addEventListener('click', () => {
        if (confirm('Restore default spaced repetition topics?')) {
          state.spacedRepChapters = getDefaultChapters();
          saveState();
          renderSpacedRepetition();
        }
      });
    }

    const formAddChapter = document.getElementById('form-add-chapter');
    if (formAddChapter) {
      formAddChapter.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('chapter-subject').value;
        const title = document.getElementById('chapter-title').value.trim();
        if (title) {
          state.spacedRepChapters.unshift({
            id: 'c_' + Date.now(),
            subject,
            title,
            lastRevised: getStudyCycleDate(),
            revisionCount: 1
          });
          saveState();
          closeModal('modal-add-chapter');
          formAddChapter.reset();
          renderSpacedRepetition();
        }
      });
    }

    // Spaced repetition filters
    const filterTabs = document.getElementById('spaced-rep-filter-tabs');
    if (filterTabs) {
      filterTabs.querySelectorAll('[data-rep-filter]').forEach(tab => {
        tab.addEventListener('click', (e) => {
          activeRepFilter = e.currentTarget.getAttribute('data-rep-filter');
          filterTabs.querySelectorAll('[data-rep-filter]').forEach(t => {
            t.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 transition";
          });
          e.currentTarget.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white transition";
          renderSpacedRepetition();
        });
      });
    }

    // --- Calendar Controls ---
    const btnCalPrev = document.getElementById('btn-cal-prev-month');
    const btnCalNext = document.getElementById('btn-cal-next-month');
    if (btnCalPrev) {
      btnCalPrev.addEventListener('click', () => {
        calViewMonth--;
        if (calViewMonth < 0) {
          calViewMonth = 11;
          calViewYear--;
        }
        renderCalendar();
      });
    }
    if (btnCalNext) {
      btnCalNext.addEventListener('click', () => {
        calViewMonth++;
        if (calViewMonth > 11) {
          calViewMonth = 0;
          calViewYear++;
        }
        renderCalendar();
      });
    }

    const btnResetStreaks = document.getElementById('btn-reset-streaks');
    if (btnResetStreaks) {
      btnResetStreaks.addEventListener('click', () => {
        if (confirm('Reset current consecutive streak counter?')) {
          state.consecutiveStreak = 0;
          saveState();
          renderCalendar();
          renderMilestones();
          renderHomeView();
        }
      });
    }

    // --- Mock PDF & Scorecard Analyzer ---
    const dropzone = document.getElementById('mock-pdf-dropzone');
    const fileInput = document.getElementById('mock-pdf-file-input');
    const fileNameDisplay = document.getElementById('mock-pdf-file-name');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          fileNameDisplay.textContent = `Selected: ${e.target.files[0].name} (${(e.target.files[0].size / 1024).toFixed(1)} KB)`;
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-active');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          fileInput.files = e.dataTransfer.files;
          fileNameDisplay.textContent = `Selected: ${e.dataTransfer.files[0].name} (${(e.dataTransfer.files[0].size / 1024).toFixed(1)} KB)`;
        }
      });
    }

    const sampleMockBtn = document.getElementById('btn-fill-sample-mock');
    if (sampleMockBtn) {
      sampleMockBtn.addEventListener('click', () => {
        const rawTextArea = document.getElementById('mock-raw-text');
        if (rawTextArea) {
          rawTextArea.value = `Testbook SSC CGL Tier 1 Mock 14
Total Questions: 100
Attempted: 88, Unattempted: 12
Correct: 71, Incorrect: 17
Score: 133.5 / 200 (Cutoff: 142)
Accuracy: 80.68%
Section 1 - Reasoning: 24 attempted, 22 correct, 2 wrong. Score: 43.0
Section 2 - General Awareness: 18 attempted, 11 correct, 7 wrong. Score: 18.5 (Weak: Ancient History, Science)
Section 3 - Quantitative Aptitude: 22 attempted, 17 correct, 5 wrong. Score: 31.5 (Time spent high on Geometry, calculation errors in SI/CI)
Section 4 - English Comprehension: 24 attempted, 21 correct, 3 wrong. Score: 40.5`;
        }
      });
    }

    const btnAnalyzeMock = document.getElementById('btn-analyze-mock');
    if (btnAnalyzeMock) {
      btnAnalyzeMock.addEventListener('click', runMockAnalysis);
    }

    const btnClearMockResults = document.getElementById('btn-clear-mock-results');
    if (btnClearMockResults) {
      btnClearMockResults.addEventListener('click', () => {
        const outputBox = document.getElementById('mock-analysis-output');
        const fileInput = document.getElementById('mock-pdf-file-input');
        const fileNameDisplay = document.getElementById('mock-pdf-file-name');
        const rawTextArea = document.getElementById('mock-raw-text');
        if (fileInput) fileInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        if (rawTextArea) rawTextArea.value = '';
        if (outputBox) {
          outputBox.innerHTML = '<p class="text-slate-500 text-center py-6 text-xs">Mock history cleared.</p>';
        }
      });
    }

    // --- Settings & History ---
    const btnSaveTargetHours = document.getElementById('btn-save-target-hours');
    if (btnSaveTargetHours) {
      btnSaveTargetHours.addEventListener('click', () => {
        const val = parseFloat(document.getElementById('input-setting-target-hours').value);
        if (val && val >= 1 && val <= 24) {
          state.targetHours = val;
          saveState();
          renderHomeView();
          updateSidebarStatus();
          alert(`Daily target hours updated to ${val.toFixed(1)} hrs!`);
        }
      });
    }

    // Section Reset Buttons
    const btnSecResetSubjects = document.getElementById('btn-sec-reset-subjects');
    if (btnSecResetSubjects) {
      btnSecResetSubjects.addEventListener('click', () => {
        if (confirm("Reset today's subject timers?")) {
          state.subjects.forEach(s => {
            s.seconds = 0;
            s.isRunning = false;
            s.lastStartTime = null;
          });
          state.activeSubjectId = null;
          state.activeSubjectStartTime = null;
          saveState();
          updateUI();
        }
      });
    }

    const btnSecResetBreaks = document.getElementById('btn-sec-reset-breaks');
    if (btnSecResetBreaks) {
      btnSecResetBreaks.addEventListener('click', () => {
        if (confirm("Reset break tracker?")) {
          state.todayBreakSeconds = 0;
          state.isBreakTimerRunning = false;
          state.currentBreakSessionStart = null;
          saveState();
          updateUI();
        }
      });
    }

    const btnSecResetHabits = document.getElementById('btn-sec-reset-habits');
    if (btnSecResetHabits) {
      btnSecResetHabits.addEventListener('click', () => {
        if (confirm("Reset all habits today?")) {
          state.habits.forEach(h => h.completed = false);
          saveState();
          renderHabitsList();
          renderCalendar();
        }
      });
    }

    const btnSecResetRadar = document.getElementById('btn-sec-reset-radar');
    if (btnSecResetRadar) {
      btnSecResetRadar.addEventListener('click', () => {
        if (confirm("Reset weakness radar items?")) {
          state.weakAreas = JSON.parse(JSON.stringify(DEFAULT_WEAK_AREAS));
          saveState();
          renderWeakAreas();
        }
      });
    }

    // --- Daily Aspirant Journal Event Listeners ---
    const journalDatePicker = document.getElementById('journal-date-picker');
    if (journalDatePicker) {
      journalDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          state.selectedJournalDate = e.target.value;
          const notesEl = document.getElementById('journal-notes-input');
          if (notesEl) notesEl.removeAttribute('data-active-date');
          renderJournal();
        }
      });
    }

    const btnJournalPrevDay = document.getElementById('btn-journal-prev-day');
    if (btnJournalPrevDay) {
      btnJournalPrevDay.addEventListener('click', () => {
        const cur = state.selectedJournalDate || getStudyCycleDate();
        const d = new Date(cur + 'T12:00:00');
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        state.selectedJournalDate = `${y}-${m}-${day}`;
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl) notesEl.removeAttribute('data-active-date');
        renderJournal();
      });
    }

    const btnJournalNextDay = document.getElementById('btn-journal-next-day');
    if (btnJournalNextDay) {
      btnJournalNextDay.addEventListener('click', () => {
        const cur = state.selectedJournalDate || getStudyCycleDate();
        const d = new Date(cur + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        state.selectedJournalDate = `${y}-${m}-${day}`;
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl) notesEl.removeAttribute('data-active-date');
        renderJournal();
      });
    }

    const btnJournalToday = document.getElementById('btn-journal-today');
    if (btnJournalToday) {
      btnJournalToday.addEventListener('click', () => {
        state.selectedJournalDate = getStudyCycleDate();
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl) notesEl.removeAttribute('data-active-date');
        renderJournal();
      });
    }

    const btnJournalOpenCal = document.getElementById('btn-journal-open-cal');
    if (btnJournalOpenCal) {
      btnJournalOpenCal.addEventListener('click', () => {
        state.selectedCalendarDate = state.selectedJournalDate || getStudyCycleDate();
        navigateTo('calendar');
      });
    }

    // Live Word Counter & Textarea Input
    const journalNotesInput = document.getElementById('journal-notes-input');
    if (journalNotesInput) {
      journalNotesInput.addEventListener('input', (e) => {
        const val = e.target.value || '';
        const words = val.trim().split(/\s+/).filter(Boolean).length;
        const counter = document.getElementById('journal-word-counter');
        if (counter) {
          counter.textContent = `${words} word${words === 1 ? '' : 's'}`;
        }
      });
    }

    // Quick Tag Buttons
    document.querySelectorAll('.journal-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.currentTarget.getAttribute('data-tag');
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl && tag) {
          const currentVal = notesEl.value;
          if (currentVal.length > 0 && !currentVal.endsWith('\n')) {
            notesEl.value = currentVal + '\n' + tag;
          } else {
            notesEl.value = currentVal + tag;
          }
          notesEl.focus();
          const words = notesEl.value.trim().split(/\s+/).filter(Boolean).length;
          const counter = document.getElementById('journal-word-counter');
          if (counter) counter.textContent = `${words} word${words === 1 ? '' : 's'}`;
        }
      });
    });

    // Dual Overall Execution Buttons
    const btnExecGood = document.getElementById('btn-journal-exec-good');
    const btnExecPoor = document.getElementById('btn-journal-exec-poor');

    if (btnExecGood) {
      btnExecGood.addEventListener('click', () => {
        const curDate = state.selectedJournalDate || getStudyCycleDate();
        let entry = state.journalEntries.find(j => j.date === curDate);
        if (!entry) {
          const notesEl = document.getElementById('journal-notes-input');
          entry = {
            date: curDate,
            notes: notesEl ? notesEl.value : '',
            overallExecution: 'good',
            evaluations: {},
            updatedAt: new Date().toISOString()
          };
          state.journalEntries.unshift(entry);
        } else {
          entry.overallExecution = (entry.overallExecution === 'good') ? null : 'good';
          entry.updatedAt = new Date().toISOString();
        }
        playChime('start');
        saveState();
        renderJournal();
        renderCalendar();
        renderDayInspectionCard();
      });
    }

    if (btnExecPoor) {
      btnExecPoor.addEventListener('click', () => {
        const curDate = state.selectedJournalDate || getStudyCycleDate();
        let entry = state.journalEntries.find(j => j.date === curDate);
        if (!entry) {
          const notesEl = document.getElementById('journal-notes-input');
          entry = {
            date: curDate,
            notes: notesEl ? notesEl.value : '',
            overallExecution: 'poor',
            evaluations: {},
            updatedAt: new Date().toISOString()
          };
          state.journalEntries.unshift(entry);
        } else {
          entry.overallExecution = (entry.overallExecution === 'poor') ? null : 'poor';
          entry.updatedAt = new Date().toISOString();
        }
        playChime('start');
        saveState();
        renderJournal();
        renderCalendar();
        renderDayInspectionCard();
      });
    }

    // Save Journal Entry
    const btnSaveJournal = document.getElementById('btn-save-journal-entry');
    if (btnSaveJournal) {
      btnSaveJournal.addEventListener('click', () => {
        const curDate = state.selectedJournalDate || getStudyCycleDate();
        const notesEl = document.getElementById('journal-notes-input');
        const notesText = notesEl ? notesEl.value.trim() : '';

        let entry = state.journalEntries.find(j => j.date === curDate);
        if (!entry) {
          entry = {
            date: curDate,
            notes: notesText,
            overallExecution: null,
            evaluations: {},
            updatedAt: new Date().toISOString()
          };
          state.journalEntries.unshift(entry);
        } else {
          entry.notes = notesText;
          entry.updatedAt = new Date().toISOString();
        }

        saveState();
        playChime('reward');

        // Show save confirmation
        const statusMsg = document.getElementById('journal-save-status-msg');
        if (statusMsg) {
          statusMsg.textContent = `✓ Journal saved for ${curDate}!`;
          statusMsg.classList.remove('opacity-0');
          setTimeout(() => {
            statusMsg.classList.add('opacity-0');
          }, 2500);
        }

        renderJournal();
        renderCalendar();
        renderDayInspectionCard();
      });
    }

    // Clear Journal Notes
    const btnClearJournal = document.getElementById('btn-clear-journal-notes');
    if (btnClearJournal) {
      btnClearJournal.addEventListener('click', () => {
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl && notesEl.value) {
          if (confirm('Clear current journal notes in the editor?')) {
            notesEl.value = '';
            const counter = document.getElementById('journal-word-counter');
            if (counter) counter.textContent = '0 words';
          }
        }
      });
    }

    // Open Reset Journal Modal
    const btnResetJournal = document.getElementById('btn-reset-journal');
    if (btnResetJournal) {
      btnResetJournal.addEventListener('click', () => {
        openModal('modal-reset-journal');
      });
    }

    const btnSecResetJournal = document.getElementById('btn-sec-reset-journal');
    if (btnSecResetJournal) {
      btnSecResetJournal.addEventListener('click', () => {
        openModal('modal-reset-journal');
      });
    }

    // Modal Action: Reset Selected Date Journal
    const btnResetJournalDate = document.getElementById('btn-action-reset-journal-selected-date');
    if (btnResetJournalDate) {
      btnResetJournalDate.addEventListener('click', () => {
        const curDate = state.selectedJournalDate || getStudyCycleDate();
        state.journalEntries = state.journalEntries.filter(j => j.date !== curDate);
        const notesEl = document.getElementById('journal-notes-input');
        if (notesEl) {
          notesEl.value = '';
          notesEl.removeAttribute('data-active-date');
        }
        saveState();
        closeModal('modal-reset-journal');
        renderJournal();
        renderCalendar();
        renderDayInspectionCard();
        alert(`Journal entry for ${curDate} has been reset.`);
      });
    }

    // Modal Action: Reset Entire Journal History
    const btnResetJournalAll = document.getElementById('btn-action-reset-journal-all');
    if (btnResetJournalAll) {
      btnResetJournalAll.addEventListener('click', () => {
        if (confirm("⚠️ Confirm complete journal wipe: Erase all past journal notes and subjective evaluations?")) {
          state.journalEntries = [];
          const notesEl = document.getElementById('journal-notes-input');
          if (notesEl) {
            notesEl.value = '';
            notesEl.removeAttribute('data-active-date');
          }
          saveState();
          closeModal('modal-reset-journal');
          renderJournal();
          renderCalendar();
          renderDayInspectionCard();
          alert("All journal entries have been cleared.");
        }
      });
    }

    // ========================================================================
    // MOCK SCORE TREND GRAPH & ANALYTICS EVENT BINDINGS
    // ========================================================================

    // Homepage Quick Jump to Mock Trends
    const btnGotoMockTrendsHome = document.getElementById('btn-goto-mock-trends-home');
    if (btnGotoMockTrendsHome) {
      btnGotoMockTrendsHome.addEventListener('click', () => {
        navigateTo('mock-trends');
      });
    }

    // Top Action Buttons in Mock Trends Header
    const btnOpenLogFull = document.getElementById('btn-open-log-full-mock');
    if (btnOpenLogFull) {
      btnOpenLogFull.addEventListener('click', () => {
        const tabFull = document.getElementById('btn-tab-quick-full');
        if (tabFull) tabFull.click();
        const form = document.getElementById('form-quick-log-full');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const titleInput = document.getElementById('full-mock-input-title');
          if (titleInput) titleInput.focus();
        }
      });
    }

    const btnOpenLogSectional = document.getElementById('btn-open-log-sectional-mock');
    if (btnOpenLogSectional) {
      btnOpenLogSectional.addEventListener('click', () => {
        const tabSec = document.getElementById('btn-tab-quick-sectional');
        if (tabSec) tabSec.click();
        const form = document.getElementById('form-quick-log-sectional');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const titleInput = document.getElementById('sec-mock-input-title');
          if (titleInput) titleInput.focus();
        }
      });
    }

    // Quick Log Tab Switcher (Full Mock vs Sectional Mock)
    const btnTabQuickFull = document.getElementById('btn-tab-quick-full');
    const btnTabQuickSec = document.getElementById('btn-tab-quick-sectional');
    const formQuickFull = document.getElementById('form-quick-log-full');
    const formQuickSec = document.getElementById('form-quick-log-sectional');

    if (btnTabQuickFull && btnTabQuickSec) {
      btnTabQuickFull.addEventListener('click', () => {
        btnTabQuickFull.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition active:scale-95';
        btnTabQuickSec.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 transition active:scale-95';
        if (formQuickFull) formQuickFull.classList.remove('hidden');
        if (formQuickSec) formQuickSec.classList.add('hidden');
      });

      btnTabQuickSec.addEventListener('click', () => {
        btnTabQuickSec.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 transition active:scale-95';
        btnTabQuickFull.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 transition active:scale-95';
        if (formQuickSec) formQuickSec.classList.remove('hidden');
        if (formQuickFull) formQuickFull.classList.add('hidden');
      });
    }

    // Chart View Switcher Tabs
    const btnChartViewFull = document.getElementById('btn-chart-view-full');
    const btnChartViewSec = document.getElementById('btn-chart-view-sectional');
    const btnChartViewAcc = document.getElementById('btn-chart-view-accuracy');

    if (btnChartViewFull) {
      btnChartViewFull.addEventListener('click', () => {
        state.mockChartActiveTab = 'full';
        renderMockChart();
      });
    }

    if (btnChartViewSec) {
      btnChartViewSec.addEventListener('click', () => {
        state.mockChartActiveTab = 'sectional';
        renderMockChart();
      });
    }

    if (btnChartViewAcc) {
      btnChartViewAcc.addEventListener('click', () => {
        state.mockChartActiveTab = 'accuracy';
        renderMockChart();
      });
    }

    // History Filter Buttons
    const filterContainer = document.getElementById('mock-history-filter-container');
    if (filterContainer) {
      filterContainer.querySelectorAll('.mock-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const filter = e.currentTarget.getAttribute('data-filter');
          state.mockHistoryFilter = filter;
          renderMockArchiveList();
        });
      });
    }

    // History Search Input
    const searchInput = document.getElementById('mock-history-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.mockSearchQuery = e.target.value;
        renderMockArchiveList();
      });
    }

    // Set today's default date on form date inputs
    const todayDate = getStudyCycleDate();
    const fullMockDateInput = document.getElementById('full-mock-input-date');
    const secMockDateInput = document.getElementById('sec-mock-input-date');
    if (fullMockDateInput && !fullMockDateInput.value) fullMockDateInput.value = todayDate;
    if (secMockDateInput && !secMockDateInput.value) secMockDateInput.value = todayDate;

    // Form 1 Submit: Log Full Mock
    if (formQuickFull) {
      formQuickFull.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = (document.getElementById('full-mock-input-title')?.value || '').trim();
        const date = document.getElementById('full-mock-input-date')?.value || getStudyCycleDate();
        const scoreVal = parseFloat(document.getElementById('full-mock-input-score')?.value);
        const maxScoreVal = 200;

        if (isNaN(scoreVal)) {
          alert('Please enter a valid numeric score.');
          return;
        }

        const mathsVal = document.getElementById('full-mock-input-maths')?.value;
        const engVal = document.getElementById('full-mock-input-english')?.value;
        const reasVal = document.getElementById('full-mock-input-reasoning')?.value;
        const gaVal = document.getElementById('full-mock-input-ga')?.value;

        const percentileVal = document.getElementById('full-mock-input-percentile')?.value;
        const accuracyVal = document.getElementById('full-mock-input-accuracy')?.value;
        const notesVal = (document.getElementById('full-mock-input-notes')?.value || '').trim();

        const sectionsObj = {};
        if (mathsVal !== '' && !isNaN(parseFloat(mathsVal))) sectionsObj.maths = parseFloat(mathsVal);
        if (engVal !== '' && !isNaN(parseFloat(engVal))) sectionsObj.english = parseFloat(engVal);
        if (reasVal !== '' && !isNaN(parseFloat(reasVal))) sectionsObj.reasoning = parseFloat(reasVal);
        if (gaVal !== '' && !isNaN(parseFloat(gaVal))) sectionsObj.ga = parseFloat(gaVal);

        const newMock = {
          id: 'mock_' + Date.now(),
          type: 'full',
          title: title || 'Full Mock Test',
          date: date,
          score: scoreVal,
          maxScore: maxScoreVal,
          percentage: (scoreVal / maxScoreVal) * 100,
          percentile: percentileVal !== '' ? parseFloat(percentileVal) : undefined,
          accuracy: accuracyVal !== '' ? parseFloat(accuracyVal) : undefined,
          sections: Object.keys(sectionsObj).length > 0 ? sectionsObj : undefined,
          notes: notesVal || undefined,
          createdAt: new Date().toISOString()
        };

        if (!state.mockScores) state.mockScores = [];
        state.mockScores.unshift(newMock);
        saveState();
        playChime('reward');

        // Reset form fields
        formQuickFull.reset();
        if (fullMockDateInput) fullMockDateInput.value = getStudyCycleDate();

        renderMockTrends();
        alert(`✓ Full Mock "${newMock.title}" (${newMock.score}/200) logged successfully! Trend graph updated.`);
      });
    }

    // Form 2 Submit: Log Sectional Mock
    if (formQuickSec) {
      formQuickSec.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('sec-mock-input-subject')?.value || 'maths';
        const title = (document.getElementById('sec-mock-input-title')?.value || '').trim();
        const date = document.getElementById('sec-mock-input-date')?.value || getStudyCycleDate();
        const scoreVal = parseFloat(document.getElementById('sec-mock-input-score')?.value);
        const maxScoreVal = 50;

        if (isNaN(scoreVal)) {
          alert('Please enter a valid numeric score.');
          return;
        }

        const timeVal = document.getElementById('sec-mock-input-time')?.value;
        const accuracyVal = document.getElementById('sec-mock-input-accuracy')?.value;
        const notesVal = (document.getElementById('sec-mock-input-notes')?.value || '').trim();

        const newMock = {
          id: 'mock_' + Date.now(),
          type: 'sectional',
          subject: subject,
          title: title || `${subject.toUpperCase()} Sectional Drill`,
          date: date,
          score: scoreVal,
          maxScore: maxScoreVal,
          percentage: (scoreVal / maxScoreVal) * 100,
          timeTakenMinutes: timeVal !== '' ? parseInt(timeVal, 10) : undefined,
          accuracy: accuracyVal !== '' ? parseFloat(accuracyVal) : undefined,
          notes: notesVal || undefined,
          createdAt: new Date().toISOString()
        };

        if (!state.mockScores) state.mockScores = [];
        state.mockScores.unshift(newMock);
        saveState();
        playChime('reward');

        // Reset form fields
        formQuickSec.reset();
        if (secMockDateInput) secMockDateInput.value = getStudyCycleDate();

        renderMockTrends();
        alert(`✓ Sectional Mock "${newMock.title}" (${newMock.score}/50) logged successfully!`);
      });
    }

    // Modal Edit Mock Submit Handler
    const formModalEditMock = document.getElementById('form-modal-edit-mock');
    if (formModalEditMock) {
      formModalEditMock.addEventListener('submit', (e) => {
        e.preventDefault();
        const mockId = document.getElementById('edit-mock-id')?.value;
        const mock = state.mockScores.find(m => m.id === mockId);
        if (!mock) {
          closeModal('modal-edit-mock');
          return;
        }

        const title = (document.getElementById('edit-mock-title')?.value || '').trim();
        const date = document.getElementById('edit-mock-date')?.value || mock.date;
        const scoreVal = parseFloat(document.getElementById('edit-mock-score')?.value);
        const maxScoreVal = parseFloat(document.getElementById('edit-mock-max-score')?.value) || mock.maxScore;
        const percentileVal = document.getElementById('edit-mock-percentile')?.value;
        const notesVal = (document.getElementById('edit-mock-notes')?.value || '').trim();

        mock.title = title || mock.title;
        mock.date = date;
        mock.score = !isNaN(scoreVal) ? scoreVal : mock.score;
        mock.maxScore = maxScoreVal;
        mock.percentage = (mock.score / mock.maxScore) * 100;
        mock.percentile = percentileVal !== '' ? parseFloat(percentileVal) : undefined;
        mock.notes = notesVal;

        if (mock.type === 'sectional') {
          const sub = document.getElementById('edit-mock-subject')?.value;
          if (sub) mock.subject = sub;
        } else if (mock.type === 'full') {
          const mMaths = document.getElementById('edit-mock-maths')?.value;
          const mEng = document.getElementById('edit-mock-english')?.value;
          const mReas = document.getElementById('edit-mock-reasoning')?.value;
          const mGa = document.getElementById('edit-mock-ga')?.value;

          if (!mock.sections) mock.sections = {};
          if (mMaths !== '' && !isNaN(parseFloat(mMaths))) mock.sections.maths = parseFloat(mMaths);
          if (mEng !== '' && !isNaN(parseFloat(mEng))) mock.sections.english = parseFloat(mEng);
          if (mReas !== '' && !isNaN(parseFloat(mReas))) mock.sections.reasoning = parseFloat(mReas);
          if (mGa !== '' && !isNaN(parseFloat(mGa))) mock.sections.ga = parseFloat(mGa);
        }

        saveState();
        closeModal('modal-edit-mock');
        renderMockTrends();
        playChime('start');
      });
    }

    // Reset Mock Trends Modal Triggers
    const btnOpenResetTrends = document.getElementById('btn-open-reset-mock-trends');
    if (btnOpenResetTrends) {
      btnOpenResetTrends.addEventListener('click', () => {
        openModal('modal-reset-mock-trends');
      });
    }

    const btnSecResetTrends = document.getElementById('btn-sec-reset-mock-trends');
    if (btnSecResetTrends) {
      btnSecResetTrends.addEventListener('click', () => {
        openModal('modal-reset-mock-trends');
      });
    }

    // Modal Actions: Reset Mocks
    const btnResetSecMocks = document.getElementById('btn-action-reset-sectional-mocks');
    if (btnResetSecMocks) {
      btnResetSecMocks.addEventListener('click', () => {
        if (confirm('Clear all sectional mock test scores from history?')) {
          state.mockScores = state.mockScores.filter(m => m.type !== 'sectional');
          saveState();
          closeModal('modal-reset-mock-trends');
          renderMockTrends();
          alert('All sectional mock entries have been cleared.');
        }
      });
    }

    const btnResetFullMocks = document.getElementById('btn-action-reset-full-mocks');
    if (btnResetFullMocks) {
      btnResetFullMocks.addEventListener('click', () => {
        if (confirm('Clear all full mock test scores from history?')) {
          state.mockScores = state.mockScores.filter(m => m.type !== 'full');
          saveState();
          closeModal('modal-reset-mock-trends');
          renderMockTrends();
          alert('All full mock entries have been cleared.');
        }
      });
    }

    const btnResetMockDefaults = document.getElementById('btn-action-reset-mock-defaults');
    if (btnResetMockDefaults) {
      btnResetMockDefaults.addEventListener('click', () => {
        if (confirm('Reset mock trends to default sample test records?')) {
          state.mockScores = getDefaultMockScores();
          saveState();
          closeModal('modal-reset-mock-trends');
          renderMockTrends();
          alert('Default mock score records restored.');
        }
      });
    }

    const btnResetAllMocksWipe = document.getElementById('btn-action-reset-all-mocks-wipe');
    if (btnResetAllMocksWipe) {
      btnResetAllMocksWipe.addEventListener('click', () => {
        if (confirm('⚠️ Complete Wipe: Permanently erase ALL mock score records and trend history?')) {
          state.mockScores = [];
          saveState();
          closeModal('modal-reset-mock-trends');
          renderMockTrends();
          alert('Mock score history completely erased.');
        }
      });
    }

    // Form Edit History Submit
    const formEditHistory = document.getElementById('form-edit-history');
    if (formEditHistory) {
      formEditHistory.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = parseInt(document.getElementById('edit-history-index').value, 10);
        const studyHrs = parseFloat(document.getElementById('edit-history-study-hrs').value) || 0;
        const breakHrs = parseFloat(document.getElementById('edit-history-break-hrs').value) || 0;
        const mathsQs = parseInt(document.getElementById('edit-history-maths-qs').value, 10) || 0;

        if (state.history[idx]) {
          state.history[idx].totalStudySeconds = studyHrs * 3600;
          state.history[idx].breakSeconds = breakHrs * 3600;
          state.history[idx].mathsQuestions = mathsQs;
          state.history[idx].goalMet = studyHrs >= state.targetHours;
          saveState();
          closeModal('modal-edit-history');
          renderHistoryTable();
          renderCalendar();
        }
      });
    }

    // Run 7-Day Gemini AI Analytics
    const btnRunAiAnalytics = document.getElementById('btn-run-ai-analytics');
    if (btnRunAiAnalytics) {
      btnRunAiAnalytics.addEventListener('click', async () => {
        openModal('modal-ai-analytics');
        const contentBox = document.getElementById('ai-analytics-content');
        if (contentBox) {
          contentBox.innerHTML = '<p class="text-emerald-400 animate-pulse font-mono">Generating strict 7-day study breakdown and mentor report via Gemini AI...</p>';
        }

        try {
          const res = await fetch('/api/gemini/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              period: 'Last 7 Days',
              todayData: {
                totalSeconds: calculateTotalStudySeconds(),
                breakSeconds: state.todayBreakSeconds,
                mathsDone: state.mathsQuestionsDone,
                subjects: state.subjects.map((s) => ({ name: s.name, seconds: s.seconds }))
              },
              historyData: (state.history || []).slice(0, 14)
            })
          });

          const rawResText = await res.text();
          let data;
          try {
            data = JSON.parse(rawResText);
          } catch (parseErr) {
            if (res.ok && rawResText && !rawResText.trim().startsWith('<')) {
              data = { analysis: rawResText };
            } else {
              const cleanErr = rawResText.replace(/<[^>]*>?/gm, '').trim();
              throw new Error(cleanErr.slice(0, 300) || `Server returned HTTP ${res.status}`);
            }
          }

          if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to fetch analytics');
          }

          if (contentBox) {
            contentBox.innerHTML = `<div class="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">${data.analysis}</div>`;
          }
        } catch (err) {
          if (contentBox) {
            contentBox.innerHTML = `<div class="p-3 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 font-mono text-xs"><p class="font-bold">Analytics Error:</p><p class="text-slate-300 mt-1">${escapeHtml(err.message || String(err))}</p></div>`;
          }
        }
      });
    }

    // ========================================================================
    // MASTER FACTORY RESET ENGINE (WIPE ALL LOCALSTORAGE, RESET STATE, RE-RENDER)
    // ========================================================================
    function performMasterFactoryReset() {
      // 1. Clear All Local Storage
      try {
        localStorage.clear();
      } catch (err) {
        console.warn('localStorage.clear() encountered an error, falling back to explicit removals:', err);
      }

      // Explicitly wipe all keys associated with study hours, math targets, daily items, weekly/monthly planners, and custom logs
      const storageKeysToWipe = [
        STORAGE_KEY,
        WEEKLY_TASKS_STORAGE_KEY,
        'cgl_weekly_tasks',
        'cgl_weekly_planners',
        'cgl_monthly_planners',
        'cgl_monthly_targets',
        'cgl_study_hours',
        'cgl_math_targets',
        'cgl_maths_targets',
        'cgl_daily_items',
        'cgl_daily_hub',
        'cgl_custom_logs',
        'cgl_logs',
        'cgl_history',
        'cgl_journal',
        'cgl_habits',
        'cgl_syllabus',
        'cgl_weak_areas',
        'cgl_mock_scores',
        'cgl_vault_items',
        'cgl_energy_history',
        'MISSION_CGL_2027_TRACKER_V4',
        'MISSION_CGL_2027_TRACKER_V3',
        'MISSION_CGL_2027_TRACKER_V2',
        'MISSION_CGL_2027_TRACKER_V1'
      ];

      storageKeysToWipe.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      });

      // Sweep any remaining keys matching domain patterns
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('cgl_') ||
            key.toLowerCase().includes('cgl') ||
            key.toLowerCase().includes('tracker') ||
            key.toLowerCase().includes('mission') ||
            key.toLowerCase().includes('study')
          )) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {}

      // 2. Reset Global State
      if (cloudSyncTimeout) {
        clearTimeout(cloudSyncTimeout);
        cloudSyncTimeout = null;
      }

      // Re-initialize state to the pristine empty initial defaults
      state = getEmptyPristineState();
      state.weeklyTasks = [];

      // Persist the clean zero-state immediately so subsequent ticks or reloads remain fresh
      saveWeeklyTasksToLocalStorage();
      saveState();

      // If connected to Firebase, synchronize the clean zero state to Firestore as well
      if (currentUser && firestoreDb) {
        performCloudSync().catch(err => console.warn('Cloud sync error after factory reset:', err));
      }

      // 3. Hard Refresh UI: Instantly re-render the entire DOM dashboard
      closeModal('modal-confirm-factory-reset');
      closeModal('modal-auth-sync');

      // Destroy and reset mock chart instance if active
      if (mockChartInstance) {
        try {
          mockChartInstance.destroy();
        } catch (err) {}
        mockChartInstance = null;
      }

      // Re-render the complete DOM dashboard so every section turns completely blank and fresh with zero data
      updateUI();

      // Trigger targeted sub-renders to guarantee 100% blank state across all views
      renderHomeView();
      renderSubjectCards();
      renderHabitsList();
      renderWeakAreas();
      renderSyllabus();
      renderTargetHub();
      renderDateMathsMission();
      renderDateTasks();
      renderRevisionSystem();
      renderSpacedRepetition();
      renderCalendar();
      renderDayInspectionCard();
      renderMilestones();
      renderEnergyRating();
      renderEnergyHistory();
      renderVault();
      renderJournal();
      renderTodoHub();
      if (typeof renderWeeklyView === 'function') {
        renderWeeklyView(getDaysOfWeek(state.selectedTodoWeekStart));
      }
      if (typeof renderMonthlyView === 'function') {
        renderMonthlyView();
      }
      renderMockTrends();
      renderMockChart();
      renderHistoryTable();
      updateSidebarStatus();
      updateLocalStorageStatsUI();

      // Audio & toast confirmation
      playChime('success');
      showAuthToast('💥 Master Factory Reset complete! All data wiped and dashboard reset to zero.');
    }

    // Attach to window for direct execution/debugging
    window.performMasterFactoryReset = performMasterFactoryReset;

    // --- MASTER FACTORY RESET (GLOBAL LOCALSTORAGE WIPE) ---
    const btnMasterReset = document.getElementById('btn-master-factory-reset');
    if (btnMasterReset) {
      btnMasterReset.addEventListener('click', () => {
        openModal('modal-confirm-factory-reset');
      });
    }

    const btnConfirmFactoryResetYes = document.getElementById('btn-confirm-factory-reset-yes');
    if (btnConfirmFactoryResetYes) {
      btnConfirmFactoryResetYes.addEventListener('click', () => {
        performMasterFactoryReset();
      });
    }

    const btnAuthOpenReset = document.getElementById('btn-auth-open-factory-reset');
    if (btnAuthOpenReset) {
      btnAuthOpenReset.addEventListener('click', () => {
        closeModal('modal-auth-sync');
        openModal('modal-confirm-factory-reset');
      });
    }

    // --- Sound Toggle ---
    const btnSound = document.getElementById('btn-sidebar-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        btnSound.innerHTML = state.soundEnabled ? '<span>🔊 Sound ON</span>' : '<span class="text-slate-500">🔇 Sound OFF</span>';
        saveState();
      });
    }

    // --- DATA & STORAGE HUB / CLOUD AUTHENTICATION MODAL BINDINGS ---
    function updateLocalStorageStatsUI() {
      const elDays = document.getElementById('local-stat-days');
      const elMaths = document.getElementById('local-stat-maths');
      const elMocks = document.getElementById('local-stat-mocks');
      if (elDays) {
        const countDays = Array.isArray(state.history) ? state.history.length : 0;
        elDays.textContent = `${countDays} Day${countDays === 1 ? '' : 's'}`;
      }
      if (elMaths) {
        const solved = state.mathsQuestionsDone || 0;
        elMaths.textContent = `${solved} / 320`;
      }
      if (elMocks) {
        const countMocks = Array.isArray(state.mockScores) ? state.mockScores.length : (Array.isArray(state.mockRecords) ? state.mockRecords.length : 0);
        elMocks.textContent = `${countMocks} Mock${countMocks === 1 ? '' : 's'}`;
      }
    }

    const btnTopAuth = document.getElementById('btn-top-auth');
    if (btnTopAuth) {
      btnTopAuth.addEventListener('click', () => {
        updateLocalStorageStatsUI();
        openModal('modal-auth-sync');
      });
    }

    const btnSidebarCloudSync = document.getElementById('btn-sidebar-cloud-sync');
    if (btnSidebarCloudSync) {
      btnSidebarCloudSync.addEventListener('click', () => {
        closeSidebar();
        updateLocalStorageStatsUI();
        openModal('modal-auth-sync');
      });
    }

    // Local Storage Backup Export (Download JSON)
    const btnExportBackupJson = document.getElementById('btn-export-backup-json');
    if (btnExportBackupJson) {
      btnExportBackupJson.addEventListener('click', () => {
        try {
          const backupData = {
            exportDate: new Date().toISOString(),
            version: 2,
            appName: 'Mission SSC CGL 2027 & Railway Tracker',
            state: state
          };
          const jsonStr = JSON.stringify(backupData, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = typeof getStudyCycleDate === 'function' ? getStudyCycleDate() : new Date().toISOString().split('T')[0];
          a.href = url;
          a.download = `cgl-tracker-backup-${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showAuthToast('Backup JSON downloaded! All your timers, 320 Maths questions & mocks are saved.');
        } catch (err) {
          console.error('Export backup error:', err);
          showAuthToast('Failed to generate backup file.');
        }
      });
    }

    // Local Storage Backup Import / Restore (Load JSON File)
    const inputRestoreBackup = document.getElementById('input-restore-backup');
    if (inputRestoreBackup) {
      inputRestoreBackup.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            const loadedState = parsed.state || parsed;
            if (loadedState && typeof loadedState === 'object') {
              state = Object.assign({}, loadedState);
              saveState(true);
              // Re-render core views
              if (typeof renderTimerDashboard === 'function') renderTimerDashboard();
              if (typeof renderSubjectGrid === 'function') renderSubjectGrid();
              if (typeof renderHabitTracker === 'function') renderHabitTracker();
              if (typeof renderMaths320 === 'function') renderMaths320();
              if (typeof renderDailyTargetsHub === 'function') renderDailyTargetsHub();
              if (typeof renderJournal === 'function') renderJournal();
              if (typeof renderMockAnalytics === 'function') renderMockAnalytics();
              updateLocalStorageStatsUI();
              showAuthToast('Study records restored successfully from backup!');
              closeModal('modal-auth-sync');
            } else {
              showAuthToast('Invalid backup file format.');
            }
          } catch (err) {
            console.error('Import parse error:', err);
            showAuthToast('Failed to read backup JSON file.');
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      });
    }

    // Copy Backup JSON to Clipboard
    const btnCopyBackupJson = document.getElementById('btn-copy-backup-json');
    if (btnCopyBackupJson) {
      btnCopyBackupJson.addEventListener('click', async () => {
        try {
          const backupData = {
            exportDate: new Date().toISOString(),
            version: 2,
            appName: 'Mission SSC CGL 2027 & Railway Tracker',
            state: state
          };
          await navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
          showAuthToast('Backup JSON copied to clipboard!');
        } catch (_err) {
          showAuthToast('Failed to copy to clipboard.');
        }
      });
    }

    // Google Sign-In Button Handler
    const btnGoogleSignIn = document.getElementById('btn-google-signin');
    if (btnGoogleSignIn) {
      btnGoogleSignIn.addEventListener('click', async () => {
        hideAuthError();

        const spinner = document.getElementById('google-signin-spinner');
        const label = document.getElementById('google-signin-label');

        if (!firebaseAuth) {
          showAuthError('Firebase Authentication service is initializing. Please try again.');
          return;
        }

        if (spinner) spinner.classList.remove('hidden');
        if (label) label.textContent = 'Connecting to Google...';
        btnGoogleSignIn.disabled = true;

        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({
            prompt: 'select_account'
          });

          const result = await firebaseAuth.signInWithPopup(provider);
          if (result && result.user) {
            showAuthToast(`Welcome ${result.user.displayName || result.user.email}! Study progress synced.`);
            closeModal('modal-auth-sync');
          }
        } catch (err) {
          console.error('Google Sign-In Error:', err);
          let msg = 'Google authentication failed. Please try again.';
          let isHtml = false;
          if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
            const currentHost = window.location.hostname;
            isHtml = true;
            msg = `<div>
              <p class="font-bold text-rose-200">Domain Authorization Required for OAuth:</p>
              <p class="text-[11px] text-slate-300 mt-1">
                Your domain <code class="bg-slate-900/90 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">${escapeHtml(currentHost)}</code> must be added to Firebase Authorized Domains.
              </p>
              <div class="mt-2 text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <p class="font-semibold text-emerald-400">Quick 30-second fix:</p>
                <ol class="list-decimal list-inside space-y-0.5 text-slate-400 font-sans">
                  <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" class="text-white underline font-semibold">Firebase Console</a> &gt; <strong>Authentication</strong></li>
                  <li>Click on the <strong>Settings</strong> tab &gt; <strong>Authorized domains</strong></li>
                  <li>Click <strong>Add domain</strong> &gt; paste <code class="text-amber-300 font-mono font-bold">${escapeHtml(currentHost)}</code> (or <code class="text-amber-300 font-mono">vercel.app</code>)</li>
                </ol>
              </div>
            </div>`;
          } else if (err.code === 'auth/popup-closed-by-user') {
            msg = 'Google Sign-in window was closed before completing. Please try again.';
          } else if (err.code === 'auth/popup-blocked') {
            msg = 'Sign-in popup was blocked by browser. Please allow popups for this page.';
          } else if (err.code === 'auth/network-request-failed') {
            msg = 'Network connection failed. Please check your internet connection.';
          } else if (err.message) {
            msg = err.message;
          }
          showAuthError(msg, isHtml);
        } finally {
          if (spinner) spinner.classList.add('hidden');
          if (label) label.textContent = 'Sign in with Google';
          btnGoogleSignIn.disabled = false;
        }
      });
    }

    // Manual Cloud Sync Button
    const btnManualSync = document.getElementById('btn-auth-manual-sync');
    if (btnManualSync) {
      btnManualSync.addEventListener('click', async () => {
        if (!currentUser || !firestoreDb) {
          showAuthToast('Please sign in to sync with cloud.');
          return;
        }
        btnManualSync.disabled = true;
        btnManualSync.innerHTML = '<span class="cloud-syncing-spin">🔄</span> Syncing...';
        await performCloudSync();
        btnManualSync.disabled = false;
        btnManualSync.innerHTML = '<span>🔄</span> Sync Cloud Now';
        showAuthToast('Cloud sync completed! All study progress backed up.');
      });
    }

    // Logout Button
    const btnLogout = document.getElementById('btn-auth-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (!firebaseAuth) return;
        try {
          await firebaseAuth.signOut();
          showAuthToast('Logged out. Switched to local offline mode.');
          closeModal('modal-auth-sync');
        } catch (err) {
          console.error('Logout error:', err);
          alert('Error logging out: ' + err.message);
        }
      });
    }

    // --- GUARANTEED BUG-FREE REWARD MODAL CLOSE LISTENERS ---
    const btnCloseRewardX = document.getElementById('btn-close-reward-x');
    const btnCloseRewardAction = document.getElementById('btn-close-reward-action');

    if (btnCloseRewardX) {
      btnCloseRewardX.addEventListener('click', () => closeModal('modal-reward'));
    }
    if (btnCloseRewardAction) {
      btnCloseRewardAction.addEventListener('click', () => closeModal('modal-reward'));
    }

    // Close buttons for all other modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Background overlay click listeners (click outside modal content closes modal)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Subject Manager Modal Controls
    bindSubjectManagerModalControls();

    // Escape Key Handler closes any open modal or sidebar
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeSidebar();
      }
    });
  }

  // ==========================================================================
  // 12. INTERVAL TICK ENGINE & APPLICATION BOOTSTRAP
  // ==========================================================================

  function startTickEngine() {
    if (globalTickInterval) clearInterval(globalTickInterval);

    globalTickInterval = setInterval(() => {
      // 1. Synchronize real elapsed time via timestamps (resilient to tab throttling)
      syncElapsedActiveTime();

      // 2. Check 5:00 AM cycle transition
      check5amDailyCycleReset();

      // 3. Fast UI refresh for smooth gauges, live digital clock & counters
      updateCountdownTicker();
      update5amCountdown();
      renderHomeView();
      if (!document.getElementById('section-subjects').classList.contains('hidden')) {
        renderSubjectCards();
      }

      // Periodically persist running seconds to localStorage
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec % 5 === 0) {
        saveState();
      }
    }, 1000);

    // Rotate strict anti-procrastination quotes every 2 hours (2 * 60 * 60 * 1000 ms)
    if (quoteRotationInterval) clearInterval(quoteRotationInterval);
    quoteRotationInterval = setInterval(() => {
      currentQuoteIndex++;
      updateAccountabilityQuote();
    }, 2 * 60 * 60 * 1000);
  }

  // Page Visibility API & Lifecycle Synchronization
  // Ensures 100% time accuracy when switching browser tabs, minimizing windows, or waking from sleep
  function handleVisibilityOrFocusChange() {
    syncElapsedActiveTime();
    saveState();
    check5amDailyCycleReset();
    updateCountdownTicker();
    update5amCountdown();
    renderHomeView();
    if (!document.getElementById('section-subjects').classList.contains('hidden')) {
      renderSubjectCards();
    }
  }

  document.addEventListener('visibilitychange', () => {
    handleVisibilityOrFocusChange();
  });

  window.addEventListener('focus', () => {
    handleVisibilityOrFocusChange();
  });

  window.addEventListener('blur', () => {
    syncElapsedActiveTime();
    saveState();
  });

  window.addEventListener('beforeunload', () => {
    syncElapsedActiveTime();
    saveState();
  });

  // Application Entry Point
  function init() {
    try {
      loadState();
    } catch (err) {
      console.error('Error in loadState:', err);
    }
    try {
      initFirebaseService();
    } catch (err) {
      console.error('Error in initFirebaseService:', err);
    }
    try {
      bindEvents();
    } catch (err) {
      console.error('Error in bindEvents:', err);
    }
    try {
      updateUI();
    } catch (err) {
      console.error('Error in updateUI:', err);
    }
    try {
      startTickEngine();
    } catch (err) {
      console.error('Error in startTickEngine:', err);
    }
    console.log('Mission CGL 2027 & Railway Tracker initialized successfully with background active tracking.');
  }

  // ==========================================================================
  // 13. FIREBASE AUTHENTICATION & FIRESTORE CLOUD PERSISTENCE ENGINE
  // ==========================================================================

  function handleFirestoreError(error, operationType, path) {
    const errStr = error instanceof Error ? error.message : String(error);
    if (errStr.includes('resource-exhausted') || errStr.includes('quota exceeded') || errStr.includes('Quota limit exceeded')) {
      if (!cloudQuotaExceeded) {
        cloudQuotaExceeded = true;
        console.warn('Firestore free tier quota limit reached. Switching to local-only persistence mode.');
        try {
          showAuthToast('Firestore free tier quota exceeded. Running seamlessly on local storage mode.');
        } catch {}
      }
    }
    const errInfo = {
      error: errStr,
      authInfo: {
        userId: currentUser?.uid || null,
        email: currentUser?.email || null,
        emailVerified: currentUser?.emailVerified || null,
        isAnonymous: currentUser?.isAnonymous || null,
        tenantId: currentUser?.tenantId || null,
        providerInfo: currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || []
      },
      operationType: operationType,
      path: path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  function initFirebaseService() {
    try {
      if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        firebaseAuth = firebase.auth();
        firestoreDb = firebase.firestore();

        // Connect to the specific named Firestore database
        if (FIREBASE_CONFIG.firestoreDatabaseId && firestoreDb) {
          if (firestoreDb._delegate && firestoreDb._delegate._databaseId) {
            firestoreDb._delegate._databaseId.database = FIREBASE_CONFIG.firestoreDatabaseId;
          }
        }

        // Listen to Auth State Changes
        firebaseAuth.onAuthStateChanged(async (user) => {
          currentUser = user;
          updateAuthUI(user);

          if (user) {
            console.log('Firebase user logged in:', user.email, user.uid);
            await restoreStateFromCloud(user.uid);
          } else {
            console.log('Firebase user logged out / guest mode.');
          }
        });
      } else {
        console.warn('Firebase SDK not loaded on window.');
      }
    } catch (e) {
      console.error('Failed to initialize Firebase service:', e);
    }
  }

  function updateAuthUI(user) {
    const authStatusDot = document.getElementById('auth-status-dot');
    const authStatusLabel = document.getElementById('auth-status-label');
    const sidebarAuthStatusText = document.getElementById('sidebar-auth-status-text');
    const authViewLoggedIn = document.getElementById('auth-view-logged-in');
    const authViewLoggedOut = document.getElementById('auth-view-logged-out');
    const authUserDisplayName = document.getElementById('auth-user-display-name');
    const authUserEmail = document.getElementById('auth-user-email');

    if (user) {
      if (authStatusDot) {
        authStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      }
      if (authStatusLabel) {
        const shortName = user.displayName || user.email.split('@')[0];
        authStatusLabel.textContent = shortName.length > 12 ? shortName.slice(0, 10) + '...' : shortName;
        authStatusLabel.title = user.email;
      }
      if (sidebarAuthStatusText) {
        sidebarAuthStatusText.textContent = `Cloud: ${user.email.split('@')[0]}`;
      }
      if (authViewLoggedIn) authViewLoggedIn.classList.remove('hidden');
      if (authViewLoggedOut) authViewLoggedOut.classList.add('hidden');
      if (authUserDisplayName) authUserDisplayName.textContent = user.displayName || 'SSC CGL Aspirant';
      if (authUserEmail) authUserEmail.textContent = user.email;
    } else {
      if (authStatusDot) {
        authStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      }
      if (authStatusLabel) {
        authStatusLabel.textContent = 'Local (Saved)';
        authStatusLabel.title = 'Local Storage Mode: All study progress is auto-saved on this device';
      }
      if (sidebarAuthStatusText) {
        sidebarAuthStatusText.textContent = 'Data Hub (Local Saved)';
      }
      if (authViewLoggedIn) authViewLoggedIn.classList.add('hidden');
      if (authViewLoggedOut) authViewLoggedOut.classList.remove('hidden');
    }
  }

  function showAuthError(msg, isHtml = false) {
    const alertBox = document.getElementById('auth-error-alert');
    const msgEl = document.getElementById('auth-error-message');
    if (alertBox && msgEl) {
      if (isHtml) {
        msgEl.innerHTML = msg;
      } else {
        msgEl.textContent = msg;
      }
      alertBox.classList.remove('hidden');
    }
  }

  function hideAuthError() {
    const alertBox = document.getElementById('auth-error-alert');
    if (alertBox) {
      alertBox.classList.add('hidden');
    }
  }

  function showAuthToast(message) {
    let toast = document.getElementById('app-auth-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-auth-toast';
      toast.className = 'auth-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="text-base">☁️</span> <span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      if (toast) toast.classList.remove('show');
    }, 4000);
  }

  function scheduleCloudSync() {
    if (cloudQuotaExceeded) return;
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    cloudSyncTimeout = setTimeout(() => {
      performCloudSync();
    }, 30000); // 30 second debounce to prevent quota overuse
  }

  async function performCloudSync() {
    if (cloudQuotaExceeded || !currentUser || !firestoreDb || isSyncingToCloud) return;
    if (lastCloudSyncTimestamp && Date.now() - lastCloudSyncTimestamp < 60000) return; // Throttle to max once per 60s
    isSyncingToCloud = true;

    try {
      const payload = {
        userId: currentUser.uid,
        email: currentUser.email,
        activeCycleDate: state.activeCycleDate || getStudyCycleDate(),
        targetHours: state.targetHours || 10.0,
        isBreakDay: !!state.isBreakDay,
        soundEnabled: state.soundEnabled !== false,
        targetExamTitle: state.targetExamTitle || DEFAULT_TARGET_EXAM.title,
        targetExamDate: state.targetExamDate || DEFAULT_TARGET_EXAM.date,
        subjects: state.subjects || [],
        todayBreakSeconds: state.todayBreakSeconds || 0,
        yesterdayBreakSeconds: state.yesterdayBreakSeconds || 0,
        mathsQuestionsDone: state.mathsQuestionsDone || 0,
        habits: state.habits || [],
        weakAreas: state.weakAreas || [],
        syllabus: state.syllabus || [],
        revisionTopics: state.revisionTopics || [],
        dateTargets: state.dateTargets || {},
        energyRatingToday: state.energyRatingToday,
        energyHistory: state.energyHistory || [],
        vaultItems: state.vaultItems || [],
        spacedRepChapters: state.spacedRepChapters || [],
        consecutiveStreak: state.consecutiveStreak || 0,
        claimedMilestones: state.claimedMilestones || [],
        history: state.history || [],
        mockAnalysisHistory: state.mockAnalysisHistory || [],
        journalEntries: state.journalEntries || [],
        mockScores: state.mockScores || [],
        updatedAt: new Date().toISOString()
      };

      await firestoreDb.collection('study_data').doc(currentUser.uid).set(payload, { merge: true });
      lastCloudSyncTimestamp = Date.now();
      const lastSyncEl = document.getElementById('auth-last-sync-time');
      if (lastSyncEl) {
        lastSyncEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      console.log('Cloud sync to Firestore succeeded for user:', currentUser.uid);
    } catch (e) {
      console.error('Cloud sync failed:', e);
      handleFirestoreError(e, 'write', `study_data/${currentUser?.uid}`);
    } finally {
      isSyncingToCloud = false;
    }
  }

  async function restoreStateFromCloud(userId) {
    if (!firestoreDb || !userId) return;
    try {
      const docSnap = await firestoreDb.collection('study_data').doc(userId).get();
      if (docSnap.exists) {
        const cloudData = docSnap.data();
        if (cloudData && typeof cloudData === 'object') {
          console.log('Restoring user profile and study data from Firestore Cloud Snapshot...');
          
          // Reconcile and merge Cloud State into current app state
          if (cloudData.activeCycleDate) state.activeCycleDate = cloudData.activeCycleDate;
          if (cloudData.targetHours !== undefined) state.targetHours = cloudData.targetHours;
          if (cloudData.isBreakDay !== undefined) state.isBreakDay = cloudData.isBreakDay;
          if (cloudData.soundEnabled !== undefined) state.soundEnabled = cloudData.soundEnabled;
          if (cloudData.targetExamTitle) state.targetExamTitle = cloudData.targetExamTitle;
          if (cloudData.targetExamDate) state.targetExamDate = cloudData.targetExamDate;
          if (Array.isArray(cloudData.subjects)) state.subjects = cloudData.subjects;
          if (cloudData.todayBreakSeconds !== undefined) state.todayBreakSeconds = cloudData.todayBreakSeconds;
          if (cloudData.yesterdayBreakSeconds !== undefined) state.yesterdayBreakSeconds = cloudData.yesterdayBreakSeconds;
          if (cloudData.mathsQuestionsDone !== undefined) state.mathsQuestionsDone = cloudData.mathsQuestionsDone;
          if (Array.isArray(cloudData.habits)) state.habits = cloudData.habits;
          if (Array.isArray(cloudData.weakAreas)) state.weakAreas = cloudData.weakAreas;
          if (Array.isArray(cloudData.syllabus)) state.syllabus = cloudData.syllabus;
          if (Array.isArray(cloudData.revisionTopics)) state.revisionTopics = cloudData.revisionTopics;
          if (cloudData.dateTargets && typeof cloudData.dateTargets === 'object') state.dateTargets = cloudData.dateTargets;
          if (cloudData.energyRatingToday !== undefined) state.energyRatingToday = cloudData.energyRatingToday;
          if (Array.isArray(cloudData.energyHistory)) state.energyHistory = cloudData.energyHistory;
          if (Array.isArray(cloudData.vaultItems)) state.vaultItems = cloudData.vaultItems;
          if (Array.isArray(cloudData.spacedRepChapters)) state.spacedRepChapters = cloudData.spacedRepChapters;
          if (cloudData.consecutiveStreak !== undefined) state.consecutiveStreak = cloudData.consecutiveStreak;
          if (Array.isArray(cloudData.claimedMilestones)) state.claimedMilestones = cloudData.claimedMilestones;
          if (Array.isArray(cloudData.history)) state.history = cloudData.history;
          if (Array.isArray(cloudData.mockAnalysisHistory)) state.mockAnalysisHistory = cloudData.mockAnalysisHistory;
          if (Array.isArray(cloudData.journalEntries)) state.journalEntries = cloudData.journalEntries;
          if (Array.isArray(cloudData.mockScores)) state.mockScores = cloudData.mockScores;

          // Reconcile 5 AM reset & refresh UI
          check5amDailyCycleReset();
          saveState(true); // Persist restored data locally without triggering immediately another cloud write
          updateUI();
          showAuthToast('Cloud data loaded! Your exact progress was restored.');

          const lastSyncEl = document.getElementById('auth-last-sync-time');
          if (lastSyncEl && cloudData.updatedAt) {
            try {
              lastSyncEl.textContent = new Date(cloudData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              lastSyncEl.textContent = 'Synced';
            }
          }
        }
      } else {
        // User's first cloud login: upload their local study progress to Firestore
        console.log('No existing cloud snapshot found for this user. Seeding local state to Firestore...');
        await performCloudSync();
        showAuthToast('Welcome! Your existing progress has been backed up to the cloud.');
      }
    } catch (e) {
      console.error('Error restoring state from cloud:', e);
      handleFirestoreError(e, 'get', `study_data/${userId}`);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
