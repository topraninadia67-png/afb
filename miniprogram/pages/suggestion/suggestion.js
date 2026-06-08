const { member } = require('../../utils/api');

Page({
  data: {
    cats: ['管理建议', '安全隐患', '后勤保障', '演出相关', '投诉', '其他'],
    catIndex: 0,
    content: '',
    submitted: false
  },

  onCat(e) { this.setData({ catIndex: e.detail.value }); },
  onContent(e) { this.setData({ content: e.detail.value }); },

  async submit() {
    const content = (this.data.content || '').trim();
    if (!content) { wx.showToast({ title: '请填写意见内容', icon: 'none' }); return; }
    const res = await member('submitSuggestion', {
      content, category: this.data.cats[this.data.catIndex]
    });
    if (res.ok) this.setData({ submitted: true, content: '' });
  },

  again() { this.setData({ submitted: false }); }
});
