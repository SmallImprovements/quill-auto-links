const DEFAULT_OPTIONS = {
  paste: true,
  type: true,
  http: true,
  email: true,
};

const REGEXP_HTTP_GLOBAL = /https?:\/\/[^\s]+/g;
const REGEXP_HTTP_WITH_PRECEDING_WS = /(?:\s|^)(https?:\/\/[^\s]+)/;
// Email regexp shamelessly copied from https://github.com/epoberezkin/ajv/blob/v6.0.0-beta.2/lib/compile/formats.js#L46
const REGEXP_EMAIL_GLOBAL = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)[^\s]+/g;
const REGEXP_EMAIL_WITH_PRECEDING_WS = /(?:\s|^)([a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)[^\s]+)/;

const sliceFromLastWhitespace = (str) => {
  const whitespaceI = str.lastIndexOf(' ');
  const sliceI = whitespaceI === -1 ? 0 : whitespaceI + 1;
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
  })
    .filter(([ format ]) => options[format])
    .forEach(([ format, { regexp, prefix } ]) => {
      quill.keyboard.addBinding({
        collapsed: true,
        key: ' ',
        prefix: regexp,
        handler: (range, context) => {
          const url = sliceFromLastWhitespace(context.prefix);
          const ops = [
              { retain: range.index - url.length },
              { retain: url.length, attributes: { link: prefix + url } }
          ];
          quill.updateContents({ ops });
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
  })
    .filter(([ format ]) => options[format])
    .forEach(([ format, { regexp, prefix } ]) => {
      quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        if (typeof node.data !== 'string') {
          return;
        }
        const matches = node.data.match(regexp);
        if (matches && matches.length > 0) {
          const ops = [];
          let str = node.data;
          matches.forEach(match => {
            const split = str.split(match);
            const beforeLink = split.shift();
            ops.push({ insert: beforeLink });
            ops.push({ insert: match, attributes: { link: prefix + match } });
            str = split.join(match);
          });
          ops.push({ insert: str });
          delta.ops = ops;
        }

        return delta;
      });
    })
}

export default class AutoLinks {
  constructor(quill, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (opts.type) {
      registerTypeListener(quill, opts);
    }
    if (opts.paste) {
      registerPasteListener(quill, opts);
    }
  }
}
