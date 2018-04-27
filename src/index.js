const DEFAULT_OPTIONS = {
  paste: true,
  type: true,
};

const REGEXP_GLOBAL = /https?:\/\/[^\s]+/g;
const REGEXP_WITH_PRECEDING_WS = /(?:\s|^)(https?:\/\/[^\s]+)/;

const sliceFromLastWhitespace = (str) => {
  const whitespaceI = str.lastIndexOf(' ');
  const sliceI = whitespaceI === -1 ? 0 : whitespaceI + 1;
  return str.slice(sliceI);
};
function registerTypeListener(quill) {
  quill.keyboard.addBinding({
    collapsed: true,
    key: ' ',
    prefix: REGEXP_WITH_PRECEDING_WS,
    handler: (range, context) => {
      const url = sliceFromLastWhitespace(context.prefix);
      const retain = range.index - url.length;
      const ops = retain ? [{ retain }] : [];
      ops.push(
        { 'delete': url.length },
        { insert: url, attributes: { link: url } }
      );
      quill.updateContents({ ops });
      return true;
    }
  });
}

function registerPasteListener(quill) {
  quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
    if (typeof node.data !== 'string') {
      return;
    }
    const matches = node.data.match(REGEXP_GLOBAL);
    if (matches && matches.length > 0) {
      const ops = [];
      let str = node.data;
      matches.forEach(match => {
        const split = str.split(match);
        const beforeLink = split.shift();
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

export default class AutoLinks {
  constructor(quill, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (opts.type) {
      registerTypeListener(quill);
    }
    if (opts.paste) {
      registerPasteListener(quill);
    }
  }
}

