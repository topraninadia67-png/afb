// 初始化云函数：建集合默认数据 + 写入示例制度/题库/培训/管理员密码
// 用法：在云开发控制台或开发者工具中“云函数 -> init -> 云端测试”运行一次即可。
// 传入 { adminPassword: 'xxx' } 可自定义管理员密码，默认 qgq2026
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const seed = require('./seed');

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

// 集合不存在时创建（忽略已存在错误）
async function ensureCollection(name) {
  try { await db.createCollection(name); } catch (e) { /* 已存在 */ }
}

exports.main = async (event) => {
  const collections = ['config', 'rules', 'quiz', 'training', 'daily_checks', 'suggestions', 'exam_records', 'deductions'];
  for (const c of collections) await ensureCollection(c);

  const log = {};

  // 管理员密码（哈希存储）
  const pwd = event.adminPassword || 'qgq2026';
  const cfg = await db.collection('config').where({ key: 'admin' }).get();
  if (cfg.data.length === 0) {
    await db.collection('config').add({ data: { key: 'admin', pwdHash: sha256(pwd), updatedAt: Date.now() } });
    log.admin = '已创建管理员密码';
  } else {
    log.admin = '管理员密码已存在（如需重置请删除 config 集合中 key=admin 的记录后重跑）';
  }

  // 制度库
  const r = await db.collection('rules').count();
  if (r.total === 0) {
    for (const item of seed.rules) await db.collection('rules').add({ data: { ...item, createdAt: Date.now() } });
    log.rules = `已写入 ${seed.rules.length} 条制度`;
  } else { log.rules = `制度库已有 ${r.total} 条，跳过`; }

  // 题库
  const q = await db.collection('quiz').count();
  if (q.total === 0) {
    for (const item of seed.quiz) await db.collection('quiz').add({ data: { ...item, createdAt: Date.now() } });
    log.quiz = `已写入 ${seed.quiz.length} 道题`;
  } else { log.quiz = `题库已有 ${q.total} 道，跳过`; }

  // 培训资料
  const t = await db.collection('training').count();
  if (t.total === 0) {
    for (const item of seed.training) await db.collection('training').add({ data: { ...item, createdAt: Date.now() } });
    log.training = `已写入 ${seed.training.length} 篇培训资料`;
  } else { log.training = `培训资料已有 ${t.total} 篇，跳过`; }

  return { ok: true, log };
};
