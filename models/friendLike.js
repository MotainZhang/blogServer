const moment = require('moment')
// article 表
module.exports = (sequelize, dataTypes) => {
	const FriendLike = sequelize.define(
		'friendLike', {
			id: {
				type: dataTypes.INTEGER(11),
				primaryKey: true,
				autoIncrement: true
			},
			isPraise:{
				type: dataTypes.INTEGER(11),//该用户的点赞状态
			},
			friendId: {
				type: dataTypes.INTEGER(11) //关联主评论ID
			},
			userId: {
				type: dataTypes.INTEGER(11) //点赞用户ID
			},
			userName: {
				type: dataTypes.STRING(255) //点赞用户名
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
					return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
				}
			},
		}, {
			timestamps: true
		}
	)

	FriendLike.associate = models => {
		FriendLike.belongsTo(models.friend, {
			foreignKey: 'friendId',
			targetKey: 'id',
			constraints: false
		})
	}

	return FriendLike
}
