const app = getApp()
Component({
  properties: {
    rollnum:{
        type: Object,
        value:5,
    },
  },
  data: {
    rollnum:0,
    len:'',
    animation:[],
  },
  onload:function(){
    this.show_num();
  },
  show_num:function(){
    var that=this;
    var n=that.properties.rollnum.value;
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
          duration:1500
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
  methods: {
    
  }

})