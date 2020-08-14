const moment = require('moment')
// article 表
module.exports = (sequelize, dataTypes) => {
	const FriendReply = sequelize.define(
		'friendReply', {
			id: {
				type: dataTypes.INTEGER(11),
				primaryKey: true,
				autoIncrement: true
			},
			content: {
				type: dataTypes.TEXT,
				allowNull: false
			}, // 评论详情
			friendId: {
				type: dataTypes.INTEGER(11) //关联主评论ID
			},
			replyUserId: {
				type: dataTypes.INTEGER(11) //回复用户ID
			},
			replyUserName: {
				type: dataTypes.STRING(255) //回复用户名
			},
			userId: {
				type: dataTypes.INTEGER(11) //自己的ID
			},
			userName: {
				type: dataTypes.STRING(255) //自己的用户名
			},
			createdAt: {
				type: dataTypes.DATE,
				defaultValue: dataTypes.NOW,
				get() {
					return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
				}
			},
			updatedAt: {
				type: dataTypes.DATE,
				defaultValue: dataTypes.NOW,
				get() {
					return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
				}
			}
		}, {
			timestamps: true
		}
	)

	FriendReply.associate = models => {
		FriendReply.belongsTo(models.friend, {
			foreignKey: 'friendId',
			targetKey: 'id',
			constraints: false
		})
	}

	return FriendReply
}
