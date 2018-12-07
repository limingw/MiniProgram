
const ctx = wx.createCanvasContext("canvasI"); //创建id为canvasI的绘图
const ctx2 = wx.createCanvasContext("bgCanvas");//创建id为bgCanvas的背景绘图
var cilckprice=true;
var mytime;//跑马灯定时器名称
var lamp = 0; //判断跑马灯闪烁标记
var w2 = "";
var h2 = "";
var w1 = "";
var h1 = "";
const app=getApp();
var util = require('../../utils/util.js');
var Public=require('../../utils/public.js');

Page({
    //初始化数据
    data: {
        itemsNum: 6, //大转盘等分数
        itemsArc: 0, //大转盘每等分角度
        color: ["#FFB932", "#ffd57c"],//扇形的背景颜色交替；
        text: ["一等奖", "二等奖", "三等奖", "四等奖", "五等奖", "六等奖","七等奖","特等奖"],//每个扇形中的文字填充
        isRotate: 0,
        userinfoData:app.userinfoData,      //用户信息
        prize:'iPhone X',                   //中奖之后的奖品
        tickets:3,                  //剩余抽奖次数
        usermoney:app.usermoney,         //用户当前金额
        isint:true,     //是否为整数
        isbit:false,           //是否为单个数字
        len:'',             //金额滚动
        animation:[],
        dialog:{           //提现、活动规则提示框
            index:false,
            title:'抽奖',
            content:'活动规则：',
        },
        animationData:'',               //活动说明提示框动画
        turntable_index:false,              //中奖提示if
        animation_turntable:'',            //中奖提示框动画
        windowheight:600,             //系统高度
        hotgames:Public.hotgames,               //热门游戏
        markets:Public.markets,             //福利商城
    },

    //监听页面加载
    onLoad:function(e){
        var that=this;
        var itemsArc=360/that.data.itemsNum;         //获取大转盘每等分的角度
        that.setData({
            itemsArc
        },function(){
            wx.createSelectorQuery().select('#canvas-one').boundingClientRect(function(rect){
                w1=parseInt(rect.width/2);
                h1=parseInt(rect.height/2);
                console.log('w1,h1',w1,h1);
                that.Items(itemsArc);            //每一份扇形的内部绘制
            }).exec()
            mytime=setInterval(that.light,1000);        //启动跑马灯定时器
        });

        //执行顺序问题回调
        if(app.usermoney&&app.usermoney!=''){
            console.log('第一次回调',app.usermoney);
            this.setData({
                usermoney:app.usermoney
            });
        }else{
            console.log('第二次回调',app.usermoney);
            app.AddData=money=>{
                if(money!=''){
                    this.setData({
                        usermoney:app.usermoney
                    });
                }
            };
        }
        const db=wx.cloud.database();
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

        var that=this;
        that.setData({
            //获取系统高度
            windowheight:app.systeminfo.windowHeight,
        });
    },

    //监听页面初次渲染完成
    onReady:function(){
        var that=this;
        wx.createSelectorQuery().select('#canvas-bg').boundingClientRect(function(rect){
            w2=parseInt(rect.width/2);           //获取canvas宽度的一半
            h2=parseInt(rect.height/2);          //获取canvas高度的一半
            console.log(w2,h2);
            that.light();
        }).exec();
    },

    //绘制跑马灯
    light(){
        var that=this;
        var itemsNum=that.data.itemsNum;
        lamp++;
        if(lamp>=2){
            lamp=0;
        }
        ctx2.beginPath();
        ctx2.arc(w2,h2,w2,0,2*Math.PI);         //绘制底色为红色的圆形
        ctx2.setFillStyle('#DF1E14');
        ctx2.fill();
        ctx2.beginPath();
        ctx2.arc(w2,h2,w2-15,0,2*Math.PI);          //绘制底色为深黄的圆形
        ctx2.setFillStyle('#F5AD26');
        ctx2.fill();
        for (let i = 0; i < itemsNum*2; i++) {      //跑马灯小圆圈比大圆盘等分数量多一倍
            ctx2.save();
            ctx2.beginPath();
            ctx2.translate(w2,h2);
            ctx2.rotate(30*i*Math.PI/180);
            ctx2.arc(0,w2-15,8,0,2*Math.PI);        //绘制坐标为(0,-135)的圆形跑马灯小圆圈

            //跑马灯第一次闪烁时与第二次闪烁时绘制相反的颜色，再配上定时器循环闪烁就可以达到跑马灯一闪一闪的效果了。
            if(lamp===0){       //第一次闪烁时偶数奇数的跑马灯各绘制一种颜色
                if(i%2===0){
                    ctx2.setFillStyle('#FBF1A9');
                }else{
                    ctx2.setFillStyle('#fbb936');
                }
            }else{              //第二次相反
                if(i%2===0){
                    ctx2.setFillStyle('#fbb936');
                }else{
                    ctx2.setFillStyle('#FBF1A9');
                }
            }
            ctx2.fill();
            ctx2.restore();         //恢复之前保存的上下文，将循环的跑马灯保存下来(没有则会覆盖)    
        }
        ctx2.draw();
    },

    Items(e){
        console.log('items,w1,h1',w1,h1);
        var that=this;
        var itemsArc=e;     //每一份扇形的角度
        var Num=that.data.itemsNum;         //每份数量
        var text=that.data.text;            //放文字的数组
        for (let i = 0; i < Num; i++) {
            ctx.beginPath();
            ctx.moveTo(w1,h1);
            ctx.arc(w1,h1,w1-5,itemsArc*i*Math.PI/180,(itemsArc+itemsArc*i)*Math.PI/180);       //绘制扇形
            ctx.closePath();
            if(i%2===0){        //绘制偶数扇形和奇数扇形的颜色不同
                ctx.setFillStyle(that.data.color[0]);
            }else{
                ctx.setFillStyle(that.data.color[1]);
            }
            ctx.fill();
            ctx.save();
            ctx.beginPath();
            ctx.setFontSize(12);       //设置文字大小
            ctx.setFillStyle('#000');       //设置文字颜色
            ctx.setTextAlign('center');         //文字垂直居中
            ctx.setTextBaseline('middle');      //文字水平居中
            ctx.translate(w1,h1);           //将原点移至圆心位置
            ctx.rotate((itemsArc*(i+2))*Math.PI/180);       //旋转文字,从i+2开始
            ctx.fillText(text[i],0,-(h1*0.8));              //文字填充
            ctx.restore();              //保存绘图上下文
        }
        that.Images();
        ctx.draw(true);         //参数为true时，保存当前画布内容，继续绘制
    },

    //绘制奖品图片
    Images(){
        var that=this;
        var itemsArc=that.data.itemsArc;
        let Num=that.data.itemsNum;
        for (let i = 0; i < Num; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(w1,h1);
            ctx.rotate(itemsArc*(i+2)*Math.PI/180);
            ctx.drawImage('../assets/images/jp.jpg',-(w1*0.2),-(h1*0.6),(w1*0.4),(h1*0.2));
            ctx.restore();
        }
    },

    //点击开始抽奖
    start(){
        //一等奖:240,,二:180,三:120,四:60,五:0,六:300
        var that=this;
        if(that.data.tickets===0){         //抽奖次数为0不进行下一步
            util.showModel('提示','您的抽奖次数已用完,下次再来吧~');
            cilckprice=false;
        }
        if(!cilckprice){        //防止重复点击
            return;
        }
        cilckprice=false;
        //指定获奖结果,传入指定的旋转角度，内部指定获奖结果。在指定角度上加上旋转基数模拟转盘随机旋转。
        var n=that.data.isRotate;

        //随机获取结果
        var rand=Math.random()*1000;    //取一个随机的角度旋转
        n=n+rand-(rand%60)+1440;        //1440为旋转基数，最低要旋转1440度，即4圈。rand-(rand%60) 这个是让指针永远停在扇形中心的算法。n + 是为了重复点击的时候有足够的旋转角度
        that.setData({
            isRotate:n,
            userinfoData:app.userinfoData,
            tickets:that.data.tickets-1
        });
        setTimeout(function(){
            switch (n%360) {        //奖品判断
                case 240:
                    that.setData({
                        prize:'一等奖'
                    });
                    break;
                case 180:
                    that.setData({
                        prize:'二等奖'
                    });
                    break;
                case 120:
                    that.setData({
                        prize:'三等奖'
                    });
                    break;
                case 60:
                    that.setData({
                        prize:'四等奖'
                    });
                    break;
                case 0:
                    that.setData({
                        prize:'五等奖'
                    });
                    break;
                case 300:
                    that.setData({
                        prize:'六等奖'
                    });
                    break;
                default:
                    that.setData({
                        prize:'特等奖'
                    });
                    break;
            }
        },2000);
        
        setTimeout(function(){
            that.AnimateTurntable(0);
            setTimeout(function(){
                that.AnimateTurntable(1);
                cilckprice=true;
            },2800);
        },2600);
    },

    //活动说明
    Description:function(){
        var that=this;
        //调用弹框动画
        that.Animate(0,'explain');
    },

    //关闭提示框
    DiaClose:function(){
        var that=this;
        //调用弹框动画
        that.Animate(1,'');
    },

    //提示框animate动画
    Animate:function(status,type){
        var that=this;
        
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        this.animation = animation
        animation.translateY(that.data.windowheight).step()
        if(status===0){        //用来判断是关闭弹框还是开启
            that.setData({
                animationData: animation.export(),
                'dialog.index':true
            });
        }else{
            that.setData({
                animationData: animation.export(),
            });
        }
        setTimeout(function() {
            animation.translateY(0).step()
            if(status===0){        //用来判断是提现还是活动规则
                that.setData({
                    animationData: animation.export(),
                });
            }else{
                that.setData({
                    dialog:{
                        animationData: animation.export(),
                        'dialog.index':false,
                    }
                });
            }
        }.bind(this), 200);
    },

    //中奖提示框animate动画
    AnimateTurntable:function(status){
        var that=this;
        
        var animation = wx.createAnimation({
            duration: 2000,
            timingFunction: "ease",
            delay: 0,
            transformOrigin: "50% 50% 0",
        });
        this.animation = animation
        animation.opacity(0).step();
        if(status===0){        //用来判断是关闭弹框还是开启
            that.setData({
                animation_turntable: animation.export(),
                turntable_index:true
            });
        }else{
            that.setData({
                animation_turntable: animation.export(),
            });
        }
        setTimeout(function() {
            animation.opacity(1).step()
            if(status===0){        //用来判断是提现还是活动规则
                that.setData({
                    animation_turntable: animation.export(),
                });
            }else{
                that.setData({
                    dialog:{
                        animation_turntable: animation.export(),
                        turntable_index:false,
                    }
                });
            }
        }.bind(this), 200);
    },
});