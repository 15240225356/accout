/*
* 键盘 支付
* @author zjq
*/
(function($, template, Exp){
	var keyboard = {
		/*
		* 密码输入框（简密）加键盘
		*/
		pwdInputKeyboard: function(options){
			var confirmBtn, keyboard;
			var passwordBox = Exp.openPopWindow(getInputTemple(), function(){
				var value = keyboard.val();
				var pass = !!(value && value.length == 6);
				if(pass && options && options.confirmCallback){
					options.confirmCallback(value);
				}
				return pass;
			}, null, {
				callback: function(){
					confirmBtn = $(this.el).find('.confirm');
				},
				asyncResetCallback: function(){
					keyboard.slideOut();
				},
				rootClass: 'pop-password-box',
				upOffset:119
			});
			function handleInputCallback(value){
				if(value && value.length == 6){
					confirmBtn.removeClass('invalide').removeAttr('data-clickforbidden');
				}
				else{
					confirmBtn.addClass('invalide').attr('data-clickforbidden', true);
				}
				if(options && options.input){
					options.input(value);
				}
			}
			setTimeout(function(){
				var inputs = $(passwordBox.el).find('.pwd-box .pwd-char-box'),
					inputs2 = [];
				inputs.forEach(function(e){
					inputs2.push($(e));
				});
				keyboard = Exp.numberKeyboard({
					type:'tel',
					asyncReset: function(){
						passwordBox.reset();
					},
					input: function(value){
						if(value.length > 6){
							value = this.delete();
						}
						inputs2.forEach(function(e, i){
							e.empty();
							if(value.charAt(i)){
								e.append('<div class="spot"></div>');
							}
							else{
								e.append('<div class="blank"></div>');
							}
						});
						handleInputCallback(value);
					}
				}).slideIn();
			}, 100);
			function getInputTemple(){
				return  '<div class="pwd-header">'
				+'<span class="close"></span>'
				+'<p class="pwdtitle">支付密码</p>'
				+'</div>'
				+'<div class="pwd-content">'
				+'<div class="pwd-box">'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'<div class="pwd-char-box"><div class="blank"></div></div>'
				+'</div>'
				+'</div>'
				+'<div class="pop-button">'
				// +'<a href="javascript:void(0);" class="close" data-clickactive>取消</a>'
				+'<a href="javascript:void(0);" class="confirm invalide" data-clickactive="change" data-clickforbidden>确定</a>'
				+'</div>';
			}
			return {
				passwordBox:passwordBox,
				keyboard:keyboard,
				getValue:function(){
					return keyboard.val();
				}
			}
		},
		/**
		 * 密码输入框（繁密）
		 */
		pwdInput:function(options){
			var confirmBtn, pwd;
			Exp.openPopWindow(getInputTemple(), function callback(){
				var value = pwd.val();
				var pass = !!(value);
				if(pass && options && options.confirmCallback){
					options.confirmCallback(value);
				}
				return pass;
				// if(value.length){
				// 	alert('确认');
				// }
				// else{
				// 	return false;
				// }
				
			}, null, {
				callback:function(){
					Exp.click($('.pwd-lost'),function(){
						if(options && options.lostPassword){
							options.lostPassword();
						}
					})
					var el = $(this.el);
					function resize(){
						var scrollTop = Exp.position.scrollTop();
						el.css('top', (scrollTop + window.innerHeight/2 - 100)/2);
					}
					pwd = $('.pwd-input');//.focus();
					pwd.on('focus', resize);
					// resize();
					setTimeout(function(){
						pwd.trigger('focus');
					},100)

					var confirmBtn = $(this.el).find('.confirm');
					pwd.on('input', function(){
						var value = pwd.val();
						if(value.length){
							confirmBtn.removeClass('invalide-btn').removeAttr('data-clickforbidden');
						}
						else{
							confirmBtn.addClass('invalide-btn').attr('data-clickforbidden');
						}
					});
				},
				bgClickReset :options.bgClickReset,
				rootClass: 'pop-password-box',
				upOffset:119
			});
			
			function getInputTemple(){
				return  '<div class="pwd-header">'
				+'<span class="close"></span>'
				+'<p class="pwdtitle">支付密码</p>'
				+'<span class="pwd-lost">忘记密码</span>'
				+'</div>'
				+'<div class="pwd-content">'
				+'<div class="pwd-box">'
				+'<input class="pwd-input webkit-box" type="password" placeholder="请输入任性付支付密码"/>'
				+'</div>'
				+'</div>'
				+'<div class="pop-button">'
				// +'<a href="javascript:void(0);" class="close" data-clickactive>取消</a>'
				+'<a href="javascript:void(0);" class="confirm invalide-btn" data-clickactive="change" data-clickforbidden>确定</a>'
				+'</div>';
			}
		},
		/*
		* 无密码
		*/
		noPwdInput:function(options){
			var confirmBtn, pwd;
			Exp.openPopWindow(getInputTemple(), function callback(){
				var value = pwd.val();
				var pass = !!(value);
				if(pass && options && options.confirmCallback){
					options.confirmCallback(value);
				}
				return pass;
				// if(value.length){
				// 	alert('确认');
				// }
				// else{
				// 	return false;
				// }
				
			}, null, {
				callback:function(){
					Exp.click($('.pwdtext'),function(){
						if(options && options.setPassword){
							options.setPassword();
						}
					})
					var el = $(this.el);
					function resize(){
						var scrollTop = Exp.position.scrollTop();
						el.css('top', (scrollTop + window.innerHeight/2 - 100)/2);
					}
					pwd = $('.pwd-input');//.focus();
					pwd.on('focus', resize);
					// resize();
					setTimeout(function(){
						pwd.trigger('focus');
					},100)

					var confirmBtn = $(this.el).find('.confirm');
					pwd.on('input', function(){
						var value = pwd.val();
						if(value.length){
							confirmBtn.removeClass('invalide-btn').removeAttr('data-clickforbidden');
						}
						else{
							confirmBtn.addClass('invalide-btn').attr('data-clickforbidden');
						}
					});
				},
				bgClickReset :options.bgClickReset,
				rootClass: 'pop-password-box',
				upOffset:119
			});
			
			
			function getInputTemple(){
				return  '<div class="pwd-header">'
				+'<span class="close"></span>'
				+'<p class="pwdtitle">支付密码</p>'
				+'</div>'
				+'<div class="pwd-content">'
				+'<div class="pwd-box nopwd"><p class="pwdtext">请设置支付密码</p></div>'
				+'</div>'
			
				+'<div class="pop-button">'
				+'<a href="javascript:void(0);" class="cl999" data-clickactive>确定</a>'
				//+'<a href="javascript:void(0);" class="confirm invalide-btn" data-clickactive="change" data-clickforbidden>确定</a>'
				+'</div>';
			}
		},
		/*
		* 对输入框生成数字键盘
		*/
		createKeyboard: function(options){
			if(!options || !options.el|| !options.el.size())return;
			var self = this,
				el = options.el,
				focusElement = options.focusElement,
				fronterElement = options.fronterElement || options.focusElement,
				top = this.getTop(el[0]),
				left = this.getLeft(el[0]),
				contentHtml = '<div style="position:absolute;" class="wrap-input-mod"></div>',
				clear = options.clear,
				clearHtml = '<div class="tip-icon clearIcon"><i class="cut"></i></div>',
				content = $(contentHtml).insertAfter(el),
				placeholder = el.attr('placeholder'),
				initValue = el.val(),
				keyboardInput = {},
				keyboard,
				chars = $('<div class="chars"></div>').appendTo(content),
				cursor = $('<div class="cursor cursor-frame" style="position:absolute;border-right:solid 2px;height: 100%;top: 0;display:none;"></div>').appendTo(content),
				lastChar = chars.find(':last-child'), 
				fontSize = el.css('font-size'),
				textAlign = el.css('text-align'),
				color = el.css('color'),
				disabled = el.is('[disabled]'),
				lastValue = initValue,
				prevSelector = options.prevSelector,
				height = el.css('height');
			content.css({
				top: top,
				left: left,
				width: el.css('width'),
				height: height,
				border: el.css("border"),
				'padding-top': el.css("padding-top"),
				'padding-right': el.css("padding-right"),
				'padding-bottom': el.css("padding-bottom"),
				'padding-left': el.css("padding-left"),
				'line-height': el.css('line-height'),
				'font-style': el.css('font-style'),
				'font-variant': el.css('font-variant'),
				'font-weight': el.css('font-weight'),
				'font-stretch': el.css('font-stretch'),
				'font-size': el.css('font-size'),
				'font-family': el.css('font-family'),
				font: el.css('font'),
				'text-overflow':'ellipsis',
				'white-space':'nowrap',
				'box-sizing':el.css('box-sizing')
			});
			chars.css({
				'text-align': textAlign,
				overflow:'hidden'
			});
			el.css('opacity', 0)
			cursor.css({height: fontSize, color:color});
			var padding = {
				top: el.css("padding-top").match(/\d+/)[0]-0+(height.match(/\d+/)[0]-fontSize.match(/\d+/)[0])/2,
				left: el.css("padding-left").match(/\d+/)[0]-0
			}
			setCuror(lastChar);
			function setCuror(char, direct){
				if(disabled)return;
				if(char && char.size() && char.hasClass('char') && char.parent().size()){
					left = Exp.getLeft(char[0])-1+(direct==='left'?0:char.width());
					top = padding.top;
				}
				else{
					if(textAlign == 'right'){
						left = content.width();
						top = padding.top;
					}
					else{
						left = padding.left;
						top = padding.top;
					}
				}
				cursor.css({
					left: left,
					top: top
				});
			}
			var targetChar = null;
			Exp.click(chars, '.char', function(event){
				if(disabled)return;
				focusor.focus();
				keyboardInput.focus(true);
				var target = $(this), index = target.index();
				var left = Exp.getLeft(target[0], true), clientX = event.clientX, width = target.width();
				if(clientX - Math.floor(width/2) > left){
					index += 1;
					setCuror(target);
				}
				else{
					setCuror(target, 'left');
				}
				keyboard.setCursor(index);
				targetChar = target;
				return false;
			}, true);
			Exp.click(content, clickFocus, true);
			Exp.click(chars, clickFocus, true);
			if(focusElement){
				Exp.click(focusElement, function(event){
					clickFocus();
					return false;
				}, true);
			}
			
			function clickFocus(event){
				if(disabled)return;
				if(targetChar){
					targetChar = null;
					return;
				}
				focusor.focus();
				keyboardInput.focus(true);
				var lastChild = chars.find('.char:last-child');
				if(lastChild.size()){
					setCuror(lastChild);
					keyboard.setCursor(lastChild.index()+1);
				}
				else{
					setCuror();
					keyboard.setCursor(0);
				}
				return false;
			}
			//清除功能
			var clearObj = {
				init: function(){
					if(this.el){
						Exp.click(this.el, function(){
							keyboardInput.val('');
						});
					}
				},
				el: clear ? $(clearHtml).insertAfter(cursor) : null,
				show: function(){
					if(this.el)this.el.show();
				},
				hide: function(){
					if(this.el)this.el.hide();
				},
				check: function(value){
					if(value.length){
						this.show();
					}
					else{
						this.hide();
					}
				}
			}
			clearObj.init();
			function handleCreateKeyboard(el){
				var keyboardCore =  self.createKeyboard.keyboardCore;
				if(keyboardCore){
					keyboardCore.set({
						type: el.attr('type') || 'tel',
						input: input,
						value: el.val()
					});
				}
				else{
					keyboardCore = Exp.createKeyboard.keyboardCore = Exp.numberKeyboard({
						type: el.attr('type') || 'tel',
						input: input,
						/*background: true,*/
						handleKeyTemple: function(keyTemple){
							keyTemple = '<div class="keyboard-row">'
										+'	<div class="keyboard-char keyboard-bar" data-clickactive ><div>完成</div></div>'
										+'</div>'
										+ keyTemple;
							return keyTemple;
						},
						callback: function(keyboardCore){
							var root = $(this.el);
							keyboardInput.bg = $(this.bg).hide();
							Exp.click(keyboardInput.bg, function(){
								if(keyboardCore.keyboardInput){
									keyboardCore.keyboardInput.blur();
								}
								return false;
							}, true)
							//阻止穿透
							 Exp.click(root, '.keyboard-bar', function(){
								if(keyboardCore.keyboardInput){
									keyboardCore.keyboardInput.blur();
								}
								return false;
							}, true);
							
						}
					});
					Exp.click($(document.body), function(event){
						if(keyboardCore.keyboardInput){
							keyboardCore.keyboardInput.blur();
						}
					}, true);
				}
				keyboardCore.blurInputCursor = function(){
					cursor.hide();
					hasFocus = false;
					if(options.blur){
						options.blur(this.keyboardInput.val());
					}
				}
				if(keyboardCore.keyboardInput){
					keyboardInput.bg = keyboardCore.keyboardInput.bg;
				}
				keyboardCore.keyboardInput = keyboardInput;
				return keyboardCore;
			}
			function input(value, cursor, change){
				if(disabled)return;
				var maxlength = el.attr('maxlength'), points = value.match(/\./g);
				if(maxlength && value.length > maxlength || points && points.length>1){
					var keyboardCore = Exp.createKeyboard && Exp.createKeyboard.keyboardCore;
					if(keyboardCore){
						value = keyboardCore.delete();
						return;
					}
				}
				var l = value.length,
					str = '';
				for(var i=0; i<l; i++){
					str += '<span class="char" style="color:' + color + ';">'+value.charAt(i)+'</span>';
				}
				chars.empty().append(str);
				if(placeholder && !value){
					chars.text(placeholder);
				}
				if(textAlign !== 'right'){
					setCuror(chars.find('.char:nth-child('+ cursor +')'));
				}
				if(change && lastValue !== value){
					el.val(value, true);
					lastValue = value;
					clearObj.check(value);
					el.trigger('input').trigger('change');
					if(Exp.createKeyboard.keyboardCore && Exp.createKeyboard.keyboardCore.keyboardInput){
						Exp.createKeyboard.keyboardCore.keyboardInput.fireEvent('input').fireEvent('change');
					}
					if(options.input){
						options.input(value);
					}
				}
				
			}
			//输入框前置器
			fronterElement = fronterElement || content;
			var fronter = {
				init: function (){
					var positon = Exp.css(fronterElement, 'position');
					if(" relative absolute fixed ".indexOf(' '+ positon +' ') == -1){
						fronterElement.css('position', 'relative');
					}
				},
				fronterElement: fronterElement,
				zIndex: fronterElement && fronterElement.css('z-index'),
				setInputBack: function (){
					if(this.fronterElement)this.fronterElement.css('z-index', this.zIndex);
				},
				setInputFront: function(){
					if(this.fronterElement)this.fronterElement.css('z-index', 1000);
				}
			}
			fronter.init();
			function getKeyboard(setCursorFlag){
				if(!keyboard || setCursorFlag){
					keyboard = handleCreateKeyboard(el);
				}
				return keyboard;
			}
			//内容伸展器
			var contentSpread = {
				el:null,
				parent:$(document.body),
				spread: function(input, target){
					//this.el = $('<div class="keyboard-spread"></div>').appendTo(this.parent);
					var inputOffset = input.offset(),
						targetTop = target.css('top').match(/\-?\d+/)[0] - target.offset().height ,
						subY = inputOffset.top + inputOffset.height + 10  - targetTop - this.parent.css('margin-top').match(/\-?\d+/)[0];
					if(subY > 0){
						this.parent.css({
							'-webkit-transition': 'all 0.4s cubic-bezier(0.07, 0.4, 0.48, 1);',
							'transition': 'all 0.4s cubic-bezier(0.07, 0.4, 0.48, 1);',
							'margin-top': -subY
						})//all 0.4s cubic-bezier(0.74, 1.44, 0.58, 1.13);
					}
				},
				shrink: function(){
					var parent = this.parent;
					parent.css('margin-top', '');
					setTimeout(function(){
						parent.css({
							'-webkit-transition': '',
							'transition': ''
						});
					}, 400);
				},
			};
			//焦点获取器
			var focusor = {
				el: $(document.body),
				focus: function (){

					var others = $('input').not(function(i){
						if(this && this['exp-keyboardInput']){
							return true; 
						}
					})
					others.blur();
					this.el.trigger('click');
					this.el.css('padding-top', 1).css('padding-top', 0);
				},
				blur: function(){
					//this.el.blur();
				}
			}
			
			var hasFocus = false;
			$.extend(keyboardInput, {
				focus: function(){
					if(hasFocus || disabled)return;
					if($('.alert-box').not('.alert-box-valide, .alert-page-keyboard').size() || prevSelector && $(prevSelector).size()){
						return;
					}
					hasFocus = true;
					if(Exp.createKeyboard && Exp.createKeyboard.keyboardCore && keyboardInput != Exp.createKeyboard.keyboardCore.keyboardInput){
						Exp.createKeyboard.keyboardCore.blurInputCursor();
					}
					cursor.show();
					clearObj.check(el.val());
					getKeyboard(true);
					this.bg.show();
					fronter.setInputFront();
					setTimeout(function(){
						keyboard.slideIn();
						setTimeout(function(){contentSpread.spread(el, $(Exp.createKeyboard.keyboardCore.board.alertBox.el));}, 20);
					}, 400);
					if(options.focus){
						options.focus(keyboardInput.val());
					}
					keyboardInput.fireEvent('focus');
					return this;
				},
				blur: function(forceFlag){
					if(!hasFocus)return;
					lastValue = '';
					hasFocus = false;
					cursor.hide();
					this.bg.hide();
					fronter.setInputBack();
					getKeyboard().slideOut({persistent:true});
					setTimeout(function(){contentSpread.shrink(el, $(Exp.createKeyboard.keyboardCore.board.alertBox.el));}, 20);
					if(forceFlag){return this;}
					if(options.blur){
						options.blur(keyboardInput.val());
					}
					keyboardInput.fireEvent('blur');
					return this;
				},
				keyboard: keyboard,
				val: function(value){
					if(arguments.length){
						value =  (value || '') + '';
						if(hasFocus)getKeyboard().val(value);
						else{
							if(typeof value === 'string'){
								input(value, value.length, true);
							}
						}
					}
					else{
						return el.val();
					}
				},
				setCursor: function(index){
					this.focus();
					getKeyboard().setCursor(index);
					return this;
				},
				setDisabled: function(value){
					disabled = !!value;
					if(hasFocus && disabled)this.blur();
					return this;
				},
				hide: function(){
					this.blur(true);
					return this;
				},
				spread: function(){
					if(hasFocus){
						contentSpread.spread(el, $(Exp.createKeyboard.keyboardCore.board.alertBox.el));
					}
				},
				input:el
			});
			//事件继承，托管el的focus和blur事件,供$.blur和$.focus事件
			Exp.extend(keyboardInput, {
				events:{focus:[],blur:[]},
				addEvent: function(name, callback){
					if(' focus blur '.indexOf(' '+name+' ')>=0 && typeof callback == 'function'){
						this.events[name].push(callback);
					}
					return this;
				},
				fireEvent: function(name){
					if(' focus blur '.indexOf(' '+name+' ')>=0){
						var evts = this.events[name];
						evts.forEach(function(e, i){
							e.call(el, {type:name,target:el});
						});
					}
					return this;
				}
				
			});
			keyboardInput.val(initValue);
			el.prop('exp-keyboardInput', keyboardInput);
			return keyboardInput;
		},
		/*
		* 数字键盘
		*/
		numberKeyboard: function(options){
			var el = options.el, 
				type = options.type, 
				inputValue="", 
				keyboard = {},
				cursorIndex = inputValue.length||0,//zjq 修复第二次键盘初始化delete不了
				isSlideIn = false,
				root,
				datas = {
					'tel': {
						list:[
								[{text:'1',value:'1'},{text:'2',value:'2'},{text:'3',value:'3'}],
								[{text:'4',value:'4'},{text:'5',value:'5'},{text:'6',value:'6'}],
								[{text:'7',value:'7'},{text:'8',value:'8'},{text:'9',value:'9'}],
								[{text:'',value:'',keyClass:'keyboard-operator keyboard-point'},
								{text:'0',value:'0'},
								{text:'&nbsp;',value:'delete',keyClass:'keyboard-operator', charClass:'key-clear'}]
							],
						pageSize: 4,
						pageIndex: 0,
						marginTop:0,
						marginBottom:0,
						clickactive:true,
						boardContentClass:'tel-keyboard-box'
					},
					'number': {
						list:[
								[{text:'1',value:'1'},{text:'2',value:'2'},{text:'3',value:'3'}],
								[{text:'4',value:'4'},{text:'5',value:'5'},{text:'6',value:'6'}],
								[{text:'7',value:'7'},{text:'8',value:'8'},{text:'9',value:'9'}],
								[{text:'.',value:'.',keyClass:'keyboard-operator keyboard-point'},
								{text:'0',value:'0'},
								{text:'&nbsp;',value:'delete',keyClass:'keyboard-operator', charClass:'key-clear'}]
							],
						pageSize: 4,
						pageIndex: 0,
						marginTop:0,
						marginBottom:0,
						clickactive:true,
						boardContentClass:'tel-keyboard-box'
					},
					'text': {
						list:[
								[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
									[{text:'q',value:'q'},{text:'w',value:'w'},{text:'e',value:'e'},{text:'r',value:'r'},{text:'t',value:'t'},{text:'y',value:'y'},{text:'u',value:'u'},{text:'i',value:'i'},{text:'o',value:'o'},{text:'p',value:'p'}],
									[{text:'a',value:'a'},{text:'s',value:'s'},{text:'d',value:'d'},{text:'f',value:'f'},{text:'g',value:'g'},{text:'h',value:'h'},{text:'j',value:'j'},{text:'k',value:'k'},{text:'l',value:'l'}],
									[{text:'',value:'upperCase',width: 44,charClass:'func upper',textClickactive:true},{text:'z',value:'z'},{text:'x',value:'x'},{text:'c',value:'c'},{text:'v',value:'v'},{text:'b',value:'b'},{text:'n',value:'n'},{text:'m',value:'m'},{text:'',value:'upperCase',width: 44,charClass:'func upper',textClickactive:true}],
									[{text:'符',value:'mark',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',flex:1.5,fontSize:'16',lineHeight:16,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true,width:42}],
								[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
									[{text:'Q',value:'Q'},{text:'W',value:'W'},{text:'E',value:'E'},{text:'R',value:'R'},{text:'T',value:'T'},{text:'Y',value:'Y'},{text:'U',value:'U'},{text:'I',value:'I'},{text:'O',value:'O'},{text:'P',value:'P'}],
									[{text:'A',value:'A'},{text:'S',value:'S'},{text:'D',value:'D'},{text:'F',value:'F'},{text:'G',value:'G'},{text:'H',value:'H'},{text:'J',value:'J'},{text:'K',value:'K'},{text:'L',value:'L'}],
									[{text:'',value:'lowerCase',width: 44,charClass:'func lower',textClickactive:true},{text:'Z',value:'Z'},{text:'X',value:'X'},{text:'C',value:'C'},{text:'V',value:'V'},{text:'B',value:'B'},{text:'N',value:'N'},{text:'M',value:'M'},{text:'',value:'lowerCase',width: 44,charClass:'func lower',textClickactive:true}],
									[{text:'符',value:'mark',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',flex:1.5,fontSize:'16',lineHeight:16,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true,width:42}],
									[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
								[{text:'[',value:'[',fontSize:'18',lineHeight:18},{text:']',value:']',fontSize:'18',lineHeight:18},{text:'{',value:'{',fontSize:'18',lineHeight:18},{text:'}',value:'}',fontSize:'18',lineHeight:18},{text:'#',value:'#',fontSize:'18',lineHeight:18},{text:'%',value:'%',fontSize:'18',lineHeight:18},{text:'^',value:'^',fontSize:'21',lineHeight:42},{text:'*',value:'*',fontSize:'21',lineHeight:43},{text:'+',value:'+',fontSize:'21',lineHeight:20},{text:'=',value:'=',fontSize:'21',lineHeight:20}],
									[{text:'_',value:'_',fontSize:'18',lineHeight:18},{text:'\\',value:'\\',fontSize:'18',lineHeight:18},{text:'|',value:'|',fontSize:'18',lineHeight:18},{text:'~',value:'~',fontSize:'18',lineHeight:18},{text:'<',value:'<',fontSize:'18',lineHeight:18},{text:'>',value:'>',fontSize:'18',lineHeight:18},{text:'$',value:'$',fontSize:'16',lineHeight:16},{text:'&',value:'&',fontSize:'16',lineHeight:16},{text:',',value:',',fontSize:'21',lineHeight:20}],
									[{text:'-',value:'-',fontSize:'18',lineHeight:18},{text:'/',value:'/',fontSize:'18',lineHeight:18},{text:':',value:':',fontSize:'21',lineHeight:20},{text:';',value:';',fontSize:'21',lineHeight:20},{text:'(',value:'(',fontSize:'18',lineHeight:18},{text:')',value:')',fontSize:'18',lineHeight:18},{text:'"',value:'"',fontSize:'21',lineHeight:20},{text:'?',value:'?',fontSize:'18',lineHeight:18},{text:'!',value:'!',fontSize:'18',lineHeight:18}],
									[{text:'英',value:'lowerCase',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true,width:42},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',fontSize:'16',lineHeight:16,flex:1.5,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true}]
						],
						pageSize: 5,
						pageIndex: 0,
						marginTop:4,
						marginBottom:4,
						clickactive:false,
						boardContentClass:'text-keyboard-box'
					}
				};
			if(el){
				type = el.attr('type') || 'number'; //2种类型：number tel
			}
			var board = Exp.page({
				auto: true,
				rootClass: "alert-page-keyboard",
				position: "bottom",
				html: getKeyboardTemple(type),
				background: !!options.background,
				bgClickReset: false,
				asyncResetCallback: function(){
					if(options.asyncReset){
						options.asyncReset.call(this, keyboard);
					}
				},
				resizeCallback: function(){
					if(isSlideIn){
						keyboard.slideIn();
					}
				},
				alertCallBack:function(){
					root = $(this.el);
					Exp.click(root, function(){
						return false;
					}, true);
					
					Exp.click(root, '.keyboard-char', function(){
						var value = $(this).attr('value');
						if(!value)return;
						var l = value.length;
						if(typeof value == 'string' && value.match(/\d/)){
							value -= 0;
						}
						switch(value){
							case 'delete':
								deleteChar();
								break;
							case 'upperCase':
								changeBoard('text', 1);
								break;
							case 'lowerCase':
								changeBoard('text', 0);
								break;
							case 'mark':
								changeBoard('text', 2);
								break;
							default:
								if(l === 1){
									addChar(value);
								}
								break;
						};
					});
					if(options.callback){
						options.callback.call(this, keyboard);
					}
				}
			});
			function input(keyboard, inputValue, cursorIndex, change){
				if(options.input){
					options.input.call(keyboard, inputValue, cursorIndex, change);
				}
			}
			function addChar(value){
				inputValue = inputValue.substring(0, cursorIndex) + value + inputValue.substring(cursorIndex);
				cursorIndex += (value + '').length;
				input(keyboard, inputValue, cursorIndex, true);
				return inputValue;
			}
			function deleteChar(){
				if(inputValue.length){
					inputValue = inputValue.substr(0, cursorIndex - 1)+ inputValue.substring(cursorIndex);
					if(cursorIndex>0){
						cursorIndex -= 1;
					}
				}
				input(keyboard, inputValue, cursorIndex, true);
				return inputValue;
			}
			function getKeyboardTemple(type, index){


				var temple = '<div class="keyboard-box {{boardContentClass}}">',
					keyTemple = '{{each list as row i}}'
					+'{{if i>=pageSize*pageIndex && i<pageSize*(pageIndex+1)}}'
					+'<div class="keyboard-row">'
					+'{{each row as item}}'
					+'<div class="keyboard-char {{item.keyClass}}" {{if item.value && (item.clickactive || clickactive)}}data-clickactive{{/if}} value="{{item.value}}" style="height:{{height}}px;{{if item.flex}}flex:{{item.flex}};-webkit-flex: {{item.flex}};-webkit-box-flex:{{item.flex}};{{/if}}{{if item.width}}width:{{item.width}}px;{{/if}}"><div class="spot {{item.charClass}}" style="height:{{height-marginTop-marginBottom}}px;line-height:{{height-marginTop-marginBottom}}px;{{if item.fontSize}}font-size:{{item.fontSize}}px;{{/if}}{{if item.lineHeight}}line-height:{{item.lineHeight}}px;{{/if}}" {{if item.textClickactive}}data-clickactive{{/if}}>{{item.text}}</div></div>'
					+'{{/each}}'
					+'</div>'
					+'{{/if}}'
					+'{{/each}}',
					keyData = datas[type];
				var winWidth = $(window).width();
				keyData.height = winWidth>640?70:(winWidth/7);//修改 zjq提高按钮高度
				keyData.pageIndex = index || 0;
				keyTemple = template.render(keyTemple)(keyData);
				if(options && options.handleKeyTemple){
					keyTemple = options.handleKeyTemple(keyTemple);
				}
				keyTemple = template.render(temple)(keyData) + keyTemple;
				
				return keyTemple + '</div>';
			}
			
			function changeBoard(type, index){
				var html = getKeyboardTemple(type, index);
				root.html(html);
				Exp.clickActive(root);
				keyboard.resite();
				var boardClass = datas[type].boardClass;
				if(!boardClass && board.boardClass){
					refresh()
				}
				else if(boardClass != board.boardClass){
					refresh(true);
				}
				function refresh(delay){
					var lastClass = board.boardClass;
					if(delay){
						setTimeout(refreshData, 400);
					}
					else{
						refreshData();
					}
					board.boardClass = boardClass;
					function refreshData(){
						if(lastClass){
							root.removeClass(lastClass);
						}
						if(boardClass){
							root.addClass(boardClass);
						}
					}
				}
				
			}
			
			$.extend(keyboard,{
				board: board,
				val: function(value){
					var change = false;
					if(typeof value === 'string'){
						if(inputValue !== value)change = true;
						inputValue = value;
						cursorIndex = inputValue.length;
						input(keyboard, inputValue, cursorIndex, change);
					}
					return inputValue;
				},
				'delete': deleteChar,
				slideIn: function(){
					isSlideIn = true;
					var rHeight = root.height();
					var height = root.find('.keyboard-box').height();
					root.height(height);
					board.slideIn({to: height});
					return this;
				},
				slideOut: function(options){
					isSlideIn = false;
					board.slideOut(options);
					return this;
				},
				resite: function(){
					if(isSlideIn){
						this.slideIn();
					}
					else{
						this.slideOut({persistent:true});
					}
					return this;
				},
				setCursor: function(index){
					cursorIndex = index;
					input(keyboard, inputValue, cursorIndex, false);
					return this;
				},
				set: function(settings){
					if(settings){
						for(var name in settings){
							var value = settings[name];
							switch(name){
								case 'type':
									changeBoard(value);
									break;
								case 'input':
									options.input = value;
									break;
								case 'value':
									this.val(value);
									break;
								case 'cursor':
									this.setCursor(value);
									break;
							}
						}
					}
					
					return this;
				}
			});
			
			return keyboard;
		},
		/*
		* 带繁简密输入框的键盘   zjq
		*/
		pwdWithKeyboard: function(options){
			var el = options.el, 
				type = options.type, 
				pwdtype = options.pwdtype||"complex",
				inputValue="", 
				keyboard = {},
				cursorIndex = inputValue.length||0,//zjq 修复第二次键盘初始化delete不了
				isSlideIn = false,
				root,
				datas = {
					'tel': {
						list:[
								[{text:'1',value:'1'},{text:'2',value:'2'},{text:'3',value:'3'}],
								[{text:'4',value:'4'},{text:'5',value:'5'},{text:'6',value:'6'}],
								[{text:'7',value:'7'},{text:'8',value:'8'},{text:'9',value:'9'}],
								[{text:'',value:'',keyClass:'keyboard-operator keyboard-point'},
								{text:'0',value:'0'},
								{text:'&nbsp;',value:'delete',keyClass:'keyboard-operator', charClass:'key-clear'}]
							],
						pageSize: 4,
						pageIndex: 0,
						marginTop:0,
						marginBottom:0,
						clickactive:true,
						boardContentClass:'tel-keyboard-box'
					},
					'number': {
						list:[
								[{text:'1',value:'1'},{text:'2',value:'2'},{text:'3',value:'3'}],
								[{text:'4',value:'4'},{text:'5',value:'5'},{text:'6',value:'6'}],
								[{text:'7',value:'7'},{text:'8',value:'8'},{text:'9',value:'9'}],
								[{text:'.',value:'.',keyClass:'keyboard-operator keyboard-point'},
								{text:'0',value:'0'},
								{text:'&nbsp;',value:'delete',keyClass:'keyboard-operator', charClass:'key-clear'}]
							],
						pageSize: 4,
						pageIndex: 0,
						marginTop:0,
						marginBottom:0,
						clickactive:true,
						boardContentClass:'tel-keyboard-box'
					},
					'text': {
						list:[
								[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
									[{text:'q',value:'q'},{text:'w',value:'w'},{text:'e',value:'e'},{text:'r',value:'r'},{text:'t',value:'t'},{text:'y',value:'y'},{text:'u',value:'u'},{text:'i',value:'i'},{text:'o',value:'o'},{text:'p',value:'p'}],
									[{text:'a',value:'a'},{text:'s',value:'s'},{text:'d',value:'d'},{text:'f',value:'f'},{text:'g',value:'g'},{text:'h',value:'h'},{text:'j',value:'j'},{text:'k',value:'k'},{text:'l',value:'l'}],
									[{text:'',value:'upperCase',width: 44,charClass:'func upper',textClickactive:true},{text:'z',value:'z'},{text:'x',value:'x'},{text:'c',value:'c'},{text:'v',value:'v'},{text:'b',value:'b'},{text:'n',value:'n'},{text:'m',value:'m'},{text:'',value:'upperCase',width: 44,charClass:'func upper',textClickactive:true}],
									[{text:'符',value:'mark',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',flex:1.5,fontSize:'16',lineHeight:16,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true,width:42}],
								[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
									[{text:'Q',value:'Q'},{text:'W',value:'W'},{text:'E',value:'E'},{text:'R',value:'R'},{text:'T',value:'T'},{text:'Y',value:'Y'},{text:'U',value:'U'},{text:'I',value:'I'},{text:'O',value:'O'},{text:'P',value:'P'}],
									[{text:'A',value:'A'},{text:'S',value:'S'},{text:'D',value:'D'},{text:'F',value:'F'},{text:'G',value:'G'},{text:'H',value:'H'},{text:'J',value:'J'},{text:'K',value:'K'},{text:'L',value:'L'}],
									[{text:'',value:'lowerCase',width: 44,charClass:'func lower',textClickactive:true},{text:'Z',value:'Z'},{text:'X',value:'X'},{text:'C',value:'C'},{text:'V',value:'V'},{text:'B',value:'B'},{text:'N',value:'N'},{text:'M',value:'M'},{text:'',value:'lowerCase',width: 44,charClass:'func lower',textClickactive:true}],
									[{text:'符',value:'mark',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',flex:1.5,fontSize:'16',lineHeight:16,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true,width:42}],
									[{text:'1',value:'1',fontSize:'23'},{text:'2',value:'2',fontSize:'23'},{text:'3',value:'3',fontSize:'23'},{text:'4',value:'4',fontSize:'23'},{text:'5',value:'5',fontSize:'23'},{text:'6',value:'6',fontSize:'23'},{text:'7',value:'7',fontSize:'23'},{text:'8',value:'8',fontSize:'23'},{text:'9',value:'9',fontSize:'23'},{text:'0',value:'0',fontSize:'23'}],
								[{text:'[',value:'[',fontSize:'18',lineHeight:18},{text:']',value:']',fontSize:'18',lineHeight:18},{text:'{',value:'{',fontSize:'18',lineHeight:18},{text:'}',value:'}',fontSize:'18',lineHeight:18},{text:'#',value:'#',fontSize:'18',lineHeight:18},{text:'%',value:'%',fontSize:'18',lineHeight:18},{text:'^',value:'^',fontSize:'21',lineHeight:42},{text:'*',value:'*',fontSize:'21',lineHeight:43},{text:'+',value:'+',fontSize:'21',lineHeight:20},{text:'=',value:'=',fontSize:'21',lineHeight:20}],
									[{text:'_',value:'_',fontSize:'18',lineHeight:18},{text:'\\',value:'\\',fontSize:'18',lineHeight:18},{text:'|',value:'|',fontSize:'18',lineHeight:18},{text:'~',value:'~',fontSize:'18',lineHeight:18},{text:'<',value:'<',fontSize:'18',lineHeight:18},{text:'>',value:'>',fontSize:'18',lineHeight:18},{text:'$',value:'$',fontSize:'16',lineHeight:16},{text:'&',value:'&',fontSize:'16',lineHeight:16},{text:',',value:',',fontSize:'21',lineHeight:20}],
									[{text:'-',value:'-',fontSize:'18',lineHeight:18},{text:'/',value:'/',fontSize:'18',lineHeight:18},{text:':',value:':',fontSize:'21',lineHeight:20},{text:';',value:';',fontSize:'21',lineHeight:20},{text:'(',value:'(',fontSize:'18',lineHeight:18},{text:')',value:')',fontSize:'18',lineHeight:18},{text:'"',value:'"',fontSize:'21',lineHeight:20},{text:'?',value:'?',fontSize:'18',lineHeight:18},{text:'!',value:'!',fontSize:'18',lineHeight:18}],
									[{text:'英',value:'lowerCase',width:42,charClass:'func',fontSize:'18',lineHeight:18,textClickactive:true,width:42},{text:'.',value:'.',fontSize:'21',lineHeight:20,flex:1.5,width:42},{text:'space',value:'&nbsp;',flex:4,fontSize:'16',lineHeight:16,textClickactive:true},{text:'@',value:'@',fontSize:'16',lineHeight:16,flex:1.5,width:42},{text:'',value:'delete',width: 42,charClass:'func',charClass:'func delete',textClickactive:true}]
						],
						pageSize: 5,
						pageIndex: 0,
						marginTop:4,
						marginBottom:4,
						clickactive:false,
						boardContentClass:'text-keyboard-box'
					}
				},
				confirmBtn = $('.alert-page-keyboard').find('.confirm');
			if(el){
				type = el.attr('type') || 'number'; //2种类型：number tel
			}
			// 加背景框
			// var body = document.body;
			// var _height = $(window).height()>Exp.position.scrollHeight() ? $(window).height():Exp.position.scrollHeight();
			// var bg = '<div class="alert-box-bg alert-box-bg-custom alert-bg-anim" style="height:'+_height+'px;width:'+document.documentElement.scrollWidth+'px"></div>';
			// body.insertAdjacentHTML('beforeend', bg);

			var board = Exp.page({
				auto: true,
				rootClass: "alert-page-keyboard pop-password-box",
				position: "bottom",
				html: getPwdKeyboardTemple(type,pwdtype),
				background: !!options.background,
				bgClickReset: false,// 点击背景框不reset
				asyncResetCallback: function(){
					if(options.asyncReset){
						options.asyncReset.call(this, keyboard);
					}
				},
				resizeCallback: function(){
					if(isSlideIn){
						keyboard.slideIn();
					}
				},
				alertCallBack:function(){
					root = $(this.el);
					Exp.click(root, function(){
						return false;
					}, true);
					Exp.click(root, '.keyboard-char', function(){
						var value = $(this).attr('value');
						if(!value)return;
						var l = value.length;
						//  string to number
						if(typeof value == 'string' && value.match(/\d/)){
							value -= 0;
						}
						switch(value){
							case 'delete':
								deleteChar();
								break;
							case 'upperCase':
								changeBoard('text', 1);
								break;
							case 'lowerCase':
								changeBoard('text', 0);
								break;
							case 'mark':
								changeBoard('text', 2);
								break;
							default:
								if(l === 1){
									addChar(value);
								}
								break;
						};
					});
					if(options.callback){
						options.callback.call(this, keyboard);
					}	
				}
			});
			function input(keyboard, inputValue, cursorIndex, change){
				if(options.input){
					options.input.call(keyboard, inputValue, cursorIndex, change);
				}
			}
			function addChar(value){
				inputValue = inputValue.substring(0, cursorIndex) + value + inputValue.substring(cursorIndex);
				cursorIndex += (value + '').length;
				input(keyboard, inputValue, cursorIndex, true);
				return inputValue;
			}
			function deleteChar(){
				if(inputValue.length){
					inputValue = inputValue.substr(0, cursorIndex - 1)+ inputValue.substring(cursorIndex);
					if(cursorIndex>0){
						cursorIndex -= 1;
					}
				}
				input(keyboard, inputValue, cursorIndex, true);
				return inputValue;
			}
			/**
			 * [getKeyboardTemple 键盘]
			 * @author zhangjiqi
			 * @param  {[type]} type  [数字键盘or文本键盘]
			 * @param  {[type]} index [description]
			 * @return {[type]}       [description]
			 */
			function getKeyboardTemple(type, index){
				var temple = '<div class="keyboard-box {{boardContentClass}}">',
					keyTemple = '{{each list as row i}}'
					+'{{if i>=pageSize*pageIndex && i<pageSize*(pageIndex+1)}}'
					+'<div class="keyboard-row">'
					+'{{each row as item}}'
					+'<div class="keyboard-char {{item.keyClass}}"  {{if item.value && boardContentClass== "tel-keyboard-box"}}data-clickactive{{/if}} value="{{item.value}}" style="height:{{height}}px;{{if item.flex}}flex:{{item.flex}};-webkit-flex: {{item.flex}};-webkit-box-flex:{{item.flex}};{{/if}}{{if item.width}}width:{{item.width}}px;{{/if}}"><div class="spot {{item.charClass}}" style="height:{{height-marginTop-marginBottom}}px;line-height:{{height-marginTop-marginBottom}}px;{{if item.fontSize}}font-size:{{item.fontSize}}px;{{/if}}{{if item.lineHeight}}line-height:{{item.lineHeight}}px;{{/if}}" {{if item||item.textClickactive}}data-clickactive{{/if}}>{{item.text}}</div></div>'
					+'{{/each}}'
					+'</div>'
					+'{{/if}}'
					+'{{/each}}',
					keyData = datas[type];
				var winWidth = $(window).width();
				keyData.height = winWidth>640?80:(winWidth/7);//修改 zjq提高按钮高度
				keyData.pageIndex = index || 0;
				keyTemple = template.render(keyTemple)(keyData);
				if(options && options.handleKeyTemple){
					keyTemple = options.handleKeyTemple(keyTemple);
				}
				keyTemple = template.render(temple)(keyData) + keyTemple;
				// alert('确认');
				return keyTemple + '</div>';
			}
			/**
			 * [getPwdKeyboardTemple 密码框]
			 * @author zhangjiqi
			 * @param  {[string]} type    [数字键盘or文本键盘]
			 * @param  {[string]} pwdtype [繁密or简密]
			 * @param  {[type]} index   [description]
			 * @return {[string]}         [html]
			 */
			function getPwdKeyboardTemple(type, pwdtype, index){
				switch(pwdtype){
					case 'easy':
						var pwd = '<div class="pwd-area"><div class="pwd-header">'
						+'<span class="close"></span>'
						+'<p class="pwdtitle">支付密码</p>'
						+'<span class="pwd-lost-forget">忘记密码</span>'
						+'</div>'
						+'<div class="pwd-content">'
						+'<div class="pwd-box">'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'<div class="pwd-char-box"><div class="blank"></div></div>'
						+'</div>'
						+'</div>'
						+'<div class="pop-button">'
						// +'<a href="javascript:void(0);" class="close" data-clickactive>取消</a>'
						+'<a href="javascript:void(0);" class="confirm invalide" data-clickactive="change" data-clickforbidden>确&nbsp;定</a>'
						+'</div></div>';
						return pwd + getKeyboardTemple(type, index);
						break;
					case 'complex':
						var pwd = '<div class="pwd-area"><div class="pwd-header">'
						+'<span class="close"></span>'
						+'<p class="pwdtitle">支付密码</p>'
						+'<span class="pwd-lost-forget">忘记密码</span>'
						+'</div>'
						+'<div class="pwd-content">'
						+'<div class="pwd-box">'
						+'<input class="pwd-input" type="password">'
						+'</div>'
						+'</div>'
						+'<div class="pop-button">'
						// +'<a href="javascript:void(0);" class="close" data-clickactive>取消</a>'
						+'<a href="javascript:void(0);" class="confirm invalide" data-clickactive="change" data-clickforbidden>确&nbsp;定</a>'
						+'</div></div>';
						return pwd + getKeyboardTemple(type, index);
						break;
				}
			}
			
			function changeBoard(type, index){
				var html = getKeyboardTemple(type, index);
				// 局部刷新键盘
				root.find('.pwd-area').next().html(html);
				Exp.clickActive(root);
				keyboard.resite();
				var boardClass = datas[type].boardClass;
				if(!boardClass && board.boardClass){
					refresh()
				}
				else if(boardClass != board.boardClass){
					refresh(true);
				}
				function refresh(delay){
					var lastClass = board.boardClass;
					if(delay){
						setTimeout(refreshData, 400);
					}
					else{
						refreshData();
					}
					board.boardClass = boardClass;
					function refreshData(){
						if(lastClass){
							root.removeClass(lastClass);
						}
						if(boardClass){
							root.addClass(boardClass);
						}
					}
				}
				
			}
			
			$.extend(keyboard,{
				board: board,
				val: function(value){
					var change = false;
					if(typeof value === 'string'){
						if(inputValue !== value)change = true;
						inputValue = value;
						cursorIndex = inputValue.length;
						input(keyboard, inputValue, cursorIndex, change);
					}
					return inputValue;
				},
				'delete': deleteChar,
				slideIn: function(){
					isSlideIn = true;
					var rHeight = root.height();
					// var height = root.find('.keyboard-box').height();
					var height = root.find('.alert-page-keyboard').height();
					root.height(height);
					board.slideIn({to: height});
					return this;
				},
				slideOut: function(options){
					isSlideIn = false;
					board.slideOut(options);
					return this;
				},
				resite: function(){
					if(isSlideIn){
						this.slideIn();
					}
					else{
						this.slideOut({persistent:true});
					}
					return this;
				},
				setCursor: function(index){
					cursorIndex = index;
					input(keyboard, inputValue, cursorIndex, false);
					return this;
				},
				set: function(settings){
					if(settings){
						for(var name in settings){
							var value = settings[name];
							switch(name){
								case 'type':
									changeBoard(value);
									break;
								case 'input':
									options.input = value;
									break;
								case 'value':
									this.val(value);
									break;
								case 'cursor':
									this.setCursor(value);
									break;
							}
						}
					}
					
					return this;
				}
			});
			
			return keyboard;
		}
	}
	
	var orginFocus = $.fn.focus, 
		orginBlur = $.fn.blur, 
		orginTrigger = $.fn.trigger,
		orginOn = $.fn.on,
		orginVal = $.fn.val;
	
	//对focus和blur功能重写
	$.fn.focus = function(){
		var self = this, args = arguments;
		this.forEach(function(e, i){
			e = $(e);
			var keyboardInput = $(e).prop('exp-keyboardInput');
			if(keyboardInput){
				if(args.length){
					keyboardInput.addEvent('focus', args[0]);
				}
				else{
					keyboardInput.focus();
				}
			}
			else{
				orginFocus.apply(e, e);
			}
		});
		return this;
	}
	$.fn.blur = function(){
		var self = this, args = arguments;
		this.forEach(function(e, i){
			e = $(e);
			var keyboardInput = $(e).prop('exp-keyboardInput');
			if(keyboardInput){
				if(args.length){
					keyboardInput.addEvent('blur', args[0]);
				}
				else{
					keyboardInput.blur();
				}
			}
			else{
				orginBlur.apply(e, args);
			}
		});
		return this;
	}
	$.fn.trigger = function(name){
		var self = this;
		this.forEach(function(e, i){
			e = $(e);
			var keyboardInput = $(e).prop('exp-keyboardInput')
			if(keyboardInput && 'focus blur '.indexOf(name)>=0){
				keyboardInput.fireEvent(name);
			}
			else{
				orginTrigger.call(e, name);
			}
		});
		return this;
	}
	$.fn.on = function(name, callback){
		var keyboardInput = this.prop('exp-keyboardInput')
		if(keyboardInput && 'focus blur '.indexOf(name)>=0){
			keyboardInput.addEvent(name, callback);
		}
		else{
			orginOn.apply(this, arguments);
		}
		return this;
	}
	$.fn.val = function(){
		var keyboardInput = this.prop('exp-keyboardInput');
		if(keyboardInput){
			if(arguments.length){
				if(arguments[1] === true){
					orginVal.call(this, arguments[0]);
				}
				else{
					keyboardInput.val(arguments[0]);
				}
				return this;
			}
			else{
				return orginVal.call(this);
			}
		}
		else{
			return orginVal.apply(this, arguments);
		}
	}
	Exp.extend(Exp, keyboard);
})($, template, Exp);