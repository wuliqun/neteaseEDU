!function(_){
	var template = '<div class="m-scrollbox">\
			<div class="scrollbar"></div></div>',
		clientHeight,height,scrollbarHeight;
	function ScrollBar(options){
		this.body = this._layout.cloneNode(true);
		this.scrollbar = this.body.children[0];
		options = options || {}
		_.extend(options,{
			container:document.body
		});
		_.extend(this,options);
	}
	_.extend(ScrollBar.prototype,_.emiter);
	_.extend(ScrollBar.prototype,{
		_layout:_.html2node(template),
		show:function(){
			this.container.appendChild(this.body);
			this._init();
			this._initEvents();
		},
		_init:function(){
			//防止FF滚不到底的问题,直接用html高度
			clientHeight = document.documentElement.offsetHeight;
			height = this.body.offsetHeight;
			scrollbarHeight = Math.ceil(height*height/clientHeight);
			this.scrollbar.style.height = scrollbarHeight+'px';
			var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			if(scrollTop){
				this.scrollbar.style.marginTop = scrollTop/clientHeight*height +'px';
			}
		},
		_initEvents:function(){
			_.addEvent(this.scrollbar,'mousedown',this._mousedown.bind(this));
			_.addEvent(document,'mousemove',this._mousemove.bind(this));
			_.addEvent(document,'mouseup',this._mouseup.bind(this));
			_.addEvent(window,'resize',this._init.bind(this));
			_.addEvent(this.scrollbar,'click',function(e){
				//点击滑块不作响应,取消冒泡
				_.cancelBubble(e || window.event);
			});
			_.addEvent(this.body,'click',this._click.bind(this));
			_.addEvent(document.body,'mousewheel',this._wheel.bind(this));
			_.addEvent(document.body,'DOMMouseScroll',this._wheel.bind(this));
			_.addEvent(document,'keydown',this._keydown.bind(this));
		},			
		//滚动条滚动,distance 距离
		_scroll:function(distance){	
			var ch = document.documentElement.offsetHeight;
			//解决js改变body高度监测不到的bug
			if(ch !== clientHeight){
				this._init();
			}		
			var marginTop = _.getStyle(this.scrollbar,'marginTop');
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
			this.emit('before.scroll',scrollTop);
			this.scrollbar.style.marginTop = marginTop+distance+'px';	
			document.body.scrollTop = document.documentElement.scrollTop = scrollTop;	
			//可以在外部绑定滚动后事件,传入scrollTop
			this.emit('after.scroll',scrollTop);	
		},
		_mousedown:function(e){
			e = e || window.event;
			this.drag = !0;
			_.addClass(document.body,'forbid-select');
			document.body.onselectstart = function(){
				return false};
			this.eventY = e.clientY;
		},
		_mousemove:function(e){	
			e = e || window.event;
			if(!this.drag) return ;
			var y = e.clientY,
				height = y - this.eventY;
			this._scroll(height);
			this.eventY = y;
		},
		_mouseup:function(){
			this.drag = !1;
			_.delClass(document.body,'forbid-select');
			document.body.onselectstart = '';
		},
		_click:function(e){
			e = e || window.event;
			var y = e.clientY;
			var marginTop = _.getStyle(this.scrollbar,'marginTop');
			if(y < marginTop){
				this._scroll(-scrollbarHeight);
			}else if(y > marginTop + scrollbarHeight){
				this._scroll(scrollbarHeight);
			}
		},
		_wheel:function(e){
			e = e || window.event;
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
			e = e || window.event;
			//上下移动scrollbar的1/10,最小8px
			var distance = Math.max(scrollbarHeight/10,8);
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
	window.ScrollBar = ScrollBar;
}(util)