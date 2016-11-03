(function(_){
	var template = 
	'<div class="m-login f-pf">\
		<div class="align"></div><div class="login-win f-pr">\
			<div class="close-login f-pa">x</div>\
			<div class="login-box">\
				<div class="title">登陆网易云课堂</div>\
				<div class="logfail"></div>\
				<form method="post">\
					<div class="iptbox">\
						<input type="text" name="userName" placeholder="账号"/>\
						<div class="ipterr user-err"></div>\
					</div>\
					<div class="iptbox">\
						<input type="password" name="password" placeholder="密码"/>\
						<div class="ipterr pass-err"></div>\
					</div>\
					<div class="submit"><input type="submit" value="登录"/></div>\
				</form>\
			</div>\
		</div>\
	</div>';
	/**
	 * options={
	 * 	  title:...,顶部标题,可在show()时传入
	 * 	  action:...,登录请求地址 required !!
	 * 	  method:...登录请求方式,默认POST
	 * 	  asyn:...是否异步无刷新登录,默认true 	  
	 * }
	 * 如果添加userRegex passRegex errorMsg etc...通用性更强
	 */
	function LoginWin(options){
		this.body = this._layout.cloneNode(true);
		this.head = $('.title',this.body);
		this.close = $('.close-login',this.body);
		this.form = $('form',this.body);
		this.iptUser = this.form[0];
		this.iptPass = this.form[1];
		this.submit = this.form[2];
		this.logfail = $('.logfail',this.body);
		this.userError = $('.user-err',this.body);
		this.passError = $('.pass-err',this.body);
		_.extend(this,options);
		this._init();
		this._initEvents();
		
	}
	_.extend(LoginWin.prototype,_.emiter);
	_.extend(LoginWin.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			this.asyn = this.asyn === undefined?!0:this.asyn;
			!this.method && (this.method = 'POST');
			if(!this.asyn){//不用ajax,form添加属性
				this.form.action = this.action;
				this.form.method = this.method;
			}
		},
		// 可以自定义标题
		_setTitle:function(title){
			if(!title) return ;
			this.head.innerHTML = title;
		},
		show:function(title){
			title = title||this.title;
			this._setTitle(title);
			this.container = this.container || document.body;
			this.container.appendChild(this.body);
		},
		hide:function(){
			this.container.removeChild(this.body);
		},
		//user/pass输入框验证
		_validate:function(user,pass){
			var userReg = /^[A-Za-z0-9][\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{5,19}$/,
				passReg = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/;
			if(userReg.test(user)&&passReg.test(pass)){
				return !0;//验证成功
			}
			if(!userReg.test(user)){
				_.addClass(this.iptUser,'invalid');
				_.addClass(this.userError,'z-act');
				if(!user){					
					this.userError.innerHTML='账号不能为空!';
				}else{
					this.userError.innerHTML='账号格式不正确!';
				}
			}
			if(!passReg.test(pass)){
				_.addClass(this.iptPass,'invalid');
				_.addClass(this.passError,'z-act');
				if(!pass){
					this.passError.innerHTML='密码不能为空!';
				}else{
					this.passError.innerHTML='密码格式不正确!';
				}
			}			
			return !1;
		},
		//input获取焦点时,去掉红色边框和错误信息
		_focus:function(ipt){
			_.delClass(ipt,'invalid');
			switch(ipt){
			case this.iptUser:
				_.delClass(this.userError,'z-act');
				break;
			case this.iptPass:
				_.delClass(this.passError,'z-act');
				break;
			}
		},
		//登录 
		_login:function(e){
			e = e || window.event;
			this.submit.disabled = !0;			
			var user = this.iptUser.value.trim(),
				pass = this.iptPass.value.trim();
			if(this._validate(user,pass)){
				var md5User=_.md5(user),
					md5Pass=_.md5(pass);
				if(this.asyn){//ajax 异步登录
					_.preventDft(e);					
					_.ajax({
						url:this.action,
						method:this.method,
						data:{userName:md5User,password:md5Pass},
						sucCallback:this._ajaxSuc.bind(this),
						failCallback:this._ajaxFail.bind(this)
					});
				}else{//用MD5替换user/pass,直接登录
					this.iptUser.value = md5User;
					this.iptPass.value = md5Pass;
				}
			}else{
				_.preventDft(e);
				this.submit.disabled = !1;
			}
		},
		_ajaxSuc:function(data){
			if(data == '1'){
				this.emit('loginSuc');
				this.hide();
			}else{
				this.logfail.innerHTML = '用户名或密码错误！';
			}
			this.submit.disabled = !1;
		},
		_ajaxFail:function(){
			this.logfail.innerHTML = '网络请求失败,请稍后重试。';
			this.submit.disabled = !1;
		},
		//兼容placeholder
		_placeholder:function(){
			//type不能修改,创建input代替密码框显示placeholder
			var input = document.createElement('input');
			if(!('placeholder' in input)){
				_.addClass(this.iptUser,'placeholder');
				this.iptUser.value = this.iptUser.getAttribute('placeholder');
				input.type = 'text';
				input.value = this.iptPass.getAttribute('placeholder');
				input.className = 'placeholder';
				//替换密码框
				this.iptPass.parentNode.replaceChild(input,this.iptPass);
				_.addEvent(this.iptUser,'focus',this._holderOff.bind(this,this.iptUser));
				_.addEvent(this.iptUser,'blur',this._holderOn.bind(this,this.iptUser));
				_.addEvent(input,'focus',this._holderOff.bind(this,this.iptPass,input));
				_.addEvent(this.iptPass,'blur',this._holderOn.bind(this,this.iptPass,input));
			}
		},
		//显示placeholder
		_holderOn:function(ipt,input){
			if(ipt == this.iptUser){
				if(!ipt.value){
					_.addClass(ipt,'placeholder');
					ipt.value = ipt.getAttribute('placeholder');
				}
			}else{
				if(!ipt.value){//无输入,替换密码框
					ipt.parentNode.replaceChild(input,ipt);
				}
			}
		},
		//去除placeholder
		_holderOff:function(ipt,input){
			if(ipt == this.iptUser){
				if(ipt.className.indexOf('placeholder') >= 0){
					ipt.value = '';
					_.delClass(ipt,'placeholder');
				}
			}else{
				//换回密码框,给焦点
				input.parentNode.replaceChild(ipt,input);
				ipt.focus();
			}
		},
		_initEvents:function(){
			_.addEvent(this.close,'click',this.hide.bind(this));
			_.addEvent(this.form,'submit',this._login.bind(this));
			_.addEvent(this.iptUser,'focus',this._focus.bind(this,this.iptUser));
			_.addEvent(this.iptPass,'focus',this._focus.bind(this,this.iptPass));
			this._placeholder();
		}
	});
	window.utility = window.utility || {};
	utility.LoginWin = LoginWin;
})(util);