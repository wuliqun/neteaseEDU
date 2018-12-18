(function(){
	var cookie = util.getCookie();
	/*---begin顶部提示条逻辑---*/
	//顶部提示条设置
	if(cookie.noremind != '1'){
		var mInfo = $('.m-topinfo',document.body).children[0];
		//加载topInfo模块
		util.loadScript('js/utility/topInfo.js',function(){
			var topinfo = new utility.TopInfo({ //ajax获取
				container:mInfo,
				url:'',
				msg:'活动、广告等提示信息'
			});
			topinfo.show();
			//关闭后设置cookie,过期时间为活动时间
			topinfo.on('close',function(){
				var expire = new Date();
				expire.setYear(expire.getFullYear()+1);
				util.setCookie('noremind','1',expire);
			});
		});				
	}
	/*---end顶部提示条逻辑---*/

	/*---begin关注按钮逻辑---*/
	var follow = $('#follow');
	if(cookie.followSuc == '1'){
		//已经关注,调用关注成功函数,设置按钮样式
		followed();
	}else{
		//添加点击事件
		util.addEvent(follow,'click',followClick);
	}
	function followClick(){
		//已经登录,直接调用关注
		if(cookie.loginSuc == '1'){
			doFollow();
		}else{
			//调出登录
			showLoginWin();
		}
	}
	//关注
	function doFollow(){
		try{
			util.ajax({
				url:'https://study.163.com/webDev/attention.htm',
				sucCallback:setFollowCookie
			});
		}catch(e){
			util.xdr({
				url:'https://study.163.com/webDev/attention.htm',
				sucCallback:setFollowCookie
			});
		}
	}
	function setFollowCookie(data){
		if(data == '1'){
			//成功,设置cookie
			var expire = new Date();
			expire.setYear(expire.getFullYear()+1);
			util.setCookie('followSuc','1',expire);
			//调用关注成功函数
			followed();
			util.removeEvent(follow,'click',followClick);
		}
	}
	//关注成功
	function followed(){
		util.delClass(follow,'unfollow');
		util.addClass(follow,'followed');
		follow.innerHTML = '已关注<a>取消</a>';
		//点击取消delCookie,恢复关注
		var cancelFlw = follow.children[0];
		util.addEvent(cancelFlw,'click',function(e){
			//删除cookie
			util.delCookie('followSuc','1');
			util.addClass(follow,'unfollow');
			util.delClass(follow,'followed');
			follow.innerHTML = '关注';
			util.cancelBubble(e||window.event);
			util.addEvent(follow,'click',followClick);
		});
	}
	//调出登录窗口,设置登陆成功回调
	function showLoginWin(){
		util.loadScript('js/utility/loginWin.js',function()
		{
			var login = new utility.LoginWin({
				action:'https://study.163.com/webDev/login.htm',
				method:'GET',
				title:'登录网易云课堂'
			});
			//登陆成功后设置cookie,30天过期
			login.on('loginSuc',function(){
				var expire = new Date();
				expire.setDate(expire.getDate()+30);
				util.setCookie('loginSuc','1',expire);
				//更新获取的cookie
				cookie = util.getCookie();
				doFollow();
			});
			//显示窗口
			login.show();
		});
	}
	/*---end关注按钮逻辑---*/

	/*---begin课程列表逻辑---*/
	var psize = 20;//每页显示数量,根据页面宽度有所不同
	if(document.body.clientWidth < 1205){//窄屏
		psize = 15;
	}
	var params = {//获取课程数据的请求参数
		url:'https://study.163.com/webDev/couresByCategory.htm',
		data:{pageNo:1,psize:psize,type:10},
		sucCallback:setCourses
	}
	//请求课程数据	
	try{
		util.ajax(params);
	}catch(e){
		util.xdr(params);
	}
	//窗口大小改变时,更新psize,重载数据
	util.addEvent(window,'resize',function(){
		if(document.body.clientWidth < 1205){
			params.data.psize = 15;
		}else{
			params.data.psize = 20;
		}
		if(params.data.psize != psize){
			psize = params.data.psize;
			//psize改变时,重新请求数据以适应页面
			try{
				util.ajax(params);
			}catch(e){
				util.xdr(params);
			}
		}
	});
	var courseUl = $('#course'),//课程列表容器	
	 	pageBox = $('#page'),//翻页器容器
	    tabs = $('#tabs'),//tab切换ul
	    //课程列表模板
		courseSd = util.template.parse($('#courseTpl').innerHTML),
		page,//翻页器对象,放在外部
	    data;//请求获得的课程数据
	//请求获得课程数据后,设置课程
	function setCourses(text){
		data = JSON.parse(text);
		courseUl.innerHTML = util.template.merge(courseSd,data.list);
		if(!page){//初始化翻页器
			util.loadScript('js/utility/page.js',function()
			{
				page = new utility.Page({
					crt:1,
					container:pageBox,
					totalCount:data.totalPage,
					pcount:8
				});
				//点击时翻页,注入翻页函数
				page.on('turn',turnPage);
			});		
		}else{//刷新翻页器			
			page.refresh({crt:params.data.pageNo,totalCount:data.totalPage});
		}
	}
	// 翻页函数
	function turnPage(idx){
		params.data.pageNo=idx;
		params.data.type = (crtTabIndex+1)*10;
		try{
			util.ajax(params);
		}catch(e){
			util.xdr(params);
		}
	}
	// tab切换实现			
	var crtTabIndex = 0;//当前tab		
	function tab(e){
		e = e || window.event;
		var target = util.getTarget(e,'tab-item',this);
		if(!!target && target.className.indexOf('z-crt') < 0){	
			util.delClass(tabs.children[crtTabIndex],'z-crt');
			util.addClass(target,'z-crt');
			params.data.pageNo = 1;
			params.data.type = util.data(target,'type')-0;
			crtTabIndex = (params.data.type-10)/10;
			try{
				util.ajax(params);
			}catch(e){
				util.xdr(params);
			}
		}
	}
	util.addEvent(tabs,'click',tab);

	//课程hover弹窗
	var pop;//hover弹窗对象
	util.addEvent(courseUl,'mouseover',function(e){
		e = e || window.event;
		var target = util.getTarget(e,'m-img',this);
		if(!!target){
			var index=util.data(target,'index')-0;
			var options = data.list[index];
			//课程分类均为null,这里传入tab名
			//以tab名作为分类名,只是为了好看
			options.cate = ['产品设计','编程语言'][crtTabIndex];		
			if(!pop){
				util.loadScript('js/utility/pop.js',function(){
					if(!pop){
						//应对快速移动但js加载慢,重复进入本函数的情况
						pop = new utility.Pop();
					}
					pop.show(target,options);
				});
			}else{
				pop.show(target,options);
			}		
		}
	});
	/*---end课程列表逻辑---*/

	/*---begin最热列表逻辑---*/
	var hotdata,//最热列表请求得到的数据
		//最热列表模板
		hotSd = util.template.parse($('#hotTpl').innerHTML),
		//最热列表中li模板
		liSd = util.template.parse($('#li').innerHTML),
		hotBox = $('#hot'),//最热列表容器
		hotParam = {//最热列表请求参数
			url:'https://study.163.com/webDev/hotcouresByCategory.htm',
			sucCallback:setHotList
		};
	//请求最热列表成功后的回调,设置最热列表
	function setHotList(text){
		hotdata = JSON.parse(text);
		hotBox.innerHTML=util.template.merge(hotSd,hotdata.slice(0,11));
		//调用函数 设置列表滚动
		hotScroll(hotBox.children[0],10);
	}
	try{
		util.ajax(hotParam);
	}catch(e){
		util.xdr(hotParam);
	}
	/**
	* [hotScroll 最热列表滚动,
	* 思想:一共11个li,显示10个,top移动至-70px
	* 滚动出最后一个,删除第一个,top再设为0;
	* 再往最后添加一个新的.
	* @param  {[ele]} hotOl [要滚动的ul]
	* @param  {[int]} index [
	*      最后一位的数据在hotdata中的索引]
	* @return {[void]}
	*/
	function hotScroll(hotOl,index){
		//设置滚动定时器,5000ms执行一次
		setInterval(function(){				
			if(util.support('transition')){//兼容transition
				util.animate(hotOl,'up',scrollEnd);
			}else{
				util.move(hotOl,{top:-70},500,scrollEnd);
			}
		},5000);
		//滚动完毕的回调,删除第一个,往后加一个
		function scrollEnd(){
			var li = hotOl.removeChild(hotOl.children[0]);
			hotOl.style.cssText = '';
			if(++index == 20){
				index = 0;
			}
			li.innerHTML = util.template.merge(liSd,hotdata[index]);
			hotOl.appendChild(li);
		}
	}
	//IE8 xdr跨域
	function xdr(params){
		var xdr = new XDomainRequest();

	}
	/*---end最热列表逻辑---*/

	/*---begin banner轮播逻辑---*/
	var banner = $('#banner');
	new Slide({
		container:banner,
		method:'fade',
		data:[{
			src:'img/banner/banner1.jpg',
			url:'http://open.163.com/',
			alt:'网易公开课'
		},{
			src:'img/banner/banner2.jpg',
			url:'http://study.163.com/',
			alt:'云课堂'
		},{
			src:'img/banner/banner3.jpg',
			url:'http://www.icourse163.org/',
			alt:'中国大学MOOC'
		}]
	}).show();
	/*---end banner轮播逻辑---*/

	/*---begin视频逻辑---*/
	var videoPlay = $('#play');
	util.addEvent(videoPlay,'click',(function(){
		var video ;
		//闭包 video只创建一次
		return function(){		
			if(!video){
				util.loadScript('js/utility/videoPlayer.js',function(){
					video = new utility.VideoPlayer({
						src:'http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4',
						desc:'请观看下面视频',
						poster:'img/mork/poster.jpg'
					});
					video.show();
				});
			}else{
				video.show();
			}		
		}
	})());
	/*---end视频逻辑---*/
})();
