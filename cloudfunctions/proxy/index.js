// request请求转发云函数入口文件
const cloud = require('wx-server-sdk')
const na = require('navigateTo-promise');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // return await na({
  //   url:event.url,
  // }).then(body=>{
  //   return body;
  // }).catch(err=>{
  //   return err;
  // });
  return await rq({
    method: 'POST',
    uri: event.uri,
    headers: event.headers ? event.headers : {},
    body: event.body
  }).then(body => {
    return body
  }).catch(err => {
    return err
  })
}