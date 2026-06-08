const app = getApp();
const { member } = require('../../utils/api');

const AREAS = ['化妆间', '排练厅', '舞台/后台', '公共区域', '消防设施', '宿舍', '其他'];
const TEMPLATE = [
  '消防通道畅通无堆物',
  '灭火器完好且在位',
  '电器电源已关闭无隐患',
  '区域卫生整洁',
  '道具/服装归位',
  '安全出口标识清晰',
  '无明火/吸烟现象'
];

Page({
  data: {
    name: '',
    areas: AREAS,
    areaIndex: 0,
    items: [],
    note: '',
    tab: 'fill',   // fill | history
    history: []
  },

  onLoad() {
    this.setData({
      name: app.globalData.memberName,
      items: TEMPLATE.map(t => ({ name: t, ok: true }))
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    if (tab === 'history') this.loadHistory();
  },

  onAreaChange(e) { this.setData({ areaIndex: e.detail.value }); },
  toggleItem(e) {
    const i = e.currentTarget.dataset.i;
    this.setData({ [`items[${i}].ok`]: !this.data.items[i].ok });
  },
  onNote(e) { this.setData({ note: e.detail.value }); },

  async submit() {
    const { name, areas, areaIndex, items, note } = this.data;
    const res = await member('submitDailyCheck', {
      name, area: areas[areaIndex], items, note,
      date: new Date().toISOString().slice(0, 10)
    });
    if (res.ok) {
      wx.showToast({ title: res.problems > 0 ? `已提交，${res.problems}项异常` : '已提交，全部正常', icon: 'none' });
      this.setData({ items: TEMPLATE.map(t => ({ name: t, ok: true })), note: '' });
    }
  },

  async loadHistory() {
    const res = await member('myDailyChecks', { name: this.data.name });
    if (res.ok) this.setData({ history: res.list });
  }
});
