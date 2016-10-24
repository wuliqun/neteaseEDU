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
//querySelector封装
function $(selector,context){
    var context = context || document;
    return context.querySelector(selector);
}
function $all(selector,context){
    var context = context || document;
    return context.querySelectorAll(selector);
}
var util = {
    //addEvent 元素绑定事件,兼容,if仅判断一次,提高效率
    addEvent:(function(){
        if(document.addEventListener){
            return function(a,b,c,d){
                d = !!d;
                a.addEventListener(b,c,d);
            }
        }else{
            return function(a,b,c){
                a.attachEvent('on'+b,c);
            }
        }
    })(),
    removeEvent:(function(){
        if(document.removeEventListener){
            return function(a,b,c,d){
                d = !!d;
                a.removeEventListener(b,c,d);
            }
        }else{
            return function(a,b,c){
                a.detachEvent('on'+b,c);
            }
        }
   })(),
    //getTarget 事件代理,用于获取触发事件的对象
    //参数说明 e:事件对象,clazz:目标对象的class,current:代理事件的对象
    getTarget:function(e,clazz,current){
        var target = e.target?e.target:e.srcElement;  
        //事件可能由子元素触发,向上找parentNode直到找到目标元素
        while(target && target != current && (' '+target.className+' ').indexOf(' '+clazz+' ') < 0){
            target = target.parentNode;
        }
        // target为当前事件注册对象
        if(!target || target === current){
            return null;
        }else{
            return target;
        }
    },
    //cancelBubble 阻止冒泡
    cancelBubble:function(e){
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    },
    //preventDft 阻止默认事件
    preventDft:function (e){
        if(e.preventDefault){
            e.preventDefault()
        }else{
            e.returnValue = false;
        }
    },
    //fireEvent 触发事件
    fireEvent:function (e,type){      
        if(e.dispatchEvent){
            var ev = document.createEvent('Event');
            ev.initEvent(type,!0,!0);
            e.dispatchEvent(ev);
        }else{
            e.fireEvent('on'+type);
        }
    },
    //获取cookie 
    getCookie:function(){
        var cookie = {},
            all = document.cookie;
        if(all === ''){
            return cookie;
        }
        var list = all.split('; ');
        for(var i=0;i<list.length;i++){
            var p = list[i].indexOf('='),
                name=decodeURIComponent(list[i].substring(0,p)),
                value=decodeURIComponent(list[i].substring(p+1));
            cookie[name] = value;
        }
        return cookie;
    },
    // 设置cookie
    setCookie:function(name,value,expires,path,domain,secure){
        var cookie = encodeURIComponent(name)+ '=' +encodeURIComponent(value);
        if(expires){
            cookie+=';expires='+expires.toGMTString();//有效时间
        }
        if(path){
            cookie+=';path='+path;
        }
        if(domain){
            cookie+=';domain='+domain;
        }
        if(secure){
            cookie+=';secure='+secure;
        }
        document.cookie = cookie;
    },
    delCookie:function(name,value){
        var expire = new Date();
        expire.setDate(expire.getDate()-1);
        this.setCookie(name,value,expire);
    },
    addClass:function(ele,clazz){
        var current = ele.className || '';
        if ((' ' + current + ' ').indexOf(' ' + clazz + ' ') < 0) {
            ele.className = current? ( current + ' ' + clazz ) : clazz;
        }
    },
    delClass:function(ele,clazz){
        var current = ele.className || '';
        ele.className = (' ' + current + ' ').replace(' ' + clazz + ' ', ' ').trim();
    },
    toggleClass:function(ele,clazz){
        var className = ' ' + ele.className + ' ';
        if(className.indexOf(' '+clazz+' ') < 0){
            this.addClass(ele,clazz);
        }else{
            this.delClass(ele,clazz);
        }
    },
    //兼容设置dataset中name属性的值
    setData:function(ele,name,value){
        if(ele.dataset){
            ele.dataset[name] = value;
        }else{
            ele.setAttribute('data-'+name,value);
        }
    },
    //兼容获取dataset中name属性的值
    getData:function(ele,name){
        if(ele.dataset){
            return ele.dataset[name];
        }else{
            return ele.getAttribute('data-'+name);
        }
    },
    extend:function(a1,a2){
        if(!a2) return;
        for(var a in a2){
            if(a1[a] === undefined){
                a1[a] = a2[a];
            }
        }
    },
    html2node:function(html){
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.children[0];
    },
    //css3兼容性判断
    support:(function(){
        var prefix = ['webkit','ms','o','moz'],
            htmlstyle;
        return function(style){
            !htmlstyle && (htmlstyle = document.documentElement.style);
            if(style in htmlstyle) return !0;
            for(var i=0;i<prefix.length;i++){
                if('-'+prefix[i]+'-'+style in htmlstyle)
                return !0;
            }
            return !1;
        }
    })()
};
util.emiter = {
    on:function(e,f){
        this.handler = this.handler||{};
        this.handler[e] = this.handler[e]||[];
        this.handler[e].push(f);
    },
    off:function(e,f){
        if(!e || !this.handler){
            this.handler = {};
            return;
        }
        if(!this.handler[e] || !f){
            this.handler[e] = [];
            return;
        } 
        for(var i=0;i<this.handler[e].length;i++){
            if(this.handler[e][i] === f){
                this.handler[e].splice(i,1);
                i--;
            }
        }
    },
    emit:function(e){
        var args = [].slice.call(arguments,1);
        if(this.handler && this.handler[e]){
            for(var i=0;i<this.handler[e].length;i++){
                this.handler[e][i].apply(this,args);
            }
        }
    } 
};
//添加js模块加载函数
util.loadScript = (function(){
    var head = document.getElementsByTagName('head')[0],
        cache={};
    //加载js文件 src路径  请求完成后执行callback
    function loadScript(src,callback){
        if(cache[src]){//已经加载过
            callback();
            return;
        }
        cache[src] = 1;//标记 已经加载过
        var script = document.createElement('script');
        script.type='text/javascript';      
        script.src = src;
        head.appendChild(script);
        script.onload = script.onreadystatechange= function(){
            if(script.readyState){
                if(/[loaded|complete]/.test(script.readyState)){
                    removeScript(script);
                    callback();
                }
            }else{
                removeScript(script);
                callback();
            }
        }
        script.onerror = function(){
            removeScript(script);
            throw 'load source:'+src+' error';
        }
    }
    function removeScript(script){
        script.onload = script.onreadystatechange = script.onerror = null;
        if(script.parentNode){
            script.parentNode.removeChild(script);
        }
    }
    return loadScript;
})();
//参考JSP语法的模板引擎,格式:<%这里放js代码%>,<%=这里输出js变量%>
util.template = (function(){
    var _tpl = {},//模板存储
        _fn = {},//模板解析函数存储
        _sd = +new Date;//seed 存储种子(索引)
    function parse(tpl){
        _tpl[_sd] = tpl;
        return _sd++;
    }
    function compile(sd){
        if(!_fn[sd]){
            //以%>尾分割,得到至多包含一个<%|<%= 的子片段
            var frags = _tpl[sd].split('%>'),
                codes = ['var ret = [];','with(data){'],
                idx,lfrag,rfrag;
            for(var i=0;i<frags.length;i++){
                //以<%|<%= 分割,区分字符串和js代码
                idx = frags[i].indexOf('<%');
                if(idx < 0){
                    lfrag = frags[i];
                    rfrag = '';
                }else{
                    lfrag = frags[i].substring(0,idx);
                    rfrag = frags[i].substring(idx);
                }
                if(lfrag){
                    codes.push('ret.push("'+lfrag.replace(/\n|\r/g,'').replace(/\"/g,'\\"')+'");');
                }
                if(rfrag){
                    if(rfrag.indexOf('<%=') == 0){
                        codes.push('ret.push('+rfrag.substring(3)+');');
                    }else{
                        codes.push(rfrag.substring(2));
                    }
                }
            }
            codes.push('}');
            codes.push('return ret.join("");');
            _fn[sd] = new Function('data',codes.join(''));     
        }
        return _fn[sd];
    }
    function merge(sd,data){
        if(!_tpl[sd]) return ;
        return compile(sd)(data);
    }
    return{
        parse:parse,
        merge:merge
    };
})();
//添加 ajax
util.ajax = (function(){
   /*ajax封装
    *param格式{method:请求方式,默认GET,
    *       data:请求参数,
    *       asyn:是否异步,默认true,
    *       url:请求地址,
    *       sucCallback:请求成功回调,
    *          failCallback:请求失败回调
    *       }
    */
    function ajax(param){
        var xmlHttp = new XMLHttpRequest(),
            data = param.data ? serialize(param.data) : null,
            asyn = param.asyn === undefined ? true : param.asyn,
            url = param.url;
        if(!param.method || param.method == 'GET'){
            if(data){
                url += '?'+data;
            }
            xmlHttp.open('GET',url,asyn);
            xmlHttp.send(null);
        }else{
            xmlHttp.open('POST',url,asyn);
            xmlHttp.setRequestHeader("content-Type","application/x-www-form-urlencoded");
            xmlHttp.send(data);
        }
        xmlHttp.onreadystatechange = function(){
            if(xmlHttp.readyState === 4){
                //request success
                if(xmlHttp.status >= 200 && xmlHttp.status < 300 || xmlHttp.status === 304){
                    param.sucCallback&&param.sucCallback(xmlHttp.responseText);
                }else{
                    param.failCallback&&param.failCallback();
                }     
            }
        }; 
    }
    //请求参数url编码
    function serialize(data){
        if(!data) return '';
        var pairs = [];
        for(var name in data){
            if(!data.hasOwnProperty(name)) continue;
            if(typeof data[name] === 'function') continue;
            var value = data[name].toString();
            name = encodeURIComponent(name);
            value = encodeURIComponent(value);
            pairs.push(name+'='+value);
        }
        return pairs.join('&');
    }
    return ajax;
})();
//添加move
(function(util){
    /**
     * [move 运动函数]
     * @param  {[element]}   obj    [运动的物体]
     * @param  {[obj]}   attrValue [运动的属性和值组成的对象，如{left:300px,height:100px}]
     * @param  {[number]}   duration  [运动时长]
     * @param  {Function} callback  [运动完成后的回调]
     * @return {[undefined]}       
     **/
    //定时器
    function move(obj,attrValue,duration,callback){
        //运动回调间隔25ms
        var times = Math.round(duration/25),
            attrs = [],
            targets = [],
            speeds = [];
        for(var attr in attrValue){
            attrs.push(attr);
            targets.push(attrValue[attr]);
            var speed = (attrValue[attr] - getStyle(obj,attr))/times;
            //speed最小|0.5|,防止小数存储失真引起的bug
            if(speed <= 0 && speed > -0.5){
                speed = -0.5;
            }else if(speed > 0 && speed < 0.5){
                speed = 0.5;
            }
            speeds.push(speed);
        }
        clearInterval(obj.timer);
        obj.timer = setInterval(function(){
            var finishCount = 0;
            for(var i=0;i<attrs.length;i++){
                var crtAttr = getStyle(obj,attrs[i]);
                if(Math.abs(speeds[i]) >= Math.abs(targets[i] - crtAttr)){//最后一次运动
                    setAttr(obj,attrs[i],targets[i]);
                    finishCount ++;
                }else{
                    setAttr(obj,attrs[i],crtAttr+speeds[i]);  
                }        
            }
            if(finishCount === attrs.length){
                clearInterval(obj.timer);
                callback && callback();
            }
        },25);
    }
    //设置元素属性 
    function setAttr(obj,attr,value){
        if(attr == "opacity"){
            obj.style.opacity = value/100;
            obj.style.filter="alpha(opacity="+value+")";
        }else {
            obj.style[attr] = value+'px';
        }
    }       
    //获得元素某一属性的值  返回float
    function getStyle(obj,attr){
        var style = obj.currentStyle || getComputedStyle(obj, false);   
        //透明度获取方法有差别
        if(attr == "opacity"){
            if(typeof style.opacity == 'string'){
                return style.opacity*100;
            }else{
                //IE8
                if(!obj.filters.alpha){
                    //没写alpha情况  默认为100
                    return 100;
                }
                return obj.filters.alpha.opacity;
            }
        }else{
            var result = parseFloat(style[attr]);
            if(isNaN(result)){
                result = 0;
            }
            return result;
        }
    }
    util.move = move;
    util.getStyle = getStyle;
    util.setAttr = setAttr;
})(util);
//css3 transition|animation动画,添加class执行,执行完后删除class
util.animate = (function(util){
    var testNode = document.createElement('div'), 
        transitionEnd = 'transitionend', 
        animationEnd = 'animationend', 
        transitionProperty = 'transition', 
        animationProperty = 'animation';
    if(!('ontransitionend' in window)){
        if('onwebkittransitionend' in window) {      
            // Chrome/Saf (+ Mobile Saf)/Android
            transitionEnd = ' webkitTransitionEnd';
            transitionProperty = 'webkitTransition'
        }else if('onotransitionend' in testNode || navigator.appName === 'Opera') {
            // Opera
            transitionEnd = ' oTransitionEnd';
            transitionProperty = 'oTransition';
        }
    }
    if(!('onanimationend' in window)){
        if ('onwebkitanimationend' in window){
            // Chrome/Saf (+ Mobile Saf)/Android
            animationEnd = ' webkitAnimationEnd';
            animationProperty = 'webkitAnimation';
        }else if ( 'onoanimationend' in testNode ){
            // Opera
            animationEnd = ' oAnimationEnd';
            animationProperty = 'oAnimation';
        }
    }
    function getMaxTimeout(ele){
        var timeout = 0,
        tDuration = 0,
        tDelay = 0,
        aDuration = 0,
        aDelay = 0,
        ratio = 5 / 3,
        styles ;
        if(window.getComputedStyle){
            styles = window.getComputedStyle(ele),
            tDuration = getMaxTime( styles[transitionProperty + 'Duration']) || tDuration;
            tDelay = getMaxTime( styles[transitionProperty + 'Delay']) || tDelay;
            aDuration = getMaxTime( styles[animationProperty + 'Duration']) || aDuration;
            aDelay = getMaxTime( styles[animationProperty + 'Delay']) || aDelay;
            timeout = Math.max( tDuration+tDelay, aDuration + aDelay );
        }
        return timeout * 1000 * ratio;
    }
    function getMaxTime(str){
        var maxTimeout = 0, time;
        if(!str) return 0;
        str.split(",").forEach(function(str){
            time = parseFloat(str);
            if( time > maxTimeout ) maxTimeout = time;
        });
        return maxTimeout;
    }
    function animate(ele,className,callback){
        var timeout, tid,
            called = false;
        function onAnimateEnd(event){
            // 当动画并不是由当前目标触发
            if(event && event.target !== ele) return;
            if(called) return;
            called = true;
            if(tid) clearTimeout(tid);
            // 确保下次进入无误
            util.delClass(ele, className);
            util.removeEvent(ele,animationEnd,onAnimateEnd);
            util.removeEvent(ele,transitionEnd,onAnimateEnd);
            callback && callback();
        };
        util.addClass(ele,className );
        timeout = getMaxTimeout(ele);
        // 定时是为了应对，上述判断失效的情况
        tid = setTimeout(onAnimateEnd,timeout);
        util.addEvent(ele,animationEnd,onAnimateEnd);
        util.addEvent(ele,transitionEnd,onAnimateEnd);
    }
    return animate;
})(util);