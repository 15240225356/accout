var app = new Vue({
	el: "#app",
    data: {
        /***** url *****/
        baseurl: config.domain,

		isloading: true,
		/***** 弹窗(公用) *****/
		popWindowData: { //弹出框数据
			title: "消息提示",
			msg: "<p style='text-align:center;line-height:200px;'>网络异常,请稍后再试...</p>",
            closeBtn: "知道啦~"
		},
		flagPop: false, //弹出框初始化显示

		/***** 业务数据 *****/
		amt: "",
		list: [], //按年分组

		/***** 滑动加载控制 *****/
		loading: true, // 是否正在加载
		loadOver: false, // 是否所有数据加载完成

        noDataFlag: false
    },
	components: {
		compmodal: compModal
	},
    methods: {
		/***** 弹窗(公用) *****/
		closeWin: function() {
		  this.flagPop = false;
		},
		/***** 分页 *****/
		loadMore: function() {
			this.loading = true; // 分页开始查询
			// 参数获取
			var dataParams = {
				token: (config.querys().token ? encodeURIComponent(config.querys().token) : ""),
				channelType: (config.querys().channelType ? encodeURIComponent(config.querys().channelType) : ""),
                random: Math.random()
			};
			var that = this;
			this.$http.get(config.domain + config.urls.bill.shopping.overduebills, {params: dataParams}).then(
				function(response) {
					if (that.loadOver) {
						return;
					}
					that.loadOver = true; // 阻止页面2次加载，服务器一次返回所有数据

                    var jsonObj = JSON.parse(response.bodyText);
					if (jsonObj.code=="0000" && jsonObj.data) {
						var dat = jsonObj.data;

						that.billDate = dat.billDate || "";
						that.amt = dat.amt || "";

						if (dat.list && dat.list.length > 0) {
							for (var i = 0; i < dat.list.length; i++) {
								that.list.push(dat.list[i]);
							}
						} else {
							that.loadOver = true; // 没有更多的数据了
						}
					} else {
						that.flagPop = true; // 网络异常弹窗
                        that.popWindowData.msg ='<p style="text-align:center;line-height:50px;">'+(jsonObj.msg || "数据异常，请稍后再试...")+'</p>';
					}
					that.loading = false; // 分页结束查询
					that.isloading = false; // 整个页面的加载

                    that.noDataCompute();
				},
				function(err) {
					that.flagPop = true; // 网络异常弹窗
					that.loading = false; // 分页结束查询
					that.isloading = false; // 整个页面的加载
				}
			);
		},
        /***** 立即还款 *****/
        quickrepay: function () {
            config.repaybtn(this.baseurl+config.urls.repay.goRepay,{
                "billType": "shopping",//业务类型
                "productType": "",//产品类型
                "settleType": "01",//结清方式
                "billFlag": "HISTORY",//操作标识
                "loanacNo": "",//贷款单号
                "ramt": this.amt || "" //还款金额
            });
        },
        /***** 无数据显示控制 *****/
        noDataCompute: function() {
            this.noDataFlag = !this.list || this.list.length < 1;
        }
    }
});