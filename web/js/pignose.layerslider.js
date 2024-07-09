/****************************************
*
*  - PIGNOSE LayerSlider
*  - DATE    2014-08-04
*  - AUTHOR  PIGNOSE
*  - VERSION 0.0.1
*  - LICENCE MIT
*
****************************************/

(function($) {
	$.fn.pignoseLayerSlider = function(options) {
		var pignoseLayerSlider = {
			init : function(options) {
				var _this = this;

				this.settings = $.extend({
					speed       : 1200,
					interval    : 3000,
					direction   : 'right',
					easing      : 'easeInOutExpo',
					diffTime    : 300,
					controlAnim : true,
					pagination  : true,
					auto        : true,
					isLocal     : true,
					play        : null,
					pause       : null,
					next        : null,
					prev        : null,
					afterMoved  : null
				}, options);

				if(typeof $.easing         === 'undefined' &&
				   typeof window['easing'] === 'undefined'
				) {
					this.settings.easing = '';
				}

				return this.each(function() {
					var $view   = $(this);
					var $visual = $(this).children('.slide-visual');
					var $slide  = $visual.children('.slide-group');
					var $script = $visual.find('.script-group').wrap('<div class="script-inner"></div>');
					var $target = (_this.settings.isLocal === true)? $view:$(document);
					var $pagination;
					var t;

					$view.addClass('pignose-layerslider');

					if(typeof _this.settings.play !== 'undefined' &&
					   _this.settings.play !== null
					) {
						$target.find(_this.settings.play).unbind('click.slideControlHandler').bind('click.slideControlHandler', function(event) {
							if(t) {
								try {
									clearInterval(t);
								}
								catch (e) {}
							}
							t = setInterval(function() {pignoseLayerSlider.move.apply(_this, new Array(_this.settings.direction))}, _this.settings.interval);
							event.preventDefault();
						});
					}

					if(typeof _this.settings.pause !== 'undefined' &&
					   _this.settings.pause !== null
					) {
						$target.find(_this.settings.pause).unbind('click.slideControlHandler').bind('click.slideControlHandler', function(event) {
							if(t) {
								try {
									clearInterval(t);
								}
								catch (e) {}
							}
							t = null;
							event.preventDefault();
						});
					}

					if(typeof _this.settings.prev !== 'undefined' &&
					   _this.settings.play !== null
					) {
						$target.find(_this.settings.prev).unbind('click.slideControlHandler').bind('click.slideControlHandler', function(event) {
							pignoseLayerSlider.move.apply(_this, new Array(((_this.settings.direction == 'left')? 'right':'left'), 1, true));
							event.preventDefault();
						});
					}

					if(typeof _this.settings.next !== 'undefined' &&
					   _this.settings.play !== null
					) {
						$target.find(_this.settings.next).unbind('click.slideControlHandler').bind('click.slideControlHandler', function(event) {
							pignoseLayerSlider.move.apply(_this, new Array(_this.settings.direction, 1, true));
							event.preventDefault();
						});
					}

					$script.parent().after('<div class="script-tint"></div>');

					$visual.append('<div class="slide_tint left">&nbsp;</div>')
						   .append('<div class="slide_tint right">&nbsp;</div>');

					_this.$slide  = $slide.data('type', 'slide');
					_this.$script = $script.data('type', 'script');
					_this.currIdx = 0;

					if(_this.settings.pagination === true) {
						$pagination = $('<div class="slide-pagination"></div>');
						$pagination.appendTo($script.parent());
						_this.$pagination = $pagination;
					}

					$slide.add($script).each(function() {
						var $li   = $(this).children('li');
						var width = 0;
						$li.clone().appendTo($(this)).addClass('slide-dummy');
						$li.clone().prependTo($(this)).addClass('slide-dummy');

						$li.each(function(idx) {
							width += $li.width();
							if($script.length > 0 &&
							   _this.settings.pagination === true
							) {
								if($pagination.length > 0 && !$pagination.hasClass('completedPagination')) {
									$page = $('<a href="#" class="btn-page">' + (idx + 1) + '번째 슬라이드 보기</a>');
									if(idx == _this.currIdx) $page.addClass('on');
									$page.bind('click.slideControlHandler', function(event) {
										var offset    = ($(this).index() - _this.currIdx);
										var direction = 'right';
										if(offset < 0) {
											direction = 'left';
											offset *= -1;
										}
										pignoseLayerSlider.move.apply(_this, new Array(direction, offset, true));
										event.preventDefault();
									});
									$page.appendTo($pagination);
								}
							}
						});

						if($script.length > 0 &&
						   _this.settings.pagination === true
						) {
							$pagination.addClass('completedPagination')
						}

						_this[$(this).data('type')] = {
							offset     : width,
							width      : width * 3,
							widthOnce  : $li.outerWidth(true),
							length     : $li.length
						};

						$(this).css({
							display    : 'block',
							width      : _this[$(this).data('type')].width + 'px',
							marginLeft : -_this[$(this).data('type')].offset - ($li.outerWidth(true)) + 'px',
							overflow   : 'hidden'
						})
						.children('li').css({
							display    : 'block',
							float      : 'left'
						});
					});

					if(_this.settings.auto === true) {
						t = setInterval(function() {pignoseLayerSlider.move.apply(_this, new Array(_this.settings.direction))}, _this.settings.interval);
					}
				});
			},
			move : function(direction, index, custom) {
				if(typeof this.$slide  === 'undefined') return false;
				if(typeof this.$script === 'undefined') return false;
				if(typeof index        === 'undefined' ||
				          index        <=  0)           index = 1;
				
				var _this = this;
				var time  = 0;

				if((this.settings.controlAnim == true &&
				   !this.$slide.is(':animated')) ||
				   this.settings.controlAnim == false
				) {
					if(direction == 'right') {
						_this.currIdx = (_this.currIdx + index) % _this.slide.length;
						this.$slide.add(this.$script).each(function() {
							var $this = $(this);
							setTimeout(function() {
								$this.stop(true, true).animate({marginLeft : -(_this[$this.data('type')].offset + _this[$this.data('type')].widthOnce * (1 + index)) + 'px'}, {
									duration : _this.settings.speed,
									easing   : _this.settings.easing,
									complete : function() {
										$(this).children('li').slice(0, index).appendTo($this);
										$(this).css({marginLeft : -_this[$this.data('type')].offset - _this[$this.data('type')].widthOnce + 'px'});
										if(typeof _this.settings.afterMoved === 'function') _this.settings.afterMoved();
									}
								});
							}, time);
							time += _this.settings.diffTime;
						});
					}
					else if(direction == 'left') {
						_this.currIdx = (_this.currIdx - index);
						if(_this.currIdx < 0) _this.currIdx = _this.slide.length + _this.currIdx;
						this.$slide.add(this.$script).each(function() {
							var $this = $(this);
							setTimeout(function() {
								$this.stop(true, true).animate({marginLeft : -(_this[$this.data('type')].offset + _this[$this.data('type')].widthOnce * (1 - index)) + 'px'}, {
									duration : _this.settings.speed,
									easing   : _this.settings.easing,
									complete : function() {
										$(this).children('li').slice(-index).prependTo($this);
										$(this).css({marginLeft : -_this[$this.data('type')].offset - _this[$this.data('type')].widthOnce + 'px'});
										if(typeof _this.settings.afterMoved === 'function') _this.settings.afterMoved();
									}
								});
							}, time);
							time += _this.settings.diffTime;
						});
					}

					if(_this.settings.pagination === true) {
						this.$pagination.children('.btn-page').eq(_this.currIdx).addClass('on').siblings('.on').removeClass('on');
					}
				}
			}
		};

		if(pignoseLayerSlider[options]) {
			return pignoseLayerSlider[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof options === 'object' || !options) {
			return pignoseLayerSlider.init.apply(this, arguments);
		} else {
			console.log('Occurred error of an null method call');
		}
	};
})(jQuery)