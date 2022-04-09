const app = getApp()
const config = require('../../config.js')

Page({
  data: {
    college: JSON.parse(config.data).college,
    collegeCur: -2,
    showList: false,
    scrollTop: 0,
    nomore: false,
    adShow: false,
    list: [],
    banner: '',
    indexTip: '',
    token: app.token,
    page: 1,
    limit: 20,
    iscard: true,
    list: [],
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
  onLoad() {
    this.getbanner()
    // this.listkind()
    this.getList()
  },
  onShow() {
    console.log('onshow')
    this.getList()
  },
  //监测屏幕滚动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: parseInt(e.scrollTop * wx.getSystemInfoSync().pixelRatio),
    })
  },
  //布局方式选择
  changeCard() {
    let that = this
    if (that.data.iscard) {
      that.setData({
        iscard: false,
      })
      wx.setStorage({
        key: 'iscard',
        data: false,
      })
    } else {
      that.setData({
        iscard: true,
      })
      wx.setStorage({
        key: 'iscard',
        data: true,
      })
    }
  },
  //跳转搜索
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //类别选择
  collegeSelect(e) {
    this.setData({
      collegeCur: e.currentTarget.dataset.id - 1,
      scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
      showList: false,
    })
    this.getList()
  },
  //选择全部
  selectAll() {
    this.setData({
      collegeCur: -2,
      scrollLeft: -200,
      showList: false,
    })
    // this.getList();
  },
  //展示列表小面板
  showlist() {
    let that = this
    if (that.data.showList) {
      that.setData({
        showList: false,
      })
    } else {
      that.setData({
        showList: true,
      })
    }
  },
  // 获取列表
  getList() {
    let that = this
    const { page, limit, list } = that.data
    // if (that.data.collegeCur == -2) {
    //   var collegeid = _.neq(-2) //除-2之外所有
    // } else {
    //   var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    // }
    wx.request({
      url: config.apis.getCommodityList + '/' + page + '/' + limit + '?token=' + app.token,
      data: {},
      method: 'POST',
      // header: {}, // 设置请求的 header
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
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      },
    })
  },
  more() {
    let that = this
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1
    wx.request({
      url: config.apis.getCommodityList + '/' + page + '/' + that.data.limit + '?token=' + app.token,
      data: {},
      method: 'POST',
      // header: {}, // 设置请求的 header
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
        that.setData(
          {
            page: page,
            list: [...that.data.list, ...data.rows], // 商品列表
          },
          () => {
            console.log('fenye', that.data.list)
          }
        )
      },
    })
  },
  onReachBottom() {
    this.more()
  },
  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
    })
    this.getList()
  },
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  //跳转详情
  detail(e) {
    let that = this
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/detail/detail?commodityId=' + e.currentTarget.dataset.id,
      })
    }
  },
  //获取轮播
  getbanner() {
    let that = this
    let bannerlist = ['./banimg.jpeg', 'https://www.chazhengla.com/uploads/images/thumb/2021/1202/1638438756816401.jpeg', 'https://www.chazhengla.com/uploads/images/thumb/2021/1202/1638438756816401.jpeg']
    that.setData({
      // banner: res.data[0].list
      banner: ['./banimg.jpeg', 'https://www.chazhengla.com/uploads/images/thumb/2021/1202/1638438756816401.jpeg', 'https://www.chazhengla.com/uploads/images/thumb/2021/1202/1638438756816401.jpeg'],
    })
  },
  //跳转轮播链接
  goweb(e) {
    console.log(e.currentTarget.dataset.web.url)
    wx.navigateTo({
      url: '/pages/web/web?url=' + e.currentTarget.dataset.web.url,
    })
  },
  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start',
    }
  },
  getTip() {
    let that = this
    // db.collection('Tip')
    //   .where({})
    //   .get({
    //     success: function (res) {
    //       that.setData({
    //         indexTip: res.data[0].tip,
    //       })
    //       console.log('zhelishixiaoxi' + res)
    //     },
    //   })
  },
})
