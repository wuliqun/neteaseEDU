define(['jquery','util'],function($,_){
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
		this.body = $(template);
		this.head = $('.title',this.body);
		this.close = $('.close-login',this.body);
		this.form = $('form',this.body);
		this.inputs = this.form.find('input');
		this.logfail = $('.logfail',this.body);
		this.userError = $('.user-err',this.body);
		this.passError = $('.pass-err',this.body);
		$.extend(this,options);
		this._init();
		this._initEvents();		
	}
	$.extend(LoginWin.prototype,_.emiter);
	$.extend(LoginWin.prototype,{
		_init:function(){
			this.asyn = this.asyn === undefined?!0:this.asyn;
			!this.method && (this.method = 'POST');
			if(!this.asyn){//不用ajax,form添加属性
				this.form.attr({
					action:this.action,
					method:this.method
				});
			}
		},
		// 可以自定义标题
		_setTitle:function(title){
			if(!title) return ;
			this.head.html(title);
		},
		show:function(title){
			title = title||this.title;
			this._setTitle(title);
			this.container = this.container || $('body');
			this.container.append(this.body);
		},
		hide:function(){
			this.body.remove();
		},
		//user/pass输入框验证
		_validate:function(user,pass){
			var userReg = /^[A-Za-z0-9][\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{5,19}$/,
				passReg = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/;
			if(userReg.test(user)&&passReg.test(pass)){
				return !0;//验证成功
			}
			if(!userReg.test(user)){
				this.inputs.eq(0).addClass('invalid');
				this.userError.addClass('z-act');
				if(!user){					
					this.userError.html('账号不能为空!');
				}else{
					this.userError.html('账号格式不正确!');
				}
			}
			if(!passReg.test(pass)){
				this.inputs.eq(1).addClass('invalid');
				this.passError.addClass('z-act');
				if(!pass){
					this.passError.html('密码不能为空!');
				}else{
					this.passError.html('密码格式不正确!');
				}
			}			
			return !1;
		},
		//input获取焦点时,去掉红色边框和错误信息
		_focus:function(ipt){
			ipt.removeClass('invalid');
			if(ipt.attr('name') == 'userName'){
				this.userError.removeClass('z-act');
			}else{
				this.passError.removeClass('z-act');
			}
		},
		//登录 
		_login:function(e){
			this.inputs.eq(2).attr({
				disabled:!0
			});			
			var user = $.trim(this.inputs.eq(0).val()),
				pass = $.trim(this.inputs.eq(1).val());
			if(this._validate(user,pass)){
				var md5User=_.md5(user),
					md5Pass=_.md5(pass);
				if(this.asyn){//ajax 异步登录
					e.preventDefault();				
					$.ajax({
						url:this.action,
						type:this.method,
						data:{userName:md5User,password:md5Pass}
					}).done($.proxy(this,'_ajaxSuc'))
					  .fail($.proxy(this,'_ajaxFail'));
				}else{//用MD5替换user/pass,直接登录
					this.iptUser.value = md5User;
					this.iptPass.value = md5Pass;
				}
			}else{
				e.preventDefault();	
				this.inputs.eq(2).attr({
					disabled:!1
				});
			}
		},
		_ajaxSuc:function(data){
			if(data == '1'){
				this.emit('loginSuc');
				this.hide();
			}else{
				this.logfail.html('用户名或密码错误！');
			}
			this.inputs.eq(2).attr({
				disabled:!1
			});
		},
		_ajaxFail:function(){
			this.logfail.html('网络请求失败,请稍后重试。');
			this.inputs.eq(2).attr({
				disabled:!1
			});
		},
		//兼容placeholder
		_placeholder:function(){
			//type不能修改,创建input代替密码框显示placeholder
			var input = $('<input>');
			if(!('placeholder' in input[0])){
				this.inputs.eq(0).addClass('placeholder');
				this.inputs.eq(0).val(this.inputs.eq(0).attr('placeholder'));
				input.addClass('placeholder').attr({
					type:'text',
					val:this.inputs.eq(1).attr('placeholder')
				});
				//替换密码框
				this.inputs.eq(1).replaceWith(input);
				this.inputs.eq(0).on('focus',$.proxy(this,'_holderOff',this.inputs.eq(0)));
				this.inputs.eq(0).on('blur',$.proxy(this,'_holderOn',this.inputs.eq(0)));
				input.on('focus',$.proxy(this,'_holderOff',input));
				this.inputs.eq(1).on('blur',$.proxy(this,'_holderOn',this.inputs.eq(1),input));
			}
		},
		//显示placeholder
		_holderOn:function(ipt,input){
			if(ipt.attr('name') == 'userName'){
				if(!ipt.val()){
					ipt.addClass('placeholder');
					ipt.val(ipt.attr('placeholder'));
				}
			}else{
				if(!ipt.val()){//无输入,替换密码框
					ipt.replaceWith(input);
				}
			}
		},
		//去除placeholder
		_holderOff:function(ipt,input){
			if(ipt.attr('name') == 'userName'){
				if(ipt.hasClass('placeholder')){
					ipt.val('');
					ipt.removeClass('placeholder');
				}
			}else{
				//换回密码框,给焦点
				input.replaceWith(ipt);
				ipt.focus();
			}
		},
		_initEvents:function(){
			this.close.click($.proxy(this,'hide'));
			this.form.on('submit',$.proxy(this,'_login'));
			this.inputs.eq(0).on('focus',$.proxy(this,'_focus',this.inputs.eq(0)));
			this.inputs.eq(1).on('focus',$.proxy(this,'_focus',this.inputs.eq(1)));
			this._placeholder();
		}
	});
	return LoginWin;
});