var time = require('../../utils/util.js')
const config = require('../../config')
const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 100000,
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
        console.log('onSocketOpen', res)
        that.setData({
          socketOpen: true,
        })
        // wx.closeSocket()
        // for(let i = 0; i < that.data.chats)
      })

      wx.onSocketMessage(function (res) {
        // 消息发送成功的标志
        if (res.data.indexOf('send') != -1) {
          return false
        }
        console.log('接收消息', res)
        const { senderId, receiverId, sendTime, messageContent } = res.data
        const { chatQueue } = that.data
        // 只保存近20条聊天记录
        if (chatQueue.length >= 20) {
          chatQueue.pop()
        }
        const one = {
          senderId: senderId,
          receiverId: receiverId,
          text: messageContent,
          sendTime: sendTime,
        }
        that.setData({
          chatQueue: [...chatQueue, one],
        })
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
            that.setData({
              receiverInfo: data.userInfo,
            })
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

    // async initWatch(criteria) {
    //   this.try(() => {
    //     const {
    //       collection
    //     } = this.properties
    //     const db = this.db
    //     const _ = db.command

    //     console.warn(`开始监听`, criteria)
    //     this.messageListener = db.collection(collection).where(this.mergeCommonCriteria(criteria)).watch({
    //       onChange: this.onRealtimeMessageSnapshot.bind(this),
    //       onError: e => {
    //         if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
    //           this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
    //             this.initWatch(this.data.chats.length ? {
    //               sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
    //             } : {})
    //           })
    //         } else {
    //           this.initWatch(this.data.chats.length ? {
    //             sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
    //           } : {})
    //         }
    //       },
    //     })
    //   }, '初始化监听失败')

    onRealtimeMessageSnapshot(snapshot) {
      console.warn(`收到消息`, snapshot)
      wx.onSocketMessage(function (res) {
        console.log('服务器返回的消息')
      })
      if (snapshot.type === 'init') {
        this.setData({
          chats: [...this.data.chats, ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS)],
        })
        this.scrollToBottom()
        this.inited = true
      } else {
        let hasNewMessage = false
        let hasOthersMessage = false
        const chats = [...this.data.chats]
        for (const docChange of snapshot.docChanges) {
          switch (docChange.queueType) {
            case 'enqueue': {
              hasOthersMessage = docChange.doc._openid !== this.data.openId
              const ind = chats.findIndex((chat) => chat._id === docChange.doc._id)
              if (ind > -1) {
                if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                  chats.splice(ind, 1, {
                    ...docChange.doc,
                    tempFilePath: chats[ind].tempFilePath,
                  })
                } else chats.splice(ind, 1, docChange.doc)
              } else {
                hasNewMessage = true
                chats.push(docChange.doc)
              }
              break
            }
          }
        }
        this.setData({
          chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
        })
        if (hasOthersMessage || hasNewMessage) {
          this.scrollToBottom()
        }
      }
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
        // 发送消息
        wx.sendSocketMessage({
          data: {
            senderId: senderId,
            receiverId: receiverId,
            messageContent: e.detail.value,
          },
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
            console.log('发送的消息', e.detail.value)
            // 发送成功，聊天队列
            const { chatQueue } = that.data
            // 只保存近20条聊天记录
            if (chatQueue.length >= 30) {
              chatQueue.pop()
            }
            const one = {
              senderId: senderId,
              receiverId: receiverId,
              text: e.detail.value,
              sendTime: time.formatTime(new Date(), 'Y/M/D h:m:s'),
            }
            that.setData({
              textInputValue: '',
              chatQueue: [...chatQueue, one],
            })
          },
          fail: function (res) {},
        })
        // e.detail.value = ''
        this.scrollToBottom(true)
      }, '发送文字失败')
    },

    scrollToBottom(force) {
      if (force) {
        console.log('force scroll to bottom')
        this.setData(SETDATA_SCROLL_TO_BOTTOM)
        return
      }
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
  },
  ready() {
    global.chatroom = this
    this.initRoom()
    // this.fatalRebuildCount = 0
  },
  detached() {
    let chatRecordString = wx.getStorageSync('chatRecord')
    const { senderId, receiverId, chatQueue } = this.data
    // 如果本地没有聊天记录，创建一个数组
    // 聊天记录格式为 chats = [{senderId:'',receiveId:'',content:[{},{},....]}]
    if (!chatRecordString) {
      const chatRecord = [
        {
          senderId: senderId,
          receiverId: receiverId,
          content: chatQueue,
        },
      ]
      // 保存到本地缓存
      wx.setStorageSync('chatRecord', JSON.stringify(chatRecord))
    } else {
      // 如果有,找出本次的对话双方的历史聊天记录
      const chatRecord = JSON.parse(wx.getStorageSync('chatRecord'))
      for (let index = 0; index < chatRecord.length; index++) {
        const ele = chatRecord[index]
        if (ele.senderId == this.data.senderId && ele.receiverId == this.data.receiverId) {
          ele.content = chatQueue
        }
      }
      // 保存到本地缓存
      wx.setStorageSync('chatRecord', JSON.stringify(chatRecord))
    }
    console.log('聊天组件被移除')
  },
})
