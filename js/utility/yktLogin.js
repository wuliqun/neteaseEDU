!function(_){
	var template = '<div class="m-login">\
		<div class="mask f-pf"></div>\
		<div class="login f-pa">\
			<div class="close f-pa" title="关闭"></div>\
			<div class="login-box f-cb">\
				<div class="log f-fl">\
					<div class="tit f-cb">\
						<p class="email cur f-fl">网易邮箱登录</p>\
						<p class="phone f-fl">手机号登录</p>\
					</div>\
					<div class="form">\
						<form class="email">\
							<fieldset>\
								<div class="in user f-cb f-pr">\
									<span class="ico f-fl">+86</span>\
									<input class="f-fl" id="account" type="text" autocomplete="off" name="email">\
									<i class="clear novisi f-fr"></i>\
									<label class="holder f-pa" for="account"></label>\
								</div>\
								<div class="in pass f-cb f-pr">\
									<span class="ico f-fl"></span>\
									<input class="f-fl" id="password" type="password" name="password">\
									<i class="clear novisi f-fr"></i>\
									<label class="holder f-pa" for="password"></label>\
								</div>\
								<div class="error hide"></div>\
								<div class="submit disabled">\
									<input type="submit" value="登录">\
								</div>\
								<div class="unlogin f-cb">\
									<input type="checkbox" checked name="keep" id="keep">\
									<label class="checked f-fl" for="keep">\
										<span></span>十天内免登陆\
									</label>\
									<a href="#" class="forget f-fl">忘记密码？</a>\
									<a href="#" class="regist f-fr">去注册</a>\
								</div>\
							</fieldset>\
						</form>\
					</div>\
				</div>\
				<div class="social f-fr">\
					<span class="or f-pa">或</span>\
					<ul>\
						<li><a href="#" class="wechat"></a></li>\
						<li><a href="#" class="weibo"></a></li>\
						<li><a href="#" class="qq"></a></li>\
						<li><a href="#" class="renren"></a></li>\
						<li><a href="#" class="icourse"></a></li>\
					</ul>\
				</div>\
			</div>\
		</div>\
	</div>',
		errMsg = ['0','请输入用户名','账号格式错误','请输入密码','手机号不能为空',
		'请输入正确格式的手机号','密码不能为空','请输入正确的账号/密码'];
	/**
	 * [YktLogin 云课堂登录组件]
	 * options = {
	 * 	   method:请求方式,默认POST
	 * 	   asyn:是否异步无刷新登陆,默认true
	 * 	   action:请求地址,
	 * 	   container:默认body 	   
	 * }
	 */
	function YktLogin(options){
		this.body = this._layout.cloneNode(true);
		this.login = $('.login',this.body);
		this.mask = $('.mask',this.body);
		this.close = $('.close',this.body);
		this.emailLog = $('.tit .email',this.body);
		this.phoneLog = $('.tit .phone',this.body);
		this.form = $('form',this.body);
		this.error = $('.error',this.body);
		this.keepLabel = $('.unlogin label',this.body);
		this.submitBox = $('.submit',this.body);
		this.submit = this.submitBox.children[0];
		this.userInput = {
			box:$('.user',this.body),
			input:$('.user input',this.body),
			label:$('.user label',this.body),
			clear:$('.user .clear',this.body)
		};
		this.passInput = {
			box:$('.pass',this.body),
			input:$('.pass input',this.body),
			label:$('.pass label',this.body),
			clear:$('.pass .clear',this.body)
		};
		options = options || {};
		_.extend(options,{
			asyn:!0,
			method:'POST',
			container:document.body
		});
		_.extend(this,options);
		if(!this.asyn){//非异步登陆,将method,action写入form
			this.form.method = this.method;
			this.form.action = this.action;
		}		
		this._initEvents();
	}
	_.extend(YktLogin.prototype,_.emiter);
	_.extend(YktLogin.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			//初始化
			this.userInput.input.value = '';
			this.userInput.input.name = 'email';
			this.passInput.input.value = '';
			util.addClass(this.error,'hide');
			util.delClass(this.phoneLog,'cur');
			util.addClass(this.emailLog,'cur');
			this.userInput.label.innerHTML = '常用邮箱或网易邮箱';
			this.passInput.label.innerHTML = '密码';
			util.addClass(this.error,'hide');
			util.delClass(this.userInput.box,'err');
			util.delClass(this.passInput.box,'err');
			this.form.className = 'email';
			util.delClass(this.userInput.label,'novisi');
			util.delClass(this.passInput.label,'novisi');
			util.addClass(this.submitBox,'disabled');
		},
		_initEvents:function(){
			//输入事件
			util.addEvent(this.userInput.input,'input',this._input.bind(this,this.userInput));
			util.addEvent(this.passInput.input,'input',this._input.bind(this,this.passInput));
			util.addEvent(this.userInput.input,'propertychange',this._input.bind(this,this.userInput));
			util.addEvent(this.passInput.input,'propertychange',this._input.bind(this,this.passInput));
			//focus blur事件
			util.addEvent(this.userInput.input,'focus',this._focus.bind(this,this.userInput));
			util.addEvent(this.userInput.input,'blur',this._focus.bind(this,this.userInput));
			util.addEvent(this.passInput.input,'focus',this._focus.bind(this,this.passInput));
			util.addEvent(this.passInput.input,'blur',this._focus.bind(this,this.passInput));
			//更改登录方式
			util.addEvent(this.emailLog,'click',this._titClick.bind(this,this.emailLog));
			util.addEvent(this.phoneLog,'click',this._titClick.bind(this,this.phoneLog));
			//点击清除
			util.addEvent(this.userInput.clear,'click',this._clear.bind(this,this.userInput));
			util.addEvent(this.passInput.clear,'click',this._clear.bind(this,this.passInput));
			//点击十天免登陆
			util.addEvent(this.keepLabel,'click',this._checkKeep.bind(this));
			//关闭
			util.addEvent(this.close,'click',this.hide.bind(this));
			util.addEvent(this.mask,'click',this.hide.bind(this));
			//提交
			util.addEvent(this.form,'submit',this._submit.bind(this));
		},
		show:function(){
			this._init();
			this.container.appendChild(this.body);
			var top = (this.mask.offsetHeight - this.login.offsetHeight)/2,
			scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			top = top < 0 ? 0 : top;
			this.login.style.top = top + scrollTop + 'px';
		},
		hide:function(){
			if(this.body.parentNode){
				this.body.parentNode.removeChild(this.body);
			}
		},
		_checkKeep:function(){
			util.toggleClass(this.keepLabel,'checked')
		},
		_input:function(inputBox){
			if(!inputBox.input.value){
				util.delClass(inputBox.label,'novisi');
				util.addClass(inputBox.clear,'novisi');
			}else{
				util.addClass(inputBox.label,'novisi');
				util.delClass(inputBox.clear,'novisi');
			}
			if(!!this.userInput.input.value && !!this.passInput.input.value){
				util.delClass(this.submitBox,'disabled');
			}else{
				util.addClass(this.submitBox,'disabled');
			}
		},
		//获得或失去焦点
		_focus:function(inputBox){
			var input = inputBox.input;
			if(document.activeElement === input){
				util.addClass(inputBox.box,'focus');
				if(inputBox.box.className.indexOf('err') >= 0){
					util.delClass(inputBox.box,'err');
					util.addClass(this.error,'hide');
				}
				if(input.value){
					util.delClass(inputBox.clear,'novisi');
				}
			}else{
				util.delClass(inputBox.box,'focus');
				//防止clear点击不到
				setTimeout(function(){
					//判断是否重新获得了焦点
					if(document.activeElement !== input){						
						if(input.value){
							util.addClass(inputBox.clear,'novisi');
						}
					}
				},200);
			}
		},
		_titClick:function(tit){
			if(tit.className.indexOf('cur') < 0){
				this._init();  //先初始化
				if(tit === this.phoneLog){
					util.delClass(this.emailLog,'cur');
					util.addClass(tit,'cur');
					this.form.className = 'phone';
					this.userInput.input.name = 'phone';
					this.userInput.label.innerHTML = '请输入手机号';
					this.passInput.label.innerHTML = '请输入密码';
				}
			}
		},
		_clear:function(inputBox){
			inputBox.input.value = '';
			util.addClass(inputBox.clear,'novisi');
			util.delClass(inputBox.label,'novisi');
			inputBox.input.focus();
		},
		//验证 返回信息  0 成功
		// 1请输入用户名,2账号格式错误,3请输入密码  email登录
		// 4 手机号不能为空 5请输入正确格式的手机号 6密码不能为空 7请输入正确的账号密码
		_validate:function(user,pass,logWay){
			if(logWay === 'email'){
				if(!user){
					return 1;
				}else{
					if(!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(user)){
						return 2;
					}else{
						if(!pass){//密码仅作不为空验证
							return 3;
						}
					}
				}
			}else{
				if(!user){
					return 4;
				}else{
					if(!/^1[34578]\d{9}$/.test(user)){
						return 5;
					}else{
						if(!pass){
							return 6;
						}else{
							if(pass.length < 6){//长度不足
								return 7;
							}
						}
					}
				}
			}
			return 0;
		},
		//提交禁用时点击
		_submit:function(e){
			var user = this.userInput.input.value,
				pass = this.passInput.input.value,
				logWay = this.form.className,//邮箱还是手机号登录
				valiCode = this._validate(user,pass,logWay);
			if(valiCode > 0){
				util.preventDft(e);
				util.delClass(this.error,'hide');
				this.error.innerHTML = '<p>'+errMsg[valiCode]+'</p>';
				if(valiCode >= 6 || valiCode === 3){//密码验证失败
					util.addClass(this.passInput.box,'err');
				}else{//用户名验证不通过
					util.addClass(this.userInput.box,'err');
				}
			}else{
				if(this.asyn){//异步登录
					util.preventDft(e);
					// var data = {password:pass};
					// data[logWay] = user;  //需设置form的className与字段name相同
					// util.ajax({
					// 	url:this.action,
					// 	method:this.method,
					// 	data:data,
					// 	sucCallback:this._ajaxSuc,
					// 	failCallback:this._ajaxFail
					// });
					window.confirm('没有接口,不能请求登录');
				}
			}			
		}
	});
	window.YktLogin = YktLogin;
}(util)