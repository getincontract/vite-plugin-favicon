"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __objSpread = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
var _favicons = require('favicons'); var _favicons2 = _interopRequireDefault(_favicons);

// src/oracle.ts
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _findroot = require('find-root'); var _findroot2 = _interopRequireDefault(_findroot);
var _parseauthor = require('parse-author'); var _parseauthor2 = _interopRequireDefault(_parseauthor);
var Oracle = class {
  constructor(startingPath) {
    try {
      this.pkg = require(_path2.default.join(_findroot2.default.call(void 0, startingPath), "package.json"));
    } catch (_) {
      this.pkg = {};
    }
  }
  guessAppName() {
    return this.pkg.name;
  }
  guessDescription() {
    return this.pkg.description;
  }
  guessVersion() {
    return this.pkg.version;
  }
  guessDeveloper() {
    var _a, _b;
    let author = typeof this.pkg.author === "string" ? _parseauthor2.default.call(void 0, this.pkg.author) : typeof this.pkg.author === "object" && this.pkg.author ? {
      name: this.pkg.author.name,
      email: (_a = this.pkg.author) == null ? void 0 : _a.email,
      url: (_b = this.pkg.author) == null ? void 0 : _b.url
    } : {};
    if (!Object.keys(author).length) {
      if (Array.isArray(this.pkg.maintainers) && this.pkg.maintainers.length) {
        const maintainer = this.pkg.maintainers[0];
        author = typeof maintainer === "string" ? _parseauthor2.default.call(void 0, this.pkg.maintainers[0]) : typeof maintainer === "object" && maintainer ? {
          name: maintainer.name,
          email: maintainer == null ? void 0 : maintainer.email,
          url: maintainer == null ? void 0 : maintainer.url
        } : {};
      }
    }
    return author;
  }
  guessDeveloperName() {
    return this.guessDeveloper().name;
  }
  guessDeveloperURL() {
    return this.guessDeveloper().url;
  }
};
var oracle_default = Oracle;

// src/index.ts


// src/faviconsDefaults.ts
var getDefaultFaviconConfig = (options) => {
  const fOptions = options.favicons;
  return __objSpread(__objSpread({
    appShortName: null,
    dir: "auto",
    lang: "en-US",
    background: "#fff",
    theme_color: "#fff",
    appleStatusBarStyle: "black-translucent",
    display: "standalone",
    orientation: "any",
    scope: "/",
    start_url: "/?homescreen=1",
    version: "1.0",
    logging: false,
    pixel_art: false,
    loadManifestWithCredentials: false
  }, fOptions), {
    icons: __objSpread({
      android: true,
      appleIcon: true,
      appleStartup: true,
      favicons: true,
      windows: true,
      yandex: true
    }, fOptions == null ? void 0 : fOptions.icons)
  });
};

// src/index.ts
var _parse5 = require('parse5');
var HtmlTag = class {
  constructor(tag, attrs) {
    this.tag = tag;
    this.attrs = attrs;
  }
};
var ViteFaviconsPlugin = (options = {}) => {
  let viteConfig;
  const lOptions = typeof options === "string" ? {logo: options} : options;
  lOptions.outputPath = lOptions.outputPath === void 0 ? "" : lOptions.outputPath;
  lOptions.inject = lOptions.inject === void 0 ? true : lOptions.inject;
  lOptions.projectRoot = lOptions.projectRoot === void 0 ? process.cwd() : lOptions.projectRoot;
  const LOGO_PATH = _path2.default.resolve(lOptions.logo || _path2.default.join("assets", "logo.png"));
  const oracle = new oracle_default(lOptions.projectRoot);
  const {
    appName = oracle.guessAppName(),
    appDescription = oracle.guessDescription(),
    version = oracle.guessVersion(),
    developerName = oracle.guessDeveloperName(),
    developerURL = oracle.guessDeveloperURL()
  } = lOptions.favicons || {};
  lOptions.favicons = lOptions.favicons || {};
  Object.assign(lOptions.favicons, {
    appName,
    appDescription,
    version,
    developerName,
    developerURL
  });
  const getFavicons = async () => {
    if (lOptions && lOptions.favicons) {
      const outputPath = lOptions.outputPath === void 0 ? "" : lOptions.outputPath;
      lOptions.favicons.path = _path2.default.join(viteConfig.base, viteConfig.build.assetsDir, outputPath);
    }
    const faviconConfig = getDefaultFaviconConfig(lOptions);
    return await _favicons2.default.call(void 0, LOGO_PATH, faviconConfig);
  };
  const tags = [];
  const assetIds = new Map();
  const rebuildFavicons = async (ctx) => {
    ctx.addWatchFile(LOGO_PATH);
    const res = await getFavicons();
    if (viteConfig.command === "build") {
      for (const {name, contents} of res.files) {
        const outputPath = lOptions.outputPath === void 0 ? "" : lOptions.outputPath;
        const filePath = _path2.default.join(viteConfig.build.assetsDir, outputPath, name);
        assetIds.set(name, ctx.emitFile({type: "asset", fileName: filePath, source: contents}));
      }
      for (const {name, contents} of res.images) {
        const outputPath = lOptions.outputPath === void 0 ? "" : lOptions.outputPath;
        const filePath = _path2.default.join(viteConfig.build.assetsDir, outputPath, name);
        assetIds.set(name, ctx.emitFile({type: "asset", fileName: filePath, source: contents}));
      }
      if (!lOptions.inject) {
        const name = "webapp.html";
        const contents = res.html.join("\n");
        const outputPath = lOptions.outputPath === void 0 ? "" : lOptions.outputPath;
        const filePath = _path2.default.join(viteConfig.build.assetsDir, outputPath, name);
        assetIds.set(name, ctx.emitFile({type: "asset", fileName: filePath, source: contents}));
      }
    }
    for (const tag of res.html) {
      const node = _parse5.parseFragment.call(void 0, tag).childNodes[0];
      tags.push(new HtmlTag(node.nodeName, node.attrs.reduce((acc, v) => {
        const resolvedValue = assetIds.has(v.value.slice(1)) ? assetIds.get(v.value.slice(1)) || v.value : v.value;
        acc[v.name] = resolvedValue;
        return acc;
      }, {})));
    }
  };
  return {
    name: "vite-plugin-favicon",
    apply: "build",
    async buildStart() {
      await rebuildFavicons(this);
    },
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    transformIndexHtml() {
      if (lOptions.inject) {
        return tags;
      }
    }
  };
};
var src_default = ViteFaviconsPlugin;



exports.ViteFaviconsPlugin = ViteFaviconsPlugin; exports.default = src_default;
//# sourceMappingURL=index.cjs.map
