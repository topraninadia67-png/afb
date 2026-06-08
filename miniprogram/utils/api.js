// 云函数调用封装
const app = getApp();

function call(name, action, payload, token) {
  wx.showLoading({ title: '加载中', mask: true });
  return wx.cloud.callFunction({
    name,
    data: { action, payload, token }
  }).then(res => {
    wx.hideLoading();
    const r = res.result || {};
    if (!r.ok && r.msg) wx.showToast({ title: r.msg, icon: 'none' });
    return r;
  }).catch(err => {
    wx.hideLoading();
    console.error(name, action, err);
    wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    return { ok: false, msg: '网络异常' };
  });
}

// 团员接口
const member = (action, payload) => call('member', action, payload);
// 管理员接口（自动带 token）
const admin = (action, payload) => call('admin', action, payload, app.globalData.adminToken);

module.exports = { call, member, admin };
