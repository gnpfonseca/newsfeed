/**
 * News Object 
 */
var news = {
  host: "https://actualida.de/api",
  source: "db",
  n: 9,
  date: "",
  offset: 0,
  limit: 20,
  img_width: 340,
  img_height: 210,
  page: 0,
  maxid: 0,
  username: "",
  password: "",
  active_requests: 0,
  max_requests: 6,
  c: 0,
  token: false,
  swipelock: false,
  swipelockid: "",
  list: [],
  stop: false,
  isDrawerOpen: false,
  isValidToken: function() {
    var e = false, t = $.cookie("token");

    if ("undefined" !== typeof t) {
      e = t;
      news.token = t;
    } else {

      $("#loginbox").show();
      $("#trigger").click(function() {
        news.token = news.getToken();
        if (false !== news.token) {
          $("#loginbox").hide();
          $.cookie.raw = true;
          $.cookie("token", news.token, {expires: 7});
          window.location.reload(true);
        }
      });

    }
    return e;
  },
  iLike: function() {
    var e = $("#" + news.swipelockid + " a").attr("href");
    if (false !== news.token) {
      $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        global: false,
        timeout: 5e3,
        url: news.host + "/",
        data: {action: 'iLike', src: e, token: encodeURIComponent(news.token)},
        success: function(e) {
          if (e !== undefined) {
            if (e.status === "ok") {

              setTimeout(function() {
                news.swipelock = false;
                $("#pref").remove();

                $("#" + news.swipelockid).animate({marginLeft: "+=200"}, 200, function() {
                  $("html, body").animate({scrollTop: $("#" + news.swipelockid).position().top + 187}, 300, function() {
                    news.swipelockid = "";
                  });
                });

              }, 333);

            } else {
              news.token = false;
              $.removeCookie("token");
              news.isValidToken();
              alert("Please Log In!");
            }
          }
        },
        error: function() {
          alert("Connection error!");
        }
      });
    } else {
      alert("Please Log In!");
    }
  },
  iHate: function() {

    var e = $("#" + news.swipelockid + " a").attr("href");

    if (false !== news.token) {

      $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        global: false,
        timeout: 5e3,
        url: news.host + "/",
        data: {action: 'iHate', src: e, token: encodeURIComponent(news.token)},
        success: function(e) {

          if (e !== undefined) {

            if (e.status === "ok") {

              setTimeout(function() {
                news.swipelock = false;
                $("#pref").remove();
                $("#" + news.swipelockid).animate({marginLeft: "+=200"}, 200, function() {
                  $(this).fadeOut("slow");
                  news.swipelockid = "";
                });
              }, 333);

            } else {
              news.token = false;
              $.removeCookie("token");
              news.isValidToken();
              alert("Please Log In!");
            }

          }
        },
        error: function() {
          alert("Connection error!");
        }
      });

    } else {
      alert("Please Log In!");
    }
  },
  loadList: function() {
    var e = false;
    news.offset = news.page * news.limit;
    news.page++;
    if (news.stop) {
      return false;
    }

    $.ajax({
      type: "POST",
      dataType: "json",
      async: false,
      url: news.host + "/",
      data: {action: 'getArticlesList',
        url: encodeURIComponent(news.source),
        offset: encodeURIComponent(news.offset),
        limit: encodeURIComponent(news.limit),
        lastid: encodeURIComponent(news.maxid)
      }
    }).success(function(t) {

      if ("ok" === t.status) {
        if (t.result.length > 0) {
          e = t.result;
        }
        if (0 === news.maxid) {
          news.maxid = t.max_id;
        }
      }

    });
    return e;
  },
  addToList: function() {
    var e;
    if (news.list.length < 1) {
      e = news.loadList();
      if (false !== e) {
        news.log("add to list");
        news.list = news.list.concat(e);
      } else {
        news.stop = true;
        return false;
      }
    }
    return true;
  },
  watch: function() {

    news.log("watch active requests : " + news.active_requests);
    news.log("watch list length : " + news.list.length);

    if (news.active_requests !== 0) {
      if (!news.stop) {
        setTimeout(function() {
          news.watch();
        }, 250);
      }
    } else {
      if (news.stop) {
        news.log('stop');
        news.progressbarDisable();
        return false;
      }
      news.log("end");
      news.log("total - " + news.c + "/" + news.n);
      if (news.c < news.n) {
        news.showN();
      } else {
        news.progressbarDisable();
        news.c = 0;
      }
    }
  },
  showN: function(e) {
    var t = 0;

    if (e !== undefined) {
      news.n = e;
      news.log("set");
    } else {
      e = news.n;
      news.log("novo");
    }

    if (news.c < e) {
      for (t; t < e; t++) {
        news.log("showN " + t);
        if (false === news.displayElement()) {
          break;
        }
      }
      news.watch();
      news.log("done");
    }
  },
  addRightAndLeftSwipeEvent: function(key) {
    $("#" + "d-" + key).swipe({
      swipeLeft: function(e, t, n, r, i) {

        if (!news.swipelock) {
          news.swipelock = true;
          news.swipelockid = $(this).attr("id");
          var s = $(this);

          $(this).animate({marginLeft: "-=200"}, 200, function() {

            $('<div id="pref" class="preference"><div id="iLike">Mais</div><div id="iHate">Menos</div></div>').insertAfter(s);

            $("#iHate").on("click", function() {
              var e = $(this);
              e.addClass("iHateClicked");
              setTimeout(function() {
                e.removeClass("iHateClicked");
              }, 350);
              news.iHate();
            });

            $("#iLike").on("click", function() {
              var e = $(this);
              e.addClass("iLikeClicked");
              setTimeout(function() {
                e.removeClass("iLikeClicked");
              }, 350);
              news.iLike();
            });

          });
        }
      },
      swipeRight: function(e, t, n, r, i) {
        if (news.swipelock && news.swipelockid === $(this).attr("id")) {
          news.swipelock = false;
          $("#pref").remove();
          $(this).animate({marginLeft: "+=200"}, 200, function() {
          });
        }
      }
    });
  },
  dispatchActionButtons: function(key) {
    $("#d-" + key + ' .toolbar button').click(function(event) {
      event.preventDefault();
      if ($(this).hasClass('love')) {
        var span = $('span', $(this));
        span.removeClass('fa-thumbs-o-up').addClass('fa-thumbs-up');
        setTimeout(function() {
          span.removeClass('fa-thumbs-up').addClass('fa-thumbs-o-up');
        }, 200);
      } else {
        var span = $('span', $(this));
        span.removeClass('fa-thumbs-o-down').addClass('fa-thumbs-down');
        setTimeout(function() {
          span.removeClass('fa-thumbs-down').addClass('fa-thumbs-o-down');
        }, 200);
      }
    });
  },
  displayElementAjaxDispatchSuccess: function(t, e) {

    news.active_requests = news.active_requests - 1;

    news.log("success");

    if (null !== t) {
      if (t.result.image !== false && (news.img_width === parseInt(t.result.image.width), 10) && news.img_height === parseInt(t.result.image.height, 10) && $("#d-" + t.result.key).length < 1) {

        news.c = news.c + 1;

        news.log("displayElement request complete, count : " + news.c);

        if (news.c > news.n) {
          news.log("return");
          news.list.push(e);
          return;
        }

        news.progressbarUpdate();

        var r = "";
        if ("undefined" !== typeof t.result.likescore && parseInt(t.result.likescore, 10) > 10) {
          r = "vp";
        }

        if ("undefined" !== typeof t.result.likescore && parseInt(t.result.likescore, 10) < 0) {
          r = "vn";
        }

        var i = $($("#t1").html()).attr({id: "d-" + t.result.key}).addClass(r).hide();

        $("img", i).first().attr({src: t.result.image.url});

        if ("undefined" !== typeof t.result.faveicon) {
          if (false !== t.result.faveicon) {
            $("img.icon", i).attr({src: t.result.faveicon});
          }
        }

        var s = "p-" + t.result.key;

        $("p", i).attr({id: s});

        $("#mainwrapper").append(i);

        $("#" + s).html("A carregar ...");

        $("#d-" + t.result.key).fadeIn("fast", function() {
          news.dispatchActionButtons(t.result.key);
          //news.addRightAndLeftSwipeEvent(t.result.key);          
        });

        var o = t.result.title;
        var u = String(t.result.text).replace(/__P__/g, ""), a = String(t.result.text).replace(/__P__/g, "<br/><br/>") + "<br/><br/>";
        var f = t.result.datetime;

        if ("undefined" !== typeof t.result.likescore) {
          f = String(t.result.likescore) + " --- " + f;
        }

        u = u.substring(0, 230) + "...";
        $("#" + String(s).replace("p-", "d-") + " a").attr({href: e});
        var html = $("#" + String(s).replace("p-", "d-") + " a.origin").html();
        $("#" + String(s).replace("p-", "d-") + " a.origin").html(html + t.result.source);
        $("#" + String(s).replace("p-", "d-") + " a.origin img").css({width: '16px'});
        $("h1", $("h6", $("#" + s).html(u).parent()).html(f).parent()).html(o);

        $(".text_box", $("#d-" + t.result.key)).html(a).css({display: "none"});


        //change content ...
        $("#d-" + t.result.key + " h1").click(function() {
          if (news.isDrawerOpen) {
            return true;
          }
          var p = $("#p-" + t.result.key).html();
          var pf = $(".text_box", $("#d-" + t.result.key)).html();
          $("#p-" + t.result.key).html(pf);
          $(".text_box", $("#d-" + t.result.key)).html(p);
          $("html, body").animate({scrollTop: $("#d-" + t.result.key).position().top + 150}, 300, function() {
          });
        });

        $("#p-" + t.result.key).click(function() {
          if (news.isDrawerOpen) {
            return true;
          }
          var p = $("#p-" + t.result.key).html();
          var pf = $(".text_box", $("#d-" + t.result.key)).html();
          $("#p-" + t.result.key).html(pf);
          $(".text_box", $("#d-" + t.result.key)).html(p);
          $("html, body").animate({scrollTop: $("#d-" + t.result.key).position().top + 150}, 300, function() {
          });
        });

        news.trackLoadDomain(e);
      }
    }
  },
  displayElementAjaxDispatchError: function() {
    news.active_requests = news.active_requests - 1;
    if ("undefined" !== typeof ga) {
      ga('send', 'exception', {'exDescription': 'Error getting article'});
    }
    news.log("error");
  },
  displayElement: function() {

    news.log("displayElement active requests :" + news.active_requests);

    if (news.active_requests > news.max_requests) {
      news.log("displayElement limit active requests setTimeout :" + news.active_requests);
      return false;
    }

    if (news.c >= news.n) {
      news.log("displayElement count limit " + news.c + "/" + news.n);
      return false;
    }

    if (!news.addToList()) {
      return false;
    }

    if (news.list.length < 1) {
      return false;
    }

    news.active_requests++;

    var postData, e = news.list.shift();
    news.log("displayElement display :" + e);

    postData = {action: 'getArticle', url: e, width: news.img_width, height: news.img_height};
    news.log("displayElement count value " + news.c);

    if (news.token !== false) {
      postData = {action: 'getArticle', url: e, width: news.img_width, height: news.img_height, token: news.token, p: '__P__'};
    }

    $.ajax({
      type: "GET",
      dataType: "json",
      global: false,
      url: news.host + "/",
      data: postData,
      cache: true,
      timeout: 5e3,
      success: function(t) {
        news.displayElementAjaxDispatchSuccess(t, e);
      },
      error: function() {
        news.displayElementAjaxDispatchError();
      }
    });

  },
  log: function(m) {
    if ("undefined" !== typeof console) {
      console.log(m);
    }
  },
  getToken: function() {
    var e = false, t = "", n = "";

    t = $("#username").val();
    n = $("#pass").val();

    $.ajax({
      type: "POST",
      dataType: "json",
      async: false,
      global: false,
      timeout: 1e4,
      url: news.host + "/",
      data: {action: 'getToken', username: encodeURIComponent(t), password: encodeURIComponent(n)},
      success: function(t) {
        if (t !== undefined) {
          if (t.status === "ok") {
            e = t.result.token;
          } else {
            alert("Error! try again...");
          }
        }
      },
      error: function() {
        alert("Error! try again...");
      }
    });

    return e;
  },
  progressbarDisable: function() {
    $("#done").css({width: "100%", height: "4px", background: "#4d4d4d"});
  },
  progressbarUpdate: function() {
    var n = Math.round(news.c * 100 / news.n) + "%";
    $("#done").css({width: n});
  },
  progressbarReset: function() {
    $("#done").css({
      width: "1%",
      height: "4px",
      background: "#4CD964",
      backgroundImage: "linear-gradient(#87fc70, #0bd318)"
    }).parent().css({
      position: "relative",
      width: "100%",
      zIndex: '1000000'
    });
  },
  updateMaxId: function() {

    if (news.c > 0) {
      setTimeout(function() {
        news.updateMaxId();
      }, 350);
      return;
    }

    news.progressbarReset();

    $.ajax({
      type: "POST",
      dataType: "json",
      global: false,
      url: news.host + "/",
      data: {action: 'getMaxID', date: encodeURIComponent(news.date)},
      timeout: 5e3,
      success: function(e) {
        if (e !== undefined) {
          if (e.status === "ok") {
            news.maxid = e.result.max_id;
            news.c = 0;
            news.list = [];
            news.active_requests = 0;
            news.page = 0;
            $("#mainwrapper").html(" ");
            news.showN();
          } else {
            alert(e.errortype);
          }
        }
      },
      error: function() {
        alert("Connection error!");
      }
    });
  },
  start: function() {
    news.isValidToken();
    news.progressbarReset();
    news.showN();
  },
  infiniteScrollStart: function(e) {
    news.navAnimate.start();
    e(window).scroll(function() {
      var t = Math.round(parseInt(e(window).scrollTop()) * 100 / (parseInt(e(document).height()) - parseInt(e(window).height())));
      if (t > 99) {
        if (news.c < 1) {
          news.progressbarReset();
          news.showN();
        }
      }
    });
  },
  openDrawer: function(e) {
    news.isDrawerOpen = true;
    news.navAnimate.on = false;
    news.navAnimate.show();
    e('.left-drawer').addClass('show');
    e('ul.items').height(parseInt(e('div.left-drawer').height(), 10) + 80);
    setTimeout(function() {
      e('body').addClass('push left');
    }, 200);
    e('.content-drawer').bind('click.close', function(event) {
      event.preventDefault();
      e(this).unbind('click.close');
      news.closeDrawer(e);
    });
  },
  closeDrawer: function(e) {
    news.isDrawerOpen = false;
    news.navAnimate.on = true;    
    e('body').removeClass('push left');
    setTimeout(function() {
      e('.left-drawer').removeClass('show');
    }, 200);
  },
  enableDrawer: function(e) {

    e('.left-drawer-trigger').bind('click.drawer', function(event) {
      event.preventDefault();
      if (parseInt(e(window).width(), 10) <= 960) {
        if (!e('body').hasClass('push')) {
          news.openDrawer(e);
        }
        else {
          news.closeDrawer(e);
        }
      }
    });

    e(window).resize(function() {
      if (parseInt(e(window).width(), 10) > 960) {
        if (news.isDrawerOpen) {
          e('body').removeClass('push left');
          e('.left-drawer').removeClass('show');
          e('.content-drawer').unbind('click.close');
        }
      }
    });
  },
  trackClickDomain: function(url) {
    if ('undefined' !== typeof ga) {
      alert('nice');
      var d = String(url).match(/:\/\/([^/]+)/)[1];
      ga('send', 'event', 'domain', 'click', d);
    }
    return true;
  },
  trackLoadDomain: function(url) {
    if ('undefined' !== typeof ga) {
      var d = String(url).match(/:\/\/([^/]+)/)[1];
      ga('send', 'event', 'domain', 'loaded', d);
    }
    return true;
  },
  navAnimate: {
    selector: '.topbar',
    lastScrollTop: 0,
    status: 'UP',
    on: true,
    x : -1,
    show: function() {
      $(this.selector).stop().animate({marginTop: '0px'}, 300);
    },
    hide: function() {
      $(this.selector).stop().animate({marginTop: '-45px'},300);
    },
    start: function() {
      var self = this,
      is_touch_device = false;
      
      if (('ontouchstart' in window)
      || (navigator.MaxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0)){
        is_touch_device = true;
      }

      if (is_touch_device){
                
        var m1=-1, m2=-1;
         
        document.body.addEventListener('touchstart', function(e){
          self.x = e.changedTouches[0].pageY;
          clearTimeout(m1);
          clearTimeout(m2);          
         }, false);

        document.body.addEventListener('touchmove', function(e){
          if (self.x !== -1 && self.on === true){
              var dist = e.changedTouches[0].pageY - self.x;                        
              if (Math.abs(dist)>20){
                 if (dist > 0){
                    self.x = -1;
                    m1 = setTimeout(function(){self.show();},10);                                                   
                 } else {
                    self.x = -1;
                    m2 = setTimeout(function(){self.hide();},10);
                 }
              }
          }
        }, false);
      } else {
        $(window).scroll(function(event) {
            if (self.on) {
                var st = $(this).scrollTop();
                if (st > self.lastScrollTop) {
                    if (self.status !== 'DOWN') {
                        self.status = 'DOWN';
                        self.hide();
                    }
                } else {
                    if (self.status !== 'UP') {
                        self.status = 'UP';
                        self.show();
                    }
                }
                self.lastScrollTop = st;
            }
        });   
      }
    }
  }
};

/**
 * Enable News Object 
 */
jQuery(document).ready(function(e) {
  news.start();
  news.infiniteScrollStart(e);
  news.enableDrawer(e);
  e("#data").blur(function() {
    news.date = e(this).val();
    news.updateMaxId();
  }).attr({value: "2014-01-01"});
});
