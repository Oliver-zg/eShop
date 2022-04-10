const config = require('config.js')

App({
  // globalData: {
  //   userInfo: {},
  // },
  token: '',
  userInfo: '',
  roomlist: [],
  canReflect: true,
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: JSON.parse(config.data).env,
        traceUser: true,
      })
    }

    // 检查本次缓存是否有用户信息
    const stroage = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    const userId = wx.getStorageSync('userId')
    // 没有-跳转到登录页
    if (!stroage || !token) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    // 有-获取用户信息
    const userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    // userInfo挂载到变量上
    this.userInfo = userInfo
    this.token = token
    this.userId = userId
    console.log(token)
    wx.switchTab({
      url: '/pages/index/index',
      success: function (res) {
        // success
      },
    })
  },
})
