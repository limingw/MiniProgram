var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var Public=require('../../utils/public.js');
const app=getApp();
const promisify=require('../../utils/promisify.js');
const getUserInfo = promisify(wx.getUserInfo)
const innerAudioContext = wx.createInnerAudioContext();
const request = promisify(wx.request);

Page({
    data: {
        dialog:{           //提现、活动规则提示框
            index:false,
            title:'提现',
            content:'提现规则：',
            putcash:true,
        },
        //剩余提现次数
        surplus:0,
        lastImgIndex:'',      //上个任务金额
        //完成任务所得金额
        pocketmoney:"0",
        pocketif:false,
        //用户信息
        nickName:app.userinfoData.nickName,
        userInfos:"",
        userInfo:{
            money:250,
            encryptedData:'',
            session_key:'',
            iv:'',
        },
        //领取成功提示框
        animate:{
            index:false,
            smhb:true,           //小红包
            moregold:true,          //小金币
            content:true,
            animationhb:'',
        },
        //增加金额
        addmoney:{
            index:false,
            animationData:''
        },
        animationData: '',    //升降动画
        windowheight:600,          //当前屏幕高度
        usermoney:app.usermoney,         //用户当前金额
        isint:true,     //是否为整数
        isbit:false,           //是否为单个数字
        len:'',             //金额滚动
        animation:[],
        userauth:true,               //用户是否授权
        sharedOpenid:'',                //是否由分享进入页面
        imgUrls:Public.imgUrls,             //广告数组
        hotgames:Public.hotgames,            //热门游戏数组
        markets:Public.markets,             //福利商城数组
    },

    //加载界面运行
    onLoad: function (opt) {
        var that=this;
        that.show_num(0);

        //执行顺序问题回调
        if(app.usermoney&&app.usermoney!=''){
            that.Addmoney(app.usermoney,'init');
        }else{
            app.AddData=money=>{
                if(money!=''){
                    that.Addmoney(app.usermoney,'init');
                }
            }; 
        }

        //由分享进入页面
        var sharedId=opt.sharedId;
        if(typeof(sharedId)==='undefined'||sharedId==='undefined'||sharedId===undefined){
            var sharedId='';
        }
        that.setData({
            //分享后带的id值
            sharedOpenid:sharedId,
            //获取系统高度
            windowheight:app.systeminfo.windowHeight,
        });
    },

    //启动监听，初始化完成之后
    onLaunch:function(opt){
        
    },

    //前台监听，启动小程序或切回前台时
    onShow:function(options){
        var that=this;
        //绑定用户分享关系
        var sharedId=that.data.sharedOpenid;
    },

    //后台监听，进入后台运行时
    onHide:function(opt){
        
    },

    //错误监听,发生脚本错误时
    onError:function(){
        
    },

    //页面不存在监听
    onPageNotFound:function(){

    },

    //监听页面卸载
    onUnload: function () {
        // innerAudioContext.destroy();
        //console.log(getCurrentPages());
    },

    //监听页面分享
    onShareAppMessage:function(res){
        var that=this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            //console.log(res.target)
        }
        var nickName='';
        var openId='';
        if(app.userinfoData===''){
            nickName='';
            openId='';
        }else if(typeof(app.userinfoData.nickName)==='undefined'||app.userinfoData.nickName==='undefined'||app.userinfoData.nickName===undefined||app.userinfoData.nickName===''){
            nickName='';
            openId='';
        }else{
            nickName=app.userinfoData.nickName;
            openId=app.userinfoData.openId;
        }
        var ShareMessage={
            title:nickName+'派送现金红包啦',        //小程序标题
            // desc:'323213',
            path:'/pages/welfare/welfare?sharedId='+openId,                 //要打开的小程序的页面路径(不填则打开首页)
            success: function(res) {
                console.log(res);
                // 转发成功之后的回调
    　　　　　　 if(res.errMsg === 'shareAppMessage:ok'){
                    wx.getShareInfo({
                        shareTicket: res.shareTickets[0],
                        success(resShare) { 
                            var encryptedData = resShare.encryptedData;
                            var iv = resShare.iv;
                            console.log(resShare);
                        },
                        fail(resShare) { 
                            console.log(resShare);
                            // 转发失败之后的回调
                    　　　　if(resShare.errMsg === 'shareAppMessage:fail cancel'){
                        　　　　// 用户取消转发
                        　　}else if(resShare.errMsg === 'shareAppMessage:fail'){
                        　　　　// 转发失败，其中 detail message 为详细失败信息
                        　　}
                        },
                        complete(){
                        　// 转发结束之后的回调（转发成不成功都会执行）
                        }
                    });
    　　　　　　 }
            },
            fail: function(res) {
                //分享失败
                console.log(res);
            }
        }
        return ShareMessage;
    },

    //监听用户刷新
    onPullDownRefresh:function(){
        var that=this;
        //this.onLoad();//我对onLoad方法进行了重新加载，你可以执行别的方法
        var items=that.data.imgUrls;
        //刷新还原数组
        for (let index = 0; index < items.length; index++) {
            items[index].gohb=false;
            items[index].oldhb=false;
            items[index].switch=false;
            items[index].shared=true;
            items[index].smallpic='../assets/images/smallhb.png';
            items[index].buttontext='前往领取';
            if(index===items.length-1){
                items[index].src=items[0].src;
            }else{
                items[index].src=items[index+1].src;
            }
        }
        that.setData({
            imgUrls:items
        });

        //处理完成停止刷新
        wx.stopPullDownRefresh();
    },

    //用户授权之后的响应
    bindGetUserInfo:function(e){
        var that=this;
        if(e.detail.errMsg==='getUserInfo:fail auth deny'){        //拒绝授权
            //util.showModel('提示','您拒绝了授权将无法继续领取福利');
            that.setData({
                userauth:false
            });
        }else{
            if(that.data.userInfos===''){                 //用户信息为空
                app.GetUserInfo();
                setTimeout(function(){
                    that.setData({
                        userInfos:app.userinfoData
                    }); 
                },1200);
            }
            if(that.data.userauth===false){
                that.setData({
                    userauth:true
                });
            }
        }
        that.Gotask(that.data.lastImgIndex);
    },

    //做任务(用来传参)
    Gotask1:function(event){
        var that=this;
        console.log(event);
        var imgindex=event.currentTarget.dataset.id;         //传回的index值
        that.setData({
            lastImgIndex:imgindex
        });
    },

    //做任务
    Gotask:function(imgindex){
        var that=this;
        //var imgindex=event.currentTarget.dataset.index;         //传回的index值
        var imgUrls=that.data.imgUrls;
        for (let index = 0; index < imgUrls.length; index++) {
            if(imgindex===imgUrls[index].id){
                app.otherPageUrl=imgUrls[index].url;          //赋值跳转地址
                that.setData({          //赋值完成任务所得零钱
                    pocketmoney:imgUrls[index].money
                });
                if(imgUrls[index].gohb===true&&imgUrls[index].oldhb===true){
                    return false;
                }
                var setgohb='imgUrls['+index+'].gohb';
                var setswitch='imgUrls['+index+'].switch';
                var setsmallhb='imgUrls['+index+'].smallpic';
                var buttontext='imgUrls['+index+'].buttontext';
                var setoldhb='imgUrls['+index+'].oldhb';
                var shared='imgUrls['+index+'].shared';
                if(imgUrls[index].gohb===false){       //前往任务
                    wx.navigateTo({
                        url: '../otherpage/web/index',
                        success: (result)=>{
                            if(result.errMsg==='navigateTo:ok'){        //跳转成功
                                //请求接口跳转成功
                            }
                            if(!that.data.userauth){            //未授权
                                console.log('未授权');
                            }else{
                                setTimeout(function(){
                                    that.setData({
                                        [setgohb]:true,
                                        [setswitch]:true,
                                        [setsmallhb]:'../assets/images/newhb.png',
                                        [buttontext]:'立即领取'
                                    });
                                },1000);
                            }
                        },
                        fail: (error)=>{
                            console.log(error);
                        },
                        complete: ()=>{}
                    });
                }else{         //完成任务后
                    // if(app.userinfoData!==''){
                    //     var data={
                    //         openid:app.userinfoData.openId,
                    //         reward:imgUrls[index].money
                    //     };
                    //     data=JSON.stringify(data);              //字符串化
                    //     data=Public.Encrypt(0,data);            //加密
                    //     request({
                    //         url:'https://zhifutui.winsale.top/miniprogram/getreward',
                    //         methods:'GET',
                    //         dataType:'json',
                    //         data:data
                    //     }).then(res=>{
                    //         console.log(res);
                    //         if(res.code===1){           //成功
                    //             console.log('成功');
                    //             imgUrls[i].money=res.msg.reward;
                    //             that.setData({          //赋值完成任务所得零钱
                    //                 pocketmoney:imgUrls[i].money
                    //             });
                    //             that.HbAnimate();
                    //             setTimeout(function(){
                    //                 that.setData({
                    //                     [setoldhb]:true,
                    //                     [setsmallhb]:'../assets/images/oldhb.png',
                    //                     [shared]:false,
                    //                     [buttontext]:'立即分享'
                    //                 });
                    //             },700);
                    //         } else if(res.code===0){        //失败
                    //             console.log('失败');
                    //         }
                    //     }).catch(err=>{
                    //         util.showModel('提示','服务器错误');
                    //         console.log(err);
                    //     });
                    // }
                    that.HbAnimate();
                    setTimeout(function(){
                        that.setData({
                            [setoldhb]:true,
                            [setsmallhb]:'../assets/images/oldhb.png',
                            [shared]:false,
                            [buttontext]:'立即分享'
                        });
                    },700);
                }
            }
        }
    },

    //完成任务后的领取
    Receive:function(){
        var that=this;
    },

    //前往游戏
    ClickGame:function(event){
        var that=this;
        var imgindex=event.currentTarget.dataset.index;         //传回的index值
        var hotgames=that.data.hotgames;
        for (let index = 0; index < hotgames.length; index++) {
            if(imgindex===index){
                app.otherPageUrl=hotgames[index].url;
                wx.navigateTo({
                    url: hotgames[index].link,
                    success: (result)=>{
                        
                    },
                    fail: (error)=>{
                        console.log(error);
                    },
                    complete: ()=>{}
                });
            }
        }
    },

    //前往商城
    ClickMarkets:function(event){
        var that=this;
        var imgindex=event.currentTarget.dataset.index;         //传回的index值
        var markets=that.data.markets;
        for (let index = 0; index < markets.length; index++) {
            if(imgindex===index){
                // app.otherPageUrl=markets[index].url;
                wx.navigateToMiniProgram({
                    appId: 'wxd0fe51e321948927',
                    path: '',
                    envVersion: 'release',
                    success(res) {
                        console.log(res);
                    },
                    fail(err){
                        console.log(err);
                    }
                });
            }
        }
    },

    //跳转小程序
    JumpProgram:function(appid,id){
        wx.navigateToMiniProgram({
            appId: 'wxd0fe51e321948927',
            path: '',
            envVersion: 'release',
            success(res) {
                if(res.errMsg==='navigateToMiniProgram:ok'){
                    //跳转成功
                    if(app.userinfoData!==''){                  //用户信息不为空
                        var sex=0;
                        switch (app.userinfoData.gender) {             //性别判断
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
                        var data={                  //参数
                            id:id,
                            openid:app.userinfoData.openId,
                            sex:sex
                        }
                        data=JSON.stringify(data);              //将要传的参数字符串化
                        data=Public.Encrypt(0,data);                //加密
                        request({
                            url:'https://zhifutui.winsale.top/miniprogram/click',
                            methods:'GET',
                            dataType:'json',
                            data:data
                        }).then(res=>{
                            console.log(res);
                            if(res.code===1){
                                console.log('成功');
                                for (let i = 0; i < imgUrls.length; i++) {      //更改奖励金
                                    if(imgUrls[i].id===id){
                                        imgUrls[i].money=res.msg.reward;
                                        that.setData({          //赋值完成任务所得零钱
                                            pocketmoney:imgUrls[i].money
                                        });
                                    }
                                }
                            } else if(res.code===0){
                                console.log('失败');
                            }
                        }).catch(err=>{
                            util.showModel('提示','服务器错误');
                            console.log(err);
                        });
                    }
                }
            },
            fail(err){
                console.log(err);
                if(err.errMsg==='navigateToMiniProgram:fail cancel'){
                    util.showModel('提示','您取消了跳转');
                }
            }
        });
    },

    //领取零钱红包动画
    HbAnimate:function(){
        var that=this;
        var animation = wx.createAnimation({
            duration: 1000,
            timingFunction: "ease-in-out",
            delay: 0
        })
        this.animation = animation
        animation.scale(3.2,4.2).translateY(-20).step();
        setTimeout(function(){
            that.setData({
                animate:{
                    index:true,
                    smhb:false,           //小红包
                    moregold:true,          //小金币
                    content:true,
                }
                
            })
        },300);
        setTimeout(function(){
            innerAudioContext.src = "https://7469-timicat-userinfo-0db1c9-1258164987.tcb.qcloud.la/audiogold/CoinGain.mp3?sign=f71a6cd64e4d948bc756ee873f1bca80&t=1543389999";
            innerAudioContext.play();
            innerAudioContext.onPlay(() => {
                console.log('开始播放')
            })
            innerAudioContext.onError((res) => {  
                console.log(res.errMsg)
                console.log(res.errCode)
            });
        },300);
        
        //增加零钱
        setTimeout(function(){
            that.setData({
                'animate.index':false
            });
            that.Addmoney(that.data.pocketmoney,'');
        },1800);
    },

    //提示框animate动画
    Animate:function(status,type){
        var that=this;
        
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(that.data.windowheight).step()
        if(status===0){        //用来判断是关闭弹框还是开启
            var dialoginfo={};
            if(type==='cash'){      //用来判断是提现还是活动规则
                dialoginfo={
                    index:true,
                    title:'提现',
                    content:'提现规则：',
                    putcash:true
                }
            }else if(type==='explain'){
                dialoginfo={
                    index:true,
                    title:'任务墙',
                    content:'活动规则：',
                    putcash:false
                }
            }
            that.setData({
                animationData: animation.export(),
                dialog:dialoginfo
            })
        }else{
            that.setData({
                animationData: animation.export(),
            })
        }
        setTimeout(function() {
            animation.translateY(0).step()
            if(status===0){        //用来判断是提现还是活动规则
                that.setData({
                    animationData: animation.export(),
                })
            }else{
                that.setData({
                    dialog:{
                        animationData: animation.export(),
                        index:false,
                    }
                });
            }
        }.bind(this), 200)
    },

    //提现弹框
    DiaPutCash:function(){
        var that=this;
        that.setData({
            surplus:app.frequency
        });
        //调用弹框动画
        that.Animate(0,'cash');
    },

    //金额提现
    PutCash:function(){
        var that=this;
        //音效
        innerAudioContext.src = "https://7469-timicat-userinfo-0db1c9-1258164987.tcb.qcloud.la/audiogold/Cash.mp3?sign=379ca8688b0d60e567df55002c3e10a4&t=1543391161";
            innerAudioContext.play();
            innerAudioContext.onPlay(() => {
                console.log('开始播放')
            })
            innerAudioContext.onError((res) => {  
                console.log(res.errMsg)
                console.log(res.errCode)
            });
    },
    
    //活动说明
    Description:function(){
        var that=this;
        //调用弹框动画
        that.Animate(0,'explain');
        //拿云端的音乐文件
        // wx.cloud.getTempFileURL({
        //     fileList:['cloud://7469-timicat-userinfo-0db1c9/audiogold/Cash.mp3'],
        //     success:res=>{
        //         console.log(res);
        //     },
        //     fail:err=>{
        //         console.log(err);
        //     }
        // });
    },

    //关闭提示框
    DiaClose:function(){
        var that=this;
        //调用弹框动画
        that.Animate(1,'');
    },

    //增加金额
    Addmoney(money,type){
        var that=this;
        const db=wx.cloud.database();
        if(type===''){                         //增加
            var moneys=parseFloat(money)+parseFloat(app.usermoney);
            moneys=String(moneys);
            if(moneys%1===0){           //用于两个小数相加结果位多位小数
                app.usermoney=moneys;
            }else{
                var after=moneys.split('.')[1];
                if(after.length>2){
                    app.usermoney=parseFloat(moneys).toFixed(2);
                }else if(1<=after<=2){
                    app.usermoney=moneys;
                }else if(after===undefined){
                    app.usermoney=moneys;
                }else{
                    app.usermoney=parseFloat(moneys).toFixed(2);
                }
            }
            
            db.collection('userInfoData').where({          //查询然后增加当前用户的金币
                openId:app.userinfoData.openId
            }).get({
                success:function(res){
                    if(res.data.length!==0){
                        db.collection('userInfoData').doc(res.data[0]._id).update({
                            data:{
                                money:app.usermoney
                            },
                            success:function(res){
                                console.log(res);
                            },
                            fail:function(error){
                                console.log(error);
                            }
                        });
                    }
                },
                fail:function(res){
                    console.log(res);
                }
            });
            // wx.cloud.callFunction({                 //添加金币云函数
            //     name:'AddUser',
            //     data:{
            //         openId:app.userinfoData.openId,
            //         money:app.usermoney,
            //         type:'setmoney'
            //     },
            //     success:res=>{
            //         console.log('添加成功',res);
            //         var info=res.result;
            //         if(info.code===1001){           //查询当前用户失败
            //             console.log(info.body);
            //         }else if(info===1002){          //添加金币成功
            //             console.log(info.body);
            //         }else if(info===1003){          //添加失败
            //             console.log(info.body);
            //         }
            //     },
            //     fail:err=>{
            //         console.log('添加失败',err);
            //     }
            // });
        }
        if(app.usermoney%1===0){               //显示隐藏个位数
            if(app.usermoney>10){
                that.setData({
                    isbit:true
                });
            }else{
                that.setData({
                    isbit:false
                });
            }
        }else{
            that.setData({
                isbit:true
            });
        }
        var usermoney="";
        money=String(app.usermoney).charAt(String(app.usermoney).length-1);
        usermoney=String(app.usermoney).slice(0,String(app.usermoney).length-1);
        setTimeout(function(){
            that.setData({
                usermoney:usermoney
            });
        },800);

        //调用数字滚动动画
        this.show_num(parseInt(money));
    },

    //数字滚动
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
              duration:800
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
});