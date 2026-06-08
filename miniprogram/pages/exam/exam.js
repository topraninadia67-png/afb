const app = getApp();
const { member } = require('../../utils/api');

Page({
  data: {
    name: '',
    questions: [],
    answers: {},      // { qid: choiceIndex }
    stage: 'doing',   // doing | result
    result: null,
    count: 10
  },

  onLoad() {
    this.setData({ name: app.globalData.memberName });
    this.loadQuiz();
  },

  async loadQuiz() {
    const res = await member('getQuiz', { count: this.data.count });
    if (res.ok) this.setData({ questions: res.list, answers: {}, stage: 'doing', result: null });
  },

  choose(e) {
    const { qid, idx } = e.currentTarget.dataset;
    this.setData({ [`answers.${qid}`]: idx });
  },

  async submit() {
    const { questions, answers } = this.data;
    const unanswered = questions.filter(q => answers[q._id] === undefined);
    if (unanswered.length) {
      wx.showToast({ title: `还有 ${unanswered.length} 题未作答`, icon: 'none' });
      return;
    }
    const payload = {
      name: this.data.name,
      answers: questions.map(q => ({ id: q._id, choice: answers[q._id] }))
    };
    const res = await member('submitExam', payload);
    if (res.ok) {
      // 合并解析到题目，标记对错
      const detailMap = {};
      res.detail.forEach(d => { detailMap[d.id] = d; });
      const reviewed = questions.map(q => ({
        ...q,
        myChoice: answers[q._id],
        correctAnswer: detailMap[q._id] ? detailMap[q._id].answer : null,
        isCorrect: detailMap[q._id] ? detailMap[q._id].correct : false
      }));
      this.setData({ stage: 'result', result: res, questions: reviewed });
      wx.pageScrollTo({ scrollTop: 0 });
    }
  },

  retry() { this.loadQuiz(); },
  goBack() { wx.navigateBack(); }
});
