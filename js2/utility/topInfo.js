define(['jquery','util'],function($,_){
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
		this.body = $(template);
		this.msgSpan = $('.msg span',this.body);
		this.link = $('.msg a',this.body);
		this.close = $('.close',this.body);
		$.extend(this,options);
	}
	$.extend(TopInfo.prototype,_.emiter);
	$.extend(TopInfo.prototype,{
		_init:function(){
			this.msgSpan.html(this.msg);
			this.link.attr('href',this.url);			
		},
		show:function(){
			this._init();			
			this.container.append(this.body);
			this._initEvents();
		},
		hide:function(){
			this.emit('close');
			this.body.remove();
		},
		_initEvents:function(){
			this.close.click($.proxy(this,'hide'));
		}
	});
	return TopInfo;
});