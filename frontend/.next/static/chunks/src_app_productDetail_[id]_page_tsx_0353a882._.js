(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/productDetail/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$Config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/Config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ProductDetailPage() {
    var _status_topBid, _detail_topBid;
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const id = Number(params === null || params === void 0 ? void 0 : params.id);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, loading, refresh } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [detail, setDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bids, setBids] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [err, setErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const imgSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductDetailPage.useMemo[imgSrc]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$Config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toImageSrc"])(detail === null || detail === void 0 ? void 0 : detail.image)
    }["ProductDetailPage.useMemo[imgSrc]"], [
        detail === null || detail === void 0 ? void 0 : detail.image
    ]);
    const loadAll = async ()=>{
        try {
            const [d, s, bs] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id)),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id, "/status")),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id, "/bids"))
            ]);
            setDetail(d);
            setStatus(s);
            setBids(bs);
        } catch (e) {
            var _e_message;
            setErr((_e_message = e === null || e === void 0 ? void 0 : e.message) !== null && _e_message !== void 0 ? _e_message : "Failed to load auction");
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetailPage.useEffect": ()=>{
            void refresh();
        }
    }["ProductDetailPage.useEffect"], [
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetailPage.useEffect": ()=>{
            if (id) void loadAll();
        }
    }["ProductDetailPage.useEffect"], [
        id
    ]);
    // Poll status every 5s (so the leader & button state update)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetailPage.useEffect": ()=>{
            const t = setInterval({
                "ProductDetailPage.useEffect.t": ()=>{
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id, "/status")).then(setStatus).catch({
                        "ProductDetailPage.useEffect.t": ()=>{}
                    }["ProductDetailPage.useEffect.t"]);
                }
            }["ProductDetailPage.useEffect.t"], 5000);
            return ({
                "ProductDetailPage.useEffect": ()=>clearInterval(t)
            })["ProductDetailPage.useEffect"];
        }
    }["ProductDetailPage.useEffect"], [
        id
    ]);
    var _status_currentBid, _ref;
    const currentBid = (_ref = (_status_currentBid = status === null || status === void 0 ? void 0 : status.currentBid) !== null && _status_currentBid !== void 0 ? _status_currentBid : detail === null || detail === void 0 ? void 0 : detail.currentBid) !== null && _ref !== void 0 ? _ref : 0;
    var _status_topBid_bidderName, _ref1;
    const leaderName = (_ref1 = (_status_topBid_bidderName = status === null || status === void 0 ? void 0 : (_status_topBid = status.topBid) === null || _status_topBid === void 0 ? void 0 : _status_topBid.bidderName) !== null && _status_topBid_bidderName !== void 0 ? _status_topBid_bidderName : detail === null || detail === void 0 ? void 0 : (_detail_topBid = detail.topBid) === null || _detail_topBid === void 0 ? void 0 : _detail_topBid.bidderName) !== null && _ref1 !== void 0 ? _ref1 : null;
    const onBid = async (e)=>{
        e.preventDefault();
        setErr(null);
        if (!user) {
            router.push("/auth/login?next=/productDetail/".concat(id));
            return;
        }
        const v = Number(amount);
        if (!Number.isFinite(v) || v <= 0) {
            setErr("Enter a valid positive amount.");
            return;
        }
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id, "/bids"), {
                method: "POST",
                body: JSON.stringify({
                    Amount: v
                })
            });
            setAmount("");
            await loadAll();
        } catch (e) {
            var _e_message;
            setErr((_e_message = e === null || e === void 0 ? void 0 : e.message) !== null && _e_message !== void 0 ? _e_message : "Bid failed");
        }
    };
    const onPurchase = async ()=>{
        setErr(null);
        if (!user) {
            router.push("/auth/login?next=/productDetail/".concat(id));
            return;
        }
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/auctions/".concat(id, "/purchase"), {
                method: "POST"
            });
            await loadAll();
            alert("Purchase confirmed! (stub)");
        } catch (e) {
            var _e_message;
            setErr((_e_message = e === null || e === void 0 ? void 0 : e.message) !== null && _e_message !== void 0 ? _e_message : "Purchase failed");
        }
    };
    // countdown
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Date.now());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductDetailPage.useEffect": ()=>{
            const t = setInterval({
                "ProductDetailPage.useEffect.t": ()=>setNow(Date.now())
            }["ProductDetailPage.useEffect.t"], 1000);
            return ({
                "ProductDetailPage.useEffect": ()=>clearInterval(t)
            })["ProductDetailPage.useEffect"];
        }
    }["ProductDetailPage.useEffect"], []);
    const endsAt = detail ? new Date(detail.endTime).getTime() : 0;
    const msLeft = Math.max(0, endsAt - now);
    var _status_isEnded;
    const isEnded = (_status_isEnded = status === null || status === void 0 ? void 0 : status.isEnded) !== null && _status_isEnded !== void 0 ? _status_isEnded : msLeft <= 0;
    const fmtLeft = ()=>{
        if (!detail) return "";
        if (isEnded) return "Ended";
        const sec = Math.floor(msLeft / 1000);
        const d = Math.floor(sec / 86400);
        const h = Math.floor(sec % 86400 / 3600);
        const m = Math.floor(sec % 3600 / 60);
        const s = sec % 60;
        const parts = [];
        if (d) parts.push("".concat(d, "d"));
        if (h || d) parts.push("".concat(h, "h"));
        if (m || h || d) parts.push("".concat(m, "m"));
        parts.push("".concat(s, "s"));
        return parts.join(" ");
    // safe: no String.repeat anywhere :)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "max-w-5xl mx-auto p-6",
        children: [
            err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-4 text-red-600 break-words",
                children: err
            }, void 0, false, {
                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                lineNumber: 168,
                columnNumber: 15
            }, this),
            !detail ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Loading…"
            }, void 0, false, {
                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                lineNumber: 171,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded overflow-hidden border bg-white",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: imgSrc,
                                    alt: detail.title,
                                    className: "w-full h-auto object-cover",
                                    onError: (e)=>{
                                        e.currentTarget.src = "/placeholder.png";
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                    lineNumber: 176,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold",
                                        children: detail.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this),
                                    detail.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-block mt-2 text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700",
                                        children: detail.badge
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                        lineNumber: 189,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-4 text-gray-700 whitespace-pre-wrap",
                                        children: detail.description || ""
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 p-4 rounded-lg border bg-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Current bid"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 199,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-semibold",
                                                children: [
                                                    "LKR ",
                                                    currentBid.toLocaleString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 200,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-sm text-gray-700",
                                                children: [
                                                    "Leader: ",
                                                    leaderName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: leaderName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 204,
                                                        columnNumber: 41
                                                    }, this) : "—"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 203,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 text-sm",
                                                children: [
                                                    "Ends in: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: fmtLeft()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 28
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 206,
                                                columnNumber: 17
                                            }, this),
                                            !isEnded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                onSubmit: onBid,
                                                className: "mt-4 flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        step: "0.01",
                                                        placeholder: "Your bid > ".concat(currentBid.toLocaleString()),
                                                        value: amount,
                                                        onChange: (e)=>setAmount(e.target.value),
                                                        className: "border p-2 rounded w-40",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 212,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "px-4 py-2 rounded bg-indigo-600 text-white",
                                                        type: "submit",
                                                        children: "Place bid"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 211,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-4",
                                                children: (status === null || status === void 0 ? void 0 : status.canPurchase) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "px-4 py-2 rounded bg-emerald-600 text-white",
                                                    onClick: onPurchase,
                                                    children: "Purchase"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-700",
                                                    children: (status === null || status === void 0 ? void 0 : status.purchasedAt) ? "Purchased" : "Auction ended."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 230,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mt-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold",
                                children: "Bids"
                            }, void 0, false, {
                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                lineNumber: 250,
                                columnNumber: 13
                            }, this),
                            bids.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 text-gray-600",
                                children: "No bids yet."
                            }, void 0, false, {
                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                lineNumber: 252,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "mt-3 divide-y border rounded bg-white",
                                children: bids.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "p-3 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium",
                                                        children: [
                                                            "LKR ",
                                                            b.amount.toLocaleString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: [
                                                            "by ",
                                                            b.bidderName || b.bidderId
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                        lineNumber: 264,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 260,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-500",
                                                children: new Date(b.at).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, b.id, true, {
                                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                        lineNumber: 256,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                                lineNumber: 254,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
                        lineNumber: 249,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/productDetail/[id]/page.tsx",
        lineNumber: 167,
        columnNumber: 5
    }, this);
}
_s(ProductDetailPage, "pA/MMwlWKZgUf9/I5PkbNUf+4LE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = ProductDetailPage;
var _c;
__turbopack_context__.k.register(_c, "ProductDetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_productDetail_%5Bid%5D_page_tsx_0353a882._.js.map