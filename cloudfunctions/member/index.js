// 团员端云函数（按 action 路由）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 洗牌取前 n 个
function sample(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, payload = {} } = event;

  switch (action) {
    // ===== 日常检查填报 =====
    case 'submitDailyCheck': {
      const { name, area, items = [], note = '', date } = payload;
      if (!name || !area) return { ok: false, msg: '姓名和检查区域必填' };
      const problems = items.filter(i => !i.ok).length;
      const res = await db.collection('daily_checks').add({
        data: { openid: OPENID, name, area, items, note, problems, date: date || new Date().toISOString().slice(0, 10), createdAt: Date.now() }
      });
      return { ok: true, id: res._id, problems };
    }

    case 'myDailyChecks': {
      const { name } = payload;
      const res = await db.collection('daily_checks')
        .where({ openid: OPENID })
        .orderBy('createdAt', 'desc').limit(30).get();
      return { ok: true, list: res.data };
    }

    // ===== 制度查询（关键词检索）=====
    case 'getRules': {
      const { kw = '' } = payload;
      let q = db.collection('rules');
      const res = await q.orderBy('createdAt', 'asc').limit(100).get();
      let list = res.data;
      if (kw.trim()) {
        const k = kw.trim();
        list = list.filter(r =>
          (r.title && r.title.includes(k)) ||
          (r.content && r.content.includes(k)) ||
          (r.category && r.category.includes(k)) ||
          (Array.isArray(r.keywords) && r.keywords.some(w => k.includes(w) || w.includes(k)))
        );
      }
      return { ok: true, list };
    }

    // ===== 扣分查询（查自己）=====
    case 'myDeductions': {
      const { name } = payload;
      if (!name) return { ok: false, msg: '请先填写姓名' };
      const res = await db.collection('deductions')
        .where({ name })
        .orderBy('createdAt', 'desc').limit(100).get();
      const total = res.data.reduce((s, d) => s + (Number(d.points) || 0), 0);
      return { ok: true, list: res.data, total };
    }

    // ===== 培训资料 =====
    case 'getTraining': {
      const res = await db.collection('training').orderBy('order', 'asc').limit(50).get();
      return { ok: true, list: res.data };
    }

    // ===== 随机出题 =====
    case 'getQuiz': {
      const { count = 10 } = payload;
      const res = await db.collection('quiz').limit(200).get();
      const picked = sample(res.data, count).map(q => ({
        _id: q._id, type: q.type, q: q.q, options: q.options, cat: q.cat
        // 注意：不返回 answer，防止前端作弊
      }));
      return { ok: true, list: picked };
    }

    // ===== 提交考试（云端判分）=====
    case 'submitExam': {
      const { name, answers = [] } = payload; // answers: [{id, choice}]
      if (!name) return { ok: false, msg: '请先填写姓名' };
      if (!answers.length) return { ok: false, msg: '没有作答记录' };
      const ids = answers.map(a => a.id);
      const qres = await db.collection('quiz').where({ _id: _.in(ids) }).get();
      const map = {};
      qres.data.forEach(q => { map[q._id] = q; });
      let correct = 0;
      const detail = answers.map(a => {
        const q = map[a.id];
        const right = q && Number(q.answer) === Number(a.choice);
        if (right) correct++;
        return { id: a.id, choice: a.choice, correct: !!right, answer: q ? q.answer : null };
      });
      const total = answers.length;
      const score = Math.round((correct / total) * 100);
      await db.collection('exam_records').add({
        data: { openid: OPENID, name, score, correct, total, pass: score >= 60, createdAt: Date.now() }
      });
      return { ok: true, score, correct, total, pass: score >= 60, detail };
    }

    case 'myExams': {
      const res = await db.collection('exam_records')
        .where({ openid: OPENID }).orderBy('createdAt', 'desc').limit(20).get();
      return { ok: true, list: res.data };
    }

    // ===== 匿名意见箱（仅写入，团员不可读）=====
    case 'submitSuggestion': {
      const { content, category = '其他' } = payload;
      if (!content || !content.trim()) return { ok: false, msg: '请填写意见内容' };
      // 匿名：不记录 openid / 姓名
      await db.collection('suggestions').add({
        data: { content: content.trim(), category, status: '未处理', createdAt: Date.now() }
      });
      return { ok: true };
    }

    default:
      return { ok: false, msg: '未知操作: ' + action };
  }
};
