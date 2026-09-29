// ============================================
// store.js — localStorage Data Persistence Layer
// ============================================

window.Store = (function () {
  const KEYS = {
    students: 'tpb_students',
    questions: 'tpb_questions',
    papers: 'tpb_papers',
    results: 'tpb_results',
    seeded: 'tpb_seeded_v6',
  };

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ---- Students ----
  function getStudents() {
    return _get(KEYS.students);
  }

  function getStudent(id) {
    return getStudents().find((s) => s.id === id) || null;
  }

  function addStudent({ name, grade, subjects }) {
    const students = getStudents();
    const student = {
      id: generateId(),
      name,
      grade: Number(grade),
      subjects: subjects || [],
      createdAt: new Date().toISOString(),
    };
    students.push(student);
    _set(KEYS.students, students);
    return student;
  }

  function updateStudent(id, updates) {
    const students = getStudents();
    const idx = students.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    if (updates.grade) updates.grade = Number(updates.grade);
    students[idx] = { ...students[idx], ...updates };
    _set(KEYS.students, students);
    return students[idx];
  }

  function deleteStudent(id) {
    _set(KEYS.students, getStudents().filter((s) => s.id !== id));
    // Also remove papers and results for this student
    _set(KEYS.papers, getPapers().filter((p) => p.studentId !== id));
    _set(KEYS.results, getResults().filter((r) => r.studentId !== id));
  }

  // ---- Questions ----
  function getQuestions(filters) {
    let questions = _get(KEYS.questions);
    if (!filters) return questions;
    if (filters.grade) questions = questions.filter((q) => q.grade === Number(filters.grade));
    if (filters.subject) questions = questions.filter((q) => q.subject === filters.subject);
    if (filters.topic) questions = questions.filter((q) => q.topic === filters.topic);
    if (filters.difficulty) questions = questions.filter((q) => q.difficulty === Number(filters.difficulty));
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        questions = questions.filter((q) => filters.type.includes(q.type));
      } else if (filters.type !== 'all') {
        questions = questions.filter((q) => q.type === filters.type);
      }
    }
    return questions;
  }

  function addQuestion(data) {
    const questions = getQuestions();
    const question = {
      id: generateId(),
      grade: Number(data.grade),
      subject: data.subject,
      topic: data.topic,
      difficulty: Number(data.difficulty) || 2,
      type: data.type || 'mcq',
      text: data.text,
      options: data.options || null,
      answer: data.answer,
      explanation: data.explanation || '',
      isCustom: true,
    };
    questions.push(question);
    _set(KEYS.questions, questions);
    return question;
  }

  function deleteQuestion(id) {
    _set(KEYS.questions, getQuestions().filter((q) => q.id !== id));
  }

  function getTopicsForSubject(grade, subject) {
    const questions = getQuestions({ grade, subject });
    const topicSet = new Set();

    // Prefer defined curriculum order first
    if (window.QuestionBank && typeof window.QuestionBank.getCurriculumTopics === 'function') {
      const curriculumTopics = window.QuestionBank.getCurriculumTopics(grade, subject);
      curriculumTopics.forEach((t) => topicSet.add(t));
    }

    // Then any additional custom topics from user-added questions
    questions.forEach((q) => topicSet.add(q.topic));

    return [...topicSet];
  }

  function getSubjectsForGrade(grade) {
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
    return subjects;
  }

  // ---- Papers ----
  function getPapers(studentId) {
    let papers = _get(KEYS.papers);
    if (studentId) papers = papers.filter((p) => p.studentId === studentId);
    return papers.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getPaper(id) {
    return _get(KEYS.papers).find((p) => p.id === id) || null;
  }

  function savePaper(paper) {
    const papers = _get(KEYS.papers);
    const idx = papers.findIndex((p) => p.id === paper.id);
    if (idx >= 0) {
      papers[idx] = paper;
    } else {
      papers.push(paper);
    }
    _set(KEYS.papers, papers);
    return paper;
  }

  function deletePaper(id) {
    _set(KEYS.papers, _get(KEYS.papers).filter((p) => p.id !== id));
    _set(KEYS.results, _get(KEYS.results).filter((r) => r.paperId !== id));
  }

  // ---- Results ----
  function getResults(studentId) {
    let results = _get(KEYS.results);
    if (studentId) results = results.filter((r) => r.studentId === studentId);
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getResult(paperId) {
    return _get(KEYS.results).find((r) => r.paperId === paperId) || null;
  }

  function saveResult(result) {
    const results = _get(KEYS.results);
    const idx = results.findIndex((r) => r.paperId === result.paperId);
    if (idx >= 0) {
      results[idx] = result;
    } else {
      results.push(result);
    }
    _set(KEYS.results, results);
    return result;
  }

  // ---- Analytics ----
  function getStudentPerformance(studentId, subject) {
    let results = getResults(studentId);
    if (subject) results = results.filter((r) => r.subject === subject);

    if (results.length === 0) {
      return { totalPapers: 0, avgScore: 0, byTopic: {} };
    }

    const totalPapers = results.length;
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / results.length
    );

    // Build per-topic stats
    const topicData = {};
    results.forEach((result, rIdx) => {
      if (!result.topicScores) return;
      Object.entries(result.topicScores).forEach(([topic, scores]) => {
        if (!topicData[topic]) {
          topicData[topic] = { scores: [], attempts: 0 };
        }
        const pct = scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
        topicData[topic].scores.push({ pct, date: result.date, index: rIdx });
        topicData[topic].attempts++;
      });
    });

    const byTopic = {};
    Object.entries(topicData).forEach(([topic, data]) => {
      const avgTopicScore = Math.round(
        data.scores.reduce((s, d) => s + d.pct, 0) / data.scores.length
      );
      const recentScore = Math.round(data.scores[0].pct);
      let trend = 'stable';
      if (data.scores.length >= 2) {
        const diff = data.scores[0].pct - data.scores[1].pct;
        if (diff > 10) trend = 'improving';
        else if (diff < -10) trend = 'declining';
      }
      byTopic[topic] = { avgScore: avgTopicScore, attempts: data.attempts, recentScore, trend };
    });

    return { totalPapers, avgScore, byTopic };
  }

  function getWeakTopics(studentId, subject) {
    const perf = getStudentPerformance(studentId, subject);
    return Object.entries(perf.byTopic)
      .filter(([, data]) => data.avgScore < 60)
      .map(([topic, data]) => ({
        topic,
        avgScore: data.avgScore,
        attempts: data.attempts,
        recentScore: data.recentScore,
      }))
      .sort((a, b) => a.avgScore - b.avgScore);
  }

  function getStrongTopics(studentId, subject) {
    const perf = getStudentPerformance(studentId, subject);
    return Object.entries(perf.byTopic)
      .filter(([, data]) => data.avgScore >= 75)
      .map(([topic, data]) => ({
        topic,
        avgScore: data.avgScore,
        attempts: data.attempts,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }

  // ---- Data Management ----
  function exportData() {
    return JSON.stringify({
      students: _get(KEYS.students),
      questions: _get(KEYS.questions),
      papers: _get(KEYS.papers),
      results: _get(KEYS.results),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.students) _set(KEYS.students, data.students);
      if (data.questions) _set(KEYS.questions, data.questions);
      if (data.papers) _set(KEYS.papers, data.papers);
      if (data.results) _set(KEYS.results, data.results);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // ---- Seeding ----
  function seedQuestions(questions, overwrite = false) {
    const customQuestions = overwrite ? [] : _get(KEYS.questions).filter(q => q.isCustom);
    const withIds = questions.map((q) => ({ ...q, id: q.id || generateId() }));
    _set(KEYS.questions, [...withIds, ...customQuestions]);
  }

  function isSeeded(key = KEYS.seeded) {
    return localStorage.getItem(key) === 'true';
  }

  function markSeeded(key = KEYS.seeded) {
    localStorage.setItem(key, 'true');
  }

  // Public API
  return {
    getStudents, getStudent, addStudent, updateStudent, deleteStudent,
    getQuestions, addQuestion, deleteQuestion, getTopicsForSubject, getSubjectsForGrade,
    getPapers, getPaper, savePaper, deletePaper,
    getResults, getResult, saveResult,
    getStudentPerformance, getWeakTopics, getStrongTopics,
    exportData, importData,
    seedQuestions, isSeeded, markSeeded,
  };
})();
