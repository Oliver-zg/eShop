const db = wx.cloud.database()
const app = getApp()
const config = require('../../config.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ids: -1,
    wxnum: '',
    qqnum: '',
    email: '',
    checked: false,
    campus: JSON.parse(config.data).campus,
  },
  onChange(event) {
    if (event.detail == true) {
      wx.requestSubscribeMessage({
        tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0', 'XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
        success(res) {
          console.log('授权成功', res)
        },
        fail(res) {
          console.log('授权失败', res)
        },
      })
    }
    this.setData({
      checked: event.detail,
    })
  },

  choose(e) {
    let that = this
    that.setData({
      ids: e.detail.value,
    })
    //下面这种办法无法修改页面数据
    /* this.data.ids = e.detail.value;*/
  },

  getUserProfile(e) {
    let that = this
    wx.getUserProfile({
      desc: '用于完善资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        const { userInfo } = res
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true,
        })
        // 本地缓存用户名、头像
        const userInfoString = JSON.stringify(userInfo)
        wx.setStorageSync('userInfo', userInfoString)
        app.userInfo = userInfo
        // 登录
        wx.login({
          success(res) {
            console.log(res)
            if (res.code) {
              //发起网络请求
              wx.request({
                url: config.apis.login + '/' + res.code,
                success: function (res) {
                  console.log('token', res)
                  app.token = res.data.data.token
                  app.userId = res.data.data.userId
                  wx.setStorageSync('token', res.data.data.token)
                  wx.setStorageSync('userId', res.data.data.userId)
                  that.updateUserInfo(res.data.data.userId)
                  wx.navigateBack({
                    delta: 1,
                  })
                },
              })
            } else {
              wx.showToast({
                icon: 'none',
                title: '登录失败！',
                duration: 1000,
              })
              // console.log('登录失败！' + res.errMsg)
            }
          },
        })
      },
    })
  },
  //更新用户信息
  updateUserInfo(userId) {
    wx.request({
      url: config.apis.updateUserInfo,
      data: {
        id: userId,
        avatar: app.userInfo.avatarUrl,
        city: app.userInfo.city,
        country: app.userInfo.country,
        nickname: app.userInfo.nickName,
        sex: app.userInfo.gender,
        province: app.userInfo.province,
      },
      method: 'POST',
      header: { token: app.token }, // 设置请求的 header
      success: function (res) {
        console.log('更新用户信息', res)
        const { code, message, data } = res.data
        if (code != 20000) {
          console.log('更新用户信息失败', message)
        }
      },
    })
  },
  //获取授权的点击事件
  authorize() {
    wx.requestSubscribeMessage({
      tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0', 'XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //生成的模板id
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      },
    })
  },
  back() {
    wx.switchTab({
      url: '/pages/my/my',
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      },
    })
  },
})
