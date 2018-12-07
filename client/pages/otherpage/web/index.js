const app=getApp();
Page({
    data: {
        url:'',
    },
      //加载界面运行
    onLoad: function (options) {
        this.setData({
            url:app.otherPageUrl
        });
        // wx.minProgram.navigateTo({url:'/pages/welfare/welfare'});
        // wx.miniProgram.postMessage({ data: 'foo' })
        // wx.miniProgram.postMessage({ data: {foo: 'bar'} })
        // wx.miniProgram.getEnv(function(res) { console.log(res.miniprogram)})
        
        // 页面渲染后 执行
        var page = this;
        console.log(options);
        var url = options.url;
        url = decodeURIComponent(url);
        // 页面初始化 options为页面
        var newUrl = "https://www.yugi.com";
        if (url.indexOf('http://yugi.com')>-1){
            url = url.replace('http://yugi.com', newUrl);
        } else if (url.indexOf('http://www.yugi.com')>-1) {
            url = url.replace('http://www.yugi.com', newUrl);
        }
        //isPassArea=1&xcx=1
        if (url.indexOf('isPassArea')<0) {
            url = url +'&isPassArea=1';// 二级域名不过滤
        }
        if (url.indexOf('xcx') < 0) {
            url = url + '&xcx=1';// 小程序标识，如果有需要特殊处理，可以用此判断
        }
        if (url.indexOf('flag=1') < 0) {
            url = url.replace('flag=1','flag=2');
        }
        if (url.indexOf('flag') < 0) {
            url = url + '&flag=2';// 取消一键下载
        }
        // 页面初始化 options为页面跳转所带来的参数
        // this.setData({
        //     url: url
        // })

        // setTimeout(function(){
        //     wx.navigateBack({
        //         delta:1
        //     });
        // },3000);
    },

    //分享
    onShareAppMessage:function (options) {
        var url = this.data.url;
        url = encodeURIComponent(url);
        url = '/pages/otherpage/web/index?url=' + url;
        return {
            title: 'title',
            desc: '',
            path: url
        }
    }
});