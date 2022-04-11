const app = getApp()
const config = require('../../config.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showShare: false,
    poster: JSON.parse(config.data).share_poster,
    username: '',
    roomlist: [],
    userInfo: {},
  },
  onShow() {
    console.log('wode', app.userInfo)
    // 检查本次缓存是否有用户信息
    const stroage = wx.getStorageSync('userInfo')
    // 没有-跳转到登录页
    if (!stroage) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    // 有-获取用户信息
    const userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    // userInfo挂载到变量上
    app.userInfo = userInfo
    this.setData({
      userinfo: userInfo,
    })

    // wx.login({
    //   success: function (res) {
    //     console.log(res)
    //   },
    //   fail: function () {
    //     // fail
    //   },
    //   complete: function () {
    //     // complete
    //   },
    // })
  },
  // onLoad: function (options) {
  //   this.setData({
  //     openid: app.openid,
  //   })
  // },
  goo() {
    if (!app.openid) {
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
    } else {
      wx.navigateTo({
        url: '../message/message',
      })
    }
  },
  go(e) {
    // if (e.currentTarget.dataset.status == '1') {
    //   if (!app.openid) {
    //     wx.showModal({
    //       title: '温馨提示',
    //       content: '该功能需要登录才可使用，是否马上去登录',
    //       success(res) {
    //         if (res.confirm) {
    //           wx.navigateTo({
    //             url: '/pages/login/login',
    //           })
    //         }
    //       },
    //     })
    //     return false
    //   }
    // }
    wx.navigateTo({
      url: e.currentTarget.dataset.go,
    })
  },
  //展示分享弹窗
  showShare() {
    this.setData({
      showShare: true,
    })
  },
  //关闭弹窗
  closePop() {
    this.setData({
      showShare: false,
    })
  },
  //预览图片
  preview(e) {
    wx.previewImage({
      urls: e.currentTarget.dataset.link.split(','),
    })
  },
  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start',
    }
  },
  // 用户点击右上角分享给好友,要先在分享好友这里设置menus的两个参数,才可以分享朋友圈
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },
  //用户点击右上角分享朋友圈
  onShareTimeline: function () {
    return {
      title: '',
      query: {
        key: value,
      },
      imageUrl: '',
    }
  },
  //获取授权的点击事件
  shouquan() {
    wx.requestSubscribeMessage({
      tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0'], //这里填入我们生成的模板id
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      },
    })
  },
  gooo() {
    wx.showToast({
      icon: 'none',
      title: '功能正在开发中',
      duration: 1000,
    })
  },
})
