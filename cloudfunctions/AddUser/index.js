// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter=require('tcb-router');

cloud.init();
const db = cloud.database();

// 云函数入口函数
//参数：当前用户openId,当前用户金额
exports.main = (event, context) => {
  if(event.type==='setmoney'){          //增加金币
    return AddMoney(event);
  }else if(event.type==='setcashup'){       //提现
    return Frequency(event);
  }
  
}

function AddMoney(event) {           //增加金币
  const openId = event.userInfo.openId;
  const money = event.usermoney;
  var result = {
    code: '',
    body: ''
  };

  return new Promise((resolve, reject) => {
    db.collection('userInfoData').where({           //根据openId查询用户
      openId: openId
    }).get().then((res) => {
      if (res.data.length !== 0) {                  //有当前用户就增加
        db.collection('userInfoData').doc(res.data[0]._id).update({
          $set: {
            money: money
          }
        }).then((res) => {
          result.code = 1002;
          result.body = res;
          resolve(result);
        }).catch((err) => {
          result.code = 1003;
          result.body = err;
          resolve(result);
        });
      }
    }).catch((err) => {
      result.code = 1001;
      result.body = err;
      resolve(result);
    })
  })
}

//减少抽奖次数
function Frequency(event){
  const openId = event.userInfo.openId;
  const frequency = event.frequency;
  const money = event.usermoney;
  var result = {
    code: '',
    body: ''
  };

  return new Promise((resolve, reject) => {
    db.collection('userInfoData').where({           //根据openId查询用户
      openId: openId
    }).get().then((res) => {
      if (res.data.length !== 0) {                  //有当前用户就增加
        db.collection('userInfoData').doc(res.data[0]._id).set({
          $set: {
            frequency: frequency,
            money:money
          }
        }).then((res) => {
          result.code = 1002;
          result.body = res;
          resolve(result);
        }).catch((err) => {
          result.code = 1003;
          result.body = err;
          resolve(result);
        });
      }
    }).catch((err) => {
      result.code = 1001;
      result.body = err;
      resolve(result);
    })
  })
}