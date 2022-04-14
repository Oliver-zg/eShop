const config = require('config.js')

App({
  token: '',
  userInfo: '',
  onLaunch: function () {
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
      url: '/pages/index/index'
    })
  },
})
