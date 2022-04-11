const app = getApp()
var time = require('../../utils/util.js')
const config = require('../../config')

Page({
  data: {
    list: [],
  },
  onLoad: function () {
    const chatRecordString = wx.getStorageSync('chatRecord')
    if (!chatRecordString) {
      return false
    }
    // 获取聊天记录
    const chatRecord = JSON.parse(chatRecordString)
    for (let index = 0; index < chatRecord.length; index++) {
      const ele = chatRecord[index]
      this.getUserInfo(ele.receiverId)
    }
    setTimeout(() => {
      console.log(this.data.list)
    }, 1000)
    // getUserInfo()
  },
  getUserInfo(userId) {
    let that = this
    console.log('user', userId)
    // wx.getUserInfo({})
    wx.request({
      url: config.apis.getOtherUserInfo + userId,
      data: {},
      method: 'GET',
      header: {}, // 设置请求的 header
      success: function (res) {
        console.log('获取用户详情', res)
        const { code, message, data } = res.data
        if (code != 20000) {
          wx.showToast({
            icon: 'none',
            title: message,
            duration: 1000,
          })
          return false
        }
        const one = {
          receiverName: data.userInfo.nickname,
          receiverId: userId,
          receiveAvatar: data.userInfo.avatar,
        }
        that.setData(
          {
            list: [...that.data.list, one],
          },
          () => {
            console.log('获取接收方信息', that.data.list)
          }
        )
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      },
    })
  },
  go(e) {
    const rId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/room/room?senderId=${app.userId}&reciveId=${rId}`,
    })
  },
})
