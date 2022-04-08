// const db = wx.cloud.database()
const app = getApp()
const config = require('../../config.js')
const MAX_IMG_NUM = 5
Page({
  data: {
    isExist: '',
    selectPhoto: true,
    systeminfo: app.systeminfo,
    params: {
      imgUrl: new Array(),
    },
    tempFilePaths: [],
    entime: {
      enter: 600,
      leave: 300,
    }, //进入褪出动画时长
    college: JSON.parse(config.data).college.splice(1),
    steps: [
      {
        text: '步骤一',
        desc: '补充物品信息',
      },
      {
        text: '步骤二',
        desc: '发布成功',
      },
    ],
  },
  //恢复初始态
  initial() {
    let that = this
    that.setData({
      dura: 30,
      price: 15,
      place: '',
      chooseDelivery: 0, // 选择发货方式
      cids: '-1', //类别选择
      show_b: true,
      show_c: false,
      active: 0,
      chooseCollege: false,
      note_counts: 0,
      desc_counts: 0,
      notes: '',
      describe: '',
      good: '',
      kindid: 0,
      showorhide: true,
      tempFilePaths: [], // 图片本地地址
      fileServerPaths: [], // 图片服务器地址
      params: {
        imgUrl: new Array(),
      },
      imgUrl: [],
      kind: [
        {
          name: '通用',
          id: 0,
          check: true,
        },
        {
          name: '其他',
          id: 1,
          check: false,
        },
      ],
      delivery: [
        {
          name: '自提',
          id: 0,
          check: true,
        },
        {
          name: '邮寄',
          id: 1,
          check: false,
        },
      ],
      selectPhoto: true,
    })
  },
  onLoad() {
    console.log('token', app.token)
    this.initial()
    this.getCodeFromSet()
  },
  onShow() {},
  //价格输入改变
  priceChange(e) {
    this.data.price = e.detail
  },
  //时长才输入改变
  duraChange(e) {
    this.data.dura = e.detail
  },
  //地址输入
  placeInput(e) {
    console.log(e)
    this.data.place = e.detail.value
  },
  //物品输入
  goodInput(e) {
    console.log(e)
    this.data.good = e.detail.value
  },
  //类别选择
  kindChange(e) {
    let that = this
    let kind = that.data.kind
    let id = e.detail.value
    for (let i = 0; i < kind.length; i++) {
      kind[i].check = false
    }
    kind[id].check = true
    if (id == 1) {
      that.setData({
        kind: kind,
        chooseCollege: true,
        kindid: id,
      })
    } else {
      that.setData({
        kind: kind,
        cids: '-1',
        chooseCollege: false,
        kindid: id,
      })
    }
  },
  //选择专业
  choCollege(e) {
    let that = this
    console.log(e.detail.value)
    that.setData({
      cids: e.detail.value,
    })
  },
  //取货方式改变
  delChange(e) {
    let that = this
    let delivery = that.data.delivery
    let id = e.detail.value
    for (let i = 0; i < delivery.length; i++) {
      delivery[i].check = false
    }
    delivery[id].check = true
    if (id == 1) {
      that.setData({
        delivery: delivery,
        chooseDelivery: 1,
      })
    } else {
      that.setData({
        delivery: delivery,
        chooseDelivery: 0,
      })
    }
  },
  //输入备注
  noteInput(e) {
    let that = this
    that.setData({
      note_counts: e.detail.cursor,
      notes: e.detail.value,
    })
  },
  //输入描述
  describeInput(e) {
    let that = this
    that.setData({
      desc_counts: e.detail.cursor,
      describe: e.detail.value,
    })
  },
  //发布校检
  check_pub() {
    let that = this
    //如果用户选择了用途，需要选择用途类别
    if (that.data.kind[1].check) {
      if (that.data.cids == -1) {
        wx.showToast({
          title: '请选择用途',
          icon: 'none',
        })
        return false
      }
    }
    const { good, describe, fileServerPaths, notes } = that.data
    console.log(that.data)
    if (!fileServerPaths.length) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none',
      })
      return false
    }
    // 如果用户选择了自提，需要填入详细地址
    if (!good || !describe || !notes) {
      // if (that.data.place == '') {
      wx.showToast({
        title: '请将表单填写完整',
        icon: 'none',
      })
      return false
      // }
    }
    that.publish()
  },
  //正式发布
  publish() {
    let that = this
    if (!app.token) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要登录可使用，是否马上去登录',
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
    if (that.data.good == '') {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none',
      })
      return false
    }
    if (that.data.describe == '') {
      wx.showToast({
        title: '请输入物品的详细描述',
        icon: 'none',
      })
      return false
    }
    // if (that.data.imgUrl == '') {
    //   wx.showToast({
    //     title: '请选择图片',
    //     icon: 'none',
    //   })
    //   return false
    // }
    if (that.data.notes == '') {
      wx.showToast({
        title: '请输入相关的备注信息（如取货时间，新旧程度等）',
        icon: 'none',
      })
      return false
    }
    const { fileServerPaths, describe, good, price, cids, chooseDelivery, notes } = that.data
    wx.showModal({
      title: '温馨提示',
      content: '经检测您填写的信息无误，是否马上发布？',
      success(res) {
        wx.request({
          url: config.apis.publishCommodity,
          data: {
            commodityCover: fileServerPaths.join(','),
            commodityDescription: describe,
            commodityName: good,
            commodityPrice: price,
            commodityStatus: 'Normal',
            commodityCategory: cids,
            commodityPickupWay: chooseDelivery,
            commodityRemark: notes,
          },
          header: {
            token: app.token,
          },
          method: 'PUT',
          success: function (res) {
            console.log('商品发布', res)
            const { code, data } = res.data
            if (code != 20000) {
              wx.showToast({
                icon: 'none',
                title: data.message,
                duration: 1000,
              })
              return false
            }
            that.setData({
              show_b: false,
              show_c: true,
              active: 2,
              // detail_id: e._id,
              detail_id: data.id,
            })
            wx.showToast({
              title: '正在上传...',
              icon: 'loading',
              mask: true,
              duration: 1000,
            })
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          },
        })
        // if (res.confirm) {
        //   db.collection('publish').add({
        //     data: {
        //       status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
        //       price: that.data.price, //售价
        //       //分类
        //       kindid: that.data.kindid, //区别通用还是用途
        //       collegeid: that.data.cids, //学院id，-1表示通用类
        //       deliveryid: that.data.chooseDelivery, //0自1配
        //       place: that.data.place, //选择自提时地址
        //       notes: that.data.notes, //备注
        //       bookinfo: {
        //         pic: that.data.imgUrl,
        //         good: that.data.good,
        //         describe: that.data.describe,
        //         imgs: that.data.imgUrl,
        //       },
        //       key: that.data.good,
        //     },
        //     success(e) {
        //       console.log(e)
        //       that.setData({
        //         show_b: false,
        //         show_c: true,
        //         active: 2,
        //         detail_id: e._id,
        //       })
        //       wx.showToast({
        //         title: '正在上传...',
        //         icon: 'loading',
        //         mask: true,
        //         duration: 1000,
        //       })
        //       setTimeout(function () {
        //         //判断卖家是否已经上传了
        //         if (that.data.isExist == false) {
        //           wx.showModal({
        //             title: '物品发布成功',
        //             content: '您未上传赞赏码用于交易，是否现在去上传？',
        //             showCancel: true, //是否显示取消按钮
        //             cancelText: '稍后再传', //默认是“取消”
        //             cancelColor: '#fbbd08', //取消文字的颜色
        //             success(res) {
        //               if (res.confirm) {
        //                 wx.navigateTo({
        //                   url: '/pages/appreciateCode/appreciateCode',
        //                 })
        //               }
        //             },
        //           })
        //         }
        //       }, 2000)

        //       that.setData({
        //         show_b: false,
        //         show_c: true,
        //         active: 2,
        //         detail_id: e._id,
        //       })
        //       //滚动到顶部
        //       wx.pageScrollTo({
        //         scrollTop: 0,
        //       })
        //     },
        //   })
        // }
      },
    })
  },
  getCodeFromSet() {
    let that = this
    let openid = app.openid
    console.log(openid)
    db.collection('appreciatecode')
      .where({
        _openid: openid,
      })
      .get()
      .then((res) => {
        if (res.data.length > 0) {
          that.setData({
            isExist: true,
            bigImg: res.data[0].bigImg,
          })
          console.log(res.data[0].bigImg)
          console.log('isExist---->' + that.data.isExist)
        } else {
          that.setData({
            isExist: false,
          })
          console.log('isExist---->' + that.data.isExist)
        }
      })
  },
  doUpload(filePath) {
    console.log('filePath', filePath)
    const that = this
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      mask: true,
      duration: 1700,
    })
    wx.uploadFile({
      url: config.apis.uploadFile,
      filePath: filePath,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
        token: app.token, //若有token，此处换上你的token，没有的话省略
      },
      // header: {}, // 设置请求的 header
      success: function (res) {
        // wx.hideToast()
        console.log('doUpload', JSON.parse(res.data))
        const { code, message, data } = JSON.parse(res.data)
        // 非20000返回错误
        if (code != 20000) {
          wx.showToast({
            icon: 'none',
            title: message,
            duration: 1000,
          })
        }
        const filePath = data.url
        const { fileServerPaths } = that.data
        that.setData(
          {
            fileServerPaths: fileServerPaths.concat(filePath),
          },
          () => {
            console.log(that.data.fileServerPaths)
          }
        )
      },
      fail: function (error) {
        console.error('[上传文件] 失败：', error)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
          duration: 1000,
        })
      },
      complete: function () {
        // complete
      },
    })
    // var timestamp = (new Date()).valueOf();
    // const cloudPath = 'goods-pic/' + app.openid + '/' + Math.floor(Math.random() * 10000 + 10000) + '.png'

    // wx.cloud
    //   .uploadFile({
    //     cloudPath,
    //     filePath,
    //   })
    //   .then((res) => {
    //     console.log('[上传文件] 成功：', res)
    //     const { params } = that.data
    //     const { imgUrl } = params
    //     imgUrl.push(res.fileID)
    //     params['imgUrl'] = imgUrl
    //     that.setData({
    //       imgUrl,
    //     })
    //   })
    //   .catch((error) => {
    //     console.error('[上传文件] 失败：', error)
    //     wx.showToast({
    //       icon: 'none',
    //       title: '上传失败',
    //       duration: 1000,
    //     })
    //   })
  },

  chooseImage: function () {
    const that = this
    // 还能再选几张图片,初始值设置最大的数量-当前的图片的长度
    let max = MAX_IMG_NUM - this.data.tempFilePaths.length
    // 选择图片
    wx.chooseImage({
      count: max, // count表示最多可以选择的图片张数
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        const tempFiles = res.tempFiles
        const filePath = res.tempFilePaths
        //将选择的图片上传
        filePath.forEach((path, _index) => {
          setTimeout(() => that.doUpload(path), _index) //加不同的延迟，避免多图上传时文件名相同
        })
        const { tempFilePaths } = that.data
        that.setData(
          {
            tempFilePaths: tempFilePaths.concat(filePath),
          },
          () => {
            console.log(that.data.tempFilePaths)
          }
        )
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.tempFilePaths.length
        this.setData({
          selectPhoto: max <= 0 ? false : true, // 当超过8张时,加号隐藏
        })
      },
      fail: (e) => {
        console.error(e)
      },
    })
  },
  deletePic(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    let imgUrl = this.data.params.imgUrl
    const { tempFilePaths, fileServerPaths } = this.data
    tempFilePaths.splice(index, 1)
    fileServerPaths.splice(index, 1)
    imgUrl.splice(index, 1)
    this.setData({
      ['params.imgUrl']: imgUrl,
      tempFilePaths,
    })
    // 当添加的图片达到设置最大的数量时,添加按钮隐藏,不让新添加图片
    if (this.data.tempFilePaths.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  detail() {
    let that = this
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id,
    })
  },
})
