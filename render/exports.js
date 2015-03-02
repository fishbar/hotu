'use strict';
define(['zepto'],function($){

  function Exports(container, bg, painter){
    this.container = container;
    this.bg = bg;
    this.painter = painter;
    this.init();
  }

  Exports.prototype.init = function(){
    var painter = this.painter;
    var quality = painter.quality;
    var containerW = this.containerW = painter.containerW;
    var containerH = this.containerH = painter.containerH;
    this.canvasW = containerW*quality;
    this.canvasH = containerH*quality;
    var canvas = this.canvas = $('<canvas width="'+containerW*quality+'" height="'+containerH*quality+'"></canvas>');
    // .css({
    //   width:'100%',
    //   height:'100%',
    //   // visible:'hidden'
    // });
    // .appendTo(this.container);
    canvas = canvas[0];
    this.ctx = canvas.getContext('2d');
  };

  Exports.prototype.toImage = function(){
    var imgBg = this.bg.toImage();
    var imgPainters = this.painter.toImage();
    var ctx = this.ctx;
    ctx.drawImage(imgBg, 0,0,this.canvasW,this.canvasH);
    ctx.drawImage(imgPainters[0], 0,0,this.canvasW,this.canvasH);
    ctx.drawImage(imgPainters[1], 0,0,this.canvasW,this.canvasH);
    var data = ctx.canvas.toDataURL('image/png');
    // data = data.replace('image/png', 'image/octet-stream');
    var img = $('<img width="'+this.canvasW+'" height="'+this.canvasH+'" src="'+data+'"></img>').css({
      'width':'100%',
      'height':'auto',
    });

    return img;

    // $(imgPainter).css({
    //   'width':'100%',
    //   'height':'auto',
    // });
  };

  return Exports;
});