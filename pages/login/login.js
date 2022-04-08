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
  wxInput(e) {
    this.data.wxnum = e.detail.value
  },
  qqInput(e) {
    this.data.qqnum = e.detail.value
  },
  emInput(e) {
    this.data.email = e.detail.value
  },
  getUserInfo(e) {
    let that = this
    console.log(e)
    // let test = e.detail.errMsg.indexOf("ok");

    // if (test == '-1') {
    //       wx.showToast({
    //             title: '请授权后方可使用',
    //             icon: 'none',
    //             duration: 2000
    //       });
    // } else {
    //       that.setData({
    //             userInfo: e.detail.userInfo
    //       })
    //       // that.check();
    // }
  },
  //校检
  check() {
    let that = this

    //校检校区
    let ids = that.data.ids
    let campus = that.data.campus
    // 检验授权选项
    let event = that.data.checked
    if (event == false) {
      wx.showToast({
        title: '请授权订单提醒',
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    wx.showLoading({
      title: '正在提交',
    })
    db.collection('user').add({
      data: {
        phone: that.data.phone,
        campus: that.data.campus[that.data.ids],
        qqnum: that.data.qqnum,
        email: that.data.email,
        wxnum: that.data.wxnum,
        stamp: new Date().getTime(),
        info: that.data.userInfo,
        useful: true,
        parse: 0,
      },
      success: function (res) {
        console.log(res)
        db.collection('user')
          .doc(res._id)
          .get({
            success: function (res) {
              app.userinfo = res.data
              app.openid = res.data._openid
              wx.navigateBack({})
            },
          })
      },
      fail() {
        wx.hideLoading()
        wx.showToast({
          title: '注册失败，请重新提交',
          icon: 'none',
        })
      },
    })
  },
  getUserProfile(e) {
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
            wx.navigateBack({
              delta: 1,
            })
            if (res.code) {
              //发起网络请求
              wx.request({
                url: config.apis.login + '/' + res.code,
                success: function (res) {
                  console.log('token', res)
                  app.token = res.data.data.token
                  wx.setStorageSync('token', res.data.data.token)
                },
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          },
        })
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
