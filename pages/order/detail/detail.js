const app = getApp()
const db = wx.cloud.database()
const config = require('../../../config.js')
const _ = db.command
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
    appreciateCode: '',
    address: '',
    buyerInfo: [],
    commodityId: '',
    sellerInfo: {},
    commodity: {},
    imageUrls: [],
    orderId:""
  },
  onLoad: function (e) {
    this.data.orderId = e.id
    this.getOrderDetail(e.id)
    //this.getcommodityDetail(e.id)
  },
  //获取订单详情
  getOrderDetail(id){
    let that = this
    wx.request({
      url: config.apis.getOrder + '/' + id,
      data: {},
      method: 'POST',
      header: { token: app.token }, // 设置请求的 header
      success: function (res) {
        console.log('获取订单详情', res)
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
          oreder: data.orderInfo, // 商品详情
        })
        that.getcommodityDetail(data.orderInfo.commodityId)
      },
    })

  },
    //获取商品详情
    getcommodityDetail(id) {
      let that = this
      wx.request({
        url: config.apis.getCommodityList + '/' + id,
        data: {},
        method: 'GET',
        header: { token: app.token }, // 设置请求的 header
        success: function (res) {
          console.log('获取商品详情', res)
          const { code, message, data } = res.data
          if (code != 20000) {
            wx.showToast({
              icon: 'none',
              title: message,
              duration: 1000,
            })
            return false
          }
          console.log('轮播', data.commodity.commodityCover.split(','))
          that.setData({
            commodity: data.commodity, // 商品详情
            imageUrls: data.commodity.commodityCover.split(','),
          })
          that.getSeller(data.commodity.userId)
        },
      })
    },
    //获取卖家信息
    getSeller(userId) {
      let that = this
      console.log('user', userId)
      wx.request({
        url: config.apis.getOtherUserInfo + '/' + userId,
        data: {},
        method: 'GET',
        header: {}, // 设置请求的 header
        success: function (res) {
          console.log('获取其他用户详情', res)
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
            sellerInfo: data.userInfo, // 卖家详情
            sellerId: data.userInfo.id,
          })
        },
      })
    },

  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  goChartRoom() {
    // 通过双方id获取聊天室id
    wx.navigateTo({
      url: `/pages/detail/room/room?senderId=${this.data.oreder.buyerId}&reciveId=${this.data.oreder.sellerId}`,
    })
  },
  //图片点击事件
  img: function (event) {
    let arr = []
    arr.push(this.data.appreciateCode)
    wx.previewImage({
      current: 'current', // 当前显示图片的http链接
      urls: arr, // 需要预览的图片http链接列表
    })
  },
})
