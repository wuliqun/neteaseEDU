(function(_){
	var template = 
	'<div class="info-box f-cb">\
		<p class="msg f-fl"><span></span><a href="#" target="_blank">立即查看&gt;</a></p>\
		<p class="close f-fr">\
			<i></i><span>不再提醒</span>\
		</p>\
	</div>';
	/**
	 * options{
	 * 	   container:  ,
	 *     msg:  ,
	 *     url:  
	 * }
	 */
	function TopInfo(options){
		this.body = this._layout.cloneNode(true);
		this.msgSpan = $('.msg span',this.body);
		this.link = $('.msg a',this.body);
		this.close = $('.close',this.body);
		_.extend(this,options);
	}
	_.extend(TopInfo.prototype,_.emiter);
	_.extend(TopInfo.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			this.msgSpan.innerHTML = this.msg;
			this.link.href = this.url;			
		},
		show:function(){
			this._init();			
			this.container.appendChild(this.body);
			this._initEvents();
		},
		hide:function(){
			this.emit('close');
			this.container.removeChild(this.body);
		},
		_initEvents:function(){
			_.addEvent(this.close,'click',this.hide.bind(this));
		}
	});
	window.utility = window.utility || {};
	utility.TopInfo = TopInfo;
})(util);