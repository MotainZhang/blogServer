const moment = require('moment')
// article 表
module.exports = (sequelize, dataTypes) => {
	const Friend = sequelize.define(
		'friend', {
			id: {
				type: dataTypes.INTEGER(11),
				primaryKey: true,
				autoIncrement: true
			},
			content: {
				type: dataTypes.TEXT,
				allowNull: false
			}, // 评论详情
			images: {
				type: dataTypes.TEXT //存储的图片地址
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

	Friend.associate = models => {
		Friend.belongsTo(models.user, {
			foreignKey: 'userId',
			targetKey: 'id',
			constraints: false
		})
		Friend.hasMany(models.friendReply, {
			foreignKey: 'friendId',
			sourceKey: 'id',
			constraints: false // 在表之间添加约束意味着当使用 sequelize.sync 时，表必须以特定顺序在数据库中创建表。我们可以向其中一个关联传递
		})
		Friend.hasMany(models.friendLike, {
			foreignKey: 'friendId',
			sourceKey: 'id',
			constraints: false // 在表之间添加约束意味着当使用 sequelize.sync 时，表必须以特定顺序在数据库中创建表。我们可以向其中一个关联传递
		})
	}

	return Friend
}
