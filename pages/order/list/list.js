const app = getApp()
const db = wx.cloud.database()
const config = require('../../../config.js')
const _ = db.command
Page({
      data: {
            // list: JSON.parse(config.data).jlist,
            list: [],
            page: 1,
            limit: 20,
            scrollTop: 0,
            nomore: false,
            tab: [{
                        name: '全部',
                        id: '',
                  },
                  {
                        name: '未支付',
                        id: 0,
                  },
                  {
                        name: '待发货',
                        id: 1,
                  },
                  {
                        name: '已发货',
                        id: 2,
                  },
                  {
                        name: '已完成',
                        id: 3,
                  },
                  {
                        name: '已取消',
                        id: 4,
                  }
            ],
            tabid: '',
            detail: [],
            address: ''
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
    let orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order/detail/detail?id=' + orderId,
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
    console.log('status', status)
    wx.request({
      url: config.apis.myPurchasedCommodity + page + '/' + limit + `${status !== '' ? '?orderStatus=' + status : ''}`,
      // data: {
      //   orderStatus: status,
      // },
      header: {
        token: app.token,
      },
      method: 'POST',
      success: function (res) {
        console.log('获取购买列表', res)
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
          list: data.rows,
        })
      },
    })
  },
  /**
   * 获取地址
   */
  getAddress() {
    let that = this
    if (that.data.detail.deliveryid == 0) {
      that.setData({
        address: that.data.detail.ztplace,
      })
    } else {
      that.setData({
        address: that.data.detail.psplace,
      })
    }
  },
  //取消订单
  cancel(e) {
      let that = this
      let id = e.currentTarget.dataset.ord.orderId
      console.log("id",e.currentTarget.dataset.ord.orderId)
      wx.showModal({
        title: '温馨提示',
        content: '您确认要取消此订单吗？',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在处理',
            })
            wx.request({
              url: config.apis.cancelOrder + id,
              header: {
                token: app.token,
              },
              method: 'POST',
              success: function (res) {
                wx.hideLoading()
                const { code, message } = res.data
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

  //下拉刷新
  onPullDownRefresh() {
    this.getlist()
  },
  //确认收货
  confirm(e) {
    let that = this
    let id = e.currentTarget.dataset.ord
    wx.showModal({
      title: '温馨提示',
      content: '您确认已收货吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          wx.request({
            url: config.apis.receiveOrder + id,
            header: {
              token: app.token,
            },
            method: 'POST',
            success: function (res) {
              console.log("确认收货",res)
              wx.hideLoading()
              const { code, message } = res.data
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

  //删除订单
  delete(ord) {
    let that = this
    let detail = ord.currentTarget.dataset.ord
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除此订单吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          db.collection('order')
            .doc(detail._id)
            .remove({
              success() {
                that.getlist()
              },
              fail: console.error,
            })
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
    // this.setData({
    //   scrollTop: parseInt(e.scrollTop * wx.getSystemInfoSync().pixelRatio),
    // })
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
    if (status == 0) {
      var statusid = _.neq(0) //除-2之外所有
    } else {
      var statusid = parseInt(status) //小程序搜索必须对应格式
    }
    db.collection('order')
      .where({
        status: statusid,
        _openid: app.openid,
      })
      .orderBy('creat', 'desc')
      .skip(page * 20)
      .limit(20)
      .get({
        success: function (res) {
          if (res.data.length == 0) {
            that.setData({
              nomore: true,
            })
            return false
          }
          if (res.data.length < 20) {
            that.setData({
              nomore: true,
            })
          }
          that.setData({
            page: page,
            list: that.data.list.concat(res.data),
          })
        },
        fail() {
          wx.showToast({
            title: '获取失败',
            icon: 'none',
          })
        },
      })
  },
})
