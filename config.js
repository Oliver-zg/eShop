let host = 'http://8.130.48.185:8003/eShop'
let imagesHost = 'https://eshop2022.oss-cn-beijing.aliyuncs.com/pic/images/'
let apis = {
  login: host + '/user/miniLogin',
  uploadFile: host + '/oss',
  publishCommodity: host + '/commodity',
  getCommodityList: host + '/commodity',
  favorites: host + '/favorites',
  myPublishedCommodity: host + '/commodity/myPublishedCommodity',
  getOtherUserInfo: host + '/user/getOtherUserInfo/',
  updateUserInfo: host + '/user/updateUserInfo',
  createOrder: host +'/order/createOrder',
  getComment: host +'/comment/'
}

let data = {
  //默认启动页背景图，防止请求失败完全空白
  //可以是网络地址，本地文件路径要填绝对位置
  bgurl: '',
  //校区
  campus: [
    {
      name: '竹园',
      id: 0,
    },
    {
      name: '康园',
      id: 1,
    },
    {
      name: '松园',
      id: 2,
    },
    {
      name: '桂园',
      id: 3,
    },
    {
      name: '梅园',
      id: 4,
    },
    {
      name: '榕园',
      id: 5,
    },
    {
      name: '松园',
      id: 6,
    },
  ],
  //配置学院，建议不要添加太多，不然前端不好看
  college: [
    {
      name: '通用',
      id: -1,
    },
    {
      name: '家居',
      id: 0,
    },
    {
      name: '数码',
      id: 1,
    },
    {
      name: '装饰品',
      id: 2,
    },
    {
      name: '衣物',
      id: 3,
    },
    {
      name: '运动器材',
      id: 4,
    },
    {
      name: '化妆品',
      id: 5,
    },
    {
      name: '其他',
      id: 6,
    },
  ],
  slist: [
    {
      commodityCover: '/images/slist/1.jpg',
      commodityId: 1,
      commodityPrice: '2000',
      commodityName: 'vivo手机',
    },
    {
      commodityCover: '/images/slist/1.jpg',
      commodityId: 1,
      commodityPrice: '2000',
      commodityName: 'vivo手机',
    },
    // {
    //   img: '/images/slist/2.jpg',
    //   id: 2,
    //   money: '200',
    //   name: '多功能电饭煲',
    // },
    // {
    //   img: '/images/slist/3.jpg',
    //   id: 3,
    //   money: '100',
    //   name: '潮流背包男',
    // },
    // {
    //   img: '/images/slist/4.jpg',
    //   id: 4,
    //   money: '100',
    //   name: '时尚卫衣女',
    // },
    // {
    //   img: '/images/slist/5.jpg',
    //   id: 5,
    //   money: '2500',
    //   name: '苹果手机',
    // },
    // {
    //   img: '/images/slist/7.jpg',
    //   id: 6,
    //   money: '500',
    //   name: '多功能儿童椅',
    // },
  ],
  jlist: [
    {
      img: '/images/slist/1.jpg',
      id: 1,
      status: 1,
      create: '2022.03.24',
      money: '2000',
      name: 'vivo手机',
    },
    {
      img: '/images/slist/2.jpg',
      id: 2,
      status: 1,
      create: '2022.03.24',
      money: '200',
      name: '多功能电饭煲',
    },
    {
      img: '/images/slist/3.jpg',
      status: 1,
      create: '2022.03.24',
      id: 3,
      money: '100',
      name: '潮流背包男',
    },
    {
      img: '/images/slist/4.jpg',
      status: 5,
      create: '2022.03.24',
      id: 4,
      money: '100',
      name: '时尚卫衣女',
    },
    {
      img: '/images/slist/5.jpg',
      status: 3,
      create: '2022.03.24',
      id: 5,
      money: '2500',
      name: '苹果手机',
    },
    {
      img: '/images/slist/7.jpg',
      status: 2,
      create: '2022.03.24',
      id: 6,
      money: '500',
      name: '多功能儿童椅',
    },
  ],
}
//下面的就别动了
function formTime(creatTime) {
  let date = new Date(creatTime),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds()
  if (M < 10) {
    M = '0' + M
  }
  if (D < 10) {
    D = '0' + D
  }
  if (H < 10) {
    H = '0' + H
  }
  if (m < 10) {
    m = '0' + m
  }
  if (s < 10) {
    s = '0' + s
  }
  return Y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s
}

function days() {
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let day = now.getDate()
  if (month < 10) {
    month = '0' + month
  }
  if (day < 10) {
    day = '0' + day
  }
  let date = year + '' + month + day
  return date
}
module.exports = {
  data: JSON.stringify(data),
  formTime: formTime,
  days: days,
  apis,
}
