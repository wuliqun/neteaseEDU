var emitter = {
	on:function(event,fn){
		var handles = this._handles || (this._handles = {}),
			calls = handles[event] || (handles[event] = []);
		calls.push(fn);
		return this;
	},
	off:function(event,fn){
		//没有传入event，则清空所有绑定函数
		if(!event || !this._handles){
			this._handles = {};
			return this;
		}
		var handles = this._handles;
		var calls = handles[event];
		//没有传入fn，则清空该类型事件所有绑定函数
		if(!fn || !calls){
			handles[event] = [];
			return this;
		}
		for(var i=0;i<calls.length;i++){
			if(calls[i] === fn){
				calls.splice(i,1);
				break;
			}
		}
		return this;
	},
	emit:function(event){
		var args = [].slice.call(arguments,1),
			handles = this._handles,
			calls;
		if(handles && (calls = handles[event])){
			for(var i=0;i<calls.length;i++){
				calls[i].apply(this,args)
			}
		}
		return this;
	}
}
