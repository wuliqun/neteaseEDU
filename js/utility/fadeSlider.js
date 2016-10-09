(function(_){
	var template=
	'<div class="m-sld f-pr f-oh">\
		<a class="slide">\
			<img width="100%" height="100%" />\
		</a>\
		<div class="ctrl-box f-pa">\
			<ul class="ctrl f-ib">\
			</ul>\
		</div>\
	</div>';
	/**
	 * @param options = {
	 *     container:...,
	 *     data:[{src:...,url:...,alt:...(alt可省略)}],     
	 *     autoplay:...是否自动轮播,默认false,
	 *     delay:...轮播延迟时间,默认5000ms,与autoplay=true配合
	 * }
	 */
	function FadeSlider(options){
		this.body = this._layout.cloneNode(true);
		this.link = $t(this.body,'a')[0];
		this.img = $t(this.body,'img')[0];
		this.ctrl = $s(this.body,'ctrl')[0];
		_.extend(this,options);
		this._init();
	}
	_.extend(FadeSlider.prototype,_);
	_.extend(FadeSlider.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			var len = this.data.length,
				html = '<li class="z-crt">1</li>';
			for(var i=2;i<=len;i++){
				html += '<li>'+i+'</li>'
			}
			//设置控制小圆点
			this.ctrl.innerHTML = html;
			//初始化链接 & 图片
			this.link.href = this.data[0].url;
			util.setData(this.link,'index',0);		
			this.img.src = this.data[0].src;
			this.img.alt = this.data[0].alt || '';	
		},
		show:function(){
			this.container.appendChild(this.body);	
			this._initEvents();
			this._fadeIn();
			if(this.autoplay){
				this._play();
			}
		},
		slideNext:function(){
			var index = util.getData(this.link,'index')-0+1;
			if(index >= this.data.length){
				index = 0;
			}
			this.slide(index);
		},
		slidePrev:function(){
			var index = util.getData(this.link,'index')-1;
			if(index < 0){
				index = this.data.length-1;
			}
			this.slide(index);
		},
		slide:function(index){
			var crtIndex = util.getData(this.link,'index')-0;
			if(index == crtIndex) return;
			//设置控制点
			util.delClass(this.ctrls[crtIndex],'z-crt');
			util.addClass(this.ctrls[index],'z-crt');
			//设置图片
			this.link.href = this.data[index].url;
			util.setData(this.link,'index',index);
			this.img.src = this.data[index].src;
			this.img.alt = this.data[index].alt||'';
			this._fadeIn();
		},
		//轮播
		_play:function(){
			var _ = this;
			_.delay = _.delay || 5000;
			_.timer = setInterval(_.slideNext.bind(_),_.delay);
			util.addEvent(_.body,'mouseover',function(){
				clearInterval(_.timer);
			});
			util.addEvent(_.body,'mouseout',function(){
				_.timer = setInterval(_.slideNext.bind(_),_.delay);
			});
		},
		_fadeIn:function(){
			var slide = this.link;						
			//兼容animation就用animation
			if(util.support('animation')){	
				util.animate(slide,'show');
			}else{				
				//先设置透明
				util.addClass(slide,'hide');
				util.move(slide,{opacity:100},500,function(){
					slide.style.cssText = '';
					util.delClass(slide,'hide');
				});
			}
		},
		_initEvents:function(){
			this.ctrls = $t(this.ctrl,'li');
			for(var i=0;i<this.ctrls.length;i++){
				util.addEvent(this.ctrls[i],'click',this.slide.bind(this,i));
			}
		}
	});
	window.utility = window.utility || {};
	utility.FadeSlider = FadeSlider;
})(util.emiter);
