var news = {
    host: "http://sismeiro.com",
    source: "db",
    n: 0,
    date: "",
    offset: 0,
    limit: 20,
    img_width: 200,
    img_height: 200,
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
    isvalidtoken: function () {
        var e = false,
            t = $.cookie("token");
        if ("undefined" !== typeof t) {
            e = t;
            news.token = t
        } else {
            $("#loginbox").show();
            $("#trigger").click(function () {
                news.token = news.gettoken();
                if (false !== news.token) {
                    $("#loginbox").hide();
                    $.cookie.raw = true;
                    $.cookie("token", news.token, {
                        expires: 7
                    });
                    window.location.reload(true)
                }
            })
        }
        return e
    },
    ilike: function () {
        var e = $("#" + news.swipelockid + " a").attr("href");
        if (false !== news.token) {
            $.ajax({
                type: "GET",
                dataType: "json",
                async: true,
                global: false,
                timeout: 5e3,
                url: news.host + "/?action=iLike&src=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(news.token),
                success: function (e) {
                    if (e !== undefined) {
                        if (e.status === "ok") {
                            setTimeout(function () {
                                news.swipelock = false;
                                $("#pref").remove();
                                $("#" + news.swipelockid).animate({
                                    marginLeft: "+=200"
                                }, 200, function () {
                                    $("html, body").animate({
                                        scrollTop: $("#" + news.swipelockid).position().top + 187
                                    }, 300, function () {
                                        news.swipelockid = ""
                                    })
                                })
                            }, 333)
                        } else {
                            news.token = false;
                            $.removeCookie("token");
                            news.isvalidtoken();
                            alert("Please Log In!")
                        }
                    }
                },
                error: function () {
                    alert("Connection error!")
                }
            })
        } else {
            alert("Please Log In!")
        }
    },
    ihate: function () {
        var e = $("#" + news.swipelockid + " a").attr("href");
        if (false !== news.token) {
            $.ajax({
                type: "GET",
                dataType: "json",
                async: true,
                global: false,
                timeout: 5e3,
                url: news.host + "/?action=iHate&src=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(news.token),
                success: function (e) {
                    if (e !== undefined) {
                        if (e.status === "ok") {
                            setTimeout(function () {
                                news.swipelock = false;
                                $("#pref").remove();
                                $("#" + news.swipelockid).animate({
                                    marginLeft: "+=200"
                                }, 200, function () {
                                    $(this).fadeOut("slow");
                                    news.swipelockid = ""
                                })
                            }, 333)
                        } else {
                            news.token = false;
                            $.removeCookie("token");
                            news.isvalidtoken();
                            alert("Please Log In!")
                        }
                    }
                },
                error: function () {
                    alert("Connection error!")
                }
            })
        } else {
            alert("Please Log In!")
        }
    },
    loadlist: function () {
        var e = false;
        news.offset = news.page * news.limit;
        news.page++;
        $.ajax({
            type: "GET",
            dataType: "json",
            async: false,
            url: news.host + "/?action=getArticlesList&url=" + encodeURIComponent(news.source) + "&offset=" + encodeURIComponent(news.offset) + "&limit=" + encodeURIComponent(news.limit) + "&lastid=" + encodeURIComponent(news.maxid)
        }).success(function (t) {
            if ("ok" === t.status) {
                e = t.result;
                if (0 === news.maxid) {
                    news.maxid = t.max_id
                }
            }
        });
        return e
    },
    addtolist: function () {
        var e;
        if (news.list.length < 1) {
            e = news.loadlist();
            if (false !== e) {
                console.log("add to list");
                news.list = news.list.concat(e)
            }
        }
    },
    watch: function () {
        console.log("watch active requests : " + news.active_requests);
        console.log("watch list length : " + news.list.length);
        if (news.active_requests !== 0) {
            setTimeout(function () {
                news.watch()
            }, 250)
        } else {
            console.log("end");
            console.log("total - " + news.c + "/" + news.n);
            if (news.c < news.n) {
                news.shown()
            } else {
                $("#done").css({
                    width: "100%",
                    height: "4px",
                    background: "#8E8E93"
                });
                news.c = 0
            }
        }
    },
    shown: function (e) {
        var t = 0;
        if (e !== undefined) {
            news.n = e;
            console.log("set")
        } else {
            e = news.n;
            console.log("novo")
        } if (news.c < e) {
            for (t; t < e; t++) {
                console.log("shown " + t);
                news.displayElement()
            }
            news.watch();
            console.log("done")
        }
    },
    displayElement: function () {
        console.log("displayElement active requests :" + news.active_requests);
        if (news.active_requests > news.max_requests) {
            console.log("displayElement limit active requests setTimeout :" + news.active_requests);
            return
        }
        if (news.c >= news.n) {
            console.log("displayElement count limit " + news.c + "/" + news.n);
            return
        }
        news.addtolist();
        if (news.list.length < 1) {
            return
        }
        news.active_requests++;
        var e = news.list.shift();
        console.log("displayElement display :" + e);
        var t = news.host + "/?action=getArticle&url=" + encodeURIComponent(e) + "&width=" + news.img_width + "&height=" + news.img_height;
        console.log("displayElement count value " + news.c);
        if (news.token !== false) {
            t += "&token=" + news.token + "&p=__P__"
        }
        $.ajax({
            type: "GET",
            dataType: "json",
            global: false,
            url: t,
            timeout: 5e3,
            success: function (t) {
                news.active_requests = news.active_requests - 1;
                console.log("success");
                if (null !== t) {
                    if (t.result.image !== false && (200 === parseInt(t.result.image.width), 10) && 200 === parseInt(t.result.image.height, 10) && $("#d-" + t.result.key).length < 1) {
                        news.c = news.c + 1;
                        console.log("displayElement request complete, count : " + news.c);
                        if (news.c > news.n) {
                            console.log("return");
                            news.list.push(e);
                            return
                        }
                        var n = Math.round(news.c * 100 / news.n) + "%";
                        $("#done").css({
                            width: n
                        });
                        var r = "";
                        if ("undefined" !== typeof t.result.likescore && parseInt(t.result.likescore, 10) > 10) {
                            r = "vp"
                        }
                        if ("undefined" !== typeof t.result.likescore && parseInt(t.result.likescore, 10) < 0) {
                            r = "vn"
                        }
                        var i = $($("#t1").html()).attr({
                            id: "d-" + t.result.key
                        }).addClass(r).hide();
                        $("img", i).attr({
                            src: t.result.image.url
                        });
                        var s = "p-" + t.result.key;
                        $("p", i).attr({
                            id: s
                        });
                        $("#mainwrapper").append(i);
                        $("#" + s).html("A carregar ...");
                        $("#d-" + t.result.key).fadeIn("fast", function () {
                            $("#" + "d-" + t.result.key).swipe({
                                swipeLeft: function (e, t, n, r, i) {
                                    if (!news.swipelock) {
                                        news.swipelock = true;
                                        news.swipelockid = $(this).attr("id");
                                        var s = $(this);
                                        $(this).animate({
                                            marginLeft: "-=200"
                                        }, 200, function () {
                                            $('<div id="pref" class="preference"><div id="iLike">Mais</div><div id="iHate">Menos</div></div>').insertAfter(s);
                                            $("#iHate").on("click", function () {
                                                var e = $(this);
                                                e.addClass("iHateClicked");
                                                setTimeout(function () {
                                                    e.removeClass("iHateClicked")
                                                }, 350);
                                                news.ihate()
                                            });
                                            $("#iLike").on("click", function () {
                                                var e = $(this);
                                                e.addClass("iLikeClicked");
                                                setTimeout(function () {
                                                    e.removeClass("iLikeClicked")
                                                }, 350);
                                                news.ilike()
                                            })
                                        })
                                    }
                                },
                                swipeRight: function (e, t, n, r, i) {
                                    if (news.swipelock && news.swipelockid === $(this).attr("id")) {
                                        news.swipelock = false;
                                        $("#pref").remove();
                                        $(this).animate({
                                            marginLeft: "+=200"
                                        }, 200, function () {})
                                    }
                                }
                            })
                        });
                        var o = t.result.title;
                        var u = String(t.result.text).replace(/__P__/g, ""),
                            a = String(t.result.text).replace(/__P__/g, "<br/><br/>") + "<br/><br/>";
                        var f = t.result.datetime;
                        if ("undefined" !== typeof t.result.likescore) {
                            f = String(t.result.likescore) + " --- " + f
                        }
                        u = u.substring(0, 230) + "...";
                        $("#" + String(s).replace("p-", "d-") + " a").attr({
                            href: e
                        });
                        $("h2", $("h6", $("#" + s).html(u).parent()).html(f).parent()).html(o);
                        $(".text_box", $("#d-" + t.result.key)).html(a).css({
                            display: "none"
                        });
                        $(".text_box", $("#d-" + t.result.key)).click(function () {
                            $("#d-" + t.result.key).removeClass("open");
                            $(".text_box", $("#d-" + t.result.key)).css({
                                display: "none"
                            })
                        });
                        $("#d-" + t.result.key + " h2").click(function () {
                            $("#d-" + t.result.key).addClass("open");
                            $(".text_box", $("#d-" + t.result.key)).css({
                                display: "block"
                            })
                        });
                        $("#d-" + t.result.key + " h2").swipe({
                            tap: function () {
                                $("#d-" + t.result.key).addClass("open");
                                $(".text_box", $("#d-" + t.result.key)).css({
                                    display: "block"
                                });
                                $("html, body").animate({
                                    scrollTop: $("#d-" + t.result.key).position().top - 40
                                }, 300, function () {})
                            }
                        });
                        $(".text_box", $("#d-" + t.result.key)).swipe({
                            tap: function () {
                                $("#d-" + t.result.key).removeClass("open");
                                $(".text_box", $("#d-" + t.result.key)).css({
                                    display: "none"
                                })
                            }
                        })
                    }
                }
            },
            error: function () {
                news.active_requests = news.active_requests - 1;
                console.log("error")
            }
        })
    },
    gettoken: function () {
        var e = false,
            t = "",
            n = "";
        t = $("#username").val();
        n = $("#pass").val();
        $.ajax({
            type: "GET",
            dataType: "json",
            async: false,
            global: false,
            timeout: 1e4,
            url: news.host + "/?action=getToken&username=" + encodeURIComponent(t) + "&password=" + encodeURIComponent(n),
            success: function (t) {
                if (t !== undefined) {
                    if (t.status === "ok") {
                        e = t.result.token
                    } else {
                        alert("Error! try again...")
                    }
                }
            },
            error: function () {
                alert("Error! try again...")
            }
        });
        return e
    },
    updatemaxid: function () {
        if (news.c > 0) {
            setTimeout(function () {
                news.updatemaxid()
            }, 350);
            return
        }
        $("#done").css({
            width: "0%",
            height: "4px",
            background: "#4CD964",
            backgroundImage: "linear-gradient(#87fc70, #0bd318)"
        }).parent().css({
            position: "fixed"
        });
        $.ajax({
            type: "GET",
            dataType: "json",
            global: false,
            url: news.host + "/?action=getMaxID&date=" + encodeURIComponent(news.date),
            timeout: 5e3,
            success: function (e) {
                if (e !== undefined) {
                    if (e.status === "ok") {
                        news.maxid = e.result.max_id;
                        news.c = 0;
                        news.list = [];
                        news.active_requests = 0;
                        news.page = 0;
                        $("#mainwrapper").html(" ");
                        news.shown()
                    } else {
                        alert(e.errortype)
                    }
                }
            },
            error: function () {
                alert("Connection error!")
            }
        })
    }
};


jQuery(document).ready(function (e) {
    news.isvalidtoken();
    e("#done").css({
        width: "1%",
        height: "4px",
        background: "#4CD964",
        backgroundImage: "linear-gradient(#87fc70, #0bd318)"
    });
    news.shown(25);
    e("nav").click(function () {
        e(this).toggleClass("open")
    });
    e("#data").blur(function () {
        news.date = e(this).val();
        news.updatemaxid()
    }).attr({
        value: "2014-01-01"
    });
    e(window).scroll(function () {
        var t = Math.round(parseInt(e(window).scrollTop()) * 100 / (parseInt(e(document).height()) - parseInt(e(window).height())));
        if (t > 99) {
            if (news.c < 1) {
                e("#done").css({
                    width: "1%",
                    height: "4px",
                    background: "#4CD964",
                    backgroundImage: "linear-gradient(#87fc70, #0bd318)"
                });
                news.shown()
            }
        }
    })
})