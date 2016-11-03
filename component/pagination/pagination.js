(function(_){
	var template = 
		'<div class="m-page"></div>';
	/**
	 * options={
	 * 	 container:..容器
	 * 	 length:显示页码数,
	 * 	 total:总页数,
	 * 	 crt:..当前页,默认为1,
	 * 	 prevText:...,上一页按钮文本,默认 <
	 * 	 nextText:...下一页按钮文本, 默认 >
	 * 	 first:n,始终显示前n页页码,n默认为0,
	 * 	 last:n,始终显示后n页页码,n默认为0,
	 * 	 title:...//页码hover提示 ${index}代表当前页码,默认无
	 * }
	 */
	function Pagination(options){		
		this.body = this._layout.cloneNode(true);
		_.extend(options,{ //默认值
			crt:1,
			prevText:'<',
			nextText:'>',
			first:0,
			last:0
		});
		_.extend(this,options);
		this.body.innerHTML = this._getHtml();	
		this._initEvents();
		this._show();
	}
	_.extend(Pagination.prototype,_.emiter);
	_.extend(Pagination.prototype,{
		_layout:_.html2node(template),
		_getHtml:function(crt,total){
			this.crt = crt || this.crt;
			this.total = total || this.total;
			this.crt = this.crt>this.total?this.total:this.crt;
			this.crt = this.crt<1?1:this.crt;//防止越界
			var len = this.length-this.first-this.last,//除首尾页码长度
				start = this.crt - Math.floor(len/2),
				end = this.crt + Math.floor((len-1)/2),
				html = '',
				i;
			if(this.length >= this.total){//总页数不够页码数
				start = this.first + 1;
				end = this.total - this.last;
			}else{
				if(end > this.total-this.last){//end超出范围,重新计算
					end = this.total-this.last;
					start = this.total-this.last-len+1;
				}
				if(start <= this.first){//start超出范围
					start = this.first + 1;
					end = start + len - 1;
				}
			}
			if(this.crt === 1){
				html += '<a class="idx prev disable">'+
							this.prevText+'</a>';
			}else{
				html += '<a class="idx prev" data-index="'+
							(this.crt-1)+'">'+
							this.prevText+'</a>';
			}
			if(this.first){
				for(i=1;i<=this.first;i++){
					if(this.crt === i){
						html+='<a class="idx active">'+i+'</a>';
					}else{
						html+='<a class="idx" data-index="'+
								i+'">'+i+'</a>';
					}
				}
			}
			if(start !== this.first + 1){
				html += '<span>…</span>';
			}
			for(i=start;i<=end;i++){
				if(this.crt === i){
					html+='<a class="idx active">'+i+'</a>';
				}else{
					html+='<a class="idx" data-index="'+
							i+'">'+i+'</a>';
				}
			}
			if(end !== this.total-this.last){
				html += '<span>…</span>';
			}
			if(this.last){
				for(i=this.total-this.last+1;i<=this.total;i++){
					if(this.crt === i){
						html+='<a class="idx active">'+i+'</a>';
					}else{
						html+='<a class="idx" data-index="'+
								i+'">'+i+'</a>';
					}
				}
			}
			if(this.crt === this.total){
				html += '<a class="idx next disable">'+
						this.nextText+'</a>';
			}else{
				html += '<a class="idx next" data-index="'+(this.crt+1)+'">'+
						this.nextText+'</a>';
			}
			return html;
		},
		//翻页 
		_turn:function(e){
			e = e || window.event;
			var target = _.getTarget(e,'idx');
			//找到target并且target不为current 或 disable
			if(!!target && target.className.indexOf('disable')<0 
				&& target.className.indexOf('active')<0){
				var index = _.data(target,'index')-0;
				//调用外部传入的翻页事件,传入index
				this.emit('turn',index);
				//刷新
				this.refresh(index);
			}
		},
		_hover:function(e){
			e = e || window.event;
			var target = _.getTarget(e,'idx');
			//找到target并且target不为current 或 disable
			if(!!target && target.className.indexOf('disable')<0 
				&& target.className.indexOf('active')<0){
				if(!target.title){
					var index = _.data(target,'index'),
						title = this.title.replace('${index}',index);
					target.title = title;
				}
			}
		},
		//页码更新  options{crt:...,totalCount:...}
		refresh:function(crt,total){
			this.body.innerHTML = this._getHtml(crt,total);
		},
		_show:function(){
			this.container.appendChild(this.body);
		},
		_initEvents:function(){
			_.addEvent(this.body,'click',this._turn.bind(this));
			if(this.title){
				_.addEvent(this.body,'mouseover',this._hover.bind(this));
			}
		}
	});
	window.Pagination = Pagination;
})(util)