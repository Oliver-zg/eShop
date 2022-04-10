const app = getApp()
const config = require('../../config.js')
let obj = ''
Page({
  /**
   * 页面的初始数据
   */
  data: {
    first_title: true,
    place: '',
    roomID: '',
    goodssaller: '',
    openid: '',
    imgs: [],
    isShow: true,
    status: 0,
    avatarUrl: '',
    buyerInfo: [],
    isExist: Boolean,
    address: '',
    //
    page: 1,
    limit: 20,
    commodity:{},
    sellerInfo:{},
    imageUrls:[],
    isFavorite: false,
    commodityId: "",
    sellerId:"",
    comment:""
  },
  onLoad(e) {
    obj = e
    this.data.commodityId = e.commodityId
    this.getcommodityDetail(e.commodityId)
    this.getCommentList()
  
    // this.getPublish(e.commodityId)
    
    // this.getBuyer(this.data.openid)
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
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
            isFavorite:data.commodity.isFavorite,
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
    })
    
  },
  //收藏商品
  collect(e) {
    let that = this
    const { commodityId, isFavorite } = that.data
    console.log("是否收藏",e.currentTarget.dataset.type)
    wx.showLoading({
      title: '确认中',
    })
    wx.request({
      url: config.apis.favorites + '/' + commodityId,
      data: {},
      method: isFavorite ? 'DELETE' : 'PUT',
      header: {
        token: app.token,
      },
      success: function (res) {
        wx.hideLoading()
        console.log('收藏结果', res)
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
          title:isFavorite?"取消收藏成功！":"收藏成功！" ,
          duration: 1000,
        })
        that.getcommodityDetail(commodityId)
      },
    })
    wx.hideLoading()
  },

  changeTitle(e) {
    let that = this
    that.setData({
      first_title: e.currentTarget.dataset.id,
    })
  },

  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //回到我的
  my() {
    wx.switchTab({
      url: '/pages/my/my',
    })
  },
  //购买检测
buy(){
    if (!app.token) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要登录方可使用，是否马上去登录',
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
      if (this.data.sellerId == app.userId) {
      wx.showToast({
        title: '自己买不了自己的噢！',
        icon: 'none',
        duration: 1500,
      })
      return false
    }
if(this.data.commodity.commodityStatus=="Normal"){
  wx.navigateTo({
    url: '/pages/detail/orderDetail/orderDetail?Id=' + this.data.commodityId,
  })

}else{
  wx.showToast({
    title: '不可下单~',
    icon: 'none',
  })
}
},
  //路由
  go(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.go,
    })
  },
  //地址输入
  placeInput(e) {
    this.data.place = e.detail.value
  },
  //评论输入
  commentInput(e) {
    this.data.comment = e.detail.value
  },
  //图片点击事件
  img: function (event) {
    let arr = []
    arr.push(this.data.imageUrls)
    var src = event.currentTarget.dataset.src //获取data-src
    // var imgList = that.data.result.images_fileID;
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: arr[0], // 需要预览的图片http链接列表
    })
  },

  /**
   * 获取地址
   */
  getAddress() {
    let that = this
    if (that.data.publishinfo.deliveryid == 0) {
      that.setData({
        address: that.data.publishinfo.place,
      })
    } else {
      that.setData({
        address: that.data.place,
      })
    }
  },
  //获取评论
  getCommentList(){
      let that = this
      const { page, limit } = that.data
      wx.request({
        url: config.apis.getComment + '/' + page + '/' + limit ,
        data: {
          commodityId:that.data.commodityId
        },
        method: 'POST',
        header: {
          token: app.token,
        },
        success: function (res) {
          console.log('获取评论列表', res)
          const { code, message, data } = res.data
          if (code != 20000) {
            wx.showToast({
              icon: 'none',
              title: message,
              duration: 1000,
            })
            return false
          }
          let list =data.rows.map((item) => {
              wx.request({
                url: config.apis.getOtherUserInfo + '/'+item.userId,
                data: {},
                method: 'GET',
                header: {}, // 设置请求的 header
                success: function (res) {
                  console.log('获取评论用户详情', res)
                  const { code, message, data } = res.data
                  if (code != 20000) {
                    return false
                  }
                  item.avatar=data.userInfo.avatar
                  item.nickname=data.userInfo.nickname
                },
              })
              return item
          })
          setTimeout(function () {
            that.setData({ commentList: list });
           }, 2000) 
        },
      })
  },
  //提交留言
  postComment(){
    let that = this
    console.log("内容",that.data.comment)
    wx.request({
      url: config.apis.getComment ,
      data: {
        commentContent: that.data.comment,
        commodityId:that.data.commodityId
      },
      method: 'PUT',
      header: { token: app.token}, // 设置请求的 header
      success: function (res) {
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
          title: "提交成功",
          duration: 1000,
        })
        that.setData({
          comment: ''
        })
        that.getCommentList()
      },
    })
    

  },
  //删除留言
  deleteComment(e){
    let that = this
    console.log("commentid",e.currentTarget.dataset.id)
    wx.request({
      url: config.apis.getComment+"/" + e.currentTarget.dataset.id,
      method: 'DELETE',
      header: { token: app.token}, // 设置请求的 header
      success: function (res) {
        console.log('ac评论用户详情', res)
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
          title: "删除成功",
          duration: 1000,
        })
        that.getCommentList()
      },
    })
    
  },
  goChartRoom() {
    // 通过双方id获取聊天室id
    wx.navigateTo({
      url: `/pages/detail/room/room?senderId=${this.data.userId}&reciveId=${this.data.sellerId}`,
    })
  },
  
})
