const app = getApp();
const { member } = require('../../utils/api');

Page({
  data: { name: '', list: [], total: 0, loaded: false },

  onLoad() {
    this.setData({ name: app.globalData.memberName });
    this.load();
  },

  async load() {
    const res = await member('myDeductions', { name: this.data.name });
    if (res.ok) this.setData({ list: res.list, total: res.total, loaded: true });
  }
});
