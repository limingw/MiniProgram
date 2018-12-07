/**
 * *李先生自定义公共模块**
 * * */
var Appid='wx8e06658e1fe84d06';
var AppSecret='9a93d17d196d5d10a318309e87a5e492';
var WXBizDataCrypt = require('./WXBizDataCrypt.js');
var util = require('./util.js');
const app=getApp();
const promisify=require('./promisify.js');
const getUserInfo = promisify(wx.getUserInfo);
const navigateToMiniProgram=promisify(wx.navigateToMiniProgram);
const RSA=require('../utils/wxapp_rsa.js');
//私钥
var privateKey=`-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAL3Owl6LiN8kmy3G
ylOIrV4Lo8VfmhauEZSV/12bvCwVwmJPtkT9T5kZvFQ1m1jYeA/tAtU4vTnKDQ+i
2tVPjA8zVXNtV1g8erYo+2K935Ww2QkCdK4DTbaNtTrDeqRClO1PWtZjHsJR2GcY
cWSi4O2+ALHHIN/CsPYPPwvlxX8ZAgMBAAECgYAfG6Tlg+7xy3kXXo5IdI0dbcDw
l0OU1gCRnqfUurJzczmBjVjtI6sJB5vDHWoRfKDo00p0kbEJqKDNYD6HWVs11j2K
YcHIo+VFx4swp07jchUKNFiF0ZXQ2UMH0u5chQOBQ6HsgF7OchtuRQGVpF+IEiGc
1wu37nqisEAEB6NIAQJBAOXLJYENzn4T38PH6DgCN+y/caL6cEi3xWb7dmQuyTAv
9N4VAC5Rfj1yAIjNA09wqa6qRVtu1JGMx/nwDcHSlwECQQDTdDgn0gZ/gZAjKHZv
eMTrfGBCgIFqIZMTtYXJCv4xsBCC7eLtMopkS1D7IvJVGk9psxEMtDyqm/cZ5Ega
9MAZAkA22W2DR2Nhbqb7mUzRiZ4FsZCTQUnp4YuJ0D3rHcvB58B//e1EIQmL6xk7
jgvbO14VJelWMLcmYr8c5nKyL+0BAkEAzacbsobOsRXWlIsW3QVtJ8Y4bJVEyG7M
9381FbmuTa758AzjBmSAOlkR8p4jZ+eF0rxIWb21vwyfP7xI8IaXiQJBAOTcFJew
NQrxnva61S29nKaMP5znuMGWGPsyMZvyt5QnXop2xFCG44cwaB92+2k3RQq+3Fz0
ZN6lyANfYflbpAM=
-----END PRIVATE KEY-----`;

//公钥
var publicKey= `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9zsJei4jfJJstxspTiK1eC6PF
X5oWrhGUlf9dm7wsFcJiT7ZE/U+ZGbxUNZtY2HgP7QLVOL05yg0PotrVT4wPM1Vz
bVdYPHq2KPtivd+VsNkJAnSuA022jbU6w3qkQpTtT1rWYx7CUdhnGHFkouDtvgCx
xyDfwrD2Dz8L5cV/GQIDAQAB
-----END PUBLIC KEY-----`;

//广告资源
var imgUrls=[
    {
        id: '432464',   //跳转本地地址
        src: '../assets/images/adbg.png',             //图片路径
        url: 'https://www.zhifutui.com/INAVAD?name=5305dcb0&type=1&platform=1',                          //跳转链接
        smallpic:'../assets/images/smallhb.png',           //小图
        icon:'../assets/images/icon1.jpg',                    //广告图标
        title:'好友大作战红包',             //广告标题
        detail:'点击前往小程序预授权，\n返回后可领取现金红包',    //广告详情
        money:2.86,                 //任务所得金额
        appid:'',                   //要跳转的appid
        gohb:false,         //完成任务
        oldhb:false,          //已经领取
        switch:false,         //小图样式切换
        shared:true,               //是否为分享按钮
        buttontext:'前往领取',          //领取按钮文字
    }, {
        id: '5452343',
        src: '../assets/images/adbg.png',
        url: 'https://www.zhifutui.com/Areas/InavAd/zjd/Index.html?name=5305dcb0&openid=1585412578&view_id=a7d5faa5&type=1&oper_id=270df447e0adaeb39cc30405dec16e93&city=&pop_win=&sex=',
        smallpic:'../assets/images/smallhb.png',
        icon:'../assets/images/icon2.jpg',
        title:'京东红包',
        detail:'点击前往小程序预授权，\n返回后可领取现金红包',
        money:0.24,
        appid:'',
        gohb:false,
        oldhb:false,
        switch:false,
        shared:true,
        buttontext:'前往领取',
    },{
        id: '35464567',
        src: '../assets/images/adbg.png',
        url: 'https://www.zhifutui.com',
        smallpic:'../assets/images/smallhb.png',
        icon:'../assets/images/icon3.jpg',
        title:'唯品会红包',
        detail:'点击前往小程序预授权，\n返回后可领取现金红包',
        money:18,
        appid:'',
        gohb:false,
        oldhb:false,
        switch:false,
        shared:true,
        buttontext:'前往领取',
    }
]

var hotgames=[                    //热门游戏
    {
        link: '../otherpage/web/index',
        src: '../assets/images/game1.jpg',
        url: 'https://www.zhifutui.com',
        name:'蜀山大战',
        people:"111",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game2.jpg',
        url: 'https://www.zhifutui.com',
        name:'天天修仙',
        people:"143",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game3.jpg',
        url: 'https://www.zhifutui.com',
        name:'斗地主',
        people:"351",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game4.jpg',
        url: 'https://www.zhifutui.com',
        name:'吃鲨鱼咯',
        people:"215",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game2.jpg',
        url: 'https://www.zhifutui.com',
        name:'天天修仙',
        people:"5611",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game4.jpg',
        url: 'https://www.zhifutui.com',
        name:'吃鲨鱼咯',
        people:"215",
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/game4.jpg',
        url: 'https://www.zhifutui.com',
        name:'吃鲨鱼咯',
        people:"215",
    },
]

var markets=[                    //福利商城
    {
        link: '../otherpage/web/index',
        src: '../assets/images/mall1.jpg',
        url: 'https://www.zhifutui.com',
        content:'湖北宜昌新鲜青皮蜜桔 5斤装/9斤...',
        money:19.90,
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/mall2.jpg',
        url: 'https://www.zhifutui.com',
        content:'四川大凉山冰糖心丑苹果 8斤装（...',
        money:28.90,
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/mall3.jpg',
        url: 'https://www.zhifutui.com',
        content:'河南荣阳河阴软籽石榴 4斤装/5斤...',
        money:23.20,
    },{
        link: '../otherpage/web/index',
        src: '../assets/images/mall2.jpg',
        url: 'https://www.zhifutui.com',
        content:'四川大凉山冰糖心丑苹果 8斤装（...',
        money:14.90,
    }
]
    
    //获取用户的系统信息
    function GetSysTeminfo(){
        var that=this;
        var height='';
        wx.getSystemInfo({
            success:function(res){
              height= res;
            }
        });
        return height;
    }

    //获取用户信息
    function GetUserInfo(){
        var userinfo='';
        getUserInfo().then(res=>{
            // success
            userinfo=res.userInfo;
        }).catch(res=>{
            console.log(res);
        })
        return userinfo;
    }

    /** 
	 * 预览图片
	 */
	function PreviewImage (e) {  
		var current=e.target.dataset.src;
		wx.previewImage({
		  	current: current, // 当前显示图片的http链接
		  	urls: this.data.imgUrl // 需要预览的图片http链接列表
		})
    }
    
    //初始化金额
    function InitMoney(money){
        var money=money;
        var usermoney='';
        var index=money.lastIndexOf('.');
        if(money%1===0){     //整数
            if(money.length<2){   //1-10
                money=money.charAt(money.length-1);
            }else{               //10以上的数
                usermoney=money;
            }
        }else{                 //小数
            usermoney=money.split('.')[0];           //截取小数点之前的数
            var lengths=money.length-(index+1);
            if(lengths>1){         //一位以上的小数
                money=money.charAt(money.length-1);
            }else{
                money=money.substring(index+1,money.length);
            }
        }
        return {money,usermoney}
    }

    //加密解密
    function Encrypt(type,values){
        if(type===0){           //加密
            var encrypt_rsa = new RSA.RSAKey();             //new一个RSA对象
            encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);            //设置公钥
            var encStr = encrypt_rsa.encrypt(values);               //传入加密字符串
            encStr = RSA.hex2b64(encStr);                           //进行加密
            return encStr;
        }else if(type===1){              //解密
            var decrypt_rsa = new RSA.RSAKey();
            decrypt_rsa = RSA.KEYUTIL.getKey(privateKey);
            var decrypt = RSA.b64tohex(values)
            var decStr = decrypt_rsa.decrypt(decrypt);
            return decStr;
        }
    }

    //根据appid跳转不同的小程序
    function JumpProgram(appId){
        var result='';
        navigateToMiniProgram({
            appId: appId,
            path: '',
        }).then(res=>{
            console.log(res);
            result= res;
        }).catch(err=>{
            console.log(err);
            result= err;
        });
        return result;
    }

    //将模块方法暴露出去
    module.exports = {
        GetSysTeminfo,
        PreviewImage,
        InitMoney,
        GetUserInfo,
        Encrypt,
        JumpProgram,
        imgUrls,
        hotgames,
        markets
    }