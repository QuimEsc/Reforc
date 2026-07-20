(function () {
  "use strict";

  const config = window.GAMIFICACIO_CONFIG;
  const state = {
    items: [],
    catalog: { sectors: [], missions: [], questions: [], levelPlans: [], nextLockedMission: null },
    pendingProposals: [],
    pendingReviews: [],
    selectedItem: null,
    commentTarget: null,
    liveRef: null,
    goalRef: null,
    demoTimer: null,
    renderTimer: null,
    proposalTimer: null,
    started: false,
    eventsBound: false
  };
  const dom = {};

  function cacheDom() {
    [
      "monitorSetupNotice", "firebaseState", "activeCount", "workingCount", "helpCount", "focusCount", "monitorGoalText",
      "monitorGoalBar", "unlockMissionTitle", "unlockMissionText", "unlockNextMissionButton", "pendingProposalCard", "pendingProposalCount", "reviewProposalButton", "pendingReviewCard", "pendingReviewCount", "reviewProcedureButton", "searchInput", "statusFilter", "globalMissionSelect", "assignAllButton", "globalCommentButton",
      "lastUpdateText", "studentGrid", "emptyMonitor", "assignDialog", "assignDialogTitle", "questionSelect", "questionPreview",
      "confirmAssignButton", "proposalDialog", "proposalDialogTitle", "proposalId", "proposalQuestion", "proposalMathPreview",
      "proposalAnswer", "proposalRoute", "proposalMethod", "proposalExplanation", "rejectProposalButton", "approveProposalButton",
      "procedureReviewDialog", "procedureReviewTitle", "procedureReviewId", "procedureReviewQuestion", "procedureReviewAnswer", "procedureReviewModel", "procedureReviewComment", "markIncorrectButton", "markPartialButton", "markCorrectButton",
      "commentDialog", "commentDialogTitle", "commentText", "sendCommentButton", "monitorLoading", "monitorLoadingText", "toastRegion",
      "teacherGate", "monitorApp", "teacherLoginForm", "teacherPassword", "teacherSignInButton", "teacherAuthMessage", "teacherSignOutButton"
    ].forEach((id) => { dom[id] = document.getElementById(id); });
  }

  function setLoading(visible, text) {
    if (text) dom.monitorLoadingText.textContent = text;
    dom.monitorLoading.classList.toggle("hidden", !visible);
  }

  function toast(message, type = "", duration = 4500) {
    const item = document.createElement("div");
    item.className = `toast ${type}`.trim();
    item.textContent = message;
    dom.toastRegion.appendChild(item);
    window.setTimeout(() => item.remove(), duration);
  }

  function setConnection(status, text) {
    dom.firebaseState.classList.remove("online", "error");
    if (status) dom.firebaseState.classList.add(status);
    dom.firebaseState.lastChild.textContent = ` ${text}`;
  }

  function stopMonitor() {
    if (state.liveRef) state.liveRef.off();
    if (state.goalRef) state.goalRef.off();
    if (state.demoTimer) window.clearInterval(state.demoTimer);
    if (state.renderTimer) window.clearInterval(state.renderTimer);
    if (state.proposalTimer) window.clearInterval(state.proposalTimer);
    state.liveRef = null;
    state.goalRef = null;
    state.demoTimer = null;
    state.renderTimer = null;
    state.proposalTimer = null;
    state.started = false;
    if (window.GameBattleTeacher) window.GameBattleTeacher.stop();
  }

  function showTeacherGate(message = "") {
    stopMonitor();
    dom.monitorApp.classList.add("hidden");
    dom.teacherGate.classList.remove("hidden");
    dom.teacherAuthMessage.textContent = message;
    dom.teacherPassword.value = "";
    window.setTimeout(() => dom.teacherPassword.focus(), 50);
  }

  async function startMonitor() {
    if (state.started) return;
    state.started = true;
    dom.teacherGate.classList.add("hidden");
    dom.monitorApp.classList.remove("hidden");
    dom.teacherAuthMessage.textContent = "";
    dom.teacherPassword.value = "";
    dom.teacherSignOutButton.classList.toggle("hidden", window.GameData.isDemo());
    if (!state.eventsBound) bindEvents();
    dom.monitorSetupNotice.classList.toggle("hidden", window.GameData.isConfigured() || window.GameData.isDemo());
    await loadCatalog();
    await loadPendingProposals();
    await loadPendingReviews();
    startLive();
    if (window.GameBattleTeacher) window.GameBattleTeacher.start({
      getCatalog: () => state.catalog,
      getItems: () => state.items,
      toast,
      setLoading
    });
    state.renderTimer = window.setInterval(render, 30000);
    if (!window.GameData.isDemo()) state.proposalTimer = window.setInterval(() => { loadPendingProposals(); loadPendingReviews(); }, 60000);
  }

  async function loginTeacher(event) {
    event.preventDefault();
    const password = dom.teacherPassword.value;
    if (!password) return;
    dom.teacherSignInButton.disabled = true;
    dom.teacherAuthMessage.textContent = "Comprovant la contrasenya…";
    try {
      const data = await window.GameData.call("teacher_login", { password });
      window.GameData.setTeacherToken(data.teacherToken);
      await startMonitor();
    } catch (error) {
      dom.teacherAuthMessage.textContent = error.message;
      dom.teacherPassword.select();
    } finally {
      dom.teacherSignInButton.disabled = false;
    }
  }

  async function logoutTeacher() {
    try {
      await window.GameData.call("teacher_logout");
    } catch (error) {
      // La sessió es tanca localment fins i tot si Apps Script no respon.
    }
    window.GameData.clearTeacherToken();
    showTeacherGate("Sessió tancada.");
  }

  function elapsedText(timestamp) {
    const seconds = Math.max(0, Math.round((Date.now() - Number(timestamp || 0)) / 1000));
    if (seconds < 10) return "ara mateix";
    if (seconds < 60) return `fa ${seconds} s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `fa ${minutes} min`;
    return `fa ${Math.floor(minutes / 60)} h`;
  }

  function statusOf(item) {
    const age = Date.now() - Number(item.updatedAt || 0);
    if (age > 10 * 60 * 1000) return "INACTIVE";
    return item.state || "WORKING";
  }

  function makeDemoItems() {
    const now = Date.now();
    const base = window.GamificacioDemo.EXERCISES;
    const users = window.GamificacioDemo.USERS;
    state.items = users.map((user, index) => {
      const exercise = (base[user.route] || base.BASE)[index % 3];
      return {
        key: `demo-${index}`,
        sessionId: `demo-${index}`,
        studentId: user.studentId,
        studentName: user.name,
        route: user.route,
        exerciseId: exercise.exerciseId,
        missionId: exercise.missionId,
        missionTitle: "Engegar els motors",
        questionHtml: exercise.questionHtml,
        expectedAnswer: exercise.expectedAnswer,
        answer: index === 0 ? "-7 + 12 = 5" : index === 1 ? "8 - 13 = 5" : "Estic provant -15 + 27",
        answerPreviewHtml: window.GameMath.studentTextToHtml(index === 0 ? "-7 + 12 = 5" : index === 1 ? "8 - 13 = 5" : "-15 + 27"),
        helpCount: index,
        state: index === 2 ? "NEEDS_TEACHER" : "WORKING",
        focusState: index === 1 ? "HIDDEN" : "VISIBLE",
        submissionReason: index === 1 ? "focus_hidden" : "normal",
        updatedAt: now - index * 47000
      };
    });
    render();
  }

  async function loadCatalog() {
    try {
      const data = await window.GameData.call("catalog");
      state.catalog.sectors = data.sectors || [];
      state.catalog.missions = data.missions || [];
      state.catalog.questions = data.questions || [];
      state.catalog.levelPlans = data.levelPlans || [];
      state.catalog.nextLockedMission = data.nextLockedMission || null;
      dom.globalMissionSelect.innerHTML = '<option value="">Tria una missió</option>';
      state.catalog.missions.filter((mission) => mission.unlocked).forEach((mission) => {
        const option = document.createElement("option");
        option.value = mission.missionId;
        option.textContent = mission.title;
        dom.globalMissionSelect.appendChild(option);
      });
      renderUnlockControl();
      if (window.GameBattleTeacher) window.GameBattleTeacher.refreshCatalog();
    } catch (error) {
      dom.globalMissionSelect.innerHTML = '<option value="">No disponible</option>';
      toast(error.message, "error", 6500);
    }
  }

  function renderUnlockControl() {
    const next = state.catalog.nextLockedMission;
    if (!next) {
      dom.unlockMissionTitle.textContent = "Totes les missions del trimestre estan desbloquejades";
      dom.unlockMissionText.textContent = "Si augmentes el nombre de sectors en Configuracio, es crearan automàticament.";
      dom.unlockNextMissionButton.disabled = true;
      dom.unlockNextMissionButton.textContent = "Tot desbloquejat";
      return;
    }
    const sector = state.catalog.sectors.find((item) => item.sectorId === next.sectorId);
    dom.unlockMissionTitle.textContent = `Pròxima: ${next.title}`;
    dom.unlockMissionText.textContent = `${sector ? sector.title + " · " : ""}${next.targetExercises || 5} exercicis per fase. El desbloqueig servirà per a tot l'alumnat.`;
    dom.unlockNextMissionButton.disabled = false;
    dom.unlockNextMissionButton.textContent = "Desbloquejar missió";
  }

  async function unlockNextMission() {
    dom.unlockNextMissionButton.disabled = true;
    try {
      const data = await window.GameData.call("unlock_next_mission", {});
      toast(data.message || "Missió desbloquejada.", data.allUnlocked ? "warning" : "good", 6500);
      await loadCatalog();
    } catch (error) {
      toast(error.message, "error", 8000);
      renderUnlockControl();
    }
  }

  async function loadPendingProposals() {
    if (window.GameData.isDemo()) {
      state.pendingProposals = [];
    } else {
      try {
        const data = await window.GameData.call("list_proposals");
        state.pendingProposals = data.proposals || [];
      } catch (error) {
        return;
      }
    }
    dom.pendingProposalCount.textContent = state.pendingProposals.length;
    dom.pendingProposalCard.classList.toggle("hidden", state.pendingProposals.length < 1);
  }

  function reviewNextProposal() {
    const proposal = state.pendingProposals[0];
    if (!proposal) return;
    const liveStudent = state.items.find((item) => item.studentId === proposal.studentId);
    openProposal(proposal, liveStudent ? liveStudent.studentName : proposal.studentId);
  }

  async function loadPendingReviews() {
    if (window.GameData.isDemo()) {
      state.pendingReviews = [];
    } else {
      try {
        const data = await window.GameData.call("list_reviews");
        state.pendingReviews = data.reviews || [];
      } catch (error) {
        return;
      }
    }
    dom.pendingReviewCount.textContent = state.pendingReviews.length;
    dom.pendingReviewCard.classList.toggle("hidden", state.pendingReviews.length < 1);
  }

  async function openNextProcedureReview() {
    const review = state.pendingReviews[0];
    if (!review) return;
    dom.procedureReviewId.value = review.reviewId;
    dom.procedureReviewTitle.textContent = `${review.studentName || review.studentId} · ${review.exerciseId}`;
    dom.procedureReviewComment.value = review.aiReason || "";
    await window.GameMath.setHtml(dom.procedureReviewQuestion, review.questionHtml || "Sense pregunta");
    await window.GameMath.setText(dom.procedureReviewAnswer, review.studentAnswer || "Sense resposta");
    await window.GameMath.setText(dom.procedureReviewModel, review.modelSolution || "Sense solució model");
    dom.procedureReviewDialog.showModal();
  }

  async function decideProcedureReview(decision) {
    const reviewId = dom.procedureReviewId.value;
    if (!reviewId) return;
    setLoading(true, "Guardant la revisió…");
    try {
      await window.GameData.call("decide_review", { reviewId, decision, comment: dom.procedureReviewComment.value });
      dom.procedureReviewDialog.close();
      state.pendingReviews = state.pendingReviews.filter((item) => item.reviewId !== reviewId);
      dom.pendingReviewCount.textContent = state.pendingReviews.length;
      dom.pendingReviewCard.classList.toggle("hidden", state.pendingReviews.length < 1);
      toast("Revisió guardada.", "good");
      if (state.pendingReviews.length) openNextProcedureReview();
    } catch (error) {
      toast(error.message, "error", 6500);
    } finally {
      setLoading(false);
    }
  }

  function startLive() {
    if (window.GameData.isDemo()) {
      setConnection("online", "Demostració");
      makeDemoItems();
      state.demoTimer = window.setInterval(() => {
        state.items.forEach((item, index) => {
          if (index === 0) item.updatedAt = Date.now();
        });
        render();
      }, 15000);
      return;
    }
    const db = window.GameLive.getDb();
    if (!db) {
      setConnection("error", "Firebase no disponible");
      return;
    }
    state.liveRef = db.ref(window.GameLive.pathFor("live"));
    state.liveRef.on("value", (snapshot) => {
      const value = snapshot.val() || {};
      state.items = Object.entries(value).map(([key, item]) => ({ key, ...item }));
      setConnection("online", "En directe");
      render();
    }, (error) => {
      setConnection("error", "Error de Firebase");
      toast(error.message, "error", 7000);
    });
    state.goalRef = db.ref(window.GameLive.pathFor("classGoal"));
    state.goalRef.on("value", (snapshot) => {
      const goals = snapshot.val() || {};
      const value = Object.values(goals).reduce((sum, item) => sum + Number(item && item.value || 0), 0);
      const missions = Math.max(1, Object.keys(goals).length);
      renderGoal(Math.min(100, Math.round(value / missions)));
    });
  }

  function filteredItems() {
    const search = dom.searchInput.value.trim().toLowerCase();
    const filter = dom.statusFilter.value;
    return state.items
      .filter((item) => !search || String(item.studentName || "").toLowerCase().includes(search))
      .filter((item) => filter === "ALL" || statusOf(item) === filter)
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  }

  function renderGoal(percent) {
    const value = Math.max(0, Math.min(100, Number(percent || 0)));
    dom.monitorGoalText.textContent = `${value}%`;
    dom.monitorGoalBar.style.width = `${value}%`;
  }

  async function render() {
    const items = filteredItems();
    const now = Date.now();
    const activeItems = state.items.filter((item) => now - Number(item.updatedAt || 0) <= 10 * 60 * 1000);
    dom.activeCount.textContent = activeItems.length;
    dom.workingCount.textContent = activeItems.filter((item) => statusOf(item) === "WORKING").length;
    dom.helpCount.textContent = activeItems.filter((item) => statusOf(item) === "NEEDS_TEACHER").length;
    dom.focusCount.textContent = activeItems.filter((item) => item.submissionReason && item.submissionReason !== "normal").length;
    dom.lastUpdateText.textContent = state.items.length ? `Actualitzat ${elapsedText(Math.max(...state.items.map((item) => Number(item.updatedAt || 0))))}` : "Sense dades encara";
    dom.studentGrid.innerHTML = "";
    dom.emptyMonitor.classList.toggle("hidden", Boolean(items.length));
    items.forEach((item) => dom.studentGrid.appendChild(buildCard(item)));
    await window.GameMath.typeset([...dom.studentGrid.querySelectorAll(".math-content")]);
  }

  function levelPlanFor(item) {
    const saved = state.catalog.levelPlans.find((plan) => plan.studentId === item.studentId && plan.missionId === item.missionId);
    if (saved && Array.isArray(saved.levels)) return saved.levels.join(",");
    return String(item.levelPlan || "SUPORT,BASE,REPTE");
  }

  function buildCard(item) {
    const status = statusOf(item);
    const card = document.createElement("article");
    card.className = `student-card ${status === "NEEDS_TEACHER" ? "needs-teacher" : ""} ${status === "INACTIVE" ? "inactive" : ""}`.trim();
    const statusLabel = status === "NEEDS_TEACHER" ? "Necessita ajuda" : status === "SUBMITTED" ? "Enviada" : status === "INACTIVE" ? "Inactiu" : "Treballant";
    const statusClass = status === "NEEDS_TEACHER" ? "help" : status === "INACTIVE" ? "off" : "";
    const answerHtml = item.answerPreviewHtml || (item.answer ? window.GameMath.studentTextToHtml(item.answer) : "");
    const flags = [
      `<span class="flag">Fase actual: ${window.GameMath.escapeHtml(item.route || "SUPORT")}</span>`,
      `<span class="flag">💡 ${Number(item.helpCount || 0)} ajudes</span>`,
      item.focusState === "HIDDEN" || (item.submissionReason && item.submissionReason !== "normal") ? `<span class="flag focus">Canvi de focus: ${window.GameMath.escapeHtml(item.submissionReason || "detectat")}</span>` : ""
    ].join("");
    card.innerHTML = `
      <header class="student-card-header">
        <span class="student-initial">${window.GameMath.escapeHtml(String(item.studentName || "?").charAt(0).toUpperCase())}</span>
        <div><h2 class="student-name">${window.GameMath.escapeHtml(item.studentName || "Sense nom")}</h2><span class="student-subtitle">${elapsedText(item.updatedAt)}</span></div>
        <span class="live-status ${statusClass}">${statusLabel}</span>
      </header>
      <div class="student-card-body">
        <div class="mission-line"><span>${window.GameMath.escapeHtml(item.missionTitle || item.missionId || "Missió")}</span><small>${window.GameMath.escapeHtml(item.exerciseId || "")}</small></div>
        <div class="monitor-question math-content">${window.GameMath.sanitiseHtml(item.questionHtml || "Sense pregunta")}</div>
        <div class="monitor-answer math-content ${answerHtml ? "" : "empty"}">${answerHtml ? window.GameMath.sanitiseHtml(answerHtml) : "Encara no ha escrit res."}</div>
        <div class="card-flags">${flags}</div>
        <div class="card-controls">
          <select class="level-select" aria-label="Fases de ${window.GameMath.escapeHtml(item.studentName)}">
            <option value="SUPORT,BASE,REPTE">Fases 1 + 2 + 3</option>
            <option value="SUPORT,BASE">Fases 1 + 2</option>
            <option value="BASE,REPTE">Fases 2 + 3</option>
            <option value="SUPORT">Només fase 1</option>
            <option value="BASE">Només fase 2</option>
            <option value="REPTE">Només fase 3</option>
          </select>
          <button class="secondary-button level-button" type="button">Guardar fases</button>
        </div>
        <div class="card-actions">
          <button class="comment-button" type="button">💬 Comentari</button>
          <button class="assign-button" type="button">🎯 Assignar</button>
          <button class="ai-button" type="button">✨ Reforç IA</button>
        </div>
      </div>`;
    card.querySelector(".level-select").value = levelPlanFor(item);
    card.querySelector(".level-button").addEventListener("click", () => changeMissionLevels(item, card.querySelector(".level-select").value));
    card.querySelector(".comment-button").addEventListener("click", () => openComment(item));
    card.querySelector(".assign-button").addEventListener("click", () => openAssignment(item));
    card.querySelector(".ai-button").addEventListener("click", () => generateProposal(item));
    return card;
  }

  async function changeMissionLevels(item, levels) {
    setLoading(true, "Guardant les fases…");
    try {
      const data = await window.GameData.call("set_mission_levels", { studentId: item.studentId, missionId: item.missionId, levels });
      const existing = state.catalog.levelPlans.find((plan) => plan.studentId === item.studentId && plan.missionId === item.missionId);
      if (existing) existing.levels = data.levels;
      else state.catalog.levelPlans.push({ studentId: item.studentId, missionId: item.missionId, levels: data.levels });
      item.levelPlan = data.levels.join(",");
      toast(`Fases de ${item.studentName}: ${data.levels.length}`, "good");
      render();
    } catch (error) {
      toast(error.message, "error", 6500);
    } finally {
      setLoading(false);
    }
  }

  function openAssignment(item) {
    state.selectedItem = item;
    dom.assignDialogTitle.textContent = `Pròxima activitat per a ${item.studentName}`;
    dom.questionSelect.innerHTML = "";
    const questions = [...state.catalog.questions].sort((a, b) => String(a.missionId).localeCompare(String(b.missionId)) || String(a.route).localeCompare(String(b.route)));
    questions.forEach((question) => {
      const option = document.createElement("option");
      option.value = question.id;
      option.textContent = `[${question.route || "COMUNA"}] ${question.title || question.id}`.slice(0, 150);
      option.dataset.html = question.questionHtml || question.title || "";
      dom.questionSelect.appendChild(option);
    });
    previewSelectedQuestion();
    dom.assignDialog.showModal();
  }

  async function previewSelectedQuestion() {
    const option = dom.questionSelect.selectedOptions[0];
    await window.GameMath.setHtml(dom.questionPreview, option ? option.dataset.html : "No hi ha activitats disponibles.");
  }

  async function confirmAssignment() {
    if (!state.selectedItem || !dom.questionSelect.value) return;
    dom.confirmAssignButton.disabled = true;
    try {
      await window.GameData.call("teacher_assign", {
        scope: "ALUMNE",
        recipientId: state.selectedItem.studentId,
        type: "EXERCICI",
        contentId: dom.questionSelect.value,
        priority: 100
      });
      dom.assignDialog.close();
      toast(`Activitat preparada per a ${state.selectedItem.studentName}.`, "good");
    } catch (error) {
      toast(error.message, "error", 6500);
    } finally {
      dom.confirmAssignButton.disabled = false;
    }
  }

  async function assignToAll() {
    if (!dom.globalMissionSelect.value) {
      toast("Tria primer una missió.", "warning");
      return;
    }
    dom.assignAllButton.disabled = true;
    try {
      await window.GameData.call("teacher_assign", { scope: "TOTS", recipientId: "", type: "MISSIO", contentId: dom.globalMissionSelect.value, priority: 50 });
      toast("Missió assignada a tota la classe.", "good");
    } catch (error) {
      toast(error.message, "error", 6500);
    } finally {
      dom.assignAllButton.disabled = false;
    }
  }

  async function generateProposal(item) {
    setLoading(true, `La IA prepara un reforç per a ${item.studentName}…`);
    try {
      const data = await window.GameData.call("suggest_exercise", {
        studentId: item.studentId,
        studentName: item.studentName,
        exerciseId: item.exerciseId,
        missionId: item.missionId,
        route: item.route,
        questionHtml: item.questionHtml,
        expectedAnswer: item.expectedAnswer,
        studentAnswer: item.answer || ""
      });
      openProposal(data.proposal, item.studentName);
    } catch (error) {
      toast(error.message, "error", 7500);
    } finally {
      setLoading(false);
    }
  }

  async function openProposal(proposal, studentName) {
    state.selectedItem = state.items.find((item) => item.studentId === proposal.studentId) || state.selectedItem;
    dom.proposalDialogTitle.textContent = `Reforç per a ${studentName || (state.selectedItem && state.selectedItem.studentName) || "l'alumne"}`;
    dom.proposalId.value = proposal.proposalId;
    dom.proposalQuestion.value = proposal.questionHtml || "";
    dom.proposalAnswer.value = proposal.expectedAnswer || "";
    dom.proposalRoute.value = proposal.route || "BASE";
    dom.proposalMethod.value = proposal.methodId || "";
    dom.proposalExplanation.value = proposal.explanation || "";
    await updateProposalPreview();
    dom.proposalDialog.showModal();
  }

  async function updateProposalPreview() {
    await window.GameMath.setHtml(dom.proposalMathPreview, dom.proposalQuestion.value);
  }

  async function decideProposal(decision) {
    if (!dom.proposalId.value) return;
    const button = decision === "APPROVE" ? dom.approveProposalButton : dom.rejectProposalButton;
    button.disabled = true;
    try {
      await window.GameData.call("teacher_decision", {
        proposalId: dom.proposalId.value,
        decision,
        questionHtml: dom.proposalQuestion.value,
        expectedAnswer: dom.proposalAnswer.value,
        route: dom.proposalRoute.value,
        methodId: dom.proposalMethod.value
      });
      dom.proposalDialog.close();
      toast(decision === "APPROVE" ? "Exercici aprovat i assignat." : "Proposta rebutjada.", decision === "APPROVE" ? "good" : "warning");
      await loadCatalog();
      await loadPendingProposals();
    } catch (error) {
      toast(error.message, "error", 7000);
    } finally {
      button.disabled = false;
    }
  }

  function openComment(item) {
    state.commentTarget = item || "GLOBAL";
    dom.commentDialogTitle.textContent = item ? `Comentari per a ${item.studentName}` : "Comentari per a tota la classe";
    dom.commentText.value = "";
    dom.commentDialog.showModal();
    dom.commentText.focus();
  }

  async function sendComment() {
    const text = dom.commentText.value.trim();
    if (!text) return;
    dom.sendCommentButton.disabled = true;
    try {
      if (!window.GameData.isDemo()) {
        const db = window.GameLive.getDb();
        const sessionId = state.commentTarget === "GLOBAL" ? "_global" : state.commentTarget.sessionId;
        await db.ref(window.GameLive.pathFor("comments", sessionId)).set({ text, updatedAt: window.firebase.database.ServerValue.TIMESTAMP });
      }
      dom.commentDialog.close();
      toast("Comentari enviat.", "good");
    } catch (error) {
      toast(error.message, "error", 6500);
    } finally {
      dom.sendCommentButton.disabled = false;
    }
  }

  function bindEvents() {
    if (state.eventsBound) return;
    state.eventsBound = true;
    dom.searchInput.addEventListener("input", render);
    dom.statusFilter.addEventListener("change", render);
    dom.questionSelect.addEventListener("change", previewSelectedQuestion);
    dom.confirmAssignButton.addEventListener("click", confirmAssignment);
    dom.assignAllButton.addEventListener("click", assignToAll);
    dom.unlockNextMissionButton.addEventListener("click", unlockNextMission);
    dom.reviewProposalButton.addEventListener("click", reviewNextProposal);
    dom.reviewProcedureButton.addEventListener("click", openNextProcedureReview);
    dom.markCorrectButton.addEventListener("click", () => decideProcedureReview("CORRECTE"));
    dom.markPartialButton.addEventListener("click", () => decideProcedureReview("PARCIAL"));
    dom.markIncorrectButton.addEventListener("click", () => decideProcedureReview("INCORRECTE"));
    dom.globalCommentButton.addEventListener("click", () => openComment(null));
    dom.sendCommentButton.addEventListener("click", sendComment);
    dom.proposalQuestion.addEventListener("input", () => {
      window.clearTimeout(dom.proposalQuestion.previewTimer);
      dom.proposalQuestion.previewTimer = window.setTimeout(updateProposalPreview, 350);
    });
    dom.approveProposalButton.addEventListener("click", () => decideProposal("APPROVE"));
    dom.rejectProposalButton.addEventListener("click", () => decideProposal("REJECT"));
  }

  async function init() {
    cacheDom();
    dom.teacherLoginForm.addEventListener("submit", loginTeacher);
    dom.teacherSignOutButton.addEventListener("click", logoutTeacher);
    window.addEventListener("gamificacio:teacher-auth-required", () => showTeacherGate("La sessió ha caducat. Torna a escriure la contrasenya."));

    if (window.GameData.isDemo()) {
      await startMonitor();
      return;
    }

    if (!window.GameData.hasTeacherToken()) {
      showTeacherGate();
      return;
    }

    dom.teacherAuthMessage.textContent = "Comprovant la sessió…";
    try {
      await window.GameData.call("teacher_check");
      await startMonitor();
    } catch (error) {
      showTeacherGate(error.message);
    }
  }

  window.addEventListener("beforeunload", stopMonitor);
  document.addEventListener("DOMContentLoaded", init);
}());
