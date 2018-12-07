// 云函数入口文件
const cloud = require('wx-server-sdk')
const key = "YOURKEY1234YOURKEY1234YOURKEY123"//商户的key，不是小程序的密钥。32位，必须大写。
const mch_id = "1413090000" //商户号
const rp = require('request-promise')
const crypto = require('crypto')

cloud.init()

//客户端
// wx.cloud.callFunction({
//   name: 'getPay',
//   data: {
//     total_fee: parseFloat(0.01).toFixed(2) * 100,
//     attach: 'anything',
//     body: 'whatever'
//   }
// }).then(res => {
//     wx.requestPayment({
//       appId: res.result.appid,
//       timeStamp: res.result.timeStamp,
//       nonceStr: res.result.nonce_str,
//       package: 'prepay_id=' + res.result.prepay_id,
//       signType: 'MD5',
//       paySign: res.result.paySign,
//       success: res => {
//         console.log(res)
//       }
//     })
//   })

function paysign({ ...args }) {
  let sa = []
  for (let k in args) sa.push(k + '=' + args[k])
  sa.push('key=' + key);
  return crypto.createHash('md5').update(sa.join('&'), 'utf8').digest('hex');
}

  //云函数入口
exports.main = async (event, context) => {
  const appid = event.userInfo.appId
  const openid = event.userInfo.openId
  const attach = event.attach
  const body = event.body
  const total_fee = event.total_fee
  const notify_url = "https://whatever.com/notify"
  const spbill_create_ip = "118.89.40.200"
  const nonce_str = Math.random().toString(36).substr(2, 15)
  const timeStamp = parseInt(Date.now() / 1000) + ''
  const out_trade_no = "otn" + nonce_str + timeStamp

  let formData = "<xml>"
  formData += "<appid>" + appid + "</appid>"
  formData += "<attach>" + attach + "</attach>"
  formData += "<body>" + body + "</body>"
  formData += "<mch_id>" + mch_id + "</mch_id>"
  formData += "<nonce_str>" + nonce_str + "</nonce_str>"
  formData += "<notify_url>" + notify_url + "</notify_url>"
  formData += "<openid>" + openid + "</openid>"
  formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>"
  formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>"
  formData += "<total_fee>" + total_fee + "</total_fee>"
  formData += "<trade_type>JSAPI</trade_type>"
  formData += "<sign>" + paysign({ appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type: 'JSAPI' }) + "</sign>"
  formData += "</xml>";

  let res = await rp({ url: "https://api.mch.weixin.qq.com/pay/unifiedorder", method: 'POST', body: formData })
  let xml = res.toString("utf-8")
  if (xml.indexOf('prepay_id') < 0) return
  let prepay_id = xml.split("<prepay_id>")[1].split("</prepay_id>")[0].split('[')[2].split(']')[0]
  let paySign = paysign({ appId: appid, nonceStr: nonce_str, package: ('prepay_id=' + prepay_id), signType: 'MD5', timeStamp: timeStamp })

  return { appid, nonce_str, timeStamp, prepay_id, paySign }
}
