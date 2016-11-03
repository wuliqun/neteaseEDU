(function(_){
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
		<div class="desc f-over" title="<%=description%>"><p><%=description%></p></div>';
	function Pop(){
		this.body = this._layout.cloneNode(true);
		this.sd = _.template.parse(tpl);
		this._initEvents();
	}
	_.extend(Pop.prototype,_.emiter);
	_.extend(Pop.prototype,{
		_layout:_.html2node(body),
		_init:function(options){
			this.body.innerHTML=_.template.merge(this.sd,options);
		},
		show:function(parent,options){
			if(this.body.parentNode != parent){
				this.hide();
				this._init(options);
				var body = this.body;
				// 与关闭弹窗的定时器配合,
				// 防止未关闭就调用show()的bug
				setTimeout(function(){
					parent.appendChild(body);
				},1);
			}
		},
		hide:function(){
			if(this.body.parentNode){
				this.body.parentNode.removeChild(this.body);
			}			
		},
		_initEvents:function(){
			/**
			 * mouseleave会出现快速移动无法捕捉的情况
			 * 这里用mouseout并延迟触发(setTimeout)
			 * 如果立即又触发了mouseover,
			 * 则说明是内部元素触发的mouseout
			 * 此时清除定时器
			 */
			var self = this,
				timer;
			_.addEvent(this.body,'mouseout',function(){
				timer = setTimeout(self.hide.bind(self),0);
			});
			//立即触发了mouseover,清除定时器
			_.addEvent(this.body,'mouseover',function(){
				clearInterval(timer);
			});
		}
	});
	window.utility = window.utility || {};
	utility.Pop = Pop;
})(util)