// 三亚千古情艺术团管理小程序
App({
  globalData: {
    // 云开发环境 ID —— 开通云开发后在控制台获取，替换这里
    cloudEnv: 'your-env-id',
    memberName: '',     // 当前团员姓名
    isAdmin: false,     // 是否已通过管理员密码验证
    adminToken: ''      // 管理员会话令牌（云端下发）
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('当前微信版本过低，请升级后使用云能力');
      return;
    }
    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    });

    // 恢复本地保存的身份
    const name = wx.getStorageSync('memberName');
    if (name) this.globalData.memberName = name;
  }
});
