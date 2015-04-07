'use strict';
//对UI的总体控制
define(['./../utils/utils','zepto', './../render/renderer','anim','./lightSatSelector','./hueSlider','./slider'], function(Utils, $, Renderer,keyAnim, LightSatSelector, HueSlider, Slider) {
  var values = Utils.values,
  genCanvas = Utils.genCanvas,
  body = $('body');

  function BgTools(opt) {
    this.container = opt.container;
    this.bindNode = opt.bind;

    this.init(opt.bg);
    this.uiStatus = 'null';

    this.events();

    this.status = 'select';
    this.bgToolsNode.addClass('tools-out-left');
  }

  BgTools.prototype.init = function(bg) {
    this.bg = bg;
    var toolsListN = this.toolsListN = 4,
    container = this.container,
    bgToolsW = this.container.width() - this.bindNode.width() - 10,
    bgToolsNode = this.bgToolsNode = $(
      '<div class="sub-tools">\
        <div class="brush-list"></div>\
        <div class="control-ui color-ui"></div>\
        <div class="control-ui upload-ui">\
          <div class="photo-Ipt">\
            <input type="file" name="images" id="images" accept="image/*">\
            <label class="photo" for="images">\
            <img src="../assets/img/icon-camera.png" width="64" height="64">\
        <span>拍&nbsp;照</span>\
      </label>\
    </div>\
        </div>\
      </div>')
    .css({
      'width':bgToolsW,
      'height':'auto'
    })
    .appendTo(container);
    var colorNode = this.colorNode = bgToolsNode.find('.color-ui');

    this.renderControl();
  };

  BgTools.prototype.renderControl = function(){
    var colorNode = this.colorNode;
    var bg = this.bg;
    var color = bg.color;

    var hueSlider = new HueSlider(colorNode,{
      'value':color.hue/360,
      'target':'bg'
    });
    var lightSatSelector = new LightSatSelector(colorNode,{
      'value':color,
      'target':'bg'
    });

  };

  BgTools.prototype.out = function(cb) { //隐藏
    if(this.uiStatus==='null') return;
    if (this.uiStatus!=='out'&&this.uiStatus!=='lock') {
      var self = this;
      cb = cb || function() {};
      var bgToolsNode = this.bgToolsNode;
      this.uiStatus = 'lock';
      bgToolsNode.keyAnim('toolsOutLeft', {
        'time': 0.4,
        'cb': function() {
          bgToolsNode.css({
            'pointerEvents': 'none'
          });
          self.uiStatus = 'out';
        }
      });
    }
  };

  BgTools.prototype.in = function(obj ,cb) { //隐藏
    if (this.uiStatus!=='in'&&this.uiStatus!=='lock'&&obj) {
      if(this.uiStatus==='null'){
        this.bgToolsNode.css({'display': 'block'});
      }
      var self = this;
      var node = obj.node;

      var bgToolsNode = this.bgToolsNode;

      var parent = obj.parent;
      var ph = parent.height();
      bgToolsNode.css({
        'minHeight': ph,
        'minWidth': ph
      });
      var iWidth = node.width();

      cb = cb || function(){};
      var width = $(window).width()*0.8;

      this.uiStatus = 'lock';
      // 位置
      var offset = node.offset();
      var w = offset.width;
      var l = offset.left;
      var h = offset.height;
      var t = offset.top;
      var oft = 0;
      bgToolsNode.css({
        'left': l + w,
        'top': t,
        'bottom':'auto',
        'minWidth': ph,
        'height': 'auto'
      });
      bgToolsNode.keyAnim('toolsInLeft', {
        'time': 0.4,
        'cb': function() {
          bgToolsNode
          .css({
            'pointerEvents': 'auto'
          });
          self.uiStatus = 'in';
          cb();
        }
      });
      //背景色
      if(obj.bgImg) obj.bgImg.addClass('float-tag-img').appendTo(floatTagAddNode);

      //提示
      // if(obj.helpText) this.floatTagHelp(obj.helpText);
    }
  };

  BgTools.prototype.switch = function(obj) {
    if(this.uiStatus!=='in') this.in(obj);
    if(this.uiStatus=='in') this.out(obj);
  };

  BgTools.prototype.events = function() {
    var self = this;
    var workLimit = 3000;
    this.bgToolsNode.on('touchstart mousedown', function(e){//点击后 不要影响
      e.preventDefault();
    });
    body
    .on('controlrable', function(e, obj){
      var bg = self.bg;
      if(obj&&obj.target&&obj.target==='bg'){
        bg.setOptions(obj);
      }
    })
    .on('painter-work', function(){
      self.out();
      // setTimeout(function(){
      //   body.trigger('painter-');
      // }, workLimit);
    })
    .on('bg-color-change', function(e, bgColor) {
      self.setBackground(bgColor);
    });
  };


  BgTools.prototype.setBackground = function(bgColor) {
    if (bgColor) {
      var colors = bgColor.split(',');
      colors[3] = '0.95)';
      bgColor = colors.join(',');
      this.bgToolsNode.css({
        background: bgColor
      });
    }
  };

  return BgTools;
});
