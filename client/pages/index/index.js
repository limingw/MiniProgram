//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var Public=require('../../utils/public.js')
const app=getApp();
const db=wx.cloud.database();

Page({
    data: {
        userInfo: {},
        userInfos:{},
        logged: false,
        takeSession: false,
        requestResult: '',
        usermoney:app.usermoney,         //用户当前金额
        isint:true,     //是否为整数
        //图片轮播
        imgUrls: [
            {
                link: '../index/index',   //跳转地址
                url: '../assets/images/pic1.jpeg'             //图片路径
            }, {
                link: '../welfare/welfare',
                url: '../assets/images/pic2.jpg'
            }, {
                link: '../welfare/welfare',
                url: '../assets/images/pic3.jpg'
            },{
                link: '../welfare/welfare',
                url: '../assets/images/pic4.jpg'
            },{
                link: '../welfare/welfare',
                url: '../assets/images/pic5.jpg'
            },{
                link: '../welfare/welfare',
                url: '../assets/images/pic6.jpg'
            }
          ],
          indicatorDots: true,  //小点
          autoplay: true,  //是否自动轮播
          interval: 3000,  //间隔时间
          duration: 1000,  //滑动时间
          // 组件所需的参数
        // nvabarData: {
        //     showCapsule: 1, //是否显示左上角图标
        //     title: 'Tmi猫精选', //导航栏 中间的标题
        // },
    
        // // 此页面 页面内容距最顶部的距离
        // height: app.globalData.height * 2 + 20 ,
        len:'',
        animation:[],
    },

      //加载界面运行
    onLoad: function () {
        var that=this;
        // this.GetUserInfo(); 
        this.show_num(0);
        app.addData(this,()=>{
            that.initMoney();
        });
        
        console.log(that.data.usermoney);
    },

    show_num:function(n){
        var len = String(n).length;
        this.setData({
          len: len,
        })
        var char = String(n).split("")
        // h存储数字块高度
        var h = ''
        let self = this
        // 创造节点选择器
        wx.createSelectorQuery().select('.unit-num').boundingClientRect(function(rect){
          h = rect.height
           // 这里用数组存储所有动画 方便for循环出来的view绑定不同animation
          var animate = []
          for(var i=0;i<len;i++){
            animate[i] = wx.createAnimation()
            animate[i].top(-parseInt(h)*char[i]).step({
              duration:1000
            })
            // 这里数组变量赋值 
            var deletedtodo='animation['+i+']';
            self.setData({
              //输出动画
              [deletedtodo]: animate[i].export()
            })
          }
        }).exec()
      },

    //签到
    SignIn:function(){
        var that=this;
        
    },

    //增加金额
    Addmoney(money){
        var that=this;
        var money=String(money);
        var usermoney="";
        // this.setData({
        //     usermoney:app.usermoney+parseInt(money)
        // });
        var index=money.lastIndexOf('.');
        if(0<money<1){               //0-1
            money=money.substring(index+1,money.length);
        }else{        
            if(money%1===0){     //整数
                that.setData({
                    isint:false
                });
                if(money.length<2){   //1-10
                    money=money;
                }else{               //10以上的数
                    app.usermoney=that.data.usermoney;
                    usermoney=money.substring(0,money.length-1);
                    that.setData({
                        usermoney:app.usermoney+parseInt(usermoney)
                    });
                    money=money.charAt(money.length-1);
                }
            }else{                 //小数
                usermoney=money.substring(0,money.length-1);
                app.usermoney=that.data.usermoney;
                    that.setData({
                        usermoney:app.usermoney+parseInt(usermoney)
                    });
                var lengths=money.length-(index+1);
                if(lengths>1){         //一位以上的小数
                    money=money.charAt(money.length-1);
                }else{
                    money=money.substring(index+1,money.length);
                }
            }
        }
        this.show_num(parseInt(money));
    },

    // 用户登录示例
    login: function() {
        if (this.data.logged) return

        //等待状态
        //util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        wx.login({
            success(result) {
                if (result) {
                    // util.showSuccess('登录成功')
                    that.setData({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    wx.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            // util.showSuccess('登录成功')
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
                            })
                        },

                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    //获取用户信息
    GetUserInfo:function(){
        var that=this;
      wx.getUserInfo({
        success(res){
          console.log(res);
          that.setData({
            userInfos: res.userInfo
          });
        },
        fail(error){
          console.log(error);
        }
      })
    },

  //授权
  GetAuthorize:function(){
    var that=this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res);
              that.setData({
                userInfos: res.userInfo
              });
            }
          })
          return;
        }
      }
    });
  },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },

    //登录过期检测
    Session:function(){
      var that=this;
      wx.checkSession({
        success(res){
          // console.log(res);
        },
        fail(){
          that.setData({
            logged: false
          });
          that.login();
        }
      });
    },

    //获取数据库用户信息
    addData:function(){
        var that=this;
        db.collection('userInfoData').where({
            openId:app.userinfoData.openId
        }).get({
            success:function(res){
                console.log(res);
                if(res.data.length===0){
                    db.collection('userInfoData').add({
                        data:{
                            frequency:3,
                            money:'0',
                            openId:app.userinfoData.openId,
                            unionId:app.userinfoData.unionId,
                            userInfo:{
                                avatarUrl:app.userinfoData.avatarUrl,
                                city:app.userinfoData.city,
                                country:app.userinfoData.country,
                                gender:app.userinfoData.gender,
                                language:app.userinfoData.language,
                                nickName:app.userinfoData.nickName,
                                province:app.userinfoData.province
                            }
                        },
                        success:function(res){
                            console.log(res);
                        },
                        fail:function(error){
                            console.log(error);
                        }
                    });
                }else{              //已有该用户
                    
                }
                app.usermoney=res.data[0].money;
                that.initMoney();
            },
            fail:function(res){
                console.log(res);
            }
        });
    },

    //初始化金额
    initMoney:function(){
        var that=this;
        console.log(app.usermoney);
        // var moneyinfo=Public.InitMoney(app.usermoney);
        // that.setData({
        //     usermoney:parseInt(moneyinfo.usermoney)
        // });
        // if(app.usermoney%1===0){     //整数
        //     that.setData({
        //         isint:false
        //     });
        // }else{
        //     that.setData({
        //         isint:true
        //     });
        //     that.show_num(parseInt(moneyinfo.money));
        // }
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res){
                util.showBusy('正在上传')
                var tempfilePath = res.tempFilePaths[0]

                // 上传图片
                wx.cloud.uploadFile({
                    // url: config.service.uploadUrl,
                    cloudPath:'picture',
                    filePath: tempfilePath,
                    name: 'file',

                    success: function(res){
                        util.showSuccess('上传图片成功')
                        console.log(res)
                        res = JSON.parse(res.data)
                        console.log(res)
                        that.setData({
                          imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function(e) {
                        util.showModel('上传图片失败')
                        console.log(e);
                    }
                })

            },
            fail: function(e) {
                console.error(e)
            }
        })
    },

    // 预览图片
    previewImg: function () {
        wx.previewImage({
            current: this.data.imgUrl,
            urls: [this.data.imgUrl]
        })
    },

    // 切换信道的按钮
    switchChange: function (e) {
        var checked = e.detail.value

        if (checked) {
            this.openTunnel()
        } else {
            this.closeTunnel()
        }
    },

    openTunnel: function () {
        util.showBusy('信道连接中...')
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            util.showSuccess('信道已连接')
            console.log('WebSocket 信道已连接')
            this.setData({ tunnelStatus: 'connected' })
        })

        tunnel.on('close', () => {
            util.showSuccess('信道已断开')
            console.log('WebSocket 信道已断开')
            this.setData({ tunnelStatus: 'closed' })
        })

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            util.showBusy('正在重连')
        })

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            util.showSuccess('重连成功')
        })

        tunnel.on('error', error => {
            util.showModel('信道发生错误', error)
            console.error('信道发生错误：', error)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            util.showModel('信道消息', speak)
            console.log('收到说话消息：', speak)
        })

        // 打开信道
        tunnel.open()

        this.setData({ tunnelStatus: 'connecting' })
    },

    /**
     * 点击「发送消息」按钮，测试使用信道发送消息
     */
    sendMessage() {
        if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
        // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
        if (this.tunnel && this.tunnel.isActive()) {
            // 使用信道给服务器推送「speak」消息
            this.tunnel.emit('speak', {
                'word': 'I say something at ' + new Date(),
            });
        }
    },

    /**
     * 点击「关闭信道」按钮，关闭已经打开的信道
     */
    closeTunnel() {
        if (this.tunnel) {
            this.tunnel.close();
        }
        util.showBusy('信道连接中...')
        this.setData({ tunnelStatus: 'closed' })
    }
})
