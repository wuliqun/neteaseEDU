define(['jquery','util'],function($,_){
	var body ='<div class="m-pop f-pa"></div>',
		tpl = 	
		'<div class="img f-cb">\
			<div class="pic f-fl">\
				<img src="<%=middlePhotoUrl%>" alt="<%=name%>" width="223" height="124">\
			</div>\
			<div class="msg f-oh">\
				<div class="tit thide" title="<%=name%>"><%=name%></div>\
				<div class="stus"><span><%=learnerCount%>人在学</span></div>\
				<div class="ori">发布者:<%=provider%></div>\
				<%if(categoryName){%>\
				<div class="cate">分类:<%=categoryName%></div>\
				<%}else{%>\
				<div class="cate">分类:<%=cate%></div>\
				<%}%>\
			</div>\
		</div>\
		<div class="desc f-oh" title="<%=description%>"><p><%=description%></p></div>';
	function Pop(){
		this.body = $(body);
		this.sd = _.template.parse(tpl);
		this._initEvents();
	}
	$.extend(Pop.prototype,_.emiter);
	$.extend(Pop.prototype,{
		_init:function(options){
			this.body.html(_.template.merge(this.sd,options));
		},
		show:function(parent,options){
			if(parent.find('.m-pop').length == 0){
				this.hide();
				this._init(options);
				var body = this.body;
				// 与关闭弹窗的定时器配合,
				// 防止未关闭就调用show()的bug
				setTimeout(function(){
					parent.append(body);
				},1);
			}
		},
		hide:function(){
			this.body.detach();			
		},
		_initEvents:function(){
			/**
			 * mouseleave会出现快速移动无法捕捉的情况
			 * 这里用mouseout并延迟触发(setTimeout)
			 * 如果立即又触发了mouseover,
			 * 则说明是内部元素触发的mouseout
			 * 此时清除定时器
			 */
			var _ = this,
				body = _.body[0],//用原生对象绑定事件,避免被清除
				timer;
			body.onmouseout = function(){
				timer = setTimeout($.proxy(_,'hide'),0);
			};
			//立即触发了mouseover,清除定时器
			body.onmouseover = function(){
				clearInterval(timer);
			};
		}
	});
	return Pop;
});