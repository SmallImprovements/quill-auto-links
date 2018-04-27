'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = {
  paste: true,
  type: true
};

var REGEXP_GLOBAL = /https?:\/\/[^\s]+/g;
var REGEXP_WITH_PRECEDING_WS = /(?:\s|^)(https?:\/\/[^\s]+)/;

var sliceFromLastWhitespace = function sliceFromLastWhitespace(str) {
  var whitespaceI = str.lastIndexOf(' ');
  var sliceI = whitespaceI === -1 ? 0 : whitespaceI + 1;
  return str.slice(sliceI);
};
function registerTypeListener(quill) {
  quill.keyboard.addBinding({
    collapsed: true,
    key: ' ',
    prefix: REGEXP_WITH_PRECEDING_WS,
    handler: function handler(range, context) {
      var url = sliceFromLastWhitespace(context.prefix);
      var retain = range.index - url.length;
      var ops = retain ? [{ retain: retain }] : [];
      ops.push({ 'delete': url.length }, { insert: url, attributes: { link: url } });
      quill.updateContents({ ops: ops });
      return true;
    }
  });
}

function registerPasteListener(quill) {
  quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
    if (typeof node.data !== 'string') {
      return;
    }
    var matches = node.data.match(REGEXP_GLOBAL);
    if (matches && matches.length > 0) {
      var ops = [];
      var str = node.data;
      matches.forEach(function (match) {
        var split = str.split(match);
        var beforeLink = split.shift();
        ops.push({ insert: beforeLink });
        ops.push({ insert: match, attributes: { link: match } });
        str = split.join(match);
      });
      ops.push({ insert: str });
      delta.ops = ops;
    }

    return delta;
  });
}

var AutoLinks = function AutoLinks(quill) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, AutoLinks);

  var opts = _extends({}, DEFAULT_OPTIONS, options);

  if (opts.type) {
    registerTypeListener(quill);
  }
  if (opts.paste) {
    registerPasteListener(quill);
  }
};

exports.default = AutoLinks;