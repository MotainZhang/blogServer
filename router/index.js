const Router = require('koa-router')
const router = new Router()

// controllers
const UserController = require('../controllers/user')
const ArticleController = require('../controllers/article')
const DiscussController = require('../controllers/discuss')
const TagController = require('../controllers/tag')
const FriendController = require('../controllers/friend')
// ==== article router
const articleRouter = new Router()

articleRouter
	.post('/', ArticleController.create) // 创建文章
	.get('/list', ArticleController.getList) // 获取文章列表
	.get('/md/:id', ArticleController.output) // 导出指定文章
	.post('/upload', ArticleController.upload) // 上传文章
	.post('/checkExist', ArticleController.checkExist) // 确认文章是否存在
	.post('/upload/confirm', ArticleController.uploadConfirm) // 确认上传的文章 读取 upload 文件文章 插入数据库
	.get('/output/all', ArticleController.outputAll) // 导出所有文章
	.get('/output/:id', ArticleController.output) // 导出文章
	.get('/:id', ArticleController.findById) // 获取文章
	.put('/:id', ArticleController.update) // 修改文章
	.delete('/:id', ArticleController.delete) // 删除指定文章

router.use('/blog/article', articleRouter.routes())

// ==== discuss router
const discussRouter = new Router()

discussRouter
	.post('/', DiscussController.create) // 创建评论或者回复 articleId 文章 id
	.delete('/comment/:commentId', DiscussController.deleteComment) // 删除一级评论
	.delete('/reply/:replyId', DiscussController.deleteReply) // 删除回复
	.post('/updateLikeNum', DiscussController.updateLikeNum) //更新点赞数量
router.use('/blog/discuss', discussRouter.routes())

// friend router
const friendController = new Router()
friendController
	.post('/', FriendController.create) // 创建评论或者回复 articleId 文章 id
	.delete('/comment/:commentId', FriendController.deleteComment) // 删除一级评论
	.delete('/reply/:replyId', FriendController.deleteReply) // 删除回复
	.post('/updateLikeNum', FriendController.updateLikeNum) //更新点赞数量
	.post('/delImage', FriendController.delImage) //删除图库图片
	.post('/getFriendComment', FriendController.getFriendComment) //获取点赞列表
router.use('/blog/friend', friendController.routes())

// tag category
router.get('/blog/tag/list', TagController.getTagList) // 获取所有的 tag 列表
router.get('/blog/category/list', TagController.getCategoryList) // 获取 category 列表

// root
router.post('/blog/login', UserController.login) // 登录
router.post('/blog/register', UserController.register) // 注册

// user
const userRouter = new Router()

userRouter
	// ..
	.get('/list', UserController.getList) // 获取列表
	.get('/findById', UserController.findById) // 获取用户详情
	.post('/editUser', UserController.editUser) // 获取用户详情
	.put('/:userId', UserController.updateUser) // 更新用户信息
	.delete('/:userId', UserController.delete) // 删除用户
	.post('/getNews', UserController.getNews) // 获取新闻
	.post('/readerNews', UserController.readerNews) // 解析新闻
router.use('/blog/user', userRouter.routes())

// ...
router.get('/blog', async ctx => {
	ctx.body = 'koa2后端已经启动!'
})

module.exports = router
