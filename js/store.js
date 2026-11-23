/* 红笺工坊 — localStorage state */
(function (global) {
  const PREFIX = "hongjian_shop_v1_";
  const KEYS = {
    users: "users",
    session: "session",
    cart: "cart",
    orders: "orders",
    favorites: "favorites",
    follow: "follow",
    theme: "theme",
    messages: "messages",
    reviews: "reviews",
    view: "view_mode",
    searchMode: "search_mode"
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  function uid(prefix) {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    );
  }

  function ensureMessages() {
    let list = read(KEYS.messages, null);
    if (!Array.isArray(list) || !list.length) {
      list = (global.HJ_DATA.DEFAULT_MESSAGES || []).map(function (m) {
        return Object.assign({}, m);
      });
      write(KEYS.messages, list);
    }
    return list;
  }

  const store = {
    keys: KEYS,
    uid: uid,

    getTheme: function () {
      const t = read(KEYS.theme, "dark");
      return t === "light" ? "light" : "dark";
    },
    setTheme: function (theme) {
      write(KEYS.theme, theme === "light" ? "light" : "dark");
    },

    getViewMode: function () {
      return read(KEYS.view, "list") === "grid" ? "grid" : "list";
    },
    setViewMode: function (mode) {
      write(KEYS.view, mode === "grid" ? "grid" : "list");
    },

    getSearchMode: function () {
      return read(KEYS.searchMode, "name") === "keyword" ? "keyword" : "name";
    },
    setSearchMode: function (mode) {
      write(KEYS.searchMode, mode === "keyword" ? "keyword" : "name");
    },

    getUsers: function () {
      return read(KEYS.users, []);
    },
    getSession: function () {
      return read(KEYS.session, null);
    },
    isLoggedIn: function () {
      const s = this.getSession();
      return !!(s && s.username);
    },
    currentUser: function () {
      return this.getSession();
    },
    register: function (username, password, nickname) {
      username = String(username || "").trim();
      password = String(password || "");
      nickname = String(nickname || "").trim() || username;
      if (!username || username.length < 2) return { ok: false, error: "请填写至少 2 个字符的用户名" };
      if (password.length < 4) return { ok: false, error: "请设置至少 4 位密码（仅保存在本机）" };
      const users = this.getUsers();
      if (users.some(function (u) { return u.username === username; })) {
        return { ok: false, error: "这个用户名已经注册过了" };
      }
      users.push({
        username: username,
        password: password,
        nickname: nickname,
        email: "",
        createdAt: Date.now()
      });
      write(KEYS.users, users);
      write(KEYS.session, { username: username, nickname: nickname });
      return { ok: true };
    },
    login: function (username, password) {
      username = String(username || "").trim();
      password = String(password || "");
      const user = this.getUsers().find(function (u) {
        return u.username === username && u.password === password;
      });
      if (!user) return { ok: false, error: "用户名或密码不正确" };
      write(KEYS.session, { username: user.username, nickname: user.nickname || user.username });
      return { ok: true };
    },
    logout: function () {
      write(KEYS.session, null);
    },
    updateProfile: function (patch) {
      const session = this.getSession();
      if (!session) return { ok: false, error: "请先登录" };
      const users = this.getUsers();
      const idx = users.findIndex(function (u) { return u.username === session.username; });
      if (idx < 0) return { ok: false, error: "找不到账号" };
      if (patch.nickname) users[idx].nickname = String(patch.nickname).trim();
      if (patch.email != null) users[idx].email = String(patch.email).trim();
      write(KEYS.users, users);
      write(KEYS.session, {
        username: users[idx].username,
        nickname: users[idx].nickname
      });
      return { ok: true };
    },

    getCart: function () {
      return read(KEYS.cart, []);
    },
    cartCount: function () {
      return this.getCart().reduce(function (n, i) { return n + (i.qty || 0); }, 0);
    },
    addToCart: function (productId, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const cart = this.getCart();
      const item = cart.find(function (i) { return i.id === productId; });
      if (item) item.qty += qty;
      else cart.push({ id: productId, qty: qty });
      write(KEYS.cart, cart);
      return cart;
    },
    setCartQty: function (productId, qty) {
      qty = parseInt(qty, 10) || 0;
      let cart = this.getCart();
      if (qty <= 0) cart = cart.filter(function (i) { return i.id !== productId; });
      else {
        const item = cart.find(function (i) { return i.id === productId; });
        if (item) item.qty = qty;
      }
      write(KEYS.cart, cart);
      return cart;
    },
    removeFromCart: function (productId) {
      const cart = this.getCart().filter(function (i) { return i.id !== productId; });
      write(KEYS.cart, cart);
      return cart;
    },
    clearCart: function (ids) {
      if (!ids) {
        write(KEYS.cart, []);
        return [];
      }
      const set = {};
      ids.forEach(function (id) { set[id] = true; });
      const cart = this.getCart().filter(function (i) { return !set[i.id]; });
      write(KEYS.cart, cart);
      return cart;
    },

    getFavorites: function () {
      return read(KEYS.favorites, []);
    },
    isFav: function (id) {
      return this.getFavorites().indexOf(id) !== -1;
    },
    toggleFav: function (id) {
      const favs = this.getFavorites();
      const i = favs.indexOf(id);
      if (i === -1) favs.push(id);
      else favs.splice(i, 1);
      write(KEYS.favorites, favs);
      return i === -1;
    },

    isFollowed: function () {
      return !!read(KEYS.follow, false);
    },
    toggleFollow: function () {
      const next = !this.isFollowed();
      write(KEYS.follow, next);
      return next;
    },

    getOrders: function () {
      return read(KEYS.orders, []).slice().sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });
    },
    getOrder: function (id) {
      return this.getOrders().find(function (o) { return o.id === id; }) || null;
    },
    saveOrder: function (order) {
      const orders = read(KEYS.orders, []);
      const i = orders.findIndex(function (o) { return o.id === order.id; });
      if (i === -1) orders.push(order);
      else orders[i] = order;
      write(KEYS.orders, orders);
      return order;
    },
    createOrder: function (payload) {
      const order = {
        id: uid("HJ"),
        items: payload.items,
        total: payload.total,
        contact: payload.contact || {},
        remark: payload.remark || "",
        status: "pending",
        payMethod: "",
        createdAt: Date.now(),
        paidAt: null,
        deliveredAt: null,
        review: null,
        revisions: [],
        delivery: null
      };
      this.saveOrder(order);
      return order;
    },
    markPaid: function (id, method) {
      const order = this.getOrder(id);
      if (!order) return null;
      order.status = "paid";
      order.payMethod = method || "演示支付";
      order.paidAt = Date.now();
      const auto = (order.items || []).some(function (it) { return it.autoDeliver; });
      if (auto) {
        order.status = "delivered";
        order.deliveredAt = Date.now();
        order.delivery = {
          kind: "auto",
          note: "该订单含自动交付项目，以下为演示示例稿。"
        };
      }
      this.saveOrder(order);
      this.pushMessage({
        title: "订单支付成功（演示）",
        body: "订单 " + order.id + " 已完成演示支付，不会产生真实扣款。" + (auto ? " 示例成稿已可在订单详情中查看。" : " 演示站将订单记为已支付。")
      });
      return order;
    },
    cancelOrder: function (id) {
      const order = this.getOrder(id);
      if (!order || order.status !== "pending") return null;
      order.status = "cancelled";
      this.saveOrder(order);
      return order;
    },
    addRevision: function (id, note) {
      const order = this.getOrder(id);
      if (!order) return null;
      order.revisions = order.revisions || [];
      order.revisions.push({
        at: Date.now(),
        note: note || "希望调整语气，并再给两组标题。"
      });
      order.status = "revising";
      this.saveOrder(order);
      this.pushMessage({
        title: "已收到修改意见（演示）",
        body: "订单 " + order.id + " 的修改申请已记录。演示站不会真实改稿，但会保留这条沟通。"
      });
      return order;
    },
    completeRevision: function (id) {
      const order = this.getOrder(id);
      if (!order) return null;
      order.status = "delivered";
      this.saveOrder(order);
      return order;
    },
    addReview: function (id, rating, content) {
      const order = this.getOrder(id);
      if (!order) return null;
      order.review = {
        rating: rating,
        content: content,
        at: Date.now()
      };
      order.status = "reviewed";
      this.saveOrder(order);
      const reviews = read(KEYS.reviews, []);
      reviews.push({ orderId: id, rating: rating, content: content, at: Date.now() });
      write(KEYS.reviews, reviews);
      return order;
    },

    getMessages: function () {
      return ensureMessages();
    },
    unreadCount: function () {
      return this.getMessages().filter(function (m) { return m.unread; }).length;
    },
    markMessageRead: function (id) {
      const list = this.getMessages();
      list.forEach(function (m) {
        if (!id || m.id === id) m.unread = false;
      });
      write(KEYS.messages, list);
    },
    markAllRead: function () {
      this.markMessageRead(null);
    },
    pushMessage: function (msg) {
      const list = this.getMessages();
      list.unshift({
        id: uid("m"),
        title: msg.title,
        body: msg.body,
        time: "刚刚",
        unread: true
      });
      write(KEYS.messages, list);
    }
  };

  global.HJ_STORE = store;
})(window);
