define(['jquery','util'],function($,_){
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
		this.body = $(template);
		this.head = $('.desc',this.body);
		this.video = $('video',this.body);
		this.ctrl = $('.ctrl',this.body);
		this.pause = $('.pause',this.body);
		this.playBtn = $('.play-btn',this.body);
		this.videoWin = $('.video-win',this.body);
		this.videoContent = $('.video-content',this.body);
		this.total = $('.total',this.body);
		this.position = $('.pos',this.body);
		this.sound = $('.sound',this.body);
		this.soundBarBox = $('.sound-bar-box',this.body);
		this.seekSound = $('.seek-sound',this.body);
		this.full = $('.fullscreen',this.body);
		this.seekBar = $('.seek-bar',this.body);
		this.loadBar = $('.load-bar',this.body);
		this.playBar = $('.play-bar',this.body);
		$.extend(this,options);
		this._init();
		this._initEvents();
	}
	$.extend(VideoPlayer.prototype,_.emiter);
	$.extend(VideoPlayer.prototype,{
		_init:function(){
			var v = this.video[0];
			v.src = this.src;
			v.volume = 0.8;
			if(this.autoplay){
				v.autoplay = !0;
				isPlaying = !0;
				this.pause.addClass('playing');
				this.playBtn.removeClass('paused');
			}
			this.seekSound.css('height','20%');
			if(this.desc){
				this.head.html(this.desc);
			}
			if(this.poster){
				v.poster = this.poster;
			}
		},
		//播放或暂停 
		_toggle:function(){
			var v = this.video[0];
			if(!isPlaying){				
				v.play();				
			}else{				
				v.pause();				
			}
		},
		//play事件监听函数
		_play:function(){
			this.pause.addClass('playing');
			this.playBtn.removeClass('paused');
			this.timer = setInterval($.proxy(this,'_refresh'),500);
			isPlaying = !0;
		},
		//pause事件监听函数
		_pause:function(){
			this.pause.removeClass('playing');
			this.playBtn.addClass('paused');
			clearInterval(this.timer);
			isPlaying = !1;
		},
		//刷新时间,进度条,加载条等
		_refresh:function(){
			var v = this.video[0];
			this.position.html(dur2str(v.currentTime));
			var per = v.currentTime/v.duration;
			per = per*100;
			//设置播放进度条
			this.playBar.css('width',per+'%');
			//已加载
			var len = v.buffered.length;
			if(len > 0){
				var loaded = v.buffered.end(len-1);
				//设置加载进度条
				this.loadBar.css('width',(loaded/v.duration)*100+'%');
			}			
			//总时长设置,只设置一次
			if(this.total.html() == '' && v.duration > 0){
				this.total.html(dur2str(v.duration));
			}
			if(this.video.ended){
				this.pause.removeClass('playing');
				this.playBtn.addClass('paused');
				clearInterval(this.timer);
				isPlaying = !1;
			}
		},
		//全屏或收缩  
		_fullscreen:function(){
			var full = this.videoContent[0];
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
							this.videoContent.addClass('full');
						}else{
							this.videoContent.removeClass('full');
						}
						return ;
					}
					$(document).on(prefix+'fullscreenchange',function(){
						isFull = !isFull;
					});
				}
				prefix?full[prefix+'RequestFullScreen']():full.requestFullScreen();
			}
		},
		//播放位置设置  支持点击 暂不支持拖拽
		_seek:function(e){
			var v = this.video[0];
            var offsetLeft = this.playBar.offset().left;//offsetLeft,
            // 	p = this.playBar;
            // while(p = p.offsetParent){
            //     offsetLeft += p.offsetLeft;
            // }
            var eventLeft = e.pageX,
            //点击相对进度条左侧的偏移
            	left = eventLeft - offsetLeft,
            	width = this.seekBar.width();
            this.playBar.css('width',(left/width)*100+'%');
            v.currentTime = v.duration*left/width;
            this._refresh();
		},
		//静音
		_mute:function(){
			var v = this.video[0];
			if(v.muted){
				v.muted = !1;
				this.sound.removeClass('muted');
			}else{
				v.muted = !0;
				this.sound.addClass('muted');
			}
		},
		//音量设置  支持点击 暂不支持拖拽
		_setVolume:function(e){
			var v = this.video[0];
        	//取消冒泡,不触发静音事件        	
        	e.stopPropagation();
            var offsetTop = this.soundBarBox.offset().top;
            var eventTop = e.pageY;
            //点击相对音量条上方的偏移        
            var top = eventTop - offsetTop,
            	height = this.soundBarBox.height();
            this.seekSound.css('height',(top/height)*100+'%');
            v.volume = 1 - top/height;
        },
        //SPACE暂停|播放,<--后退&-->前进  15s单位,上下调节音量
        _keydown:function(e){
        	var v = this.video[0];
        	if(!showing) return;
        	var idx = keyArr.indexOf(e.keyCode);
        	if(idx > -1){
        		//响应了自定义事件,阻止默认事件
        		e.preventDefault();
        		switch(idx){
	        	case 0://SPACE 切换播放状态
	        		this._toggle();
	        		break;
	        	case 1:// left<-- 视频后退15s
	        		if(v.currentTime > 15)
	        			v.currentTime -= 15;
	        		else
	        			v.currentTime = 0;
	        		break;
	        	case 2://上  音量+0.05
	        	case 4://下  音量-0.05
	        		var volume = v.volume + (3-idx)*0.05;
	        		if(volume < 0){
	        			volume = 0;
	        		}else if(volume >1){
	        			volume = 1;
	        		}
	        		v.volume = volume;
	        		this.seekSound.css('height',(1-volume)*100+'%');
	        		break;
	        	case 3://right--> 视频前进15s
	        		if(v.duration - v.currentTime > 15)
	        			v.currentTime += 15;
	        		else
	        			v.currentTime = v.duration;
	        		break;
	        	}
        	}         	
        },
		show:function(){
			this.container=this.container || $('body');
			this.container.append(this.body);
			var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop,
				availHeight = document.documentElement.clientHeight;
				height = this.videoWin.height(),
			//top值,如果可视区比窗体高,则top为scrollHeight+可视区剩余高度一半
			//否则 top = scrollHeight
			this.videoWin.css('top',availHeight-height>0?(availHeight-height)/2+scrollHeight+'px':scrollHeight+'px');
			this.timer = setInterval($.proxy(this,'_refresh'),500);
			showing = !0;
		},
		hide:function(){
			if(isPlaying){
				this._play();
			}
			this.body.detach();
			showing = !1;
		},
		//鼠标悬停视频5秒不动,隐藏控制条和鼠标
		_hideCtrl:function(){
			var videoContent = this.videoContent;
			clearInterval(this.hoverTimer);
			videoContent.removeClass('hide-cursor');		
			this.hoverTimer = setTimeout(function(){
				videoContent.addClass('hide-cursor');
			},5000);
		},
		_initEvents:function(){
			$('.close-video,.video-mask',this.body).click($.proxy(this,'hide'));
			$('video,.play-btn,.pause',this.body).click($.proxy(this,'_toggle'));
			this.video.on('play',$.proxy(this,'_play'));
			this.video.on('pause',$.proxy(this,'_pause'));
			this.video.on('mousemove',$.proxy(this,'_hideCtrl'));
			this.full.on('click',$.proxy(this,'_fullscreen'));
			this.seekBar.on('click',$.proxy(this,'_seek'));
			this.soundBarBox.on('click',$.proxy(this,'_setVolume'));
			this.sound.on('click',$.proxy(this,'_mute'));
			$(document).on('keydown',$.proxy(this,'_keydown'));
		}
	});
	return VideoPlayer;
});