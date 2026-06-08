const { member } = require('../../utils/api');

Page({
  data: { list: [], openId: '' },

  onLoad() { this.load(); },

  async load() {
    const res = await member('getTraining', {});
    if (res.ok) this.setData({ list: res.list });
  },

  toggle(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ openId: this.data.openId === id ? '' : id });
  },

  startExam() { wx.navigateTo({ url: '/pages/exam/exam' }); }
});
