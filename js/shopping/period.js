var app = new Vue({
	el: "#app",
	data: {
		baseurl: config.domain,
		periodAmt:0,          /**初始化弹窗金额**/
		periodNum:0,         /**初始化订单数量**/
		periodList:false,   /**初始化列表状态**/
		itemList:[],       /**初始化列表**/
		rulerDescri:false,/**初始化账单说明弹框状态**/
		repayList:[],
		showsContent:[{/**初始化分期列表**/
			isActive:false
		},{
			isActive:false
		},{
			isActive:false
		}],		
		isloading:true,    /***** 解决vue花括号提前加载 *****/ 
		flagPop: false,   /***** 弹出框初始化显示 控制*****/
		popWindowData: { /***** 弹出框数据*****/
			title: "消息提示",
			msg: "<p style='text-align:center;line-height:50px;'>网络异常,请稍后再试...</p>",
            closeBtn: "知道啦~"
		},
		passwordType:"",       //密码类型 
		orderNo:"",		      //贷款单号
		termsNo:"",          //分期期次
		hasPayPwd:"",       //是否设置过密码
		setPwdFlag:false,  //设置密码弹层
		channel:""	,	  //渠道
		pwdUrl:""  ,     //设置密码的地址
		comeSdk:"" ,    //控制设置密码的地址
		forgetUrl:"" ,  //控制忘记密码的地址
		yfbJnUrl:"" ,//苏宁金融js
		minSingle:"",//单笔最小金额
		minState:"",//单笔分期金额
		activeCircle:false,//是否选中协议 20180412新增
		bottomProData : {  //底层协议 20180412新增
			//是否可见
			bottomPopFlag: false, //字段名不能换
			//自定义样式
			selfClass:"protocol-popwindow" //字段名不能换
			//自定义标题
			//title:"随便写写"
		},
		ProWindowData:{  //协议窗口
			title: "",
			msg: "",
			closeBtn: "",
		    borrowProtocol:true,//borrow-Protocol
		},
		proMidFlag:false,
		description1:"",
		description2:"",
		description3:"",
		resultData:[],
		sceneParams:"",
		protocolTitle:"",
		protocolText:"",
		version:"",
		dataObj:""
	},
	components: {
		'bottompop':bottompop,
		"compmodal": compModal
	},
	methods:{
    	/*****实时获取可分期列表弹框*****/
        popWindow: function () {
			this.periodList = true; 
        },
        rulerWindow:function () {
        	this.rulerDescri = true; 
        },   
        /*****公用弹窗控制*****/
        showpopwindow: function () {
		  this.flagPop = true;
		},
		closeWin: function() {
		  this.flagPop = false;
		},
        periodShow:function(idex,id){        
        	this.showsContent[idex].isActive = !this.showsContent[idex].isActive ;
        	for (var i in this.showsContent ){
        		if (i != idex){
        			this.showsContent[i].isActive = false;
        		}     	       
       		 }
        	this.termsNo = id;        	
        },    	
         /*****20180412新增*****/
        openProtocol:function( ){
        	if(!this.activeCircle){
        		this.bottomProData.bottomPopFlag = true;
        	}else{
        		this.activeCircle = false;
        	}
        },
        closePro:function( ){
        	this.bottomProData.bottomPopFlag = false;
        },
        agreeProtocol:function( ){
        	this.bottomProData.bottomPopFlag = false;
			this.activeCircle = true;
        },
        //打开协议中间弹层
        openProWin:function(idx,proVersion,proTitle){
        	this.proMidFlag = true;
        	var that = this;
        	that.version = proVersion;
        	that.protocolTitle = proTitle;
        	var dataParams = {
				protocolTitle:that.protocolTitle  || "", // 标题
				version:that.version || "", //版本号
				billCalc:that.dataObj || {},
				random:Math.random()
			};		
        	this.$http.get(config.domain + config.urls.bill.shopping.protocal, {params:dataParams}).then(function(response){	
				var proObj = JSON.parse(response.bodyText);
				if (proObj.code=="0000" && proObj.data){					
					that.protocolTitle = proObj.data.protocolTitle || "";	
					that.protocolText =  proObj.data.protocolText || "";
					that.ProWindowData.title = that.protocolTitle
					that.ProWindowData.msg = that.protocolText;
					that.ProWindowData.closeBtn = "关闭";
					
				} else{
					that.ProWindowData.title = "";
					that.ProWindowData.borrowProtocol = false;
					that.ProWindowData.msg = proObj.msg || "数据异常，请稍后再试...";
				}
			},
			function (err) {
				that.ProWindowData.closeBtn = "";
				this.proMidFlag = false;
			    console.log(err) 
	              // 当请求不到后端数据,则会弹窗提示网络异常
	            that.flagPop = true;	           
        	})	
			
        },
        //关闭协议中间弹层
        closeProDetail:function( ){
        	this.proMidFlag = false;
        }
     
//      installAction:function(){
//      	if(this.showsContent[0].isActive||this.showsContent[1].isActive||this.showsContent[2].isActive){
//					bill_fenqi.init();
//				}
//      }
	},
	mounted:function () {
		var that = this;
		var dataParams = {
			token: (config.querys().token ? encodeURIComponent(config.querys().token) : ""),
			channelType: (config.querys().channelType ? encodeURIComponent(config.querys().channelType) : ""),
			random:Math.random()
		};		
		this.$http.get(config.domain + config.urls.bill.shopping.installmentInit, {params:dataParams}).then(function(response) {
		    that.isloading = false;
			var jsonObj = JSON.parse(response.bodyText);
			that.dataObj = jsonObj.data;
			if (jsonObj.code=="0000" && jsonObj.data && jsonObj.queryProtocolTitles){					
				var dat = jsonObj.data;
				var ProtocolData = jsonObj.queryProtocolTitles;
				that.description1 = ProtocolData.description1 || "";
				that.description2 = ProtocolData.description2 || "";
				that.description3 = ProtocolData.description3 || "";
				that.resultData = ProtocolData.resultData || [];
				that.sceneParams = ProtocolData.sceneParams || "" ;
				that.periodAmt = dat.amt; 
				that.periodNum = dat.accts?dat.accts.length:0; 
				that.itemList = dat.accts || [];
				that.repayList = dat.repayInfos || [];
				that.passwordType = dat.passwordType || "";
				var orderArray = [];
				for(i=0,len=that.itemList.length;i<len;i++){					
					orderArray.push(that.itemList[i].no||"")	
				}
				that.orderNo = orderArray.join(",");
				that.hasPayPwd = dat.hasPayPwd || "";
				that.channel = dat.channelType || "";
				that.pwdUrl = dat.setPwdUrl || "";
				that.comeSdk = dat.yfbComeFromSDK || "";
				that.forgetUrl = dat.forgetPwd || "";
				that.yfbJnUrl = dat.yfbJnUrl ||"";//苏宁金融js
				that.minSingle = dat.minSingleStageAmt ||"";//单笔最小金额
				that.minState = dat.minStageAmt || "";//单笔分期金额
				if (that.yfbJnUrl) {
					if(that.yfbJnUrl.charAt(that.yfbJnUrl.length-1)=="/"){
						_loadAsyncJs(that.yfbJnUrl+'eppClientApp/html/js/Jsnjr.js')
					}else{
						_loadAsyncJs(that.yfbJnUrl+'/eppClientApp/html/js/Jsnjr.js')						
					}					
				}
			}  else{
                that.flagPop = true;
                that.isloading = false;
                that.popWindowData.msg = '<p style="text-align:center;line-height:50px;">' + (jsonObj.msg || "数据异常，请稍后再试...") + '</p>';
            }
		}, 
		function (err) {
            console.log(err) 
              // 当请求不到后端数据,则会弹窗提示网络异常
            that.flagPop = true;
            that.isloading = false;
        });
        
        /*
		 * 分期按钮响应事件：弹出支付密码框
		 */
		$("#install").click(function() {
			if ((that.showsContent[0].isActive || that.showsContent[1].isActive || that.showsContent[2].isActive) && that.activeCircle) {
				if (that.hasPayPwd == "true") {
					_alertPwd();	
				} else {
					//that.setPwdFlag = true;
					Exp.noPwdInput({
			           	confirmCallback: function() {},
			           	setPassword: function() {
				           	if (that.channel == "010101") {				           	 	
				           	 	// 如果是易购app或者融合钱宝进入该h5的则直接跳转，否则调用原生JS去设置支付密码
				           	 	if (that.comeSdk && that.comeSdk == 'SNEBUY-APP') {
				           	 		window.location = that.pwdUrl+'/retrievePayPwd/init.htm?source=7&loginTheme=wap&backUrl='+that.baseurl + '/account/html/shopping/installment.html';
				           	 	} else if (that.comeSdk && that.comeSdk == 'EBuy-SNYifubao') {
				           	 		window.location = that.pwdUrl+'/retrievePayPwd/init.htm?source=6&loginTheme=wap&backUrl='+that.baseurl + '/account/html/shopping/installment.html';
				           	 	} else {          	 	
				           	 		//引入设置密码的js
				           	 		//$.getScript(that.yfbJnUrl+'/eppClientApp/html/js/Jsnjr.js');
				           	 		//调用js中的方法页面会跳出弹框设置页面
				           	 		SNNativeClient.callResetPayPwd({
					                     type:"0",//0设置支付密码 1重置支付密码 2取消
					                     cbFunc:"goCallBackFuntion"//回调方法名
	                    			});
				           	 	}
				           	} else if (that.channel == "050101") {
                                window.location = decodeURIComponent(that.pwdUrl + "&businessType=040814&billServerFlag=1");
                            } else { // 其它（H5等）
                                window.location = decodeURIComponent(that.pwdUrl);
                            }
			            }
	  				});
				}
			}
		});
	}
});
			
/**
 * 密码框内部操作相关事件
 */
var _alertPwd = function() {
	var that = app.$data, 
		keyboardType, // tel text
		pwdtype; // easy complex
	if (that && that.passwordType == "1") {
		keyboardType = "tel"
		pwdtype = "easy"					
	} else if (that && that.passwordType == "2") {
		keyboardType = "text"
		pwdtype = "complex"
	} else {
		// TODO 异常情况	
	}
		
	var pwdWithKeyboard = Exp.pwdWithKeyboard({
		type: keyboardType, // 数字键盘还是文本键盘
		pwdtype: pwdtype,
		background: true,
		callback: function(value) {
			var self = this;
			/*
			 * 点击忘记密码跳转到其它页面
			 */ 
	        Exp.click($('.alert-page-keyboard').find('.pwd-lost-forget'), function() {
	        	// 易付宝门户、微信门户
	        	if (that.channel == "010101") {
	        		var url = "";
	        		if (window.location.host == "wx.sncfc.com.cn") {
						url = that.forgetUrl + "?source=4&backUrl=" + that.baseurl + "/account/html/shopping/installment.html";
					} else {
						url = decodeURIComponent(that.forgetUrl);
					}
	           	 	window.location = url;
	            } else if (that.channel == "050101") {
                    window.location = decodeURIComponent(that.forgetUrl+"&billServerFlag=1");
                } else {
	        		Exp.showAlert("为了您的账户安全，请下载任性付APP并找回支付密码！");
	        	}
	        });
	        
	        /*
	         * 点击键盘上的确认按钮跳转到其它页面或者提示用户密码输入的异常情况
	         */ 
			Exp.click($('.alert-page-keyboard').find('.confirm'), function() {
				if ($(this).attr('data-clickforbidden')) {
					return false;
				} else {						
					var passwordEncode = pwdWithKeyboard.val();
	           		// 输入密码后的操作		           		
	           		if (pwdWithKeyboard.val() != "") {
	           			that.isloading = true;
	           			var dataParams = {
							term: that.termsNo || "", // 期次
							tempLoans: that.orderNo || "", //贷款单号
							pwd: rsaUtil.encrypt(passwordEncode), //密码
							pwdType: that.passwordType || "", //密码类型
							sceneParams:that.sceneParams || "", //场景参数
							token: (config.querys().token ? encodeURIComponent(config.querys().token) : ""),
							channelType: (config.querys().channelType ? encodeURIComponent(config.querys().channelType) : ""),
							random: Math.random()
						};
						
						// 密码框确定按钮提交后台
						app.$http.get(config.domain + config.urls.bill.shopping.installment, {params:dataParams}).then(function(response) {
							that.isloading = false;
							var jsonData = JSON.parse(response.bodyText);
							var msg = encodeURIComponent(jsonData.msg || "操作失败，请稍后重试~");
							var msgForget = jsonData.msg || "操作失败，请稍后重试~";
							if (jsonData.code == "0000") {
								window.location = that.baseurl + "/account/html/common/success.html?msg=" + msg;
							} else if (jsonData.code=="9216" || jsonData.code=="9236" || jsonData.code=="7404" || jsonData.code=="7405") {
								Exp.showAlert(msgForget);
								pwdWithKeyboard.val("");
							} else {
                                var yearmonth = jsonData.data || "";
								window.location.href = that.baseurl + "/account/html/common/error.html?msg=" + msg + "&yearmonth=" + yearmonth;
							}
						},
						function (err) {
							Exp.showAlert("网络异常，请稍后再试...");
				        })	
	           		}
	         	}											           										
			});
			// 关闭键盘
			Exp.click($('.alert-page-keyboard').find('.close'), function() {
				pwdWithKeyboard.slideOut();
				return false;
			});
		},
		/**
		 * 获取密码框密码
		 * @param {Object} value 
		 */
		input: function(value) {
			if (pwdtype == 'easy') {
				var inputs = $('.alert-page-keyboard').find('.pwd-box .pwd-char-box'),
				inputs2 = [];
				inputs.forEach(function(e) {
					inputs2.push($(e));
				});
				if (value.length > 6) {
					value = this.delete();
				}
				inputs2.forEach(function(e, i) {
					e.empty();
					if (value.charAt(i)) {
						e.append('<div class="spot"></div>');
					} else {
						e.append('<div class="blank"></div>');
					}
				});
			} else {
				var inputs = $('.alert-page-keyboard').find('.pwd-input');
				inputs.val(value);
			}
			handleInputCallback(value, pwdtype);
		}
	}).slideIn();
		
	function handleInputCallback(value, pwdtype) {
		var confirmBtn = $('.alert-page-keyboard').find('.confirm');
		if (pwdtype == "easy") {
			if (value && value.length == 6) {
				confirmBtn.removeClass('invalide').removeAttr('data-clickforbidden');
			} else {
				confirmBtn.addClass('invalide').attr('data-clickforbidden', true);
			}
		} else {
			if (value && value.length > 0) {
				confirmBtn.removeClass('invalide').removeAttr('data-clickforbidden');
			} else {
				confirmBtn.addClass('invalide').attr('data-clickforbidden', true);
			}
		}	
	}
};

/**
 * 需要执行的回调函数方法
 */
function goCallBackFuntion(data) {
	var dataJson;
	try {
		dataJson = JSON.parse(data);
	} catch(e) {
		Exp.showAlert("系统异常!");
		return false;
	}
	if (dataJson.result == "0") { // 成功
		Exp.showAlert("支付密码设置成功.");
		window.location = config.domain + "/account/html/shopping/installment.html";
	} else if(dataJson.result == "1") { // 失败,不做操作因为已经在当前页面
		console.log(dataJson.result);
	} else if(dataJson.result == "2") { // 取消,不做操作因为已经在当前页面
		console.log(dataJson.result);
	} else {
		Exp.showAlert("系统异常!");
	}
}

/**
 * 需要执行的回调函数方法
 */
function _loadAsyncJs(src) {
	var _src = src;
	var _scripts = document.getElementsByTagName('script');
	for (var i = 0; i < _scripts.length; i++) {
		if (_scripts[i].src == _src) {
			return;
		}
	}
	var _script = document.createElement('script');
	_script.type = 'text/javascript';
	_script.async = true;
	_script.src = _src;
	var _s = _scripts[0];
	_s.parentNode.insertBefore(_script, _s);
}
