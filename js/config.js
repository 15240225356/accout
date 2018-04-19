var config = {
    domain: window.location.protocol + "//" + window.location.host + "/sncfc-cpf",
    urls: {
        bill: {
            shopping: { // 购物
                index: "/wap/billServer/shoppingMgt/shoppingIndex.do", // 账单首页
                historybills: "/wap/billServer/shoppingMgt/historyList.do", // 历史账单列表
                overduebills: "/wap/billServer/shoppingMgt/historyListOverdue.do", // 逾期账单列表
                list: "/wap/billServer/shoppingMgt/billInfo.do", // 每期账单
                refundrecord: "/wap/billServer/shoppingMgt/refundList.do", //退款记录列表
                detail: "/wap/billServer/shoppingMgt/acctInfo.do", // 订单详情
                installmentInit: "/wap/billServer/shoppingMgt/billStageCaclIndex.do", // 分期页面初始化
                installment: "/wap/billServer/shoppingMgt/toPeriodization.do" ,// 分期操作
                protocal: "/wap/billServer/shoppingMgt/queryProtocolContents.do" // 获取协议内容
            },
            borrow: { // 借款
                index: "/wap/billServer/allLoanMgt/getBillLoanList.do", // 首页
                borrowhistoryrecord: "/wap/billServer/allLoanMgt/getBillLoanHistory.do", // 借款历史列表
                acct: "/wap/billServer/allLoanMgt/getBillLSDetail.do", // 详情（借款、专项共用）
                acctHistory: "/wap/billServer/allLoanMgt/getBillLSHisDetail.do", // 历史详情（借款、专项共用）
                acctSjsh: "/wap/billServer/allLoanMgt/getBillLoanDetailSJSH.do", // 随借随还现有详情（借款、专项共用）
                acctHistorySjsh: "/wap/billServer/allLoanMgt/getBillLoanHisDetailSJSH.do", //随借随还历史详情（借款、专项共用）

                receipt: "/wap/billServer/allLoanMgt/getBillVerification.do", // 借据页（所有借据共用）
                repayedRecord: "/wap/billServer/allLoanMgt/getRepayRecord.do" // 还款记录页（所有还款记录共用）
            },
            special: { // 专项
                index: "/wap/billServer/allSpecLoanMgt/getBillSpecialLoanList.do", // 首页
                specialhistoryrecord: "/wap/billServer/allSpecLoanMgt/getBillSpecialLoanHistory.do" // 首页历史
            }
        },
        //立即还款
        repay: {
            calcRepay: "/wap/repayMgt/queryRepayMoney.do", // 还款试算
            goRepay: "/wap/repayMgt/goRepay.do" // 还款确认页面
        }
    },
    /*获取url参数*/
    querys: function () {
        var qs = location.search.substr(1), // 获取url中"?"符后的字串  
            args = {}, // 保存参数数据的对象
            items = qs.length ? qs.split("&") : [], // 取得每一个参数项,
            len = items.length;

        for (var i = 0; i < len; i++) {
            var idx = items[i].indexOf("=");
            if (idx > 0) {
                var name = decodeURIComponent(items[i].substring(0, idx));
                var value = "";
                if (items[i].length > idx + 1) {
                    value = decodeURIComponent(items[i].substring(idx + 1));
                }
                args[name] = value;
            }
        }
		
		// 判断当前args参数里面是否包含token
		if (args.token) {
			// 存localStorage
			localStorage.setItem("token",args.token); 
		} else {
			// 取localStorage
			args["token"] = localStorage.getItem("token");
		}
        return args;
    },
     /*还款*/
    repaybtn: function (url, jsondata) {
        if (!url) {
            url = this.domain + this.urls.repay.goRepay;
        }
		
		//生成form
		var oldForm = document.getElementById("repayForm");
        if(oldForm){
			//删除
			document.body.removeChild(oldForm);
		}
        var form = document.createElement("form");
        form.style = "display:none;";
        form.method = "post";
        form.action = url;
		form.id = "repayForm";
		
        for (x in jsondata) {
			var ipt = document.createElement("input");
			ipt.type = "hidden";
			ipt.name = x;
			ipt.value = jsondata[x];
			form.appendChild(ipt);
        }
        document.body.appendChild(form);
        //自动提交
        form.submit();
    }

};
