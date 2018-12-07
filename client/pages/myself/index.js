var Public=require('../../utils/public.js');
const app=getApp();
const promisify=require('../../utils/promisify.js');

Page({
    data:{
        dialog:{           //提现、活动规则提示框
            index:false,
        },
        animationData: '',    //升降动画
        windowheight:600,       //系统高度
        cash:4085,              //现金金额
        profit:2022,            //累计收益
        userInfo:app.userinfoData,          //当前用户信息
        moneyTips:[],               //收益广播
        surplus:3,                  //剩余提现次数
    },

    //监听页面加载
    onLoad:function(){
        var that=this;
        that.setData({
            //获取系统高度
            windowheight:app.systeminfo.windowHeight,
        });
        
        //执行顺序问题回调
        if(app.userinfoData&&app.userinfoData!=''){
            that.setData({
                userInfo:app.userinfoData
            });
            that.add();
        }else{
            app.GetuserInfo=result=>{
                if(result!==''){
                    that.setData({
                        userInfo:app.userinfoData
                    });
                    that.add();
                }
            };
        }
    },

    //增加广播
    add:function(){
        var that=this;
        var tips=[];
        for (let index = 0; index < 10; index++) {
            tips.push({
                tips:'新用户'+that.data.userInfo.nickName+'完成任务墙，你获得'+app.addmoney+'元',
                money:'+'+app.addmoney+'元'
            });
        }
        that.setData({
            moneyTips:tips
        });
    },

    //金额提现
    DiaPutCash:function(){
        var that=this;
        //开启活动弹框
        that.Animate(0);
    },

    //确认提现
    PutCash:function(){
        var that=this;
    },

    //关闭提示框
    DiaClose:function(){
        var that=this;
        //调用弹框动画
        that.Animate(1);
    },

    //提示框animate动画
    Animate:function(status){
        var that=this;
        
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(that.data.windowheight).step()
        if(status===0){        //用来判断是关闭弹框还是开启
            that.setData({
                animationData: animation.export(),
                'dialog.index':true
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
                    animationData: animation.export(),
                    'dialog.index':false,
                });
            }
        }.bind(this), 200)
    },
})