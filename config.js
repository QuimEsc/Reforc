window.GAMIFICACIO_CONFIG = Object.freeze({
  // Després de desplegar Apps Script, pega ací la URL acabada en /exec.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbz925x0-uCgmF4ayl0Q40STaODZ05scbNG9h58TmQCFaCOyxpSR64cMOUd1Stxtha63EQ/exec",
  firebaseRoot: "gamificacio",
  groupId: "1ESO-REFORC",
  defaultTrimester: 1,
  themeByTrimester: Object.freeze({
    1: "space",
    2: "city",
    3: "expedition"
  }),
  focusSessionMinutes: 55,
  liveHeartbeatMs: 60000,
  liveAnswerDebounceMs: 900,
  liveTtlHours: 52,
  maxAnswerChars: 12000,
  version: "1.0.0"
});
