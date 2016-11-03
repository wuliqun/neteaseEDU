基于原生js开发的轮播组件,需引入component/js/util.js方可使用
DOM结构:
	<div class="m-sld">
		<div class="img">
			<a target="_blank" class="slide active">
				<img/>
			</a>
			<a target="_blank" class="slide">
				<img/>
			</a>
		</div>
		<a target="_blank" class="caption"> <!-- 可选 -->
			<!-- 自定义模板 -->
		</a>
		<div class="ctrl">  <!-- 可选 -->
			<ul>
				<li></li>
				<li></li>
				<li></li>
			</ul>
		</div>
		<a class="prev"></a> <!-- 可选 -->
		<a class="next"></a>
	</div>
	你可以基于此DOM结构自定义CSS样式
使用方法:
	var slide = new Slide({
		container:...,//轮播容器
		method:'slip',//轮播方法,'fade'淡出(默认),'fadeInOut' 淡入+淡出,'slip'滑动,'none'无
		autoplay:true,//是否自动轮播 默认true
		delay:...,//轮播间隔,默认5000ms
		duration:...,//播放动画时间,默认500ms
		prevNext:true,//是否需要向前向后控制按钮,默认false
		eventStyle:'click',//控制按钮响应事件类型,默认click,可为hover
		hasCtrl:...,//是否需要控制点,默认为true
		hasCaption:...,//是否需要图层上介绍caption,默认false
		captionTpl:...,//caption模板,hasCaption为true时必须,
			//模板内填充字段用${..}表示,以data相应字段填充
		data:[{//轮播里面的图片数据,
			src:'banner/banner1.jpg',
			url:'http://open.163.com/',
			alt:'网易公开课',
			captionUrl:'..'//caption上的url,默认与前面url相同
		},{
			src:'banner/banner2.jpg',
			url:'http://study.163.com/',
			alt:'云课堂'
		},{
			src:'banner/banner3.jpg',
			url:'http://www.icourse163.org/',
			alt:'中国大学MOOC'
		}]
	});
	slide.show();

slide对外提供slide(index),slidePrev(),slideNext(),show(),hide()方法
根据方法名字应该就能理解方法作用

也可以在每次播放前后绑定事件
//播放前事件 index为当前要播放的图片索引
slide.on('before.slide',function(index){})
//播放后事件
slide.on('after.slide',function(index){})

demo.html有使用示例