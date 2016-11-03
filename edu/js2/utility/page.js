define(['jquery','util'],function($,_){
	var template = '<div class="m-page f-fr"></div>',
		itemTpl = 
		'<%if(crt==1){%>\
			<a class="idx prev disable"></a>\
		<%}else{%>\
			<a class="idx prev" title="上一页" data-index="<%=crt-1%>"></a>\
		<%}%>\
		<%for(var i=start;i<=end;i++){%>\
			<%if(crt==i){%>\
				<a class="idx current"><%=i%></a>\
			<%}else{%>\
				<a class="idx" data-index="<%=i%>"><%=i%></a>\
			<%}%>\
		<%}%>\
		<%if(crt==tCount){%>\
			<a class="idx next disable"></a>\
		<%}else{%>\
			<a class="idx next" title="下一页" data-index="<%=crt+1%>"></a>\
		<%}%>';
	/**
	 * options={
	 * 	 container:..容器
	 * 	 pcount:显示的指示器数,
	 * 	 totalCount:总页数,
	 * 	 crt:..当前页
	 * }
	 */
	function Page(options){		
		this.body = $(template);
		this.parent = options.container;
		var data = this._getData(options);
		this.sd = _.template.parse(itemTpl);
		this.body.html(_.template.merge(this.sd,data)) ;
		this._initEvents();
		this._show();
	}
	$.extend(Page.prototype,{
		/**
		 * [_getData 获得模板参数 crt tCount range]
		 * options:pcount 指示器数量,必须创建时传入
		 * 		   totalCount 总页数
		 * 		   crt 当前页 		   
		 */
		_getData:function(options){
			if(!options.crt){
				options.crt = 1;
			}
			this.PAGE = options.pcount || this.PAGE;
			this.totalCount = options.totalCount || this.totalCount;
			if(options.crt > this.totalCount){
				options.crt = this.totalCount;
			}
			var start,end;
			if(this.PAGE >= this.totalCount){
				start = 1;
				end = this.totalCount;
			}
			start = options.crt - Math.floor(this.PAGE/2);
			end = options.crt+Math.floor((this.PAGE-1)/2);
			if(start < 1){
				start = 1;
				end = this.PAGE;
			}else if(end > this.totalCount){
				end = this.totalCount;
				start = this.totalCount - this.PAGE + 1;
			}
			return {crt:options.crt,tCount:this.totalCount,start:start,end:end};
		},
		//页码更新  options{crt:...,totalCount:...}
		refresh:function(options){
			var data = this._getData(options);
			this.body.html(_.template.merge(this.sd,data));
		},
		_show:function(){
			this.parent.append(this.body);
		},
		_initEvents:function(){
			var _ = this;
			//翻页事件
			this.body.on('click','.idx',function(e){
				var target = $(this);
				if(!target.hasClass('disable') && !target.hasClass('current')){
					var index = target.data('index')-0;
					$(_).trigger('turn',index);
					_.refresh({crt:index});
				}
			});
		}
	});
	return Page;
});