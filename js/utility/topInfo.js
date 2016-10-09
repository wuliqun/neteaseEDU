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
		this.msgSpan = $s(this.body,'msg')[0].children[0];
		this.link = this.msgSpan.nextSibling;
		this.close = $s(this.body,'close')[0];
		_.extend(this,options);
	}
	_.extend(TopInfo.prototype,_);
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
			util.addEvent(this.close,'click',this.hide.bind(this));
		}
	});
	window.utility = window.utility || {};
	utility.TopInfo = TopInfo;
})(util.emiter);