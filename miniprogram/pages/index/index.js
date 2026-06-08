const app = getApp();

Page({
  data: {
    name: '',
    editingName: false,
    features: [
      { key: 'daily', icon: '📋', title: '日常检查汇总', desc: '填报每日检查情况', url: '/pages/daily/daily' },
      { key: 'rules', icon: '📖', title: '制度查询', desc: '智能检索各项制度', url: '/pages/rules/rules' },
      { key: 'deduction', icon: '➖', title: '扣分查询', desc: '查看本人扣分记录', url: '/pages/deduction/deduction' },
      { key: 'training', icon: '🎓', title: '安全培训 / 考试', desc: '学习资料 + 随机出题', url: '/pages/training/training' },
      { key: 'suggestion', icon: '✉️', title: '匿名意见箱', desc: '匿名提交意见建议', url: '/pages/suggestion/suggestion' }
    ]
  },

  onShow() {
    const name = app.globalData.memberName || wx.getStorageSync('memberName') || '';
    this.setData({ name, editingName: !name });
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },

  saveName() {
    const name = (this.data.name || '').trim();
    if (!name) { wx.showToast({ title: '请输入姓名', icon: 'none' }); return; }
    app.globalData.memberName = name;
    wx.setStorageSync('memberName', name);
    this.setData({ editingName: false });
    wx.showToast({ title: '欢迎，' + name, icon: 'none' });
  },

  editName() { this.setData({ editingName: true }); },

  go(e) {
    const url = e.currentTarget.dataset.url;
    if (!app.globalData.memberName) {
      wx.showToast({ title: '请先填写姓名', icon: 'none' });
      this.setData({ editingName: true });
      return;
    }
    wx.navigateTo({ url });
  },

  goAdmin() { wx.navigateTo({ url: '/pages/admin/admin' }); }
});
