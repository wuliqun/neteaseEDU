!function(_){
	var template =
		'<div class="m-sld">\
			<div class="img">\
				<a target="_blank" class="slide active">\
					<img/>\
				</a>\
				<a target="_blank" class="slide">\
					<img/>\
				</a>\
			</div>\
			<a target="_blank" class="caption">\
			</a>\
			<div class="ctrl">\
			</div>\
		</div>';
	/**
	 * @param options = {
	 *     container:...,
	 *     data:[{src:...,url:...,captionUrl:...(可选)}...],    
	 *     prevNext:是否需要左右按钮,默认false
	 *     method:轮播方式 支持:'fade'淡出 & 'slip'滑动 
	 *     		//& fadeInOut 淡入+淡出 &'none'无,默认淡出
	 *     duration:轮播动画(淡出或滑动)时长,默认500ms
	 *     autoplay:...是否自动轮播,默认true,
	 *     delay:...轮播延迟时间,默认5s,与autoplay=true配合
	 *     eventStyle:...,
	 *     		//控制按钮响应事件类型,默认click,可以为hover
	 *     hoverPause:...,//hover是否停止轮播,默认true;
	 *     hasCtrl:...,//是否需要控制点,默认为true
	 *     hasCaption:..,//是否需要caption,默认false
	 *     captionTpl:...,//caption模板,
	 *      	//${...}表示用data相应字段填充
	 * }
	 */
	function Slide(options){
		this.body = this._layout.cloneNode(true);
		this.imgBox = $('.img',this.body)[0];
		this.front = this.imgBox.children[0];
		this.frontImg = this.front.children[0];
		this.back = this.imgBox.children[1];	
		this.caption = $('.caption',this.body)[0];
		this.ctrl = $('.ctrl',this.body)[0];
		_.extend(options,{
			delay:5000,
			duration:500,
			autoplay:!0,
			prevNext:!1,
			method:'fade',
			eventStyle:'click',
			hoverPause:!0,
			hasCtrl:!0,
			hasCaption:!1
		});
		_.extend(this,options);		
	}
	_.extend(Slide.prototype,_.emiter);
	_.extend(Slide.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			var len = this.data.length,
				html = '';
			if(this.hasCtrl){
				html = '<ul><li class="active">1</li>';
				for(var i=2;i<=len;i++){
					html += '<li>'+i+'</li>'
				}
				html += '</ul>';
				//设置控制点
				this.ctrl.innerHTML = html;
			}else{
				this.body.removeChild(this.ctrl);
				this.ctrl = null;
			}		
			//初始化链接 & 图片
			this.front.href = this.data[0].url;
			if(this.hasCaption){
				this.caption.href = this.data[0].captionUrl || this.data[0].url;								
				this.caption.innerHTML = this.captionHtml(0);
			}else{
				this.body.removeChild(this.caption);
			}			
			this.index = 0;	//当前图片索引
			this.actIndex = 0;//当前active的a
			this.frontImg.src = this.data[0].src;
			this.frontImg.alt = this.data[0].alt || '';
			html = '';
			
			if(this.prevNext){//添加prev next图标
				this.prev = _.html2node('<a class="prev"></a>');
				this.body.appendChild(this.prev);
				this.next = _.html2node('<a class="next"></a>');
				this.body.appendChild(this.next);
			}	
			if(['slip','fadeInOut'].indexOf(this.method) < 0){
				//淡出或无动画 只需要一张图片链接
				this.back.parentNode.removeChild(this.back);
				this.back = null;
			}else{
				//取出隐藏图片
				this.backImg = this.back.children[0];
			}
		},
		//填充caption模板获得HTML
		captionHtml:function(index){
			var data = this.data[index];
			return this.captionTpl.replace(/\$\{([^\}]+)\}/g,function($1,$2){
				return data[$2];
			});
		},
		show:function(){
			this.container.appendChild(this.body);
			this._init();
			this._initEvents();	
			if(this.method === 'fade'){
				this._fadeIn();
			}
			if(this.autoplay){
				this._play();
			}
		},
		hide:function(){
			if(this.body.parentNode){
				this.body.parentNode.removeChild(this.body);
			}
		},
		slideNext:function(){
			var index = this.index+1;
			if(index >= this.data.length){
				index = 0;
				//标记!!最后一个slideNext依然从右滑出
				this.to = 1;
			}
			this.slide(index);
		},
		slidePrev:function(){
			var index = this.index-1;
			if(index < 0){
				index = this.data.length-1;
				//标记!!第一个slidePrev依然从左滑出
				this.to = 2;
			}
			this.slide(index);
		},
		slide:function(index){
			if(index === this.index) return;
			//可以在外部用on绑定轮播前事件
			this.emit('before.slide',index);
			if(this.hasCtrl){
				//设置控制点
				_.delClass(this.ctrls[this.index],'active');
				_.addClass(this.ctrls[index],'active');
			}
			if(this.hasCaption){
				this.caption.innerHTML = this.captionHtml(index);
				this.caption.href = this.data[index].captionUrl || this.data[index].url;
			}
			//根据method不同选择轮播方法
			if(this.method === 'slip'){
				this._slip(index);
			}else if(this.method === 'fadeInOut'){
				this._fadeInOut(index);
			}else if(this.method === 'none'){
				this._in(index);
			}else{
				this._in(index);
				this._fadeIn();
			}
			//可以在外部用on绑定轮播后事件
			this.emit('after.slide',index);
		},
		_in:function(index){
			this.front.href = this.data[index].url;
			this.frontImg.src = this.data[index].src;
			this.frontImg.alt = this.data[index].alt || '';
			this.index = index;	//当前图片索引
			if(this.method === 'fade'){
				this._fadeIn();
			}
		},
		_slip:function(index){
			var direction,_s = this;
			//即将出现的图片链接的index
			_s.back.href = _s.data[index].url;
			_s.backImg.src = _s.data[index].src;
			_s.backImg.alt = _s.data[index].alt || '';			
			if(_s.to === 1 || (index > _s.index && _s.to !== 2)){
				_s.to = 0;
				_s.back.style.left = '100%';
				direction = -1;
			}else{
				_s.to = 0;
				_s.back.style.left = '-100%';
				direction = 1;
			}
			_s.index = index;
			_.move(_s.imgBox,{left:direction*_s.imgBox.offsetWidth},_s.duration,function(){
				_.delClass(_s.front,'active');
				_.addClass(_s.back,'active');
				_s.back.style.cssText = '';
				_s.imgBox.style.cssText = '';
				var temp = _s.back;
				_s.back = _s.front;
				_s.front = temp;
				temp = _s.backImg;
				_s.backImg = _s.frontImg;
				_s.frontImg = temp;
			});
		},
		_fadeIn:function(){
			var link = this.front;
			link.style.cssText = '';
			_.addClass(link,'hide');
			_.move(link,{opacity:100},this.duration,function(){
				link.style.cssText = '';
				_.delClass(link,'hide');
			});
		},
		_fadeInOut:function(index){
			this.back.href = this.data[index].url;
			this.backImg.src = this.data[index].src;
			this.backImg.alt = this.data[index].alt || '';
			this.index = index;
			var count = 0;
			_.move(this.front,{opacity:0},this.duration,fadeInOutEnd);
			_.move(this.back,{opacity:100},this.duration,fadeInOutEnd);
			var _s = this;
			function fadeInOutEnd(){
				if(++count === 2){
					_.delClass(_s.front,'active');
					_.addClass(_s.back,'active');
					_s.front.style.cssText = '';
					_s.back.style.cssText = '';
					var temp = _s.back;
					_s.back = _s.front;
					_s.front = temp;
					temp = _s.backImg;
					_s.backImg = _s.frontImg;
					_s.frontImg = temp;
				}
			}
		},
		//轮播
		_play:function(){
			var self = this;
			self.timer = setInterval(self.slideNext.bind(self),self.delay);
			if(self.hoverPause){
				_.addEvent(self.container,'mouseover',function(){
					clearInterval(self.timer);
				});
				_.addEvent(self.container,'mouseout',function(){
					self.timer = setInterval(self.slideNext.bind(self),self.delay);
				});
			}
		},
		_initEvents:function(){
			if(this.hasCtrl){
				this.ctrls = $('li',this.ctrl);
				var len = this.ctrls.length;
				for(var i=0;i<len;i++){
					_.addEvent(this.ctrls[i],this.eventStyle,this.slide.bind(this,i));
				}
			}
			if(this.prevNext){
				_.addEvent(this.prev,'click',this.slidePrev.bind(this));
				_.addEvent(this.next,'click',this.slideNext.bind(this));
			}
		}
	});
	window.Slide = Slide;
}(util);