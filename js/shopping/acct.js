var app = new Vue({
	el: "#appDetail",
	data: {
        /***** url *****/
        baseurl: config.domain,
        infoTitle:"账单详情",
        title:"消费金额", 
        moneyNumber:"0.00",
        textItemlist:["账单说明","消费时间","分期类型","总费用","已退款","货款账号"],
        textpay:"借款借据",
        textrecord:"还款记录",
        Data:{},
        periodList:[],
        billDate:[],
        isloading:true,
       /***** 弹窗(公用) *****/
       popWindowData: { //弹出框数据
          title: "消息提示",
          msg: "<p style='text-align:center;line-height:50px;'>网络异常,请稍后再试...</p>",
           closeBtn: "知道啦~"
       },
      flagPop: false, //弹出框初始化显示
     
      repayAllFlag:false,
        //分期备注文案
        remark:"",
        //分期账单列表筛选
        periodArr:[]
  },
  /***** 注册弹窗(公用)组件 *****/ 
  components: {
    "compmodal": compModal
  },
  methods:{ 
      /***** 弹窗(公用) *****/
      showpopwindow: function() {
      this.flagPop = true;
      },
      closeWin: function() {
        this.flagPop = false;
     },
      repayAllBox: function(){
        this.repayAllFlag = true;
     },
    /***** 判断状态 *****/
    choicebillState: function (obillState) {
              if(obillState == 3){
                  return "NEXT";//未出
              }else if(obillState == 1){
                  return "CURRENT";//当前
              }else if(obillState == 2){
                  return "HISTORY";//历史逾期
                }else{
                  return "";
              }
    },
    /***** 立即还款 *****/
    quickrepay: function() {
      config.repaybtn(this.baseurl+config.urls.repay.goRepay,{
          "billType": "shopping",//业务类型
          "productType": "",//产品类型
          "settleType": "01",//结清方式
          "billFlag":  "CURRENT",//操作标识
          "loanacNo": "",//贷款单号
          "ramt":this.Data?this.Data.repayAmt:""//当期还款金额
      });
      
    },
    /***** 清偿全部 *****/
    quickrepayAll: function () {
      config.repaybtn(this.baseurl+config.urls.repay.goRepay,{
          "billType": "shopping",//业务类型
          "productType": "",//产品类型
          "settleType": "02",//结清方式
          "billFlag": config.querys().billflag,//操作标识
          "loanacNo": this.Data?this.Data.no:"",//贷款单号
          "ramt":this.Data?this.Data.clearAmt:"",//清偿总金额
          "saheadfoul":this.Data?this.Data.clearFee:""//清偿费
      });
      this.repayAllFlag = true;
    }
  },
  mounted:function(){
    var dataParams = {
      token: (config.querys().token ? encodeURIComponent(config.querys().token) : ""),
      channel: (config.querys().channel ? encodeURIComponent(config.querys().channel) : ""),
      no: config.querys().no || '',
        billflag: config.querys().billflag || '',
        random: Math.random()
    };        
    var that = this;
    this.$http.get(config.domain + config.urls.bill.shopping.detail, {params: dataParams})
      .then(function(response) {  
      	var jsonObj = JSON.parse(response.bodyText);             
        if (jsonObj.code=="0000" && jsonObj.data) {
      	  var dat = jsonObj.data;
          this.Data = dat; 
          this.moneyNumber = dat.amt?dat.amt:"0.00";           
          this.periodList =  dat.periodList ? dat.periodList : [];
          //筛选哪些是分期 periodArr存起来
            if (dat.periodList && dat.periodList.length > 0) {
                for (var i = 0; i < dat.periodList.length; i++) {
                    if(dat.periodList[i].isPeriod === "1"){
                        that.periodArr.push(dat.periodList[i].index);
                    }
                }
            }
            //显示备注
            if(that.periodArr && that.periodArr.length > 0){
                var i =that.periodArr.length-1;
                that.remark = "备注："+that.periodArr[0]+"期～"+that.periodArr[i]+"期为账单分期";
            }
        }else{
           that.flagPop = true;
           that.popWindowData.msg ='<p style="text-align:center;line-height:50px;">'+(jsonObj.msg || "数据异常，请稍后再试...")+'</p>';
        }
        that.isloading = false;
      }, function(err) {
        // 当请求不到后端数据,则会弹窗提示网络异常
          that.flagPop = true;
          that.isloading = false;
      })
    }
});