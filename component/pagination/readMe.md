翻页器组件,适用绝大多数情况,依赖于component/js/util.js,
DOM结构,
	<div class="m-page">
		<a class="idx prev disable"></a>
		<a class="idx">1</a>
		<!-- <span>...</span> -->
		<a class="idx active">2</a>
		<a class="idx">3</a>
		<a class="idx">4</a>
		<a class="idx">5</a>
		<a class="idx">6</a>
		<a class="idx">7</a>
		<a class="idx">8</a>
		<span>...</span>
		<a href="" class="idx next"></a>
	</div>
	根据DOM结构自定义样式以适应多种情况
使用方法(参考demo.html)
	var page = new Pagination({
		container:$('cont-qiyi'),//容器
		total:40,//总页数
		length:8,//页码个数
		crt:7,//当前页
		prevText:'上一页',//上一页页码文本
		nextText:'下一页',//下一页页码文本
		first:1,//始终保留前几项,默认为0
		last:2,//始终保留末尾几项,默认为0
		title:'跳转至第${index}页' 
			//页码hover提示title,${index}表示当前hover的页码
	});
	//可以使用page.on指定翻页时回调函数
	page.on('turn',function(index){
		//翻页动作在这里
	});

能适用多种使用场景,ajax异步加载时作用更为明显