// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database()

async function select(event){
  const data = {              //接收的参数
    frequency: event.frequency,
    money: event.money,
    openId: event.openId,
    unionId: event.unionId,
    userInfo: {
      avatarUrl: event.avatarUrl,
      city: event.city,
      country: event.country,
      gender: event.gender,
      language: event.language,
      nickName: event.nickName,
      province: event.province
    }
  };
  var result = {
    code:'',
    body:''
  };

  db.collection('userInfoData').where({         //根据openId查询当前用户
    openId: data.openId
  }).get({
    success: function (res) {
      if (res.data.length === 0) {                //没有当前用户就去数据库创建
        db.collection('userInfoData').add({
          data: data,
          success: function (res) {
            console.log(res);
            result = { data: 0 };                  //创建成功
          },
          fail: function (error) {
            console.log(error);
            result = { data: 1 };                //创建失败
          }
        });
      } else {              //已有该用户
        result = res.data[0];
      }
    },
    fail: function (res) {
      console.log(res);
      result = { data: 3 };                  //查询失败
    }
  });
  return result;
}

// 云函数入口函数
exports.main = (event, context) => {
  const data = {              //接收的参数
    frequency: event.frequency,
    money: event.money,
    openId: event.userInfo.openId,
    unionId: event.unionId,
    userInfo: {
      avatarUrl: event.avatarUrl,
      city: event.city,
      country: event.country,
      gender: event.gender,
      language: event.language,
      nickName: event.nickName,
      province: event.province
    }
  };
  var result = {
    code: '',
    body: ''
  };

  return new Promise((resolve,reject)=>{
    db.collection('userInfoData').where({         //根据openId查询当前用户
      openId: data.openId
    }).get().then((res)=>{
      if (res.data.length === 0) {                //没有当前用户就去数据库创建
        db.collection('userInfoData').add({
          data: data,
        }).then((res) => {                  //创建成功
          result.code=1002;
          result.body=res;
          resolve(result);
          }).catch((err) => {                //创建失败
          result.code=1003;
          result.body=err;
          resolve(result);
        });
      } else {              //已有该用户
        result.code=1001;
        result.body = res.data[0];
        resolve(result);
      }
    }).catch((err)=>{                        //查询失败
      result.code=1004;
      result.body=err;
      resolve(result);
    });
  })
  
}