const DEFAULT_OPTIONS = {
  paste: true,
  type: true,
};

const REGEXP = /https?:\/\/[^\s]+/;

function registerTypeListener(quill) {
  quill.keyboard.addBinding({
    collapsed: true,
    key: ' ',
    prefix: REGEXP,
    handler: (() => {
      let prevOffset = 0;
      return range => {
        let url;
        const text = quill.getText(prevOffset, range.index);
        const match = text.match(REGEXP);
        if (match === null) {
          prevOffset = range.index;
          return true;
        }
        if (match.length > 1) {
          url = match[match.length - 1];
        } else {
          url = match[0];
        }
        const ops = [];
        ops.push({ retain: range.index - url.length });
        ops.push({ 'delete': url.length });
        ops.push({ insert: url, attributes: { link: url } });
        quill.updateContents({ ops });
        prevOffset = range.index;
        return true;
      };
    })(),
  });
}

function registerPasteListener(quill) {
  quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
    if (typeof node.data !== 'string') {
      return;
    }
    const matches = node.data.match(REGEXP);
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

