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
      //事件有可能由子元素触发,向上找parentNode直到找到目标元素
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
      if(e.preventDefault()){
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
            name = decodeURIComponent(list[i].substring(0,p)),
            value = decodeURIComponent(list[i].substring(p+1));
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
   },
   html2node:function(html){
      var div = document.createElement('div');
      div.innerHTML = html;
      return div.children[0];
   },
   extend:function(a1,a2){
      if(!a2) return;
      for(var a in a2){
         if(!a1[a]){
            a1[a] = a2[a];
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
          codes.push('ret.push("'+lfrag.replace(/\n|\r/g,'')
                                        .replace(/\"/g,'\\"')+'");');
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
util.move = (function(){
   /**
    * [move 运动函数]
    * @param  {[element]}   obj    [运动的物体]
    * @param  {[obj]}   attrValue [运动的属性和值组成的对象，如{left:300px,height:100px}]
    * @param  {[number]}   duration  [运动时长]
    * @param  {Function} callback  [运动完成后的回调]
    * @return {[undefined]}       
    */
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
            if(callback){
               callback();
            }
         }
      },25);
   }
   //设置元素属性 
   function setAttr(obj,attr,value){
      if(attr == "opacity"){
         obj.style.opacity = value/100;
         obj.style.filter="alpha(opacity="+value+")";
      }else {
         obj.style[attr] = value+"px";
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
         return parseFloat(style[attr]);
      }
   }
   return move;
})();
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
    } else if('onotransitionend' in testNode || navigator.appName === 'Opera') {
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
})(util)
//添加md5函数,引自https://github.com/wbond/md5-js/blob/master/md5.js
util.md5 = (function() {
  function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  function md51(s) {
    // Converts the string to UTF-8 "bytes" when necessary
    if (/[\x80-\xFF]/.test(s)) {
      s = unescape(encodeURI(s));
    }
    txt = '';
    var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  function md5blk(s) { /* I figured global was faster.   */
    var md5blks = [], i; /* Andy King said do it this way. */
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) +
                        (s.charCodeAt(i + 1) << 8) +
                        (s.charCodeAt(i + 2) << 16) +
                        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  var hex_chr = '0123456789abcdef'.split('');
  function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++)
    s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
         hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  }
  function hex(x) {
    for (var i = 0; i < x.length; i++)
    x[i] = rhex(x[i]);
    return x.join('');
  }
  function md5(s) {
    return hex(md51(s));
  }
  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }
  if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
    function add32(x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF),
          msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }
  }
  return md5;
})();

