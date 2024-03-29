const app = getApp()
const config = require('../../../config.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    nomore: false,
    list: [],
    page: 1,
    limit: 20,
    tab: [
      {
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
        name: '待收货',
        id: 2,
      },
      {
        name: '已完成',
        id: 3,
      },
      {
        name: '已取消',
        id: 4,
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
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order/detail/detail?id=' + id,
    })
  },
  onShow() {
    this.getlist()
  },
  onLoad() {
    this.getlist()
  },
  //获取列表
  getlist() {
    let that = this
    let status = that.data.tabid
    const { page, limit } = this.data
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: config.apis.mySoldCommodity + '/' + page + '/' + limit + `${status !== '' ? '?orderStatus=' + status : ''}`,
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
    wx.hideLoading()
  },
  /**
   * 商品发货
   */
  ship(e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '温馨提示',
      content: `是否确认发货？`,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          // 网络请求
          wx.request({
            url: config.apis.deliverOrder + id,
            data: {},
            header: {
              token: app.token,
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading()
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
  //下拉刷新
  onPullDownRefresh() {
    this.getlist()
  },
  //删除订单
  delete(e) {
    let that = this
    let id = e.currentTarget.dataset.id
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
  },
})
