const app = getApp()
const config = require('../../config.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    newlist: [],
    list: [],
    key: '',
    blank: false,
    hislist: [],
    nomore: false,
    page: 1,
    limit: 20,
  },
  onLoad: function (options) {
    this.gethis()
    this.getnew()
  },
  //获取本地记录
  gethis() {
    let that = this
    wx.getStorage({
      key: 'history',
      success: function (res) {
        let hislist = JSON.parse(res.data)
        //限制长度
        if (hislist.length > 5) {
          hislist.length = 5
        }
        that.setData({
          hislist: hislist,
        })
      },
    })
  },
  //选择历史搜索关键词
  choosekey(e) {
    this.data.key = e.currentTarget.dataset.key
    this.search('his')
  },
  //最新推荐
  getnew() {

  },
  //跳转详情
  detail(e) {
    let that = this
    wx.navigateTo({
      url: '/pages/detail/detail?commodityId=' + e.currentTarget.dataset.id,
    })
  },
  //搜索结果
  search(n) {
    let that = this
    let key = that.data.key
    if (key == '') {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none',
      })
      return false
    }
    wx.setNavigationBarTitle({
      title: '"' + that.data.key + '"的搜索结果',
    })
    wx.showLoading({
      title: '加载中',
    })
    if (n !== 'his') {
      that.history(key)
    }
    const { page, limit, list, category } = that.data
    wx.request({
      url: config.apis.getCommodityList + '/' + page + '/' + limit + '?token=' + app.token,
      data: {
        commodityName: that.data.key,
      },
      method: 'POST',
      // header: {}, // 设置请求的 header
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
        that.setData({
          blank: data.rows.length === 0,
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
    wx.hideLoading()
    
  },
  onReachBottom() {
    this.more()
  },
  //添加到搜索历史
  history(key) {
    let that = this
    wx.getStorage({
      key: 'history',
      success(res) {
        let oldarr = JSON.parse(res.data) //字符串转数组
        let newa = [key] //对象转为数组
        let newarr = JSON.stringify(newa.concat(oldarr)) //连接数组\转字符串
        wx.setStorage({
          key: 'history',
          data: newarr,
        })
      },
      fail(res) {
        //第一次打开时获取为null
        let newa = [key] //对象转为数组
        var newarr = JSON.stringify(newa) //数组转字符串
        wx.setStorage({
          key: 'history',
          data: newarr,
        })
      },
    })
  },
  keyInput(e) {
    this.data.key = e.detail.value
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
  //加载更多
  more() {
    let that = this
    if (that.data.nomore || that.data.list.length < 20) {
      return false
    }
    let page = that.data.page + 1
    if (that.data.collegeCur == -2) {
      var collegeid = _.neq(-2) //除-2之外所有
    } else {
      var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    }
  },
})
