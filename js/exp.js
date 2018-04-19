/*
* 对exp通用的功能封装
* @author mawei
*/
if(typeof template == 'undefined'){
	var template = {};
}
var Exp = (function($, template){
	var cache = {cssSupport:{}};
	var Sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
	(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
	(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
	(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
	(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	Sys.ios = ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/);
	var Exp = {
		mobile: !!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),
		/*
		*添加默认事件，阻止弹出层滑动
		*@param el HTMLElement 要阻止的元素
		*/
		addDefaultsEvents: function(el){
			function eFilter(){return false;};
			var mobile = this.mobile;
			var events = ['mousewheel', 'DOMMouseScroll', mobile?'touchstart':'mousedown', mobile?'touchmove':'mousemove', mobile?'touchend':'mouseup'], i= events.length;
			while(i--){
				el.on(events[i], eFilter);
			}
		},
		/*
		* 判断css属性是否支持
		*/
		cssSupports : (function() { 
			var support = cache.cssSupport;
			return function(prop) {
				var div = document.createElement('div'),
				vendors = 'khtml o moz webkit'.split(' '),
				len = vendors.length, ret = false;
				prop = prop.replace(/-[\w]/g, function(val) {
					return val.toUpperCase().substring(1);
				});
				if(prop in support) return support[prop];
				
				if ('-ms-' + prop in div.style) ret = '-ms-' + prop;
				else{
					prop = prop.replace(/^[a-z]/, function(val) {
						return val.toUpperCase();
					});
					while(len=len-1){
						if (vendors[len] + prop in div.style ){
							ret = vendors[len] + prop;
						};
					}
				}
				
				return support[prop] = ret;
			}
		})(),
		/*
		* 设置css
		*/
		css:  function(element, prop, val) {
			var getComputedStyle = document.defaultView.getComputedStyle;
			var ret = this.cssSupports(prop);
			if(val === undefined){
				if(element.length){
					element = element[0];
				}
				return (element && element.style[ret] || element && getComputedStyle(element, '').getPropertyValue(prop));
			}
			else{
				if(element.length){
					for(var i=0; i<element.length; i++){
						element[i].style[ret] = val;
					}
				}
				else{
					element.style[ret] = val;
				}
			}
		},
		css3: function(el, prop){
			var reg = /\((?:[\s,]*([-\d\.]+)[px\s]*)?(?:[\s,]*([-\d\.]+)[px\s]*)?(?:[\s,]*([-\d\.]+)[px\s]*)?/g,
				values = reg.exec(Exp.css(el, prop));
			if(values){
				values.shift();
			}
			return values;
		},
		/*
		* 简单模板
		* @param opts {Object} 设置的参数信息
		* @deprecate 使用artTemplate代替
		*/
		HTMLTemplate : function(opts) {
			//opts:{param:{}, string:""}
			var o = opts.param || {},html = [opts.string].join('').replace(/[\f\n\r\t\v]+/ig, "");
			if (o) {
				for (var i in o) {
					var re = new RegExp('&\\{' + i + '\\}', 'g');//替换&{var}变量
					html = html.replace(re, o[i]);
				}
				html = handleSanmuExpression(html);//处理三目表达式
				return html;
			}
			html = handleSanmuExpression(html);
			return html;
		
			function handleSanmuExpression(html){
				var expression =  /\&{.*?[<>=]?(.*?["']?:["']?.*?["']?)}/g,
					results = html.match(expression);
				if(results && results.length > 0)
				{
					var i = results.length, result, sanmuStr="";
					while(i--){
						result = results[i];
						if(result)sanmuStr = result.replace(/^\&{/,"").replace(/}$/,"");
						try{html = html.replace(result, eval(sanmuStr));}catch(e){};
					}
				}
				return html;
			}
		},
		/*
		* 类继承方法
		*/
		Class: (function()
		{
			var w = window, prototypeStr = "__prototype__", classes = {};
			/*
			* 类构造方法
			*/
			function Class(){
				if(this.init) this.init();
			}
			/*
			* 定义方法的命名空间
			*/
			function createName(name, Class){
				classes[name] = Class;
				return w[name] = Class;
			}
			/*
			* 扩展
			*/
			function _include(o, t){
				for(var i in t)o[i] = t[i];
				return o;
			}
			/*
			* 空方法，用于继承
			*/
			function f(){}
			/*

			* 子方法调用父方法
			*/
			function _super(){
				var caller = this._super.caller, 
					methodName = caller._methodName, 
					_prototype = this.constructor[prototypeStr], 
					flag = "__called_flag__";
				while(_prototype = _prototype[prototypeStr]){
					var method = _prototype[methodName];
					if(method && !_prototype[flag]){
						_prototype[flag] = true;
						method.apply(this, arguments);
						delete _prototype[flag];
						break;
					}
				}
			}
			/*
			* 子类继承父类
			* @param statics {Object} 静态方法
			* @param properties {Object} 实例方法
			*/
			function _extend(name, statics, properties){
				function Class(){
					var init = this.init;
					if(init)init.apply(this, arguments);
				}
				var obj = createName(name, Class);
				if(!properties) {
					properties = statics; 
					statics = null;
				}
				if(statics){
					if(statics.inherit){
						_include(Class,  this);
					}
					_include(Class,  statics);
				}
				Class["extend"] = _extend;
				f.prototype = this.prototype;
				Class.prototype = new f();
				Class.prototype.constructor = Class;
				Class.include = function(properties){
					_include(this.prototype, properties);
				};
				if(properties)
				{
					var fn = Class.prototype, property;
					for(var i in properties){
						property = properties[i];
						property["_methodName"] = i;
						fn[i] = property;
					}
					fn['_super'] = _super;
					fn['include'] = function(properties){
						_include(this, properties);
					};;
					properties[prototypeStr] = this[prototypeStr];
					Class[prototypeStr] = properties;
				}
				if(Class.init)Class.init();
				return Class;
			}
			Class["extend"] = _extend;
			Class["get"] = function(name){
				return classes[name];
			};
			return Class;
		})(),
		/*
		* 扩展对象属性
		* @param orig {Object} 源对象
		* @param target {Object} 目标对象
		* @param deep {Boolean} 是否深度copy
		*/
		extend: function(orig, target, deep){
			var toStr = Object.prototype.toString,
				arrayFlag = "[object Array]";
			orig = orig || {};
			for (var i in target) {
				if(deep === true && target.hasOwnProperty(i)) {
					if (typeof target[i] === "object") {
						if(!orig[i]){
							orig[i] = toStr.call(target[i]) === arrayFlag ? [] : {};
						}
						arguments.callee(orig[i], target[i]);
					}
					else {
						orig[i] = target[i];
					}
				}
				else orig[i] = target[i];
			}
			return orig;
		},
		/*
		* 获取页面元素的绝对top位置
		* @param e {HTMl} dom对象
		*/
		getTop: function(e, deep){ 
			var offset = 0;
			if(e.offsetParent != null){
				 offset = e.offsetTop;
				 var parent = e.offsetParent;
				 if(deep){
					 offset += arguments.callee(e.offsetParent); 
				 }
				 else if("relative absolute fixed".indexOf(parent.style.position) == -1){
					 offset += arguments.callee(e.offsetParent); 
				 }
			}
			else if(e.offsetParent != null){
			}
			return offset; 
		}, 
		/*
		* 获取页面元素的绝对left位置
		* @param e {HTMl} dom对象
		*/
		getLeft: function(e, deep){ 
			var offset = 0; 
			if(e.offsetParent != null/* && "relative absolute fixed".indexOf(a.css("position")) == -1*/){
				offset = e.offsetLeft;
				var parent = e.offsetParent;
				if(deep){
					 offset += arguments.callee(e.offsetParent); 
				 }
				 else if("relative absolute fixed".indexOf(parent.style.position) == -1){
					 offset += arguments.callee(e.offsetParent); 
				 }
			}
			return offset; 
		},
		/*
		* 获取浏览器版本号
		*/
		getVersion:function(){
			return Sys;
		},
		checkDevice: {
			isMobile: function(){
				return (navigator.userAgent.match(/Win/i) 
					|| navigator.userAgent.match(/MacIntel/i) 
					|| navigator.userAgent.match(/Linux/i)
				) ? false : true;
			}
		},
		position: {
			getHeight: function(){
				var height = document.documentElement.offsetHeight || document.body.offsetHeight;
				return height;
			},
			scrollTop: function(){
				return document.documentElement.scrollTop || document.body.scrollTop;
			},
			scrollHeight: function(){
				return document.documentElement.scrollHeight || document.body.scrollHeight;
			},
			clientHeight: function(){
				return document.documentElement.clientHeight || document.body.clientHeight;
			}
		},
		remove: function(){
			if(this.parentNode){
				this.parentNode.removeChild(this);
				return;
			}
		},
		buttonChange: function(opts){//触发按钮可点击状态
			var opts = opts || {},
			button = opts.button,
			notClass = opts.notClass,
			yesClass = opts.yesClass,
			inputsId = opts.inputsId,
			valideId = opts.valideId,
			errorClass = opts.errorClass,
			checkbox = opts.checkbox,
			valideEl = opts.valideEl,
			lisenerParent = opts.lisenerParent,
			flag = false,
			callBack = opts.callBack,
			clickCallback = opts.clickCallback;
			function compare(){
				if(valideEl.valide({hide:true})){
					button.removeClass(yesClass).addClass(notClass);
					if(callBack){
						callBack(true);
					}
				}else{
					button.removeClass(notClass).addClass(yesClass);
					if(callBack){
						callBack(false);
					}
				}
			}
			$(lisenerParent || window).on("input", function(){
				if(checkbox && checkbox.element.hasClass(checkbox.uncheckClass)){
					return;
				}
				compare();
			});
			if(clickCallback){
				Exp.click(button, function(){
					if(valideEl.valide()){
						button.removeClass(yesClass).addClass(notClass);
						if(clickCallback){
							clickCallback(true);
						}
					}else{
						button.removeClass(notClass).addClass(yesClass);
						if(clickCallback){
							clickCallback(false);
						}
					}
				});
			}
			if(checkbox){
				Exp.click(checkbox.element, function(){
					var checkbox = $(this);
		            if(checkbox.hasClass(checkbox.uncheckClass)){
		            	flag = true;
		                checkbox.removeClass(checkbox.uncheckClass);
		            }else{
		            	flag = false;
		                checkbox.addClass(checkbox.uncheckClass);
		            }
		            changeState();
		        });
			}
			compare();
		},
		pageList:function (options){
			var root = options.root,
				pages = options.pages,
				status = 0,
				startPoint,
				movePoint,
				minInterval = options.minInterval || 500,
				touchTime = new Date();
			options.currentIndex = options.currentIndex || 0;
			var slidePageBtns = options.slidePageBtns;
			pages.each(function(i, e){
				var btn = slidePageBtns.eq(i), page = pages.eq(i);
				page.on("transitionend", function(event){
					if(options.transitionEndCall){
						options.transitionEndCall({
							target:page,
							root:root,
							pages:pages,
							index:i,
							elapsedTime:event.elapsedTime,
							propertyName:event.propertyName,
							type:"transitionend"
						});
					}
				})
			});
			slidePageBtns.each(function(i, e){
				var btn = slidePageBtns.eq(i), page = pages.eq(i);
				btn.on("mousedown touchstart", function(event){
					if(new Date() - touchTime < minInterval){
						status = 0;
						return false;
					}
					else touchTime = new Date();
					status = 1;
					var touch = event.touches?event.touches[0]:event;
					startPoint= {
						x: touch.clientX,
						y: touch.clientY
					};
					
					if(options.touchStartCall){
						options.touchStartCall({
							start:startPoint,
							target:event.target,
							curPage:page,
							root:root,
							pages:pages,
							index:i,
							type:"touchstart"
						});
					}
					var target = event.srcElement || event.target;
					if(target.tagName.toUpperCase() !== "A"){
						event.preventDefault();
					}
				}).on("mousemove touchmove", function(event){
					if(status == 0 || status > 2 )return;
					var first = false,
						touch = event.touches?event.touches[0]:event,
						movePoint = {
							x: touch.clientX,
							y: touch.clientY
						},
						subY = movePoint.y - startPoint.y,
						subX = movePoint.x - startPoint.x;
					if(subY>=0 && i == 0 && !first){
						return;
					}
					else if(subY<=0 && i == pages.length - 1 && !first){
						return;
					}
					if(status == 1){
						status = 2;
						first = true;
					}
					if(status == 2){
						if(subY || subX){
							if(options.touchMoveCall){
								options.touchMoveCall({
									start:startPoint,
									move:movePoint,
									target:event.target,
									curPage:page,
									root:root,
									pages:pages,
									index:i,
									type:"touchmove",
									first: first
								});
							}
						}
					}
					event.preventDefault();
					
				}).on("mouseup touchend", function(event){
					if(status == 0)return;
					status = 3;
					var touch = event.changedTouches?event.changedTouches[0]:event;
					movePoint = {
						x: touch.clientX,
						y: touch.clientY
					};
					
					var subY = movePoint.y - startPoint.y,
						subX = movePoint.x - startPoint.x;
					if(subY>=0 && i == 0){
						if((subY || subX) && options.firstPageEndCall){
							options.firstPageEndCall({
								start:startPoint,
								move:movePoint,
								target:event.target,
								curPage:page,
								root:root,
								pages:pages,
								index:i,
								type:"touchend"
							});
						}
						return;
					}
					else if(subY<=0 && i == pages.length - 1){
						if((subY || subX) && options.lastPageEndCall){
							options.lastPageEndCall({
								start:startPoint,
								move:movePoint,
								target:event.target,
								curPage:page,
								root:root,
								pages:pages,
								index:i,
								type:"touchend"
							});
						}
						return;
					}
					if(subY || subX){
						if(options.touchEndCall){
							options.touchEndCall({
								start:startPoint,
								move:movePoint,
								target:event.target,
								curPage:page,
								root:root,
								pages:pages,
								index:i,
								type:"touchend"
							});
						}
					}
					event.preventDefault();
				})
			});
		},
		alertBox: (function(){
			// zjq 防止页面能滑动
			function preventScroller(event) {
				event.preventDefault();
				return false;
			}
			/**
			 * [弹窗]
			 * @return {[type]} [description]
			 * @Author: 12050231
			 * @Date:   2014-03-25 10:20:54
			 * @Last Modified by :   14020803
			 * @Last Modified time:   2014-03-25 14:20:54
			 */
			function AlertBox(opts){
				this.opts = opts || {};
				this.title = this.opts.title || '';
				this.msg = this.opts.msg || '';
				this.type = this.opts.type || 'default';
				this.hasMask = (this.opts.hasMask === false) ? false : true;
				this.confirm = this.opts.confirm || function(){};
				this.cancel = this.opts.cancel || function(){};
				var callBack = this.opts.callBack,self = this;
				this.callBack = function(){
					if(callBack){
						callBack.call(self);
					}
					Exp.clickActive($(self.el));
				};
				this._event = Exp.checkDevice.isMobile() ? "tap" : "click";
				if(!opts.animate && opts.animate !== false ){
					opts.animate = 'alert-box-anim';
				}
				if(!opts.bgAnimate && opts.bgAnimate !== false ){
					opts.bgAnimate = 'alert-bg-anim';
				}
				this.animate = opts.animate;
				this.bgAnimate = opts.bgAnimate;
				this.scrollerClass = opts.scrollerClass;
				this.survivePeriod = opts.survivePeriod || false;
				this.createTime = new Date();
				this.delayRender = opts.delayRender===false || opts.delayRender? opts.delayRender : true;
				this.upOffset = opts.upOffset || 0;
				this.resetCallback = opts.resetCallback;
				this.asyncResetCallback = opts.asyncResetCallback;
				this.background = opts.background;
				this.bgClickReset = opts.bgClickReset;
			}
			AlertBox.prototype = {
				init: function(){
					var self = this;
					switch(self.type) {
						case "default":
							var html = '<div class="alert-box"><div class="msg">&{msg}</div><div class="wbox"><div class="wbox-col-a btn-b btn-cancel mr20"><a href="#">取消</a></div><div class="wbox-col-a btn-c btn-confirm"><a href="#">确定</a></div></div></div>';
							break;
						case "alert":
							var html = '<div class="alert-box pop-window"><div class="cont"><p class="title">&{msg}</p></div><div class="pop-button"><a href="javascript:void(0);" class="confirm">确定</a></div></div>'
							// var html = '<div class="alert-box"><div class="msg">&{msg}</div><div class="layout wbox"><div class="wbox-col-a btn-c btn-confirm"><a href="#">确定</a></div></div></div>';
							break;
						case "validate":
							var html = '<div class="alert-box alert-box-valide"><div class="msg">&{msg}</div></div>';
							break;
						case "custom":
							var html = this.opts.html;
							break;
					}
					var tpl = Exp.HTMLTemplate({
						string: html,
						param: {
							msg: self.msg
						}
					});
					//解决键盘消失后定位不准
					if(self.delayRender){
						setTimeout(function(){self.render(tpl);}, 50);
					}
					else{
						self.render(tpl);
					}
					if(self.type == "validate" && self.opts.autoCancel){
						setTimeout(function(){
							if(self.cancel){
								self.cancel();
							}
							self.reset();
						},1500);
					}
					return this;
				},
				render: function(_htmlTpl){
					var self = this;
					var body = document.body;
					if(this.opts.contextAnimate){
						var $body = $(body), 
							context = $body.find('.alert-context'),
							siblings = $body.children(':not(.alert-context):not(script)');
						if(!context.length){
							context = $('<section class="alert-context"></section>').appendTo($body);
						}
						context.append(siblings);
						this.context = context;
					}
					body.insertAdjacentHTML('beforeend', _htmlTpl);
					var el = self.el = self.get(".alert-box");
					self.hasMask && self.mask(body);
					function setPos(){
						self.setMaskPos();	
						if(self.opts.setPos){
							self.opts.setPos.call(self);
						}
						else{
							self.setPos();
						}
					}
					this.setPosProxy = setPos;
					if(self.animate){
						el.setAttribute("class", (el.getAttribute("class")||"") + " "+ self.animate);
					}
					if(self.context){
						// self.context.addClass('alert-back-in');//20161110 zjq 去掉背景变化
					}
					if(self.opts.renderTime){
						setTimeout(function(){
							(typeof self.callBack == "function") && self.callBack();
							$(window).on("resize",setPos);
							setPos();
						}, self.opts.renderTime);
					}
					else if(typeof self.callBack == "function") {
						self.callBack();
						$(window).on("resize", setPos);
					}
					setPos();
					self.addEvent();
					document.addEventListener('touchmove', preventScroller);
					if(!this.scrollerClass)return;
					var scroller = $("." + this.scrollerClass);
					scroller[0].addEventListener('touchstart', touchstart);
					scroller[0].addEventListener('touchmove', touchmove);
					
					var startY;
					function touchstart(event) {
						startY = event.touches[0].clientY;
					}
					function touchmove(event) {
						var height = scroller.height(),
							scrollTop = scroller[0].scrollTop,
							scrollHeight = scroller[0].scrollHeight;
						var eventY = event.touches[0].clientY;
						var subY = startY - eventY;
						if(scrollTop >= 0 && scrollTop + height < scrollHeight && subY > 0){
							event.stopPropagation();
						}
						else if(scrollTop > 0 && scrollTop + height <= scrollHeight && subY < 0){
							event.stopPropagation(); 
						}
						else{
							event.preventDefault();
						}
						return false;
					}
				},
				mask: function(body){
					var self = this;
					var alertBoxBg = document.createElement("div");
						alertBoxBg.setAttribute("class", 'alert-box-bg' + ' alert-box-bg-'+self.type +(this.opts&&this.opts.rootClass?' '+this.opts.rootClass+'-bg':''));
					this.bg = alertBoxBg;
					if(this.background === false)return;
					body.appendChild(alertBoxBg);
					this.setMaskPos();
					
					if(self.bgAnimate)alertBoxBg.setAttribute("class", (alertBoxBg.getAttribute("class")||"") + " "+ self.bgAnimate);
					if(this.bgClickReset !== false){
						Exp.click($(self.bg),function(){
							if(!$(self.bg).hasClass('alert-box-bg-validate')){
								self.reset();
							}
						});
					}
				},
				setMaskPos: function(){
					// zjq 20170410  背景蒙层高度不对
					// var _height = Exp.position.scrollHeight();
					var _height = $(window).height()>Exp.position.scrollHeight() ? $(window).height():Exp.position.scrollHeight();
					this.bg.style.cssText += ";height:" + _height + "px;width:" + document.documentElement.scrollWidth + "px;";
				},
				setPos: function(){
					var self = this, el = self.el, bg = self.bg;
					var scrollTop = Exp.position.scrollTop();
					el.style.cssText += ";top:" + (scrollTop + window.innerHeight/2 - el.offsetHeight/2 - this.upOffset) + "px;left:" + (document.documentElement.offsetWidth/2 - el.offsetWidth/2) + "px;";
					if(self.type == "mini"){
						bg.style.opacity = 0;
						setTimeout(function(){
							bg.fadeOut(500, function(){
								$(this).remove();
							});
							bg.fadeOut(500, function(){
								$(this).remove();
							});
						},2000);
					}
				},
				addEvent: function(){
					var self = this, el = self.el;
					$(el.querySelector(".btn-confirm")).on(self._event, function(e){
						self.confirm(el);
						self.reset();
						e.preventDefault();
					});
					if(self.type != "alert"){
						$(el.querySelector(".btn-cancel")).on(self._event, function(e){
							self.cancel(el);
							self.reset();
							e.preventDefault();
						});
					}
				},
				reset: function(){
					if(this.survivePeriod && new Date() - this.createTime < this.survivePeriod){
						return;
					}
					var self = this,
						context = self.context;
					self.context = null;
					//解决键盘消失后定位不准
					setTimeout(function(){
						var el = self.el, bg = self.bg,
							$el = $(el), $bg = $(bg), opts = self.opts;
						$el.removeClass(opts.animate).addClass(opts.animateOut || "alert-box-anim-out");
						$bg.removeClass(opts.bgAnimate).addClass(opts.bgAnimateOut || "alert-bg-anim-out");
						if(context){
							// context.addClass("alert-front-in").removeClass("alert-back-in");//20161110 zjq 去掉背景变化
						}
						setTimeout(function(){
							if(bg){
								Exp.remove.call(bg);
							}
							Exp.remove.call(el);
							if(self.resetCallback){
								self.resetCallback.call(self);
							}
							if(this.type != "mini"){
								self.die(el);
							}
							if(context){
								// context.removeClass("alert-back-in alert-front-in");//20161110 zjq 去掉背景变化
							}
						},390);
						self.removeScrollerEvent();
						if(self.asyncResetCallback){
							self.asyncResetCallback.call(self);
						}
					},50);
					
				},
				removeScrollerEvent: function(){
					document.removeEventListener('touchmove', preventScroller);
					$(window).off('resize', this.setPosProxy);
				},
				die: function(){
					var self = this, el = self.el;
					$(el.querySelector(".btn-confirm")).off(self._event);
					if(self.type != "alert"){
						$(el.querySelector(".btn-cancel")).off(self._event);
					}
				},
				get: function(selector){
					var el = document.querySelectorAll(selector);
					return el[el.length - 1];
				}
			};
			return function(opts){
				return new AlertBox(opts).init();
			};
		})(),
		/*
		* function 阻止连续如点击执行
		* @param  {[function]} callback [回调]
		* @param  {[options]} 配置信息 [事件名称]
		* @param  {[number]} interval [时间-毫秒]
		* author: mawei
		*/
		stopper: function(callback, interval){
			interval = interval || 1000;
			var lastTime;
			return function(){
				time = new Date();
				if(!lastTime || time - lastTime > interval){
					callback();
					lastTime = time;
				}
			}
		},
		/*
		* function 事件注册
		* @param  {[Element]} $el [触发对象]
		* @param  {[string]} eventName [事件名称]
		* @param  {[string]} selector [选择器]
		* @param  {[function]} handler [事件回调]
		* author: mawei
		*/
		registerListener: function($el, eventName, selector, handler){
			if(!handler){
				handler = selector;
				selector = undefined;
			}
			var mobile = Exp.mobile,
				eventNames = {
					touchstart: {
						name: mobile ? "touchstart" : "mousedown",
						path: "touches"
					},
					touchmove: {
						name: mobile ? "touchmove" : "mousemove",
						path: "touches"
					},
					touchend: {
						name: mobile ? "touchend" : "mouseup",
						path: "changedTouches"
					}
				},
				config = eventNames[eventName],
				newListener = function(event){
					var evt = event[config.path]?event[config.path][0]:event, self = this;
					if(handler){
						return handler.call(self, evt, event);
					}
				},
				args = [config.name, selector, newListener];
			if(!selector){
				args.slice(1, 1);
			}
			$el.on.apply($el, args);
		},
		/*
		* function 拖动开始事件
		* @param  {[Element]} $el [触发对象]
		* @param  {[string]} selector [选择器]
		* @param  {[function]} handler [事件回调]
		* author: mawei
		*/
		touchstart: function($el, selector, handler){
			this.registerListener($el, "touchstart", selector, handler);
		},
		/*
		* function 拖动移动事件
		* @param  {[Element]} $el [触发对象]
		* @param  {[string]} selector [选择器]
		* @param  {[function]} handler [事件回调]
		* author: mawei
		*/
		touchmove: function($el, selector, handler){
			this.registerListener($el, "touchmove", selector, handler);
		},
		/*
		* function 拖动结束事件
		* @param  {[Element]} $el [触发对象]
		* @param  {[string]} selector [选择器]
		* @param  {[function]} handler [事件回调]
		* author: mawei
		*/
		touchend: function($el, selector, handler){
			this.registerListener($el, "touchend", selector, handler);
		},
		/*
		* function 点击事件
		* @param  {[Element]} $el [触发对象]
		* @param  {[string]} selector [选择器]
		* @param  {[function]} handler [事件回调]
		* @param  {[Boolean]} immediate [是否立即执行]
		* @author: mawei
		*/
		click: function($el, selector, handler, immediate){
			var sub;
			if(typeof arguments[1] == 'function'){
				immediate = handler;
				handler = selector;
				selector = undefined;
			}
			this.touchstart($el, selector, function(event){
				sub = {x:event.clientX, y:event.clientY};
			});
			this.touchend($el, selector, function(event){
				var self = this;
				if(sub && Math.abs(event.clientX - sub.x) <= 5 && Math.abs(event.clientY - sub.y) <= 5){
					if(handler){
						//使点击active有效
						if(immediate === true){
							return handler.call(self, event);
						}
						else{
							// return handler.call(self, event);
							setTimeout(function(){handler.call(self, event);}, 110);
						}
					}
					sub = null;
				}
			});
		},
		touch:function($target, touchstart, touchmove, touchend){
			var startPoint;
			Exp.touchstart($target, function(event){
				var values = /translate3d\(([\d-+.]+)px?, ([\d-+.]+)px?, ([\d-+.]+)px?\)/gi.exec(Exp.css($target, 'transform'));
				var startY = values?values[2]-0:0;
				startPoint = {
					x: event.clientX,
					y: event.clientY,
					startY: startY
				}
				if(touchstart){
					return touchstart.call($target, event, startPoint);
				}
			});
			Exp.touchmove($target, function(event){
				if(!startPoint)return;
				var point = {
					x: event.clientX,
					y: event.clientY,
					subX: event.clientX - startPoint.x,
					subY: event.clientY - startPoint.y
				};
				if(touchmove){
					return touchmove.call($target, event, point);
				}
			});
			Exp.touchend($target, function(event){
				if(!startPoint)return;
				var endPoint = {
					x: event.clientX,
					y: event.clientY,
					subX: event.clientX - startPoint.clientX,
					subY: event.clientY - startPoint.clientY
				}
				startPoint = null;
				if(touchend){
					return touchend.call($target, event, endPoint);
				}
			});
		},
		/*
		* function 上下左右方位弹出层
		* @param  {[Object]} options [参数配置]
		* author: mawei
		*/
		page: function(options){
			var htmlPre = '<div class="alert-box alert-page-box'+(options.rootClass?' '+options.rootClass:'')+'">',
				htmlTail = '</div>',
				Exp = this,
				timer;
			var page = {
				slideOut: function(options){
					var self = this;
					timer = setTimeout(function(){
						//self.hide();
					}, 400);
					this.alertBox.slideOut(options);
					return this;
				},
				slideIn: function(options){
					if(timer){
						clearTimeout(timer);
						timer = 0;
					}
					//this.show();
					this.alertBox.slideIn(options);
					return this;
				},
				remove: function(){
					this.alertBox.reset();
					return this;
				},
				hide: function(){
					this.alertBox.el.style.display = 'none';
					this.alertBox.bg.style.display = 'none';
					return this;
				},
				show: function(){
					this.alertBox.el.style.display = 'block';
					this.alertBox.bg.style.display = 'block';
					return this;
				},
				create: function(){
					this.alertBox = Exp.alertBox({
						delayRender: false,
						type:"custom",
						rootClass: options.rootClass,
						html: htmlPre + (options && options.html?options.html:"") + htmlTail,
						transition:{position: options.position || "bottom", to: options.to || "200px"},
						resetCallback: options.resetCallback,
						asyncResetCallback: options.asyncResetCallback,
						bgClickReset: options.bgClickReset,
						background: options.background,
						setPos: function(){
							var self = this,
								$el = $(this.el),
								$bg = $(this.bg),
								opts = this.opts,
								transition = opts.transition,
								toMatch = (transition.to+'').match(/(\d+)(.*)/),
								scrollTop = Exp.position.scrollTop();
								this.addEvent = function(){}//覆盖原有默认事件
							if(this.bgClickReset !== false){
								Exp.click($bg, function(){
									self.slideOut();
								});
							}
							if(toMatch[2] == "%"){
								transition.to = ("top bottom".indexOf(transition.position)>-1?
									window.innerHeight:window.innerWidth)*(toMatch[1]/100);
							}
							else{
								transition.to = toMatch[1]-0;
							}
							init($el, transition);
							
							function init($el, transition){
								initSize_Position($el, transition);
							}
							function initSize_Position($el, transition){
								var position = transition.position, 
									x = 0, 
									y = 0, 
									width = window.innerWidth, 
									height = window.innerHeight;
								if(position == "top"){
									y = -transition.to;
									if(options.auto === true){
										height = $el.height();
										transition.to = height;
									}
									else {
										height = transition.to;
									}
								}
								else if(position == "bottom"){
									y = height;
									if(options.auto === true){
										height = $el.height();
										transition.to = height;
									}
									else {
										height = $el.height();
									}
								}
								else if(position == "left"){
									x = -transition.to;
									if(options.auto === true){
										width = $el.width();
										transition.to = width;
									}
									else {
										width = transition.to;
									}
								}
								else if(position == "right"){
									x = window.innerWidth;
									if(options.auto === true){
										width = $el.width();
										transition.to = width;
									}
									else {
										width = transition.to;
									}
								}
								$el.css({top: y, left: x, height: height, width: width, opacity:0})
							}
							this.slideIn = function (options){//为this添加滑入方法
								options = options || {}
								var position = transition.position, 
									x = 0, 
									y = 0;
								if(position == "top"){
									y = options.to || transition.to;
								}
								else if(position == "bottom"){
									y = -(options.to || transition.to);
								}
								else if(position == "left"){
									x = options.to || transition.to;
								}
								else if(position == "right"){
									x = -(options.to || transition.to);
								}
								setTimeout(function(){
									$el.addClass("page-slide-ani");
									Exp.css($el, 'transform', 'translate3d('+ x +'px,'+ y +'px,0px)');
									$el.css({opacity: 1});
								}, 10);
							};
							this.slideOut = function (options){//为this添加滑出方法
								var self = this, opts = this.opts;
								$el.addClass("page-slide-ani");
								$bg.addClass(opts.bgAnimateOut || "alert-box-anim-out2").removeClass(opts.bgAnimate || "alert-bg-anim");
								//Exp.css($el, 'transform', 'translate3d(0px,0px,0px)');
								var position = transition.position, 
									x = 0, 
									y = 0;

								if(position == "top"){
									y = 0;
								}
								else if(position == "bottom"){
									y = 0;
								}
								else if(position == "left"){
									y = 0;
								}
								else if(position == "right"){
									y = 0;
								}
								Exp.css($el, 'transform', 'translate3d('+ x +'px,'+ y +'px,0px)');
								if(options && options.persistent === true){
									$el.css('opacity', 0);
									return;
								}
								page.remove();
								self.removeScrollerEvent();
							};
							this.reset = function (){//覆盖原有reset
								$bg.css('opacity', 0);
								var self = this, el = this.el, bg = this.bg, opts = this.opts;
								setTimeout(function(){
									if(opts && opts.resetCallback){
										opts.resetCallback.call(self);
									}
									if(bg){
										Exp.remove.call(bg);
									}
									Exp.remove.call(el);
								}, options.slideTime||410);
								if(opts && opts.asyncResetCallback){
									opts.asyncResetCallback.call(this);
								}
							};
							if(options.resizeCallback){
								options.resizeCallback.call(this);
							}
						},
						animate: 'alert-page-anim',
						bgAnimate: "alert-bg-anim2",
						bgAnimateOut: "alert-bg-anim-out2",
						autoCancel:true,
						callBack: options.alertCallBack || function(){}
					});	
					return this;
				}
			};
			page.create();
			return page;
		},
		/**
		* 懒加载器
		*/
		lazier:function(options){
			if(typeof options == 'undefined'){
				options = {};
			}
			var type = options.type || 'class',
				lasyProperty = options.property || 'data-lasy',
				lasyPropertyType = options.type || 'data-lasytype',
				values = [],
				parent = $(document.body),
				Exp = this;
			
			return {
				operate: function(type, el, value){
					switch(type){
						case 'class':
							el.addClass(value);
							break;
						case 'image':
							if(el.is('img')){
								el.attr('src', value);
							}
							else{
								el.css('background-image', value);
							}
							break;
					}
				},
				find: function(){
					var curElements = parent.find('['+lasyProperty+']');
					curElements.each(function(i, e){
						var e = $(e), offset = e.offset();
						values.push({
							el: e,
							value: e.attr(lasyProperty),
							top: offset.top,
							left: offset.left,
							type: e.attr(lasyPropertyType) || type
						});
						e.removeAttr(lasyProperty);
					});
				},
				scrolled: function(){
					var top = parent.prop('scrollTop'),
						screenHeight = document.body.offsetHeight||document.body.clientHeight,
						maxTop = top + screenHeight,
						operate = this.operate;
					values = values.filter(function(obj){
						if(obj.top >= top && obj.top <= maxTop){
							operate(obj.type, obj.el, obj.value);
							return false;
						}
						return true;
					});
					
				},
				start: function(){
					var self = this;
					window.addEventListener("scroll", function(){
						self.scrolled();
					}, false);
				}
			}
		},
		scrolledAjax: function (ajaxOptions){//滚动到底部获取数据
			var steps = ajaxOptions.steps||10,
				maxRecords = ajaxOptions.maxRecords||150,
				totalFlag = ajaxOptions.totalFlag||"total",
				startFlag = ajaxOptions.startFlag||"startIndex",
				endFlag = ajaxOptions.endFlag||"endIndex",
				recordsFlag = ajaxOptions.recordsFlag||"list",
				status = 0,//获取数据状态 0为空闲， 1为在获取中
				firstGet = true,
				remainTimes = 3,
				count = 0,
				scrolledmin = 150,
				autoGetData = ajaxOptions.autoGetData === false? false : true,
				totalRecords = steps,//初始化值，设置的大一些以通过后续检测
				parent = ajaxOptions.parent,
				loader,
				expLoader,
				callingFlag = false,
				startFetch = ajaxOptions.startFetch === undefined ? true : ajaxOptions.startFetch,
				firstStatus = {list:[]},
				lazier = Exp.lazier(),
				lasyAnimate = ajaxOptions.lasyAnimate;
			ajaxOptions.data = ajaxOptions.data||{};
			if(startFetch && autoGetData !== false)getData();
			function scrollListener(){
				if(lasyAnimate)lazier.scrolled();
				if(firstGet && startFetch)getData();
				else if(status || !startFetch)return;
				else if(checkToBottom())getData();
			}
			if(autoGetData !== false){
				window.addEventListener("scroll", scrollListener, false);

			}
			function checkToBottom(){
				var de = document.documentElement,
					bd = document.body,
					clientHeight = de.clientHeight || bd.clientHeight,
					scrollTop = bd.scrollTop || de.scrollTop,
					scrollHeight = bd.scrollHeight || de.scrollHeight;
				if(clientHeight + scrollTop + scrolledmin > scrollHeight){
					return true
				}
				return false;
			}
			function loading(){
				var root = parent.parent(), $elementObj = root.find('.scroll-loading'),
					elementB = $elementObj.length === 0;
				if(ajaxOptions.loader === false)return;
				else if(ajaxOptions.loader) loader = ajaxOptions.loader;
				else if(!loader){
					loader = $('<div class="scroll-loading"><span class="mb3 loading-flag"/>&nbsp;正在加载中...</div>');
					elementB ? loader: loader = '';
					// if(loader){
						loader.insertAfter(parent);
					// }
					root.css('position', 'relative');
					// expLoader = Exp.createCanvasLoading(parent);
				}
				if(loader)loader.show();
			}
			function clearLoading(){
				if(loader){
					loader.hide();
				}
			}
			function clearExpLoading(){
				if(expLoader){
					expLoader.remove();
					expLoader = null;
				}
			}
			function getData(){
				if(callingFlag)return;
				firstGet = false;
				var options = ajaxOptions, data = options.data;
				loading();
				data[startFlag] = ++count;
				if(totalRecords < data[startFlag]){//起始下标大于总数返回
					clearLoading();
					--count;
					return;
				}
				data['pageSize'] = steps;
				data['pageIndex'] = Math.ceil(count/steps);
				data[endFlag] = (count+=steps-1);
				data['timestamp'] = new Date().getTime();
				if(totalRecords < data[endFlag]){//总数小于结束下标
					data[endFlag] = totalRecords;
				}
				callingFlag = true;
				$.ajax({
					url:options.url,
					type: options.type||"GET",
					data: data ||{},
					dataType: "json",
					success: function(data){
						clearExpLoading();
						handleSuccess(data);
						Exp.clickActive(parent);
						if(lasyAnimate){
							lazier.find();
							lazier.scrolled();
						}
					},
					error: function(){
						clearExpLoading();
						if(remainTimes>0){
							//限定获取失败次数
							remainTimes--;
							count -= steps;
							callingFlag = false;
							getData();
						}
						else{
							callingFlag = false;
							count -= steps;
							clearLoading();
						}
					}
				});
			}
			function handleSuccess(json){
				if(json){
					var elements = [];
					if(totalRecords = (json[totalFlag] > maxRecords?maxRecords:json[totalFlag])){
						
						var list = json[recordsFlag];
						//保存第一次数据
						if(count == steps){
							firstStatus.list = list || [];
						}
						if(list && list.length>0){
							if(ajaxOptions.template){
								for(var i=0,l=list.length; i<l; i++){
									var html = typeof ajaxOptions.template ==='string'?ajaxOptions.template:
											typeof ajaxOptions.template ==='function'?ajaxOptions.template(list[i], i):''; 
									var record = list[i];
									var tpl = Exp.HTMLTemplate({
										string: html,
										param: ajaxOptions.handleData ? ajaxOptions.handleData(list[i], i) : list[i]
									});
									parent[0].insertAdjacentHTML('beforeend', tpl);
									var element = parent[0].lastElementChild;
									if(ajaxOptions.animate)element.setAttribute("class",(element.getAttribute("class")||"") + " " + ajaxOptions.animate);
									elements.push(element);
								}
								if(ajaxOptions.animate)setTimeout(function(){
									for(var i=0,l=elements.length; i<l; i++){
										elements[i].style.opacity = 1;
									}
								},10);
							}
							else{
								if(ajaxOptions.handleData){
									for(var i=0,l=list.length; i<l; i++){
										ajaxOptions.handleData(list[i], i);
									}
								}
								var html = template(ajaxOptions.templateId, json);
								parent.append(html);
								var children = parent.children(), size = children.size(), length = list.length;
								
								if(ajaxOptions.animate){
									while(length--){
								 		(function(index){
								 			var element = children.get(index);
								 			elements.push(element);
								        	element.setAttribute("class",(element.getAttribute("class")||"") + " " + ajaxOptions.animate);
								        	setTimeout(function(){
												element.style.opacity = 1;

											},10);
								 		})(size - length -1);
									}
						        }
							}
							
						}
						if(totalRecords <= ajaxOptions.data[endFlag]){
							if(ajaxOptions.endCallback) {
								var loadEndFlag = ajaxOptions.maxRecords && ajaxOptions.maxRecords < json[totalFlag] && count >= ajaxOptions.maxRecords;
								ajaxOptions.endCallback(ajaxOptions,loadEndFlag);
							}
							clearLoading();
						}
						if(ajaxOptions.success)ajaxOptions.success(json, ajaxOptions, elements);
					}
					else if(ajaxOptions.zeroCallback){//0条数据回调ajaxOptions.zeroCallback方法
						clearLoading();
						ajaxOptions.zeroCallback(ajaxOptions, parent,json);
					}
				}
				//一次获取数据没有满屏继续,此时需要1个延迟加载dom的时间
				callingFlag = false;
				if(checkToBottom() && autoGetData !== false)getData();
			}
			
			return {
				start: function(){
					startFetch = true;
					$(window).trigger('scroll');
				},
				close: function(){
					startFetch = false;
				},
				getData: function(){
					getData();
				},
				isLoadingData:function(){
					return callingFlag;
				},
				clearLoading: function(){
					clearLoading();
				},
				destory:function(){
					window.removeEventListener("scroll", scrollListener);
					if(loader){
						loader.remove();
					}
					if(this.pulldownRefresh){
						this.pulldownRefresh.destory();
					}
				},
				resetRemainTimes: function(){
					remainTimes = 3;
					firstGet = true;
					totalRecords = steps;
				},
				abort:function(){
					if(this.ajaxObject){
						this.ajaxObject.abort();
					};
				},
				createPulldownRefresh: function (options){
					var element = options.element,
						pullDownArea = options.pullDownArea || parent,
						insertBeforeEl = options.insertBeforeEl,
						endCallback = options.endCallback,
						id = options.id,
						ids = id?id.split(' '): [],
						elementObj = parent.find('.ui-pulldown-refresh').length === 0;
					if(!element){
						var html = '<div class="ui-pulldown-refresh">'
									+ '<div style="bottom:'+(options.bottom||0)+';">'
										+ '<i></i>'
										+ '<span>下拉刷新</span>'
									+ '</div>'
								+ '</div>';
						elementObj ? html: html = '';
						insertBeforeEl = insertBeforeEl || pullDownArea;
						element = $(html).insertBefore(insertBeforeEl);
					}
					
					var self = this;
					//pulldown下拉刷新页面
					this.pulldownRefresh = Exp.pulldownRefresh({
						element: element,
						pullDownArea: pullDownArea,
						insertBeforeEl: insertBeforeEl,
						endCallback: function (opt) {
							//创建ajax
							self.abort();
							self.update(ids, opt);
							if(!!endCallback){
								endCallback();
							}
						}
					});
				},
				update: function(ids, opt){
					var list = firstStatus.list,
						options = ajaxOptions,
						data = options.data,
						length = ids.length;
					function equalList(newFirstData, firstData, ids){
						var idsLength = ids.length, length = newFirstData.length;
						if(length != firstData.length){
							return false;
						}
						var newObj, obj;
						for(var j=0; j<length; j++){
							newObj = newFirstData[j],
							obj = firstData[j];
							for(var i=0; i<idsLength;i++){
								if(newObj[ids[i]] != obj[ids[i]]){
									return false;
								}
							}
						}
						return true;
						
					}
					if(list){
						var dataTemp = {};
						dataTemp[startFlag] = 1;
						dataTemp['pageSize'] = steps;
						dataTemp['pageIndex'] = Math.ceil(1/steps);
						dataTemp[endFlag] = steps;
						dataTemp.timestamp = new Date().getTime();
						this.ajaxObject = $.ajax({
							url:options.url,
							type: options.type||"GET",
							data: dataTemp ||{},
							dataType: "json",
							success: function(json){
								var newList = json[recordsFlag] || [],
									firstData = list,
									newFirstData = newList,
									equal = true;
								if(newFirstData){
									if(!firstData || !length){
										equal = false
									}
									else{
										equal = equalList(newFirstData, firstData, ids);
									}
								}
								else if(newFirstData != firstData){
									equal = false;
								}
								if(!equal){
									count = 0;
									data[startFlag] = ++count;
									data['pageSize'] = steps;
									data['pageIndex'] = Math.ceil(count/steps);
									data[endFlag] = (count+=steps-1);
									
									parent.empty();
									opt.hide();
									handleSuccess(json);
								}
								else{
									opt.refreshNoData();
								}
							}
						});
					}
				}
			}
		},
		/*
		* function tab页面滑动
		* @param  {[Element]} box [tab内容区域]
		* @param  {[Element]} tabs [tabs父元素]
		* @param  {[Element]} tabBg [tab焦点元素，用作动画效果]
		* @param  {[Object]} config [配置项]
		* @author: zhangweiwei
		*/
		sectionSlide: function(box,tabs,tabBg,config){
			this.box = $(box);
			this.tabs = $(tabs);
			this.tabBg = $(tabBg);
			this.contents = this.box.children();
			this.tabBgMove = 0;//标题背景移动的距离
		    this.config = $.extend({},config||{});
		    this.width = this.config.width||this.box.width();//一次滚动的宽度
		    this.size = this.config.size||this.box.children().length;
		    this.loop = this.config.loop||false;//默认不能循环滚动
		    this.auto = this.config.auto||false;//默认不能自动滚动
		    this.auto_wait_time = this.config.auto_wait_time||3000;//轮播间隔
		    this.scrollTime = 300;//滚动时长
		    this.minleft = -this.width*(this.size-1);//最小left值，注意是负数[不循环情况下的值]
		    this.maxleft =0;//最大left值[不循环情况下的值]
		    this.nowLeft = 0;//初始位置信息[不循环情况下的值]
		    this.pointX = null;//记录一个x坐标
		    this.startX = null;
		    this.startY = null;
		    this.index = this.config.index || 0;//初始化进入指定的tab
			this.recordFirstFlags = {};//记录是否为第一次初始化
			this.touchSlide = this.config.touchSlide || false;
		    this.touchMove = this.config.touchMove || false;//是否给手滑动 zjq 20160428
		    this.busy = false;
		    this.timer;
			this.slope = Math.sin(Math.PI/6);//判断手指水平和垂直移动的比率，以区分水平和垂直 即30度正玄
			var on = this.tabs.find('li.on')
			if(on.size()){
				 this.index = this.tabs.find('li').index(on);
			}
			
		    var count = 0;
		    this.init = function(){
		    	var contentWidth = this.width;
		        this.contents.width(contentWidth);
		        this.bindEvent();
				this.initWidth();
				this.autoScroll();
				this.goIndex(this.index, true);
				this.fixPage(this.index);;
 		    };
			/*初始化页面宽度*/
			this.initWidth = function(){
				this.box.css('width',this.width*this.size);
		        this.tabBg.css('width',(1/this.size*100) + '%');
			}
		    this.bindEvent = function(){
		        var self = this;
		        //是否给手滑动 zjq 20160428
		        if(this.touchMove){
		        	Exp.touch(self.box, function(e){
		            if(!self.busy){
		                self.startX = self.pointX = e.screenX;
		                self.startY = self.pointY = e.screenY;
		            }
			        }, function(e){
			            if(!self.busy){
			                return self.move(e.screenX, e.screenY);//这里根据返回值决定是否阻止默认touch事件
			            }
			        }, function(e){
	            		count = 0;
			            !self.busy && self.movEnd(e.screenX, e.screenY);
			        });	
		        }
		        Exp.click(self.tabs.children() ,function(){
		        	if(!self.busy){
			            var index = $(this).index();
		        		self.tabsClick(index);
			        }
		        });
		        if(self.touchSlide === false){
		        	return;
		        }
		        
		    };
		    this.autoScroll = function(){//自动滚动
		    	var self = this;
		        if(!self.loop || !self.auto)return;
		        clearTimeout(self.timer);
		        self.timer = setTimeout(function(){
		            self.goIndex((self.index+1)%self.size);
		        },self.auto_wait_time);
		    };
		    this.tabsClick = function(index){//tab标题切换
				var self = this, tabBgMove;
		        
				var taBgWidth = self.tabs.width()/this.contents.size();
				var liElemements = self.tabs.children(),
					li = liElemements.get(index);
		        
		        /*解决IOS中tab切换差1px*/
		        self.tabBgMove = liElemements.eq(index).position().left;
		        
		        
	            if(self.busy)return;
		        clearTimeout(self.timer);
		        self.goIndex(index);
		    };
		    this.goIndex = function(index, isInit){//滚动到指定索引页面
		        var self = this, 
		        	nowLeft = self.nowLeft,
		        	width = self.width,
		        	size = self.size;
		        var liElemements = self.tabs.children(),
					li = liElemements.get(index);
		        self.busy = true;
		        if(index<0)index = 0;
		        else if(index>=size)index = size-1;
		        if(index == -1 || index == size){//循环滚动边界
	                self.index = index==-1?(size-1):0;
	                self.nowLeft = index==-1?0:-width*(size+1);
	            }else{
	                self.index = index;
	                self.nowLeft = -(width*index);
	            }
	            self.tabsClick(index);
	            self.tabBg.css(this.getStyle(1)[1]);
	            liElemements.removeClass("on").eq(index).addClass("on");
		        self.box.css(this.getStyle(isInit?2:1)[0]);
	            setTimeout(function(){
	                self.complete(index, !self.recordFirstFlags[index]);
					self.recordFirstFlags[index] = true;
	            },5);
		    };
		    this.complete = function(index, isFirst){//动画完成回调
		        var self = this;
		        self.busy = false;
		        self.config.callback && self.config.callback(self.index, isFirst);
				self.fixPage(index);
				self.autoScroll();
		    };
			this.fixPage = function(index){
				//对tab页面内容大于1页高度进行修剪
				 var self = this;
				if(self.config.pageFixed){
					if(self.index != index)window.scrollTo(0,0);
					var pageHeight = document.documentElement.clientHeight + (self.config.pageFixedPx || 0);
					this.contents.each(function(i, el){
						var el = $(el);
						if(i == index){
							el.css('max-height', '');
						}
						else{
							el.css('max-height', pageHeight);
						}
					});
				}
			};
		    this.next = function(){//下一页滚动
		        if(!this.busy){
		            this.goIndex(this.index+1);
		        }
		    };
		    this.prev = function(){//上一页滚动
		        if(!this.busy){
		            this.goIndex(this.index-1);
		        }
		    };
		    this.move = function(pointX,pointY){//滑动屏幕处理函数
		    	var self = this;
		    	var liElemements = self.tabs.children(),
					li = liElemements.get(self.index);
		    	var moveAmountX = pointX - (this.pointX===null?pointX:this.pointX),
		    		moveAmountY = pointY - (this.pointY===null?pointY:this.pointY);
		    	var isVerticleMove = Math.abs(pointX - this.startX)*self.slope <= Math.abs(pointY - this.startY);
		    	if(isVerticleMove){
		    		return this.preventDefault = true;
		    	}
		        this.nowLeft = this.nowLeft + moveAmountX;
		        this.pointX = pointX;
			    this.box.css(this.getStyle(2)[0]);
			    this.tabBgMove = this.tabBgMove - moveAmountX/this.width*this.tabBg.width();
			    liElemements.removeClass("on").eq(self.index).addClass("on");
			    return this.preventDefault = false;
		    };
		    this.movEnd = function(endX,endY){
		        var moveAmount = this.nowLeft = endX - (this.startX===null?endX:this.startX);
		        if(this.preventDefault === true){
		        	index = this.index;
		        }
		        else if(moveAmount === 0)return;
		        else if(moveAmount < -70){
		        	//向左滑动
	                index = this.index+1;
	            }else if(moveAmount > 70){
	            	//向右滑动
	                index = this.index-1;
	            }else{
	            	index = this.index;
	            }
		        this.pointX = null;
	        	this.goIndex(index);
		    };
		    /*
		        获取动画样式，要兼容更多浏览器，可以扩展该方法
		        @int fig : 1 动画 2  没动画
		    */
		    this.getStyle = function(fig){
		    	var self = this;
		        var x = self.nowLeft ,
		            time = fig==1?self.scrollTime:0;
		        var tabX = self.tabBgMove;
		        return [{
		            '-webkit-transition':'-webkit-transform '+time+'ms',
		            '-webkit-transform':'translateX('+x+'px)',
		            '-webkit-backface-visibility': 'hidden',
		            'transition':'transform '+time+'ms',
		            'transform':'translateX('+x+'px)'
		        },{
		        	'-webkit-transition':'-webkit-transform '+time+'ms',
		            '-webkit-transform':'translateX('+tabX+'px)',
		            '-webkit-backface-visibility': 'hidden',
		            'transition':'transform '+time+'ms',
		            'transform':'translateX('+tabX+'px)'
		        }];
		    }
		    this.init();
		},
		/*
		* function 速度计算器
		* @param  {[Number]} rate 速率
		* @param  {[Number]} countRecord 计算的点数量 
		*/
		speedCounter: function(options){
			var rate = options && options.rate || 0.3,
				countRecord =  options && options.countRecord || 3,
				points = [];
			return {
				start: function(event){
					points = [];
					points.push({
						time: new Date(),
						x: event.screenX,
						y: event.screenY
					});
				},
				update: function(event){
					points.push({
						time: new Date(),
						x: event.screenX,
						y: event.screenY
					});
				},
				getValue: function(event){
					var l= points.length,
						backFirst = points[--l],
						backSecond = points[--l],
						speedX = 0
						speedY = 0;
					if(backFirst && backSecond){
						var x = backFirst.x - backSecond.x,
							y = backFirst.y - backSecond.y,
							duration = Math.abs(backSecond.time - backFirst.time);
						speedX = x * rate * 1000/duration;
						speedY = y * rate * 1000/duration;
					}
					return {
						x: speedX,
						y: speedY
					} 
				},
				getValueFromBeginToEnd: function(event){
					var l= points.length,
						backFirst = points[--l],
						backSecond = points[0],
						speedX = 0
						speedY = 0;
					if(backFirst && backSecond){
						var x = backFirst.x - backSecond.x,
							y = backFirst.y - backSecond.y;
						speedX = x;
						speedY = y;
					}
					return {
						x: speedX,
						y: speedY
					} 
				}
			}
		},
		/*
		* function 限制器
		* @param  {[Number]} minValue 最小值
		* @param  {[Number]} maxValue 最大值
		*/
		limitor: function(minValue, maxValue){
			return {
				getValue:function(value){
					if(value < minValue){
						return minValue;
					}
					else if(value > maxValue){
						return maxValue;
					}
					return value;
				}
			};
		},
		/*
		* function tab目录滑动
		* @param  {[Element]} box [tab内容区域]
		* @param  {[Element]} moveAnimateClass [移动动画样式]
		* @param  {[Element]} choseClass [选中样式]
		*/
		menuSlide: function(selector, moveAnimateClass,choseClass){
			el = $(selector);
			var contents = el.children();
			//初始化
			var startX,oldleft,endX,newleft=0,
				speedCounter = this.speedCounter(),
				limitor = this.limitor(window.innerWidth - el.width() , 0);
				
            Exp.touchstart(el, function(event, Event){
                startX = event.screenX;
				/*var reg = /\((?:[\s,]*([-\d\.]+)[px\s]*)?(?:[\s,]*([-\d\.]+)[px\s]*)?(?:[\s,]*([-\d\.]+)[px\s]*)?/g;
				var axises = reg.exec(el.css('-webkit-transform'));
				oldleft = parseFloat(axises&&axises[1] || 0);*/
				//解决连续滑动时抖动问题
				oldleft = el.offset().left;
				el.css('-webkit-transform', 'translateX('+ oldleft +'px)');
				el.removeClass(moveAnimateClass);
				speedCounter.start(event);
				return false;
            });
			Exp.touchmove(el, function(event){
				newleft = oldleft + event.screenX - startX;
				newleft = limitor.getValue(newleft);
				el.css('-webkit-transform', 'translateX('+ newleft +'px)');
				speedCounter.update(event);
            });
			Exp.touchend(el, function(event){
				el.addClass(moveAnimateClass);
				newleft += speedCounter.getValue().x;
               	newleft = limitor.getValue(newleft);
				el.css('-webkit-transform', 'translateX('+ newleft +'px)');
            });
			Exp.click(contents,function(){
				el.addClass(moveAnimateClass);
				var pre =el.find('.'+choseClass).index();
				var index = $(this).index();
				$(this).addClass(choseClass).siblings().removeClass(choseClass);
				if(index == pre) return;
				if(index > pre){
					newleft -= $(this).width();
				}else{
					newleft += $(this).width();
				}
               	newleft = limitor.getValue(newleft);
				el.css('-webkit-transform', 'translateX('+ newleft +'px)');
			});	
		},
		/*
		* function 底部菜单滑动隐藏
		* @param  {[Element]} el [底部菜单]
		* @param  {[Element]} showClass [控制显的示样式]
		* @param  {[Element]} timeSpan [滑动结束显示时间间隔]
		* @param  {[Object]} triggerArea [触发滑动区域]
		*/
		bottomMenu:function(el,showClass,timeSpan,triggerArea){
			var bottomMenu = $(el), 
				timer, duration = timeSpan, isShow = true;
			window.addEventListener("scroll", function(){
				handler();
			});
			function handler(event) {
				if(timer){
					clearTimeout(timer);
				}
				hide();
				timer = setTimeout(show, duration);
			}
			function hide() {
				if(isShow){
					isShow = false;
					bottomMenu.removeClass(showClass);
					isShow = false;
				}
			}
			function show() {
				if(!isShow){
					isShow = true;
					isValide = false;
					bottomMenu.addClass(showClass);
					isShow = true;
				}
			}
			
			var doc = $(triggerArea), isValide = false;
			Exp.touchstart(doc,  function(){
				isValide = true;
				//handler();
			});
			Exp.touchmove(doc,  function(){
				if(isValide){
					handler();
				}
			});
			Exp.touchend(doc,  function(){
				isValide = false;
			});
		},
		inputTrim: function(opt){//对input中的非法字符进行修剪
			function getValue(){
				return opt.element.val() || opt.element.text();
			};
			//设置光标位置函数 
			function setCursorPosition(ctrl, pos){ 
				if(ctrl.setSelectionRange){ 
					ctrl.focus(); 
					ctrl.setSelectionRange(pos,pos); 
				} 
				else if (ctrl.createTextRange) { 
					var range = ctrl.createTextRange(); 
					range.collapse(true); 
					range.moveEnd('character', pos); 
					range.moveStart('character', pos); 
					range.select(); 
				} 
			} 
			//获取光标位置函数 
			function getPositionForInput(ctrl){ 
				var CaretPos = 0; 
				if (document.selection) { // IE Support 
				ctrl.focus(); 
				var Sel = document.selection.createRange(); 
				Sel.moveStart('character', -ctrl.value.length); 
				CaretPos = Sel.text.length; 
				}else if(ctrl.selectionStart || ctrl.selectionStart == '0'){// Firefox support 
				CaretPos = ctrl.selectionStart; 
				} 
				return (CaretPos); 
			} 
			function trim(){
				var el = opt.element, val = getValue(), tip = opt.tip, trimReg = opt.trimReg;
				if(tip == val) val = "";
				if(trimReg){
					var arr = val.match(trimReg), value = arr ? arr.join("") : "";
					//重复一次
					arr = value.match(trimReg), value = arr ? arr[0] : "";
					if(value != val){
						var pos = getPositionForInput(el[0]);
						el.val(value);
						setCursorPosition(el[0], pos-1);
					}
				}
			}
			opt.element.on("input",function(){
				trim();
			});
		},
		pulldownRefresh: function(opt){//下拉刷新页面
	        var insertBeforeEl = opt.insertBeforeEl,
	            element = opt.element,
	            destory = false,
	            noDie = opt.noDie;
	        var startY, moveY, endY, subY, startX, moveX, sMoveX, sMoveY, endX, scrollTop, bodyHeight;
			function hide(){
				element.css({"height": "0"});
			}
	        function animation(){
	            element.css({"-webkit-transition": "height 0.4s ease"});
	        }
	        function clearLick(){
	            element.css({"-webkit-transition": ""});
	        }
			function refreshNoData(){
				element.find("span").html("已是最新数据");
	            element.find("i").addClass("ui-hide");
	            //延时显示
	            setTimeout(function(){
	                hide();
	                element.css({"-webkit-transition": "height 0.5s liner"});
	            },1000);
			}
            Exp.touchstart(insertBeforeEl, function(event){
            	if(destory)return;
	            startX = event.screenX;
	            startY = event.screenY;
	            scrollTop = $(window).scrollTop();
	            //console.log("touchstart>>" + t1);
				$('.zc-title .title-list').css('opacity',0).hide();
				bodyHeight = $("body").height();
				clearLick();
            });
            Exp.touchmove(insertBeforeEl,function(event){
            	if(destory)return;
	            if (scrollTop > 0) {
	                return;
	            }
				endX = event.screenX;
				endY = event.screenY;
	            moveX = endX - startX;
	            moveY = endY - startY;
            	//过滤横向移动
            	sMoveX = moveX<0? -moveX:moveX;
            	sMoveY = (moveY<0? -moveY:moveY);
	           

            	if(sMoveX*2 > sMoveY){
            		return true;
            	}

	            var maxDragY = 80;
	            var showRefreshTipY = 50;
	            if (moveY < 0) {
	                return;
	            }
	            element.find("i").removeClass("load");
	            //下拉代码
	            if (scrollTop == 0) {
	                subY = (moveY / bodyHeight * moveY);
	                subY = subY > maxDragY ? maxDragY : subY;
	                element.find("i").removeClass("ui-hide");
	                
	                if (subY > showRefreshTipY && subY <= maxDragY) {
	                    element.find("span").html("释放立即刷新");
	                    element.find("i").addClass("up");
	                } else {
	                    element.find("span").html("下拉刷新");
	                    element.find("i").removeClass("up");
	                }
	                element.css({"height": subY + "px"});
	                return false;
	            }
            });
            Exp.touchend(insertBeforeEl, function(event){
            	if(destory)return;

            	if(sMoveX > sMoveY){
            		return true;
            	}

				var scrollTop = document.body.scrollTop;
				if(scrollTop>120){
					$('.zc-auto-title').css('margin-top','-44px');
					$('.ui-dropmenu .ui-dropmenu-detail').css('top','36px');
				}else{
					$('.zc-auto-title').css('margin-top','0px');
					$('.ui-dropmenu .ui-dropmenu-detail').css('top','80px');
				}
	            //console.log("touchend>>" + t2);
	            if (element.find("i").hasClass("load") && scrollTop < 0){
	                element.find("i").removeClass("load");
	                opt.stopStaut = true;
	                opt.endCallback(opt);
	                if(scrollTop > 40){
	                    document.body.scrollTop = 0;
	                }
	                hide();
	            }
	            if ((moveY < 0 || scrollTop !== 0) && element.find("i").hasClass("load"))return false;
	            if (moveY > 0) {
	                //加载代码
	                if (opt.endCallback && element.find("i").hasClass("up")) {
	                    opt.stopStaut = false;
						opt.hide = hide;
						opt.refreshNoData = refreshNoData;
	                    opt.endCallback(opt);
						element.find("span").html("正在加载中...");
	                    element.find("i").addClass("load");

						element.css({"height": "40px"});
	                }
					else{
						hide();
					}
	            }
	            animation();
	            return false;
	        });

			return {
				destory: function(){
					if(!noDie){
						element.remove();
					}
					destory = true;
				}
			}
		},
		logger: function(msg){
			var msgs = '';
			for(var i=0; i<arguments.length; i++){
				msgs += '-----'+arguments[i];
			}
			$.ajax({
			url:'data/logger.json'+msgs+'-------------------------',
			type: "get",
			dataType: "json",
			data:{},
			success: function(){}
			})
		},
		/*
		* function 添加可点击active状态，通过检测data-clickactive属性，clickactive可自定义颜色值
		* @param  {[Element]} $el [父元素] 默认document.body
		* author: mawei
		*/
		clickActive: function(parent){
			if(!parent){
				parent = $(document.body)
			}
			
			function getBackgroundColor($dom) {
				var bgColor = "";
				while($dom[0].tagName.toLowerCase() != "html") {
				  bgColor = $dom.css("background-color");
				  if(bgColor != "rgba(0, 0, 0, 0)" && bgColor != "transparent") {
					break;
				  }
				  $dom = $dom.parent();
				}
				return bgColor;
			}
			//色差推算
			function subColor(color){
				var colors = color.match(/\d+/ig), value, ret='rgb(';
				for(var i=0; i<3; i++){
					value = Math.ceil(colors[i] - (256-colors[i])/8-21);
					value = value<0?0:value;
					ret += value;
					if(i!=2){
						ret += ',';
					}
				}
				ret += ')';
				return ret;
				
			}
			var Exp = this;
			parent.find('[data-clickactive]').each(function(i, e){
				var e = $(e), point, valid = false, validLonger = 100, timer,
					color = e.data('clickactive') || subColor(getBackgroundColor(e)),
					href = e.data('href'),
					change,
					forbidden,
					tempForbidden;
				if(color == 'change'){
					change = true;
				}
				e.removeAttr('data-clickactive').removeAttr('data-href');
				function setBackGround(){
					if(valid){
						e.css('background-color', color).addClass('click-active');
					}
					else{
						e.css('background-color', '').removeClass('click-active');
					}
					
				}
				Exp.touchstart(e, function(event){
					if(timer)clearInterval(timer);
					if(event.target && $(event.target).is('[data-clickforbidden]')){
						tempForbidden = true;
						return;
					}
					tempForbidden = false;
					if(change){
						forbidden = e.is('[data-clickforbidden]');
						if(forbidden)return;
					}
					point = {x:event.clientX, y:event.clientY};
					valid = true;
					timer = setInterval(setBackGround, validLonger);
					if(change){
						color = subColor(getBackgroundColor(e))
					};
				});
				Exp.touchmove(e, function(event){
					if(change && forbidden || tempForbidden){
						return;
					}
					valid = false;
					clearInterval(timer);
					setBackGround();
				});
				Exp.touchend(e, function(event){
					if(change && forbidden || tempForbidden){
						return;
					}
					if(point){
						var x = event.clientX, y = event.clientY;
						if(Math.abs(point.x - x) <= 5 && Math.abs(point.y - y) <= 5){
							setBackGround();
							valid = false;
							setTimeout(setBackGround, validLonger);
							if(href){
								setTimeout(function(){
									window.location.href = href;
								}, validLonger + 40);
							}
						}
						else{
							valid = false;
							setBackGround();
						}
						clearInterval(timer);
					}
					point = null;
					valid = false;
				});
				e.on('touchcancel', function(event){
					valid = false;
				});
				
			});
		},
		createLoading:function(msg){
			var html = '<div class="loading loading-animate"></div><span>'+(msg||'加载中')+'</span>';
			var loadingAlert =  Exp.alertBox({
				type:"validate",
				msg: html,
				callBack:function(){
				}
			});
			return {
				reset:function(){
					loadingAlert.reset();
				}
			};
		},
		/**
		*创建canvas的loading，暂不需要canvas
		*/
		createCanvasLoading: function(container){
			container = container || $(document.body);
			var width = height = 36, root = container.parent();
			var loading = $('<div class="exploading"><div class="sn-loading"></div><div class="intro">加载中...</div></div>');
			loading.insertAfter(container);
			var scrollTop = Exp.position.scrollTop(), offset = root.offset();
			loading.css({
				top: (window.innerHeight - loading.height())/2 + scrollTop - offset.top,
				left: (offset.width - loading.width())/2,
				opacity: 1
			});
			var positionX = 0, snLoading = loading.find('.sn-loading'), 
				timer = setInterval(function(){
					positionX += 152;
					if(positionX > 3000)positionX=0;
					snLoading.css('background-position-x', (-positionX) + 'px');
				}, 60);
			return {
				remove: function(){
					if(timer)clearInterval(timer);
					loading.remove();
				}
			}
		},
		/**
		*临时小提示
		*/
		showAlert: function(message, callback, time) {
			if(typeof callback == 'number'){
				var temp = time;
				time = callback;
				callback = temp;
			}
			Exp.alertBox({
				type: "validate",
				msg: message,
				callBack: function () {
					var that = this;
					setTimeout(function () {
						that.reset();
						callback && callback();
					}, time||2000);
				}
			});
		},
		/**
		*弹框提示具有确定按钮
		*/
		showWebBomb: function(el,message, callback, time) {
			if(typeof callback == 'number'){
				var temp = time;
				time = callback;
				callback = temp;
			}
			var htmlPre = '<div class="alert-box pop-window alert-box-anim-init alert-box-anim""><div class="cont"><p class="title">'+msg+'</p></div><div class="pop-button"><a href="javascript:void(0);" class="close">确定</a></div></div>';
			Exp.alertBox({
				type: "custom",
				msg: message,
				callBack: function () {
					var that = this;
					setTimeout(function () {
						that.reset();
						callback && callback();
					}, time||2000);
				}
			});
		},
		/**
		*用户确认取消提示框
		*/
		openPopWindow: function(contentEl, data, confirmCallBack, cancelCallBack, options){
			if(typeof data == 'function'){
				options = cancelCallBack;
				cancelCallBack = confirmCallBack;
				confirmCallBack = data;
				data = {};
			}
			options = options || {};
			var htmlPre = '<div class="alert-box pop-window'+(options.rootClass?'  '+options.rootClass:' alert-box-anim-init')+'">',
				htmlTail = '</div>';
			return Exp.alertBox({
				type:"custom",
				html: htmlPre + template.compile(typeof contentEl == 'string'?contentEl:contentEl.html())(data)+htmlTail,
				contextAnimate:options.contextAnimate || false,
				animate: options.animate|| "alert-box-anim" ,
				bgAnimate: options.bgAnimate|| "alert-bg-anim",
				animateOut: "alert-box-anim-out2",
				bgAnimateOut: "alert-bg-anim-out2",
				bgClickReset: options.bgClickReset,
				upOffset: options.upOffset,
				resetCallback: options.resetCallback,
				asyncResetCallback: options.asyncResetCallback,
				scrollerClass: options.scrollerClass,
				callBack:function(){
					var $el = $(this.el),
						self = this;
					if(options.callback){
						options.callback.call(self);
					}
					Exp.clickActive();
					Exp.click($el.find(".close"),function(){
						var ret;
						if(cancelCallBack){
							ret = cancelCallBack();
						}
						if(ret !== false)self.reset();
					});
					Exp.click($el.find(".confirm"),function(){
						var ret;
						if(confirmCallBack){
							ret = confirmCallBack();
						}
						if(ret !== false)self.reset();
					});
				}
			});
		},
		// 2016.11 zjq
		alertBoxNew: (function(){
			// zjq 防止页面能滑动 但是带有浏览器自带滚动的不禁止
			function preventScroller(event) {
				// event.preventDefault();
				// zhangjiqi 解决弹框中需要滚动条的问题。20170704
				var result = [],
				x = event.target,
				n = 0;
				while (x.tagName != 'BODY') {
				  	result.push(x);
				  	x = x.parentNode;
				}
				// console.log(result);
				for(var i = 0;i<result.length;i++){
					if(result[i].hasAttribute('scroll')){
						n++;
					}
				}
				if(!n){
					event.preventDefault();
				}
			}
			/**
			 * [弹窗]
			 * @return {[type]} [description]
			 * @Author: 12050231
			 * @Date:   2016-11-11 11:27:51
			 * @Last Modified by :   15111161
			 * @Last Modified time:   2016-11-11 11:27:51
			 */
			function AlertBox(opts){
				this.opts = opts || {};
				this.title = this.opts.title || '';
				this.msg = this.opts.msg || '';
				this.type = this.opts.type || 'default';
				this.hasMask = (this.opts.hasMask === false) ? false : true;
				this.confirm = this.opts.confirm || function(){};
				this.cancel = this.opts.cancel || function(){};
				var callBack = this.opts.callBack,self = this;
				this.callBack = function(){
					if(callBack){
						callBack.call(self);
					}
					Exp.clickActive($(self.el));
				};
				this._event = Exp.checkDevice.isMobile() ? "tap" : "click";
				if(!opts.animate && opts.animate !== false ){
					opts.animate = 'alert-box-anim3';
				}
				if(!opts.bgAnimate && opts.bgAnimate !== false ){
					opts.bgAnimate = 'alert-bg-anim';
				}
				this.animate = opts.animate;
				this.bgAnimate = opts.bgAnimate;
				this.scrollerClass = opts.scrollerClass;
				this.survivePeriod = opts.survivePeriod || false;
				this.createTime = new Date();
				this.delayRender = opts.delayRender===false || opts.delayRender? opts.delayRender : true;
				this.upOffset = opts.upOffset || 0;
				this.resetCallback = opts.resetCallback;
				this.asyncResetCallback = opts.asyncResetCallback;
				this.background = opts.background;
				this.bgClickReset = opts.bgClickReset;
			}
			AlertBox.prototype = {
				init: function(){
					var self = this;
					switch(self.type) {
						case "custom":
							var html = this.opts.html;
							break;
					}
					var tpl = Exp.HTMLTemplate({
						string: html,
						param: {
							msg: self.msg
						}
					});
					//解决键盘消失后定位不准
					if(self.delayRender){
						setTimeout(function(){self.render(tpl);}, 50);
					}
					else{
						self.render(tpl);
					}
					if(self.type == "validate" && self.opts.autoCancel){
						setTimeout(function(){
							if(self.cancel){
								self.cancel();
							}
							self.reset();
						},1500);
					}
					return this;
				},
				render: function(_htmlTpl){
					var self = this;
					var body = document.body;
					if(this.opts.contextAnimate){
						var $body = $(body), 
							context = $body.find('.alert-context'),
							siblings = $body.children(':not(.alert-context):not(script)');
						if(!context.length){
							context = $('<section class="alert-context"></section>').appendTo($body);
						}
						context.append(siblings);
						this.context = context;
					}
					body.insertAdjacentHTML('beforeend', _htmlTpl);
					var el = self.el = self.get(".new-alert-box");
					self.hasMask && self.mask(body);
					function setPos(){
						self.setMaskPos();	
						if(self.opts.setPos){
							self.opts.setPos.call(self);
						}
						else{
							self.setPos();
						}
					}
					this.setPosProxy = setPos;
					if(self.animate){
						el.setAttribute("class", (el.getAttribute("class")||"") + " "+ self.animate);
					}
					if(self.context){
						// self.context.addClass('alert-back-in');//20161110 zjq 去掉背景变化
					}
					if(self.opts.renderTime){
						setTimeout(function(){
							(typeof self.callBack == "function") && self.callBack();
							$(window).on("resize",setPos);
							setPos();
						}, self.opts.renderTime);
					}
					else if(typeof self.callBack == "function") {
						self.callBack();
						$(window).on("resize", setPos);
					}
					setPos();
					self.addEvent();
					document.addEventListener('touchmove', preventScroller);
					if(!this.scrollerClass)return;
					var scroller = $("." + this.scrollerClass);
					scroller[0].addEventListener('touchstart', touchstart);
					scroller[0].addEventListener('touchmove', touchmove);
					
					var startY;
					function touchstart(event) {
						startY = event.touches[0].clientY;
					}
					function touchmove(event) {
						var height = scroller.height(),
							scrollTop = scroller[0].scrollTop,
							scrollHeight = scroller[0].scrollHeight;
						var eventY = event.touches[0].clientY;
						var subY = startY - eventY;
						if(scrollTop >= 0 && scrollTop + height < scrollHeight && subY > 0){
							event.stopPropagation();
						}
						else if(scrollTop > 0 && scrollTop + height <= scrollHeight && subY < 0){
							event.stopPropagation(); 
						}
						else{
							event.preventDefault();
						}
						return false;
					}
				},
				mask: function(body){
					var self = this;
					var alertBoxBg = document.createElement("div");
						alertBoxBg.setAttribute("class", 'alert-box-bg' + ' alert-box-bg-'+self.type +(this.opts&&this.opts.rootClass?' '+this.opts.rootClass+'-bg':''));
					this.bg = alertBoxBg;
					if(this.background === false)return;
					body.appendChild(alertBoxBg);
					this.setMaskPos();
					
					if(self.bgAnimate)alertBoxBg.setAttribute("class", (alertBoxBg.getAttribute("class")||"") + " "+ self.bgAnimate);
					if(this.bgClickReset !== false){
						Exp.click($(self.bg),function(){
							if(!$(self.bg).hasClass('alert-box-bg-validate')){
								self.reset();
							}
						});
					}
				},
				setMaskPos: function(){
					// zjq 20170213  背景蒙层高度不对
					// var _height = Exp.position.scrollHeight();
					
					var _height = $(window).height()>Exp.position.scrollHeight() ? $(window).height():Exp.position.scrollHeight();
					this.bg.style.cssText += ";height:" + _height + "px;width:" + document.documentElement.scrollWidth + "px;";
				},
				setPos: function(){
					var self = this, el = self.el, bg = self.bg;
					// var scrollTop = Exp.position.scrollTop();
					// el.style.cssText += ";top:" + (scrollTop + window.innerHeight/2 - el.offsetHeight/2 - this.upOffset) + "px;left:" + (document.documentElement.offsetWidth/2 - el.offsetWidth/2) + "px;";
					if(self.type == "mini"){
						bg.style.opacity = 0;
						setTimeout(function(){
							bg.fadeOut(500, function(){
								$(this).remove();
							});
							bg.fadeOut(500, function(){
								$(this).remove();
							});
						},2000);
					}
				},
				addEvent: function(){
					var self = this, el = self.el;
					$(el.querySelector(".btn-confirm")).on(self._event, function(e){
						self.confirm(el);
						self.reset();
						e.preventDefault();
					});
					if(self.type != "alert"){
						$(el.querySelector(".btn-cancel")).on(self._event, function(e){
							self.cancel(el);
							self.reset();
							e.preventDefault();
						});
					}
				},
				reset: function(){
					if(this.survivePeriod && new Date() - this.createTime < this.survivePeriod){
						return;
					}
					var self = this,
						context = self.context;
					self.context = null;
					//解决键盘消失后定位不准
					setTimeout(function(){
						var el = self.el, bg = self.bg,
							$el = $(el), $bg = $(bg), opts = self.opts;
						$el.removeClass(opts.animate).addClass(opts.animateOut || "alert-box-anim-out3");
						$bg.removeClass(opts.bgAnimate).addClass(opts.bgAnimateOut || "alert-bg-anim-out");
						if(context){
							// context.addClass("alert-front-in").removeClass("alert-back-in");//20161110 zjq 去掉背景变化
						}
						setTimeout(function(){
							if(bg){
								Exp.remove.call(bg);
							}
							Exp.remove.call(el);
							if(self.resetCallback){
								self.resetCallback.call(self);
							}
							if(this.type != "mini"){
								self.die(el);
							}
							if(context){
								// context.removeClass("alert-back-in alert-front-in");//20161110 zjq 去掉背景变化
							}
						},390);
						self.removeScrollerEvent();
						if(self.asyncResetCallback){
							self.asyncResetCallback.call(self);
						}
					},50);
					
				},
				removeScrollerEvent: function(){
					document.removeEventListener('touchmove', preventScroller);
					$(window).off('resize', this.setPosProxy);
				},
				die: function(){
					var self = this, el = self.el;
					$(el.querySelector(".btn-confirm")).off(self._event);
					if(self.type != "alert"){
						$(el.querySelector(".btn-cancel")).off(self._event);
					}
				},
				get: function(selector){
					var el = document.querySelectorAll(selector);
					return el[el.length - 1];
				}
			};
			return function(opts){
				return new AlertBox(opts).init();
			};
		})(),
		init: function(){
			this.clickActive();
		}
	}
	Exp.click($(document.body), function(){});//解决webkit不触发点击事件
	Exp.init();
	return Exp;
})($, template);

