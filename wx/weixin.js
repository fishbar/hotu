  //http://www.baidufe.com/item/f07a3be0b23b4c9606bb.html
  //https://github.com/zxlie/WeixinApi
  'use strict';
  define(['./jweixin-1.0.0'], function(wx) {
    var body = $('body');

    function Weixin(url) {
      this.url = url;
      this.sign();
      this.genShare();
      this.events();
      // this.getFollowers();
    }

    Weixin.prototype.sign = function () {
      var self = this;
      var jsTicketUrl = encodeURIComponent(window.location.origin + window.location.pathname + window.location.search);
      $.getJSON('http://hotu.co/hotu-api/api/weixin/sign?url=' + jsTicketUrl,
        function (data, status) {
          data = data || {};
          var config = data.config;
          config.debug = false;
          wx.config(config);
          self.genShare();
        });
    };

    Weixin.prototype.getFollowers = function() {
      $.ajax({
        url: 'http://hotu.co/hotu-api/api/weixin/getfollowers',
        dataType: 'json',
        type: 'get',
        success: function (d) {
        },
        error: function (e) {
        }
      });
    };

    Weixin.prototype.getOpenid = function(obj) {
      var self = this;
      var url = this.url;
      $.ajax({
        url: 'http://hotu.co/hotu-api/api/weixin/getopenid',
        dataType: 'json',
        type: 'get',
        data: {
          'code': url.getCode()
        },
        success: function (d) {
          if (d && d.openid) {
            window.global && global.trigger('userid', d.openid);
            return obj.success(d.openid);
          }
          return obj.fail(d);
        },
        error: function (e) {
          return obj.fail(e);
        }
      });
    };

    Weixin.prototype.events = function() {
      var self = this;
      $('body')
      .on('openid', function(e, openid) {
          self.userid = openid;
          self.genShare();
        })
        .on('drawid', function(e, drawid) {
          self.drawid = drawid;
          self.genShare();
        });
    };

    Weixin.prototype.genShare = function() {
      var self = this;
      var url = this.url;

      wx.ready(function() {
        var title = '糊涂';
        var picUrl = 'http://open-wedding.qiniudn.com/tu.shu.png';
        var desc = '涂鸦神器|记录创造的瞬间';
        var state = url.genState({
          fromid: self.userid || 'null',
          // drawid: self.drawid || 'null'
        });
        var shareUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2b66f49eb82d70de&redirect_uri=http%3A%2F%2Fhotu.co%2Fhua%2F&response_type=code&scope=snsapi_base&state='+state+'#wechat_redirect';
        var shareObj = {
          title: title,
          link: shareUrl,
          imgUrl: picUrl,
          desc: desc,
          success: function() {
            // window.location.href = 'http://mankattan.mathartworld.com/hotu/';
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        };

        wx.onMenuShareTimeline(shareObj);
        wx.onMenuShareAppMessage(shareObj);
      });
    };

    return Weixin;
  });

  
