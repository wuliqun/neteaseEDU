(function(_){
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
		<%}%>',
		PAGE;//指示器数
	/**
	 * options={
	 * 	 container:..容器
	 * 	 pcount:显示的指示器数,
	 * 	 totalCount:总页数,
	 * 	 crt:..当前页
	 * }
	 */
	function Page(options){		
		this.body = this._layout.cloneNode(true);
		this.parent = options.container;
		var data = this._getData(options);
		this.sd = util.template.parse(itemTpl);
		this.body.innerHTML = util.template.merge(this.sd,data);
		this._initEvents();
		this._show();
	}
	_.extend(Page.prototype,_);
	_.extend(Page.prototype,{
		_layout:_.html2node(template),
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
			if(options.crt > options.totalCount){
				options.crt = options.totalCount;
			}
			PAGE = PAGE || options.pcount;
			var start,end;
			if(PAGE >= options.totalCount){
				start = 1;
				end = options.totalCount;
			}
			start = options.crt - Math.floor(PAGE/2);
			end = options.crt+Math.floor((PAGE-1)/2);
			if(start < 1){
				start = 1;
				end = PAGE;
			}else if(end > options.totalCount){
				end = options.totalCount;
				start = options.totalCount - PAGE + 1;
			}
			return {crt:options.crt,tCount:options.totalCount,start:start,end:end};
		},
		//翻页 
		_turn:function(e){
			e = e || window.event;
			var target = util.getTarget(e,'idx');
			//找到target并且target不为current 或 disable
			if(!!target && target.className.indexOf('disable')<0 
				&& target.className.indexOf('current')<0){
				var index = util.getData(target,'index')-0;
				//调用外部传入的翻页事件,传入index
				this.emit('turn',index);
			}
		},
		//页码更新  options{crt:...,totalCount:...}
		refresh:function(options){
			var data = this._getData(options);
			this.body.innerHTML = util.template.merge(this.sd,data);
		},
		_show:function(){
			this.parent.appendChild(this.body);
		},
		_initEvents:function(){
			util.addEvent(this.body,'click',this._turn.bind(this));
		}
	});
	window.utility = window.utility || {};
	utility.Page = Page;
})(util.emiter)