/**
 * News Object 
 */
var news = {
  host: "http://sismeiro.com",
  source: "db",
  n: 0,
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
        type: "GET",
        dataType: "json",
        async: true,
        global: false,
        timeout: 5e3,
        url: news.host + "/?action=iLike&src=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(news.token),
        success: function(e) {
          if (e !== undefined) {            
            if (e.status === "ok") {
              
              setTimeout(function() {
                news.swipelock = false;
                $("#pref").remove();
                
                $("#" + news.swipelockid).animate({marginLeft: "+=200"}, 200, function() {
                  $("html, body").animate({scrollTop: $("#" + news.swipelockid).position().top + 187}, 300, function() {news.swipelockid = ""});
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
      })
    } else {
      alert("Please Log In!");
    }
  },
  
  iHate: function() {
    
    var e = $("#" + news.swipelockid + " a").attr("href");
    
    if (false !== news.token) {
      
      $.ajax({
        type: "GET",
        dataType: "json",
        async: true,
        global: false,
        timeout: 5e3,
        url: news.host + "/?action=iHate&src=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(news.token),
        success: function(e) {
          
          if (e !== undefined) {
            
            if (e.status === "ok") {
              
              setTimeout(function() {
                news.swipelock = false;
                $("#pref").remove();
                $("#" + news.swipelockid).animate({marginLeft: "+=200"}, 200, function() {$(this).fadeOut("slow"); news.swipelockid = "";});                
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
    
    $.ajax({
      type: "GET",
      dataType: "json",
      async: false,
      url: news.host + "/?action=getArticlesList&url=" + encodeURIComponent(news.source) + "&offset=" + encodeURIComponent(news.offset) + "&limit=" + encodeURIComponent(news.limit) + "&lastid=" + encodeURIComponent(news.maxid)
    }).success(function(t) {
      
      if ("ok" === t.status) {
        e = t.result;        
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
      }
    }
  },
  
  watch: function() {
    
    news.log("watch active requests : " + news.active_requests);
    news.log("watch list length : " + news.list.length);
    
    if (news.active_requests !== 0) {      
      setTimeout(function() {news.watch()}, 250);      
    } else {
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
        news.displayElement()
      }      
      news.watch();
      news.log("done");
    }
  },
  
  addRightAndLeftSwipeEvent: function(key){
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
              setTimeout(function() {e.removeClass("iHateClicked");}, 350);
              news.iHate();
            });

            $("#iLike").on("click", function() {
              var e = $(this);
              e.addClass("iLikeClicked");
              setTimeout(function() {e.removeClass("iLikeClicked")}, 350);
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
  
  displayElementAjaxDispatchSuccess: function(t,e) {
    
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
        
        $("img", i).attr({src: t.result.image.url});
        
        var s = "p-" + t.result.key;
        
        $("p", i).attr({id: s});
        
        $("#mainwrapper").append(i);
        
        $("#" + s).html("A carregar ...");
        
        $("#d-" + t.result.key).fadeIn("fast", function() {
          news.addRightAndLeftSwipeEvent(t.result.key);          
        });
        
        var o = t.result.title;
        var u = String(t.result.text).replace(/__P__/g, ""), a = String(t.result.text).replace(/__P__/g, "<br/><br/>") + "<br/><br/>";
        var f = t.result.datetime;

        if ("undefined" !== typeof t.result.likescore) {
          f = String(t.result.likescore) + " --- " + f;
        }

        u = u.substring(0, 230) + "...";        
        $("#" + String(s).replace("p-", "d-") + " a").attr({href: e});
        $("#" + String(s).replace("p-", "d-") + " a.origin").html(t.result.source);

        $("h1", $("h6", $("#" + s).html(u).parent()).html(f).parent()).html(o);

        $(".text_box", $("#d-" + t.result.key)).html(a).css({display: "none"});

        /*
        $(".text_box", $("#d-" + t.result.key)).click(function() {
          $("#d-" + t.result.key).removeClass("open");
          $(".text_box", $("#d-" + t.result.key)).css({display: "none"});
        });
        */
        
        //change content ...
        $("#d-" + t.result.key + " h1").click(function() {          
          var p = $("#p-" + t.result.key).html();
          var pf = $(".text_box", $("#d-" + t.result.key)).html();          
          $("#p-" + t.result.key).html(pf);
          $(".text_box", $("#d-" + t.result.key)).html(p);          
        });

        /*
        $("#d-" + t.result.key + " h1").swipe({
          tap: function() {            
            $("#d-" + t.result.key).addClass("open");
            $(".text_box", $("#d-" + t.result.key)).css({display: "block"});            
            $("html, body").animate({scrollTop: $("#d-" + t.result.key).position().top - 40}, 300, function() {});
          }
        });
        */

        /*
        $(".text_box", $("#d-" + t.result.key)).swipe({
          tap: function() {
            $("#d-" + t.result.key).removeClass("open");
            $(".text_box", $("#d-" + t.result.key)).css({display: "none"});
          }
        });
         */
      }
    }
  },
  
  displayElementAjaxDispatchError: function() {
    news.active_requests = news.active_requests - 1;
    news.log("error");
  },
  
  displayElement: function() {

    news.log("displayElement active requests :" + news.active_requests);

    if (news.active_requests > news.max_requests) {
      news.log("displayElement limit active requests setTimeout :" + news.active_requests);
      return;
    }

    if (news.c >= news.n) {
      news.log("displayElement count limit " + news.c + "/" + news.n);
      return;
    }

    news.addToList();

    if (news.list.length < 1) {
      return;
    }

    news.active_requests++;

    var e = news.list.shift();
    news.log("displayElement display :" + e);

    var t = news.host + "/?action=getArticle&url=" + encodeURIComponent(e) + "&width=" + news.img_width + "&height=" + news.img_height;
    news.log("displayElement count value " + news.c);

    if (news.token !== false) {
      t += "&token=" + news.token + "&p=__P__";
    }

    $.ajax({
      type: "GET",
      dataType: "json",
      global: false,
      url: t,
      timeout: 5e3,
      success: function(t) {        
        news.displayElementAjaxDispatchSuccess(t,e);
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
      type: "GET",
      dataType: "json",
      async: false,
      global: false,
      timeout: 1e4,
      url: news.host + "/?action=getToken&username=" + encodeURIComponent(t) + "&password=" + encodeURIComponent(n),
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
  
  progressbarDisable: function (){
    $("#done").css({width: "100%",height: "4px",background: "#4d4d4d"});
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
      zIndex:'1000000'
    });
  },
  
  updateMaxId: function() {
    
    if (news.c > 0) {
      setTimeout(function() {news.updateMaxId();}, 350);
      return;
    }
    
    news.progressbarReset();

    $.ajax({
      type: "GET",
      dataType: "json",
      global: false,
      url: news.host + "/?action=getMaxID&date=" + encodeURIComponent(news.date),
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
    news.showN(25);
  },
  
  infiniteScrollStart: function(e) {
    e(window).scroll(function() {
      var t = Math.round(parseInt(e(window).scrollTop()) * 100 / (parseInt(e(document).height()) - parseInt(e(window).height())));
      if (t > 99) {
        if (news.c < 1) {
          news.progressbarReset();
          news.showN();
        }
      }
    });
  }
};

/**
 * Enable News Object 
 */
jQuery(document).ready(function(e) {
  news.start();
  news.infiniteScrollStart(e);
  e("#data").blur(function() {news.date = e(this).val();news.updateMaxId();}).attr({value: "2014-01-01"});
});