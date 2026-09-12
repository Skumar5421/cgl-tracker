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
    { id: 'maths', name: 'Mathematics (Quantitative Aptitude)', seconds: 0, isRunning: false, isDefault: true },
    { id: 'english', name: 'English Language & Comprehension', seconds: 0, isRunning: false, isDefault: true },
    { id: 'reasoning', name: 'Reasoning & General Intelligence', seconds: 0, isRunning: false, isDefault: true },
    { id: 'ga', name: 'General Awareness (GK & GS)', seconds: 0, isRunning: false, isDefault: true },
    { id: 'mocks', name: 'Full Mock & Sectional Analysis', seconds: 0, isRunning: false, isDefault: true }
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
      if (!Array.isArray(state.vaultItems)) state.vaultItems = [];
      if (!Array.isArray(state.spacedRepChapters)) state.spacedRepChapters = [];
      if (!Array.isArray(state.energyHistory)) state.energyHistory = [];
      if (!Array.isArray(state.journalEntries)) state.journalEntries = [];
      if (!Array.isArray(state.mockScores)) state.mockScores = [];
      if (!Array.isArray(state.weakAreas)) state.weakAreas = [];
      if (!Array.isArray(state.claimedMilestones)) state.claimedMilestones = [];
      if (!Array.isArray(state.mockAnalysisHistory)) state.mockAnalysisHistory = [];
      if (state.targetHours === undefined) state.targetHours = 10.0;
      if (state.soundEnabled === undefined) state.soundEnabled = true;
      if (!state.targetExamTitle) state.targetExamTitle = DEFAULT_TARGET_EXAM.title;
      if (!state.targetExamDate) state.targetExamDate = DEFAULT_TARGET_EXAM.date;

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
      // Brand new clean first-run: populate initial defaults & persist
      state = getInitialDefaultState();
      saveState();
    }

    if (!state.selectedCalendarDate) {
      state.selectedCalendarDate = getStudyCycleDate();
    }
    if (!state.selectedJournalDate) {
      state.selectedJournalDate = getStudyCycleDate();
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

  // Save to LocalStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
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
    renderHomeView();
    renderSubjectCards();
    renderHabitsList();
    renderWeakAreas();
    renderSyllabus();
    renderRevisionSystem();
    renderSpacedRepetition();
    renderCalendar();
    renderDayInspectionCard();
    renderMilestones();
    renderEnergyRating();
    renderEnergyHistory();
    renderVault();
    renderJournal();
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

  // --- 7F1. TARGET EXAM COUNTDOWN TICKER ---
  function updateCountdownTicker() {
    const titleEl = document.getElementById('home-exam-title');
    const dateLabel = document.getElementById('home-exam-target-date-label');
    const daysEl = document.getElementById('ticker-days');
    const hoursEl = document.getElementById('ticker-hours');
    const minsEl = document.getElementById('ticker-minutes');
    const secsEl = document.getElementById('ticker-seconds');
    const inlineDatePicker = document.getElementById('inline-exam-date-picker');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const examTitle = state.targetExamTitle || DEFAULT_TARGET_EXAM.title;
    const targetDateStr = state.targetExamDate || DEFAULT_TARGET_EXAM.date;

    if (titleEl) titleEl.textContent = examTitle;

    // Never overwrite inline input while user is focusing or picking a date
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

    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

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

  // --- 7F3. SUBJECT-WISE MULTI-STAGE REVISION SYSTEM (R1-R4) ---
  function renderRevisionSystem() {
    const list = document.getElementById('revision-topics-list');
    if (!list) return;

    // Filter tabs
    document.querySelectorAll('#revision-subject-filter-tabs button').forEach(btn => {
      const filter = btn.getAttribute('data-rev-filter');
      if (filter === state.activeRevisionFilter) {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white transition whitespace-nowrap shadow-md shadow-emerald-500/20';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition whitespace-nowrap';
      }
    });

    let items = state.revisionTopics || [];
    if (state.activeRevisionFilter !== 'all') {
      items = items.filter(t => t.subject.toLowerCase() === state.activeRevisionFilter.toLowerCase());
    }

    if (items.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-xs text-slate-500">No revision topics in this category. Click "+ Add Revision Topic" above.</div>`;
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
        dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">✓ Fully Mastered</span>`;
      } else {
        const daysLeft = targetDays - daysElapsed;
        if (daysLeft < 0) {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">⚠️ ${nextStage} OVERDUE (${Math.abs(daysLeft)}d)</span>`;
        } else if (daysLeft === 0) {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">⚡ ${nextStage} DUE TODAY!</span>`;
        } else {
          dueBadgeHtml = `<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">${nextStage} in ${daysLeft} days</span>`;
        }
      }

      const renderStagePill = (label, isDone, stageKey) => {
        return `
          <button
            data-toggle-stage="${t.id}"
            data-stage="${stageKey}"
            class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${isDone ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'}"
            title="Click to toggle ${label} completed"
          >
            ${isDone ? '✓ ' : ''}${label}
          </button>
        `;
      };

      return `
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">${t.subject}</span>
                <h4 class="text-sm font-bold text-white">${t.title}</h4>
              </div>
              <p class="text-[11px] text-slate-400 mt-1 font-mono">
                Initial Completion: ${t.completedDate} • Elapsed: <strong>${daysElapsed} days</strong>
              </p>
            </div>
            <div class="flex items-center gap-2">
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
          <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <span class="text-[11px] text-slate-500 font-mono">Intervals:</span>
            ${renderStagePill('R1 (Day 3)', t.r1Done, 'r1Done')}
            ${renderStagePill('R2 (Day 7)', t.r2Done, 'r2Done')}
            ${renderStagePill('R3 (Day 15)', t.r3Done, 'r3Done')}
            ${renderStagePill('R4 (Day 30)', t.r4Done, 'r4Done')}
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

      <!-- Calendar Sync: Aspirant Daily Journal -->
      ${journalSnippetHtml}

      <!-- Action Footer -->
      <div class="border-t border-slate-800/80 pt-3">
        ${actionBtnHtml}
      </div>
    `;

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
    if (!el) return;

    const now = new Date();
    const next5am = new Date(now);
    if (now.getHours() >= 5) {
      next5am.setDate(next5am.getDate() + 1);
    }
    next5am.setHours(5, 0, 0, 0);

    const diff = Math.max(0, next5am.getTime() - now.getTime());
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = `5 AM in ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
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

  // ==========================================================================
  // 9. NAVIGATION & SECTION SWITCHING
  // ==========================================================================

  function navigateTo(sectionKey) {
    if (sectionKey === 'habits') {
      sectionKey = 'calendar';
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
      if (linkNav === sectionKey || (sectionKey === 'calendar' && linkNav === 'habits')) {
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
      renderRevisionSystem();
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
  // 10. MOZILLA PDF.JS & MOCK ANALYSIS INTEGRATION
  // ==========================================================================

  async function extractTextFromPDF(file) {
    // @ts-ignore
    if (typeof window === 'undefined' || !window.pdfjsLib) {
      throw new Error('PDF.js library is not available. Please verify your internet connection.');
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

    return String(fullText || '').trim();
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

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      fileName = file.name;
      if (statusPill) statusPill.textContent = 'Parsing PDF Pages...';
      if (outputBox) outputBox.innerHTML = '<p class="text-emerald-400 animate-pulse font-mono">Extracting text from PDF via PDF.js...</p>';
      try {
        textToAnalyze = await extractTextFromPDF(file);
      } catch (err) {
        if (statusPill) statusPill.textContent = 'PDF Parse Error';
        if (outputBox) outputBox.innerHTML = `<div class="p-3 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 font-mono text-xs"><p class="font-bold">PDF Parse Error:</p><p class="text-slate-300 mt-1">${escapeHtml(err.message || String(err))}</p></div>`;
        return;
      }
    } else if (rawTextArea && rawTextArea.value.trim()) {
      textToAnalyze = rawTextArea.value.trim();
    } else {
      alert('Please upload a PDF scorecard or paste mock results text.');
      return;
    }

    if (!textToAnalyze || typeof textToAnalyze !== 'string' || !textToAnalyze.trim()) {
      if (statusPill) statusPill.textContent = 'No Text Found';
      if (outputBox) {
        outputBox.innerHTML = '<div class="p-3 rounded-xl bg-amber-950/30 border border-amber-800 text-amber-300 font-mono text-xs"><p class="font-bold">⚠️ No Text Extracted</p><p class="text-slate-300 mt-1">No readable text found in this PDF (it might contain scanned images or screenshots). Please paste the mock scorecard text manually in the text area below.</p></div>';
      }
      return;
    }

    // Ensure textToAnalyze is a clean plain text string and limit payload size safely
    textToAnalyze = String(textToAnalyze).trim().slice(0, 100000);

    if (statusPill) statusPill.textContent = 'Analyzing with Gemini AI...';
    if (outputBox) outputBox.innerHTML = '<p class="text-emerald-400 animate-pulse font-mono">Querying Gemini AI mock diagnostic model...</p>';

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

      // Render response
      if (data.analysis) {
        // Markdown format response
        outputBox.innerHTML = `<div class="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">${data.analysis}</div>`;
      } else {
        // Structured JSON format
        outputBox.innerHTML = `
          <div class="space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div class="text-[10px] text-slate-400">SCORE</div>
                <div class="text-base font-extrabold text-emerald-400">${data.score || 0} / ${data.totalMarks || 200}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div class="text-[10px] text-slate-400">ACCURACY</div>
                <div class="text-base font-extrabold text-white">${data.accuracyPercent || 0}%</div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div class="text-[10px] text-slate-400">CORRECT</div>
                <div class="text-base font-bold text-emerald-400">${data.correct || 0}</div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div class="text-[10px] text-slate-400">WRONG</div>
                <div class="text-base font-bold text-rose-400">${data.wrong || 0}</div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span class="text-[11px] font-bold text-white uppercase font-mono">Mentor Verdict:</span>
              <p class="text-slate-300">${escapeHtml(data.overallVerdict || 'Good attempt. Focus on negative marking prevention.')}</p>
            </div>

            ${Array.isArray(data.weakPoints) && data.weakPoints.length > 0 ? `
              <div class="p-3 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1.5">
                <span class="text-[11px] font-bold text-rose-300 uppercase font-mono">Weak Areas Identified:</span>
                <ul class="list-disc list-inside space-y-1 text-slate-300">
                  ${data.weakPoints.map((wp) => `<li>${escapeHtml(wp)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${Array.isArray(data.continuousRecommendations) && data.continuousRecommendations.length > 0 ? `
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span class="text-[11px] font-bold text-sky-400 uppercase font-mono">Continuous Recommendations:</span>
                <ul class="list-disc list-inside space-y-1 text-slate-300">
                  ${data.continuousRecommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Automatically populate or enrich Weak Areas Radar on homepage!
      if (data.weakPoints && Array.isArray(data.weakPoints)) {
        data.weakPoints.slice(0, 3).forEach((wp, i) => {
          state.weakAreas.unshift({
            id: 'mock_weak_' + Date.now() + '_' + i,
            subject: 'Mock',
            topic: String(wp).slice(0, 60),
            advice: 'Auto-extracted from latest Mock Diagnostic. Solve 50 PYQ drills.',
            resolved: false
          });
        });
        // Limit to 8 radar items
        state.weakAreas = state.weakAreas.slice(0, 8);
        saveState();
        renderWeakAreas();
      }

    } catch (err) {
      if (statusPill) statusPill.textContent = 'Analysis Failed';
      if (outputBox) {
        outputBox.innerHTML = `
          <div class="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 font-mono text-xs space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-rose-400">
              <span>⚠️</span> Mock Diagnostic Error
            </div>
            <p class="text-slate-300 leading-relaxed">${escapeHtml(err.message || String(err))}</p>
          </div>
        `;
      }
    }
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

    // --- Subject-Wise Revision System Listeners ---
    const btnAddRevision = document.getElementById('btn-add-revision-topic');
    if (btnAddRevision) {
      btnAddRevision.addEventListener('click', () => {
        const dateInput = document.getElementById('rev-completion-date');
        if (dateInput) dateInput.value = getStudyCycleDate();
        openModal('modal-add-revision-topic');
      });
    }

    const formAddRevision = document.getElementById('form-add-revision-topic');
    if (formAddRevision) {
      formAddRevision.addEventListener('submit', (e) => {
        e.preventDefault();
        const sub = document.getElementById('rev-subject').value;
        const title = document.getElementById('rev-topic-title').value.trim();
        const date = document.getElementById('rev-completion-date').value || getStudyCycleDate();
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
        if (confirm('Restore default revision topics and intervals?')) {
          state.revisionTopics = JSON.parse(JSON.stringify(DEFAULT_REVISION_TOPICS));
          saveState();
          renderRevisionSystem();
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
        try {
          localStorage.clear();
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
        window.location.reload();
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

      // 3. Fast UI refresh for smooth gauges & counters
      updateCountdownTicker();
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
    loadState();
    bindEvents();
    updateUI();
    startTickEngine();
    console.log('Mission CGL 2027 & Railway Tracker initialized successfully with background active tracking.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
