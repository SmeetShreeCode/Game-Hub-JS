var _0x31967c = _0x57da;

function _0x57da(_0x1e8544, _0x328d79) {
    var _0x129b02 = _0x129b();
    return _0x57da = function (_0x57da84, _0x2265d5) {
        _0x57da84 = _0x57da84 - 0x192;
        var _0xa3bd7e = _0x129b02[_0x57da84];
        return _0xa3bd7e;
    }, _0x57da(_0x1e8544, _0x328d79);
}

function _0x129b() {
    var _0x221a3b = ['973YBpcVB', 'stopPropagation', '78nGquat', 'contextmenu', '1523557CxLINJ', 'addEventListener', '6920244EeFZON', '285OiujWa', 'preventDefault', '15109947zmllIT', 'ctrlKey', '122345nKUiWE', '40004150yKuCKL', '19784TxvdXr', '38798NNRdaX'];
    _0x129b = function () {
        return _0x221a3b;
    };
    return _0x129b();
}

(function (_0x289e57, _0x149074) {
    var _0x2940cf = _0x57da, _0x1cc737 = _0x289e57();
    while (!![]) {
        try {
            var _0x15e75e = -parseInt(_0x2940cf(0x199)) / 0x1 + parseInt(_0x2940cf(0x194)) / 0x2 * (parseInt(_0x2940cf(0x19c)) / 0x3) + -parseInt(_0x2940cf(0x19b)) / 0x4 + parseInt(_0x2940cf(0x1a0)) / 0x5 * (-parseInt(_0x2940cf(0x197)) / 0x6) + parseInt(_0x2940cf(0x195)) / 0x7 * (parseInt(_0x2940cf(0x193)) / 0x8) + -parseInt(_0x2940cf(0x19e)) / 0x9 + parseInt(_0x2940cf(0x192)) / 0xa;
            if (_0x15e75e === _0x149074) break; else _0x1cc737['push'](_0x1cc737['shift']());
        } catch (_0x546579) {
            _0x1cc737['push'](_0x1cc737['shift']());
        }
    }
}(_0x129b, 0xe4a15), document[_0x31967c(0x19a)]('keydown', function (_0x466ad8) {
    var _0x46c599 = _0x31967c;
    (_0x466ad8[_0x46c599(0x19f)] || _0x466ad8['keyCode'] == 0x7b) && (_0x466ad8[_0x46c599(0x196)](), _0x466ad8[_0x46c599(0x19d)]());
}), document[_0x31967c(0x19a)](_0x31967c(0x198), function (_0x4d6f22) {
    var _0x38e2ca = _0x31967c;
    _0x4d6f22[_0x38e2ca(0x19d)]();
}, ![]));

window.HUB_EVENTS = {
    ASSET_ADDED: "ASSET_ADDED",
    ASSET_DELETED: "ASSET_DELETED",
    ASSET_DESELECTED: "ASSET_DESELECTED",
    ASSET_SELECTED: "ASSET_SELECTED",
    ASSET_UPDATED: "ASSET_UPDATED",
    CONSOLE_CHANGE: "CONSOLE_CHANGE",
    CONSOLE_CLOSED: "CONSOLE_CLOSED",
    CONSOLE_EVENT: "CONSOLE_EVENT",
    CONSOLE_OPENED: "CONSOLE_OPENED",
    CONSOLE_RUN_COMMAND: "CONSOLE_RUN_COMMAND",
    CONSOLE_SERVER_CHANGE: "CONSOLE_SERVER_CHANGE",
    EMBED_ACTIVE_PEN_CHANGE: "EMBED_ACTIVE_PEN_CHANGE",
    EMBED_ACTIVE_THEME_CHANGE: "EMBED_ACTIVE_THEME_CHANGE",
    EMBED_ATTRIBUTE_CHANGE: "EMBED_ATTRIBUTE_CHANGE",
    EMBED_RESHOWN: "EMBED_RESHOWN",
    FORMAT_FINISH: "FORMAT_FINISH",
    FORMAT_ERROR: "FORMAT_ERROR",
    FORMAT_START: "FORMAT_START",
    IFRAME_PREVIEW_RELOAD_CSS: "IFRAME_PREVIEW_RELOAD_CSS",
    IFRAME_PREVIEW_URL_CHANGE: "IFRAME_PREVIEW_URL_CHANGE",
    KEY_PRESS: "KEY_PRESS",
    LINTER_FINISH: "LINTER_FINISH",
    LINTER_START: "LINTER_START",
    PEN_CHANGE_SERVER: "PEN_CHANGE_SERVER",
    PEN_CHANGE: "PEN_CHANGE",
    PEN_EDITOR_CLOSE: "PEN_EDITOR_CLOSE",
    PEN_EDITOR_CODE_FOLD: "PEN_EDITOR_CODE_FOLD",
    PEN_EDITOR_ERRORS: "PEN_EDITOR_ERRORS",
    PEN_EDITOR_EXPAND: "PEN_EDITOR_EXPAND",
    PEN_EDITOR_FOLD_ALL: "PEN_EDITOR_FOLD_ALL",
    PEN_EDITOR_LOADED: "PEN_EDITOR_LOADED",
    PEN_EDITOR_REFRESH_REQUEST: "PEN_EDITOR_REFRESH_REQUEST",
    PEN_EDITOR_RESET_SIZES: "PEN_EDITOR_RESET_SIZES",
    PEN_EDITOR_SIZES_CHANGE: "PEN_EDITOR_SIZES_CHANGE",
    PEN_EDITOR_UI_CHANGE_SERVER: "PEN_EDITOR_UI_CHANGE_SERVER",
    PEN_EDITOR_UI_CHANGE: "PEN_EDITOR_UI_CHANGE",
    PEN_EDITOR_UI_DISABLE: "PEN_EDITOR_UI_DISABLE",
    PEN_EDITOR_UI_ENABLE: "PEN_EDITOR_UI_ENABLE",
    PEN_EDITOR_UNFOLD_ALL: "PEN_EDITOR_UNFOLD_ALL",
    PEN_ERROR_INFINITE_LOOP: "PEN_ERROR_INFINITE_LOOP",
    PEN_ERROR_RUNTIME: "PEN_ERROR_RUNTIME",
    PEN_ERRORS: "PEN_ERRORS",
    PEN_LIVE_CHANGE: "PEN_LIVE_CHANGE",
    PEN_LOGS: "PEN_LOGS",
    PEN_MANIFEST_CHANGE: "PEN_MANIFEST_CHANGE",
    PEN_MANIFEST_FULL: "PEN_MANIFEST_FULL",
    PEN_PREVIEW_FINISH: "PEN_PREVIEW_FINISH",
    PEN_PREVIEW_START: "PEN_PREVIEW_START",
    PEN_SAVED: "PEN_SAVED",
    POPUP_CLOSE: "POPUP_CLOSE",
    POPUP_OPEN: "POPUP_OPEN",
    POST_CHANGE: "POST_CHANGE",
    POST_SAVED: "POST_SAVED",
    PROCESSING_FINISH: "PROCESSING_FINISH",
    PROCESSING_START: "PROCESSED_STARTED"
}, "object" != typeof window.CP && (window.CP = {}), window.CP.PenTimer = {
    programNoLongerBeingMonitored: !1,
    timeOfFirstCallToShouldStopLoop: 0,
    _loopExits: {},
    _loopTimers: {},
    START_MONITORING_AFTER: 2e3,
    STOP_ALL_MONITORING_TIMEOUT: 5e3,
    MAX_TIME_IN_LOOP_WO_EXIT: 2200,
    exitedLoop: function (E) {
        this._loopExits[E] = !0
    },
    shouldStopLoop: function (E) {
        if (this.programKilledSoStopMonitoring) return !0;
        if (this.programNoLongerBeingMonitored) return !1;
        if (this._loopExits[E]) return !1;
        var _ = this._getTime();
        if (0 === this.timeOfFirstCallToShouldStopLoop) return this.timeOfFirstCallToShouldStopLoop = _, !1;
        var o = _ - this.timeOfFirstCallToShouldStopLoop;
        if (o < this.START_MONITORING_AFTER) return !1;
        if (o > this.STOP_ALL_MONITORING_TIMEOUT) return this.programNoLongerBeingMonitored = !0, !1;
        try {
            this._checkOnInfiniteLoop(E, _)
        } catch (N) {
            return this._sendErrorMessageToEditor(), this.programKilledSoStopMonitoring = !0, !0
        }
        return !1
    },
    _sendErrorMessageToEditor: function () {
        try {
            if (this._shouldPostMessage()) {
                var E = {
                    topic: HUB_EVENTS.PEN_ERROR_INFINITE_LOOP,
                    data: {
                        line: this._findAroundLineNumber()
                    }
                };
                parent.postMessage(E, "*")
            } else this._throwAnErrorToStopPen()
        } catch (_) {
            this._throwAnErrorToStopPen()
        }
    },
    _shouldPostMessage: function () {
        return document.location.href.match(/boomboom/)
    },
    _throwAnErrorToStopPen: function () {
        throw "We found an infinite loop in your Pen. We've stopped the Pen from running. More details and workarounds at https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/"
    },
    _findAroundLineNumber: function () {
        var E = new Error,
            _ = 0;
        if (E.stack) {
            var o = E.stack.match(/boomboom\S+:(\d+):\d+/);
            o && (_ = o[1])
        }
        return _
    },
    _checkOnInfiniteLoop: function (E, _) {
        if (!this._loopTimers[E]) return this._loopTimers[E] = _, !1;
        var o;
        if (_ - this._loopTimers[E] > this.MAX_TIME_IN_LOOP_WO_EXIT) throw "Infinite Loop found on loop: " + E
    },
    _getTime: function () {
        return +new Date
    }
}, window.CP.shouldStopExecution = function (E) {
    var _ = window.CP.PenTimer.shouldStopLoop(E);
    return !0 === _ && console.warn("[CodePen]: An infinite loop (or a loop taking too long) was detected, so we stopped its execution. More details at https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/"), _
}, window.CP.exitedLoop = function (E) {
    window.CP.PenTimer.exitedLoop(E)
};