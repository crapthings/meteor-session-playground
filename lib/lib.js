// 创建一个不存到数据库的 collection
Test = new Mongo.Collection('test', Meteor.isServer && { connection: null })
