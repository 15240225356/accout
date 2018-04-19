var app = new Vue({
	el: "#app",
	data: {

		/***** url *****/
		baseurl: config.domain,

        /***** title控制 *****/
        ind: 0,
        footer_ind:2,
		special: true,
		/***** 逾期历史控制 *****/
		historyData: "0.00",
		/***** 还款金额展示控制 *****/
		currentdata: {},
		/***** 下期、历史、退款展示控制 *****/
		nextData:{},
		
		/***** 逾期弹窗 *****/
		hisOverdueFlag: false, // 历史逾期
		months: [],
		months_string:"",
		curOverdueFlag: false, // 本期逾期
//		realOverdueFlag:false, // 本期逾期是否超过3天
		/***** 弹窗(公用) *****/
		popWindowData: { //弹出框数据
			title: "消息提示",
			msg: "<p style='text-align:center;line-height:50px;'>网络异常,请稍后再试...</p>",
            closeBtn: "知道啦~"
		},
		flagPop: false, //弹出框初始化显示

		/***** 当请求到后端数据的状态码异常显示弹窗(公用) *****/
		popMessage: "",
		index: 1,

        /***** 底部footer *****/
        footList: [
           	{txt: "首页", path: "#"},
            {txt: "借款", path: "#"},
            {txt: "账单", path: "#"},
            {txt: "发现", path: "#"},
            {txt: "我的", path: "#"}
        ],
        menuBar: true,

		/***** 解决vue花括号提前加载 *****/ 
		isloading:true,
		/***** 还款链接的开关 *****/
		huanFlag:true,
        /***** 我要分期 *****/
        installment: {
            "msgCode": "hello,boy!",
            "hasBtn": 0
        },
		overDueXJ: "" //若当前逾期 不能跳转还款 zxl
	},
	components: {
		"compmodal": compModal
	},
	methods: {
		/***** 标题提交的样式方法 *****/
		changeClass: function(index) {
		   this.ind = index;
		},
		/***** 当存在历史预期和本期逾期，点击立即还款出现弹框*****/
		showpop:function(){
			this.hisOverdueFlag = Boolean(Number(this.historyData));
		},
		/***** 弹窗(公用) *****/
		showpopwindow: function() {
		  this.flagPop = true;
		},
		closeWin: function() {
		  this.flagPop = false;
		},
		/***** 底部标题提交的样式方法 *****/
		changeClassed: function(index) {
		   this.footer_ind = index;
		    if(sessionStorage.getItem('key')){
                sessionStorage.clear();  
            }
		},
        /***** 本期逾期立即还款 *****/
        quickrepay: function () {
			if(this.overDueXJ == "1"){
                this.flagPop = true;
				this.popWindowData = {title: "消息提示", msg: '<p style="text-align:center;line-height:50px;">您当前有逾期，结清后就可进行还款。</p>',closeBtn: "知道啦~"};
			}else{
				config.repaybtn(this.baseurl + config.urls.repay.goRepay, {
					"billType": "shopping",//业务类型            
					"settleType": "01",//结清方式
					"billFlag": "CURRENT",//操作标识  
					"ramt": this.currentdata.repayAmt || "" //还款金额
				});
			}
        },
        /***** 历史逾期立即还款 *****/
        hisquickrepay: function () {
            config.repaybtn(this.baseurl + config.urls.repay.goRepay, {
                "billType": "shopping",//业务类型              
                "settleType": "01",//结清方式
                "billFlag": "HISTORY",//操作标识             
                "ramt": this.historyData || "" //还款金额
            });
        },
        /***** 封装我要分期弹出框  zxl *****/
        periodAlert : function (msg) {
        	if (this.installment.msgCode != "0006") {
        		var that = this;
        		//3秒自动关闭
                this.popWindowData = {msg: msg,smallAlert:true};
                this.flagPop = true;
                setTimeout(function () {
                    that.flagPop = false;
                }, 3000);
			} else {
        		//状态为 6 7 手工关闭
                this.popWindowData = {title: "消息提示", msg: msg,closeBtn: "知道啦~"};
                this.flagPop = true;
			}
        },
        /***** 我要分期 zxl *****/
        periodBtn: function () {
        	if (this.installment.msgCode == "0000") {
        		//根据返回码，给出相应的提示
                /*switch(this.installment.msgCode){
                	//this.periodAlert 封装分期弹出框
                    case "code001": this.periodAlert("本期账单已分期，每月只能进行一次账单分期");break;
                    case "code002": this.periodAlert("目前无法分期，请在每月1号到13号进行账单分期");break;
                    case "code003": this.periodAlert("您当前有逾期，结清后就可进行账单分期");break;
                    case "code004": this.periodAlert("本期账单不存在，不能分期");break;
                    case "code005": this.periodAlert("存在异常账单，请重新选择！");break;
                    case "code006": this.periodAlert("当期账单不满足分期条件，1、须为购物不分期贷款；2、单笔贷款剩余本金大于20（含）元；3、分期总额须大于600（含）元；");break;
                    case "code007": this.periodAlert("当期账单不满足分期条件，1、须为购物不分期贷款；2、单笔贷款剩余本金大于20（含）元；3、分期总额须大于600（含）元；");break;
					default:this.periodAlert(this.installment.msg);
                }*/
                //如果校验通过，跳转到分期页面
                window.location.href = this.baseurl + '/account/html/shopping/installment.html';
			}else{
                this.periodAlert(this.installment.msg || "数据异常，请稍后再试...");
			}
        }
	},
	mounted: function() {
		var dataParams = {
			token: (config.querys().token ? encodeURIComponent(config.querys().token) : ""),
			channelType: (config.querys().channelType ? encodeURIComponent(config.querys().channelType) : ""),
			random: Math.random()
		};
        
		var that = this;
		var iniMenubar = function(footList, urlObj) {
        	if (urlObj && urlObj.menbarShopping) { //首页
				footList[0].path = urlObj.menbarShopping;
				localStorage.setItem("url_menbarShopping", urlObj.menbarShopping); 
			} else {
				footList[0].path = localStorage.getItem("url_menbarShopping");
			}
			
			if (urlObj && urlObj.menbarDarw) { //借款
				footList[1].path = urlObj.menbarDarw;
				localStorage.setItem("url_menbarDarw", urlObj.menbarDarw); 
			} else {
				footList[1].path = localStorage.getItem("url_menbarDarw");
			}
			
			if (urlObj && urlObj.menbarBill) { //账单
				footList[2].path = urlObj.menbarBill;
				localStorage.setItem("url_menbarBill", urlObj.menbarBill); 
			} else {
				footList[2].path = localStorage.getItem("url_menbarBill");
			}
			
			if (urlObj && urlObj.menbarFind) { //发现
				footList[3].path = urlObj.menbarFind;
				localStorage.setItem("url_menbarFind", urlObj.menbarFind); 
			} else {
				footList[3].path = localStorage.getItem("url_menbarFind");
			}
			
			if (urlObj && urlObj.menbarMine) { //我的
				footList[4].path = urlObj.menbarMine;
				localStorage.setItem("url_menbarMine", urlObj.menbarMine); 
			} else {
				footList[4].path = localStorage.getItem("url_menbarMine");
			}
        };
		this.$http.get(config.domain + config.urls.bill.shopping.index, {params: dataParams})
		.then(function(response) {
			that.isloading = false;
			var jsonObj = JSON.parse(response.bodyText);
			iniMenubar(that.footList, jsonObj.data); // 初始化菜单地址
             
			if (jsonObj.code=="0000" && jsonObj.data) {
				var dat = jsonObj.data;
				that.special = dat.hasSpecial; 
                that.menuBar = dat.hasMenuBar;      
				that.historyData = dat.historical ? dat.historical.totalAmt : "0.00";
				that.currentdata = dat.current || {};
				that.huanFlag = that.currentdata?that.currentdata.repayed:true;
				that.nextData = dat.next || {};
                that.installment = dat.installment || {};
				that.overDueXJ = dat.overDueXJ || "";

                    // 弹窗数据
                    that.months = dat.historical ? dat.historical.months : [];
                    // 找出重复项以及下标的公用函数
                    Array.prototype.removeRepeatItem = function () {
					        var arr1 = [];
					        var repeatItem  = [];
					        for (var i = 0; i < this.length; i++) {
					            var item = this[i];
					            if (arr1.indexOf(item) == -1) {
					                arr1.push(item);
					                
					            }else{
					            	repeatItem.push({"repeat":item,"index":i})
					            }
					        }
					        return repeatItem					       
					 }
                    if(that.months){
						 // 当大于等于3个月
	                    if(that.months.length>=3){
	                    	var months_new = that.months.slice(0,3);
	                    	var months_years = [];
	                    	var months_day = [];
	                    	for(j = 0,len=months_new.length; j < len; j++) {							
	 							months_years.push(months_new[j].substr(0,5))	
	 							months_day.push(months_new[j].substr(5,3)) 									
							}
						    var repeatItem = months_years.removeRepeatItem()
	   					   if(repeatItem.length>=2&&repeatItem != ""){
	   					   		that.months_string = months_years[0]+months_day.join('、');
	   					   }else if(repeatItem.length = 1&&repeatItem != ""){
	   					   		var i = repeatItem[0].index  					   		
	   					   		months_new[i-1] = months_new[i-1] +"、" +months_day[i]
	   					   		months_new.splice(i,1)
	   					   		that.months_string =months_new.join('、')
	   					   }else{
	   					   	   that.months_string =months_new.join('、')
	
	   					   }	
	                    }
	                    // 当等于2个月
	                    if(that.months.length == 2){
	                    	if(that.months[0].substr(0,4)==that.months[1].substr(0,4)){
	                    		that.months_string = that.months[0]+"、"+that.months[1].substr(5,3);
	                    	}else{
	                    		that.months_string = that.months.join('、')
	                    	}
	                    }
	                     // 当等于1个月时
	                    if(that.months.length == 1){
	                    	that.months_string = that.months.join('、')
	                    }
	                    //弹窗的月份用顿号分开
	                    // that.months_string = that.months != null ? that.months.join('、') : "";
                    }
                    //弹窗次数的控制
					if(!sessionStorage.getItem('key')){
                    	that.hisOverdueFlag = Boolean(Number(that.historyData));
                    	that.curOverdueFlag = (!that.hisOverdueFlag) && (that.currentdata.overdue);
                 		// that.curOverdueFlag = (!that.hisOverdueFlag) && (that.currentdata.overdue)&& (!that.currentdata.realOverdue); // 历史逾期弹窗优先展示，在历史不逾期的情况下，再展示本期逾期弹窗
               		    // that.realOverdueFlag =  (!that.hisOverdueFlag)&& (that.currentdata.overdue)&& (that.currentdata.realOverdue)
                  		sessionStorage.setItem('key', 'value');
                  	 }   
                 
                } else {
                    that.flagPop = true;
                    that.isloading = false;
                	that.popWindowData = {title: "消息提示",closeBtn: "知道啦~"};
                    that.popWindowData.msg = '<p style="text-align:center;line-height:50px;">' + (jsonObj.msg || "数据异常，请稍后再试...") + '</p>';
                }
            }, function (err) {
                // 当请求不到后端数据,则会弹窗提示网络异常
                that.flagPop = true;
                that.isloading = false;
                iniMenubar(that.footList, null); // 初始化菜单地址
            })
    }
});