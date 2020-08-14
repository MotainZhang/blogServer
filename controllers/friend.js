const Joi = require('joi')
const axios = require('axios')
// import models
const {
	article: ArticleModel,
	tag: TagModel,
	category: CategoryModel,
	friend: FriendModel,
	friendReply: FriendReplyModel,
	friendLike: FriendlikeModel,
	user: UserModel,
	sequelize
} = require('../models')

class FriendController {
	static async create(ctx) {
		const validator = ctx.validate(ctx.request.body, {
			content: Joi.string().required(), // 评论 、回复的内容
			friendId: Joi.number(), // 回复相应的评论
			images: Joi.array()
		})

		if (validator) {
			try {
				const {
					id,
					userId,
					content,
					images,
				} = ctx.request.body
				let friendId = ctx.request.body.friendId
				let commentImages = []
				let commentImgStr = ''
				if (images) {
					images.forEach((item, index) => {
						commentImages.push(item.response.url);
					});
					commentImgStr = commentImages.join(',')
				}
				if (!friendId) {
					// 添加评论
					const comment = await FriendModel.create({
						id,
						userId,
						content,
						images: commentImgStr,
					})
				} else {
					// 添加回复
					await FriendReplyModel.create({
						id,
						userId,
						content,
						friendId,
						userName:ctx.request.body.userName,
						replyUserId:ctx.request.body.replyUserId,
						replyUserName:ctx.request.body.replyUserName,
					})
				}
				ctx.client(200, 'success')
			} catch (error) {
				console.log(error)
				ctx.client(500, '请检查输入内容', error)
			}
		}
	}

	static async deleteComment(ctx) {
		const validator = ctx.validate(ctx.params, {
			friendId: Joi.number().required()
		})

		if (validator) {
			const friendId = ctx.params.friendId
			await sequelize.query(
				`delete comment, reply from comment left join reply on comment.id=reply.friendId where comment.id=${friendId}`
			)
			ctx.client(200)
		}
	}
	//删除上传到图床的图片
	static async delImage(ctx) {
		const {
			id,
			token,
			action,
		} = ctx.request.body
		try {
			let result = await axios.post(`https://api.superbed.cn/info/${id}`, {
				token: token,
				action: action
			})
			ctx.client(200, '删除成功')
		} catch (error) {
			throw error
		}
	}
	//获取列表
	static async getFriendComment(ctx) {
		const data = await FriendModel.findAndCountAll({
			include: [{
					model: FriendReplyModel,
				},
				{
					model: UserModel,
					as: 'user',
					attributes: {
						exclude: ['updatedAt', 'password']
					}
				},
				{
					model: FriendlikeModel,
					attributes: ['id', 'friendId', 'createdAt', 'userId', 'userName', 'isPraise'],
				}
			],
			row: true,
			order: [
				['createdAt', 'DESC']
			]
		})
		ctx.client(200, '获取成功', data)
	}
	static async deleteReply(ctx) {
		const validator = ctx.validate(ctx.params, {
			replyId: Joi.number().required()
		})

		if (validator) {
			const replyId = ctx.params.replyId
			await friendReply.destroy({
				where: {
					id: replyId
				}
			})
			ctx.client(200)
		}
	}
	// 更新点赞数量
	static async updateLikeNum(ctx) {
		const validator = ctx.validate(ctx.request.body, {
			id: Joi.number().required(),
			isPraise: Joi.number().required(),
		})
		const {
			id,
			userId,
			friendId,
			userName,
			isPraise,
		} = ctx.request.body;
		if (validator) {
			if (isPraise == 0) {
				await FriendlikeModel.create({
					id,
					userId,
					friendId,
					userName,
					isPraise: 1,
				})
			} else {
				await FriendlikeModel.destroy({
					where: {
						id: id,
					}
				})
			}
			const data = await FriendlikeModel.findAndCountAll({
				where: {
					friendId
				},
				attributes: ['id', 'friendId', 'createdAt', 'userId', 'userName'],
				row: true,
				order: [
					['createdAt', 'DESC']
				]
			})
			ctx.client(200, '更新成功', data)
		}
	}
}

module.exports = FriendController
