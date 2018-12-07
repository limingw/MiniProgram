//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var Public=require('./utils/public.js');
var WXBizDataCrypt = require('./utils/WXBizDataCrypt.js');
var util = require('./utils/util.js');
var Appid='wx8e06658e1fe84d06';
var AppSecret='9a93d17d196d5d10a318309e87a5e492';
const promisify=require('./utils/promisify.js');
const getSetting = promisify(wx.getSetting);
const login = promisify(wx.login);
const request = promisify(wx.request);
const getUserInfo=promisify(wx.getUserInfo);

App({
    onLaunch: function (options) {
        qcloud.setLoginUrl(config.service.loginUrl)
        // 判断是否由分享进入小程序
        if (options.scene == 1007 || options.scene == 1008) {
            this.globalData.share = true
        } else {
            this.globalData.share = false
        };
        //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
        this.globalData.height = Public.GetSysTeminfo().statusBarHeight;

        //获取系统信息
        this.systeminfo=Public.GetSysTeminfo();

        //获取用户信息
        this.GetUserInfo();

        //分享配置
        wx.showShareMenu({
            withShareTicket: true
        })

        //初始化云开发
        wx.cloud.init({
            env:'timicat-userinfo-0db1c9',
            traceUser: true
        });
    },

    globalData: {
        share: false,  // 分享默认为false
        height: 0,
    },

    usermoney:0,      //用户金额
    addmoney:0.66,          //用户每次的赏金
    frequency:3,            //用户提现次数
    userInfo:'',          //用户信息
    userinfoData:'',         //用户全部信息
    systeminfo:'',           //用户系统信息
    appId:'wxa819b5373062fea0',               //要跳转的appid
    otherPageUrl:'https://www.zhifutui.com',             //跳转H5链接

    //获取用户信息
    GetUserInfo:function (){
        var that=this;
        getSetting().then(res=>{
            if (res.authSetting['scope.userInfo'] === true) { // 成功授权
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                // getUserInfo().then(res=>{
                //       that.userinfoData=res.userInfo;
                //       console.log(res);
                //   }).catch(res=>{
                //     console.log(res);
                //   })
            } else if (res.authSetting['scope.userInfo'] === false) { // 授权弹窗被拒绝
                
            } else { // 没有弹出过授权弹窗
                
            }
            that.Login();
        }).catch(res=>{
            util.showModel('登录','登录失败');
        });
    },
    //获取数据库用户信息
    addData:function(){
        var that=this;
        if(that.userinfoData!==''){
            wx.cloud.callFunction({                     //从云函数查询当前用户
                name:'getuserinfo',
                data:{
                    frequency:3,
                    money:'0',
                    openId:that.userinfoData.openId,
                    unionId:that.userinfoData.unionId,
                    userInfo:{
                        avatarUrl:that.userinfoData.avatarUrl,
                        city:that.userinfoData.city,
                        country:that.userinfoData.country,
                        gender:that.userinfoData.gender,
                        language:that.userinfoData.language,
                        nickName:that.userinfoData.nickName,
                        province:that.userinfoData.province
                    }
                },
                success:res=>{
                    var info=res.result;
                    if(info.code===1001){                       //已有该用户
                        if((info.body.money)%1===0){              //根据数据类型转换
                            that.usermoney=parseInt(info.body.money);
                        }else{
                            that.usermoney=parseFloat(info.body.money);
                        }
                        that.frequency=info.body.frequency;
                    }else if(info.code===1002){                 //创建该用户
                        that.usermoney=0;
                        that.frequency=3;
                    }else if(info.code===1003){                  //创建失败
                        that.usermoney=0;
                        that.frequency=3;
                    }else if(info.code===1004){                 //查询失败
                        that.usermoney=0;
                        that.frequency=3;
                    }
                    
                    if(that.AddData){                   //执行顺序回调
                        that.AddData(info.body.money);
                    }
                },
                fail:err=>{
                    console.log(err);
                    // util.showModel('提示','请求失败');
                    that.usermoney=0;
                    that.frequency=3;
                }
            });
        }
    },

    //登录接口
    Login:function(){
        var that=this;
        login().then(res=>{
            if (res) {
                var code=res.code;
                that.userInfos(code);
            } else {
                // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                console.log('登录失败！' + res.errMsg);
            }
        }).catch(res=>{
            console.log('登录失败！' + res);
        });
    },

    //解密后的用户信息
    userInfos:function(code){
        var that=this;
        getUserInfo().then(res=>{
            wx.cloud.callFunction({
                name:'opengid',
                data:{
                    js_code:code,
                    iv:res.iv,
                    encryptedData:res.encryptedData
                },
                success:res=>{
                    console.log(res);
                    that.userinfoData=res.result;
                    that.addData();
                    if(that.GetuserInfo){
                        that.GetuserInfo(res.result);
                    }
                },
                fail:err=>{
                    console.log(err);
                    util.showModel('提示','请求失败');
                }
            });
        }).catch(res=>{
            console.log(res);
        });
    },

    //获得广告数据接口
    GetData:function(){
        var that=this;
        var data={}
        if(that.userinfoData!==''){                //有openid
            var sex=0;
            switch (that.userinfoData.gender) {             //性别判断
                case 0:
                    sex=2;
                    break;
                case 1:
                    sex=1;
                    break;
                case 2:
                    sex=0;
                    break;
                default:
                    sex=0;
                    break;
            };
            data={
                openid:that.userinfoData.openId,
                sex:sex,
                count:3
            }
        }else{
            data={
                count:3
            };
        }
        data=JSON.stringify(data);              //将要传的参数字符串化
        data=Public.Encrypt(0,data);                //加密
        request({
            url:'https://zhifutui.winsale.top/miniprogram/getdata',
            methods:'GET',
            dataType:'json',
            data:data
        }).then(res=>{
            if(res.code===1){               //请求成功
                var data=Public.Encrypt(1,res.msg);             //解密
                console.log(data);
                data=JSON.parse(data);
                var arrays=[];
                var items={};
                for (let index = 0; index < data.data.length; index++) {        //赋值
                    var infos=data.data[index];
                    items.id=infos.id;
                    items.src=infos.bgurl;
                    items.smallpic='../assets/images/smallhb.png';
                    items.icon=infos.iconurl;
                    items.title=infos.title;
                    items.detail=infos.detail;
                    items.money=infos.reward;
                    items.appid=infos.appid;
                    items.gohb=false;
                    items.oldhb=false;
                    items.switch=false;
                    items.shared=true;
                    items.buttontext='前往领取';
                    arrays.push(items);
                }
                Public.imgUrls=arrays;
            }else if(res.code===0){
                util.showModel('提示','服务器错误');
            }
        }).catch(err=>{
            util.showModel('提示','服务器错误');
            console.log(err);
        });
    },
})