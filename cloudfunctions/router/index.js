// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数router入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    code:0,
    message:'success'
  }
}