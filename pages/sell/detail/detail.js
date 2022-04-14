const app = getApp()
const config = require('../../../config.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userinfo: [],
    creatTime: '',
    detail: [],
    status: Number,
    openid: app.openid,
  },
  onLoad: function (e) {
    if (app.openid) {
      this.setData({
        openid: app.openid,
      })
    } else {
      console.log('no openid')
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        },
      })
      return false
    }
    this.getdetail(e.id)
  },

  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //获取订单详情,差一个获取买家昵称
  getdetail(_id) {

  },
  //获取卖家信息
  getSeller(m) {
   
  },

  //确认收货
  confirm() {
   
  },
  //复制
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: (res) => {
        wx.showToast({
          title: '复制' + e.currentTarget.dataset.name + '成功',
          icon: 'success',
          duration: 1000,
        })
      },
    })
  },

  //历史记录
  history(name, num, type) {
    
  },

})
