'use strict';
//对UI的总体控制
define(['./../utils/utils', 'zepto', './../render/renderer', 'anim', './lightSatSelector', './hueSlider', './slider', './../utils/exif', './../utils/binaryajax'], function (Utils, $, Renderer, keyAnim, LightSatSelector, HueSlider, Slider, EXIF, Binary) {
  var BinaryFile = Binary.BinaryFile;
  var values = Utils.values,
    genCanvas = Utils.genCanvas,
    body = $('body');

  function BgTools(opt) {
    var container = this.container = opt.container;

    this.bindNode = opt.bind;

    this.init(opt.bg);
    this.uiStatus = 'null';

    this.events();

    this.status = 'select';
    this.bgToolsNode.addClass('tools-out-left');
  }

  BgTools.prototype.init = function (bg) {
    this.bg = bg;
    var toolsListN = this.toolsListN = 4,
      container = this.container,
      bgToolsW = this.container.width() - this.bindNode.width() - 10,
      bgToolsNode = this.bgToolsNode = $(
        '<div class="sub-tools">\
        <div class="brush-list"></div>\
        <div class="control-ui color-ui"></div>\
        <div class="control-ui upload-ui">\
          <div class="ui-grid">\
            <label class="label-uploader">\
            <input type="file" name="images" id="images" accept="image/*">\
            <i class="style-normal iconfont iconfont-mobile block icon-android-camera" id="background-image">&#xe601;</i>\
            <span class="icon-text gray-middle">背景图<span>\
            </label>\
          </div>\
        </div>\
      </div>')
      .css({
        'width': bgToolsW,
        'height': 'auto'
      })
      .appendTo(container);
    var colorNode = this.colorNode = bgToolsNode.find('.color-ui');
    var uploadNode = this.uploadNode = bgToolsNode.find('.upload-ui');

    this.renderControl();
  };

  BgTools.prototype.renderControl = function () {
    var colorNode = this.colorNode;
    var uploadNode = this.uploadNode;
    var bg = this.bg;
    var color = bg.color;
    var controls = bg.controls;

    var hueSlider = new HueSlider(colorNode, {
      'targetName': 'bg',
      'id': 'bg',
      'target': bg,
      'control': controls.hue
    });

    var lightSatSelector = new LightSatSelector(colorNode, {
      'targetName': 'bg',
      'id': 'bg',
      'target': bg,
      'control': controls.lightSat
    });

    var bgImageOpacitySlider = new Slider(uploadNode, {
      'key': 'bgImageOpacity',
      'targetName': 'bg',
      'id': 'bg',
      'target': bg,
      'control': controls.bgImageOpacity
    });

  };

  BgTools.prototype.out = function (cb) { //隐藏
    if (this.uiStatus === 'null') return;
    if (this.uiStatus !== 'out' && this.uiStatus !== 'lock') {
      var self = this;
      cb = cb || function () {};
      var bgToolsNode = this.bgToolsNode;
      this.uiStatus = 'lock';
      bgToolsNode.keyAnim('toolsOutLeft', {
        'time': 0.4,
        'cb': function () {
          bgToolsNode.css({
            'pointerEvents': 'none'
          });
          self.uiStatus = 'out';
        }
      });
    }
  };

  BgTools.prototype.in = function (obj, cb) { //出现
    if (this.uiStatus !== 'in' && this.uiStatus !== 'lock' && obj) {
      if (this.uiStatus === 'null') {
        this.bgToolsNode.css({
          'display': 'block'
        });
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

      cb = cb || function () {};
      var width = $(window).width() * 0.8;

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
        'bottom': 'auto',
        'minWidth': ph,
        'height': 'auto'
      });
      bgToolsNode.keyAnim('toolsInLeft', {
        'time': 0.4,
        'cb': function () {
          bgToolsNode
            .css({
              'pointerEvents': 'auto'
            });
          self.uiStatus = 'in';
          cb();
        }
      });
      //背景色
      if (obj.bgImg) obj.bgImg.addClass('float-tag-img').appendTo(floatTagAddNode);

      //提示
      // if(obj.helpText) this.floatTagHelp(obj.helpText);
    }
  };

  BgTools.prototype.switch = function (obj) {
    if (this.uiStatus !== 'in') this.in(obj);
    if (this.uiStatus == 'in') this.out(obj);
  };

  BgTools.prototype.events = function () {
    var self = this;
    var workLimit = 3000;
    this.bgToolsNode.on('touchstart mousedown', function (e) { //点击后 不要影响
    });
    body
      .off('controlrable' + '-' + 'lightSat' + '-' + 'bg' + '-' + 'bg')
      .on('controlrable' + '-' + 'lightSat' + '-' + 'bg' + '-' + 'bg', function (e, obj) {
        self.bg.setStyle(obj);
      })
      .on('painter-work', function () {
        self.out();
      })
      .on('bg-color-change', function (e, bgColor) {
        self.setBackground(bgColor);
      });

    this.uploadEvents();
  };

  BgTools.prototype.uploadEvents = function () {
    var self = this;
    var photoIpt = $('.label-uploader');
    photoIpt.on('change', function (e) {
      var file = (e.target.files || e.dataTransfer.files)[0];
      if (file) {
        if (typeof FileReader !== 'undefined' && typeof window.URL !== 'undefined') {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function (event) {
            self.previewImage(file, event);
          };
        } else if (typeof window.URL !== 'undefined') {
          self.previewImage(file);
        } else {
          return alert('亲, 您的设备不支持预览');
        }
      }
      e.preventDefault();
    });
  };

  BgTools.prototype.previewImage = function (file, e) {
    var url = window.URL.createObjectURL(file);
    var imgRotation = 0;
    if(e){
      var base64 = e.target.result.replace(/^.*?,/,'');
      var binary = atob(base64); 
      var binaryData = new BinaryFile(binary);
      var exif = EXIF.readFromBinaryFile(binaryData);
      var orientation = exif.Orientation || 1;
      var imgRotation = 0;
      switch(orientation) {
        case 3: 
          imgRotation = 180; 
          break;
        case 6: 
          imgRotation = 90; 
          break;
        case 8: 
         imgRotation = 270; 
        break;
       }
    }
    this.bg.image(url, imgRotation);
  };

  BgTools.prototype.setBackground = function (bgColor) {
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
