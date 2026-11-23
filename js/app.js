/* 红笺工坊 — hash router and pages */
(function () {
  const UI = HJ_UI;
  const STORE = HJ_STORE;
  const DATA = HJ_DATA;

  const state = {
    hotTab: "hot",
    carouselIndex: 0,
    category: "all",
    shopTab: "all",
    keyword: "",
    sort: "default",
    showSort: false,
    listLimit: 8,
    detailTab: "desc",
    qty: 1,
    payMethod: "demo",
    openFaq: -1,
    openMsg: ""
  };

  function parseRoute() {
    let hash = location.hash || "#/";
    if (hash.charAt(0) === "#") hash = hash.slice(1);
    if (!hash) hash = "/";
    const qIndex = hash.indexOf("?");
    const path = (qIndex === -1 ? hash : hash.slice(0, qIndex)) || "/";
    const query = new URLSearchParams(qIndex === -1 ? "" : hash.slice(qIndex + 1));
    const segs = path.split("/").filter(Boolean);
    return { path: "/" + segs.join("/"), segs: segs, query: query };
  }

  function go(href) {
    if (!href) return;
    if (href.charAt(0) === "#") location.hash = href.slice(1);
    else location.hash = href;
  }

  function setRoot(html) {
    document.getElementById("app").innerHTML = html;
    bindGlobal();
  }

  function bindGlobal() {
    document.querySelectorAll("[data-href]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("button, a, input")) return;
        go(el.getAttribute("data-href"));
      });
    });
    const themeBtn = document.querySelector("[data-action='toggle-theme']");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        UI.toggleTheme();
        render();
      });
    }
  }

  function filterProducts() {
    let list = DATA.PRODUCTS.slice();
    if (state.shopTab === "fav") {
      const favs = STORE.getFavorites();
      list = list.filter(function (p) { return favs.indexOf(p.id) !== -1; });
    } else if (state.shopTab === "packages" || state.category === "monthly") {
      if (state.shopTab === "packages" && state.category === "all") {
        list = list.filter(function (p) { return p.category === "monthly"; });
      }
    }
    if (state.category && state.category !== "all") {
      list = list.filter(function (p) { return p.category === state.category; });
    }
    const kw = (state.keyword || "").trim().toLowerCase();
    if (kw) {
      const mode = STORE.getSearchMode();
      list = list.filter(function (p) {
        const title = p.title.toLowerCase();
        if (mode === "name") return title.indexOf(kw) !== -1;
        const blob = (p.title + " " + p.short + " " + (p.tags || []).join(" ") + " " + p.desc + " " + UI.categoryName(p.category)).toLowerCase();
        return blob.indexOf(kw) !== -1;
      });
    }
    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "sales") list.sort(function (a, b) { return b.sales - a.sales; });
    else if (state.sort === "new") list.sort(function (a, b) { return b.id < a.id ? -1 : 1; });
    else list.sort(function (a, b) { return b.sales - a.sales; });
    return list;
  }

  function hotList() {
    const list = DATA.PRODUCTS.slice();
    if (state.hotTab === "fav") list.sort(function (a, b) { return b.favs - a.favs; });
    else if (state.hotTab === "buy") list.sort(function (a, b) { return b.sales - a.sales; });
    else {
      const hot = list.filter(function (p) { return p.hot; });
      hot.sort(function (a, b) { return b.sales - a.sales; });
      return hot;
    }
    return list;
  }

  /* ===== Home ===== */
  function renderHome() {
    const shop = DATA.SHOP;
    const followed = STORE.isFollowed();
    const hots = hotList();
    const products = filterProducts();
    const view = STORE.getViewMode();
    const visible = products.slice(0, state.listLimit);

    const cats = DATA.CATEGORIES.map(function (c) {
      return '<button type="button" class="cat-item' + (state.category === c.id ? " active" : "") + '" data-cat="' + c.id + '">' + UI.escapeHtml(c.name) + "</button>";
    }).join("");

    const hero =
      '<section class="shop-hero">' +
      '<div class="hero-left"><div class="shop-avatar">' + UI.shopAvatar() + "</div>" +
      '<div class="shop-id"><div class="shop-name">' + UI.escapeHtml(shop.ownerLabel) +
      '<span class="shop-meta-pills"><span class="pill-score">店铺评分 ' + shop.score + '</span><span class="pill-lv">' + shop.level + "</span></span></div>" +
      '<div class="credit-row"><span class="label">商家信誉</span>' + UI.creditBadges() + "</div></div></div>" +
      '<div class="hero-mid">' + UI.heroArts() +
      (shop.verified ? '<div class="verified"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1 9.7 3.4 12.6 3l.6 2.9L16 7.2 14.2 9.6l.3 3L11.2 13 8 15 4.8 13 1.5 12.6l.3-3L0 7.2l2.8-1.3L3.4 3 6.3 3.4z" fill="#ff7a18"/><path d="M5 8.1 7 10.2 11.2 6" fill="none" stroke="#fff" stroke-width="1.5"/></svg>商家已认证</div>' : "") +
      '<div class="fans-heat">粉丝热度：<span class="heat-icons">' + UI.heatIcons(shop.fansHeat) + "</span></div></div>" +
      '<div class="hero-right"><div class="hero-actions">' +
      '<span class="btn-hot-shop">热门店铺</span>' +
      '<button type="button" class="btn-follow' + (followed ? " is-on" : "") + '" data-action="follow">' + (followed ? "已关注" : "关注店铺") + "</button>" +
      "</div>" + UI.heroMedal() + "</div></section>";

    const carouselCards = hots.map(UI.gridCard).join("");
    const hotSection =
      '<section class="page-block">' +
      '<div class="section-head"><h2 class="section-title">店铺热卖</h2>' +
      '<div class="section-tabs">' +
      '<button type="button" class="' + (state.hotTab === "hot" ? "active" : "") + '" data-hot="hot">当前热门</button>' +
      '<button type="button" class="' + (state.hotTab === "fav" ? "active" : "") + '" data-hot="fav">最多收藏</button>' +
      '<button type="button" class="' + (state.hotTab === "buy" ? "active" : "") + '" data-hot="buy">最多购买</button>' +
      "</div></div>" +
      '<div class="carousel-wrap"><button type="button" class="carousel-btn prev" data-action="caro-prev" aria-label="上一组">' + UI.icon("left") + "</button>" +
      '<div class="carousel"><div class="carousel-track" id="hot-track">' + carouselCards + "</div></div>" +
      '<button type="button" class="carousel-btn next" data-action="caro-next" aria-label="下一组">' + UI.icon("right") + "</button></div></section>";

    const listHtml = !products.length
      ? UI.emptyHtml(state.shopTab === "fav" ? "还没有收藏的服务，去店铺里挑一份吧。" : "没有找到符合条件的服务，换个关键词试试。")
      : view === "grid"
        ? '<div class="grid-list">' + visible.map(UI.gridCard).join("") + "</div>"
        : '<div class="list-stack">' + visible.map(UI.listRow).join("") + "</div>";

    const more = products.length > visible.length
      ? '<div class="load-more"><button type="button" class="btn btn-ghost" data-action="load-more">加载更多</button></div>'
      : products.length
        ? '<div class="list-end">红笺已经把这一页整理完了</div>'
        : "";

    const shopSection =
      '<section class="page-block shop-layout">' +
      '<aside class="shop-side"><div class="side-title">店铺导航</div><div class="side-panel">' + cats + "</div></aside>" +
      '<div class="shop-main">' +
      '<div class="shop-toolbar-top section-tabs">' +
      '<button type="button" class="ghost-tab' + (state.shopTab === "all" ? " active" : "") + '" data-shop-tab="all">所有商品</button>' +
      '<button type="button" class="ghost-tab' + (state.shopTab === "fav" ? " active" : "") + '" data-shop-tab="fav">我的收藏</button>' +
      '<button type="button" class="ghost-tab accent-tab' + (state.shopTab === "packages" ? " active" : "") + '" data-shop-tab="packages">热门套餐</button>' +
      "</div>" +
      '<div class="search-row">' +
      '<div class="search-modes">' +
      '<button type="button" class="' + (STORE.getSearchMode() === "name" ? "active" : "") + '" data-search-mode="name">全名称搜索</button>' +
      '<button type="button" class="' + (STORE.getSearchMode() === "keyword" ? "active" : "") + '" data-search-mode="keyword">关键词搜索</button>' +
      "</div>" +
      '<form class="search-box" id="search-form">' +
      '<input type="search" id="search-input" placeholder="请输入您要搜索的商品的全名称" value="' + UI.escapeHtml(state.keyword) + '" />' +
      '<button type="submit" aria-label="搜索">' + UI.icon("search") + "</button></form>" +
      '<div class="quick-link" id="sort-wrap"><button type="button" class="linkish" data-action="toggle-sort">快速推荐方式</button>' +
      (state.showSort
        ? '<div class="sort-pop">' +
          '<button type="button" data-sort="default" class="' + (state.sort === "default" ? "active" : "") + '">综合推荐</button>' +
          '<button type="button" data-sort="sales" class="' + (state.sort === "sales" ? "active" : "") + '">销量优先</button>' +
          '<button type="button" data-sort="price-asc" class="' + (state.sort === "price-asc" ? "active" : "") + '">价格从低到高</button>' +
          '<button type="button" data-sort="price-desc" class="' + (state.sort === "price-desc" ? "active" : "") + '">价格从高到低</button>' +
          "</div>"
        : "") +
      "</div>" +
      '<div class="view-toggle">' +
      '<button type="button" class="' + (view === "grid" ? "active" : "") + '" data-view="grid" aria-label="卡片视图">' + UI.icon("grid") + "</button>" +
      '<button type="button" class="' + (view === "list" ? "active" : "") + '" data-view="list" aria-label="列表视图">' + UI.icon("list") + "</button>" +
      "</div></div>" +
      listHtml + more +
      "</div></section>";

    setRoot(UI.layout("home", hero + hotSection + shopSection));
    bindHome();
    applyCarousel(false);
  }

  function applyCarousel(animate) {
    const track = document.getElementById("hot-track");
    if (!track) return;
    const card = track.querySelector(".product-card");
    if (!card) return;
    const gap = 16;
    const width = card.getBoundingClientRect().width + gap;
    const max = Math.max(0, track.children.length - 1);
    if (state.carouselIndex < 0) state.carouselIndex = 0;
    if (state.carouselIndex > max) state.carouselIndex = max;
    track.style.transition = animate === false ? "none" : "transform 0.35s ease";
    track.style.transform = "translateX(" + (-state.carouselIndex * width) + "px)";
  }

  function bindHome() {
    document.querySelectorAll("[data-hot]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.hotTab = btn.getAttribute("data-hot");
        state.carouselIndex = 0;
        renderHome();
      });
    });
    const prev = document.querySelector("[data-action='caro-prev']");
    const next = document.querySelector("[data-action='caro-next']");
    if (prev) prev.addEventListener("click", function () { state.carouselIndex -= 1; applyCarousel(true); });
    if (next) next.addEventListener("click", function () { state.carouselIndex += 1; applyCarousel(true); });
    window.addEventListener("resize", onResizeCarousel);
    const follow = document.querySelector("[data-action='follow']");
    if (follow) follow.addEventListener("click", function () {
      const on = STORE.toggleFollow();
      UI.toast(on ? "已关注店铺" : "已取消关注");
      renderHome();
    });
    document.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-cat");
        state.listLimit = 8;
        if (state.shopTab === "packages" && state.category !== "monthly" && state.category !== "all") {
          state.shopTab = "all";
        }
        renderHome();
      });
    });
    document.querySelectorAll("[data-shop-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.shopTab = btn.getAttribute("data-shop-tab");
        state.listLimit = 8;
        if (state.shopTab === "packages") state.category = "all";
        renderHome();
      });
    });
    document.querySelectorAll("[data-search-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        STORE.setSearchMode(btn.getAttribute("data-search-mode"));
        renderHome();
      });
    });
    const form = document.getElementById("search-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.keyword = document.getElementById("search-input").value;
      state.listLimit = 8;
      renderHome();
    });
    const sortBtn = document.querySelector("[data-action='toggle-sort']");
    if (sortBtn) sortBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      state.showSort = !state.showSort;
      renderHome();
    });
    document.querySelectorAll("[data-sort]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.sort = btn.getAttribute("data-sort");
        state.showSort = false;
        renderHome();
      });
    });
    document.querySelectorAll("[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        STORE.setViewMode(btn.getAttribute("data-view"));
        renderHome();
      });
    });
    const more = document.querySelector("[data-action='load-more']");
    if (more) more.addEventListener("click", function () {
      state.listLimit += 8;
      renderHome();
    });
  }

  function onResizeCarousel() { applyCarousel(false); }

  /* ===== Product ===== */
  function renderProduct(id) {
    const p = UI.productById(id);
    if (!p) {
      setRoot(UI.layout("home", UI.emptyHtml("没有找到这项服务") + '<p class="center"><a class="btn btn-cyan" href="#/">返回店铺</a></p>'));
      return;
    }
    state.qty = Math.max(1, state.qty || 1);
    const fav = STORE.isFav(p.id);
    const tab = state.detailTab || "desc";
    let body = "";
    if (tab === "desc") {
      body = "<p>" + UI.escapeHtml(p.desc) + "</p><h3>包含内容</h3><ul>" +
        p.includes.map(function (x) { return "<li>" + UI.escapeHtml(x) + "</li>"; }).join("") + "</ul>";
    } else if (tab === "delivery") {
      body = "<p>预计档期：" + UI.escapeHtml(p.turnaround) + "</p><p>修订说明：" + UI.escapeHtml(p.revisions) + "</p>" +
        (p.autoDeliver ? "<p>该服务标注「自动交付」，演示支付成功后可在订单详情查看示例成稿。</p>" : "<p>该服务按档期交付。演示站会将订单记为已支付，示例成稿可按需要在沟通后查看。</p>");
    } else {
      body = "<p>" + UI.escapeHtml(p.notice) + "</p><p>本站为演示站点，下单与支付不会真实扣款，也不会产生真实履约义务。</p>";
    }
    const related = DATA.PRODUCTS.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 5);
    const html =
      '<div class="crumb"><a href="#/">店铺首页</a> / <a href="#/">' + UI.escapeHtml(UI.categoryName(p.category)) + "</a> / 服务详情</div>" +
      '<div class="detail-grid">' +
      '<div class="detail-cover">' + UI.coverSvg(p.cover, 920, 560) + "</div>" +
      "<div>" +
      '<h1 class="detail-title">' + UI.escapeHtml(p.title) + "</h1>" +
      '<div class="detail-tags">' + UI.productTags(p, false) + "</div>" +
      '<div class="detail-price-box">' + UI.priceHtml(p.price) +
      '<span class="muted">' + UI.formatSales(p.sales) + " · 档期 " + p.stock + "</span></div>" +
      '<div class="detail-info">交付周期：' + UI.escapeHtml(p.turnaround) + "<br/>修订说明：" + UI.escapeHtml(p.revisions) + "</div>" +
      '<div class="qty-row"><span>数量</span><div class="qty-ctrl">' +
      '<button type="button" data-action="qty-minus">' + UI.icon("minus") + "</button>" +
      '<input id="qty-input" value="' + state.qty + '" />' +
      '<button type="button" data-action="qty-plus">' + UI.icon("plus") + "</button></div></div>" +
      '<div class="detail-actions">' +
      '<button type="button" class="btn btn-primary" data-action="buy">立即购买</button>' +
      '<button type="button" class="btn btn-cyan" data-action="add">加入购物车</button>' +
      '<button type="button" class="btn btn-ghost fav-btn' + (fav ? " is-on" : "") + '" data-action="fav">' +
      (fav ? UI.icon("heartOn") + " 已收藏" : UI.icon("heart") + " 收藏") + "</button>" +
      "</div></div></div>" +
      '<div class="detail-body panel">' +
      '<div class="subtabs">' +
      '<button type="button" class="' + (tab === "desc" ? "active" : "") + '" data-dtab="desc">服务详情</button>' +
      '<button type="button" class="' + (tab === "delivery" ? "active" : "") + '" data-dtab="delivery">交付说明</button>' +
      '<button type="button" class="' + (tab === "notice" ? "active" : "") + '" data-dtab="notice">购买须知</button>' +
      '</div><div class="rich">' + body + "</div></div>" +
      (related.length ? '<div class="page-block"><h2 class="section-title">同类服务</h2><div class="grid-list mt16">' + related.map(UI.gridCard).join("") + "</div></div>" : "");

    setRoot(UI.layout("home", html));
    document.querySelector("[data-action='qty-minus']").addEventListener("click", function () { state.qty = Math.max(1, state.qty - 1); renderProduct(id); });
    document.querySelector("[data-action='qty-plus']").addEventListener("click", function () { state.qty += 1; renderProduct(id); });
    document.getElementById("qty-input").addEventListener("change", function (e) {
      state.qty = Math.max(1, parseInt(e.target.value, 10) || 1);
      renderProduct(id);
    });
    document.querySelectorAll("[data-dtab]").forEach(function (b) {
      b.addEventListener("click", function () { state.detailTab = b.getAttribute("data-dtab"); renderProduct(id); });
    });
    document.querySelector("[data-action='add']").addEventListener("click", function () {
      STORE.addToCart(p.id, state.qty);
      UI.toast("已加入购物车");
      renderProduct(id);
    });
    document.querySelector("[data-action='buy']").addEventListener("click", function () {
      const sessionItems = [{
        id: p.id,
        title: p.title,
        price: p.price,
        qty: state.qty,
        autoDeliver: !!p.autoDeliver,
        cover: p.cover
      }];
      sessionStorage.setItem("hongjian_checkout", JSON.stringify(sessionItems));
      go("#/checkout");
    });
    document.querySelector("[data-action='fav']").addEventListener("click", function () {
      const on = STORE.toggleFav(p.id);
      UI.toast(on ? "已加入收藏" : "已取消收藏");
      renderProduct(id);
    });
  }

  /* ===== Cart ===== */
  function cartItemsDetailed(raw) {
    return (raw || STORE.getCart()).map(function (it) {
      const p = UI.productById(it.id);
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        price: p.price,
        qty: it.qty,
        autoDeliver: !!p.autoDeliver,
        cover: p.cover,
        short: p.short
      };
    }).filter(Boolean);
  }

  function renderCart() {
    const items = cartItemsDetailed();
    const total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    let body;
    if (!items.length) {
      body = UI.emptyHtml("购物车还是空的") + '<p class="center"><a class="btn btn-cyan" href="#/">去店铺看看</a></p>';
    } else {
      body = '<div class="two-col"><div class="panel">' +
        items.map(function (i) {
          return '<div class="cart-item">' +
            '<div class="cart-thumb">' + UI.coverSvg(i.cover, 240, 140) + "</div>" +
            '<div><a href="#/product/' + i.id + '"><strong>' + UI.escapeHtml(i.title) + "</strong></a><p class=\"muted mt8\">" + UI.escapeHtml(i.short) + "</p></div>" +
            UI.priceHtml(i.price) +
            '<div class="qty-ctrl">' +
            '<button type="button" data-qty="' + i.id + '" data-d="-1">' + UI.icon("minus") + "</button>" +
            '<input value="' + i.qty + '" data-qty-input="' + i.id + '" />' +
            '<button type="button" data-qty="' + i.id + '" data-d="1">' + UI.icon("plus") + "</button></div>" +
            '<button type="button" class="linkish" data-remove="' + i.id + '" aria-label="移除">' + UI.icon("trash") + "</button>" +
            "</div>";
        }).join("") +
        '</div><aside class="panel summary-card"><h2 class="section-title">结算</h2>' +
        '<div class="row"><span>共 ' + items.reduce(function (n, i) { return n + i.qty; }, 0) + " 件</span><span></span></div>" +
        '<div class="total"><span>合计</span>' + UI.priceHtml(total) + "</div>" +
        '<p class="demo-banner">演示站点，进入结算与支付后不会真实扣款。</p>' +
        '<button type="button" class="btn btn-primary btn-block" data-action="checkout">去结算</button>' +
        "</aside></div>";
    }
    setRoot(UI.layout("cart", '<h1 class="page-hero-title">购物车</h1><div class="mt16">' + body + "</div>"));
    document.querySelectorAll("[data-qty]").forEach(function (b) {
      b.addEventListener("click", function () {
        const id = b.getAttribute("data-qty");
        const item = STORE.getCart().find(function (x) { return x.id === id; });
        const next = (item ? item.qty : 1) + parseInt(b.getAttribute("data-d"), 10);
        STORE.setCartQty(id, next);
        renderCart();
      });
    });
    document.querySelectorAll("[data-qty-input]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        STORE.setCartQty(inp.getAttribute("data-qty-input"), inp.value);
        renderCart();
      });
    });
    document.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        STORE.removeFromCart(b.getAttribute("data-remove"));
        UI.toast("已从购物车移除");
        renderCart();
      });
    });
    const goCheckout = document.querySelector("[data-action='checkout']");
    if (goCheckout) goCheckout.addEventListener("click", function () {
      sessionStorage.setItem("hongjian_checkout", JSON.stringify(items));
      go("#/checkout");
    });
  }

  function readCheckoutItems() {
    try {
      const raw = sessionStorage.getItem("hongjian_checkout");
      const items = raw ? JSON.parse(raw) : null;
      if (items && items.length) return items;
    } catch (e) {}
    return cartItemsDetailed();
  }

  function renderCheckout() {
    const items = readCheckoutItems();
    if (!items.length) {
      setRoot(UI.layout("checkout", UI.emptyHtml("没有待确认的商品") + '<p class="center"><a class="btn btn-cyan" href="#/">返回店铺</a></p>'));
      return;
    }
    const user = STORE.currentUser();
    const users = STORE.getUsers();
    const profile = user && users.find(function (u) { return u.username === user.username; });
    const total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    const html =
      '<h1 class="page-hero-title">确认订单</h1>' +
      '<p class="page-lead">请填写交付用的联系方式。本页为演示，不必使用真实邮箱。</p>' +
      '<div class="two-col mt16">' +
      '<div class="panel"><h2 class="section-title">交付信息</h2>' +
      '<form id="checkout-form" class="mt16">' +
      '<div class="field"><label>昵称</label><input name="nickname" value="' + UI.escapeHtml((user && user.nickname) || "") + '" placeholder="怎么称呼你" /></div>' +
      '<div class="field"><label>交付邮箱（演示）</label><input name="email" value="' + UI.escapeHtml((profile && profile.email) || "") + '" placeholder="demo@example.com" /></div>' +
      '<div class="field"><label>需求备注</label><textarea name="remark" placeholder="对标链接、卖点、禁用词、希望的语气……"></textarea></div>' +
      '<p class="form-error hidden" id="checkout-error"></p>' +
      '<button type="submit" class="btn btn-primary">提交订单并去支付</button>' +
      "</form></div>" +
      '<aside class="panel summary-card"><h2 class="section-title">订单明细</h2>' +
      items.map(function (i) {
        return '<div class="row"><span>' + UI.escapeHtml(i.title.slice(0, 16)) + (i.title.length > 16 ? "…" : "") + " × " + i.qty + "</span>" + UI.priceHtml(i.price * i.qty) + "</div>";
      }).join("") +
      '<div class="total"><span>合计</span>' + UI.priceHtml(total) + "</div>" +
      '<p class="demo-banner">演示站点 / 不会真实扣款</p></aside></div>';
    setRoot(UI.layout("checkout", html));
    document.getElementById("checkout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const nickname = String(fd.get("nickname") || "").trim();
      const email = String(fd.get("email") || "").trim();
      if (!nickname || !email) {
        const err = document.getElementById("checkout-error");
        err.textContent = "请填写昵称和交付邮箱（可用任意演示地址）。";
        err.classList.remove("hidden");
        return;
      }
      const order = STORE.createOrder({
        items: items,
        total: total,
        contact: { nickname: nickname, email: email },
        remark: String(fd.get("remark") || "")
      });
      const ids = items.map(function (i) { return i.id; });
      const fromCart = cartItemsDetailed();
      const shouldClear = fromCart.length && fromCart.every(function (c) {
        return items.some(function (i) { return i.id === c.id && i.qty === c.qty; });
      }) || items.length === fromCart.length;
      if (shouldClear) STORE.clearCart(ids);
      sessionStorage.removeItem("hongjian_checkout");
      go("#/pay/" + order.id);
    });
  }

  function renderPay(id) {
    const order = STORE.getOrder(id);
    if (!order) {
      setRoot(UI.layout("pay", UI.emptyHtml("找不到这笔订单") + '<p class="center"><a class="btn btn-cyan" href="#/orders">查看订单</a></p>'));
      return;
    }
    if (order.status !== "pending") {
      go("#/success/" + order.id);
      return;
    }
    const method = state.payMethod || "demo";
    const html =
      '<h1 class="page-hero-title">演示支付</h1>' +
      '<p class="page-lead">订单号 ' + UI.escapeHtml(order.id) + "</p>" +
      '<div class="two-col mt16">' +
      '<div class="panel">' +
      '<p class="demo-banner"><strong>这是演示站点，不会真实扣款。</strong>不会接入支付宝、微信支付或银行卡，也不会收集真实卡号或账户。请选择下面的演示方式并确认，仅用于走通下单流程。</p>' +
      '<div class="pay-methods">' +
      '<button type="button" class="pay-method' + (method === "demo" ? " active" : "") + '" data-pay="demo"><strong>演示支付</strong><span class="muted">模拟一次成功付款，不会产生费用</span></button>' +
      '<button type="button" class="pay-method' + (method === "balance" ? " active" : "") + '" data-pay="balance"><strong>演示余额</strong><span class="muted">使用本地演示余额，不会关联真实资金</span></button>' +
      "</div>" +
      '<button type="button" class="btn btn-primary" id="confirm-pay">确认支付（演示）</button> ' +
      '<button type="button" class="btn btn-ghost" id="cancel-pay">取消订单</button>' +
      "</div>" +
      '<aside class="panel summary-card"><h2 class="section-title">应付金额</h2>' +
      '<div class="total"><span>合计</span>' + UI.priceHtml(order.total) + "</div>" +
      (order.items || []).map(function (i) {
        return '<div class="row mt8"><span>' + UI.escapeHtml(i.title.slice(0, 18)) + " × " + i.qty + "</span></div>";
      }).join("") +
      "</aside></div>";
    setRoot(UI.layout("pay", html));
    document.querySelectorAll("[data-pay]").forEach(function (b) {
      b.addEventListener("click", function () { state.payMethod = b.getAttribute("data-pay"); renderPay(id); });
    });
    document.getElementById("confirm-pay").addEventListener("click", function () {
      const btn = document.getElementById("confirm-pay");
      btn.disabled = true;
      btn.textContent = "正在完成演示支付…";
      setTimeout(function () {
        const paid = STORE.markPaid(id, method === "balance" ? "演示余额" : "演示支付");
        if (paid) go("#/success/" + paid.id);
      }, 700);
    });
    document.getElementById("cancel-pay").addEventListener("click", function () {
      STORE.cancelOrder(id);
      UI.toast("订单已取消");
      go("#/orders");
    });
  }

  function renderSuccess(id) {
    const order = STORE.getOrder(id);
    if (!order) {
      setRoot(UI.layout("success", UI.emptyHtml("找不到这笔订单")));
      return;
    }
    const html =
      '<div class="panel center" style="padding:48px 24px">' +
      '<div class="success-mark"><svg viewBox="0 0 82 82"><circle cx="41" cy="41" r="39" fill="none" stroke="#2ec9a0" stroke-width="3"/><path d="M24 42l12 12 24-26" fill="none" stroke="#2ec9a0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<h1 class="page-hero-title">演示支付成功</h1>' +
      '<p class="page-lead" style="margin:12px auto 0">订单 ' + UI.escapeHtml(order.id) + " 已记为" + UI.escapeHtml(UI.statusLabel(order.status)) + "。本次没有发生真实扣款。</p>" +
      '<div class="detail-actions" style="justify-content:center;margin-top:24px">' +
      '<a class="btn btn-cyan" href="#/order/' + order.id + '">查看订单</a>' +
      (order.status === "delivered" || order.status === "paid" ? '<a class="btn btn-ghost" href="#/review/' + order.id + '">去评价</a>' : "") +
      '<a class="btn btn-ghost" href="#/">返回店铺</a>' +
      "</div></div>";
    setRoot(UI.layout("success", html));
  }

  function renderOrders() {
    if (!STORE.isLoggedIn()) {
      /* still show local orders — they are device-local */
    }
    const orders = STORE.getOrders();
    const html = '<div class="row-between"><h1 class="page-hero-title">我的订单</h1><a class="btn btn-ghost" href="#/account">个人中心</a></div>' +
      (orders.length
        ? '<div class="mt16">' + orders.map(function (o) {
            const first = (o.items || [])[0];
            return '<div class="order-card" data-href="#/order/' + o.id + '">' +
              '<div class="order-card-head"><span>订单号 ' + UI.escapeHtml(o.id) + " · " + UI.formatTime(o.createdAt) + "</span>" +
              '<span class="' + UI.statusClass(o.status) + '">' + UI.statusLabel(o.status) + "</span></div>" +
              (first ? '<div class="row-between"><span>' + UI.escapeHtml(first.title) + (o.items.length > 1 ? " 等 " + o.items.length + " 项" : "") + "</span>" + UI.priceHtml(o.total) + "</div>" : "") +
              "</div>";
          }).join("") + "</div>"
        : UI.emptyHtml("还没有订单。去店铺选一份服务，可以走一遍演示支付。") + '<p class="center"><a class="btn btn-cyan" href="#/">去店铺</a></p>');
    setRoot(UI.layout("orders", html));
  }

  function renderOrder(id) {
    const order = STORE.getOrder(id);
    if (!order) {
      setRoot(UI.layout("order", UI.emptyHtml("找不到这笔订单")));
      return;
    }
    const canPay = order.status === "pending";
    const canReview = (order.status === "delivered" || order.status === "paid") && !order.review;
    const canRevise = order.status === "delivered";
    const html =
      '<div class="crumb"><a href="#/orders">我的订单</a> / 订单详情</div>' +
      '<div class="row-between"><h1 class="page-hero-title">订单 ' + UI.escapeHtml(order.id) + '</h1><span class="' + UI.statusClass(order.status) + '">' + UI.statusLabel(order.status) + "</span></div>" +
      '<p class="muted mt8">下单时间 ' + UI.formatTime(order.createdAt) + (order.paidAt ? " · 支付时间 " + UI.formatTime(order.paidAt) : "") + (order.payMethod ? " · " + UI.escapeHtml(order.payMethod) : "") + "</p>" +
      '<div class="panel mt16">' +
      (order.items || []).map(function (i) {
        return '<div class="order-item-row">' +
          '<div class="order-thumb">' + UI.coverSvg(i.cover, 240, 140) + "</div>" +
          '<div><a href="#/product/' + i.id + '">' + UI.escapeHtml(i.title) + "</a><p class=\"muted mt8\">数量 " + i.qty + (i.autoDeliver ? " · 自动交付" : "") + "</p></div>" +
          UI.priceHtml(i.price * i.qty) +
          "</div>";
      }).join("") +
      '<div class="row-between mt16"><span class="muted">交付给 ' + UI.escapeHtml((order.contact && order.contact.nickname) || "—") + " / " + UI.escapeHtml((order.contact && order.contact.email) || "—") + "</span>" + UI.priceHtml(order.total) + "</div>" +
      (order.remark ? '<p class="muted mt8">备注：' + UI.escapeHtml(order.remark) + "</p>" : "") +
      "</div>" +
      (order.delivery ? '<div class="panel mt16"><h2 class="section-title">交付示例</h2><p class="muted mt8">' + UI.escapeHtml(DATA.SAMPLE_DELIVERY.intro) + '</p><div class="delivery-box mt16">' +
        "标题备选：\n- " + DATA.SAMPLE_DELIVERY.titleOptions.join("\n- ") + "\n\n" + DATA.SAMPLE_DELIVERY.cover + "\n\n" + DATA.SAMPLE_DELIVERY.body + "\n\n" + DATA.SAMPLE_DELIVERY.pinned +
        "</div></div>" : "") +
      (order.revisions && order.revisions.length ? '<div class="panel mt16"><h2 class="section-title">修改记录</h2>' + order.revisions.map(function (r) {
        return '<p class="muted mt8">' + UI.formatTime(r.at) + " · " + UI.escapeHtml(r.note) + "</p>";
      }).join("") + "</div>" : "") +
      (order.review ? '<div class="panel mt16"><h2 class="section-title">评价</h2><p class="mt8">评分 ' + order.review.rating + " / 5</p><p class=\"muted mt8\">" + UI.escapeHtml(order.review.content) + "</p></div>" : "") +
      '<div class="detail-actions mt24">' +
      (canPay ? '<a class="btn btn-primary" href="#/pay/' + order.id + '">去支付</a>' : "") +
      (canReview ? '<a class="btn btn-cyan" href="#/review/' + order.id + '">去评价</a>' : "") +
      (canRevise ? '<button type="button" class="btn btn-ghost" id="ask-revise">申请修改</button>' : "") +
      (order.status === "revising" ? '<button type="button" class="btn btn-ghost" id="done-revise">演示：完成修改</button>' : "") +
      '<a class="btn btn-ghost" href="#/orders">返回订单列表</a></div>';
    setRoot(UI.layout("order", html));
    const ask = document.getElementById("ask-revise");
    if (ask) ask.addEventListener("click", function () {
      const note = window.prompt("请填写修改意见（演示）", "希望标题再生活化一些，并补充一组封面主句。");
      if (note != null) {
        STORE.addRevision(order.id, note);
        UI.toast("已提交修改意见（演示）");
        renderOrder(id);
      }
    });
    const done = document.getElementById("done-revise");
    if (done) done.addEventListener("click", function () {
      STORE.completeRevision(order.id);
      UI.toast("修改已完成（演示）");
      renderOrder(id);
    });
  }

  function renderReview(id) {
    const order = STORE.getOrder(id);
    if (!order) {
      setRoot(UI.layout("review", UI.emptyHtml("找不到这笔订单")));
      return;
    }
    if (order.review) {
      setRoot(UI.layout("review",
        '<div class="panel center" style="padding:48px 24px"><h1 class="page-hero-title">评价已提交</h1><p class="page-lead" style="margin:12px auto 0">谢谢你的反馈。这是演示评价，只保存在本机。</p><div class="mt24"><a class="btn btn-cyan" href="#/order/' + order.id + '">返回订单</a></div></div>'
      ));
      return;
    }
    let rating = 5;
    const html =
      '<h1 class="page-hero-title">评价订单</h1>' +
      '<p class="page-lead">订单 ' + UI.escapeHtml(order.id) + "。评价仅保存在本地，用于走通流程。</p>" +
      '<form class="panel mt16" id="review-form" style="max-width:640px">' +
      '<div class="field"><label>评分</label><div class="stars" id="stars"></div></div>' +
      '<div class="field"><label>评价内容</label><textarea name="content" placeholder="成稿是否对齐需求、沟通是否清楚……"></textarea></div>' +
      '<button type="submit" class="btn btn-primary">提交评价</button>' +
      "</form>";
    setRoot(UI.layout("review", html));
    const stars = document.getElementById("stars");
    function paint() {
      stars.innerHTML = [1, 2, 3, 4, 5].map(function (n) {
        return '<button type="button" class="star-btn' + (n <= rating ? " on" : "") + '" data-star="' + n + '"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.4 14.6 9l6 .7-4.5 4.2 1.2 5.9L12 16.8 6.7 19.8 7.9 13.9 3.4 9.7l6-.7z"/></svg></button>';
      }).join("");
      stars.querySelectorAll("[data-star]").forEach(function (b) {
        b.addEventListener("click", function () { rating = parseInt(b.getAttribute("data-star"), 10); paint(); });
      });
    }
    paint();
    document.getElementById("review-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const content = e.target.content.value.trim() || "满意，演示流程完整。";
      STORE.addReview(order.id, rating, content);
      renderReview(id);
    });
  }

  /* ===== Auth / account / messages / help / about / packages ===== */
  function renderLogin() {
    if (STORE.isLoggedIn()) { go("#/account"); return; }
    const html =
      '<h1 class="page-hero-title center">登录</h1>' +
      '<p class="page-lead center" style="margin:8px auto 0">账号只保存在本机浏览器，用于演示个人中心与订单入口。</p>' +
      '<form class="panel auth-card" id="login-form">' +
      '<div class="field"><label>用户名</label><input name="username" autocomplete="username" /></div>' +
      '<div class="field"><label>密码</label><input name="password" type="password" autocomplete="current-password" /></div>' +
      '<p class="form-error hidden" id="auth-error"></p>' +
      '<button type="submit" class="btn btn-primary btn-block">登录</button>' +
      '<p class="center muted mt16">还没有账号？ <a href="#/register" style="color:var(--cyan)">去注册</a></p>' +
      "</form>";
    setRoot(UI.layout("login", html, { hideDock: false }));
    document.getElementById("login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = STORE.login(fd.get("username"), fd.get("password"));
      if (!res.ok) {
        const err = document.getElementById("auth-error");
        err.textContent = res.error;
        err.classList.remove("hidden");
        return;
      }
      UI.toast("登录成功");
      go("#/account");
    });
  }

  function renderRegister() {
    if (STORE.isLoggedIn()) { go("#/account"); return; }
    const html =
      '<h1 class="page-hero-title center">注册</h1>' +
      '<p class="page-lead center" style="margin:8px auto 0">请勿使用真实密码。信息不会上传服务器。</p>' +
      '<form class="panel auth-card" id="reg-form">' +
      '<div class="field"><label>用户名</label><input name="username" /></div>' +
      '<div class="field"><label>昵称</label><input name="nickname" placeholder="可选" /></div>' +
      '<div class="field"><label>密码（至少 4 位，仅存本机）</label><input name="password" type="password" /></div>' +
      '<p class="form-error hidden" id="auth-error"></p>' +
      '<button type="submit" class="btn btn-primary btn-block">注册并登录</button>' +
      '<p class="center muted mt16">已有账号？ <a href="#/login" style="color:var(--cyan)">去登录</a></p>' +
      "</form>";
    setRoot(UI.layout("register", html));
    document.getElementById("reg-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = STORE.register(fd.get("username"), fd.get("password"), fd.get("nickname"));
      if (!res.ok) {
        const err = document.getElementById("auth-error");
        err.textContent = res.error;
        err.classList.remove("hidden");
        return;
      }
      UI.toast("注册成功");
      go("#/account");
    });
  }

  function renderAccount() {
    if (!STORE.isLoggedIn()) { go("#/login"); return; }
    const user = STORE.currentUser();
    const profile = STORE.getUsers().find(function (u) { return u.username === user.username; }) || user;
    const orders = STORE.getOrders();
    const html =
      '<h1 class="page-hero-title">个人中心</h1>' +
      '<div class="account-grid mt16">' +
      '<aside class="panel account-side">' +
      '<a class="active" href="#/account">账号资料</a>' +
      '<a href="#/orders">我的订单（' + orders.length + "）</a>" +
      '<a href="#/cart">购物车</a>' +
      '<a href="#/" data-go-fav="1">我的收藏</a>' +
      '<a href="#/messages">消息</a>' +
      '<button type="button" id="logout">退出登录</button>' +
      "</aside>" +
      '<div class="panel">' +
      "<p class=\"muted\">你好，" + UI.escapeHtml(user.nickname || user.username) + "。资料只保存在本机。</p>" +
      '<form id="profile-form" class="mt16">' +
      '<div class="field"><label>用户名</label><input value="' + UI.escapeHtml(user.username) + '" disabled /></div>' +
      '<div class="field"><label>昵称</label><input name="nickname" value="' + UI.escapeHtml(profile.nickname || "") + '" /></div>' +
      '<div class="field"><label>交付邮箱（演示）</label><input name="email" value="' + UI.escapeHtml(profile.email || "") + '" /></div>' +
      '<button type="submit" class="btn btn-cyan">保存资料</button>' +
      "</form></div></div>";
    setRoot(UI.layout("account", html));
    document.getElementById("logout").addEventListener("click", function () {
      STORE.logout();
      UI.toast("已退出");
      go("#/");
    });
    document.querySelector("[data-go-fav]").addEventListener("click", function (e) {
      e.preventDefault();
      state.shopTab = "fav";
      go("#/");
    });
    document.getElementById("profile-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      STORE.updateProfile({ nickname: fd.get("nickname"), email: fd.get("email") });
      UI.toast("已保存");
      renderAccount();
    });
  }

  function renderMessages() {
    const list = STORE.getMessages();
    const html =
      '<div class="row-between"><h1 class="page-hero-title">消息</h1>' +
      (STORE.unreadCount() ? '<button type="button" class="btn btn-ghost" id="read-all">全部已读</button>' : "") +
      "</div>" +
      '<div class="panel mt16">' +
      (list.length ? list.map(function (m) {
        return '<div class="msg-item' + (m.unread ? " unread" : "") + (state.openMsg === m.id ? " open" : "") + '" data-msg="' + m.id + '">' +
          '<div class="row-between"><div class="msg-title">' + UI.escapeHtml(m.title) + '</div><div class="msg-time">' + UI.escapeHtml(m.time) + "</div></div>" +
          '<div class="msg-body">' + UI.escapeHtml(m.body) + "</div></div>";
      }).join("") : UI.emptyHtml("暂时没有消息")) +
      "</div>";
    setRoot(UI.layout("messages", html));
    document.querySelectorAll("[data-msg]").forEach(function (el) {
      el.addEventListener("click", function () {
        const id = el.getAttribute("data-msg");
        STORE.markMessageRead(id);
        state.openMsg = state.openMsg === id ? "" : id;
        renderMessages();
      });
    });
    const all = document.getElementById("read-all");
    if (all) all.addEventListener("click", function () { STORE.markAllRead(); renderMessages(); });
  }

  function renderHelp() {
    const html =
      '<h1 class="page-hero-title">帮助中心</h1>' +
      '<p class="page-lead">关于下单、交付、修改和演示支付的常见问题。</p>' +
      '<div class="panel mt16">' +
      DATA.FAQ.map(function (f, i) {
        return '<div class="faq-item' + (state.openFaq === i ? " open" : "") + '">' +
          '<button type="button" data-faq="' + i + '">' + UI.escapeHtml(f.q) + "<span>" + (state.openFaq === i ? "−" : "+") + "</span></button>" +
          '<div class="faq-a">' + UI.escapeHtml(f.a) + "</div></div>";
      }).join("") +
      "</div>";
    setRoot(UI.layout("help", html));
    document.querySelectorAll("[data-faq]").forEach(function (b) {
      b.addEventListener("click", function () {
        const i = parseInt(b.getAttribute("data-faq"), 10);
        state.openFaq = state.openFaq === i ? -1 : i;
        renderHelp();
      });
    });
  }

  function renderAbout() {
    const a = DATA.ABOUT;
    const html =
      '<h1 class="page-hero-title">' + UI.escapeHtml(a.title) + "</h1>" +
      '<p class="page-lead">' + UI.escapeHtml(a.lead) + "</p>" +
      '<div class="steps">' + a.steps.map(function (s) {
        return '<div class="step-card"><h3>' + UI.escapeHtml(s.t) + "</h3><p>" + UI.escapeHtml(s.d) + "</p></div>";
      }).join("") + "</div>" +
      '<div class="split-lists">' +
      '<div class="panel"><h2 class="section-title">' + UI.escapeHtml(a.includesTitle) + '</h2><div class="rich mt16"><ul>' +
      a.includes.map(function (x) { return "<li>" + UI.escapeHtml(x) + "</li>"; }).join("") + "</ul></div></div>" +
      '<div class="panel"><h2 class="section-title">' + UI.escapeHtml(a.notIncludesTitle) + '</h2><div class="rich mt16"><ul>' +
      a.notIncludes.map(function (x) { return "<li>" + UI.escapeHtml(x) + "</li>"; }).join("") + "</ul></div></div>" +
      "</div>" +
      '<div class="mt24"><a class="btn btn-primary" href="#/">去店铺选服务</a> <a class="btn btn-ghost" href="#/packages">查看热门套餐</a></div>';
    setRoot(UI.layout("about", html));
  }

  function renderPackages() {
    const list = DATA.PRODUCTS.filter(function (p) { return p.category === "monthly"; });
    const html =
      '<div class="pkg-banner"><div><h1>热门套餐</h1><p>适合希望按月稳定供稿、或给新号做一轮冷启动的人。套餐价格与档期均为演示示例。</p></div><a class="btn btn-cyan" href="#/about">了解服务流程</a></div>' +
      '<div class="grid-list">' + list.map(UI.gridCard).join("") + "</div>" +
      '<div class="page-block"><h2 class="section-title">也可以单次加急</h2><div class="grid-list mt16">' +
      DATA.PRODUCTS.filter(function (p) { return p.category === "rush"; }).map(UI.gridCard).join("") +
      "</div></div>";
    setRoot(UI.layout("packages", html));
  }

  function renderNotFound() {
    setRoot(UI.layout("home", UI.emptyHtml("页面不存在") + '<p class="center"><a class="btn btn-cyan" href="#/">回到店铺首页</a></p>'));
  }

  let lastPath = null;

  function render() {
    UI.applyTheme();
    const r = parseRoute();
    if (r.path !== lastPath) {
      lastPath = r.path;
      const toasts = document.getElementById("toast-root");
      if (toasts) toasts.innerHTML = "";
    }
    const segs = r.segs;
    const name = segs[0] || "";
    if (!name) { state.showSort = false; renderHome(); return; }
    if (name === "product") return renderProduct(segs[1]);
    if (name === "cart") return renderCart();
    if (name === "checkout") return renderCheckout();
    if (name === "pay") return renderPay(segs[1]);
    if (name === "success") return renderSuccess(segs[1]);
    if (name === "orders") return renderOrders();
    if (name === "order") return renderOrder(segs[1]);
    if (name === "review") return renderReview(segs[1]);
    if (name === "login") return renderLogin();
    if (name === "register") return renderRegister();
    if (name === "account") return renderAccount();
    if (name === "messages") return renderMessages();
    if (name === "help") return renderHelp();
    if (name === "about") return renderAbout();
    if (name === "packages") return renderPackages();
    renderNotFound();
  }

  function init() {
    UI.applyTheme();
    window.addEventListener("hashchange", render);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
