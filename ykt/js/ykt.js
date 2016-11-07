//banner轮播
!function(){
	var colorData = ['#000','#ffba00','#191919','#020202','#36605f','#f6cad9'],
		banner = $('#banner'),
		slide = new Slide({
			container:$('.container',banner),
			method:'fade',
			autoplay:true,
			duration:500,
			prevNext:true,
			data:[{
					src:'http://nos.netease.com/edu-image/19e324c3-6aa7-4ec9-abb5-f9961d946d9d0.jpg?imageView&quality=100',
					url:'',
					alt:''
				},{
					src:'http://nos.netease.com/edu-image/25d7db60-2c60-47b4-bbe8-b8ced001ef8c0.jpg?imageView&quality=100',
					url:'',
					alt:''
				},{
					src:'http://nos.netease.com/edu-image/62BEA550BC5D952D0D0C6D3C0159524C.jpg',
					url:'',
					alt:''
				},{
					src:'http://nos.netease.com/edu-image/2E1DE8A4F8CE7B3C46D0758B10E37402.jpg',
					url:'',
					alt:''
				},{
					src:'http://nos.netease.com/edu-image/0bfd467f-7f4b-4c8a-9554-8b1f4a0540d1f.png',
					url:'',
					alt:''
				},{
					src:'http://nos.netease.com/edu-image/25cfc043-bcbe-4872-90d2-3aec06cd8a559.jpg?imageView&quality=100',
					url:'',
					alt:''
				}]			
		});
	banner.style.backgroundColor = colorData[0];
	slide.on('before.slide',function(index){
		banner.style.backgroundColor = colorData[index];
	});
	slide.show();
}()

//其他逻辑
!function(){
	//获得cookie
	var cookie = util.getCookie();
	//顶部提示条逻辑
	var topinfo = $('#j-topinfo'),
		closeTopinfo = $('.close',topinfo);
	if(cookie.topinfoClosed == '1'){
		util.addClass(topinfo,'hide');
	}else{
		util.addEvent(closeTopinfo,'click',function(){
			util.addClass(topinfo,'hide');
			var date = new Date();
			date.setDate(date.getDate()+7);//过期时间1个礼拜
			util.setCookie('topinfoClosed','1',date);
		});
	}
	//用户头像hover 显示菜单逻辑
	var log = $all('.user');
	showUsermenu(log[0],$('.usermenu',log[0]));
	showUsermenu(log[1],$('.usermenu',log[1]));
	function showUsermenu(log,menu){
		var timer;
		util.addEvent(log,'mouseenter',function(){
			util.addClass(menu,'z-act');
			clearTimeout(timer);
		});
		util.addEvent(log,'mouseleave',function(){
			timer = setTimeout(function(){
				util.delClass(menu,'z-act');	
			},300);
		});
	}
	//搜索框逻辑
	var search = $all('.m-search'),
		popTplID = util.template.parse($('#j-searchTpl').innerHTML);
		initSearch(search[0]);
		initSearch(search[1]);
	function initSearch(search){
		var input = $('input',search),
			label = $('label',search),
			popContainer = $('.popcont',search);
		util.addEvent(search,'click',function(){
			input.focus();			
		});
		util.addEvent(input,'blur',function(){
			util.addClass(label,'novisi');
			//延时隐藏,防止链接点不到
			setTimeout(function(){				
				if(input !== document.activeElement){
					//有可能是框内点击
					if(!input.value.trim()){
						input.value = '';
						util.delClass(label,'novisi');
					}
					util.delClass(search,'focus');			
					util.addClass(popContainer,'hide');
				}
			},200)
		});
		util.addEvent(input,'focus',function(){
			util.addClass(search,'focus');
			if(input.value){
				util.delClass(popContainer,'hide');
			}
		});
		if('oninput' in input){
			util.addEvent(input,'input',oninput);		
		}else{
			util.addEvent(input,'propertychange',oninput);
		}
		function oninput(){
			var value = input.value.trim();
			if(value.length < 2){
				util.addClass(popContainer,'hide');
			}else{
				util.delClass(popContainer,'hide');
				var data = ajaxSearch(value);
				popContainer.innerHTML = util.template.merge(popTplID,data);
			}
		}
	}
	var morkAjaxData = {
		courseList:[{
			name:'3分钟玩爆Excel操作技能',
			url:'http://study.163.com/course/introduction/1644002.htm#/courseDetail'
		},{
			name:'PS表情包制作大法',
			url:'http://study.163.com/course/introduction/1003023008.htm'
		},{
			name:'用Python做些事',
			url:'http://study.163.com/course/introduction/1000035.htm'
		}],
		userList:[{
			name:'网易新闻学院',
			url:'http://study.163.com/u/ykt1468833969886',
			photoUrl:'http://imgsize.ph.126.net/?enlarge=true&imgurl=http://nos.netease.com/edu-image/0706E7E4D6418FFAD5965A20CBF296DE.jpg?imageView&amp;thumbnail=120y120&amp;quality=100_50x50x1x95.jpg?imageView&amp;thumbnail=120y120&amp;quality=100',
			vipDegree:'2',
			identification:'网易传媒科技（北京）有限公司'
		},{
			name:'网易云课堂',
			url:'http://study.163.com/u/385131810',
			photoUrl:'http://imgsize.ph.126.net/?enlarge=true&imgurl=http://img2.ph.126.net/tjmYft02IFpuDnMIVm3Rsg==/826973481676180487.jpg_50x50x1x95.jpg',
			vipDegree:'2',
			identification:'网易云课堂是网易公司旗下全新概念的互联网教育课堂'
		},
		{
			name:'网易100分',
			url:'http://study.163.com/u/ykt1453688273882',
			photoUrl:'http://imgsize.ph.126.net/?enlarge=true&imgurl=http://nos.netease.com/edu-image/6A44FF5B663167F238B73FBED5FC3E07.png?imageView&amp;thumbnail=120y120&amp;quality=100_50x50x1x95.png?imageView&amp;thumbnail=120y120&amp;quality=100',
			vipDegree:'2',
			identification:'网易（杭州）网络有限公司'
		}]
	}
	//这里应该调用ajax获取搜索数据,没有接口,暂时只能模拟一下
	function ajaxSearch(value){
		morkAjaxData.searchValue = value;
		return morkAjaxData;
	}
	
	// banner内导航显示隐藏逻辑
	var catelist = $('#catelist'),
		closeCates = $('#j-close-cates'),
		catenav = $('.m-cate'),
		cates = $all('.cate',catenav),
		descs = $all('.m-desc',catelist),
		curIndex = -1,
		i,len;
	for(i=0,len=cates.length;i<len;i++){
		util.addEvent(cates[i],'mouseenter',function(i){
			return function(){
				if(curIndex >= 0){
					util.delClass(cates[curIndex],'cur');
					util.delClass(descs[curIndex],'cur');
				}else{
					util.addClass(catelist,'cur');
				}				
				util.addClass(cates[i],'cur');
				util.addClass(descs[i],'cur');
				curIndex = i;
			}
		}(i));
	}
	util.addEvent(catenav,'mouseleave',function(){
		var timer = setTimeout(out,10);
		util.addEvent(catelist,'mouseenter',function(){
			clearTimeout(timer);
		});
	});
	util.addEvent(closeCates,'click',out);
	util.addEvent(catelist,'mouseleave',out);
	function out(){
		if(curIndex >= 0){
			util.delClass(catelist,'cur');
			util.delClass(cates[curIndex],'cur');
			util.delClass(descs[curIndex],'cur');
			curIndex = -1;
		}
	}
	// 微专业,点击左右移动
	var microPrev = $('#j-microprev'),
		microNext = $('#j-micronext'),
		micro = $('#j-micro'),
		count = micro.children.length,
		singleWidth = micro.children[0].offsetWidth;
	util.addClass(microPrev,'disable');//初始prev为禁用状态
	if(count <= 4){//如果不多于4个,则说明已经全部显示,prev,next都禁用
		util.addClass(microNext,'disable');
	}
	util.addEvent(microPrev,'click',function(){
		if(microPrev.className.indexOf('disable') < 0){
			var left = util.getStyle(micro,'left') + singleWidth;
			micro.style.left = left+'px';
			if(left == 0){//到达边界,禁用prev
				util.addClass(microPrev,'disable');
			}
			util.delClass(microNext,'disable');					
		}
	});
	util.addEvent(microNext,'click',function(){
		if(microNext.className.indexOf('disable') < 0){
			var left = util.getStyle(micro,'left') - singleWidth;
			micro.style.left = left+'px';
			if(left + (count-4)*singleWidth == 0){//到达边界,禁用next
				util.addClass(microNext,'disable');
			}
			util.delClass(microPrev,'disable');	
		}
	});
	// 合作机构滚动
	var insts = $('#insts'),
		instsHeight = insts.offsetHeight,
		instTimer;
	instTimer = setInterval(instup,5000);
	function instup(){
		var top = util.getStyle(insts,'top') - 20;
		if(top + instsHeight == 0){
			top = 0;
		}
		insts.style.top = top + 'px';
	}
	util.addEvent(insts,'mouseover',function(){
		clearInterval(instTimer);
	});
	util.addEvent(insts,'mouseout',function(){
		instTimer = setInterval(instup,5000);
	});
	// 各种固定定位悬浮层逻辑
	var fixnav = $('#j-fixnav'),
		fixlog = $('#j-fixlog'),
		fixleft = $('#j-fixleft'),
		fixright = $('#j-fixright'),
		closeFixlog = $('.close',fixlog),
		fixFlag = [0,0];//index=1,标记右侧悬浮,index=2标记顶部导航和底部登录选项
	scroll();//初始化,页面可能因为刷新,本身就具有滚动高度
	util.addEvent(window,'scroll',scroll);
	util.addEvent(closeFixlog,'click',function(){
		util.addClass(fixlog,'hide');
	});
	function scroll(){
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		if(scrollTop > 0){
			if(!fixFlag[0]){
				util.delClass(fixright,'hide');
				fixFlag[0] = 1;
			}
			if(scrollTop >= 700){
				if(!fixFlag[1]){
					util.delClass(fixnav,'hide');
					//此处应判断是否登录
					util.delClass(fixlog,'novisi');
					fixFlag[1] = 1;
				}
			}else{	
				if(fixFlag[1]){
					util.addClass(fixnav,'hide');
					util.addClass(fixlog,'novisi');
					fixFlag[1] = 0;
				}
			}
		}else{
			util.addClass(fixright,'hide');
			util.addClass(fixnav,'hide');
			util.addClass(fixlog,'novisi');
			fixFlag[0] = 0;
		}
	}
	//左侧浮层广告,关闭后刷新不再显示
	if(cookie.leftAdClosed != '1'){
		util.delClass(fixleft,'novisi');
		var closeFixleft = $('.close',fixleft);
		util.addEvent(closeFixleft,'click',function(){
			//关闭后设置cookie,不设置过期时间,浏览器关闭后失效
			util.addClass(fixleft,'novisi');
			util.setCookie('leftAdClosed','1');
		});
	}
	var login;
	//登录框,
	if(cookie.loged !== '1'){//判断是否已经登录
		var logins = $all('.j-login'),
			i,len;
		for(i=0,len=logins.length;i<len;i++){
			util.addEvent(logins[i],'click',showLogin);
		}
	}
	function showLogin(e){
		util.preventDft(e);
		if(!login){
			util.loadScript('js/utility/yktLogin.js',function(){
				login = new YktLogin();
				login.show();
			})
		}else{
			login.show();
		}
	}
}()
