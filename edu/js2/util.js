define(function(){
  var util = {
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
     }
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

  return util;
})