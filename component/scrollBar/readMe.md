自定义的滚动条插件,body的纵向滚动条,暂时仅支持body
	依赖于component/js/util.js
支持拖动,点击滑动,滚轮滚动,空格滚动,上下箭头滚动,pageUp,pageDown滚动
DOM结构较简单,未单独写CSS,你可以自己定制CSS:
	<div class="m-scrollbox">
		<div class="scrollbar"></div>
	</div>
使用方法:
	首先需引入util.js
	new ScrollBar().show()即可,别忘了设置body{overflow:hidden}
	可以使用scrollbar.on('before.scroll',function(){}),
			scrollbar.on('after.scroll',function(){})
		绑定滚动前后事件,功能先写上吧,万一有用呢

制作过程遇到的兼容问题
	document.body.scrollTop || document.documentElement.scrollTop
	滚轮事件方向 
		e.wheelDelta   >0 上滚  <0 下滚
		e.detail 	   >0 下滚  <0 上滚
	FireFox 独特滚轮事件 DOMMouseScroll 
