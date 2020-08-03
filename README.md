  - `koa2` + `koa-router`
  - `sequelize` + `mysql`
  - `jwt` + `bcrypt`
  - `nodemailer`
  - `koa-send` `archiver`

## 项目结构

### 目录结构

```js
.
│
├─config                // 构建配置
├─public                // html 入口
├─scripts               // 项目脚本
└─server                // 后端
    ├─config            // 项目配置 github、email、database、token-secret 等等
    ├─controllers       // 业务控制层
    ├─middlewares       // 中间件
    ├─models            // 数据库模型
    ├─router            // 路由
    ├─utils             // 工具包
    ├─  app.js          // 后端主入口文件
    ├─  initData.js     // 初始化基础数据脚本
    └─...
│
└─src                   // 前端项目源码
   ├─assets             // 静态文件
   ├─components         // 公用组件
   ├─layout             // 布局组件
   ├─redux              // redux 目录
   ├─routes             // 路由
   ├─styles             // 样式
   ├─utils              // 工具包
   ├─views              // 视图层
   ├─  App.jsx          // 后端主入口文件
   ├─  config.js        // 项目配置 github 个人主页、个人介绍等等
   ├─  index.js         // 主入口文件
   └─...

```

### 数据库模型


role === 1: 博主用户
role === 2: 普通用户

权限管理 `server/middlewares/authHandler.js`

```js
const { checkToken } = require('../utils/token')

/**
 * role === 1 需要权限的路由
 * @required 'all': get post put delete 均需要权限。
 */
const verifyList1 = [
  { regexp: /\/article\/output/, required: 'get', verifyTokenBy: 'url' }, // 导出文章 verifyTokenBy 从哪里验证 token
  { regexp: /\/article/, required: 'post, put, delete' }, // 普通用户 禁止修改或者删除、添加文章
  { regexp: /\/discuss/, required: 'delete, post' }, // 普通用户 禁止删除评论
  { regexp: /\/user/, required: 'get, put, delete' }, // 普通用户 禁止获取用户、修改用户、以及删除用户
]

// role === 2 需要权限的路由
const verifyList2 = [
  { regexp: /\/discuss/, required: 'post' }, // 未登录用户 禁止评论
]

/**
 * 检查路由是否需要权限，返回一个权限列表
 *
 * @return {Array} 返回 roleList
 */
function checkAuth(method, url) {
  function _verify(list, role) {
    const target = list.find((v) => {
      return v.regexp.test(url) && (v.required === 'all' || v.required.toUpperCase().includes(method))
    })

    return target
  }

  const roleList = []
  const result1 = _verify(verifyList1)
  const result2 = _verify(verifyList2)

  result1 && roleList.push({ role: 1, verifyTokenBy: result1.verifyTokenBy || 'headers' })
  result2 && roleList.push({ role: 2, verifyTokenBy: result1.verifyTokenBy || 'headers' })

  return roleList
}

// auth example token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoyLCJpZCI6MSwiaWF0IjoxNTY3MDcyOTE4LCJleHAiOjE1Njk2NjQ5MTh9.-V71bEfuUczUt_TgK0AWUJTbAZhDAN5wAv8RjmxfDKI
module.exports = async (ctx, next) => {
  const roleList = checkAuth(ctx.method, ctx.url)
  //  该路由需要验证
  if (roleList.length > 0) {
    if (checkToken(ctx, roleList)) {
      await next()
    } else {
      ctx.status = 401
      ctx.client(401)
    }
  } else {
    await next()
  }
}
```

## 关于使用这个项目需要的配置

### 前端 `src/config.js`

```js
import React from 'react'
import MyInfo from '@/views/web/about/MyInfo'

// API_BASE_URL
export const API_BASE_URL = 'http://127.0.0.1:6060'

// project config
export const HEADER_BLOG_NAME = '郭大大的博客' // header title 显示的名字

// === sidebar
export const SIDEBAR = {
  avatar: require('@/assets/images/avatar.jpeg'), // 侧边栏头像
  title: '郭大大', // 标题
  subTitle: '前端打杂人员，略微代码洁癖', // 子标题
  // 个人主页
  homepages: {
    github: 'https://github.com/gershonv',
    juejin: 'https://juejin.im/user/5acac6c4f265da2378408f92',
  },
}

// === discuss avatar
export const DISCUSS_AVATAR = SIDEBAR.avatar // 评论框博主头像

// github
export const GITHUB = {
  enable: true, // github 第三方授权开关
  client_id: '', // Setting > Developer setting > OAuth applications => client_id
  url: 'https://github.com/login/oauth/authorize', // 跳转的登录的地址
}

export const ABOUT = {
  avatar: SIDEBAR.avatar,
  describe: SIDEBAR.subTitle,
  discuss: true, // 关于页面是否开启讨论
  renderMyInfo: <MyInfo />, // 我的介绍 自定义组件 => src/views/web/about/MyInfo.jsx
}
```

### 后端 `server/config.js`

```js
const devMode = process.env.NODE_ENV === 'development'

const config = {
  PORT: 6060, // 启动端口
  ADMIN_GITHUB_LOGIN_NAME: 'gershonv', // 博主的 github 登录的账户名 user
  GITHUB: {
    client_id: 'c6a96a84105bb0be1fe5',
    client_secret: '',
    access_token_url: 'https://github.com/login/oauth/access_token',
    fetch_user_url: 'https://api.github.com/user', // 用于 oauth2
    fetch_user: 'https://api.github.com/users/', // fetch user url https://api.github.com/users/gershonv
  },
  EMAIL_NOTICE: {
    // 邮件通知服务
    // detail: https://nodemailer.com/
    enable: true, // 开关
    transporterConfig: {
      host: 'smtp.163.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'guodadablog@163.com', // generated ethereal user
        pass: '123456', // generated ethereal password 授权码 而非 密码
      },
    },
    subject: '郭大大的博客 - 您的评论获得新的回复！', // 主题
    text: '您的评论获得新的回复！',
    WEB_HOST: 'http://127.0.0.1:3000', // email callback url
  },
  TOKEN: {
    secret: 'guo-test', // secret is very important!
    expiresIn: '720h', // token 有效期
  },
  DATABASE: {
    database: 'test',
    user: 'root',
    password: '123456',
    options: {
      host: 'localhost', // 连接的 host 地址
      dialect: 'mysql', // 连接到 mysql
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: false, // 默认不加时间戳
        freezeTableName: true, // 表名默认不加 s
      },
      timezone: '+08:00',
    },
  },
}

// 部署的环境变量设置
if (!devMode) {
  console.log('env production....')

  // ==== 配置数据库
  config.DATABASE = {
    ...config.DATABASE,
    database: '', // 数据库名
    user: '', // 账号
    password: '', // 密码
  }

  // 配置 github 授权
  config.GITHUB.client_id = ''
  config.GITHUB.client_secret = ''

  // ==== 配置 token 密钥
  config.TOKEN.secret = ''

  // ==== 配置邮箱

  // config.EMAIL_NOTICE.enable = true
  config.EMAIL_NOTICE.transporterConfig.auth = {
    user: 'guodadablog@163.com', // generated ethereal user
    pass: '123456XXX', // generated ethereal password 授权码 而非 密码
  }
  config.EMAIL_NOTICE.WEB_HOST = 'https://guodada.fun'
}

module.exports = config
```

关于 `github` 第三方授权和 `email` 授权，可以参考

- [GitHub 第三方登录](https://www.jianshu.com/p/78d186aeb526)
- [GitHub 第三方授权 demo](https://github.com/gershonv/oAuth2-github.git)
- [nodemailer](https://nodemailer.com/)

## 使用这个项目
npm i
node app端口自行配置

## 采用pm2
cd server
pm2 start app.js
```

### 导入功能说明

导入 `md` 文件是按照 hexo 生成的前缀去解析的， 比如

```bash
---
title: ES6 - Class
date: 2018-07-16 22:19:09
categories: Javascript
tags:
  - Javascript
  - ES6
---
```

对应会解析为

- 标题：`ES6 - Class`
- 创建日期：`2018-07-16 22:19:09`
- 分类：`Javascript`
- 标签：`Javascript` `ES6`
