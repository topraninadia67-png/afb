// 管理员端云函数（按 action 路由，除 login 外均需有效 token）
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const TOKEN_TTL = 1000 * 60 * 60 * 8; // 8 小时

function sha256(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }

async function verifyToken(token) {
  if (!token) return false;
  const res = await db.collection('config').where({ key: 'session:' + token }).get();
  if (res.data.length === 0) return false;
  if (Date.now() > res.data[0].exp) {
    await db.collection('config').doc(res.data[0]._id).remove().catch(() => {});
    return false;
  }
  return true;
}

exports.main = async (event) => {
  const { action, token, payload = {} } = event;

  // ===== 登录：校验密码，下发 token =====
  if (action === 'login') {
    const { password } = payload;
    const cfg = await db.collection('config').where({ key: 'admin' }).get();
    if (cfg.data.length === 0) return { ok: false, msg: '系统未初始化，请先运行 init 云函数' };
    if (cfg.data[0].pwdHash !== sha256(password)) return { ok: false, msg: '密码错误' };
    const t = crypto.randomBytes(24).toString('hex');
    await db.collection('config').add({ data: { key: 'session:' + t, exp: Date.now() + TOKEN_TTL } });
    return { ok: true, token: t };
  }

  // 其余操作均需有效 token
  if (!(await verifyToken(token))) return { ok: false, code: 401, msg: '未登录或登录已过期' };

  switch (action) {
    // ===== 仪表盘统计 =====
    case 'stats': {
      const today = new Date().toISOString().slice(0, 10);
      const [checkToday, checkAll, sugNew, examAll, dedAll] = await Promise.all([
        db.collection('daily_checks').where({ date: today }).count(),
        db.collection('daily_checks').count(),
        db.collection('suggestions').where({ status: '未处理' }).count(),
        db.collection('exam_records').count(),
        db.collection('deductions').count()
      ]);
      return { ok: true, stats: {
        checkToday: checkToday.total, checkAll: checkAll.total,
        sugNew: sugNew.total, examAll: examAll.total, dedAll: dedAll.total
      } };
    }

    // ===== 日常检查汇总 =====
    case 'listDailyChecks': {
      const { date, name, onlyProblem } = payload;
      const w = {};
      if (date) w.date = date;
      if (name) w.name = db.RegExp({ regexp: name, options: 'i' });
      if (onlyProblem) w.problems = _.gt(0);
      const res = await db.collection('daily_checks').where(w)
        .orderBy('createdAt', 'desc').limit(100).get();
      return { ok: true, list: res.data };
    }

    // ===== 匿名意见箱 =====
    case 'listSuggestions': {
      const { status } = payload;
      const w = status ? { status } : {};
      const res = await db.collection('suggestions').where(w)
        .orderBy('createdAt', 'desc').limit(200).get();
      return { ok: true, list: res.data };
    }
    case 'updateSuggestion': {
      const { id, status, reply = '' } = payload;
      await db.collection('suggestions').doc(id).update({ data: { status, reply, handledAt: Date.now() } });
      return { ok: true };
    }

    // ===== 考试成绩 =====
    case 'listExamScores': {
      const { name } = payload;
      const w = name ? { name: db.RegExp({ regexp: name, options: 'i' }) } : {};
      const res = await db.collection('exam_records').where(w)
        .orderBy('createdAt', 'desc').limit(200).get();
      return { ok: true, list: res.data };
    }

    // ===== 扣分管理 =====
    case 'listDeductions': {
      const { name } = payload;
      const w = name ? { name: db.RegExp({ regexp: name, options: 'i' }) } : {};
      const res = await db.collection('deductions').where(w)
        .orderBy('createdAt', 'desc').limit(200).get();
      return { ok: true, list: res.data };
    }
    case 'addDeduction': {
      const { name, points, reason, date } = payload;
      if (!name || !points) return { ok: false, msg: '姓名和分值必填' };
      await db.collection('deductions').add({
        data: { name, points: Number(points), reason: reason || '', date: date || new Date().toISOString().slice(0, 10), createdAt: Date.now() }
      });
      return { ok: true };
    }
    case 'deleteDeduction': {
      await db.collection('deductions').doc(payload.id).remove();
      return { ok: true };
    }

    // ===== 内容管理：制度 / 题库 / 培训 =====
    case 'addRule': {
      const { category, title, content, keywords } = payload;
      if (!title || !content) return { ok: false, msg: '标题和内容必填' };
      await db.collection('rules').add({ data: {
        category: category || '未分类', title, content,
        keywords: Array.isArray(keywords) ? keywords : String(keywords || '').split(/[,，\s]+/).filter(Boolean),
        createdAt: Date.now()
      } });
      return { ok: true };
    }
    case 'deleteRule': { await db.collection('rules').doc(payload.id).remove(); return { ok: true }; }

    case 'addQuiz': {
      const { type, q, options, answer, cat } = payload;
      if (!q || !Array.isArray(options) || answer == null) return { ok: false, msg: '题目/选项/答案必填' };
      await db.collection('quiz').add({ data: { type: type || 'single', q, options, answer: Number(answer), cat: cat || '通用', createdAt: Date.now() } });
      return { ok: true };
    }
    case 'deleteQuiz': { await db.collection('quiz').doc(payload.id).remove(); return { ok: true }; }
    case 'listQuiz': {
      const res = await db.collection('quiz').orderBy('createdAt', 'desc').limit(200).get();
      return { ok: true, list: res.data };
    }
    case 'listRules': {
      const res = await db.collection('rules').orderBy('createdAt', 'asc').limit(200).get();
      return { ok: true, list: res.data };
    }

    case 'addTraining': {
      const { order, title, body } = payload;
      if (!title || !body) return { ok: false, msg: '标题和内容必填' };
      await db.collection('training').add({ data: { order: Number(order) || 99, title, body, createdAt: Date.now() } });
      return { ok: true };
    }
    case 'deleteTraining': { await db.collection('training').doc(payload.id).remove(); return { ok: true }; }

    // ===== 修改管理员密码 =====
    case 'changePassword': {
      const { newPassword } = payload;
      if (!newPassword || newPassword.length < 4) return { ok: false, msg: '新密码至少 4 位' };
      const cfg = await db.collection('config').where({ key: 'admin' }).get();
      await db.collection('config').doc(cfg.data[0]._id).update({ data: { pwdHash: sha256(newPassword), updatedAt: Date.now() } });
      return { ok: true };
    }

    default:
      return { ok: false, msg: '未知操作: ' + action };
  }
};
