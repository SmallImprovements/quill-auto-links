'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = {
  paste: true,
  type: true,
  http: true,
  email: true
};

var REGEXP_HTTP_GLOBAL = /https?:\/\/[^\s]+/g;
var REGEXP_HTTP_WITH_PRECEDING_WS = /(?:\s|^)(https?:\/\/[^\s]+)/;
// Email regexp shamelessly copied from https://github.com/epoberezkin/ajv/blob/v6.0.0-beta.2/lib/compile/formats.js#L46
var REGEXP_EMAIL_GLOBAL = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)[^\s]+/g;
var REGEXP_EMAIL_WITH_PRECEDING_WS = /(?:\s|^)([a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)[^\s]+)/;

var sliceFromLastWhitespace = function sliceFromLastWhitespace(str) {
  var whitespaceI = str.lastIndexOf(' ');
  var sliceI = whitespaceI === -1 ? 0 : whitespaceI + 1;
  return str.slice(sliceI);
};

function registerTypeListener(quill, options) {
  Object.entries({
    http: {
      regexp: REGEXP_HTTP_WITH_PRECEDING_WS,
      prefix: ''
    },
    email: {
      regexp: REGEXP_EMAIL_WITH_PRECEDING_WS,
      prefix: 'mailto:'
    }
  }).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        format = _ref2[0];

    return options[format];
  }).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        format = _ref4[0],
        _ref4$ = _ref4[1],
        regexp = _ref4$.regexp,
        prefix = _ref4$.prefix;

    quill.keyboard.addBinding({
      collapsed: true,
      key: ' ',
      prefix: regexp,
      handler: function handler(range, context) {
        var url = sliceFromLastWhitespace(context.prefix);
        var ops = [{ retain: range.index - url.length }, { retain: url.length, attributes: { link: prefix + url } }];
        quill.updateContents({ ops: ops });
        return true;
      }
    });
  });
}

function registerPasteListener(quill, options) {
  Object.entries({
    http: {
      regexp: REGEXP_HTTP_GLOBAL,
      prefix: ''
    },
    email: {
      regexp: REGEXP_EMAIL_GLOBAL,
      prefix: 'mailto:'
    }
  }).filter(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 1),
        format = _ref6[0];

    return options[format];
  }).forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        format = _ref8[0],
        _ref8$ = _ref8[1],
        regexp = _ref8$.regexp,
        prefix = _ref8$.prefix;

    quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
      if (typeof node.data !== 'string') {
        return;
      }
      var matches = node.data.match(regexp);
      if (matches && matches.length > 0) {
        var ops = [];
        var str = node.data;
        matches.forEach(function (match) {
          var split = str.split(match);
          var beforeLink = split.shift();
          ops.push({ insert: beforeLink });
          ops.push({ insert: match, attributes: { link: prefix + match } });
          str = split.join(match);
        });
        ops.push({ insert: str });
        delta.ops = ops;
      }

      return delta;
    });
  });
}

var AutoLinks = function AutoLinks(quill) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, AutoLinks);

  var opts = _extends({}, DEFAULT_OPTIONS, options);

  if (opts.type) {
    registerTypeListener(quill, opts);
  }
  if (opts.paste) {
    registerPasteListener(quill, opts);
  }
};

exports.default = AutoLinks;