const app = getApp();
const { admin } = require('../../utils/api');

Page({
  data: {
    authed: false,
    password: '',
    tab: 'overview',
    stats: {},

    // 检查
    checks: [], checkName: '', checkOnlyProblem: false,
    // 意见
    suggestions: [], sugFilter: 'all',
    // 成绩
    exams: [], examName: '',
    // 扣分
    deductions: [], dedName: '',
    dedForm: { name: '', points: '', reason: '' },
    // 内容管理
    contentSub: 'rule',
    ruleForm: { category: '', title: '', content: '', keywords: '' },
    quizForm: { type: 'single', q: '', o0: '', o1: '', o2: '', o3: '', answer: '0', cat: '' },
    trainForm: { order: '', title: '', body: '' },
    rules: [], quizzes: [],
    newPwd: ''
  },

  onLoad() {
    if (app.globalData.adminToken) {
      this.setData({ authed: true });
      this.loadOverview();
    }
  },

  // ===== 登录 =====
  onPwd(e) { this.setData({ password: e.detail.value }); },
  async login() {
    if (!this.data.password) { wx.showToast({ title: '请输入密码', icon: 'none' }); return; }
    const res = await admin('login', { password: this.data.password });
    if (res.ok) {
      app.globalData.adminToken = res.token;
      app.globalData.isAdmin = true;
      this.setData({ authed: true, password: '' });
      this.loadOverview();
      wx.showToast({ title: '登录成功', icon: 'success' });
    }
  },
  logout() {
    app.globalData.adminToken = '';
    app.globalData.isAdmin = false;
    this.setData({ authed: false });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    const loaders = {
      overview: 'loadOverview', checks: 'loadChecks', suggestions: 'loadSuggestions',
      exams: 'loadExams', deductions: 'loadDeductions', content: 'loadContent'
    };
    if (loaders[tab]) this[loaders[tab]]();
  },

  // ===== 概览 =====
  async loadOverview() {
    const res = await admin('stats', {});
    if (res.ok) this.setData({ stats: res.stats });
    else if (res.code === 401) this.logout();
  },

  // ===== 检查汇总 =====
  onCheckName(e) { this.setData({ checkName: e.detail.value }); },
  toggleCheckProblem() { this.setData({ checkOnlyProblem: !this.data.checkOnlyProblem }, () => this.loadChecks()); },
  async loadChecks() {
    const res = await admin('listDailyChecks', { name: this.data.checkName, onlyProblem: this.data.checkOnlyProblem });
    if (res.ok) this.setData({ checks: res.list });
  },

  // ===== 意见箱 =====
  setSugFilter(e) { this.setData({ sugFilter: e.currentTarget.dataset.f }, () => this.loadSuggestions()); },
  async loadSuggestions() {
    const f = this.data.sugFilter;
    const res = await admin('listSuggestions', f === 'all' ? {} : { status: f });
    if (res.ok) this.setData({ suggestions: res.list });
  },
  async markHandled(e) {
    const id = e.currentTarget.dataset.id;
    const res = await admin('updateSuggestion', { id, status: '已处理' });
    if (res.ok) this.loadSuggestions();
  },

  // ===== 成绩 =====
  onExamName(e) { this.setData({ examName: e.detail.value }); },
  async loadExams() {
    const res = await admin('listExamScores', { name: this.data.examName });
    if (res.ok) this.setData({ exams: res.list });
  },

  // ===== 扣分 =====
  onDedName(e) { this.setData({ dedName: e.detail.value }); },
  async loadDeductions() {
    const res = await admin('listDeductions', { name: this.data.dedName });
    if (res.ok) this.setData({ deductions: res.list });
  },
  onDedForm(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ [`dedForm.${k}`]: e.detail.value });
  },
  async addDeduction() {
    const { name, points, reason } = this.data.dedForm;
    if (!name || !points) { wx.showToast({ title: '姓名和分值必填', icon: 'none' }); return; }
    const res = await admin('addDeduction', { name, points, reason });
    if (res.ok) {
      wx.showToast({ title: '已录入', icon: 'success' });
      this.setData({ dedForm: { name: '', points: '', reason: '' } });
      this.loadDeductions();
    }
  },
  async delDeduction(e) {
    const id = e.currentTarget.dataset.id;
    const r = await admin('deleteDeduction', { id });
    if (r.ok) this.loadDeductions();
  },

  // ===== 内容管理 =====
  setContentSub(e) { this.setData({ contentSub: e.currentTarget.dataset.s }, () => this.loadContent()); },
  async loadContent() {
    if (this.data.contentSub === 'rule') {
      const r = await admin('listRules', {});
      if (r.ok) this.setData({ rules: r.list });
    } else if (this.data.contentSub === 'quiz') {
      const r = await admin('listQuiz', {});
      if (r.ok) this.setData({ quizzes: r.list });
    }
  },
  onRuleForm(e) { this.setData({ [`ruleForm.${e.currentTarget.dataset.k}`]: e.detail.value }); },
  async addRule() {
    const f = this.data.ruleForm;
    if (!f.title || !f.content) { wx.showToast({ title: '标题/内容必填', icon: 'none' }); return; }
    const res = await admin('addRule', f);
    if (res.ok) { wx.showToast({ title: '已添加', icon: 'success' }); this.setData({ ruleForm: { category: '', title: '', content: '', keywords: '' } }); this.loadContent(); }
  },
  async delRule(e) { const r = await admin('deleteRule', { id: e.currentTarget.dataset.id }); if (r.ok) this.loadContent(); },

  onQuizForm(e) { this.setData({ [`quizForm.${e.currentTarget.dataset.k}`]: e.detail.value }); },
  setQuizType(e) { this.setData({ 'quizForm.type': e.currentTarget.dataset.t }); },
  async addQuiz() {
    const f = this.data.quizForm;
    if (!f.q) { wx.showToast({ title: '题干必填', icon: 'none' }); return; }
    const options = f.type === 'judge' ? ['正确', '错误'] : [f.o0, f.o1, f.o2, f.o3].filter(x => x && x.trim());
    if (options.length < 2) { wx.showToast({ title: '至少两个选项', icon: 'none' }); return; }
    const res = await admin('addQuiz', { type: f.type, q: f.q, options, answer: Number(f.answer), cat: f.cat });
    if (res.ok) { wx.showToast({ title: '已添加', icon: 'success' }); this.setData({ quizForm: { type: 'single', q: '', o0: '', o1: '', o2: '', o3: '', answer: '0', cat: '' } }); this.loadContent(); }
  },
  async delQuiz(e) { const r = await admin('deleteQuiz', { id: e.currentTarget.dataset.id }); if (r.ok) this.loadContent(); },

  onTrainForm(e) { this.setData({ [`trainForm.${e.currentTarget.dataset.k}`]: e.detail.value }); },
  async addTraining() {
    const f = this.data.trainForm;
    if (!f.title || !f.body) { wx.showToast({ title: '标题/内容必填', icon: 'none' }); return; }
    const res = await admin('addTraining', f);
    if (res.ok) { wx.showToast({ title: '已添加', icon: 'success' }); this.setData({ trainForm: { order: '', title: '', body: '' } }); }
  },

  // 改密码
  onNewPwd(e) { this.setData({ newPwd: e.detail.value }); },
  async changePwd() {
    if (this.data.newPwd.length < 4) { wx.showToast({ title: '至少4位', icon: 'none' }); return; }
    const res = await admin('changePassword', { newPassword: this.data.newPwd });
    if (res.ok) { wx.showToast({ title: '已修改', icon: 'success' }); this.setData({ newPwd: '' }); }
  }
});
