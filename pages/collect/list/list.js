const app = getApp()
// const db = wx.cloud.database()
const config = require('../../../config')
// const _ = db.command
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    scrollTop: 0,
    nomore: false,
    roomlist: [],
    buyerInfo: [],
    address: '',
    sellerInfo: '',
    page: 1,
    limit: 20,
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.getList()
  },
  onShow() {
    this.getList()
  },
  getList() {
    let that = this
    const { page, limit } = this.data
    const cfg = JSON.parse(config.data)
    wx.request({
      url: config.apis.favorites + '/' + page + '/' + limit,
      data: {},
      header: {
        token: app.token,
      },
      method: 'POST',
      success: function (res) {
        console.log('获取列表', res)
        const { code, message, data } = res.data
        if (code != 20000) {
          wx.showToast({
            icon: 'none',
            title: message,
            duration: 1000,
          })
          return false
        }
        that.setData({
          list: data.rows, // 商品列表
        })
      },
    })
    // that.setData({
    //   list: cfg.slist,
    // })
    wx.hideLoading()
  },
  detail(e) {
    const id = e.currentTarget.dataset.id
    console.log('xxxx', id)
    wx.navigateTo({
      url: '/pages/detail/detail?commodityId=' + id,
    })
  },
  cancelCollect(e) {
    const that = this
    wx.showLoading({
      title: '确认中',
    })
    const id = e.currentTarget.dataset.id
    wx.request({
      url: config.apis.favorites + '/' + id,
      data: {},
      method: 'DELETE',
      header: {
        token: app.token,
      },
      success: function (res) {
        wx.hideLoading()
        console.log('取消收藏结果', res)
        const { code, message, data } = res.data
        if (code != 20000) {
          wx.showToast({
            icon: 'none',
            title: message,
            duration: 1000,
          })
          return false
        }
        that.getList()
      },
    })
    wx.hideLoading()
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getList()
  },
  //至顶
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  //监测屏幕滚动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: parseInt(e.scrollTop * wx.getSystemInfoSync().pixelRatio),
    })
  },
  onReachBottom() {
    this.more()
  },
  //加载更多
  more() {
    let that = this
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1
    // db.collection('publish')
    //   .where({
    //     _openid: app.openid,
    //   })
    //   .orderBy('creat', 'desc')
    //   .skip(page * 20)
    //   .limit(20)
    //   .get({
    //     success: function (res) {
    //       if (res.data.length == 0) {
    //         that.setData({
    //           nomore: true,
    //         })
    //         return false
    //       }
    //       if (res.data.length < 20) {
    //         that.setData({
    //           nomore: true,
    //         })
    //       }
    //       that.setData({
    //         page: page,
    //         list: that.data.list.concat(res.data),
    //       })
    //     },
    //     fail() {
    //       wx.showToast({
    //         title: '获取失败',
    //         icon: 'none',
    //       })
    //     },
    //   })
  },
})
