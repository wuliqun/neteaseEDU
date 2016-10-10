(function(_){
	var template = 
	'<div class="m-video">\
		<div class="video-mask f-pf"></div>\
		<div class="video-win f-pa">\
			<div class="close-video f-pa">x</div>\
			<div class="video-box">\
				<div class="desc">请观看下面的视频</div>\
				<div class="video-content">\
					<div class="video-container">\
						<video preload="auto" height="100%" width="100%">您的浏览器不支持video标签</video>\
					</div>\
					<div class="ctrl f-pr">\
						<div class="pause f-pa">暂停</div>\
						<div class="msg-bar">\
							<div class="left f-fl">\
								<div class="play-btn paused"></div>\
								<div class="split"></div>\
								<div class="time">\
									<span class="pos">00:00</span>&nbsp;/&nbsp;<span class="total"></span>\
								</div>\
							</div>\
							<div class="right f-fr">\
								<div class="sound f-pr">\
									<div class="sound-bar-box f-pa">\
										<div class="sound-bar">\
											<div class="seek-sound f-pr">\
												<div class="sound-pos f-pa"></div>\
											</div>\
										</div>\
									</div>\
								</div>\
								<div class="quality"><span>标清</span></div>\
								<div class="fullscreen"></div>\
								<div class="split"></div>\
								<div class="video-logo"></div>\
							</div>\
						</div>\
					</div>\
					<div class="seek-bar f-pr">\
						<div class="load-bar"></div>\
						<div class="play-bar f-pa">\
							<div class="drag f-pa"></div>\
						</div>\
					</div>\
				</div>\
			</div>\
		</div>\
	</div>';
	function padding(num){
		return num < 10 ? '0'+num:''+num;
	}
	function dur2str(duration){
		if(!duration){
			return '00:00';
		}
		var ret = '';
		while(duration >= 1){
			duration = Math.floor(duration);
			ret = ':'+ padding(duration%60) + ret;
			duration /= 60;
		}
		if(!ret){
			return '00:00';
		}else if(ret.length == 3){
			return '00'+ret;
		}
		return ret.substring(1);
	}
	//播放状态,默认为true
	var isPlaying = !1,
	//是否全屏,默认false
	    isFull = !1,
	    morkFull = !1,//模拟全屏
	//播放器窗体是否显示,默认false
		showing = !1,
	//keyCodeArr,自定义响应的keyCode数组
		keyArr = [32,37,38,39,40],
	//fullscreen前缀
		prefix;
	/**
	 * @param options={
	 *    container:...,默认body
	 *    src:...,
	 *    desc:...,
	 *    poster:...,
	 *    autoplay:...默认false
	 * }
	 */
	function VideoPlayer(options){
		this.body = this._layout.cloneNode(true);
		this.close = $s(this.body,'close-video')[0];
		this.head = $s(this.body,'desc')[0];
		this.mask = this.body.children[0];
		this.video = $t(this.body,'video')[0];
		this.videoWin = $s(this.body,'video-win')[0];
		this.videoContent = $s(this.body,'video-content')[0]
		this.pause = $s(this.body,'pause')[0];
		this.playBtn = $s(this.body,'play-btn')[0];
		this.total = $s(this.body,'total')[0];
		this.position = $s(this.body,'pos')[0];
		this.sound = $s(this.body,'sound')[0];
		this.soundBarBox = $s(this.body,'sound-bar-box')[0];
		this.seekSound = $s(this.body,'seek-sound')[0];
		this.full = $s(this.body,'fullscreen')[0];
		this.seekBar = $s(this.body,'seek-bar')[0];
		this.loadBar = $s(this.body,'load-bar')[0];
		this.playBar = $s(this.body,'play-bar')[0];
		_.extend(this,options);
		this._init();
		this._initEvents();
	}
	_.extend(VideoPlayer.prototype,_);
	_.extend(VideoPlayer.prototype,{
		_layout:_.html2node(template),
		_init:function(){
			this.video.src = this.src;
			this.video.volume = 0.8;
			if(this.autoplay){
				this.video.autoplay = true;
				isPlaying = !0;
				util.addClass(this.pause,'playing');
				util.delClass(this.playBtn,'paused');
			}
			this.seekSound.style.height = "20%";
			if(this.desc){
				this.head.innerHTML = this.desc;
			}
			if(this.poster){
				this.video.poster = this.poster;
			}
		},
		//播放或暂停 
		_toggle:function(){
			if(!isPlaying){				
				this.video.play();				
			}else{				
				this.video.pause();				
			}
		},
		//play事件监听函数
		_play:function(){
			util.addClass(this.pause,'playing');
			util.delClass(this.playBtn,'paused');
			this.timer = setInterval(this._refresh.bind(this),500);
			isPlaying = !0;
		},
		//pause事件监听函数
		_pause:function(){
			util.delClass(this.pause,'playing');
			util.addClass(this.playBtn,'paused');
			clearInterval(this.timer);
			isPlaying = !1;
		},
		//刷新时间,进度条,加载条等
		_refresh:function(){
			this.position.innerHTML = dur2str(this.video.currentTime);
			var per = this.video.currentTime/this.video.duration;
			per = per*100;
			//设置播放进度条
			this.playBar.style.width = per+'%';
			//已加载
			var len = this.video.buffered.length;
			if(len > 0){
				var loaded = this.video.buffered.end(len-1);
				//设置加载进度条
				this.loadBar.style.width=(loaded/this.video.duration)*100+'%';
			}			
			//总时长设置,只设置一次
			if(this.total.innerHTML == '' && this.video.duration > 0){
				this.total.innerHTML = dur2str(this.video.duration);
			}
			if(this.video.ended){
				util.delClass(this.pause,'playing');
				util.addClass(this.playBtn,'paused');
				clearInterval(this.timer);
				isPlaying = !1;
			}
		},
		//全屏或收缩  
		_fullscreen:function(){
			var full = this.videoContent;
			if(isFull){		
				prefix?document[prefix+'CancelFullScreen']():document.exitFullScreen();			
			}else{
				if(prefix === undefined){//初始化前缀 绑定document全屏改变事件	
					if(full.requestFullScreen){
						prefix = '';
					}else if(full.webkitRequestFullScreen){
						prefix = 'webkit';
					}else if(full.mozRequestFullScreen){
						prefix = 'moz';
					}else{
						//不支持全屏,模拟全屏,在浏览器窗口内全屏
						morkFull = !morkFull;
						if(morkFull){
							util.addClass(full,'full');
						}else{
							util.delClass(full,'full');
						}
						return ;
					}
					util.addEvent(document,prefix+'fullscreenchange',function(){
						isFull = !isFull;
					});
				}
				prefix?full[prefix+'RequestFullScreen']():full.requestFullScreen();
			}
		},
		//播放位置设置  支持点击 暂不支持拖拽
		_seek:function(e){
			e = e || window.event;
            var offsetLeft = this.playBar.offsetLeft,
            	p = this.playBar;
            while(p = p.offsetParent){
                offsetLeft += p.offsetLeft;
            }
            var eventLeft = e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft),
            //点击相对进度条左侧的偏移
            	left = eventLeft - offsetLeft,
            	width = this.seekBar.offsetWidth;
            this.playBar.style.width = (left/width)*100+'%';
            this.video.currentTime = this.video.duration*left/width;
            this._refresh();
		},
		//静音
		_mute:function(){
			if(this.video.muted){
				this.video.muted = !1;
				util.delClass(this.sound,'muted');
			}else{
				this.video.muted = !0;
				util.addClass(this.sound,'muted');
			}
		},
		//音量设置  支持点击 暂不支持拖拽
		_setVolume:function(e){
        	e = e || window.event;
        	//取消冒泡,不触发静音事件
        	util.cancelBubble(e);
            var offsetTop = this.soundBarBox.offsetTop,
            	p = this.soundBarBox;
            while(p = p.offsetParent){
                offsetTop += p.offsetTop;
            }
            var eventTop = e.clientY;
            if(!isFull && !morkFull){//全屏下需要加上滚动高度
            	eventTop += (document.body.scrollTop || document.documentElement.scrollTop);
            }
            //点击相对音量条上方的偏移        
            var top = eventTop - offsetTop,
            	height = this.soundBarBox.offsetHeight;
            this.seekSound.style.height = (top/height)*100+'%';
            this.video.volume = 1 - top/height;
        },
        //SPACE暂停|播放,<--后退&-->前进  15s单位,上下调节音量
        _keydown:function(e){
        	e = e || window.event;
        	console.log(e.which);
        	if(!showing) return;
        	var idx = keyArr.indexOf(e.keyCode);
        	if(idx > -1){
        		//响应了自定义事件,阻止默认事件
        		util.preventDft(e);
        		switch(idx){
	        	case 0://SPACE 切换播放状态
	        		this._toggle();
	        		break;
	        	case 1:// left<-- 视频后退15s
	        		if(this.video.currentTime > 15)
	        			this.video.currentTime -= 15;
	        		else
	        			this.video.currentTime = 0;
	        		break;
	        	case 2://上  音量+0.05
	        	case 4://下  音量-0.05
	        		var volume = this.video.volume + (3-idx)*0.05;
	        		if(volume < 0){
	        			volume = 0;
	        		}else if(volume >1){
	        			volume = 1;
	        		}
	        		this.video.volume = volume;
	        		this.seekSound.style.height = (1-volume)*100+'%';
	        		break;
	        	case 3://right--> 视频前进15s
	        		if(this.video.duration - this.video.currentTime > 15)
	        			this.video.currentTime += 15;
	        		else
	        			this.video.currentTime = this.video.duration;
	        		break;
	        	}
        	}         	
        },
        //鼠标悬停视频5秒不动,隐藏控制条和鼠标
        _hideCtrl:function(){
        	var videoCont = this.videoContent;
        	util.delClass(videoCont,'hide-cursor');
        	clearInterval(this.hoverTimer);
        	this.hoverTimer = setTimeout(function(){
        		util.addClass(videoCont,'hide-cursor');
        	},5000);
        },
        //鼠标移出视频,清除定时器,隐藏控制条
        _hideCtrl2:function(){
        	clearInterval(this.hoverTimer);
        	util.addClass(this.videoContent,'hide-cursor');
        },
		show:function(){
			this.container=this.container||document.body;
			this.container.appendChild(this.body);
			var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop,
				availHeight = document.documentElement.clientHeight;
				height = this.videoWin.offsetHeight,
			//算top值,如果可视区比窗体高,则top为scrollHeight+可视区剩余高度一半
			//否则 top = scrollHeight
			this.videoWin.style.top = availHeight-height>0?(availHeight-height)/2+scrollHeight+'px':scrollHeight+'px';
			this.timer = setInterval(this._refresh.bind(this),500);
			showing = !0;
		},
		hide:function(){
			if(isPlaying){
				this._play();
			}
			this.container.removeChild(this.body);
			showing = !1;
		},
		_initEvents:function(){
			util.addEvent(this.video,'click',this._toggle.bind(this));
			util.addEvent(this.video,'play',this._play.bind(this));
			util.addEvent(this.video,'pause',this._pause.bind(this));
			util.addEvent(this.video,'mousemove',this._hideCtrl.bind(this));
			util.addEvent(this.video,'mouseout',this._hideCtrl2.bind(this));
			util.addEvent(this.playBtn,'click',this._toggle.bind(this));
			util.addEvent(this.pause,'click',this._toggle.bind(this));
			util.addEvent(this.full,'click',this._fullscreen.bind(this));
			util.addEvent(this.close,'click',this.hide.bind(this));
			util.addEvent(this.mask,'click',this.hide.bind(this));
			util.addEvent(this.seekBar,'click',this._seek.bind(this));
			util.addEvent(this.soundBarBox,'click',this._setVolume.bind(this));
			util.addEvent(this.sound,'click',this._mute.bind(this));
			util.addEvent(document,'keydown',this._keydown.bind(this));
		}
	});
	window.utility = window.utility || {};
	utility.VideoPlayer = VideoPlayer;
})(util.emiter);