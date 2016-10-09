define(['jquery','util'],function($,_){
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
		this.body = $(template);
		this.link = $('a.slide',this.body);
		this.img = $('img',this.body);
		this.ctrl = $('.ctrl',this.body);
		$.extend(this,options);
		this._init();
	}
	$.extend(FadeSlider.prototype,_);
	$.extend(FadeSlider.prototype,{
		_init:function(){
			var len = this.data.length,
				html = '<li class="z-crt">1</li>';
			for(var i=2;i<=len;i++){
				html += '<li>'+i+'</li>'
			}
			//设置控制小圆点
			this.ctrl.html(html);
			//初始化链接 & 图片
			this.link.attr('href',this.data[0].url).data('index',0);
			this.img.attr({
				src:this.data[0].src,
				alt:this.data[0].alt || ''});
		},
		show:function(){
			this.container.append(this.body);	
			this._initEvents();
			this._fadeIn();
			if(this.autoplay){
				this._play();
			}
		},
		slideNext:function(){
			var index = this.link.data('index')-0+1;
			if(index >= this.data.length){
				index = 0;
			}
			this.slide(index);
		},
		slidePrev:function(){
			var index = this.link.data('index')-1;
			if(index < 0){
				index = this.data.length-1;
			}
			this.slide(index);
		},
		slide:function(index){
			var crtIndex = this.link.data('index')-0;
			if(index == crtIndex) return;
			//设置控制点
			this.ctrls.eq(crtIndex).removeClass('z-crt');
			this.ctrls.eq(index).addClass('z-crt');
			//设置图片
			this.link.attr('href',this.data[index].url);
			this.link.data('index',index);
			this.img.attr({
				src:this.data[index].src,
				alt:this.data[index].alt || ''});
			this._fadeIn();
		},
		//轮播
		_play:function(){
			var _ = this;
			_.delay = _.delay || 5000;
			_.timer = setInterval($.proxy(_,'slideNext'),_.delay);
			_.body.on('mouseover',function(){
				clearInterval(_.timer);
			});
			_.body.on('mouseout',function(){
				_.timer = setInterval($.proxy(_,'slideNext'),_.delay);
			});
		},
		_fadeIn:function(){
			this.link.css('opacity',0).animate({opacity:1},500);	
		},
		_initEvents:function(){
			this.ctrls = $('li',this.ctrl);
			var len = this.ctrls.length;
			for(var i=0;i<len;i++){
				this.ctrls.eq(i).click($.proxy(this,'slide',i));
			}
		}
	});
	return FadeSlider;
});
