define(['jquery'],function($){
	var template = '<div class="m-scrollbox">\
			<div class="scrollbar"></div></div>',
		clientHeight,height,scrollbarHeight,
		html = $('html');
	function ScrollBar(options){
		this.body = $(template);
		this.scrollbar = this.body.find('.scrollbar');
		options = $.extend({
			container:$('body')
		},options);
		$.extend(this,options);
	}
	$.extend(ScrollBar.prototype,{
		show:function(){
			this.container.append(this.body);
			this._init();
			this._initEvents();
		},
		_init:function(){
			clientHeight = html.height();
			height = this.body.height();
			scrollbarHeight = Math.ceil(height*height/clientHeight);
			this.scrollbar.css('height',scrollbarHeight);
			console.log(scrollbarHeight)
			console.log(height)
			console.log(clientHeight)
			var scrollTop = this.container.scrollTop();
			if(scrollTop){
				this.scrollbar.css('margin-top',scrollTop/clientHeight*height);
			}
		},
		_initEvents:function(){
			this.scrollbar.on({
				mousedown:$.proxy(this,'_mousedown'),
				click:function(e){
					//点击滑块不作响应,取消冒泡
					e.stopPropagation();
				}
			});
			$(document).on({
				mousemove:$.proxy(this,'_mousemove'),
				mouseup:$.proxy(this,'_mouseup'),
				keydown:$.proxy(this,'_keydown')
			});
			$(window).resize($.proxy(this,'_init'));
			this.body.click($.proxy(this,'_click'));
			this.container.on('mousewheel DOMMouseScroll',$.proxy(this,'_wheel'));
		},			
		//滚动条滚动,distance 距离
		_scroll:function(distance){	
			var ch = html.height();
			if(ch !== clientHeight){
				//解决由于js影响了body高度,而滚动条监测不到的bug
				this._init();
			}		
			var marginTop=parseInt(this.scrollbar.css('margin-top'))||0;
			var scrollTop = Math.ceil((marginTop+distance)/height*ch);
			if(marginTop+distance+scrollbarHeight >= height){
				distance = height - marginTop-scrollbarHeight;
				scrollTop = ch - height;
			}
			if(marginTop + distance <= 0){
				distance = -marginTop;
				scrollTop = 0;
			}
			//可以在外部绑定滚动前事件,传入scrollTop
			$(this).trigger('before.scroll',scrollTop);
			this.scrollbar.css('margin-top',marginTop+distance);
			this.container.scrollTop(scrollTop);
			if(!this.container.scrollTop()){
				html.scrollTop(scrollTop);
			}
			//可以在外部绑定滚动后事件,传入scrollTop
			$(this).trigger('after.scroll',scrollTop);	
		},
		_mousedown:function(e){
			this.drag = !0;
			//禁用文字选中
			this.container.addClass('forbid-select');
			this.container.on('selectstart',function(){
				return false;
			});
			this.eventY = e.clientY;
		},
		_mousemove:function(e){	
			if(!this.drag) return ;
			var y = e.clientY,
				height = y - this.eventY;
			this._scroll(height);
			this.eventY = y;
		},
		_mouseup:function(){
			this.drag = !1;
			//解除禁用文字选中
			this.container.removeClass('forbid-select');
			$(document).off('selectstart');
		},
		_click:function(e){			
			var y = e.clientY;
			var marginTop=parseInt(this.scrollbar.css('margin-top'))||0;
			if(y < marginTop){
				this._scroll(-scrollbarHeight);
			}else if(y > marginTop + scrollbarHeight){
				this._scroll(scrollbarHeight);
			}
		},
		_wheel:function(e){
			e = e.originalEvent;
			var direction,i,distance;
			if(e.wheelDelta < 0 || e.detail > 0){
				direction = 1;		
			}else{
				direction = -1;
			}
			//滚动scrollbar的1/5,最小10px
			distance = Math.max(scrollbarHeight/5,10);
			this._scroll(direction*distance);
		},
		_keydown:function(e){
			//上下移动scrollbar的1/10,最小6px
			var distance = Math.max(scrollbarHeight/10,6);
			switch(e.keyCode){
			case 32://space
				this._scroll(scrollbarHeight);
				break;
			case 38://up
				this._scroll(-distance);
				break;
			case 40://down
				this._scroll(distance);
				break;
			case 33://pageup
				this._scroll(-scrollbarHeight);
				break;
			case 34://pagedown
				this._scroll(scrollbarHeight);
				break;
			default:
				break;
			}
		}
	});
	return ScrollBar;
})