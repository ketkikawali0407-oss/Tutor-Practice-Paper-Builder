// ========================================================
// app.js — Tutor Practice Paper Builder
// Vanilla JavaScript Application Logic
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Application State
  const state = {
    currentPaper: null,
    showAnswersOnScreen: false,
    selectedTopics: new Set(),
    selectedTypes: new Set(['mcq', 'short', 'fill_blank', 'true_false', 'long', 'assertion_reason']),
    genMode: 'count', // 'count' | 'marks'
    targetMarks: 25,
  };

  // 3. Cache DOM Elements
  const DOM = {
    // Navigation
    navTabs: document.getElementById('navTabs'),
    tabViews: document.querySelectorAll('.tab-view'),

    // Paper Builder Form
    studentSelect: document.getElementById('studentSelect'),
    studentCountBadge: document.getElementById('studentCountBadge'),
    studentWeakNotice: document.getElementById('studentWeakNotice'),
    weakNoticeText: document.getElementById('weakNoticeText'),
    btnApplyWeakTopics: document.getElementById('btnApplyWeakTopics'),
    btnQuickAddStudent: document.getElementById('btnQuickAddStudent'),

    paperTitle: document.getElementById('paperTitle'),
    gradeSelect: document.getElementById('gradeSelect'),
    subjectSelect: document.getElementById('subjectSelect'),
    topicsContainer: document.getElementById('topicsContainer'),
    btnSelectAllTopics: document.getElementById('btnSelectAllTopics'),
    btnClearTopics: document.getElementById('btnClearTopics'),

    // Question Types Multi-Checkbox
    qtypesContainer: document.getElementById('qtypesContainer'),
    btnSelectAllTypes: document.getElementById('btnSelectAllTypes'),
    btnClearTypes: document.getElementById('btnClearTypes'),

    // Generation Mode & Controls
    genModeCount: document.getElementById('genModeCount'),
    genModeMarks: document.getElementById('genModeMarks'),
    labelModeCount: document.getElementById('labelModeCount'),
    labelModeMarks: document.getElementById('labelModeMarks'),
    countModeContainer: document.getElementById('countModeContainer'),
    marksModeContainer: document.getElementById('marksModeContainer'),
    targetMarksInput: document.getElementById('targetMarksInput'),
    marksCurrentAvailable: document.getElementById('marksCurrentAvailable'),
    marksTargetGoal: document.getElementById('marksTargetGoal'),
    marksLiveCounter: document.getElementById('marksLiveCounter'),

    questionCount: document.getElementById('questionCount'),
    difficultySelect: document.getElementById('difficultySelect'),
    durationMinutes: document.getElementById('durationMinutes'),
    availabilityNotice: document.getElementById('availabilityNotice'),
    btnGeneratePaper: document.getElementById('btnGeneratePaper'),

    // Paper Preview & Actions
    paperActionBar: document.getElementById('paperActionBar'),
    paperCanvas: document.getElementById('paperCanvas'),
    btnPrintPaper: document.getElementById('btnPrintPaper'),
    btnPrintKey: document.getElementById('btnPrintKey'),
    btnToggleAnswers: document.getElementById('btnToggleAnswers'),
    toggleAnswersText: document.getElementById('toggleAnswersText'),
    btnShufflePaper: document.getElementById('btnShufflePaper'),
    btnSavePaper: document.getElementById('btnSavePaper'),
    btnGradePaper: document.getElementById('btnGradePaper'),

    // Students Directory
    studentCardsContainer: document.getElementById('studentCardsContainer'),
    btnOpenAddStudentModal: document.getElementById('btnOpenAddStudentModal'),
    studentModal: document.getElementById('studentModal'),
    studentModalTitle: document.getElementById('studentModalTitle'),
    studentModalId: document.getElementById('studentModalId'),
    studentModalName: document.getElementById('studentModalName'),
    studentModalGrade: document.getElementById('studentModalGrade'),
    subMath: document.getElementById('subMath'),
    subSci: document.getElementById('subSci'),
    subEng: document.getElementById('subEng'),
    subSst: document.getElementById('subSst'),
    btnCloseStudentModal: document.getElementById('btnCloseStudentModal'),
    btnCancelStudentModal: document.getElementById('btnCancelStudentModal'),
    btnSaveStudentModal: document.getElementById('btnSaveStudentModal'),

    // Question Bank View
    qbSearchInput: document.getElementById('qbSearchInput'),
    qbGradeFilter: document.getElementById('qbGradeFilter'),
    qbSubjectFilter: document.getElementById('qbSubjectFilter'),
    qbTopicFilter: document.getElementById('qbTopicFilter'),
    qbTypeFilter: document.getElementById('qbTypeFilter'),
    qbMatchCount: document.getElementById('qbMatchCount'),
    qbTableBody: document.getElementById('qbTableBody'),
    btnOpenAddQuestionModal: document.getElementById('btnOpenAddQuestionModal'),
    questionModal: document.getElementById('questionModal'),
    qModalGrade: document.getElementById('qModalGrade'),
    qModalSubject: document.getElementById('qModalSubject'),
    qModalTopic: document.getElementById('qModalTopic'),
    qModalDifficulty: document.getElementById('qModalDifficulty'),
    qModalType: document.getElementById('qModalType'),
    qModalText: document.getElementById('qModalText'),
    qModalMcqOptions: document.getElementById('qModalMcqOptions'),
    qOptA: document.getElementById('qOptA'),
    qOptB: document.getElementById('qOptB'),
    qOptC: document.getElementById('qOptC'),
    qOptD: document.getElementById('qOptD'),
    qModalAnswer: document.getElementById('qModalAnswer'),
    qModalExplanation: document.getElementById('qModalExplanation'),
    btnCloseQuestionModal: document.getElementById('btnCloseQuestionModal'),
    btnCancelQuestionModal: document.getElementById('btnCancelQuestionModal'),
    btnSaveQuestionModal: document.getElementById('btnSaveQuestionModal'),

    // Saved Papers View
    savedPapersTableBody: document.getElementById('savedPapersTableBody'),

    // Grading Modal
    gradeModal: document.getElementById('gradeModal'),
    gradeModalSubtitle: document.getElementById('gradeModalSubtitle'),
    gradeQuestionsList: document.getElementById('gradeQuestionsList'),
    gradeCalculatedScore: document.getElementById('gradeCalculatedScore'),
    btnCloseGradeModal: document.getElementById('btnCloseGradeModal'),
    btnCancelGradeModal: document.getElementById('btnCancelGradeModal'),
    btnSubmitGradeModal: document.getElementById('btnSubmitGradeModal'),

    // Data Management
    btnExportData: document.getElementById('btnExportData'),
    importFileInput: document.getElementById('importFileInput'),
    btnReseedBank: document.getElementById('btnReseedBank'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),
  };

  // ----------------------------------------------------
  // INITIALIZATION & SAMPLE DATA
  // ----------------------------------------------------
  function initData() {
    if (window.QuestionBank && typeof window.QuestionBank.seed === 'function') {
      window.QuestionBank.seed();
    }

    // Seed realistic sample students if empty
    const students = Store.getStudents();
    if (!students || students.length === 0) {
      const s1 = Store.addStudent({
        name: 'Aarav Sharma',
        grade: 8,
        subjects: ['Mathematics', 'Science'],
      });
      Store.addStudent({
        name: 'Diya Patel',
        grade: 10,
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
      });
      Store.addStudent({
        name: 'Rohan Verma',
        grade: 6,
        subjects: ['Mathematics', 'Science'],
      });

      // Sample past test for Aarav to demonstrate analytics & weak topics
      const sampleDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
      const samplePaper = {
        id: 'sample_paper_aarav',
        title: 'Diagnostic Test - Science',
        studentId: s1.id,
        studentName: s1.name,
        grade: 8,
        subject: 'Science',
        date: sampleDate,
        duration: 30,
        totalMarks: 10,
        requestedCount: 5,
        questions: [
          { id: 'sq1', grade: 8, subject: 'Science', topic: 'Cell Structure', type: 'mcq', marks: 1, text: 'Cell powerhouse?', answer: 'Mitochondria', explanation: 'ATP synthesis' },
          { id: 'sq2', grade: 8, subject: 'Science', topic: 'Cell Structure', type: 'mcq', marks: 1, text: 'Controls cell activities?', answer: 'Nucleus', explanation: 'Brain of cell' },
          { id: 'sq3', grade: 8, subject: 'Science', topic: 'Force & Pressure', type: 'mcq', marks: 1, text: 'SI unit of force?', answer: 'Newton', explanation: 'Unit N' },
          { id: 'sq4', grade: 8, subject: 'Science', topic: 'Force & Pressure', type: 'short', marks: 2, text: 'Define atmospheric pressure.', answer: 'Pressure by atmosphere', explanation: 'Weight of air' },
          { id: 'sq5', grade: 8, subject: 'Science', topic: 'Cell Structure', type: 'short', marks: 2, text: 'Plant vs animal cell difference.', answer: 'Plant has cell wall', explanation: 'Cell wall and chloroplast' },
        ],
      };
      Store.savePaper(samplePaper);

      // Past result with weak Cell Structure
      Store.saveResult({
        paperId: samplePaper.id,
        studentId: s1.id,
        subject: 'Science',
        grade: 8,
        date: sampleDate,
        score: 3,
        total: 7,
        topicScores: {
          'Cell Structure': { correct: 1, total: 4 }, // 25% => Weak
          'Force & Pressure': { correct: 2, total: 3 }, // 67%
        },
      });
    }

    populateStudentDropdown();
    populateTopics();
    updateAvailabilityNotice();
    renderStudentsTab();
    renderQuestionBankTab();
    renderSavedPapersTab();
  }

  // ----------------------------------------------------
  // TOAST NOTIFICATIONS
  // ----------------------------------------------------
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ----------------------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------------------
  DOM.navTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-tab-btn');
    if (!btn) return;
    const targetTabId = btn.dataset.tab;
    switchTab(targetTabId);
  });

  function switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });
    DOM.tabViews.forEach((view) => {
      view.classList.toggle('active', view.id === tabId);
    });

    if (tabId === 'tab-students') renderStudentsTab();
    if (tabId === 'tab-questions') renderQuestionBankTab();
    if (tabId === 'tab-papers') renderSavedPapersTab();
    if (tabId === 'tab-builder') updateAvailabilityNotice();
  }

  // ----------------------------------------------------
  // BUILDER: POPULATE STUDENT DROPDOWN & WEAK AREA HINT
  // ----------------------------------------------------
  function populateStudentDropdown(selectedStudentId = '') {
    const students = Store.getStudents();
    DOM.studentCountBadge.textContent = `${students.length} student${students.length === 1 ? '' : 's'}`;

    const currentVal = selectedStudentId || DOM.studentSelect.value;
    DOM.studentSelect.innerHTML = `<option value="">-- Generic Paper (No Student) --</option>`;

    students.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (Grade ${s.grade})`;
      DOM.studentSelect.appendChild(opt);
    });

    if (currentVal && students.some((s) => s.id === currentVal)) {
      DOM.studentSelect.value = currentVal;
    }
    updateStudentContext();
  }

  DOM.studentSelect.addEventListener('change', () => {
    updateStudentContext();
  });

  function updateStudentContext() {
    const studentId = DOM.studentSelect.value;
    DOM.studentWeakNotice.style.display = 'none';

    if (!studentId) {
      updateAvailabilityNotice();
      return;
    }

    const student = Store.getStudent(studentId);
    if (!student) return;

    if (student.grade) {
      DOM.gradeSelect.value = String(student.grade);
    }

    populateTopics();

    const subject = DOM.subjectSelect.value;
    const weakTopics = Store.getWeakTopics(studentId, subject);

    if (weakTopics && weakTopics.length > 0) {
      const firstWeak = weakTopics[0];
      DOM.weakNoticeText.textContent = `🎯 Focus suggestion: ${student.name} scored ${firstWeak.avgScore}% in "${firstWeak.topic}"`;
      DOM.studentWeakNotice.style.display = 'flex';
      DOM.btnApplyWeakTopics.onclick = () => {
        document.querySelectorAll('.topic-item input').forEach((chk) => {
          chk.checked = chk.value === firstWeak.topic;
        });
        updateSelectedTopics();
        showToast(`Targeted weak topic: ${firstWeak.topic}`, 'info');
      };
    }

    updateAvailabilityNotice();
  }

  // ----------------------------------------------------
  // BUILDER: DYNAMIC TOPICS SELECTION
  // ----------------------------------------------------
  function populateTopics() {
    const grade = Number(DOM.gradeSelect.value);
    const subject = DOM.subjectSelect.value;
    const allQuestions = Store.getQuestions({ grade, subject });
    let topics = Store.getTopicsForSubject(grade, subject);

    if (!topics || topics.length === 0) {
      if (window.QuestionBank && typeof window.QuestionBank.getCurriculumTopics === 'function') {
        topics = window.QuestionBank.getCurriculumTopics(grade, subject);
      }
    }

    DOM.topicsContainer.innerHTML = '';
    state.selectedTopics.clear();

    if (!topics || topics.length === 0) {
      DOM.topicsContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem; text-align: center;">No topics defined for Grade ${grade} ${subject}.</div>`;
      updateAvailabilityNotice();
      return;
    }

    topics.forEach((topic) => {
      const count = allQuestions.filter((q) => q.topic === topic).length;
      state.selectedTopics.add(topic);

      const label = document.createElement('label');
      label.className = 'topic-item';
      const badgeHtml = count > 0
        ? `<span class="topic-count">${count} Qs</span>`
        : `<span class="topic-count coming-soon">Coming Soon</span>`;

      label.innerHTML = `
        <div style="display:flex; align-items:center;">
          <input type="checkbox" value="${escapeHtml(topic)}" checked />
          <span>${escapeHtml(topic)}</span>
        </div>
        ${badgeHtml}
      `;

      label.querySelector('input').addEventListener('change', updateSelectedTopics);
      DOM.topicsContainer.appendChild(label);
    });

    updateDefaultPaperTitle();
    updateAvailabilityNotice();
  }

  function updateSelectedTopics() {
    state.selectedTopics.clear();
    DOM.topicsContainer.querySelectorAll('input:checked').forEach((input) => {
      state.selectedTopics.add(input.value);
    });
    updateAvailabilityNotice();
  }

  DOM.btnSelectAllTopics.addEventListener('click', () => {
    DOM.topicsContainer.querySelectorAll('input').forEach((input) => {
      input.checked = true;
    });
    updateSelectedTopics();
  });

  DOM.btnClearTopics.addEventListener('click', () => {
    DOM.topicsContainer.querySelectorAll('input').forEach((input) => {
      input.checked = false;
    });
    updateSelectedTopics();
  });

  // ----------------------------------------------------
  // QUESTION TYPES MULTI-CHECKBOX SELECTOR
  // ----------------------------------------------------
  if (DOM.qtypesContainer) {
    DOM.qtypesContainer.querySelectorAll('input[name="qType"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        updateSelectedTypes();
      });
    });
  }

  function updateSelectedTypes() {
    state.selectedTypes.clear();
    DOM.qtypesContainer.querySelectorAll('input[name="qType"]:checked').forEach((input) => {
      state.selectedTypes.add(input.value);
    });
    updateAvailabilityNotice();
  }

  DOM.btnSelectAllTypes.addEventListener('click', () => {
    DOM.qtypesContainer.querySelectorAll('input[name="qType"]').forEach((input) => {
      input.checked = true;
    });
    updateSelectedTypes();
  });

  DOM.btnClearTypes.addEventListener('click', () => {
    DOM.qtypesContainer.querySelectorAll('input[name="qType"]').forEach((input) => {
      input.checked = false;
    });
    updateSelectedTypes();
  });

  // ----------------------------------------------------
  // GENERATION MODE TOGGLE (QUESTIONS VS MARKS)
  // ----------------------------------------------------
  if (DOM.genModeCount) {
    DOM.genModeCount.addEventListener('change', () => {
      state.genMode = 'count';
      DOM.labelModeCount.classList.add('active');
      DOM.labelModeMarks.classList.remove('active');
      DOM.countModeContainer.style.display = 'block';
      DOM.marksModeContainer.style.display = 'none';
      updateAvailabilityNotice();
    });
  }

  if (DOM.genModeMarks) {
    DOM.genModeMarks.addEventListener('change', () => {
      state.genMode = 'marks';
      DOM.labelModeCount.classList.remove('active');
      DOM.labelModeMarks.classList.add('active');
      DOM.countModeContainer.style.display = 'none';
      DOM.marksModeContainer.style.display = 'block';
      updateAvailabilityNotice();
    });
  }

  // Preset Marks Buttons Handler (20, 25, 50 marks)
  document.querySelectorAll('.btn-preset-mark').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset-mark').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const val = Math.min(50, Number(btn.dataset.marks) || 25);
      DOM.targetMarksInput.value = val;
      state.targetMarks = val;
      if (DOM.marksTargetGoal) DOM.marksTargetGoal.textContent = val;
      updateAvailabilityNotice();
    });
  });

  if (DOM.targetMarksInput) {
    DOM.targetMarksInput.addEventListener('input', () => {
      let val = Number(DOM.targetMarksInput.value) || 0;
      if (val > 50) {
        val = 50;
        DOM.targetMarksInput.value = 50;
      }
      state.targetMarks = val;
      if (DOM.marksTargetGoal) DOM.marksTargetGoal.textContent = val;
      document.querySelectorAll('.btn-preset-mark').forEach((b) => {
        b.classList.toggle('active', Number(b.dataset.marks) === val);
      });
      updateAvailabilityNotice();
    });
  }

  // ----------------------------------------------------
  // QUESTION AVAILABILITY CHECK & LIVE WARNING
  // ----------------------------------------------------
  function calculateAvailableQuestions() {
    const grade = Number(DOM.gradeSelect.value);
    const subject = DOM.subjectSelect.value;
    const selectedTopicsArr = Array.from(state.selectedTopics);
    const selectedTypesArr = Array.from(state.selectedTypes);
    const difficultyPreference = DOM.difficultySelect.value;

    if (selectedTopicsArr.length === 0 || selectedTypesArr.length === 0) {
      return [];
    }

    let pool = Store.getQuestions({ grade, subject }).filter(
      (q) => selectedTopicsArr.includes(q.topic) && selectedTypesArr.includes(q.type)
    );

    if (difficultyPreference !== 'balanced') {
      const level = Number(difficultyPreference);
      pool = pool.filter((q) => q.difficulty === level);
    }

    return pool;
  }

  function updateAvailabilityNotice() {
    const pool = calculateAvailableQuestions();
    const count = pool.length;
    const poolTotalMarks = pool.reduce((sum, q) => sum + (q.type === 'long' ? 5 : q.type === 'short' ? 2 : 1), 0);

    // Update live marks counter values
    if (DOM.marksCurrentAvailable) DOM.marksCurrentAvailable.textContent = poolTotalMarks;
    const currentTargetMarks = Number(DOM.targetMarksInput ? DOM.targetMarksInput.value : 25) || 25;
    if (DOM.marksTargetGoal) DOM.marksTargetGoal.textContent = currentTargetMarks;

    if (state.selectedTopics.size === 0) {
      DOM.availabilityNotice.className = 'availability-notice error';
      DOM.availabilityNotice.innerHTML = `<span>⚠️</span><span>No topics selected. Please select at least one topic.</span>`;
      DOM.availabilityNotice.style.display = 'flex';
      return;
    }

    if (state.selectedTypes.size === 0) {
      DOM.availabilityNotice.className = 'availability-notice error';
      DOM.availabilityNotice.innerHTML = `<span>⚠️</span><span>No question types selected. Please check at least one question type.</span>`;
      DOM.availabilityNotice.style.display = 'flex';
      return;
    }

    if (count === 0) {
      DOM.availabilityNotice.className = 'availability-notice error';
      DOM.availabilityNotice.innerHTML = `<span>❌</span><span><strong>0 questions available</strong> in bank matching these filters. Try selecting more topics or question types.</span>`;
      DOM.availabilityNotice.style.display = 'flex';
      return;
    }

    if (state.genMode === 'count') {
      const requestedCount = Number(DOM.questionCount.value) || 5;
      if (count < requestedCount) {
        DOM.availabilityNotice.className = 'availability-notice warning';
        DOM.availabilityNotice.innerHTML = `<span>⚠️</span><span><strong>Only ${count} question${count === 1 ? '' : 's'} available</strong> for this filter combination (requested ${requestedCount}).</span>`;
        DOM.availabilityNotice.style.display = 'flex';
      } else {
        DOM.availabilityNotice.className = 'availability-notice success';
        DOM.availabilityNotice.innerHTML = `<span>✓</span><span><strong>${count} questions available</strong> matching your criteria (${requestedCount} requested).</span>`;
        DOM.availabilityNotice.style.display = 'flex';
      }
    } else {
      // Marks mode
      if (poolTotalMarks < currentTargetMarks) {
        DOM.availabilityNotice.className = 'availability-notice warning';
        DOM.availabilityNotice.innerHTML = `<span>⚠️</span><span><strong>Only ${poolTotalMarks} marks available</strong> for this combination (target: ${currentTargetMarks} marks).</span>`;
        DOM.availabilityNotice.style.display = 'flex';
      } else {
        DOM.availabilityNotice.className = 'availability-notice success';
        DOM.availabilityNotice.innerHTML = `<span>✓</span><span><strong>${poolTotalMarks} marks available</strong> in question bank (target: ${currentTargetMarks} marks across ${count} questions).</span>`;
        DOM.availabilityNotice.style.display = 'flex';
      }
    }
  }

  DOM.gradeSelect.addEventListener('change', () => {
    populateTopics();
    updateStudentContext();
    updateDefaultPaperTitle();
  });

  DOM.subjectSelect.addEventListener('change', () => {
    populateTopics();
    updateStudentContext();
    updateDefaultPaperTitle();
  });

  DOM.questionCount.addEventListener('change', updateAvailabilityNotice);
  DOM.difficultySelect.addEventListener('change', updateAvailabilityNotice);

  function updateDefaultPaperTitle() {
    const grade = DOM.gradeSelect.value;
    const subject = DOM.subjectSelect.value;
    DOM.paperTitle.value = `Grade ${grade} ${subject} Practice Assessment`;
  }

  // ----------------------------------------------------
  // PAPER GENERATION LOGIC (QUESTIONS VS MARKS)
  // ----------------------------------------------------
  DOM.btnGeneratePaper.addEventListener('click', () => {
    generatePaper();
  });

  DOM.btnShufflePaper.addEventListener('click', () => {
    generatePaper();
    showToast('Questions re-shuffled!', 'info');
  });

  function generatePaper() {
    const studentId = DOM.studentSelect.value;
    const student = studentId ? Store.getStudent(studentId) : null;
    const studentName = student ? student.name : '';
    const grade = Number(DOM.gradeSelect.value);
    const subject = DOM.subjectSelect.value;
    const title = DOM.paperTitle.value.trim() || `Grade ${grade} ${subject} Worksheet`;
    const difficultyPreference = DOM.difficultySelect.value; // 'balanced', '1', '2', '3'
    const duration = Number(DOM.durationMinutes.value) || 30;

    if (state.selectedTopics.size === 0) {
      showToast('Please select at least one topic from the list.', 'error');
      return;
    }

    if (state.selectedTypes.size === 0) {
      showToast('Please select at least one question type (MCQ, Short, True/False, etc.).', 'error');
      return;
    }

    // Get candidate questions from store
    const selectedTopicsArr = Array.from(state.selectedTopics);
    const selectedTypesArr = Array.from(state.selectedTypes);

    let pool = Store.getQuestions({ grade, subject }).filter(
      (q) => selectedTopicsArr.includes(q.topic) && selectedTypesArr.includes(q.type)
    );

    if (pool.length === 0) {
      showToast('No matching questions found in question bank for this combination. Please select more topics or question types.', 'error');
      return;
    }

    function shuffle(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    let selectedQuestions = [];
    let warningNotice = null;

    if (state.genMode === 'count') {
      const targetCount = Number(DOM.questionCount.value) || 5;

      if (pool.length < targetCount) {
        warningNotice = `Only ${pool.length} question${pool.length === 1 ? '' : 's'} available in the bank for this filter combination (requested ${targetCount}). Generated all ${pool.length} available question${pool.length === 1 ? '' : 's'}.`;
        showToast(`⚠️ Only ${pool.length} questions available (requested ${targetCount}). Included all available.`, 'error');
        selectedQuestions = shuffle(pool);
      } else {
        if (difficultyPreference === 'balanced') {
          const easy = shuffle(pool.filter((q) => q.difficulty === 1));
          const medium = shuffle(pool.filter((q) => q.difficulty === 2));
          const hard = shuffle(pool.filter((q) => q.difficulty === 3));

          const countEasy = Math.round(targetCount * 0.4);
          const countMed = Math.round(targetCount * 0.4);
          const countHard = targetCount - countEasy - countMed;

          selectedQuestions.push(...easy.slice(0, countEasy));
          selectedQuestions.push(...medium.slice(0, countMed));
          selectedQuestions.push(...hard.slice(0, countHard));

          if (selectedQuestions.length < targetCount) {
            const pickedIds = new Set(selectedQuestions.map((q) => q.id));
            const remaining = shuffle(pool.filter((q) => !pickedIds.has(q.id)));
            const deficit = targetCount - selectedQuestions.length;
            selectedQuestions.push(...remaining.slice(0, deficit));
          }
        } else {
          const level = Number(difficultyPreference);
          const exactDifficulty = shuffle(pool.filter((q) => q.difficulty === level));
          selectedQuestions.push(...exactDifficulty.slice(0, targetCount));

          if (selectedQuestions.length < targetCount) {
            const pickedIds = new Set(selectedQuestions.map((q) => q.id));
            const others = shuffle(pool.filter((q) => !pickedIds.has(q.id)));
            const deficit = targetCount - selectedQuestions.length;
            selectedQuestions.push(...others.slice(0, deficit));
          }
        }
      }
    } else {
      // GENERATE BY TOTAL MARKS (Max 50 M)
      const targetMarks = Math.min(50, Math.max(5, Number(DOM.targetMarksInput.value) || 25));
      const poolTotalMarks = pool.reduce((sum, q) => sum + (q.type === 'long' ? 5 : q.type === 'short' ? 2 : 1), 0);

      if (poolTotalMarks < targetMarks) {
        warningNotice = `Only ${poolTotalMarks} marks available for this combination (target: ${targetMarks} marks). Generated all available questions (${poolTotalMarks} marks).`;
        showToast(`⚠️ Only ${poolTotalMarks} marks available for this combination (target: ${targetMarks} marks).`, 'error');
        selectedQuestions = shuffle(pool);
      } else {
        // Pick questions across selected topics and question types until hitting or slightly exceeding target marks
        let currentMarks = 0;
        const pickedQuestions = [];
        const pickedIds = new Set();

        let candidates = shuffle(pool);
        if (difficultyPreference !== 'balanced') {
          const level = Number(difficultyPreference);
          candidates.sort((a, b) => (a.difficulty === level ? -1 : 1));
        }

        // Partition candidates by topic to ensure topic variety
        const topicQueues = {};
        selectedTopicsArr.forEach((t) => (topicQueues[t] = []));
        candidates.forEach((q) => {
          if (topicQueues[q.topic]) topicQueues[q.topic].push(q);
        });

        // Round-robin selection across topics
        let addedInRound = true;
        while (currentMarks < targetMarks && addedInRound) {
          addedInRound = false;
          for (const topic of selectedTopicsArr) {
            if (currentMarks >= targetMarks) break;
            const queue = topicQueues[topic];
            if (queue && queue.length > 0) {
              const q = queue.shift();
              const qMarks = q.type === 'long' ? 5 : q.type === 'short' ? 2 : 1;
              pickedQuestions.push(q);
              pickedIds.add(q.id);
              currentMarks += qMarks;
              addedInRound = true;
            }
          }
        }

        // If still under target marks, draw remaining candidate questions
        if (currentMarks < targetMarks) {
          for (const q of candidates) {
            if (!pickedIds.has(q.id)) {
              const qMarks = q.type === 'long' ? 5 : q.type === 'short' ? 2 : 1;
              pickedQuestions.push(q);
              pickedIds.add(q.id);
              currentMarks += qMarks;
              if (currentMarks >= targetMarks) break;
            }
          }
        }

        selectedQuestions = pickedQuestions;
      }
    }

    // Sort questions in logical exam section sequence:
    // 1. mcq, 2. assertion_reason, 3. fill_blank, 4. true_false, 5. short, 6. long
    const typeOrder = {
      mcq: 1,
      assertion_reason: 2,
      fill_blank: 3,
      true_false: 4,
      short: 5,
      long: 6,
    };

    selectedQuestions.sort((a, b) => {
      const orderA = typeOrder[a.type] || 99;
      const orderB = typeOrder[b.type] || 99;
      return orderA - orderB;
    });

    // Assign marks according to type:
    // mcq: 1, fill_blank: 1, true_false: 1, assertion_reason: 1, short: 2, long: 5
    let totalMarks = 0;
    selectedQuestions.forEach((q) => {
      if (q.type === 'long') q.marks = 5;
      else if (q.type === 'short') q.marks = 2;
      else q.marks = 1;
      totalMarks += q.marks;
    });

    const paperId = 'paper_' + Date.now().toString(36);
    const paper = {
      id: paperId,
      title,
      studentId: studentId || null,
      studentName: studentName || 'Student Name',
      grade,
      subject,
      date: new Date().toISOString().split('T')[0],
      duration,
      totalMarks,
      genMode: state.genMode,
      targetMarks: state.genMode === 'marks' ? Number(DOM.targetMarksInput.value) || 25 : null,
      requestedCount: state.genMode === 'count' ? Number(DOM.questionCount.value) || 5 : selectedQuestions.length,
      warningNotice,
      questions: selectedQuestions,
    };

    state.currentPaper = paper;
    state.showAnswersOnScreen = false;
    updateToggleAnswersButton();

    renderPaper(paper);
    DOM.paperActionBar.style.display = 'flex';
    if (!warningNotice) {
      showToast(`Generated paper with ${selectedQuestions.length} questions (${totalMarks} Marks)`, 'success');
    }
  }

  // ----------------------------------------------------
  // RENDER PRINTABLE EXAM PAPER
  // ----------------------------------------------------
  function renderPaper(paper) {
    const dateFormatted = new Date(paper.date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let questionIndexCounter = 1;

    let html = `
      <div class="paper-sheet" id="printContent">
    `;

    // Show warning notice if paper had fewer questions/marks than requested
    if (paper.warningNotice) {
      html += `
        <div class="paper-warning-notice no-print">
          <span>⚠️</span>
          <span>${escapeHtml(paper.warningNotice)}</span>
        </div>
      `;
    }

    html += `
        <!-- Examination Header Box -->
        <div class="paper-sheet-header">
          <div class="paper-institute-title">TUTOR PRACTICE ASSESSMENT</div>
          <div class="paper-test-title">${escapeHtml(paper.title)}</div>
          
          <div class="paper-meta-grid">
            <div class="paper-meta-item"><strong>Student:</strong> ${escapeHtml(paper.studentName || '__________________')}</div>
            <div class="paper-meta-item"><strong>Class:</strong> Grade ${paper.grade} &bull; ${escapeHtml(paper.subject)}</div>
            <div class="paper-meta-item"><strong>Time:</strong> ${paper.duration} Minutes</div>
            <div class="paper-meta-item"><strong>Max Marks:</strong> ${paper.totalMarks}</div>
            <div class="paper-meta-item"><strong>Date:</strong> ${dateFormatted}</div>
            <div class="paper-meta-item"><strong>Roll No:</strong> ____________</div>
            <div class="paper-meta-item"><strong>Score:</strong> _____ / ${paper.totalMarks}</div>
            <div class="paper-meta-item"><strong>Sign:</strong> ____________</div>
          </div>
        </div>

        <div class="paper-instructions">
          <strong>General Instructions:</strong> All questions are compulsory. Read questions carefully before answering. Write legibly in the designated spaces. Marks for each question are indicated in brackets.
        </div>
    `;

    // Group questions by type to form neat exam sections:
    const sections = [
      { key: 'mcq', title: 'SECTION A — MULTIPLE CHOICE QUESTIONS (1 Mark Each)', mark: 1 },
      { key: 'assertion_reason', title: 'SECTION B — ASSERTION & REASONING (1 Mark Each)', mark: 1 },
      { key: 'fill_blank', title: 'SECTION C — FILL IN THE BLANKS (1 Mark Each)', mark: 1 },
      { key: 'true_false', title: 'SECTION D — TRUE OR FALSE STATEMENTS (1 Mark Each)', mark: 1 },
      { key: 'short', title: 'SECTION E — SHORT ANSWER QUESTIONS (2 Marks Each)', mark: 2 },
      { key: 'long', title: 'SECTION F — LONG ANSWER QUESTIONS (5 Marks Each)', mark: 5 },
    ];

    sections.forEach((sec) => {
      const secQuestions = paper.questions.filter((q) => q.type === sec.key);
      if (secQuestions.length === 0) return;

      html += `<div class="paper-section-title">${sec.title}</div>`;

      secQuestions.forEach((q) => {
        const qNum = questionIndexCounter++;
        html += renderQuestionItem(q, qNum);
      });
    });

    html += `
        <div class="paper-footer-line">
          *** END OF EXAMINATION PAPER ***
        </div>
      </div>
    `;

    DOM.paperCanvas.innerHTML = html;
  }

  function renderQuestionItem(q, qNum) {
    let specificHtml = '';

    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      const letters = ['A', 'B', 'C', 'D'];
      specificHtml = `
        <div class="mcq-grid">
          ${q.options
            .map(
              (opt, idx) => `
            <div class="mcq-option">
              <span class="opt-circle">${letters[idx]}</span>
              <span>${escapeHtml(opt)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (q.type === 'assertion_reason') {
      const lines = q.text.split('\n');
      let assertionLine = lines[0] || q.text;
      let reasonLine = lines[1] || '';

      const letters = ['A', 'B', 'C', 'D'];
      const defaultArOpts = (window.QuestionBank && window.QuestionBank.arOptions) || [
        'Both (A) and (R) are true and (R) is the correct explanation of (A)',
        'Both (A) and (R) are true but (R) is not the correct explanation of (A)',
        '(A) is true but (R) is false',
        '(A) is false but (R) is true'
      ];

      specificHtml = `
        <div class="ar-box">
          <div class="ar-line">${escapeHtml(assertionLine)}</div>
          ${reasonLine ? `<div class="ar-line">${escapeHtml(reasonLine)}</div>` : ''}
        </div>
        <div class="mcq-grid" style="margin-top: 0.4rem;">
          ${defaultArOpts.map((opt, idx) => `
            <div class="mcq-option" style="font-size: 0.84rem;">
              <span class="opt-circle">${letters[idx]}</span>
              <span>(${letters[idx]}) ${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'fill_blank') {
      specificHtml = `
        <div style="margin-left: 2rem; margin-top: 0.4rem;">
          <div class="answer-line" style="height: 24px; max-width: 320px; border-bottom: 1.5px solid #64748b;"></div>
        </div>
      `;
    } else if (q.type === 'true_false') {
      specificHtml = `
        <div class="tf-choice-box">
          <span class="tf-opt"><span class="tf-box-mark"></span> [ True ]</span>
          <span class="tf-opt"><span class="tf-box-mark"></span> [ False ]</span>
        </div>
      `;
    } else if (q.type === 'short') {
      specificHtml = `
        <div class="answer-ruled-lines">
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </div>
      `;
    } else if (q.type === 'long') {
      specificHtml = `
        <div class="long-answer-lines">
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </div>
      `;
    }

    // Solution block for Answer Key printing / teacher toggle
    const solutionHtml = `
      <div class="solution-box ${state.showAnswersOnScreen ? 'visible' : ''}">
        <div><strong>Correct Answer:</strong> ${escapeHtml(q.answer)}</div>
        ${q.explanation ? `<div style="margin-top: 3px;"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>` : ''}
      </div>
    `;

    return `
      <div class="paper-question-item">
        <div class="question-header-row">
          <span class="question-number">Q${qNum}.</span>
          <span class="question-text">${escapeHtml(q.text.split('\n')[0])}</span>
          <span class="question-mark-badge">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
        </div>
        ${specificHtml}
        ${solutionHtml}
      </div>
    `;
  }

  // ----------------------------------------------------
  // PAPER ACTIONS (PRINT, ANSWER KEY, SAVE, GRADE)
  // ----------------------------------------------------
  DOM.btnPrintPaper.addEventListener('click', () => {
    document.body.classList.remove('printing-answer-key');
    window.print();
  });

  DOM.btnPrintKey.addEventListener('click', () => {
    document.body.classList.add('printing-answer-key');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-answer-key');
    }, 1000);
  });

  DOM.btnToggleAnswers.addEventListener('click', () => {
    state.showAnswersOnScreen = !state.showAnswersOnScreen;
    updateToggleAnswersButton();
    document.querySelectorAll('.solution-box').forEach((box) => {
      box.classList.toggle('visible', state.showAnswersOnScreen);
    });
  });

  function updateToggleAnswersButton() {
    if (state.showAnswersOnScreen) {
      DOM.toggleAnswersText.textContent = '🙈 Hide Answers';
    } else {
      DOM.toggleAnswersText.textContent = '👁️ Show Answers';
    }
  }

  DOM.btnSavePaper.addEventListener('click', () => {
    if (!state.currentPaper) return;
    Store.savePaper(state.currentPaper);
    showToast('Paper saved successfully to records!', 'success');
  });

  DOM.btnGradePaper.addEventListener('click', () => {
    if (!state.currentPaper) return;
    openGradeModal(state.currentPaper);
  });

  // ----------------------------------------------------
  // MODAL: GRADING PRACTICE PAPER
  // ----------------------------------------------------
  function openGradeModal(paper) {
    DOM.gradeModalSubtitle.textContent = `Grading: ${paper.title} &bull; ${paper.studentName || 'Student'}`;
    DOM.gradeQuestionsList.innerHTML = '';

    const typeNames = {
      mcq: 'MCQ (1M)',
      assertion_reason: 'A-R (1M)',
      fill_blank: 'Fill Blank (1M)',
      true_false: 'T/F (1M)',
      short: 'Short (2M)',
      long: 'Long (5M)',
    };

    paper.questions.forEach((q, idx) => {
      const row = document.createElement('div');
      row.className = 'grading-q-row';
      row.innerHTML = `
        <div style="flex: 1; padding-right: 1rem;">
          <span style="font-weight: 600;">Q${idx + 1} [${typeNames[q.type] || q.type}] (${q.topic}):</span> ${escapeHtml(q.text.substring(0, 80))}${q.text.length > 80 ? '...' : ''}
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
            Correct Answer: <strong style="color: #166534;">${escapeHtml(q.answer)}</strong> &bull; [${q.marks} Mark${q.marks > 1 ? 's' : ''}]
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 600; color: #15803d;">
            <input type="checkbox" class="grade-chk" data-marks="${q.marks}" data-topic="${escapeHtml(q.topic)}" checked /> Correct
          </label>
        </div>
      `;
      DOM.gradeQuestionsList.appendChild(row);
    });

    function recalcGrade() {
      let earned = 0;
      let total = paper.totalMarks;
      document.querySelectorAll('.grade-chk').forEach((chk) => {
        if (chk.checked) earned += Number(chk.dataset.marks);
      });
      DOM.gradeCalculatedScore.textContent = `${earned} / ${total} (${Math.round((earned / total) * 100)}%)`;
      return { earned, total };
    }

    document.querySelectorAll('.grade-chk').forEach((chk) => {
      chk.addEventListener('change', recalcGrade);
    });

    recalcGrade();
    DOM.gradeModal.classList.add('active');

    DOM.btnSubmitGradeModal.onclick = () => {
      const { earned, total } = recalcGrade();

      const topicScores = {};
      document.querySelectorAll('.grade-chk').forEach((chk) => {
        const topic = chk.dataset.topic;
        const marks = Number(chk.dataset.marks);
        if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
        topicScores[topic].total += marks;
        if (chk.checked) topicScores[topic].correct += marks;
      });

      Store.saveResult({
        paperId: paper.id,
        studentId: paper.studentId,
        subject: paper.subject,
        grade: paper.grade,
        date: new Date().toISOString().split('T')[0],
        score: earned,
        total: total,
        topicScores,
      });

      // Mark paper graded in store
      paper.isGraded = true;
      paper.score = earned;
      Store.savePaper(paper);

      DOM.gradeModal.classList.remove('active');
      showToast(`Grading saved: ${earned} / ${total} Marks!`, 'success');
      renderStudentsTab();
      renderSavedPapersTab();
    };
  }

  DOM.btnCloseGradeModal.addEventListener('click', () => DOM.gradeModal.classList.remove('active'));
  DOM.btnCancelGradeModal.addEventListener('click', () => DOM.gradeModal.classList.remove('active'));

  // ----------------------------------------------------
  // STUDENTS TAB & PROGRESS TRACKING
  // ----------------------------------------------------
  function renderStudentsTab() {
    const students = Store.getStudents();
    DOM.studentCardsContainer.innerHTML = '';

    if (students.length === 0) {
      DOM.studentCardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-lg); color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👨‍🎓</div>
          <h3>No student profiles found</h3>
          <p>Add students to track weak topics, paper history, and test performance.</p>
        </div>
      `;
      return;
    }

    students.forEach((student) => {
      const perf = Store.getStudentPerformance(student.id);
      const weakTopics = Store.getWeakTopics(student.id);
      const strongTopics = Store.getStrongTopics(student.id);
      const initial = student.name.charAt(0).toUpperCase();

      const card = document.createElement('div');
      card.className = 'student-card';
      card.innerHTML = `
        <div class="student-card-body">
          <div class="student-card-header">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div class="student-avatar">${initial}</div>
              <div>
                <div class="student-name">${escapeHtml(student.name)}</div>
                <div class="student-grade">Grade ${student.grade} &bull; ${escapeHtml(student.subjects.join(', '))}</div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm delete-student-btn" data-id="${student.id}" title="Delete Student">
              🗑️
            </button>
          </div>

          <div class="perf-summary">
            <div>
              <div class="perf-stat-label">Papers Done</div>
              <div class="perf-stat-value">${perf.totalPapers}</div>
            </div>
            <div>
              <div class="perf-stat-label">Average Score</div>
              <div class="perf-stat-value" style="color: ${perf.avgScore >= 70 ? 'var(--success)' : perf.avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'}">
                ${perf.totalPapers > 0 ? perf.avgScore + '%' : 'N/A'}
              </div>
            </div>
          </div>

          <div style="margin-top: 0.6rem;">
            ${weakTopics.length > 0 ? `
              <div style="font-size: 0.75rem; font-weight: 600; color: #991b1b; margin-bottom: 0.2rem;">Weak Areas (&lt; 60%):</div>
              <div class="badge-row">
                ${weakTopics.map(w => `<span class="badge badge-danger">⚠️ ${escapeHtml(w.topic)} (${w.avgScore}%)</span>`).join('')}
              </div>
            ` : ''}

            ${strongTopics.length > 0 ? `
              <div style="font-size: 0.75rem; font-weight: 600; color: #166534; margin-top: 0.4rem; margin-bottom: 0.2rem;">Strong Areas (&ge; 75%):</div>
              <div class="badge-row">
                ${strongTopics.map(s => `<span class="badge badge-success">⭐ ${escapeHtml(s.topic)} (${s.avgScore}%)</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="student-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-block create-paper-student-btn" data-id="${student.id}">
            📝 Generate Paper
          </button>
        </div>
      `;

      card.querySelector('.create-paper-student-btn').addEventListener('click', () => {
        DOM.studentSelect.value = student.id;
        DOM.gradeSelect.value = String(student.grade);
        updateStudentContext();
        switchTab('tab-builder');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      card.querySelector('.delete-student-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete ${student.name}? This will remove all associated papers and scores.`)) {
          Store.deleteStudent(student.id);
          populateStudentDropdown();
          renderStudentsTab();
          showToast(`Deleted ${student.name}`, 'info');
        }
      });

      DOM.studentCardsContainer.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // ADD STUDENT MODAL
  // ----------------------------------------------------
  DOM.btnOpenAddStudentModal.addEventListener('click', openAddStudentModal);
  DOM.btnQuickAddStudent.addEventListener('click', openAddStudentModal);

  function openAddStudentModal() {
    DOM.studentModalTitle.textContent = 'Add New Student';
    DOM.studentModalId.value = '';
    DOM.studentModalName.value = '';
    DOM.studentModalGrade.value = '8';
    DOM.subMath.checked = true;
    DOM.subSci.checked = true;
    DOM.subEng.checked = false;
    if (DOM.subSst) DOM.subSst.checked = false;
    DOM.studentModal.classList.add('active');
  }

  DOM.btnCloseStudentModal.addEventListener('click', () => DOM.studentModal.classList.remove('active'));
  DOM.btnCancelStudentModal.addEventListener('click', () => DOM.studentModal.classList.remove('active'));

  DOM.btnSaveStudentModal.addEventListener('click', () => {
    const name = DOM.studentModalName.value.trim();
    const grade = Number(DOM.studentModalGrade.value);

    if (!name) {
      showToast('Please enter the student\'s full name.', 'error');
      return;
    }

    const subjects = [];
    if (DOM.subMath.checked) subjects.push('Mathematics');
    if (DOM.subSci.checked) subjects.push('Science');
    if (DOM.subEng.checked) subjects.push('English');
    if (DOM.subSst && DOM.subSst.checked) subjects.push('Social Studies');

    const newStudent = Store.addStudent({ name, grade, subjects });
    DOM.studentModal.classList.remove('active');
    populateStudentDropdown(newStudent.id);
    renderStudentsTab();
    showToast(`Added student: ${name}`, 'success');
  });

  // ----------------------------------------------------
  // QUESTION BANK TAB & EXPLORER
  // ----------------------------------------------------
  function renderQuestionBankTab() {
    populateQbTopicFilter();
    applyQbFilters();
  }

  function populateQbTopicFilter() {
    const grade = DOM.qbGradeFilter.value ? Number(DOM.qbGradeFilter.value) : null;
    const subject = DOM.qbSubjectFilter.value || null;

    let topics = [];
    if (grade && subject) {
      topics = Store.getTopicsForSubject(grade, subject);
    } else {
      const qs = Store.getQuestions();
      const topicSet = new Set(qs.map((q) => q.topic));
      if (window.QuestionBank && window.QuestionBank.CURRICULUM) {
        Object.values(window.QuestionBank.CURRICULUM).forEach((subjMap) => {
          Object.values(subjMap).forEach((tList) => tList.forEach((t) => topicSet.add(t)));
        });
      }
      topics = [...topicSet].sort();
    }

    DOM.qbTopicFilter.innerHTML = '<option value="">All Topics</option>';
    topics.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      DOM.qbTopicFilter.appendChild(opt);
    });
  }

  function applyQbFilters() {
    const query = DOM.qbSearchInput.value.trim().toLowerCase();
    const grade = DOM.qbGradeFilter.value ? Number(DOM.qbGradeFilter.value) : null;
    const subject = DOM.qbSubjectFilter.value || null;
    const topic = DOM.qbTopicFilter.value || null;
    const type = DOM.qbTypeFilter ? DOM.qbTypeFilter.value : '';

    let questions = Store.getQuestions();

    if (grade) questions = questions.filter((q) => q.grade === grade);
    if (subject) questions = questions.filter((q) => q.subject === subject);
    if (topic) questions = questions.filter((q) => q.topic === topic);
    if (type) questions = questions.filter((q) => q.type === type);

    if (query) {
      questions = questions.filter(
        (q) =>
          q.text.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query) ||
          (q.explanation && q.explanation.toLowerCase().includes(query)) ||
          q.answer.toLowerCase().includes(query)
      );
    }

    DOM.qbMatchCount.textContent = questions.length;
    DOM.qbTableBody.innerHTML = '';

    if (questions.length === 0) {
      DOM.qbTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No questions matched your search filters.
          </td>
        </tr>
      `;
      return;
    }

    const typeBadges = {
      mcq: '<span class="badge badge-primary">MCQ (1M)</span>',
      assertion_reason: '<span class="badge badge-primary" style="background:#ede9fe; color:#6d28d9;">A-R (1M)</span>',
      fill_blank: '<span class="badge badge-primary" style="background:#e0f2fe; color:#0369a1;">Fill (1M)</span>',
      true_false: '<span class="badge badge-primary" style="background:#fef3c7; color:#b45309;">T/F (1M)</span>',
      short: '<span class="badge badge-primary" style="background:#f1f5f9; color:#334155;">Short (2M)</span>',
      long: '<span class="badge badge-primary" style="background:#fce7f3; color:#9d174d;">Long (5M)</span>',
    };

    questions.slice(0, 100).forEach((q) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong style="color: var(--primary);">Gr ${q.grade}</strong><br />
          <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(q.subject)}</span>
        </td>
        <td>
          <span style="font-weight: 500;">${escapeHtml(q.topic)}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">
            ${escapeHtml(q.text.split('\n')[0])}
          </div>
          <div style="font-size: 0.8rem; color: #166534;">
            Ans: ${escapeHtml(q.answer)}
          </div>
          ${q.explanation ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1px;">Exp: ${escapeHtml(q.explanation)}</div>` : ''}
        </td>
        <td>
          ${typeBadges[q.type] || q.type}
        </td>
        <td>
          ${q.isCustom ? `
            <button type="button" class="btn btn-secondary btn-sm delete-q-btn" data-id="${q.id}" title="Delete Custom Question">
              🗑️
            </button>
          ` : `<span style="font-size: 0.72rem; color: var(--text-muted);">Built-in</span>`}
        </td>
      `;

      const deleteBtn = tr.querySelector('.delete-q-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (confirm('Delete this custom question?')) {
            Store.deleteQuestion(q.id);
            applyQbFilters();
            populateTopics();
            showToast('Question deleted', 'info');
          }
        });
      }

      DOM.qbTableBody.appendChild(tr);
    });
  }

  DOM.qbSearchInput.addEventListener('input', applyQbFilters);
  DOM.qbGradeFilter.addEventListener('change', () => {
    populateQbTopicFilter();
    applyQbFilters();
  });
  DOM.qbSubjectFilter.addEventListener('change', () => {
    populateQbTopicFilter();
    applyQbFilters();
  });
  DOM.qbTopicFilter.addEventListener('change', applyQbFilters);
  if (DOM.qbTypeFilter) DOM.qbTypeFilter.addEventListener('change', applyQbFilters);

  // ----------------------------------------------------
  // ADD CUSTOM QUESTION MODAL
  // ----------------------------------------------------
  DOM.btnOpenAddQuestionModal.addEventListener('click', () => {
    DOM.qModalGrade.value = DOM.gradeSelect.value || '8';
    DOM.qModalSubject.value = DOM.subjectSelect.value || 'Mathematics';
    DOM.qModalTopic.value = '';
    DOM.qModalDifficulty.value = '2';
    DOM.qModalType.value = 'mcq';
    DOM.qModalText.value = '';
    DOM.qOptA.value = '';
    DOM.qOptB.value = '';
    DOM.qOptC.value = '';
    DOM.qOptD.value = '';
    DOM.qModalAnswer.value = '';
    DOM.qModalExplanation.value = '';
    updateModalTypeFields();
    DOM.questionModal.classList.add('active');
  });

  DOM.qModalType.addEventListener('change', updateModalTypeFields);

  function updateModalTypeFields() {
    const isMcq = DOM.qModalType.value === 'mcq';
    DOM.qModalMcqOptions.style.display = isMcq ? 'block' : 'none';
  }

  DOM.btnCloseQuestionModal.addEventListener('click', () => DOM.questionModal.classList.remove('active'));
  DOM.btnCancelQuestionModal.addEventListener('click', () => DOM.questionModal.classList.remove('active'));

  DOM.btnSaveQuestionModal.addEventListener('click', () => {
    const grade = Number(DOM.qModalGrade.value);
    const subject = DOM.qModalSubject.value;
    const topic = DOM.qModalTopic.value.trim();
    const difficulty = Number(DOM.qModalDifficulty.value);
    const type = DOM.qModalType.value;
    const text = DOM.qModalText.value.trim();
    const answer = DOM.qModalAnswer.value.trim();
    const explanation = DOM.qModalExplanation.value.trim();

    if (!topic || !text || !answer) {
      showToast('Please fill in Topic, Question Text, and Correct Answer.', 'error');
      return;
    }

    let options = null;
    if (type === 'mcq') {
      options = [
        DOM.qOptA.value.trim(),
        DOM.qOptB.value.trim(),
        DOM.qOptC.value.trim(),
        DOM.qOptD.value.trim(),
      ].filter(Boolean);
      if (options.length < 2) {
        showToast('Please provide at least 2 options for Multiple Choice.', 'error');
        return;
      }
    } else if (type === 'true_false') {
      options = ['True', 'False'];
    }

    Store.addQuestion({
      grade,
      subject,
      topic,
      difficulty,
      type,
      text,
      options,
      answer,
      explanation,
    });

    DOM.questionModal.classList.remove('active');
    populateTopics();
    applyQbFilters();
    showToast('Custom question added to Question Bank!', 'success');
  });

  // ----------------------------------------------------
  // SAVED PAPERS VIEW
  // ----------------------------------------------------
  function renderSavedPapersTab() {
    const papers = Store.getPapers();
    DOM.savedPapersTableBody.innerHTML = '';

    if (papers.length === 0) {
      DOM.savedPapersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No saved practice papers yet. Generate a test and click "Save to Records".
          </td>
        </tr>
      `;
      return;
    }

    papers.forEach((p) => {
      const tr = document.createElement('tr');
      const dateFormatted = new Date(p.date).toLocaleDateString();
      const statusBadge = p.isGraded
        ? `<span class="badge badge-success">Graded: ${p.score}/${p.totalMarks}</span>`
        : `<span class="badge badge-warning">Ungraded</span>`;

      tr.innerHTML = `
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td>${escapeHtml(p.studentName || 'Generic')}</td>
        <td>Grade ${p.grade} &bull; ${escapeHtml(p.subject)}</td>
        <td>${p.questions ? p.questions.length : p.requestedCount} Qs (${p.totalMarks}M)</td>
        <td>${dateFormatted}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-secondary btn-sm load-paper-btn" title="View &amp; Print">
              👁️ View
            </button>
            <button type="button" class="btn btn-primary btn-sm grade-paper-btn" title="Grade Student Test">
              ✓ Grade
            </button>
            <button type="button" class="btn btn-secondary btn-sm delete-paper-btn" title="Delete Paper">
              🗑️
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.load-paper-btn').addEventListener('click', () => {
        state.currentPaper = p;
        state.showAnswersOnScreen = false;
        renderPaper(p);
        DOM.paperActionBar.style.display = 'flex';
        switchTab('tab-builder');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      tr.querySelector('.grade-paper-btn').addEventListener('click', () => {
        openGradeModal(p);
      });

      tr.querySelector('.delete-paper-btn').addEventListener('click', () => {
        if (confirm(`Delete saved paper "${p.title}"?`)) {
          Store.deletePaper(p.id);
          renderSavedPapersTab();
          showToast('Paper deleted', 'info');
        }
      });

      DOM.savedPapersTableBody.appendChild(tr);
    });
  }

  // ----------------------------------------------------
  // BACKUP & RESTORE
  // ----------------------------------------------------
  DOM.btnExportData.addEventListener('click', () => {
    const dataStr = Store.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor_practice_paper_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('All student records & questions exported!', 'success');
  });

  DOM.importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = Store.importData(event.target.result);
      if (success) {
        populateStudentDropdown();
        populateTopics();
        renderStudentsTab();
        renderQuestionBankTab();
        renderSavedPapersTab();
        showToast('Data restored successfully from backup!', 'success');
      } else {
        showToast('Invalid backup file format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  DOM.btnReseedBank.addEventListener('click', () => {
    if (confirm('This will restore all default NCERT questions and preserve custom ones. Continue?')) {
      if (window.QuestionBank && window.QuestionBank.questions) {
        Store.seedQuestions(window.QuestionBank.questions, false);
        Store.markSeeded();
        populateTopics();
        renderQuestionBankTab();
        showToast('Question bank re-synchronized with NCERT syllabus!', 'success');
      }
    }
  });

  // Utility HTML Escape
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize Data and UI once all DOM elements, state, and handlers are ready
  initData();
});
