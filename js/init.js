//兼容函数
if(!String.prototype.trim){
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');
	}
}
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(a){
		for(var i=0;i<this.length;i++){
			if(this[i] === a){
				return i;
			}
		}
		return -1;
	}
}
if(!Function.prototype.bind){
	Function.prototype.bind = function(obj){
        var args = [].slice.call(arguments,1);
        var _ = this;
        return function(){
            args = args.concat([].slice.call(arguments));
            _.apply(obj,args);
        }
    }
}
//getElementById & getElementsByClassName & getElementsByTagName封装
var $ = function(id){
	return document.getElementById(id);
}
var $t = function(ele,tag){
	return ele.getElementsByTagName(tag);	
}
var $s = (function(){
	if(document.getElementsByClassName){
		return function(ele,clazz){
			return ele.getElementsByClassName(clazz);
		}
	}else{
		return function(ele,clazz){
			var ret = [],
				arr = clazz.trim().split(/\s+/),
				childArr = ele.getElementsByTagName('*'),
				i,j;
			for(i=0;i<childArr.length;i++){
				var classes = childArr[i].className.trim().split(/\s+/),
					flag = !0;
				for(j=0;j<arr.length;j++){
					if(classes.indexOf(arr[j]) < 0){
						flag = !1;
						break;
					}
				}
				if(flag){
					ret.push(childArr[i]);
				}
			}
			return ret;
		}
	}
})();