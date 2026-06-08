const { member } = require('../../utils/api');

Page({
  data: {
    kw: '',
    quick: ['消防', '考勤', '请假', '舞台安全', '演出纪律', '卫生'],
    results: [],
    searched: false,
    expanded: {}
  },

  onLoad() { this.search(); },

  onInput(e) { this.setData({ kw: e.detail.value }); },

  quickSearch(e) {
    this.setData({ kw: e.currentTarget.dataset.kw }, () => this.search());
  },

  async search() {
    const res = await member('getRules', { kw: this.data.kw });
    if (res.ok) this.setData({ results: res.list, searched: true, expanded: {} });
  },

  toggle(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ [`expanded.${id}`]: !this.data.expanded[id] });
  }
});
