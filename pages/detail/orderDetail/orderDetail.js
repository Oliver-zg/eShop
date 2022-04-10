const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
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
            address:'',
            buyerInfo:[],
            //
            commodityId:'',
            sellerInfo:{},
            commodity:{},
            imageUrls:[]



      },
      onLoad(e) {

            this.data.commodityId = e.Id
            this.getcommodityDetail(e.Id)
          },
          //获取商品详情
          getcommodityDetail(id){
            let that = this
            console.log('获取商品详情id', id)
            console.log('app.token', app.token)
            wx.request({
                url: config.apis.getCommodityList + '/' +id,
                data: {},
                method: 'GET',
                 header: {token:app.token}, // 设置请求的 header
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
                  console.log("轮播",data.commodity.commodityCover.split(","))
                  that.setData({
                    commodity: data.commodity, // 商品详情
                    imageUrls:data.commodity.commodityCover.split(","),
                  })
                  that.getSeller(data.commodity.userId)
                },
                fail: function () {
                  // fail
                },
                complete: function () {
                  // complete
                },
              })
        
          },
          //获取卖家信息
          getSeller(userId) {
            let that = this
            console.log("user",userId)
            wx.request({
              url: config.apis.getOtherUserInfo + '/'+userId,
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
                  sellerId:data.userInfo.id
                })
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              },
            })
            
          },
          //提交订单+付款
          postOrder(){
            console.log("提交订单",this.data.commodityId)
            wx.request({
                  url: config.apis.createOrder+"/"+this.data.commodityId,
                  data: {
                   buyerAddress:this.data.address,
                  },
                  method: 'POST',
                  header: {token:app.token}, // 设置请求的 header
                  success: function (res) {
                    console.log("提交订单",res)
                    const { code, message, data } = res.data                    
                    if (code != 20000) {
                      console.log("提交订单失败",message)
                      wx.showToast({
                        icon: 'none',
                        title: message,
                        duration: 1000,
                      })
                      setTimeout(function () {
                        wx.navigateBack({
                              delta: 1
                            })
                       }, 1000)                       
                      return false
                    }
                    //支付订单
                    wx.request({
                      url: config.apis.payOrder+"/" + data.orderId,
                      method: 'POST',
                      header: { token: app.token}, // 设置请求的 header
                      success: function (res) {
                        console.log("支付订单",res)
                        const { code, message, data } = res.data
                        if (code != 20000) {
                          wx.showToast({
                            icon: 'none',
                            title: message,
                            duration: 1000,
                          })
                          return false
                        }
                        wx.showToast({
                          icon: 'none',
                          title: "下单成功！",
                          duration: 1000,
                        })
                      setTimeout(function () {
                        wx.navigateTo({
                          url: '/pages/order/list/list',
                        })
                        }, 1000)  
                      },
                    })  
                  },
                })
          },
          placeInput(e) {
            this.data.address = e.detail.value
          },



})