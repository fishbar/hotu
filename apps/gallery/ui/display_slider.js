'use strict';
//播放作品的面板
define(['zepto', './../../../utils/utils'], function ($, Utils) {
  var body = $('body');
  var upper = Utils.upper;
  var getPt = Utils.getPt;

  function DisplaySlider(container, opt) {
    opt = opt || {};
    this.container = container || $('.container');

    this.init();
    this.events();
  }

  DisplaySlider.prototype.init = function () {
    var container = this.container;
    var containerW = this.containerW = container.width();
    var buttonSize = this.containerH = container.height();
    var sliderW = containerW - buttonSize;
    var displayContainer = this.displayContainer = $('\
        <div class="broadcast" style="width:' + buttonSize + 'px;">\
          <i class="iconfont-broadcast iconfont-display transiton" style="display:inline-block">&#xe608;</i>\
        </div>\
        \
        <div class="slider" style="width:' + sliderW + 'px;">\
           <div class="slider-line">\
             <div class="percent-line transition-fast"></div>\
           </div>\
        </div>\
      ').appendTo(this.container);
    this.sliderNode = container.find('.slider');
    this.percentNode = container.find('.percent-line');
    this.broadcastNode = container.find('.broadcast');
  };

  ///////////////////////////////////////////////交互事件///////////////////////////////////////////
  DisplaySlider.prototype.events = function () {
    var self = this;
    // this.sliderNode.on('touchstart mousedown touchmove mousemove', function (e) {
    //   var node = $(this);
    //   var pt = getPt(e);
    //   var value = pt[0] / node.width();
    //   self.setValue(value);
    // });
    this.broadcastNode.on('touchstart mousedown', function (e) {
      if(self._begin) self._begin();
    });
  };

  DisplaySlider.prototype.setValue = function (value) {
    var percent = parseInt(100 * value) + '%';
    this.percentNode.css({
      'width': percent
    });
  };

  DisplaySlider.prototype.onBegin = function (cb) {
    this._begin = cb;
  };

  DisplaySlider.prototype.onSlider = function (cb) {
    this._slider = cb;
  };
  return DisplaySlider;
});
