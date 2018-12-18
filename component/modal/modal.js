!function(){
	//将模板字符串转换为节点
	function html2node(html){
		var div = document.createElement('div');
		div.innerHTML = html;
		return div.children[0];
	}
	//赋值属性
	//{a:1}&{a:0,b:0}  --> {a:1,b:0}
	function extend(o1,o2){
		for(var attr in o2){
			//o1[attr]可能为假值，所以不能用!o1[attr]
			if(typeof(o1[attr]) === 'undefined'){
				o1[attr] = o2[attr];
			}
		}
	}

	var template =
		'<div class="m-modal">\
			<div class="modal_align"></div>\
			<div class="modal_wrap animated">\
				<div class="modal_head">标题</div>\
				<div class="modal_body">内容</div>\
				<div class="modal_foot">\
					<a class="confirm" href="#">确认</a>\
					<a class="cancel" href="#">取消</a>\
				</div>\
			</div>\
		</div>';

	function Modal(options){
		options = options || {};
		//每个实例使用不一样的节点
		this.container = this._layout.cloneNode(true);
		//提取常用的元素
		this.head = this.container.querySelector('.modal_head');
		this.body = this.container.querySelector('.modal_body');
		this.wrap = this.container.querySelector('.modal_wrap');
		//将参数加在实例上
		extend(this,options);

		this._initEvent();
	};

	extend(Modal.prototype,{
		_layout:html2node(template),
		setContent:function(content){
			if(!content)  return;
			if(content.nodeType == 1){
				this.body.innerHTML = '';
				this.body.appendChild(content);
			}else{
				this.body.innerHTML = content;
			}
		},
		setTitle:function(title){
			if(!title)  return;
			this.head.innerHTML = title;			
		},
		show:function(content,title){
			content = content || this.content
			title = title || this.title;
			if(content) this.setContent(content);
			if(title) this.setTitle(title);
			document.body.appendChild(this.container);
			//动画
			if(this.animation && this.animation.enter){
				animateClass(this.wrap, this.animation.enter)
			}
		},
		hide:function(){
			var container = this.container;
			if(this.animation && this.animation.leave){
				animateClass(this.wrap,this.animation.leave,function(){
					document.body.removeChild(container);
				});
			}else{
				document.body.removeChild(container);
			}
		},
		_initEvent:function(){
			this.container.querySelector('.confirm').addEventListener('click',
				this._onConfirm.bind(this));
			this.container.querySelector('.cancel').addEventListener('click',
				this._onCancel.bind(this));
		},
		_onConfirm:function(){
			this.emit('confirm');
			this.hide();
		},
		_onCancel:function(){
			this.emit('cancel');
			this.hide();
		}
	});

	extend(Modal.prototype, emitter);

	//          5.Exports
	// ----------------------------------------------------------------------
	// 暴露API:  Amd || Commonjs  || Global 
	// 支持commonjs
	if (typeof exports === 'object') {
		module.exports = Modal;
	// 支持amd
	} else if (typeof define === 'function' && define.amd) {
		define(function() {
			return Modal
		});
	} else {
		// 直接暴露到全局
		window.Modal = Modal;
	}
}()