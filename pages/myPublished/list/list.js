const app = getApp()
const db = wx.cloud.database()
const config = require('../../../config.js')
const _ = db.command
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    nomore: false,
    // list: JSON.parse(config.data).jlist,
    list: [],
    page: 1,
    limit: 20,
    tab: [
      {
        name: '全部',
        id: '',
      },
      {
        name: '已发布',
        id: 'Normal',
      },
      {
        name: '已下架',
        id: 'Draft',
      },
    ],
    tabid: '',
    detail: [],
    address: '',
  },
  //导航栏切换
  changeTab(e) {
    let that = this
    that.setData({
      tabid: e.currentTarget.dataset.id,
    })
    that.getlist()
  },
  //跳转详情页
  godetail(e) {
    let that = this
    let cid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?commodityId=' + cid,
    })
  },
  onShow() {
    this.getlist()
  },
  onLoad() {
    // wx.showLoading({
    //       title: '加载中',
    // })
    this.getlist()
  },
  //获取列表
  getlist() {
    let that = this
    let status = that.data.tabid
    const { page, limit } = this.data
    const cfg = JSON.parse(config.data)
    wx.request({
      url: config.apis.myPublishedCommodity + '/' + page + '/' + limit + `${status !== '' ? '?commodityStatus=' + status : ''}`,
      // data: {
      //   commodityStatus: status,
      // },
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
    // if (status == 0) {
    //   var statusid = _.neq(0) //除-2之外所有
    // } else {
    //   var statusid = parseInt(status) //小程序搜索必须对应格式
    // }
    // db.collection('order')
    //   .where({
    //     status: statusid,
    //     _openid: app.openid,
    //   })
    //   .orderBy('creat', 'desc')
    //   .get({
    //     success(re) {
    //       wx.stopPullDownRefresh() //暂停刷新动作
    //       that.setData({
    //         nomore: false,
    //         page: 0,
    //         list: re.data,
    //       })
    //       wx.hideLoading()
    //     },
    //   })
  },
  /**
   * 下架or重新上架商品
   */
  takeDown(e) {
    let that = this
    let cid = e.currentTarget.dataset.cid
    let isTakeDown = e.currentTarget.dataset.status
    console.log('isTakeDown', typeof isTakeDown)
    wx.showModal({
      title: '温馨提示',
      content: `您确认要${isTakeDown === 'true' ? '下架' : '重新上架'}此商品吗？`,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          // 网络请求
          wx.request({
            url: config.apis.operateCommodity,
            data: {
              commodityStatus: isTakeDown === 'true' ? 'Draft' : 'Normal',
              commodityId: cid,
            },
            header: {
              token: app.token,
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading()
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
                page: 1,
              })
              that.getlist()
            },
          })
          wx.hideLoading()
        }
      },
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getlist()
  },
  //删除商品
  delete(e) {
    let that = this
    let cid = e.currentTarget.dataset.cid
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除此商品吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          wx.request({
            url: config.apis.operateCommodity + '/' + cid,
            header: {
              token: app.token,
            },
            method: 'DELETE',
            success: function (res) {
              wx.hideLoading()
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
              that.getlist()
            },
          })
          wx.hideLoading()
        }
      },
    })
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
    let status = that.data.tabid
    // if (status == 0) {
    //   var statusid = _.neq(0) //除-2之外所有
    // } else {
    //   var statusid = parseInt(status) //小程序搜索必须对应格式
    // }
    // db.collection('order')
    //   .where({
    //     status: statusid,
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
