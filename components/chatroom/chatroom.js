var time = require('../../utils/util.js')
const app = getApp()
const config = require('../../config')
const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 20000,
  scrollWithAnimation: true,
}

Component({
  properties: {
    envId: String,
    collection: String,
    groupId: String,
    groupName: String,
    userInfo: Object,
    onGetUserInfo: {
      type: Function,
    },
    senderId: String,
    receiverId: String,
    getOpenID: {
      type: Function,
    },
  },

  data: {
    chatQueue: [],
    textInputValue: '',
    openId: '',
    scrollTop: 0,
    scrollToMessage: '',
    hasKeyboard: false,
    socketOpen: false,
    senderInfo: {},
    receiverInfo: {},
    writeStatus: '',
    limit: 30,
  },

  methods: {
    async initRoom() {
      const that = this
      const {} = that.data

      // 获取通讯双方的信息
      this.getUserInfo(this.properties.senderId, true)
      this.getUserInfo(this.properties.receiverId, false)

      // 获取本地存储的聊天记录
      let chatRecordString = wx.getStorageSync('chatRecord')
      // 有聊天记录
      // 聊天记录格式为 chats = [{senderId:'',receiveId:'',content:[{},{},....]}]
      if (chatRecordString) {
        const chatRecord = JSON.parse(wx.getStorageSync('chatRecord'))
        console.log('读取本地聊天记录', chatRecord)
        // 如果有,找出本次的对话双方的历史聊天记录
        for (let index = 0; index < chatRecord.length; index++) {
          const ele = chatRecord[index]
          if (ele.senderId == that.data.senderId && ele.receiverId == that.data.receiverId) {
            //只展示最近30条记录
            that.setData({
              chatQueue: ele.content.splice(-30),
            })
          }
        }
      }
      this.getUnreadMsg()
      setTimeout(() => {
        that.scrollToBottom(true)
      }, 500)

      // 连接socket
      wx.connectSocket({
        url: config.apis.chat + that.data.senderId,
        success: function (res) {
          if (res.errMsg.indexOf('ok') != -1) {
            console.log('socket连接成功', res)
          }
        },
      })

      // 打开socket服务
      wx.onSocketOpen(function (res) {
        console.log('WebSocket 已开启！', res)
        that.setData({
          socketOpen: true,
        })
      })

      // 接收消息
      wx.onSocketMessage(function (res) {
        console.log('接收消息', res)
        if (res.data.indexOf('userId') != -1) return false
        // 消息发送成功的标志
        if (!res.data) {
          wx.showToast({
            title: '消息发送失败',
            duration: 1000,
          })
          return false
        }

        const { senderId, receiverId, gmtCreate, messageContent } = JSON.parse(res.data)
        console.log('jsonParse', JSON.parse(res.data))
        const { chatQueue, limit } = that.data
        // 只保存近limit条聊天记录
        if (chatQueue.length >= limit) {
          chatQueue.shift()
        }
        const one = {
          senderId: senderId,
          receiverId: receiverId,
          text: messageContent,
          sendTime: gmtCreate,
        }
        that.setData(
          {
            chatQueue: [...chatQueue, one],
          },
          () => {
            console.log('实时保存聊天记录', that.data.chatQueue)
          }
        )
      })
    },
    onGetUserInfo(e) {
      this.properties.onGetUserInfo(e)
    },
    getUserInfo(userId, isSender) {
      let that = this
      console.log('user', userId)
      wx.getUserInfo({})
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

          if (isSender) {
            that.setData({
              senderInfo: data.userInfo,
            })
          } else {
            that.setData(
              {
                receiverInfo: data.userInfo,
              },
              () => {
                wx.setNavigationBarTitle({
                  title: '正在与' + that.data.receiverInfo.nickname + '对话',
                })
              }
            )
          }
        },
        fail: function () {
          // fail
        },
        complete: function () {
          // complete
        },
      })
    },
    getOpenID() {
      return this.properties.getOpenID()
    },

    mergeCommonCriteria(criteria) {
      return {
        groupId: this.data.groupId,
        ...criteria,
      }
    },

    async initOpenID() {
      return this.try(async () => {
        const openId = await this.getOpenID()

        this.setData({
          openId,
        })
      }, '初始化 openId 失败')
    },
    /**
     * 发送消息
     * @param {} e
     */
    async onConfirmSendText(e) {
      const that = this
      this.try(async () => {
        if (!e.detail.value) {
          return
        }
        const { senderId, receiverId } = that.data
        const msg = {
          receiverId: receiverId,
          messageContent: e.detail.value,
        }
        // 发送消息
        wx.sendSocketMessage({
          data: JSON.stringify(msg),
          success: function (res) {
            if (res.errMsg.indexOf('ok') != -1) {
              console.log('socket发送信息成功', res)
            } else {
              wx.showToast({
                icon: 'none',
                title: '发送失败',
                duration: 1000,
              })
              return false
            }
            that.setData({
              textInputValue: '',
              // chatQueue: [...chatQueue, one],
            })
          },
          fail: function (res) {
            wx.showToast({
              icon: 'none',
              title: '发送失败',
              duration: 1000,
            })
          },
        })
        // e.detail.value = ''
        this.scrollToBottom(true)
      }, '发送文字失败')
    },

    scrollToBottom(force) {
      console.log('scroll')
      if (force) {
        let viewId = 'view_id' + parseInt(Math.random() * 10000)
        this.setData({
          scrollToMessage: '',
        })
        this.setData({
          viewId: viewId,
        })
        this.setData({
          scrollToMessage: viewId,
        })
        // console.log('force scroll to bottom')
        // this.setData(SETDATA_SCROLL_TO_BOTTOM)
        // wx.pageScrollTo({
        //   scrollTop: 20000,
        //   duration: 300,
        // })
        return
      }
      // this.createSelectorQuery()
      //   .select('.body')
      //   .boundingClientRect((bodyRect) => {
      //     this.createSelectorQuery()
      //       .select(`.body`)
      //       .scrollOffset((scroll) => {
      //         if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
      //           console.log('should scroll to bottom')
      //           this.setData(SETDATA_SCROLL_TO_BOTTOM)
      //         }
      //       })
      //       .exec()
      //   })
      //   .exec()
    },

    async onScrollToUpper() {
      // if (this.db && this.data.chats.length) {
      //   const { collection } = this.properties
      //   const _ = this.db.command
      //   const { data } = await this.db
      //     .collection(collection)
      //     .where(
      //       this.mergeCommonCriteria({
      //         sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
      //       })
      //     )
      //     .orderBy('sendTimeTS', 'desc')
      //     .get()
      //   this.data.chats.unshift(...data.reverse())
      //   this.setData({
      //     chats: this.data.chats,
      //     scrollToMessage: `item-${data.length}`,
      //     scrollWithAnimation: false,
      //   })
      // }
    },

    async try(fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e)
      }
    },

    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: (res) => {
          res.confirm && confirmCallback()
        },
      })
    },
    getUnreadMsg() {
      const that = this
      const id = this.properties.receiverId
      wx.request({
        url: config.apis.message + '/' + id,
        method: 'GET',
        header: {
          token: app.token,
        },
        success: function (res) {
          console.log('未读消息', res)
          const { code, message, data } = res.data
          if (code != 20000) {
            wx.showToast({
              icon: 'none',
              title: message,
              duration: 1000,
            })
            return false
          }
          const arrayList = data.rows
          console.log('未读消息', arrayList)
          const temp = []
          for (let index = 0; index < arrayList.length; index++) {
            const ele = arrayList[index]
            const { senderId, receiverId, gmtCreate, messageContent } = ele
            const one = {
              senderId: senderId,
              receiverId: receiverId,
              text: messageContent,
              sendTime: gmtCreate,
            }
            temp.push(one)
          }

          that.setData(
            {
              chatQueue: [...that.data.chatQueue, ...temp],
            },
            () => {
              console.log('保存未读聊天记录', that.data.chatQueue)
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
  },
  ready() {
    global.chatroom = this
    this.initRoom()
    // this.fatalRebuildCount = 0
  },
  detached() {
    let chatRecordString = wx.getStorageSync('chatRecord')
    const { senderId, receiverId, chatQueue } = this.data
    console.log(this.data.chatQueue)
    // 如果本地没有聊天记录，创建一个数组
    // 聊天记录格式为 chats = [{senderId:'',receiveId:'',content:[{},{},....]}]
    if (!chatRecordString) {
      const chatRecord = [
        {
          senderId: senderId,
          receiverId: receiverId,
          content: this.data.chatQueue,
        },
      ]
      // 保存到本地缓存
      wx.setStorageSync('chatRecord', JSON.stringify(chatRecord))
    } else {
      console.log('本地有聊天记录')
      // 如果有,寻找是否有本次的对话双方的历史聊天记录
      let tag = false // 默认没有
      const chatRecord = JSON.parse(wx.getStorageSync('chatRecord'))
      for (let index = 0; index < chatRecord.length; index++) {
        const ele = chatRecord[index]
        if (ele.senderId == this.data.senderId && ele.receiverId == this.data.receiverId) {
          ele.content = this.data.chatQueue
          tag = true
        }
      }
      if (!tag) {
        const newChat = {
          senderId: senderId,
          receiverId: receiverId,
          content: this.data.chatQueue,
        }

        chatRecord.push(newChat)
      }

      // 保存到本地缓存
      wx.setStorageSync('chatRecord', JSON.stringify(chatRecord))
    }
    console.log('聊天组件被移除')
    wx.closeSocket()
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
  },
})
