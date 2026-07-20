(function () {
  "use strict";

  const config = window.GAMIFICACIO_CONFIG;
  let db = null;
  let context = null;
  let liveRef = null;
  let commentRef = null;
  let commentCallback = null;
  let globalCommentRef = null;
  let globalCommentCallback = null;
  let heartbeatId = null;
  let lastAnswer = null;
  let lastGlobalCommentAt = 0;

  function safeKey(value) {
    return String(value || "sense-id").trim().replace(/[.#$\[\]/]/g, "_").slice(0, 100) || "sense-id";
  }

  function init() {
    if (db) return true;
    if (!window.firebase || !window.firebaseConfig) return false;
    if (!window.firebase.apps.length) window.firebase.initializeApp(window.firebaseConfig);
    db = window.firebase.database();
    return true;
  }

  function pathFor(section, sessionId) {
    const parts = [safeKey(config.firebaseRoot), section, safeKey(config.groupId)];
    if (sessionId) parts.push(safeKey(sessionId));
    return parts.join("/");
  }

  async function start(studentContext) {
    context = { ...studentContext, startedAt: Date.now() };
    if (!init() || window.GameData.isDemo()) return false;
    stopListeners();
    liveRef = db.ref(pathFor("live", context.sessionId));
    commentRef = db.ref(pathFor("comments", context.sessionId));
    commentCallback = (snapshot) => {
      const comment = snapshot.val();
      if (comment && comment.text && typeof context.onComment === "function") context.onComment(comment);
    };
    commentRef.on("value", commentCallback);
    globalCommentRef = db.ref(pathFor("comments", "_global"));
    globalCommentCallback = (snapshot) => {
      const comment = snapshot.val();
      const commentAt = Number(comment && comment.updatedAt || 0);
      const recentEnough = commentAt >= context.startedAt - 10 * 60 * 1000;
      if (comment && comment.text && recentEnough && commentAt > lastGlobalCommentAt && typeof context.onComment === "function") {
        lastGlobalCommentAt = commentAt;
        context.onComment(comment);
      }
    };
    globalCommentRef.on("value", globalCommentCallback);
    heartbeatId = window.setInterval(() => updateDynamic({ heartbeat: true }), config.liveHeartbeatMs);
    return true;
  }

  async function publishExercise(exercise, mission, extra = {}) {
    if (!liveRef || !context) return;
    const now = window.firebase.database.ServerValue.TIMESTAMP;
    lastAnswer = "";
    await liveRef.set({
      groupId: config.groupId,
      sessionId: context.sessionId,
      studentId: context.studentId,
      studentName: context.studentName,
      route: extra.route || "BASE",
      levelPlan: String(extra.levelPlan || "SUPORT,BASE,REPTE"),
      exerciseId: exercise.exerciseId,
      missionId: exercise.missionId || (mission && mission.missionId) || "",
      missionTitle: (mission && mission.title) || "Missió",
      questionHtml: String(exercise.questionHtml || "").slice(0, 50000),
      expectedAnswer: String(exercise.expectedAnswer || "").slice(0, 5000),
      interactionType: String(exercise.interactionType || ""),
      answer: "",
      answerPreviewHtml: "",
      helpCount: Number(extra.helpCount || 0),
      state: "WORKING",
      focusState: "VISIBLE",
      submissionReason: "normal",
      startedAt: now,
      updatedAt: now
    });
  }

  async function updateDynamic(changes = {}) {
    if (!liveRef) return;
    const payload = { updatedAt: window.firebase.database.ServerValue.TIMESTAMP };
    if (Object.prototype.hasOwnProperty.call(changes, "answer")) {
      const answer = String(changes.answer || "").slice(0, config.maxAnswerChars);
      if (answer === lastAnswer && !changes.force) return;
      lastAnswer = answer;
      payload.answer = answer;
      payload.answerPreviewHtml = Object.prototype.hasOwnProperty.call(changes, "answerPreviewHtml")
        ? String(changes.answerPreviewHtml || "").slice(0, 20000)
        : window.GameMath.studentTextToHtml(answer).slice(0, 20000);
    }
    ["helpCount", "state", "focusState", "submissionReason"].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(changes, key)) payload[key] = changes[key];
    });
    await liveRef.update(payload);
  }

  async function markSubmitted(reason, answer, answerPreviewHtml) {
    return updateDynamic({ answer, answerPreviewHtml, state: "SUBMITTED", submissionReason: reason || "normal", force: true });
  }

  async function contributeClass(missionId, amount) {
    if (!db || !missionId || !amount) return;
    const ref = db.ref(`${pathFor("classGoal")}/${safeKey(missionId)}/value`);
    await ref.transaction((value) => Math.min(100, Number(value || 0) + Number(amount || 0)));
  }

  async function removeCurrent() {
    if (liveRef) await liveRef.remove();
  }

  function stopListeners() {
    if (commentRef && commentCallback) commentRef.off("value", commentCallback);
    if (globalCommentRef && globalCommentCallback) globalCommentRef.off("value", globalCommentCallback);
    if (heartbeatId) window.clearInterval(heartbeatId);
    commentRef = null;
    commentCallback = null;
    globalCommentRef = null;
    globalCommentCallback = null;
    heartbeatId = null;
  }

  function getDb() {
    init();
    return db;
  }

  window.addEventListener("beforeunload", stopListeners);
  window.GameLive = Object.freeze({ init, start, publishExercise, updateDynamic, markSubmitted, contributeClass, removeCurrent, stopListeners, getDb, pathFor, safeKey });
}());
