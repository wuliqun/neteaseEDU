var animateClass = (function(){
	var testNode = document.createElement('div');
	var transitionEnd = 'transitionend',
		animationEnd = 'animationend',
		transitionProperty = 'transition',
		animationProperty = 'animation';

	if(!('ontransitionend' in window)){
		// Chrome/Saf (+ Mobile Saf)/Android
		if('onwebkittransitionend' in window){
			transitionEnd += ' webkitTransitionEnd';
			transitionProperty = 'webkitTransition';
		//opera
		}else if('onotransitionend' in testNode && navigator.appName === 'Opera'){
			transitionEnd += ' oTransitionEnd';
			transitionProperty = 'oTransition';
		}else{
			transitionEnd = '';//不支持
		}
	}
	if(!('onaimimationend' in window)){
		if('onwebkitanimationend' in window){
			animationEnd += ' webkitAnimationEnd';
			animationProperty = 'webkitAnimation';
		}else if('onoanimationend' in testNode && navigator.appName === 'Opera'){
			animationEnd += ' oAnimationEnd';
			animationProperty = 'oAnimation';
		}else{
			animationEnd = '';//不支持
		}
	}

	function addClass(node, className){
		var current = node.className || "";
		if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
			node.className = current? ( current + " " + className ) : className;
		}
	}

	function delClass(node, className){
		var current = node.className || "";
		node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
	}
	//读取元素样式，找出耗时最长的运动，以获取运动结束时间
	//为什么乘以5/3？ 留充足的时间，防止冲突（猜测）
	function getMaxTimeout(node){
		var timeout = 0,
			tDuration = 0,
			tDelay = 0,
			aDuration = 0,
			aDelay = 0,
			ratio = 5/3,
			styles;
		if(window.getComputedStyle){
			styles = window.getComputedStyle(node);
			tDuration = getMaxTime(styles[transitionProperty+'Duration']) || tDuration;
			tDelay = getMaxTime(styles[transitionProperty+'Delay']) || tDelay;
			aDuration = getMaxTime(styles[animationProperty+'Duration']) || aDuration;
			aDelay = getMaxTime(styles[animationProperty+'Delay']) || aDelay;
			timeout = Math.max(tDuration+tDelay,aDuration+aDelay);
		}
		return timeout*1000*ratio;
	}
	function getMaxTime(str){
		var maxTime = 0,time;
		if(!str) return 0;
		str.split(',').forEach(function(str){
			time = parseFloat(str);
			if(time > maxTime) maxTime = time;
		});
		return maxTime;
	}

	function animateClass(node,className,callback){
		//至少要支持一个
		if(!transitionEnd && !animationEnd){
			callback && callback();
			return;
		}
		var tid,
			timeout,
			called = false;
		function onAnimationEnd(event){
			//事件不是由当前节点触发
			if(event && event.target !== node) return;
			if(called) return;
			called = true;
			if(tid) clearTimeout(tid);

			delClass(node,className);
			node.removeEventListener(animationEnd,onAnimationEnd);
			node.removeEventListener(transitionEnd,onAnimationEnd);
			callback && callback();
		}
		addClass(node,className);
		timeout = getMaxTimeout(node);
		//防止判断失效，包括前面的getMaxTimeout一起，不知道哪里会失效？？？
		tid = setTimeout(onAnimationEnd,timeout);

		node.addEventListener(animationEnd,onAnimationEnd);
		node.addEventListener(transitionEnd,onAnimationEnd);
	}
	return animateClass;
})()