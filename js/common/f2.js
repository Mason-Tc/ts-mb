(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["F2"] = factory();
	else
		root["F2"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 87);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ???????????????
 * @author dxq613@gmail.com
 */
var DomUtil = __webpack_require__(29);
var objectPrototype = Object.prototype;
var toString = objectPrototype.toString;
var MAX_LEVEL = 5;

var Util = void 0;

function _deepMix(dst, src, level) {
  level = level || 0;
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      var value = src[k];
      if (value !== null && Util.isPlainObject(value)) {
        if (!Util.isPlainObject(dst[k])) {
          dst[k] = {};
        }
        if (level < MAX_LEVEL) {
          _deepMix(dst[k], src[k], level + 1);
        } else {
          dst[k] = src[k];
        }
      } else if (Util.isArray(value)) {
        dst[k] = [];
        dst[k] = dst[k].concat(value);
      } else if (value !== undefined) {
        dst[k] = src[k];
      }
    }
  }
}

function _mix(dist, obj) {
  for (var k in obj) {
    if (obj.hasOwnProperty(k) && k !== 'constructor' && obj[k] !== undefined) {
      dist[k] = obj[k];
    }
  }
}

/**
 * @class Util
 * @singleton
 * ??????????????????
 */
Util = {
  /**
   * ??????????????????????????????
   * @param  {String} s ?????????
   * @return {String} ??????????????????????????????
   */
  upperFirst: function upperFirst(s) {
    s += '';
    return s.charAt(0).toUpperCase() + s.substring(1);
  },
  lowerFirst: function lowerFirst(s) {
    s += '';
    return s.charAt(0).toLowerCase() + s.substring(1);
  },

  /**
   * ????????????????????????
   * @param {*} value ????????????
   * @return {Boolean} ??????????????????
   */
  isString: function isString(value) {
    return typeof value === 'string';
  },

  /**
   * ??????????????????
   * @param {*} value ????????????
   * @return {Boolean} ????????????
   */
  isNumber: function isNumber(value) {
    return typeof value === 'number';
  },

  /**
   * ?????????????????????
   * @param {Object} value ????????????
   * @return {Boolean} ??????????????????
   */
  isBoolean: function isBoolean(value) {
    return typeof value === 'boolean';
  },

  /**
   * ???????????????
   * @param  {*} fn ??????
   * @return {Boolean}  ????????????
   */
  isFunction: function isFunction(fn) {
    return typeof fn === 'function';
  },

  /**
   * ????????????
   * @method
   * @param  {*}  value ????????????
   * @return {Boolean}  ????????????
   */
  isArray: 'isArray' in Array ? Array.isArray : function (value) {
    return toString.call(value) === '[object Array]';
  },
  /**
   * ????????????
   * @param  {*}  value ??????
   * @return {Boolean}  ????????????
   */
  isDate: function isDate(value) {
    return toString.call(value) === '[object Date]';
  },
  isNil: function isNil(o) {
    return o === undefined || o === null;
  },

  /**
   * ?????????javascript??????
   * @param {Object} value The value to test
   * @return {Boolean} ??????????????????
   */
  isObject: toString.call(null) === '[object Object]' ? function (value) {
    // check ownerDocument here as well to exclude DOM nodes
    return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
  } : function (value) {
    return toString.call(value) === '[object Object]';
  },
  isPlainObject: function isPlainObject(o) {
    if (!Util.isObject(o)) return false;
    if (Object.getPrototypeOf(o) === null) {
      return true;
    }
    var proto = o;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(o) === proto;
  },
  deepMix: function deepMix() {
    var args = new Array(arguments.length);
    var length = args.length;
    for (var i = 0; i < length; i++) {
      args[i] = arguments[i];
    }
    var rst = args[0];
    for (var _i = 1; _i < length; _i++) {
      var source = args[_i];
      _deepMix(rst, source);
    }
    return rst;
  },

  /**
   * ????????????, ?????????????????????????????????3?????????
   * @param {Object} dist ?????????
   * @param {Object} obj1 ???????????????1
   * @param {Object} obj2 ???????????????2
   * @param {Object} obj3 ???????????????3
   * @return {Object} ???????????????????????????
   */
  mix: function mix(dist, obj1, obj2, obj3) {
    if (obj1) {
      _mix(dist, obj1);
    }

    if (obj2) {
      _mix(dist, obj2);
    }

    if (obj3) {
      _mix(dist, obj3);
    }
    return dist;
  },
  indexOf: function indexOf(arr, element) {
    return arr.indexOf(element);
  },

  /**
   * ????????????????????????
   * @param {Object|Array} elements ????????????????????????????????????
   * @param {Function} func ??????????????? function(elememt,index){} ?????? function(value,key){}
   */
  each: function each(elements, func) {
    if (!elements) {
      return;
    }
    if (elements.length) {
      for (var i = 0, len = elements.length; i < len; i++) {
        var rst = func(elements[i], i);
        if (rst === false) {
          break;
        }
      }
    } else {
      for (var k in elements) {
        if (elements.hasOwnProperty(k)) {
          var _rst = func(elements[k], k);
          if (_rst === false) {
            break;
          }
        }
      }
    }
  },
  fixedBase: function fixedBase(v, base) {
    var str = base.toString();
    var index = str.indexOf('.');
    if (index === -1) {
      return Math.round(v);
    }
    var length = str.substr(index + 1).length;
    if (length > 20) {
      length = 20;
    }
    return parseFloat(v.toFixed(length));
  },

  /**
  * ????????????????????????????????????this,??????????????????????????????
  * @protected
  * @param  {Object} obj   ??????
  * @param  {String} action ????????????
  * @return {Function}        ????????????????????????
  */
  wrapBehavior: function wrapBehavior(obj, action) {
    if (obj['_wrap_' + action]) {
      return obj['_wrap_' + action];
    }
    var method = function method(e) {
      obj[action](e);
    };
    obj['_wrap_' + action] = method;
    return method;
  },

  /**
   * ?????????????????????
   * @protected
   * @param  {Object} obj   ??????
   * @param  {String} action ????????????
   * @return {Function}        ????????????????????????
   */
  getWrapBehavior: function getWrapBehavior(obj, action) {
    return obj['_wrap_' + action];
  },
  parsePadding: function parsePadding(padding) {
    var top = void 0;
    var right = void 0;
    var bottom = void 0;
    var left = void 0;

    if (Util.isNumber(padding) || Util.isString(padding)) {
      top = bottom = left = right = padding;
    } else if (Util.isArray(padding)) {
      top = padding[0];
      right = !Util.isNil(padding[1]) ? padding[1] : padding[0];
      bottom = !Util.isNil(padding[2]) ? padding[2] : padding[0];
      left = !Util.isNil(padding[3]) ? padding[3] : right;
    }

    return [top, right, bottom, left];
  }
};

Util.Array = {
  merge: function merge(dataArray) {
    var rst = [];
    for (var i = 0, len = dataArray.length; i < len; i++) {
      rst = rst.concat(dataArray[i]);
    }
    return rst;
  },
  values: function values(data, name) {
    var rst = [];
    var tmpMap = {};
    for (var i = 0, len = data.length; i < len; i++) {
      var obj = data[i];
      var value = obj[name];
      if (!Util.isNil(value)) {
        if (!Util.isArray(value)) {
          if (!tmpMap[value]) {
            rst.push(value);
            tmpMap[value] = true;
          }
        } else {
          Util.each(value, function (val) {
            if (!tmpMap[val]) {
              rst.push(val);
              tmpMap[val] = true;
            }
          });
        }
      }
    }
    return rst;
  },
  firstValue: function firstValue(data, name) {
    var rst = null;
    for (var i = 0, len = data.length; i < len; i++) {
      var obj = data[i];
      var value = obj[name];
      if (!Util.isNil(value)) {
        if (Util.isArray(value)) {
          rst = value[0];
        } else {
          rst = value;
        }
        break;
      }
    }
    return rst;
  },
  group: function group(data, condition) {
    if (!condition) {
      return [data];
    }
    var groups = Util.Array.groupToMap(data, condition);
    var array = [];
    for (var i in groups) {
      array.push(groups[i]);
    }
    return array;
  },
  groupToMap: function groupToMap(data, condition) {
    if (!condition) {
      return {
        0: data
      };
    }
    if (!Util.isFunction(condition)) {
      var paramsCondition = Util.isArray(condition) ? condition : condition.replace(/\s+/g, '').split('*');
      condition = function condition(row) {
        var unique = '_'; // ????????????????????????Key??????????????????????????????????????????
        for (var i = 0, l = paramsCondition.length; i < l; i++) {
          unique += row[paramsCondition[i]] && row[paramsCondition[i]].toString();
        }
        return unique;
      };
    }

    var groups = {};
    for (var i = 0, len = data.length; i < len; i++) {
      var row = data[i];
      var key = condition(row);
      if (groups[key]) {
        groups[key].push(row);
      } else {
        groups[key] = [row];
      }
    }

    return groups;
  },
  remove: function remove(arr, obj) {
    if (!arr) {
      return;
    }
    var index = arr.indexOf(obj);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  }
};

Util.mix(Util, DomUtil);

module.exports = Util;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Theme = __webpack_require__(28);
var Util = __webpack_require__(0);

/**
 * @class ???????????????
 */
var Global = {
  // ?????????????????????
  scales: {
    nice: true
  },
  // ??????
  widthRatio: { // ??????????????????????????????
    column: 1 / 2, // ???????????????????????? 1/2
    rose: 0.999999,
    multiplePie: 3 / 4,
    dodgeMargin: 0
  },
  // ????????????
  lineDash: [4, 4]
};

Global.setTheme = function (theme) {
  Util.mix(this, theme);
};

Global.setTheme(Theme);
module.exports = Global;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Element = __webpack_require__(16);

var Shape = function (_Element) {
  _inherits(Shape, _Element);

  function Shape() {
    _classCallCheck(this, Shape);

    return _possibleConstructorReturn(this, _Element.apply(this, arguments));
  }

  Shape.prototype._initProperties = function _initProperties() {
    this._attrs = {
      zIndex: 0,
      visible: true,
      destroyed: false,
      isShape: true,
      attrs: {}
    };
  };

  Shape.prototype.drawInner = function drawInner(context) {
    var self = this;
    var attrs = self.get('attrs');
    self.createPath(context);
    var originOpacity = context.globalAlpha;
    if (self.hasFill()) {
      var fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = originOpacity;
      } else {
        context.fill();
      }
    }
    if (self.hasStroke()) {
      var lineWidth = attrs.lineWidth;
      if (lineWidth > 0) {
        var strokeOpacity = attrs.strokeOpacity;
        if (!Util.isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.stroke();
      }
    }
  };

  Shape.prototype.getBBox = function getBBox() {
    var bbox = this._attrs.bbox;
    // ????????????
    if (!bbox) {
      bbox = this.calculateBox();
      if (bbox) {
        bbox.x = bbox.minX;
        bbox.y = bbox.minY;
        bbox.width = bbox.maxX - bbox.minX;
        bbox.height = bbox.maxY - bbox.minY;
      }
      this._attrs.bbox = bbox;
    }
    return bbox;
  };

  /**
   * @protected
   * ???????????????
   * @return {Object} ?????????
   */


  Shape.prototype.calculateBox = function calculateBox() {
    return null;
  };

  Shape.prototype.createPath = function createPath() {};

  return Shape;
}(Element);

module.exports = Shape;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

/**
 * 2 Dimensional Vector
 * @module vector2
 */
module.exports = {
  /**
   * Creates a new, empty vector2
   *
   * @return {vector2} a new 2D vector
   */
  create: function create() {
    return [0, 0];
  },

  /**
   * Calculates the length of a vector2
   *
   * @param {vector2} v vector to calculate length of
   * @return {Number} length of v
   */
  length: function length(v) {
    var x = v[0];
    var y = v[1];
    return Math.sqrt(x * x + y * y);
  },

  /**
   * Normalize a vector2
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v vector to normalize
   * @return {vector2} out
   */
  normalize: function normalize(out, v) {
    var len = this.length(v);
    if (len === 0) {
      out[0] = 0;
      out[1] = 0;
    } else {
      out[0] = v[0] / len;
      out[1] = v[1] / len;
    }

    return out;
  },

  /**
   * Adds two vector2's
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {vector2} out
   */
  add: function add(out, v1, v2) {
    out[0] = v1[0] + v2[0];
    out[1] = v1[1] + v2[1];
    return out;
  },

  /**
   * Subtracts vector v2 from vector v1
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {vector2} out
   */
  sub: function sub(out, v1, v2) {
    out[0] = v1[0] - v2[0];
    out[1] = v1[1] - v2[1];
    return out;
  },

  /**
   * Scales a vector2 by a scalar number
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v the vector to scale
   * @param {Number} s amount to scale the vector by
   * @return {vector2} out
   */
  scale: function scale(out, v, s) {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    return out;
  },

  /**
   * Calculates the dot product of two vector2's
   *
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {Number} dot product of v1 and v2
   */
  dot: function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
  },

  /**
   * Calculates the direction of two vector2's
   *
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {Boolean} the direction of v1 and v2
   */
  direction: function direction(v1, v2) {
    return v1[0] * v2[1] - v2[0] * v1[1];
  },

  /**
   * Calculates the angle of two vector2's
   *
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {Number} angle of v1 and v2
   */
  angle: function angle(v1, v2) {
    var theta = this.dot(v1, v2) / (this.length(v1) * this.length(v2));
    return Math.acos(theta);
  },

  /**
   * Calculates the angle of two vector2's with direction
   *
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @param {Boolean} direction the direction of two vector2's
   * @return {Number} angle of v1 and v2
   */
  angleTo: function angleTo(v1, v2, direction) {
    var angle = this.angle(v1, v2);
    var angleLargeThanPI = this.direction(v1, v2) >= 0;
    if (direction) {
      if (angleLargeThanPI) {
        return Math.PI * 2 - angle;
      }

      return angle;
    }

    if (angleLargeThanPI) {
      return angle;
    }
    return Math.PI * 2 - angle;
  },

  /**
   * whether a vector2 is zero vector
   *
   * @param  {vector2} v vector to calculate
   * @return {Boolean}   is or not a zero vector
   */
  zero: function zero(v) {
    return v[0] === 0 && v[1] === 0;
  },

  /**
   * Calculates the euclidian distance between two vector2's
   *
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {Number} distance between a and b
   */
  distance: function distance(v1, v2) {
    var x = v2[0] - v1[0];
    var y = v2[1] - v1[1];
    return Math.sqrt(x * x + y * y);
  },

  /**
   * Creates a new vector2 initialized with values from an existing vector
   *
   * @param {vector2} v vector to clone
   * @return {Array} a new 2D vector
   */
  clone: function clone(v) {
    return [v[0], v[1]];
  },

  /**
   * Return the minimum of two vector2's
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {vector2} out
   */
  min: function min(out, v1, v2) {
    out[0] = Math.min(v1[0], v2[0]);
    out[1] = Math.min(v1[1], v2[1]);
    return out;
  },

  /**
   * Return the maximum of two vector2's
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v1 the first operand
   * @param {vector2} v2 the second operand
   * @return {vector2} out
   */
  max: function max(out, v1, v2) {
    out[0] = Math.max(v1[0], v2[0]);
    out[1] = Math.max(v1[1], v2[1]);
    return out;
  },

  /**
   * Transforms the vector2 with a mat2d
   *
   * @param {vector2} out the receiving vector
   * @param {vector2} v the vector to transform
   * @param {mat2d} m matrix to transform with
   * @return {vector2} out
   */
  transformMat2d: function transformMat2d(out, v, m) {
    var x = v[0];
    var y = v[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
  }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Base = __webpack_require__(17);
var GROUP_ATTRS = ['color', 'size', 'shape'];
var FIELD_ORIGIN = '_origin';
var FIELD_ORIGIN_Y = '_originY';
var Global = __webpack_require__(1);
var Attr = __webpack_require__(33);
var Shape = __webpack_require__(5);
var Adjust = __webpack_require__(11);

function parseFields(field) {
  if (Util.isArray(field)) {
    return field;
  }
  if (Util.isString(field)) {
    return field.split('*');
  }
  return [field];
}

/**
 * ???????????????
 * @class Geom
 */

var Geom = function (_Base) {
  _inherits(Geom, _Base);

  function Geom() {
    _classCallCheck(this, Geom);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Geom.prototype.getDefaultCfg = function getDefaultCfg() {
    return {
      /**
       * core?????????
       * @type {String}
       */
      type: null,
      /**
       * ?????????????????????
       * @type {Array}
       */
      data: null,
      /**
       * ??????????????????
       * @type {Object}
       */
      attrs: {},

      scales: {},

      /**
       * ??????
       * @type {Canvas}
       */
      container: null,
      /**
       * ????????????
       * @type {Object}
       */
      styleOptions: null,

      chart: null,

      shapeType: '',

      /**
       * ????????????????????????????????????
       * @protected
       * @type {Boolean}
       */
      generatePoints: false,

      attrOptions: {},

      sortable: false,
      /**
       * ???????????????????????? 0 ?????????????????? 0????????? 0 ?????????
       * ????????????????????????
       * @type {Boolean}
      */
      startOnZero: true
    };
  };

  Geom.prototype.init = function init() {
    var self = this;
    self._initAttrs();
    var dataArray = self._processData();
    if (self.get('adjust')) {
      self._adjustData(dataArray);
    }
    self.set('dataArray', dataArray);
  };

  // ?????????????????????


  Geom.prototype._getGroupScales = function _getGroupScales() {
    var self = this;
    var scales = [];
    Util.each(GROUP_ATTRS, function (attrName) {
      var attr = self.getAttr(attrName);
      if (attr) {
        var attrScales = attr.scales;
        Util.each(attrScales, function (scale) {
          if (scale && scale.isCategory && scales.indexOf(scale) === -1) {
            scales.push(scale);
          }
        });
      }
    });
    return scales;
  };

  // ????????????


  Geom.prototype._groupData = function _groupData(data) {
    var self = this;
    var groupScales = self._getGroupScales();
    if (groupScales.length) {
      var names = [];
      Util.each(groupScales, function (scale) {
        names.push(scale.field);
      });
      return Util.Array.group(data, names);
    }
    return [data];
  };

  // ????????????????????????


  Geom.prototype._setAttrOptions = function _setAttrOptions(attrName, attrCfg) {
    var options = this.get('attrOptions');
    options[attrName] = attrCfg;
  };

  Geom.prototype._createAttrOption = function _createAttrOption(attrName, field, cfg, defaultValues) {
    var attrCfg = {};
    attrCfg.field = field;
    if (cfg) {
      if (Util.isFunction(cfg)) {
        attrCfg.callback = cfg;
      } else {
        attrCfg.values = cfg;
      }
    } else {
      attrCfg.values = defaultValues;
    }
    this._setAttrOptions(attrName, attrCfg);
  };

  // step 1: init attrs


  Geom.prototype._initAttrs = function _initAttrs() {
    var self = this;
    var attrs = self.get('attrs');
    var attrOptions = self.get('attrOptions');
    var coord = self.get('coord');

    for (var type in attrOptions) {
      if (attrOptions.hasOwnProperty(type)) {
        var option = attrOptions[type];
        var className = Util.upperFirst(type);
        var fields = parseFields(option.field);
        if (type === 'position') {
          option.coord = coord;
        }
        var scales = [];
        for (var i = 0, len = fields.length; i < len; i++) {
          var field = fields[i];
          var scale = self._createScale(field);
          scales.push(scale);
        }
        if (type === 'position') {
          var yScale = scales[1];
          if (self.get('type') === 'interval') {
            // ?????????????????????0?????????
            if (yScale.values.length) {
              yScale.change({
                min: Math.min(0, yScale.min)
              });
            }
          }
          // ?????????????????????????????????
          if (coord.type === 'polar' && coord.transposed && self.hasAdjust('stack')) {
            if (yScale.values.length) {
              yScale.change({
                nice: false,
                min: 0,
                max: Math.max.apply(null, yScale.values)
              });
            }
          }
        }

        option.scales = scales;
        var attr = new Attr[className](option);
        attrs[type] = attr;
      }
    }
  };

  Geom.prototype._createScale = function _createScale(field) {
    var sortable = this.get('sortable');
    var scales = this.get('scales');
    var scale = scales[field];
    if (!scale) {
      scale = this.get('chart').createScale(field, sortable);
      scales[field] = scale;
    }
    return scale;
  };

  // ????????????


  Geom.prototype._processData = function _processData() {
    var self = this;
    var data = this.get('data');
    var dataArray = [];
    var groupedArray = this._groupData(data);
    for (var i = 0, len = groupedArray.length; i < len; i++) {
      var subData = groupedArray[i];
      var tempData = self._saveOrigin(subData);
      if (this.hasAdjust('dodge')) {
        self._numberic(tempData);
      }
      dataArray.push(tempData);
    }
    return dataArray;
  };

  Geom.prototype._saveOrigin = function _saveOrigin(data) {
    var rst = [];
    for (var i = 0, len = data.length; i < len; i++) {
      var origin = data[i];
      var obj = {};
      for (var k in origin) {
        obj[k] = origin[k];
      }
      obj[FIELD_ORIGIN] = origin;
      rst.push(obj);
    }
    return rst;
  };

  // step 2.3 ??????????????????????????????, ????????????????????????????????????????????????


  Geom.prototype._numberic = function _numberic(data) {
    var positionAttr = this.getAttr('position');
    var scales = positionAttr.scales;
    for (var j = 0, len = data.length; j < len; j++) {
      var obj = data[j];
      var count = Math.min(2, scales.length);
      for (var i = 0; i < count; i++) {
        var scale = scales[i];
        if (scale.isCategory) {
          var field = scale.field;
          obj[field] = scale.translate(obj[field]);
        }
      }
    }
  };

  // ??????????????????


  Geom.prototype._adjustData = function _adjustData(dataArray) {
    var self = this;
    var adjust = self.get('adjust');
    if (adjust) {
      var adjustType = Util.upperFirst(adjust.type);
      if (!Adjust[adjustType]) {
        throw new Error('not support such adjust : ' + adjust);
      }

      var xScale = self.getXScale();
      var yScale = self.getYScale();
      var cfg = Util.mix({
        xField: xScale.field,
        yField: yScale.field
      }, adjust);
      var adjustObject = new Adjust[adjustType](cfg);
      adjustObject.processAdjust(dataArray);
      if (adjustType === 'Stack') {
        self._updateStackRange(yScale.field, yScale, dataArray);
      }
    }
  };

  Geom.prototype._updateStackRange = function _updateStackRange(field, scale, dataArray) {
    var mergeArray = Util.Array.merge(dataArray);
    var min = scale.min;
    var max = scale.max;
    for (var i = 0, len = mergeArray.length; i < len; i++) {
      var obj = mergeArray[i];
      var tmpMin = Math.min.apply(null, obj[field]);
      var tmpMax = Math.max.apply(null, obj[field]);
      if (tmpMin < min) {
        min = tmpMin;
      }
      if (tmpMax > max) {
        max = tmpMax;
      }
    }
    if (min < scale.min || max > scale.max) {
      scale.change({
        min: min,
        max: max
      });
    }
  };

  Geom.prototype._sort = function _sort(mappedArray) {
    var self = this;
    var xScale = self.getXScale();
    var xField = xScale.field;
    if (xScale.type !== 'identity' && xScale.values.length > 1) {
      Util.each(mappedArray, function (itemArr) {
        itemArr.sort(function (obj1, obj2) {
          return xScale.translate(obj1[FIELD_ORIGIN][xField]) - xScale.translate(obj2[FIELD_ORIGIN][xField]);
        });
      });
    }
    self.set('hasSorted', true);
    self.set('dataArray', mappedArray);
  };

  Geom.prototype.paint = function paint() {
    var self = this;
    var dataArray = self.get('dataArray');
    var mappedArray = [];
    var shapeFactory = self.getShapeFactory();
    shapeFactory.setCoord(self.get('coord'));
    self._beforeMapping(dataArray);
    // let shapes = [];
    for (var i = 0, len = dataArray.length; i < len; i++) {
      var data = dataArray[i];
      data = self._mapping(data);
      mappedArray.push(data);
      self.draw(data, shapeFactory);
      // shapes = shapes.concat(drawedShapes);
    }
    self.set('dataArray', mappedArray);
    // self.set('shapes', shapes);
  };

  /**
   * @protected
   * ????????????????????????
   * @return {Object} ???????????????
   */


  Geom.prototype.getShapeFactory = function getShapeFactory() {
    var shapeFactory = this.get('shapeFactory');
    if (!shapeFactory) {
      var shapeType = this.get('shapeType');
      shapeFactory = Shape.getShapeFactory(shapeType);
      this.set('shapeFactory', shapeFactory);
    }
    return shapeFactory;
  };

  // step 3.2 mapping


  Geom.prototype._mapping = function _mapping(data) {
    var self = this;
    var attrs = self.get('attrs');
    var yField = self.getYScale().field;
    var mappedData = [];
    for (var i = 0, len = data.length; i < len; i++) {
      var record = data[i];
      var newRecord = {};
      newRecord[FIELD_ORIGIN] = record[FIELD_ORIGIN];
      newRecord.points = record.points;
      // ??????
      newRecord[FIELD_ORIGIN_Y] = record[yField];
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          var attr = attrs[k];
          var names = attr.names;
          var values = self._getAttrValues(attr, record);
          if (names.length > 1) {
            // position ????????????????????????????????????
            for (var j = 0, _len = values.length; j < _len; j++) {
              var val = values[j];
              var name = names[j];
              newRecord[name] = Util.isArray(val) && val.length === 1 ? val[0] : val; // ??????????????????????????????????????????
            }
          } else {
            newRecord[names[0]] = values.length === 1 ? values[0] : values;
          }
        }
      }
      mappedData.push(newRecord);
    }

    return mappedData;
  };

  // ????????????????????????


  Geom.prototype._getAttrValues = function _getAttrValues(attr, record) {
    var scales = attr.scales;
    var params = [];
    for (var i = 0, len = scales.length; i < len; i++) {
      var scale = scales[i];
      var field = scale.field;
      if (scale.type === 'identity') {
        params.push(scale.value);
      } else {
        params.push(record[field]);
      }
    }
    var values = attr.mapping.apply(attr, params);
    return values;
  };

  Geom.prototype.getAttrValue = function getAttrValue(attrName, record) {
    var attr = this.getAttr(attrName);
    var rst = null;
    if (attr) {
      var values = this._getAttrValues(attr, record);
      rst = values[0];
    }
    return rst;
  };

  Geom.prototype._beforeMapping = function _beforeMapping(dataArray) {
    var self = this;
    if (self.get('sortable')) {
      // ????????????
      self._sort(dataArray);
    }
    if (self.get('generatePoints')) {
      Util.each(dataArray, function (data) {
        self._generatePoints(data);
      });
    }
  };

  Geom.prototype.isInCircle = function isInCircle() {
    var coord = this.get('coord');
    return coord && coord.isPolar;
  };

  Geom.prototype.getCallbackCfg = function getCallbackCfg(fields, cfg, origin) {
    if (!fields) {
      return cfg;
    }
    var tmpCfg = {};
    var params = fields.map(function (field) {
      return origin[field];
    });
    Util.each(cfg, function (v, k) {
      if (Util.isFunction(v)) {
        tmpCfg[k] = v.apply(null, params);
      } else {
        tmpCfg[k] = v;
      }
    });
    return tmpCfg;
  };

  Geom.prototype.getDrawCfg = function getDrawCfg(obj) {
    var self = this;
    var isInCircle = self.isInCircle();
    var cfg = {
      origin: obj,
      x: obj.x,
      y: obj.y,
      color: obj.color,
      size: obj.size,
      shape: obj.shape,
      isInCircle: isInCircle,
      opacity: obj.opacity
    };
    var styleOptions = self.get('styleOptions');
    if (styleOptions && styleOptions.style) {
      cfg.style = self.getCallbackCfg(styleOptions.fields, styleOptions.style, obj[FIELD_ORIGIN]);
    }
    if (self.get('generatePoints')) {
      cfg.points = obj.points;
    }
    if (isInCircle) {
      cfg.center = self.get('coord').center;
    }
    return cfg;
  };

  Geom.prototype.draw = function draw(data, shapeFactory) {
    var self = this;
    var container = self.get('container');
    var yScale = self.getYScale();
    Util.each(data, function (obj, index) {
      if (yScale && Util.isNil(obj._origin[yScale.field])) {
        return;
      }
      obj.index = index;
      var cfg = self.getDrawCfg(obj);
      var shape = obj.shape;
      self.drawShape(shape, obj, cfg, container, shapeFactory);
    });
  };

  Geom.prototype.drawShape = function drawShape(shape, shapeData, cfg, container, shapeFactory) {
    var gShape = shapeFactory.drawShape(shape, cfg, container);

    if (gShape) {
      Util.each([].concat(gShape), function (s) {
        s.set('origin', shapeData); // todo
      });
    }
  };

  Geom.prototype._generatePoints = function _generatePoints(data) {
    var self = this;
    var shapeFactory = self.getShapeFactory();
    var shapeAttr = self.getAttr('shape');
    for (var i = 0, len = data.length; i < len; i++) {
      var obj = data[i];
      var cfg = self.createShapePointsCfg(obj);
      var shape = shapeAttr ? self._getAttrValues(shapeAttr, obj) : null;
      var points = shapeFactory.getShapePoints(shape, cfg);
      obj.points = points;
    }
  };

  /**
   * ?????????????????????????????????
   * @protected
   * @param  {Object} obj ????????????
   * @return {Object} cfg ?????????????????????????????????
   */


  Geom.prototype.createShapePointsCfg = function createShapePointsCfg(obj) {
    var xScale = this.getXScale();
    var yScale = this.getYScale();
    var x = this._normalizeValues(obj[xScale.field], xScale);
    var y = void 0; // ???????????? y ?????????

    if (yScale) {
      y = this._normalizeValues(obj[yScale.field], yScale);
    } else {
      y = obj.y ? obj.y : 0.1;
    }

    return {
      x: x,
      y: y,
      y0: yScale ? yScale.scale(this.getYMinValue()) : undefined
    };
  };

  /**
   * @protected
   * @return {Number} y ??????????????????
   */


  Geom.prototype.getYMinValue = function getYMinValue() {
    var yScale = this.getYScale();
    var min = yScale.min;
    var value = void 0;

    if (this.get('startOnZero')) {
      value = min >= 0 ? min : 0;
    } else {
      value = min;
    }

    return value;
  };

  // ??????????????????


  Geom.prototype._normalizeValues = function _normalizeValues(values, scale) {
    var rst = [];
    if (Util.isArray(values)) {
      for (var i = 0, len = values.length; i < len; i++) {
        var v = values[i];
        rst.push(scale.scale(v));
      }
    } else {
      rst = scale.scale(values);
    }
    return rst;
  };

  /**
   * ????????????
   * @protected
   * @param {String} name ?????????
   * @return {Scale} ??????
   */


  Geom.prototype.getAttr = function getAttr(name) {
    return this.get('attrs')[name];
  };

  /**
   * ?????? x ???????????????
   * @return {Scale} x ???????????????
   */


  Geom.prototype.getXScale = function getXScale() {
    return this.getAttr('position').scales[0];
  };

  /**
   * ?????? y ???????????????
   * @return {Scale} y ???????????????
   */


  Geom.prototype.getYScale = function getYScale() {
    return this.getAttr('position').scales[1];
  };

  Geom.prototype.hasAdjust = function hasAdjust(adjust) {
    return this.get('adjust') && this.get('adjust').type === adjust;
  };

  Geom.prototype._getSnap = function _getSnap(scale, item, arr) {
    var i = 0;
    var values = void 0;
    var yField = this.getYScale().field; // ???????????????
    if (this.hasAdjust('stack') && scale.field === yField) {
      values = [];
      arr.forEach(function (obj) {
        values.push(obj[FIELD_ORIGIN_Y]);
      });

      for (var len = values.length; i < len; i++) {
        if (values[0][0] > item) {
          break;
        }
        if (values[values.length - 1][1] <= item) {
          i = values.length - 1;
          break;
        }
        if (values[i][0] <= item && values[i][1] > item) {
          break;
        }
      }
    } else {
      values = scale.values;
      values.sort(function (a, b) {
        return a - b;
      });
      for (var _len2 = values.length; i < _len2; i++) {
        if ((values[0] + values[1]) / 2 > item) {
          break;
        }
        if ((values[i - 1] + values[i]) / 2 <= item && (values[i + 1] + values[i]) / 2 > item) {
          break;
        }
        if ((values[values.length - 2] + values[values.length - 1]) / 2 <= item) {
          i = values.length - 1;
          break;
        }
      }
    }
    var result = values[i];
    return result;
  };

  /**
   * ????????????????????????????????????????????????
   * @param  {Object} point ???????????????x,y??????
   * @return {Array} ???????????????????????????
  **/


  Geom.prototype.getSnapRecords = function getSnapRecords(point) {
    var self = this;
    var coord = self.get('coord');
    var xScale = self.getXScale();
    var yScale = self.getYScale();
    var xfield = xScale.field;

    var dataArray = self.get('dataArray');
    if (!this.get('hasSorted')) {
      this._sort(dataArray);
    }

    var rst = [];
    var invertPoint = coord.invertPoint(point);
    var invertPointX = invertPoint.x;
    if (self.isInCircle() && !coord.transposed && invertPointX > (1 + xScale.rangeMax()) / 2) {
      invertPointX = xScale.rangeMin(); // ???????????????scale ??? range ????????????????????? see chart.js#L183
    }

    var xValue = xScale.invert(invertPointX);
    if (!xScale.isCategory) {
      xValue = self._getSnap(xScale, xValue);
    }

    var tmp = [];

    dataArray.forEach(function (data) {
      data.forEach(function (obj) {
        var originValue = Util.isNil(obj[FIELD_ORIGIN]) ? obj[xfield] : obj[FIELD_ORIGIN][xfield];
        if (self._isEqual(originValue, xValue, xScale)) {
          tmp.push(obj);
        }
      });
    });

    // ???????????????????????????
    if (this.hasAdjust('stack') && coord.isPolar && coord.transposed && xScale.values.length === 1) {
      if (invertPointX >= 0 && invertPointX <= 1) {
        // ????????????
        var yValue = yScale.invert(invertPoint.y);
        yValue = self._getSnap(yScale, yValue, tmp);
        tmp.forEach(function (obj) {
          if (Util.isArray(yValue) ? obj[FIELD_ORIGIN_Y].toString() === yValue.toString() : obj[FIELD_ORIGIN_Y] === yValue) {
            rst.push(obj);
          }
        });
      }
    } else {
      rst = tmp;
    }

    return rst;
  };

  Geom.prototype._isEqual = function _isEqual(originValue, value, scale) {
    if (scale.type === 'timeCat') {
      return scale._toTimeStamp(originValue) === value;
    }
    return value === originValue;
  };

  /**
   * ??????????????????
   * @chainable
   * @param  {String} field ?????????
   * @return {Geom} geom ??????????????????
   */


  Geom.prototype.position = function position(field) {
    this._setAttrOptions('position', {
      field: field
    });
    return this;
  };

  /**
   * ??????????????????
   * @chainable
   * @param  {String} field ?????????
   * @param  {Array|Function} values ?????????????????????????????????
   * @return {Geom} geom ??????????????????
   */


  Geom.prototype.color = function color(field, values) {
    this._createAttrOption('color', field, values, Global.colors);
    return this;
  };

  /**
   * ??????????????????
   * @chainable
   * @param  {String} field ?????????
   * @param  {Array|Function} values ?????????????????????????????????
   * @return {Geom} geom ??????????????????
   */


  Geom.prototype.size = function size(field, values) {
    this._createAttrOption('size', field, values, Global.sizes);
    return this;
  };

  /**
   * ??????????????????
   * @chainable
   * @param  {String} field ?????????
   * @param  {Array|Function} values ?????????????????????????????????
   * @return {Geom} geom ??????????????????
   */


  Geom.prototype.shape = function shape(field, values) {
    var type = this.get('type');
    var shapes = Global.shapes[type] || [];
    this._createAttrOption('shape', field, values, shapes);
    return this;
  };

  Geom.prototype.style = function style(field, cfg) {
    var styleOptions = this.get('styleOptions');
    if (!styleOptions) {
      styleOptions = {};
      this.set('styleOptions', styleOptions);
    }
    if (Util.isObject(field)) {
      cfg = field;
      field = null;
    }
    var fields = void 0;
    if (field) {
      fields = parseFields(field);
    }
    styleOptions.fields = fields;
    styleOptions.style = cfg;
    return this;
  };

  Geom.prototype.adjust = function adjust(type) {
    if (Util.isString(type)) {
      type = { type: type };
    }
    this.set('adjust', type);
    return this;
  };

  Geom.prototype.animate = function animate(cfg) {
    this.set('animateCfg', cfg);
    return this;
  };

  Geom.prototype.reset = function reset() {
    this.set('attrOptions', {});
    this.set('adjust', null);
    this.clearInner();
  };

  Geom.prototype.clearInner = function clearInner() {
    var container = this.get('container');
    if (container) {
      container.clear();
      container.setMatrix([1, 0, 0, 1, 0, 0]);
    }
    container && container.clear();
    this.set('attrs', {});
    this.set('groupScales', null);
    this.set('xDistance', null);
  };

  Geom.prototype.clear = function clear() {
    this.clearInner();
    this.set('scales', {});
  };

  Geom.prototype.destroy = function destroy() {
    this.clear();
    // const container = this.get('container');
    // container && container.remove();
    _Base.prototype.destroy.call(this);
  };

  return Geom;
}(Base);

module.exports = Geom;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Global = __webpack_require__(1);

var Shape = {};

var ShapeBase = {
  _coord: null,
  /**
   * ????????????
   * @param {Object} cfg ?????????
   * @param {Object} container ??????
   */
  draw: function draw(cfg, container) {
    if (this.drawShape) {
      this.drawShape(cfg, container);
    }
  },

  /**
   * ???????????????
   * @param {Coord} coord ?????????
   */
  setCoord: function setCoord(coord) {
    this._coord = coord;
  },

  /**
   * 0???1 point ??? ?????? point
   * @param  {point} point ????????????
   * @return {point} point ????????????
   */
  parsePoint: function parsePoint(point) {
    var coord = this._coord;
    if (coord.isPolar) {
      if (point.x === 1) point.x = 0.9999999;
      if (point.y === 1) point.y = 0.9999999;
    }
    return coord.convertPoint(point);
  },

  /**
   * 0???1 points ??? ?????? points
   * @param  {points} points ??????????????????
   * @return {points} points ????????????
   */
  parsePoints: function parsePoints(points) {
    if (!points) return false;
    var self = this;
    var rst = [];
    points.forEach(function (point) {
      rst.push(self.parsePoint(point));
    });
    return rst;
  }
};

var ShapeFactoryBase = {
  defaultShapeType: null,
  setCoord: function setCoord(coord) {
    this._coord = coord;
  },
  getShape: function getShape(type) {
    var self = this;
    if (Util.isArray(type)) {
      type = type[0];
    }
    var shape = self[type] || self[self.defaultShapeType];
    shape._coord = self._coord;
    return shape;
  },
  getShapePoints: function getShapePoints(type, cfg) {
    var shape = this.getShape(type);
    var fn = shape.getPoints || shape.getShapePoints || this.getDefaultPoints;
    var points = fn(cfg);
    return points;
  },
  getDefaultPoints: function getDefaultPoints() /* cfg */{
    return [];
  },
  drawShape: function drawShape(type, cfg, container) {
    var shape = this.getShape(type);
    if (!cfg.color) {
      cfg.color = Global.colors[0];
    }
    return shape.draw(cfg, container);
  }
};

// ?????? Geometry ?????????????????????
Shape.registerFactory = function (factoryName, cfg) {
  var className = Util.upperFirst(factoryName);
  var geomObj = Util.mix({}, ShapeFactoryBase, cfg);
  Shape[className] = geomObj;
  geomObj.name = factoryName;
  return geomObj;
};

// ????????????
Shape.registerShape = function (factoryName, shapeType, cfg) {
  var className = Util.upperFirst(factoryName);
  var factory = Shape[className];
  var shapeObj = Util.mix({}, ShapeBase, cfg);
  factory[shapeType] = shapeObj;
  return shapeObj;
};

Shape.registShape = Shape.registerShape;

// ??????Geom ????????? shapeFactory
Shape.getShapeFactory = function (factoryName) {
  var self = this;
  factoryName = factoryName || 'point';
  var className = Util.upperFirst(factoryName);
  return self[className];
};

module.exports = Shape;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var G = {
  Canvas: __webpack_require__(48),
  Group: __webpack_require__(19),
  Shape: __webpack_require__(2),
  Matrix: __webpack_require__(14),
  Vector2: __webpack_require__(3)
};

__webpack_require__(49);
__webpack_require__(50);
__webpack_require__(51);
__webpack_require__(52);
__webpack_require__(53);
__webpack_require__(54);
__webpack_require__(55);
__webpack_require__(56);
__webpack_require__(57);

module.exports = G;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Vector2 = __webpack_require__(3);

var start = Vector2.create();
var end = Vector2.create();
var extremity = Vector2.create();

function getCubicBezierXYatT(startPt, controlPt1, controlPt2, endPt, T) {
  var x = CubicN(T, startPt.x, controlPt1.x, controlPt2.x, endPt.x);
  var y = CubicN(T, startPt.y, controlPt1.y, controlPt2.y, endPt.y);
  return {
    x: x,
    y: y
  };
}
// cubic helper formula at T distance
function CubicN(T, a, b, c, d) {
  var t2 = T * T;
  var t3 = t2 * T;
  return a + (-a * 3 + T * (3 * a - a * T)) * T + (3 * b + T * (-6 * b + b * 3 * T)) * T + (c * 3 - c * 3 * T) * t2 + d * t3;
}

function cubicBezierBounds(c) {
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  var s = {
    x: c[0],
    y: c[1]
  };
  var c1 = {
    x: c[2],
    y: c[3]
  };
  var c2 = {
    x: c[4],
    y: c[5]
  };
  var e = {
    x: c[6],
    y: c[7]
  };
  for (var t = 0; t < 100; t++) {
    var pt = getCubicBezierXYatT(s, c1, c2, e, t / 100);
    if (pt.x < minX) {
      minX = pt.x;
    }
    if (pt.x > maxX) {
      maxX = pt.x;
    }
    if (pt.y < minY) {
      minY = pt.y;
    }
    if (pt.y > maxY) {
      maxY = pt.y;
    }
  }
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
}

module.exports = {
  /**
   * ???????????????????????????????????????
   * @param  {Array} points ????????????
   * @param  {Number} lineWidth ??????
   * @return {Object}        ????????????????????????
   */
  getBBoxFromPoints: function getBBoxFromPoints(points) {
    if (points.length === 0) {
      return;
    }
    var p = points[0];
    var left = p.x;
    var right = p.x;
    var top = p.y;
    var bottom = p.y;
    var len = points.length;

    for (var i = 1; i < len; i++) {
      p = points[i];
      left = Math.min(left, p.x);
      right = Math.max(right, p.x);
      top = Math.min(top, p.y);
      bottom = Math.max(bottom, p.y);
    }

    return {
      minX: left,
      minY: top,
      maxX: right,
      maxY: bottom
    };
  },

  /**
   * ???????????????????????????
   * @param  {Number} x0 ??????????????? x
   * @param  {Number} y0 ??????????????? y
   * @param  {Number} x1 ??????????????? x
   * @param  {Number} y1 ??????????????? y
   * @param  {Number} lineWidth ??????
   * @return {Object}    ????????????????????????
   */
  getBBoxFromLine: function getBBoxFromLine(x0, y0, x1, y1) {
    return {
      minX: Math.min(x0, x1),
      minY: Math.min(y0, y1),
      maxX: Math.max(x0, x1),
      maxY: Math.max(y0, y1)
    };
  },
  getBBoxFromArc: function getBBoxFromArc(x, y, r, startAngle, endAngle, anticlockwise) {
    var diff = Math.abs(startAngle - endAngle);
    if (diff % Math.PI * 2 < 1e-4 && diff > 1e-4) {
      // Is a circle
      return {
        minX: x - r,
        minY: y - r,
        maxX: x + r,
        maxY: y + r
      };
    }

    start[0] = Math.cos(startAngle) * r + x;
    start[1] = Math.sin(startAngle) * r + y;

    end[0] = Math.cos(endAngle) * r + x;
    end[1] = Math.sin(endAngle) * r + y;
    var min = [0, 0];
    var max = [0, 0];

    Vector2.min(min, start, end);
    Vector2.max(max, start, end);

    // Thresh to [0, Math.PI * 2]
    startAngle = startAngle % (Math.PI * 2);
    if (startAngle < 0) {
      startAngle = startAngle + Math.PI * 2;
    }
    endAngle = endAngle % (Math.PI * 2);
    if (endAngle < 0) {
      endAngle = endAngle + Math.PI * 2;
    }

    if (startAngle > endAngle && !anticlockwise) {
      endAngle += Math.PI * 2;
    } else if (startAngle < endAngle && anticlockwise) {
      startAngle += Math.PI * 2;
    }
    if (anticlockwise) {
      var tmp = endAngle;
      endAngle = startAngle;
      startAngle = tmp;
    }

    for (var angle = 0; angle < endAngle; angle += Math.PI / 2) {
      if (angle > startAngle) {
        extremity[0] = Math.cos(angle) * r + x;
        extremity[1] = Math.sin(angle) * r + y;

        Vector2.min(min, extremity, min);
        Vector2.max(max, extremity, max);
      }
    }

    return {
      minX: min[0],
      minY: min[1],
      maxX: max[0],
      maxY: max[1]
    };
  },
  getBBoxFromBezierGroup: function getBBoxFromBezierGroup(points) {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var i = 0, len = points.length; i < len; i++) {
      var bbox = cubicBezierBounds(points[i]);
      if (bbox.minX < minX) {
        minX = bbox.minX;
      }
      if (bbox.maxX > maxX) {
        maxX = bbox.maxX;
      }
      if (bbox.minY < minY) {
        minY = bbox.minY;
      }
      if (bbox.maxY > maxY) {
        maxY = bbox.maxY;
      }
    }

    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  }
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileOverview the base class of scale
 * @author dxq613@gmail.com
 */
var Util = __webpack_require__(0);

/**
 * ?????????????????????
 * @class Scale
 */

var Scale = function () {
  Scale.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'base';
    /**
     * ???????????????,??????????????????tick?????????????????????
     * @type {Function}
     */
    this.formatter = null;
    /**
     * ???????????????
     * @type {Array}
     */
    this.range = [0, 1];
    /**
     * ???????????????
     * @type {Array}
     */
    this.ticks = null;
    /**
     * ????????????????????????????????????
     * @type {Array}
     */
    this.values = [];
  };

  function Scale(cfg) {
    _classCallCheck(this, Scale);

    this._initDefaultCfg();
    Util.mix(this, cfg);
    this.init();
  }

  /**
   * ???????????????
   * @protected
   */


  Scale.prototype.init = function init() {};

  /**
   * ??????????????????ticks,???????????????????????????
   *   - text: tick ?????????
   *   - value: ??????????????????????????????
   * <code>
   *   [
   *     {text: 0,value:0}
   *     {text: 1,value:0.2}
   *     {text: 2,value:0.4}
   *     {text: 3,value:0.6}
   *     {text: 4,value:0.8}
   *     {text: 5,value:1}
   *   ]
   * </code>
   * @param {Number} count ??????tick????????????????????????????????? 10
   * @return {Array} ?????? ticks ??????
   */


  Scale.prototype.getTicks = function getTicks() {
    var self = this;
    var ticks = self.ticks;
    var rst = [];
    Util.each(ticks, function (tick) {
      var obj = void 0;
      if (Util.isObject(tick)) {
        obj = tick;
      } else {
        obj = {
          text: self.getText(tick),
          tickValue: tick,
          value: self.scale(tick)
        };
      }
      rst.push(obj);
    });
    return rst;
  };

  /**
   * ???????????????????????????
   * @param  {*} value ???????????????
   * @return {String} ??????????????????
   */


  Scale.prototype.getText = function getText(value) {
    var formatter = this.formatter;
    value = formatter ? formatter(value) : value;
    if (Util.isNil(value) || !value.toString) {
      value = '';
    }
    return value.toString();
  };
  /**
   * ????????????????????????
   * @protected
   * @return {Number} ??????????????????
   */


  Scale.prototype.rangeMin = function rangeMin() {
    return this.range[0];
  };
  /**
   * ????????????????????????
   * @protected
   * @return {Number} ??????????????????
   */


  Scale.prototype.rangeMax = function rangeMax() {
    var range = this.range;
    return range[range.length - 1];
  };

  /**
   * ?????????????????????????????????????????????
   * @param  {Number} value ?????????????????????
   * @return {*} ??????????????????
   */


  Scale.prototype.invert = function invert(value) {
    return value;
  };
  /**
   * ??????????????????????????????????????????????????????????????????????????????????????????
   * @param  {*} value ????????????
   * @return {Number} ????????????
   */


  Scale.prototype.translate = function translate(value) {
    return value;
  };
  /**
   * ??????????????????
   * @param  {*} value ?????????
   * @return {Number} ???????????????????????????????????????????????????[0,1]
   */


  Scale.prototype.scale = function scale(value) {
    return value;
  };
  /**
   * ??????????????????scale,???????????????scale?????????????????????????????????
   * @return {Scale} ???????????????
   */


  Scale.prototype.clone = function clone() {
    var self = this;
    var constr = self.constructor;
    var cfg = {};
    Util.each(self, function (v, k) {
      cfg[k] = self[k];
    });
    return new constr(cfg);
  };
  /**
   * ???????????????????????????
   * @param  {Object} info ????????????
   * @chainable
   * @return {Scale} ?????????????????????
   */


  Scale.prototype.change = function change(info) {
    this.ticks = null;
    Util.mix(this, info);
    this.init();
    return this;
  };

  return Scale;
}();

module.exports = Scale;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);

var KEYWORDS_PERCENT = {
  min: 0,
  median: 0.5,
  max: 1
};

var GuideBase = function () {
  GuideBase.prototype._initDefaultCfg = function _initDefaultCfg() {};

  function GuideBase(cfg) {
    _classCallCheck(this, GuideBase);

    this._initDefaultCfg();
    Util.deepMix(this, cfg);
  }

  GuideBase.prototype._getNormalizedValue = function _getNormalizedValue(val, scale) {
    var rst = void 0;
    if (Util.isNil(KEYWORDS_PERCENT[val])) {
      rst = scale.scale(val);
    } else {
      rst = KEYWORDS_PERCENT[val];
    }
    return rst;
  };

  GuideBase.prototype.parsePercentPoint = function parsePercentPoint(coord, position) {
    var xPercent = parseFloat(position[0]) / 100;
    var yPercent = parseFloat(position[1]) / 100;
    var start = coord.start;
    var end = coord.end;
    var width = Math.abs(start.x - end.x);
    var height = Math.abs(start.y - end.y);
    var x = width * xPercent + Math.min(start.x, end.x);
    var y = height * yPercent + Math.min(start.y, end.y);
    return {
      x: x,
      y: y
    };
  };

  GuideBase.prototype.parsePoint = function parsePoint(coord, position) {
    var self = this;
    var xScale = self.xScale;
    var yScales = self.yScales;
    if (Util.isFunction(position)) {
      position = position(xScale, yScales); // position ???????????????
    }

    // ????????????????????? ['50%', '50%'] ?????????
    if (Util.isString(position[0]) && position[0].indexOf('%') !== -1) {
      return this.parsePercentPoint(coord, position);
    }

    var x = self._getNormalizedValue(position[0], xScale);
    var y = self._getNormalizedValue(position[1], yScales[0]);

    return coord.convertPoint({
      x: x,
      y: y
    });
  };

  /**
   * ??????????????????
   * @param  {Coord} coord  ?????????
   * @param  {Canvas.Group} group ??????????????????
   */


  GuideBase.prototype.render = function render() /* coord,group */{};

  GuideBase.prototype.remove = function remove() {
    var element = this.element;

    element && element.remove(true);
  };

  return GuideBase;
}();

module.exports = GuideBase;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);

function toScaleString(scale, value) {
  if (Util.isString(value)) {
    return value;
  }
  return scale.invert(scale.scale(value));
}

var AttributeBase = function () {
  function AttributeBase(cfg) {
    _classCallCheck(this, AttributeBase);

    /**
     * ???????????????
     * @type {String}
     */
    this.type = 'base';

    /**
     * ???????????????
     * @type {String}
     */
    this.name = null;

    /**
     * ????????????
     * @type {Function}
     */
    this.method = null;

    /**
     * ??????????????????
     * @type {Array}
     */
    this.values = [];

    /**
     * ?????????????????????
     * @type {Array}
     */
    this.scales = [];

    /**
     * ????????????????????????, ????????????????????????????????????????????????
     * @type {Boolean}
     */
    this.linear = null;

    Util.mix(this, cfg);
  }

  // ?????????????????????????????????????????????


  AttributeBase.prototype._getAttrValue = function _getAttrValue(scale, value) {
    var values = this.values;
    if (scale.isCategory && !this.linear) {
      var index = scale.translate(value);
      return values[index % values.length];
    }
    var percent = scale.scale(value);
    return this.getLinearValue(percent);
  };

  /**
   * ???????????????????????????????????????????????????
   * @protected
   * @param  {Number} percent ?????????
   * @return {*}  ??????????????????????????????
   */


  AttributeBase.prototype.getLinearValue = function getLinearValue(percent) {
    var values = this.values;
    var steps = values.length - 1;
    var step = Math.floor(steps * percent);
    var leftPercent = steps * percent - step;
    var start = values[step];
    var end = step === steps ? start : values[step + 1];
    var rstValue = start + (end - start) * leftPercent;
    return rstValue;
  };

  /**
   * ?????????????????????
   * @param {*} value ??????????????????
   * @type {Function}
   * @return {Array} ?????????????????????
   */


  AttributeBase.prototype.callback = function callback(value) {
    var self = this;
    var scale = self.scales[0];
    var rstValue = null;
    if (scale.type === 'identity') {
      rstValue = scale.value;
    } else {
      rstValue = self._getAttrValue(scale, value);
    }
    return rstValue;
  };

  /**
   * ???????????????????????????
   * @return {Array} dims of this Attribute
   */


  AttributeBase.prototype.getNames = function getNames() {
    var scales = this.scales;
    var names = this.names;
    var length = Math.min(scales.length, names.length);
    var rst = [];
    for (var i = 0; i < length; i++) {
      rst.push(names[i]);
    }
    return rst;
  };

  /**
   * ???????????????????????????
   * @return {Array} dims of this Attribute
   */


  AttributeBase.prototype.getFields = function getFields() {
    var scales = this.scales;
    var rst = [];
    Util.each(scales, function (scale) {
      rst.push(scale.field);
    });
    return rst;
  };

  /**
   * ????????????????????????
   * @param  {String} name the name of scale
   * @return {Scale} scale
   */


  AttributeBase.prototype.getScale = function getScale(name) {
    var scales = this.scales;
    var names = this.names;
    var index = names.indexOf(name);
    return scales[index];
  };

  /**
   * ????????????
   * @param {*} param1...paramn ????????????
   * @return {Array} ???????????????????????????
   */


  AttributeBase.prototype.mapping = function mapping() {
    var scales = this.scales;
    var callback = this.callback;

    for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
      params[_key] = arguments[_key];
    }

    var values = params;
    if (callback) {
      for (var i = 0, len = params.length; i < len; i++) {
        params[i] = this._toOriginParam(params[i], scales[i]);
      }
      values = callback.apply(this, params);
    }
    if (!Util.isArray(values)) {
      values = [values];
    }
    return values;
  };

  // ???????????????


  AttributeBase.prototype._toOriginParam = function _toOriginParam(param, scale) {
    var rst = param;
    if (!scale.isLinear) {
      if (Util.isArray(param)) {
        rst = [];
        for (var i = 0, len = param.length; i < len; i++) {
          rst.push(toScaleString(scale, param[i]));
        }
      } else {
        rst = toScaleString(scale, param);
      }
    }
    return rst;
  };

  return AttributeBase;
}();

module.exports = AttributeBase;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileOverview ?????????????????????
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);

var Base = function () {
  Base.prototype._initDefaultCfg = function _initDefaultCfg() {};

  function Base(cfg) {
    _classCallCheck(this, Base);

    this._initDefaultCfg();
    Util.mix(this, cfg);
  }

  Base.prototype.processAdjust = function processAdjust() /* dataArray */{};

  return Base;
}();

module.exports = Base;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview shape util
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);

var ShapeUtil = {
  splitPoints: function splitPoints(obj) {
    var points = [];
    var x = obj.x;
    var y = obj.y;
    y = Util.isArray(y) ? y : [y];
    y.forEach(function (yItem, index) {
      var point = {
        x: Util.isArray(x) ? x[index] : x,
        y: yItem
      };
      points.push(point);
    });
    return points;
  },
  splitArray: function splitArray(data, yField) {
    if (!data.length) return [];
    var arr = [];
    var tmp = [];
    var yValue = void 0;
    Util.each(data, function (obj) {
      yValue = obj._origin ? obj._origin[yField] : obj[yField];
      if (Util.isArray(yValue) && Util.isNil(yValue[0]) || Util.isNil(yValue)) {
        if (tmp.length) {
          arr.push(tmp);
          tmp = [];
        }
      } else {
        tmp.push(obj);
      }
    });

    if (tmp.length) {
      arr.push(tmp);
    }

    return arr;
  }
};

module.exports = ShapeUtil;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);

var Base = function () {
  Base.prototype._initDefaultCfg = function _initDefaultCfg() {};

  function Base(cfg) {
    _classCallCheck(this, Base);

    this._initDefaultCfg();
    Util.mix(this, cfg);

    var start = void 0;
    var end = void 0;
    if (this.plot) {
      start = this.plot.bl;
      end = this.plot.tr;
      this.start = start;
      this.end = end;
    } else {
      start = this.start;
      end = this.end;
    }
    this.init(start, end);
  }

  Base.prototype.init = function init() {};

  Base.prototype.convertPoint = function convertPoint(point) {
    return point;
  };

  Base.prototype.invertPoint = function invertPoint(point) {
    return point;
  };

  Base.prototype.reset = function reset(plot) {
    this.plot = plot;
    var bl = plot.bl,
        tr = plot.tr;

    this.start = bl;
    this.end = tr;
    this.init(bl, tr);
  };

  return Base;
}();

module.exports = Base;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

var Matrix = {
  /**
   * ??????????????????
   * @param  {Array} m1 ?????????
   * @param  {Array} m2 ?????????
   * @return {Array}    ????????????
   */
  multiply: function multiply(m1, m2) {
    var m11 = m1[0] * m2[0] + m1[2] * m2[1];
    var m12 = m1[1] * m2[0] + m1[3] * m2[1];

    var m21 = m1[0] * m2[2] + m1[2] * m2[3];
    var m22 = m1[1] * m2[2] + m1[3] * m2[3];

    var dx = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    var dy = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];

    return [m11, m12, m21, m22, dx, dy];
  },

  /**
   * ????????????
   * @param  {Array} m ??????
   * @return {Array}   ????????????
   */
  // invert(m) {
  //   const d = 1 / (m[0] * m[3] - m[1] * m[2]);
  //   const m0 = m[3] * d;
  //   const m1 = -m[1] * d;
  //   const m2 = -m[2] * d;
  //   const m3 = m[0] * d;
  //   const m4 = d * (m[2] * m[5] - m[3] * m[4]);
  //   const m5 = d * (m[1] * m[4] - m[0] * m[5]);
  //   return [ m0, m1, m2, m3, m4, m5 ];
  // },
  scale: function scale(out, m, v) {
    out[0] = m[0] * v[0];
    out[1] = m[1] * v[0];
    out[2] = m[2] * v[1];
    out[3] = m[3] * v[1];
    out[4] = m[4];
    out[5] = m[5];

    return out;
  },
  rotate: function rotate(out, m, radian) {
    var c = Math.cos(radian);
    var s = Math.sin(radian);
    var m11 = m[0] * c + m[2] * s;
    var m12 = m[1] * c + m[3] * s;
    var m21 = m[0] * -s + m[2] * c;
    var m22 = m[1] * -s + m[3] * c;
    out[0] = m11;
    out[1] = m12;
    out[2] = m21;
    out[3] = m22;
    out[4] = m[4];
    out[5] = m[5];

    return out;
  },
  translate: function translate(out, m, v) {
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[3];
    out[4] = m[4] + m[0] * v[0] + m[2] * v[1];
    out[5] = m[5] + m[1] * v[0] + m[3] * v[1];
    return out;
  },
  transform: function transform(m, actions) {
    var out = [].concat(m);
    for (var i = 0, len = actions.length; i < len; i++) {
      var action = actions[i];
      switch (action[0]) {
        case 't':
          Matrix.translate(out, out, [action[1], action[2]]);
          break;
        case 's':
          Matrix.scale(out, out, [action[1], action[2]]);
          break;
        case 'r':
          Matrix.rotate(out, out, action[1]);
          break;
        default:
          break;
      }
    }

    return out;
  }
};

module.exports = Matrix;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Global = __webpack_require__(1);
var Vector2 = __webpack_require__(3);

var Abastract = function () {
  Abastract.prototype._initDefaultCfg = function _initDefaultCfg() {
    /**
     * ?????????
     * @type {Array}
     */
    this.ticks = [];
    /**
     * tick ???????????????
     * @type {Object}
     */
    this.tickLine = {};
    /**
     * ?????????tick???????????????????????????????????????????????????
     * @type {Number}
     */
    this.offsetFactor = 1;
    /**
     * ????????????
     * @type {container}
     */
    this.frontContainer = null;
    /**
     * ????????????
     * @type {[type]}
     */
    this.backContainer = null;
    /**
     * ??????????????????
     * @type {Array}
     */
    this.gridPoints = [];
  };

  function Abastract(cfg) {
    _classCallCheck(this, Abastract);

    this._initDefaultCfg();
    Util.mix(this, cfg);
    this.draw();
  }

  Abastract.prototype.draw = function draw() {
    var line = this.line,
        tickLine = this.tickLine,
        label = this.label,
        grid = this.grid;


    grid && this.drawGrid(grid); // ????????????
    tickLine && this.drawTicks(tickLine); // ???????????????
    line && this.drawLine(line); // ????????????
    label && this.drawLabels(); // ?????????????????????
  };

  Abastract.prototype.drawTicks = function drawTicks(tickCfg) {
    var self = this;
    var ticks = self.ticks;
    var length = tickCfg.length; // Change: value ?????? length??? ??? G2 ??????
    var container = self.getContainer(tickCfg.top);
    Util.each(ticks, function (tick) {
      var start = self.getOffsetPoint(tick.value);
      var end = self.getSidePoint(start, length);
      var shape = container.addShape('line', {
        className: 'axis-tick',
        attrs: Util.mix({
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y
        }, tickCfg)
      });
      shape._id = self._id + '-ticks';
    });
  };

  Abastract.prototype.drawLabels = function drawLabels() {
    var self = this;
    var labelOffset = self.labelOffset;
    var labels = self.labels;
    Util.each(labels, function (labelShape) {
      var container = self.getContainer(labelShape.get('top'));
      var start = self.getOffsetPoint(labelShape.get('value'));

      var _self$getSidePoint = self.getSidePoint(start, labelOffset),
          x = _self$getSidePoint.x,
          y = _self$getSidePoint.y;

      labelShape.attr(Util.mix({
        x: x,
        y: y
      }, self.getTextAlignInfo(start, labelOffset), labelShape.get('textStyle')));
      labelShape._id = self._id + '-' + labelShape.attr('text');
      container.add(labelShape);
    });
  };

  Abastract.prototype.drawLine = function drawLine() {};

  Abastract.prototype.drawGrid = function drawGrid(grid) {
    var self = this;
    var gridPoints = self.gridPoints,
        ticks = self.ticks;

    var gridCfg = grid;
    var count = gridPoints.length;

    Util.each(gridPoints, function (subPoints, index) {
      if (Util.isFunction(grid)) {
        var tick = ticks[index] || {};
        gridCfg = Util.mix({}, Global._defaultAxis.grid, grid(tick.text, index, count));
      }

      if (gridCfg) {
        var type = gridCfg.type; // grid ?????????????????? 'line' ?????? 'arc'
        var points = subPoints.points;
        var container = self.getContainer(gridCfg.top);
        var shape = void 0;

        if (type === 'arc') {
          var center = self.center,
              startAngle = self.startAngle,
              endAngle = self.endAngle;

          var radius = Vector2.length([points[0].x - center.x, points[0].y - center.y]);
          shape = container.addShape('Arc', {
            className: 'axis-grid',
            attrs: Util.mix({
              x: center.x,
              y: center.y,
              startAngle: startAngle,
              endAngle: endAngle,
              r: radius
            }, gridCfg)
          });
        } else {
          shape = container.addShape('Polyline', {
            className: 'axis-grid',
            attrs: Util.mix({
              points: points
            }, gridCfg)
          });
        }

        shape._id = subPoints._id;
      }
    });
  };

  // ????????????????????????


  Abastract.prototype.getOffsetPoint = function getOffsetPoint() {};

  // ????????????????????????????????????????????????????????????


  Abastract.prototype.getAxisVector = function getAxisVector() {};

  // ???????????????????????????


  Abastract.prototype.getOffsetVector = function getOffsetVector(point, offset) {
    var self = this;
    var axisVector = self.getAxisVector(point);
    var normal = Vector2.normalize([], axisVector);
    var factor = self.offsetFactor;
    var verticalVector = [normal[1] * -1 * factor, normal[0] * factor];
    return Vector2.scale([], verticalVector, offset);
  };

  // ???????????????????????????


  Abastract.prototype.getSidePoint = function getSidePoint(point, offset) {
    var self = this;
    var offsetVector = self.getOffsetVector(point, offset);
    return {
      x: point.x + offsetVector[0],
      y: point.y + offsetVector[1]
    };
  };

  // ???????????????????????????????????????????????????


  Abastract.prototype.getTextAlignInfo = function getTextAlignInfo(point, offset) {
    var self = this;
    var offsetVector = self.getOffsetVector(point, offset);
    var align = void 0;
    var baseLine = void 0;
    if (offsetVector[0] > 0) {
      align = 'left';
    } else if (offsetVector[0] < 0) {
      align = 'right';
    } else {
      align = 'center';
    }
    if (offsetVector[1] > 0) {
      baseLine = 'top';
    } else if (offsetVector[1] < 0) {
      baseLine = 'bottom';
    } else {
      baseLine = 'middle';
    }
    return {
      textAlign: align,
      textBaseline: baseLine
    };
  };

  Abastract.prototype.getContainer = function getContainer(isTop) {
    var frontContainer = this.frontContainer,
        backContainer = this.backContainer;

    return isTop ? frontContainer : backContainer;
  };

  return Abastract;
}();

module.exports = Abastract;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var MatrixUtil = __webpack_require__(14);
var Vector2 = __webpack_require__(3);

// ???????????????
function isUnchanged(m) {
  return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
}

var ALIAS_ATTRS_MAP = {
  stroke: 'strokeStyle',
  fill: 'fillStyle',
  opacity: 'globalAlpha'
};

var SHAPE_ATTRS = ['fillStyle', 'font', 'globalAlpha', 'lineCap', 'lineWidth', 'lineJoin', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle', 'textAlign', 'textBaseline', 'lineDash'];

var CLIP_SHAPES = ['circle', 'sector', 'polygon', 'rect', 'polyline'];

var Element = function () {
  Element.prototype._initProperties = function _initProperties() {
    this._attrs = {
      zIndex: 0,
      visible: true,
      destroyed: false
    };
  };

  function Element(cfg) {
    _classCallCheck(this, Element);

    this._initProperties();
    Util.mix(this._attrs, cfg);

    var attrs = this._attrs.attrs;
    if (attrs) {
      // ?????????????????????
      this.initAttrs(attrs);
    }

    this.initTransform(); // ???????????????
  }

  Element.prototype.get = function get(name) {
    return this._attrs[name];
  };

  Element.prototype.set = function set(name, value) {
    this._attrs[name] = value;
  };

  Element.prototype.initAttrs = function initAttrs(attrs) {
    this.attr(Util.mix(this.getDefaultAttrs(), attrs));
  };

  Element.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {};
  };

  Element.prototype._setAttr = function _setAttr(name, value) {
    var attrs = this._attrs.attrs;
    if (name === 'clip') {
      value = this._setAttrClip(value);
    } else {
      var alias = ALIAS_ATTRS_MAP[name];
      if (alias) {
        attrs[alias] = value;
      }
    }
    attrs[name] = value;
  };

  Element.prototype._getAttr = function _getAttr(name) {
    return this._attrs.attrs[name];
  };

  // _afterAttrsSet() {}

  Element.prototype._setAttrClip = function _setAttrClip(clip) {
    if (clip && CLIP_SHAPES.indexOf(clip._attrs.type) > -1) {
      if (clip.get('canvas') === null) {
        clip = Object.assign({}, clip);
      }
      clip.set('parent', this.get('parent'));
      clip.set('context', this.get('context'));
      return clip;
    }
    return null;
  };

  Element.prototype.attr = function attr(name, value) {
    var self = this;
    if (self.get('destroyed')) return null;
    var argumentsLen = arguments.length;
    if (argumentsLen === 0) {
      return self._attrs.attrs;
    }

    if (Util.isObject(name)) {
      this._attrs.bbox = null; // attr ??????????????????????????? bbox ????????????????????????
      for (var k in name) {
        self._setAttr(k, name[k]);
      }
      if (self._afterAttrsSet) {
        self._afterAttrsSet();
      }
      return self;
    }
    if (argumentsLen === 2) {
      this._attrs.bbox = null;
      self._setAttr(name, value);
      if (self._afterAttrsSet) {
        self._afterAttrsSet();
      }
      return self;
    }
    return self._getAttr(name);
  };

  Element.prototype.getParent = function getParent() {
    return this.get('parent');
  };

  Element.prototype.draw = function draw(context) {
    if (this.get('destroyed')) {
      return;
    }
    if (this.get('visible')) {
      this.setContext(context);
      this.drawInner(context);
      this.restoreContext(context);
    }
  };

  Element.prototype.setContext = function setContext(context) {
    var clip = this._attrs.attrs.clip;
    context.save();
    if (clip) {
      clip.resetTransform(context);
      clip.createPath(context);
      context.clip();
    }
    this.resetContext(context);
    this.resetTransform(context);
  };

  Element.prototype.restoreContext = function restoreContext(context) {
    context.restore();
  };

  Element.prototype.resetContext = function resetContext(context) {
    var elAttrs = this._attrs.attrs;
    if (!this.get('isGroup')) {
      for (var k in elAttrs) {
        if (SHAPE_ATTRS.indexOf(k) > -1) {
          // ???canvas???????????????
          var v = elAttrs[k];
          if (k === 'lineDash' && context.setLineDash && v) {
            context.setLineDash(v);
          } else {
            context[k] = v;
          }
        }
      }
    }
  };

  Element.prototype.hasFill = function hasFill() {
    return this.get('canFill') && this._attrs.attrs.fillStyle;
  };

  Element.prototype.hasStroke = function hasStroke() {
    return this.get('canStroke') && this._attrs.attrs.strokeStyle;
  };

  Element.prototype.drawInner = function drawInner() /* context */{};

  Element.prototype.show = function show() {
    this.set('visible', true);
    return this;
  };

  Element.prototype.hide = function hide() {
    this.set('visible', false);
    return this;
  };

  Element.prototype._removeFromParent = function _removeFromParent() {
    var parent = this.get('parent');
    if (parent) {
      var children = parent.get('children');
      Util.Array.remove(children, this);
    }

    return this;
  };

  /**
   * ??????
   * @param  {Boolean} destroy true ?????????????????????????????????????????????false ?????????????????????
   */


  Element.prototype.remove = function remove(destroy) {
    if (destroy) {
      this.destroy();
    } else {
      this._removeFromParent();
    }
  };

  Element.prototype.destroy = function destroy() {
    // ?????????????????????????????????????????????????????????????????????
    var destroyed = this.get('destroyed');

    if (destroyed) {
      return null;
    }

    this._removeFromParent();

    this._attrs = {};
    this.set('destroyed', true);
  };

  Element.prototype.getBBox = function getBBox() {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };
  };

  Element.prototype.initTransform = function initTransform() {
    var attrs = this._attrs.attrs || {};
    if (!attrs.matrix) {
      attrs.matrix = [1, 0, 0, 1, 0, 0];
    }
    this._attrs.attrs = attrs;
  };

  Element.prototype.getMatrix = function getMatrix() {
    return this._attrs.attrs.matrix;
  };

  Element.prototype.setMatrix = function setMatrix(m) {
    this._attrs.attrs.matrix = [m[0], m[1], m[2], m[3], m[4], m[5]];
  };

  /**
   * ????????????????????????
   * @param  {Array} actions ????????????
   * @return {Element}         ????????????
   */


  Element.prototype.transform = function transform(actions) {
    var matrix = this._attrs.attrs.matrix;
    this._attrs.attrs.matrix = MatrixUtil.transform(matrix, actions);
    return this;
  };

  Element.prototype.setTransform = function setTransform(actions) {
    this._attrs.attrs.matrix = [1, 0, 0, 1, 0, 0];
    return this.transform(actions);
  };

  Element.prototype.translate = function translate(x, y) {
    var matrix = this._attrs.attrs.matrix;
    MatrixUtil.translate(matrix, matrix, [x, y]);
  };

  Element.prototype.rotate = function rotate(rad) {
    var matrix = this._attrs.attrs.matrix;
    MatrixUtil.rotate(matrix, matrix, rad);
  };

  Element.prototype.scale = function scale(sx, sy) {
    var matrix = this._attrs.attrs.matrix;
    MatrixUtil.scale(matrix, matrix, [sx, sy]);
  };

  /**
   * ??????????????????
   * @param  {Number} x ?????????x
   * @param  {Number} y ?????????y
   */


  Element.prototype.moveTo = function moveTo(x, y) {
    var cx = this._attrs.x || 0; // ?????????x
    var cy = this._attrs.y || 0; // ?????????y
    this.translate(x - cx, y - cy);
    this.set('x', x);
    this.set('y', y);
  };

  Element.prototype.apply = function apply(v) {
    var m = this._attrs.attrs.matrix;
    Vector2.transformMat2d(v, v, m);
    return this;
  };

  Element.prototype.resetTransform = function resetTransform(context) {
    var mo = this._attrs.attrs.matrix;
    // ????????????
    if (!isUnchanged(mo)) {
      context.transform(mo[0], mo[1], mo[2], mo[3], mo[4], mo[5]);
    }
  };

  return Element;
}();

module.exports = Element;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileOverview Base class of chart and geometry
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);

var Base = function () {
  Base.prototype.getDefaultCfg = function getDefaultCfg() {
    return {};
  };

  function Base(cfg) {
    _classCallCheck(this, Base);

    var attrs = {};
    var defaultCfg = this.getDefaultCfg();
    this._attrs = attrs;
    Util.mix(attrs, defaultCfg, cfg);
  }

  Base.prototype.get = function get(name) {
    return this._attrs[name];
  };

  Base.prototype.set = function set(name, value) {
    this._attrs[name] = value;
  };

  Base.prototype.destroy = function destroy() {
    this._attrs = {};
    this.destroyed = true;
  };

  return Base;
}();

module.exports = Base;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Shape = __webpack_require__(2);
var SHAPE_MAP = {}; // ??????????????????
var INDEX = '_INDEX';

function getComparer(compare) {
  return function (left, right) {
    var result = compare(left, right);
    return result === 0 ? left[INDEX] - right[INDEX] : result;
  };
}

module.exports = {
  getGroupClass: function getGroupClass() {},


  /**
   * ??????????????? Shape
   * @param {String} type ????????? shape ??????
   * @param {Object} cfg  shape ????????????
   * @return {Shape} ??????????????? shape ??????
   */
  addShape: function addShape(type) {
    var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var canvas = this.get('canvas');
    var shapeType = SHAPE_MAP[type];
    if (!shapeType) {
      shapeType = Util.upperFirst(type);
      SHAPE_MAP[type] = shapeType;
    }
    cfg.canvas = canvas;
    // cfg.type = type;

    // ????????????
    if (shapeType === 'Text' && canvas && canvas.get('fontFamily')) {
      cfg.attrs.fontFamily = cfg.attrs.fontFamily || canvas.get('fontFamily');
    }

    var shape = new Shape[shapeType](cfg);
    this.add(shape);
    return shape;
  },


  /**
   * ??????????????? Group ???
   * @param {Object|null} cfg ????????????
   * @return {Group} ??????????????? Group ??????
   */
  addGroup: function addGroup(cfg) {
    var canvas = this.get('canvas');
    var groupClass = this.getGroupClass();
    cfg = Util.mix({}, cfg);
    cfg.canvas = canvas;
    cfg.parent = this;
    var rst = new groupClass(cfg);
    this.add(rst);
    return rst;
  },


  /**
   * ?????????????????? item
   * @param  {Shape|Group} item shape ?????? group ??????
   * @return {Boolean}      true ???????????????false ???????????????
   */
  contain: function contain(item) {
    var children = this.get('children');
    return children.indexOf(item) > -1;
  },


  /**
   * ????????????????????? zIndex ???????????????????????????
   * @return {Canvas|Group} ????????????
   */
  sort: function sort() {
    var children = this.get('children');
    // ????????????????????????
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      child[INDEX] = i;
    }

    children.sort(getComparer(function (obj1, obj2) {
      return obj1.get('zIndex') - obj2.get('zIndex');
    }));

    return this;
  },


  /**
   * ?????????????????????
   * @return {Canvas|Group} ????????????
   */
  clear: function clear() {
    var children = this.get('children');

    while (children.length !== 0) {
      children[children.length - 1].remove(true);
    }
    return this;
  },


  /**
   * ????????????
   * @param {Array|Group|Shape} items group ???????????? shape ?????????????????????????????????
   * @return {Group} ????????????
   */
  add: function add(items) {
    var self = this;
    var children = self.get('children');
    if (!Util.isArray(items)) {
      items = [items];
    }

    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      var parent = item.get('parent');
      if (parent) {
        var descendants = parent.get('children');
        Util.Array.remove(descendants, item);
      }
      self._setEvn(item);
      children.push(item);
    }

    return self;
  },
  _setEvn: function _setEvn(item) {
    var self = this;
    item._attrs.parent = self;
    item._attrs.context = self._attrs.context;
    item._attrs.canvas = self._attrs.canvas;
    var clip = item._attrs.attrs.clip;
    if (clip) {
      clip.set('parent', self);
      clip.set('context', self.get('context'));
    }
    if (item._attrs.isGroup) {
      var children = item._attrs.children;
      for (var i = 0, len = children.length; i < len; i++) {
        item._setEvn(children[i]);
      }
    }
  }
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Element = __webpack_require__(16);
var Container = __webpack_require__(18);
var Vector2 = __webpack_require__(3);

var Group = function (_Element) {
  _inherits(Group, _Element);

  function Group() {
    _classCallCheck(this, Group);

    return _possibleConstructorReturn(this, _Element.apply(this, arguments));
  }

  Group.prototype._initProperties = function _initProperties() {
    this._attrs = {
      zIndex: 0,
      visible: true,
      destroyed: false,
      isGroup: true,
      children: []
    };
  };

  Group.prototype.drawInner = function drawInner(context) {
    // context = context || this.get('context');
    var children = this.get('children');
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      child.draw(context);
    }
    return this;
  };

  /**
   * ?????????????????????
   * @return {Object} ???????????????
   */


  Group.prototype.getBBox = function getBBox() {
    var self = this;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var children = self.get('children');
    for (var i = 0, length = children.length; i < length; i++) {
      var child = children[i];
      if (child.get('visible')) {
        var box = child.getBBox();
        if (!box) {
          continue;
        }

        var leftTop = [box.minX, box.minY];
        var leftBottom = [box.minX, box.maxY];
        var rightTop = [box.maxX, box.minY];
        var rightBottom = [box.maxX, box.maxY];
        var matrix = child.attr('matrix');

        Vector2.transformMat2d(leftTop, leftTop, matrix);
        Vector2.transformMat2d(leftBottom, leftBottom, matrix);
        Vector2.transformMat2d(rightTop, rightTop, matrix);
        Vector2.transformMat2d(rightBottom, rightBottom, matrix);

        minX = Math.min(leftTop[0], leftBottom[0], rightTop[0], rightBottom[0], minX);
        maxX = Math.max(leftTop[0], leftBottom[0], rightTop[0], rightBottom[0], maxX);
        minY = Math.min(leftTop[1], leftBottom[1], rightTop[1], rightBottom[1], minY);
        maxY = Math.max(leftTop[1], leftBottom[1], rightTop[1], rightBottom[1], maxY);
      }
    }

    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  Group.prototype.destroy = function destroy() {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    _Element.prototype.destroy.call(this);
  };

  return Group;
}(Element);

Util.mix(Group.prototype, Container, {
  getGroupClass: function getGroupClass() {
    return Group;
  }
});

module.exports = Group;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Shape = __webpack_require__(5);
var ShapeUtil = __webpack_require__(12);
var Global = __webpack_require__(1);

// register line geom
var Line = Shape.registerFactory('line', {
  defaultShapeType: 'line'
});

function getStyle(cfg) {
  var style = {
    strokeStyle: cfg.color
  };
  if (cfg.size >= 0) {
    style.lineWidth = cfg.size;
  }
  Util.mix(style, cfg.style);

  return Util.mix({}, Global.shape.line, style);
}

function drawLines(cfg, container, style, smooth) {
  var points = cfg.points;
  if (points.length && Util.isArray(points[0].y)) {
    var topPoints = [];
    var bottomPoints = [];
    for (var i = 0, len = points.length; i < len; i++) {
      var point = points[i];
      var tmp = ShapeUtil.splitPoints(point);
      bottomPoints.push(tmp[0]);
      topPoints.push(tmp[1]);
    }
    if (cfg.isInCircle) {
      topPoints.push(topPoints[0]);
      bottomPoints.push(bottomPoints[0]);
    }
    if (cfg.isStack) {
      return container.addShape('Polyline', {
        className: 'line',
        attrs: Util.mix({
          points: topPoints,
          smooth: smooth
        }, style)
      });
    }
    var topShape = container.addShape('Polyline', {
      className: 'line',
      attrs: Util.mix({
        points: topPoints,
        smooth: smooth
      }, style)
    });
    var bottomShape = container.addShape('Polyline', {
      className: 'line',
      attrs: Util.mix({
        points: bottomPoints,
        smooth: smooth
      }, style)
    });

    return [topShape, bottomShape];
  }
  if (cfg.isInCircle) {
    points.push(points[0]);
  }
  return container.addShape('Polyline', {
    className: 'line',
    attrs: Util.mix({
      points: points,
      smooth: smooth
    }, style)
  });
}

var SHAPES = ['line', 'smooth', 'dash'];
Util.each(SHAPES, function (shapeType) {
  Shape.registerShape('line', shapeType, {
    draw: function draw(cfg, container) {
      var smooth = shapeType === 'smooth';
      var style = getStyle(cfg);
      if (shapeType === 'dash') {
        style.lineDash = Global.lineDash;
      }

      return drawLines(cfg, container, style, smooth);
    }
  });
});

module.exports = Line;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview the scale function to process the categories
 * @author dxq613@gmail.com
 */
var Base = __webpack_require__(8);
var Util = __webpack_require__(0);
var catAuto = __webpack_require__(22);

/**
 * ?????????????????????
 * @class Scale.Category
 */

var Category = function (_Base) {
  _inherits(Category, _Base);

  function Category() {
    _classCallCheck(this, Category);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Category.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'cat';
    /**
     * ??????????????????????????????
     * @type {Number}
     * @default null
     */
    this.tickCount = null;
    /**
     * ??????????????????
     * @type {Boolean}
     */
    this.isCategory = true;
    /**
     * ???????????????
     * @type {Array}
     */
    this.range = [0, 1];
    /**
     * ???????????????
     * @type {Array}
     */
    this.ticks = null;
    /**
     * ????????????????????????????????????
     * @type {Array}
     */
    this.values = [];
  };

  /**
   * @override
   */


  Category.prototype.init = function init() {
    var self = this;
    var values = self.values;
    var tickCount = self.tickCount;

    Util.each(values, function (v, i) {
      values[i] = v.toString();
    });
    if (!self.ticks) {
      var ticks = values;
      if (tickCount) {
        var temp = catAuto({
          maxCount: tickCount,
          data: values
        });
        ticks = temp.ticks;
      }
      this.ticks = ticks;
    }
  };

  /**
   * @override
   */


  Category.prototype.getText = function getText(value) {
    if (this.values.indexOf(value) === -1 && Util.isNumber(value)) {
      value = this.values[Math.round(value)];
    }

    return _Base.prototype.getText.call(this, value);
  };

  /**
   * @override
   */


  Category.prototype.translate = function translate(value) {
    var index = this.values.indexOf(value);
    if (index === -1 && Util.isNumber(value)) {
      index = value;
    } else if (index === -1) {
      index = NaN;
    }
    return index;
  };
  /**
   * @override
   */


  Category.prototype.scale = function scale(value) {
    var rangeMin = this.rangeMin();
    var rangeMax = this.rangeMax();
    var percent = void 0;

    if (Util.isString(value) || this.values.indexOf(value) !== -1) {
      value = this.translate(value);
    }
    if (this.values.length > 1) {
      percent = value / (this.values.length - 1);
    } else {
      percent = value;
    }
    return rangeMin + percent * (rangeMax - rangeMin);
  };

  /**
   * @override
   */


  Category.prototype.invert = function invert(value) {
    if (Util.isString(value)) {
      // ????????????????????????
      return value;
    }
    var min = this.rangeMin();
    var max = this.rangeMax();

    // ????????? ?????????
    if (value < min) {
      value = min;
    }
    if (value > max) {
      value = max;
    }
    var percent = (value - min) / (max - min);
    var index = Math.round(percent * (this.values.length - 1)) % this.values.length;
    index = index || 0;
    return this.values[index];
  };

  return Category;
}(Base);

Base.Cat = Category;
module.exports = Category;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ???????????????????????????
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);
var MAX_COUNT = 8;

function getSimpleArray(data) {
  var arr = [];
  Util.each(data, function (sub) {
    if (Util.isArray(sub)) {
      arr = arr.concat(sub);
    } else {
      arr.push(sub);
    }
  });
  return arr;
}

module.exports = function (info) {
  var rst = {};
  var ticks = [];
  var tickCount = info.maxCount || MAX_COUNT;

  var categories = getSimpleArray(info.data);
  if (categories.length <= tickCount + tickCount / 2) {
    ticks = [].concat(categories);
  } else {
    var length = categories.length;
    var step = parseInt(length / (tickCount - 1), 10);

    var groups = categories.map(function (e, i) {
      return i % step === 0 ? categories.slice(i, i + step) : null;
    }).filter(function (e) {
      return e;
    });

    ticks.push(categories[0]);
    for (var i = 1, groupLen = groups.length; i < groupLen && i < tickCount - 1; i++) {
      ticks.push(groups[i][0]);
    }

    ticks.push(categories[length - 1]);
  }

  rst.categories = categories;
  rst.ticks = ticks;
  return rst;
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ??????????????????????????????
 * @author dxq613@gmail.com
 */
var Vector2 = __webpack_require__(3);

function getPoint(v) {
  return [v.x, v.y];
}

function smoothBezier(points, smooth, isLoop, constraint) {
  var cps = [];

  var prevPoint = void 0;
  var nextPoint = void 0;
  var hasConstraint = !!constraint;
  var min = void 0;
  var max = void 0;
  var point = void 0;
  var len = void 0;
  var l = void 0;
  var i = void 0;
  if (hasConstraint) {
    min = [Infinity, Infinity];
    max = [-Infinity, -Infinity];

    for (i = 0, l = points.length; i < l; i++) {
      point = getPoint(points[i]);
      Vector2.min(min, min, point);
      Vector2.max(max, max, point);
    }
    Vector2.min(min, min, constraint[0]);
    Vector2.max(max, max, constraint[1]);
  }

  for (i = 0, len = points.length; i < len; i++) {
    point = getPoint(points[i]);
    if (isLoop) {
      prevPoint = getPoint(points[i ? i - 1 : len - 1]);
      nextPoint = getPoint(points[(i + 1) % len]);
    } else {
      if (i === 0 || i === len - 1) {
        cps.push([point[0], point[1]]);
        continue;
      } else {
        prevPoint = getPoint(points[i - 1]);
        nextPoint = getPoint(points[i + 1]);
      }
    }

    var v = Vector2.sub([], nextPoint, prevPoint);
    Vector2.scale(v, v, smooth);
    var d0 = Vector2.distance(point, prevPoint);
    var d1 = Vector2.distance(point, nextPoint);

    var sum = d0 + d1;
    if (sum !== 0) {
      d0 /= sum;
      d1 /= sum;
    }

    var v1 = Vector2.scale([], v, -d0);
    var v2 = Vector2.scale([], v, d1);

    var cp0 = Vector2.add([], point, v1);
    var cp1 = Vector2.add([], point, v2);

    if (hasConstraint) {
      Vector2.max(cp0, cp0, min);
      Vector2.min(cp0, cp0, max);
      Vector2.max(cp1, cp1, min);
      Vector2.min(cp1, cp1, max);
    }

    cps.push([cp0[0], cp0[1]]);
    cps.push([cp1[0], cp1[1]]);
  }

  if (isLoop) {
    cps.push(cps.shift());
  }
  return cps;
}

function catmullRom2bezier(pointList, z, constraint) {
  var isLoop = !!z;

  var controlPointList = smoothBezier(pointList, 0.4, isLoop, constraint);
  var len = pointList.length;
  var d1 = [];

  var cp1 = void 0;
  var cp2 = void 0;
  var p = void 0;

  for (var i = 0; i < len - 1; i++) {
    cp1 = controlPointList[i * 2];
    cp2 = controlPointList[i * 2 + 1];
    p = pointList[i + 1];
    d1.push(['C', cp1[0], cp1[1], cp2[0], cp2[1], p.x, p.y]);
  }

  if (isLoop) {
    cp1 = controlPointList[len];
    cp2 = controlPointList[len + 1];
    p = pointList[0];

    d1.push(['C', cp1[0], cp1[1], cp2[0], cp2[1], p.x, p.y]);
  }
  return d1;
}

module.exports = {
  smooth: catmullRom2bezier
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = __webpack_require__(17);
var Plot = __webpack_require__(30);
var Util = __webpack_require__(0);
var Coord = __webpack_require__(31);
var Geom = __webpack_require__(4);
var ScaleController = __webpack_require__(39);
var AxisController = __webpack_require__(45);
var Global = __webpack_require__(1);

var _require = __webpack_require__(6),
    Canvas = _require.Canvas;

function isFullCircle(coord) {
  var startAngle = coord.startAngle;
  var endAngle = coord.endAngle;
  if (!Util.isNil(startAngle) && !Util.isNil(endAngle) && endAngle - startAngle < Math.PI * 2) {
    return false;
  }
  return true;
}

var Chart = function (_Base) {
  _inherits(Chart, _Base);

  Chart.initPlugins = function initPlugins() {
    return {
      _plugins: [],
      _cacheId: 0,
      register: function register(plugins) {
        var p = this._plugins;
        [].concat(plugins).forEach(function (plugin) {
          if (p.indexOf(plugin) === -1) {
            p.push(plugin);
          }
        });

        this._cacheId++;
      },
      unregister: function unregister(plugins) {
        var p = this._plugins;
        [].concat(plugins).forEach(function (plugin) {
          var idx = p.indexOf(plugin);
          if (idx !== -1) {
            p.splice(idx, 1);
          }
        });

        this._cacheId++;
      },
      clear: function clear() {
        this._plugins = [];
        this._cacheId++;
      },
      count: function count() {
        return this._plugins.length;
      },
      getAll: function getAll() {
        return this._plugins;
      },
      notify: function notify(chart, hook, args) {
        var descriptors = this.descriptors(chart);
        var ilen = descriptors.length;
        var i = void 0;
        var descriptor = void 0;
        var plugin = void 0;
        var params = void 0;
        var method = void 0;

        for (i = 0; i < ilen; ++i) {
          descriptor = descriptors[i];
          plugin = descriptor.plugin;
          method = plugin[hook];
          if (typeof method === 'function') {
            params = [chart].concat(args || []);
            if (method.apply(plugin, params) === false) {
              return false;
            }
          }
        }

        return true;
      },
      descriptors: function descriptors(chart) {
        var cache = chart._plugins || (chart._plugins = {});
        if (cache.id === this._cacheId) {
          return cache.descriptors;
        }

        var plugins = [];
        var descriptors = [];

        this._plugins.concat(chart && chart.get('plugins') || []).forEach(function (plugin) {
          var idx = plugins.indexOf(plugin);
          if (idx !== -1) {
            return;
          }

          plugins.push(plugin);
          descriptors.push({
            plugin: plugin
          });
        });

        cache.descriptors = descriptors;
        cache.id = this._cacheId;
        return descriptors;
      }
    };
  };

  Chart.prototype.getDefaultCfg = function getDefaultCfg() {
    return {
      /**
       * ?????????Id
       * @type {String}
       */
      id: null,
      /**
       * ??????????????????????????????
       * @type {Array|Number}
       */
      padding: Global.padding,

      /**
       * ??????
       * @type {Array}
       */
      data: null,
      /**
       * chart ???????????????
       * @type {Object}
       */
      scales: {},
      /**
       * ????????????????????????
       * @private
       * @type {Object}
       */
      coordCfg: {
        type: 'cartesian'
      },
      /**
       * @private
       * ?????????????????????
       * @type {Array}
       */
      geoms: null,
      /**
       * ?????????
       * @type {Object}
       */
      colDefs: null,
      pixelRatio: Global.pixelRatio,
      /**
       * ????????????
       * @type {Object}
       */
      filters: null,
      appendPadding: Global.appendPadding
    };
  };

  Chart.prototype._getFieldsForLegend = function _getFieldsForLegend() {
    var fields = [];
    var geoms = this.get('geoms');
    Util.each(geoms, function (geom) {
      var attrOptions = geom.get('attrOptions');
      var attrCfg = attrOptions.color;
      if (attrCfg && attrCfg.field && Util.isString(attrCfg.field)) {
        var arr = attrCfg.field.split('*');

        Util.each(arr, function (item) {
          if (fields.indexOf(item) === -1) {
            fields.push(item);
          }
        });
      }
    });
    return fields;
  };

  Chart.prototype._createScale = function _createScale(field, data, sortable) {
    var scaleController = this.get('scaleController');
    return scaleController.createScale(field, data, sortable);
  };

  Chart.prototype._adjustScale = function _adjustScale() {
    var self = this;
    var coord = self.get('coord');
    var xScale = self.getXScale();
    var yScales = self.getYScales();
    var scales = [];

    xScale && scales.push(xScale);
    scales = scales.concat(yScales);
    var inFullCircle = coord.isPolar && isFullCircle(coord);
    var scaleController = self.get('scaleController');
    var colDefs = scaleController.defs;
    Util.each(scales, function (scale) {
      if ((scale.isCategory || scale.isIdentity) && scale.values && !(colDefs[scale.field] && colDefs[scale.field].range)) {
        var count = scale.values.length;
        var range = void 0;
        if (count === 1) {
          range = [0.5, 1]; // ?????????????????????,?????????????????? [0.5,0.5]?????????
        } else {
          var widthRatio = 1;
          var offset = 0;
          if (inFullCircle) {
            if (!coord.transposed) {
              range = [0, 1 - 1 / count];
            } else {
              widthRatio = Global.widthRatio.multiplePie;
              offset = 1 / count * widthRatio;
              range = [offset / 2, 1 - offset / 2];
            }
          } else {
            offset = 1 / count * 1 / 2; // ?????????????????????????????????
            range = [offset, 1 - offset]; // ??????????????????????????????????????????????????????????????????
          }
        }
        scale.range = range;
      }
    });
  };

  Chart.prototype._removeGeoms = function _removeGeoms() {
    var geoms = this.get('geoms');
    while (geoms.length > 0) {
      var geom = geoms.shift();
      geom.destroy();
    }
  };

  Chart.prototype._clearGeoms = function _clearGeoms() {
    var geoms = this.get('geoms');
    for (var i = 0, length = geoms.length; i < length; i++) {
      var geom = geoms[i];
      geom.clear();
    }
  };

  Chart.prototype._clearInner = function _clearInner() {
    this.set('scales', {});
    this._clearGeoms();

    Chart.plugins.notify(this, 'clearInner'); // TODO
    this.get('axisController') && this.get('axisController').clear();
  };

  Chart.prototype._execFilter = function _execFilter(data) {
    var filters = this.get('filters');
    if (filters) {
      data = data.filter(function (obj) {
        var rst = true;
        Util.each(filters, function (fn, k) {
          if (fn) {
            rst = fn(obj[k], obj);
            if (!rst) {
              return false;
            }
          }
        });
        return rst;
      });
    }
    return data;
  };

  Chart.prototype._initGeoms = function _initGeoms(geoms) {
    var coord = this.get('coord');
    var data = this.get('filteredData');
    for (var i = 0, length = geoms.length; i < length; i++) {
      var geom = geoms[i];
      geom.set('data', data);
      geom.set('coord', coord);
      geom.init();
    }
  };

  Chart.prototype._initCoord = function _initCoord() {
    var plot = this.get('plotRange');
    var coordCfg = Util.mix({}, this.get('coordCfg'), {
      plot: plot
    });
    var type = coordCfg.type;
    var C = Coord[Util.upperFirst(type)] || Coord.Cartesian;
    var coord = new C(coordCfg);
    this.set('coord', coord);
  };

  Chart.prototype._initLayout = function _initLayout() {
    var padding = this.get('margin') || this.get('padding'); // ??????margin ?????????
    padding = Util.parsePadding(padding);
    var top = padding[0] === 'auto' ? 0 : padding[0];
    var right = padding[1] === 'auto' ? 0 : padding[1];
    var bottom = padding[2] === 'auto' ? 0 : padding[2];
    var left = padding[3] === 'auto' ? 0 : padding[3];

    var width = this.get('width');
    var height = this.get('height');
    var plot = new Plot({
      start: {
        x: left,
        y: top
      },
      end: {
        x: width - right,
        y: height - bottom
      }
    });
    this.set('plotRange', plot);
    this.set('plot', plot);
  };

  Chart.prototype._initCanvas = function _initCanvas() {
    var self = this;
    try {
      var canvas = new Canvas({
        el: self.get('el') || self.get('id'),
        context: self.get('context'),
        pixelRatio: self.get('pixelRatio'),
        width: self.get('width'),
        height: self.get('height'),
        fontFamily: Global.fontFamily
      });
      self.set('canvas', canvas);
      self.set('width', canvas.get('width'));
      self.set('height', canvas.get('height'));
    } catch (error) {
      // canvas ??????????????????
      throw error;
    }
    Chart.plugins.notify(self, 'afterCanvasInit');
    self._initLayout();
  };

  Chart.prototype._initLayers = function _initLayers() {
    var canvas = this.get('canvas');
    this.set('backPlot', canvas.addGroup()); // ?????? zIndex ??? 0
    this.set('middlePlot', canvas.addGroup({
      zIndex: 10
    }));
    this.set('frontPlot', canvas.addGroup({
      zIndex: 20
    }));
  };

  Chart.prototype.initColDefs = function initColDefs() {
    var colDefs = this.get('colDefs');
    if (colDefs) {
      var scaleController = this.get('scaleController');
      Util.mix(scaleController.defs, colDefs);
    }
  };

  Chart.prototype._init = function _init() {
    var self = this;
    self._initCanvas();
    self._initLayers();
    self.set('geoms', []);
    self.set('scaleController', new ScaleController());
    self.set('axisController', new AxisController({
      frontPlot: self.get('frontPlot').addGroup({
        className: 'axisContainer'
      }),
      backPlot: self.get('backPlot').addGroup({
        className: 'axisContainer'
      }),
      chart: self
    }));
    Chart.plugins.notify(self, 'init'); // TODO: beforeInit afterInit
  };

  function Chart(cfg) {
    _classCallCheck(this, Chart);

    // ???????????? geometry ???????????????
    var _this = _possibleConstructorReturn(this, _Base.call(this, cfg));

    var self = _this;
    Util.each(Geom, function (geomConstructor, className) {
      var methodName = Util.lowerFirst(className);
      self[methodName] = function (cfg) {
        var geom = new geomConstructor(cfg);
        self.addGeom(geom);
        return geom;
      };
    });
    self._init();
    return _this;
  }

  /**
   * ????????????????????????????????????
   * @chainable
   * @param  {Array} data ????????????
   * @param  {Object} colDefs ??????????????????
   * @return {Chart} ???????????? chart ?????????
   */


  Chart.prototype.source = function source(data, colDefs) {
    this.set('data', data);
    if (colDefs) {
      this.scale(colDefs);
    }
    return this;
  };

  Chart.prototype.scale = function scale(field, cfg) {
    var colDefs = this.get('colDefs') || {};
    if (Util.isObject(field)) {
      Util.mix(colDefs, field);
    } else {
      colDefs[field] = cfg;
    }

    this.set('colDefs', colDefs);
    this.initColDefs();
    return this;
  };

  /**
   * ????????????????????????
   * @chainable
   * @param  {String|Boolean} field ????????????????????????
   * @param  {Object} cfg ????????????????????????
   * @return {Chart} ???????????? chart ?????????
   */


  Chart.prototype.axis = function axis(field, cfg) {
    var axisController = this.get('axisController');
    if (!field) {
      axisController.axisCfg = null;
    } else {
      axisController.axisCfg = axisController.axisCfg || {};
      axisController.axisCfg[field] = cfg;
    }
    return this;
  };

  /**
   * ????????????????????????
   * @chainable
   * @param  {String} type ???????????????
   * @param  {Object} cfg ?????????
   * @return {Chart} ???????????? chart ?????????
   */


  Chart.prototype.coord = function coord(type, cfg) {
    if (!type) {
      return;
    }
    var coordCfg = void 0;
    if (Util.isObject(type)) {
      coordCfg = type;
    } else {
      coordCfg = cfg || {};
      coordCfg.type = type;
    }
    this.set('coordCfg', coordCfg);

    return this;
  };

  Chart.prototype.filter = function filter(field, condition) {
    var filters = this.get('filters') || {};
    filters[field] = condition;
    this.set('filters', filters);
  };

  /**
   * ????????????
   * @chainable
   * @return {Chart} ???????????? chart ?????????
   */


  Chart.prototype.render = function render() {
    var self = this;
    var canvas = self.get('canvas');
    var geoms = self.get('geoms');
    // ????????????
    var data = this.get('data') || [];
    var filteredData = this._execFilter(data);
    this.set('filteredData', filteredData);
    // ??????????????????
    self._initCoord();
    // ????????? geoms
    self._initGeoms(geoms);
    // ????????????
    self._adjustScale();

    // ???????????????
    Chart.plugins.notify(self, 'beforeGeomDraw');
    self._renderAxis();

    // ?????? geom
    for (var i = 0, length = geoms.length; i < length; i++) {
      var geom = geoms[i];
      geom.paint();
    }

    Chart.plugins.notify(self, 'afterGeomDraw');
    canvas.sort();
    this.get('frontPlot').sort();
    Chart.plugins.notify(self, 'beforeCanvasDraw');
    canvas.draw();
    return self;
  };

  /**
   * ???????????????????????????
   * @chainable
   * @return {Chart} ???????????? chart ?????????
   */


  Chart.prototype.clear = function clear() {
    Chart.plugins.notify(this, 'clear'); // TODO: beforeClear afterClear
    this._removeGeoms();
    this._clearInner();
    this.set('filters', null);
    this.set('isUpdate', false);
    var canvas = this.get('canvas');
    canvas.draw();
    return this;
  };

  Chart.prototype.repaint = function repaint() {
    this.set('isUpdate', true);
    Chart.plugins.notify(this, 'repaint');
    this._clearInner();
    this.render();
  };

  Chart.prototype.changeData = function changeData(data) {
    this.set('data', data);
    this.repaint();
  };

  Chart.prototype.changeSize = function changeSize(width, height) {
    if (width) {
      this.set('width', width);
    } else {
      width = this.get('width');
    }

    if (height) {
      this.set('height', height);
    } else {
      height = this.get('height');
    }

    var canvas = this.get('canvas');
    canvas.changeSize(width, height);
    this._initLayout();
    this.repaint();
    return this;
  };

  Chart.prototype.destroy = function destroy() {
    this.clear();
    var canvas = this.get('canvas');
    canvas.destroy();
    Chart.plugins.notify(this, 'afterCanvasDestroyed');
    _Base.prototype.destroy.call(this);
  };

  /**
   * ??????????????????????????????????????????
   * @param  {Object} record ????????????
   * @return {Object} ????????????????????????????????????
   */


  Chart.prototype.getPosition = function getPosition(record) {
    var self = this;
    var coord = self.get('coord');
    var xScale = self.getXScale();
    var yScale = self.getYScales()[0]; // ?????????????????????y???????????????????????????
    var xField = xScale.field;
    var x = xScale.scale(record[xField]);
    var yField = yScale.field;
    var y = yScale.scale(record[yField]);
    return coord.convertPoint({
      x: x,
      y: y
    });
  };

  /**
   * ???????????????????????????????????????
   * @param  {Object} point ???????????????x,y??????
   * @return {Object} ???????????????????????????
   */


  Chart.prototype.getRecord = function getRecord(point) {
    var self = this;
    var coord = self.get('coord');
    var xScale = self.getXScale();
    var yScale = self.getYScales()[0];
    var invertPoint = coord.invertPoint(point);
    var record = {};
    record[xScale.field] = xScale.invert(invertPoint.x);
    record[yScale.field] = yScale.invert(invertPoint.y);
    return record;
  };
  /**
   * ???????????????????????????????????????
   * @param  {Object} point ???????????????x,y??????
   * @return {Array} ?????????????????????????????????
  **/


  Chart.prototype.getSnapRecords = function getSnapRecords(point) {
    var geom = this.get('geoms')[0];
    var data = [];
    if (geom) {
      // need to judge
      data = geom.getSnapRecords(point);
    }
    return data;
  };

  /**
   * ????????????
   * @param  {String} field ?????????????????????
   * @param  {Boolean} sortable ??????????????????
   * @return {Scale} ??????
   */


  Chart.prototype.createScale = function createScale(field, sortable) {
    var data = this.get('data');
    var filteredData = this.get('filteredData');
    // ??????????????????????????????????????????????????????
    // ????????????????????????????????????????????????????????????
    if (filteredData.length) {
      var legendFields = this._getFieldsForLegend();
      if (legendFields.indexOf(field) === -1) {
        data = filteredData;
      }
    }

    var scales = this.get('scales');
    if (!scales[field]) {
      scales[field] = this._createScale(field, data, sortable);
    }
    return scales[field];
  };

  /**
   * @protected
   * ??????????????????
   * @param {Geom} geom ????????????
   */


  Chart.prototype.addGeom = function addGeom(geom) {
    var geoms = this.get('geoms');
    var middlePlot = this.get('middlePlot');
    geoms.push(geom);
    geom.set('chart', this);
    geom.set('container', middlePlot.addGroup());
  };

  /**
   * ?????? x ???????????????
   * @return {Scale} x ???????????????
   */


  Chart.prototype.getXScale = function getXScale() {
    var self = this;
    var geoms = self.get('geoms');
    var xScale = geoms[0].getXScale();
    return xScale;
  };

  /**
   * ?????? y ???????????????
   * @return {Array} ???????????? y ?????????
   */


  Chart.prototype.getYScales = function getYScales() {
    var geoms = this.get('geoms');
    var rst = [];

    Util.each(geoms, function (geom) {
      var yScale = geom.getYScale();
      if (Util.indexOf(rst, yScale) === -1) {
        rst.push(yScale);
      }
    });
    return rst;
  };

  // ????????????


  Chart.prototype.registerPlugins = function registerPlugins(plugins) {
    var self = this;
    var chartPlugins = self.get('plugins') || [];
    if (!Util.isArray(chartPlugins)) {
      chartPlugins = [chartPlugins];
    }

    [].concat(plugins).forEach(function (plugin) {
      if (chartPlugins.indexOf(plugin) === -1) {
        plugin.init && plugin.init(self); // ???????????????
        chartPlugins.push(plugin);
      }
    });
    Chart.plugins._cacheId++;
    self.set('plugins', chartPlugins);
  };

  Chart.prototype._renderAxis = function _renderAxis() {
    var axisController = this.get('axisController');
    var xScale = this.getXScale();
    var yScales = this.getYScales();
    var coord = this.get('coord');
    Chart.plugins.notify(this, 'beforeRenderAxis');
    axisController.createAxis(coord, xScale, yScales);
  };

  Chart.prototype._isAutoPadding = function _isAutoPadding() {
    var padding = this.get('padding');
    if (Util.isArray(padding)) {
      return padding.indexOf('auto') !== -1;
    }
    return padding === 'auto';
  };

  Chart.prototype._updateLayout = function _updateLayout(padding) {
    var width = this.get('width');
    var height = this.get('height');
    var start = {
      x: padding[3],
      y: padding[0]
    };
    var end = {
      x: width - padding[1],
      y: height - padding[2]
    };

    var plot = this.get('plot');
    var coord = this.get('coord');
    plot.reset(start, end);
    coord.reset(plot);
  };

  return Chart;
}(Base);

Chart.plugins = Chart.initPlugins();

module.exports = Chart;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Geom = __webpack_require__(4);
var ShapeUtil = __webpack_require__(12);
var Util = __webpack_require__(0);
__webpack_require__(20);

var Path = function (_Geom) {
  _inherits(Path, _Geom);

  function Path() {
    _classCallCheck(this, Path);

    return _possibleConstructorReturn(this, _Geom.apply(this, arguments));
  }

  /**
   * ???????????????????????????
   * @protected
   * @return {Object} ????????????
   */
  Path.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'path';
    cfg.shapeType = 'line';
    return cfg;
  };

  Path.prototype.getDrawCfg = function getDrawCfg(obj) {
    var cfg = _Geom.prototype.getDrawCfg.call(this, obj);
    cfg.isStack = this.hasAdjust('stack');
    return cfg;
  };

  Path.prototype.draw = function draw(data, shapeFactory) {
    var self = this;
    var container = self.get('container');
    var yScale = self.getYScale();
    var splitArray = ShapeUtil.splitArray(data, yScale.field);

    var cfg = this.getDrawCfg(data[0]);
    cfg.origin = data; // path,line ?????????origin ???????????????

    Util.each(splitArray, function (subData, splitedIndex) {
      cfg.splitedIndex = splitedIndex; // ???????????????????????? ????????????id
      cfg.points = subData;
      self.drawShape(cfg.shape, data[0], cfg, container, shapeFactory);
    });
  };

  return Path;
}(Geom);

Geom.Path = Path;
module.exports = Path;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ??????????????????x???????????????????????????
 * @author sima.zhang1990@gmail.com
 * @author dxq613@gmail.com
 */

var Global = __webpack_require__(1);
var Util = __webpack_require__(0);

var SizeMixin = {
  getDefalutSize: function getDefalutSize() {
    var defaultSize = this.get('defaultSize');
    if (!defaultSize) {
      var coord = this.get('coord');
      var xScale = this.getXScale();
      var dataArray = this.get('dataArray');
      var count = xScale.values.length;
      var range = xScale.range;
      var normalizeSize = 1 / count;
      var widthRatio = 1;

      if (coord && coord.isPolar) {
        if (coord.transposed && count > 1) {
          // ????????????????????????
          widthRatio = Global.widthRatio.multiplePie;
        } else {
          widthRatio = Global.widthRatio.rose;
        }
      } else {
        if (xScale.isLinear) {
          normalizeSize *= range[1] - range[0];
        }
        widthRatio = Global.widthRatio.column; // ??????????????????2
      }
      normalizeSize *= widthRatio;
      if (this.hasAdjust('dodge')) {
        normalizeSize = normalizeSize / dataArray.length;
      }
      defaultSize = normalizeSize;
      this.set('defaultSize', defaultSize);
    }
    return defaultSize;
  },
  getDimWidth: function getDimWidth(dimName) {
    var coord = this.get('coord');
    var start = coord.convertPoint({
      x: 0,
      y: 0
    });
    var end = coord.convertPoint({
      x: dimName === 'x' ? 1 : 0,
      y: dimName === 'x' ? 0 : 1
    });
    var width = 0;
    if (start && end) {
      width = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }
    return width;
  },
  _getWidth: function _getWidth() {
    var width = this.get('_width');
    if (!width) {
      var coord = this.get('coord');
      if (coord && coord.isPolar && !coord.transposed) {
        // ???????????? width ?????????
        width = (coord.endAngle - coord.startAngle) * coord.circleRadius;
      } else {
        width = this.getDimWidth('x'); // ???????????????transpose
      }
      this.set('_width', width);
    }

    return width;
  },
  _toNormalizedSize: function _toNormalizedSize(size) {
    var width = this._getWidth();
    return size / width;
  },
  _toCoordSize: function _toCoordSize(normalizeSize) {
    var width = this._getWidth();
    return width * normalizeSize;
  },
  getNormalizedSize: function getNormalizedSize(obj) {
    var size = this.getAttrValue('size', obj);
    if (Util.isNil(size)) {
      size = this.getDefalutSize();
    } else {
      size = this._toNormalizedSize(size);
    }
    return size;
  },
  getSize: function getSize(obj) {
    var size = this.getAttrValue('size', obj);
    if (Util.isNil(size)) {
      var normalizeSize = this.getDefalutSize();
      size = this._toCoordSize(normalizeSize);
    }
    return size;
  }
};

module.exports = SizeMixin;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Core = {};

Core.version = '3.1.8';
Core.Global = __webpack_require__(1);
Core.Chart = __webpack_require__(24);
Core.Shape = __webpack_require__(5);
Core.G = __webpack_require__(6);
Core.Util = __webpack_require__(0);

module.exports = Core;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ????????????
 * @author dxq613@gail.com
 */
var Util = __webpack_require__(0);
var color1 = '#E8E8E8'; // ??????????????????????????????????????????
var color2 = '#808080'; // ????????????

var defaultAxis = {
  label: {
    fill: color2,
    fontSize: 10
  },
  line: {
    stroke: color1,
    lineWidth: 1
  },
  grid: {
    type: 'line', // ?????????????????????
    stroke: color1,
    lineWidth: 1,
    lineDash: [2]
  },
  tickLine: null,
  labelOffset: 7.5
};

var Theme = {
  fontFamily: '"Helvetica Neue", "San Francisco", Helvetica, Tahoma, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", sans-serif',
  defaultColor: '#1890FF',
  pixelRatio: 1,
  padding: 'auto',
  appendPadding: 15,
  colors: ['#1890FF', '#2FC25B', '#FACC14', '#223273', '#8543E0', '#13C2C2', '#3436C7', '#F04864'],
  shapes: {
    line: ['line', 'dash'],
    point: ['circle', 'hollowCircle']
  },
  sizes: [4, 10],
  axis: {
    bottom: Util.mix({}, defaultAxis, {
      grid: null
    }),
    left: Util.mix({}, defaultAxis, {
      line: null
    }),
    right: Util.mix({}, defaultAxis, {
      line: null
    }),
    circle: Util.mix({}, defaultAxis, {
      line: null
    }),
    radius: Util.mix({}, defaultAxis, {
      labelOffset: 4
    })
  },
  shape: {
    line: {
      lineWidth: 2, // ??????????????????
      lineJoin: 'round',
      lineCap: 'round'
    },
    point: {
      lineWidth: 0,
      size: 3 // ??????????????????
    },
    area: {
      fillOpacity: 0.1
    }
  },
  _defaultAxis: defaultAxis
};

module.exports = Theme;

/***/ }),
/* 29 */
/***/ (function(module, exports) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var DomUtil = void 0;
/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
var supportsEventListenerOptions = function () {
  var supports = false;
  try {
    var options = Object.defineProperty({}, 'passive', {
      get: function get() {
        supports = true;
      }
    });
    window.addEventListener('e', null, options);
  } catch (e) {
    // continue regardless of error
  }
  return supports;
}();

// Default passive to true as expected by Chrome for 'touchstart' and 'touchend' events.
// https://github.com/chartjs/Chart.js/issues/4287
var eventListenerOptions = supportsEventListenerOptions ? { passive: true } : false;

function createEvent(type, chart, x, y, nativeEvent) {
  return {
    type: type,
    chart: chart,
    native: nativeEvent || null,
    x: x !== undefined ? x : null,
    y: y !== undefined ? y : null
  };
}

function fromNativeEvent(event, chart) {
  // TODO: chart ?????? dom
  var type = event.type;

  var point = {};
  var touches = event.targetTouches;
  if (touches && touches.length > 0) {
    point.x = touches[0].clientX;
    point.y = touches[0].clientY;
  } else {
    point.x = event.clientX;
    point.y = event.clientY;
  }
  var canvas = chart.get('canvas');
  var pos = DomUtil.getRelativePosition(point, canvas);
  return createEvent(type, chart, pos.x, pos.y, event);
}

DomUtil = {
  /* global wx, my, module */
  isWx: (typeof wx === 'undefined' ? 'undefined' : _typeof(wx)) === 'object' && typeof wx.getSystemInfoSync === 'function', // weixin miniprogram
  isMy: (typeof my === 'undefined' ? 'undefined' : _typeof(my)) === 'object' && typeof my.getSystemInfoSync === 'function', // ant miniprogram
  isNode: typeof module !== 'undefined' && typeof module.exports !== 'undefined', // in node
  isBrowser: typeof window !== 'undefined' && typeof window.document !== 'undefined', // in browser
  getPixelRatio: function getPixelRatio() {
    return window && window.devicePixelRatio || 1;
  },
  getStyle: function getStyle(el, property) {
    return el.currentStyle ? el.currentStyle[property] : document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
  },
  getWidth: function getWidth(el) {
    var width = this.getStyle(el, 'width');
    if (width === 'auto') {
      width = el.offsetWidth;
    }
    return parseFloat(width);
  },
  getHeight: function getHeight(el) {
    var height = this.getStyle(el, 'height');
    if (height === 'auto') {
      height = el.offsetHeight;
    }
    return parseFloat(height);
  },
  getDomById: function getDomById(id) {
    if (!id) {
      return null;
    }
    return document.getElementById(id);
  },
  getRelativePosition: function getRelativePosition(point, canvas) {
    var canvasDom = canvas.get('el');

    var _canvasDom$getBoundin = canvasDom.getBoundingClientRect(),
        top = _canvasDom$getBoundin.top,
        right = _canvasDom$getBoundin.right,
        bottom = _canvasDom$getBoundin.bottom,
        left = _canvasDom$getBoundin.left;

    // Scale mouse coordinates into canvas coordinates
    // by following the pattern laid out by 'jerryj' in the comments of
    // http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/


    var paddingLeft = parseFloat(this.getStyle(canvasDom, 'padding-left'));
    var paddingTop = parseFloat(this.getStyle(canvasDom, 'padding-top'));
    var paddingRight = parseFloat(this.getStyle(canvasDom, 'padding-right'));
    var paddingBottom = parseFloat(this.getStyle(canvasDom, 'padding-bottom'));
    var width = right - left - paddingLeft - paddingRight;
    var height = bottom - top - paddingTop - paddingBottom;
    var pixelRatio = canvas.get('pixelRatio');

    // We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
    // the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
    var mouseX = Math.round((point.x - left - paddingLeft) / width * canvasDom.width / pixelRatio);
    var mouseY = Math.round((point.y - top - paddingTop) / height * canvasDom.height / pixelRatio);

    return {
      x: mouseX,
      y: mouseY
    };
  },
  addEventListener: function addEventListener(source, type, listener) {
    DomUtil.isBrowser && source.addEventListener(type, listener, eventListenerOptions);
  },
  removeEventListener: function removeEventListener(source, type, listener) {
    DomUtil.isBrowser && source.removeEventListener(type, listener, eventListenerOptions);
  },
  createEvent: function createEvent(event, chart) {
    return fromNativeEvent(event, chart);
  },
  measureText: function measureText(text, font, ctx) {
    if (!ctx) {
      ctx = document.createElement('canvas').getContext('2d');
    }

    ctx.font = font || '12px sans-serif';
    return ctx.measureText(text);
  }
};

module.exports = DomUtil;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);

var Plot = function () {
  function Plot(cfg) {
    _classCallCheck(this, Plot);

    Util.mix(this, cfg);
    this._init();
  }

  Plot.prototype._init = function _init() {
    var self = this;
    var start = self.start;
    var end = self.end;
    var xMin = Math.min(start.x, end.x);
    var xMax = Math.max(start.x, end.x);
    var yMin = Math.min(start.y, end.y);
    var yMax = Math.max(start.y, end.y);

    this.tl = {
      x: xMin,
      y: yMin
    };
    this.tr = {
      x: xMax,
      y: yMin
    };
    this.bl = {
      x: xMin,
      y: yMax
    };
    this.br = {
      x: xMax,
      y: yMax
    };
    this.width = xMax - xMin;
    this.height = yMax - yMin;
  };

  /**
   * ??????
   * @param  {Object} start ?????????
   * @param  {Object} end  ?????????
   */


  Plot.prototype.reset = function reset(start, end) {
    this.start = start;
    this.end = end;
    this._init();
  };

  /**
   * ????????????????????????????????????
   * @param  {Nubmer}  x x?????????
   * @param  {[type]}  y y?????????
   * @return {Boolean} ????????????????????????
   */


  Plot.prototype.isInRange = function isInRange(x, y) {
    if (Util.isObject(x)) {
      y = x.y;
      x = x.x;
    }
    var tl = this.tl;
    var br = this.br;
    return tl.x <= x && x <= br.x && tl.y <= y && y <= br.y;
  };

  return Plot;
}();

module.exports = Plot;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Coord = __webpack_require__(13);

__webpack_require__(32);

module.exports = Coord;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = __webpack_require__(13);

var Cartesian = function (_Base) {
  _inherits(Cartesian, _Base);

  function Cartesian() {
    _classCallCheck(this, Cartesian);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Cartesian.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'cartesian';
    this.transposed = false;
    this.isRect = true;
  };

  Cartesian.prototype.init = function init(start, end) {
    this.x = {
      start: start.x,
      end: end.x
    };

    this.y = {
      start: start.y,
      end: end.y
    };
  };

  Cartesian.prototype.convertPoint = function convertPoint(point) {
    var self = this;
    var transposed = self.transposed;
    var xDim = transposed ? 'y' : 'x';
    var yDim = transposed ? 'x' : 'y';
    var x = self.x;
    var y = self.y;
    return {
      x: x.start + (x.end - x.start) * point[xDim],
      y: y.start + (y.end - y.start) * point[yDim]
    };
  };

  Cartesian.prototype.invertPoint = function invertPoint(point) {
    var self = this;
    var transposed = self.transposed;
    var xDim = transposed ? 'y' : 'x';
    var yDim = transposed ? 'x' : 'y';
    var x = self.x;
    var y = self.y;
    var rst = {};
    rst[xDim] = (point.x - x.start) / (x.end - x.start);
    rst[yDim] = (point.y - y.start) / (y.end - y.start);
    return rst;
  };

  return Cartesian;
}(Base);

Base.Cartesian = Cartesian;
Base.Rect = Cartesian;
module.exports = Cartesian;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  Position: __webpack_require__(34),
  Shape: __webpack_require__(35),
  Size: __webpack_require__(36),
  Color: __webpack_require__(37)
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Base = __webpack_require__(10);

var Position = function (_Base) {
  _inherits(Position, _Base);

  function Position(cfg) {
    _classCallCheck(this, Position);

    var _this = _possibleConstructorReturn(this, _Base.call(this, cfg));

    _this.names = ['x', 'y'];
    _this.type = 'position';
    return _this;
  }

  Position.prototype.mapping = function mapping(x, y) {
    var scales = this.scales;
    var coord = this.coord;
    var scaleX = scales[0];
    var scaleY = scales[1];
    var rstX = void 0;
    var rstY = void 0;
    var obj = void 0;
    if (Util.isNil(x) || Util.isNil(y)) {
      return [];
    }
    if (Util.isArray(y) && Util.isArray(x)) {
      rstX = [];
      rstY = [];
      for (var i = 0, j = 0, xLen = x.length, yLen = y.length; i < xLen && j < yLen; i++, j++) {
        obj = coord.convertPoint({
          x: scaleX.scale(x[i]),
          y: scaleY.scale(y[j])
        });
        rstX.push(obj.x);
        rstY.push(obj.y);
      }
    } else if (Util.isArray(y)) {
      x = scaleX.scale(x);
      rstY = [];
      Util.each(y, function (yVal) {
        yVal = scaleY.scale(yVal);
        obj = coord.convertPoint({
          x: x,
          y: yVal
        });
        if (rstX && rstX !== obj.x) {
          if (!Util.isArray(rstX)) {
            rstX = [rstX];
          }
          rstX.push(obj.x);
        } else {
          rstX = obj.x;
        }
        rstY.push(obj.y);
      });
    } else if (Util.isArray(x)) {
      y = scaleY.scale(y);
      rstX = [];
      Util.each(x, function (xVal) {
        xVal = scaleX.scale(xVal);
        obj = coord.convertPoint({
          x: xVal,
          y: y
        });
        if (rstY && rstY !== obj.y) {
          if (!Util.isArray(rstY)) {
            rstY = [rstY];
          }
          rstY.push(obj.y);
        } else {
          rstY = obj.y;
        }
        rstX.push(obj.x);
      });
    } else {
      x = scaleX.scale(x);
      y = scaleY.scale(y);
      var point = coord.convertPoint({
        x: x,
        y: y
      });
      rstX = point.x;
      rstY = point.y;
    }
    return [rstX, rstY];
  };

  return Position;
}(Base);

module.exports = Position;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = __webpack_require__(10);

var Shape = function (_Base) {
  _inherits(Shape, _Base);

  function Shape(cfg) {
    _classCallCheck(this, Shape);

    var _this = _possibleConstructorReturn(this, _Base.call(this, cfg));

    _this.names = ['shape'];
    _this.type = 'shape';
    _this.gradient = null;
    return _this;
  }

  /**
   * @override
   */


  Shape.prototype.getLinearValue = function getLinearValue(percent) {
    var values = this.values;
    var index = Math.round((values.length - 1) * percent);
    return values[index];
  };

  return Shape;
}(Base);

module.exports = Shape;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = __webpack_require__(10);

var Size = function (_Base) {
  _inherits(Size, _Base);

  function Size(cfg) {
    _classCallCheck(this, Size);

    var _this = _possibleConstructorReturn(this, _Base.call(this, cfg));

    _this.names = ['size'];
    _this.type = 'size';
    _this.gradient = null;
    return _this;
  }

  return Size;
}(Base);

module.exports = Size;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ColorUtil = __webpack_require__(38);
var Base = __webpack_require__(10);
var Util = __webpack_require__(0);

var Color = function (_Base) {
  _inherits(Color, _Base);

  function Color(cfg) {
    _classCallCheck(this, Color);

    var _this = _possibleConstructorReturn(this, _Base.call(this, cfg));

    _this.names = ['color'];
    _this.type = 'color';
    _this.gradient = null;
    if (Util.isString(_this.values)) {
      _this.linear = true;
    }
    return _this;
  }

  /**
   * @override
   */


  Color.prototype.getLinearValue = function getLinearValue(percent) {
    var gradient = this.gradient;
    if (!gradient) {
      var values = this.values;
      gradient = ColorUtil.gradient(values);
      this.gradient = gradient;
    }
    return gradient(percent);
  };

  return Color;
}(Base);

module.exports = Color;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);

// ???????????????????????????
function getValue(start, end, percent, index) {
  var value = start[index] + (end[index] - start[index]) * percent;
  return value;
}

// ?????????????????????
function arr2hex(arr) {
  return '#' + toRGBValue(arr[0]) + toRGBValue(arr[1]) + toRGBValue(arr[2]);
}

// ???????????? 0-255 ?????????16???????????????
function toRGBValue(value) {
  value = Math.round(value);
  value = value.toString(16);
  if (value.length === 1) {
    value = '0' + value;
  }
  return value;
}

function calColor(colors, percent) {
  var steps = colors.length - 1;
  var step = Math.floor(steps * percent);
  var left = steps * percent - step;
  var start = colors[step];
  var end = step === steps ? start : colors[step + 1];
  var rgb = arr2hex([getValue(start, end, left, 0), getValue(start, end, left, 1), getValue(start, end, left, 2)]);
  return rgb;
}

// rgb ?????????????????????
function hex2arr(str) {
  var arr = [];
  arr.push(parseInt(str.substr(1, 2), 16));
  arr.push(parseInt(str.substr(3, 2), 16));
  arr.push(parseInt(str.substr(5, 2), 16));
  return arr;
}

var colorCache = {
  black: '#000000',
  blue: '#0000ff',
  grey: '#808080',
  green: '#008000',
  orange: '#ffa500',
  pink: '#ffc0cb',
  purple: '#800080',
  red: '#ff0000',
  white: '#ffffff',
  yellow: '#ffff00'
};

var ColorUtil = {
  /**
   * ?????????????????? hex ?????????
   * @param  {String} color ??????
   * @return {String} ?????????????????? '#ffffff' ?????????
   */
  toHex: function toHex(color) {
    if (colorCache[color]) {
      return colorCache[color];
    }

    if (color[0] === '#') {
      if (color.length === 7) {
        return color;
      }

      var hex = color.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (m, r, g, b) {
        return '#' + r + r + g + g + b + b;
      }); // hex3 to hex6
      colorCache[color] = hex;
      return hex;
    }

    // rgb/rgba to hex
    var rst = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    rst.shift();
    rst = arr2hex(rst);
    colorCache[color] = rst;
    return rst;
  },


  hex2arr: hex2arr,

  /**
   * ??????????????????
   * @param  {Array} colors ????????????
   * @return {String} ?????????
   */
  gradient: function gradient(colors) {
    var points = [];
    if (Util.isString(colors)) {
      colors = colors.split('-');
    }
    Util.each(colors, function (color) {
      if (color.indexOf('#') === -1) {
        color = ColorUtil.toHex(color);
      }
      points.push(hex2arr(color));
    });
    return function (percent) {
      return calColor(points, percent);
    };
  }
};

module.exports = ColorUtil;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Global = __webpack_require__(1);
var Scale = __webpack_require__(40);
var SCALE_TYPES_MAP = {
  linear: 'Linear',
  cat: 'Cat',
  timeCat: 'TimeCat',
  identity: 'Identity'
};

function getRange(values) {
  var max = Math.max.apply(null, values);
  var min = Math.min.apply(null, values);
  return {
    min: min,
    max: max
  };
}

var ScaleController = function () {
  function ScaleController(cfg) {
    _classCallCheck(this, ScaleController);

    // defs ?????????
    this.defs = {};
    Util.mix(this, cfg);
  }

  ScaleController.prototype._getDef = function _getDef(field) {
    var defs = this.defs;
    var def = null;
    if (Global.scales[field] || defs[field]) {
      def = Util.mix({}, Global.scales[field]);
      // ???????????????????????????
      Util.each(defs[field], function (v, k) {
        if (Util.isNil(v)) {
          delete def[k];
        } else {
          def[k] = v;
        }
      });
    }
    return def;
  };

  ScaleController.prototype._getDefaultType = function _getDefaultType(field, data) {
    var type = 'linear';
    var value = Util.Array.firstValue(data, field);
    if (Util.isArray(value)) {
      value = value[0];
    }
    if (Util.isString(value)) {
      type = 'cat';
    }
    return type;
  };

  ScaleController.prototype._getScaleCfg = function _getScaleCfg(type, field, data) {
    var cfg = {
      field: field
    };
    var values = Util.Array.values(data, field);
    cfg.values = values;
    if (type !== 'cat' && type !== 'timeCat') {
      var _getRange = getRange(values),
          min = _getRange.min,
          max = _getRange.max;

      cfg.min = min;
      cfg.max = max;
    }
    return cfg;
  };

  ScaleController.prototype.createScale = function createScale(field, data, sortable) {
    var self = this;
    var def = self._getDef(field);
    var scale = void 0;
    // ??????????????????????????????????????????
    if (!data || !data.length) {
      if (def && def.type) {
        scale = new Scale[SCALE_TYPES_MAP[def.type]](def);
      } else {
        scale = new Scale.Identity({
          value: field,
          field: field.toString(),
          values: [field]
        });
      }
      return scale;
    }
    var firstObj = data[0];
    var firstValue = firstObj[field];
    if (firstValue === null) {
      firstValue = Util.Array.firstValue(data, field);
    }

    if (Util.isNumber(field) || Util.isNil(firstValue) && !def) {
      scale = new Scale.Identity({
        value: field,
        field: field.toString(),
        values: [field]
      });
    } else {
      // ?????????????????????????????????
      var type = void 0;
      if (def) {
        type = def.type;
      }
      type = type || self._getDefaultType(field, data);
      var cfg = self._getScaleCfg(type, field, data);
      if (def) {
        Util.mix(cfg, def);
      }
      cfg.sortable = sortable;
      scale = new Scale[SCALE_TYPES_MAP[type]](cfg);
    }
    return scale;
  };

  return ScaleController;
}();

module.exports = ScaleController;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview Scale entry, used to reference all the scales
 * @author dxq613@gmail.com
 */
var Scale = __webpack_require__(8);

__webpack_require__(41);
__webpack_require__(44);
__webpack_require__(21);

module.exports = Scale;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview The measurement of linear data scale function
 * @author dxq613@gmail.com
 */
var Base = __webpack_require__(8);
var Util = __webpack_require__(0);
var numberAuto = __webpack_require__(42);

/**
 * ????????????
 * @class Scale.Linear
 */

var Linear = function (_Base) {
  _inherits(Linear, _Base);

  function Linear() {
    _classCallCheck(this, Linear);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Linear.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'linear';
    this.isLinear = true;
    /**
      * min value of the scale
      * @type {Number}
      * @default null
      */
    this.min = null;
    /**
      * max value of the scale
      * @type {Number}
      * @default null
      */
    this.max = null;
    /**
      * ?????????????????????????????????min,max???ticks?????????????????????????????????????????????ticks??????min,max???????????????(min,max)???????????????ticks
      * @type {Boolean}
      * @default false
      */
    this.nice = true;
    /**
      * ??????????????????????????????
      * @type {Number}
      * @default null
      */
    this.tickCount = null;
    /**
      * ????????????????????????????????????????????????????????????
      * @type {Number}
      * @default null
      */
    this.tickInterval = null;
    /**
     * ???????????????,??????????????????tick?????????????????????
     * @type {Function}
     */
    this.formatter = null;
    /**
     * ???????????????
     * @type {Array}
     */
    this.range = [0, 1];
    /**
     * ???????????????
     * @type {Array}
     */
    this.ticks = null;
    /**
     * ????????????????????????????????????
     * @type {Array}
     */
    this.values = [];
  };

  /**
   * @protected
   * @override
   */


  Linear.prototype.init = function init() {
    var self = this;
    if (!self.ticks) {
      self.min = self.translate(self.min);
      self.max = self.translate(self.max);
      self.initTicks();
    } else {
      var ticks = self.ticks;
      var firstValue = self.translate(ticks[0]);
      var lastValue = self.translate(ticks[ticks.length - 1]);
      if (Util.isNil(self.min) || self.min > firstValue) {
        self.min = firstValue;
      }
      if (Util.isNil(self.max) || self.max < lastValue) {
        self.max = lastValue;
      }
    }
  };

  /**
   * ???????????????
   * @protected
   * @return {Array} ????????????????????????
   */


  Linear.prototype.calculateTicks = function calculateTicks() {
    var self = this;
    var min = self.min;
    var max = self.max;
    var count = self.tickCount;
    if (count === 1) {
      throw new Error('linear scale\'tickCount should not be 1');
    }
    var interval = self.tickInterval;
    if (max < min) {
      throw new Error('max: ' + max + ' should not be less than min: ' + min);
    }
    var tmp = numberAuto({
      min: min,
      max: max,
      minCount: count,
      maxCount: count,
      interval: interval
    });
    return tmp.ticks;
  };

  // ?????????ticks


  Linear.prototype.initTicks = function initTicks() {
    var self = this;
    var calTicks = self.calculateTicks();
    if (self.nice) {
      // ???????????????????????????tick
      self.ticks = calTicks;
      self.min = calTicks[0];
      self.max = calTicks[calTicks.length - 1];
    } else {
      var ticks = [];
      Util.each(calTicks, function (tick) {
        if (tick >= self.min && tick <= self.max) {
          ticks.push(tick);
        }
      });
      self.ticks = ticks;
    }
  };

  /**
   * @override
   */


  Linear.prototype.scale = function scale(value) {
    if (value === null || value === undefined) {
      return NaN;
    }
    var max = this.max;
    var min = this.min;
    if (max === min) {
      return 0;
    }

    var percent = (value - min) / (max - min);
    var rangeMin = this.rangeMin();
    var rangeMax = this.rangeMax();
    return rangeMin + percent * (rangeMax - rangeMin);
  };

  /**
   * @override
   */


  Linear.prototype.invert = function invert(value) {
    var percent = (value - this.rangeMin()) / (this.rangeMax() - this.rangeMin());
    return this.min + percent * (this.max - this.min);
  };

  return Linear;
}(Base);

Base.Linear = Linear;
module.exports = Linear;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ???????????????????????????
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);
var AutoUtil = __webpack_require__(43);
var MIN_COUNT = 5;
var MAX_COUNT = 7;
var INTERVAL_ARRAY = [0, 1, 2, 4, 5, 10];

module.exports = function (info) {
  var min = info.min;
  var max = info.max;
  var interval = info.interval;
  var ticks = [];
  var minCount = info.minCount || MIN_COUNT;
  var maxCount = info.maxCount || MAX_COUNT;
  var avgCount = (minCount + maxCount) / 2;
  var count = void 0;

  if (Util.isNil(min)) {
    min = 0;
  }
  if (Util.isNil(max)) {
    max = 0;
  }
  if (max === min) {
    if (min === 0) {
      max = 1;
    } else {
      if (min > 0) {
        min = 0;
      } else {
        max = 0;
      }
    }
    if (max - min < 5 && !interval && max - min >= 1) {
      interval = 1;
    }
  }

  if (Util.isNil(interval)) {
    // ????????????
    var temp = (max - min) / (avgCount - 1);
    interval = AutoUtil.snapFactorTo(temp, INTERVAL_ARRAY, 'ceil');
    if (maxCount !== minCount) {
      count = parseInt((max - min) / interval, 10);
      if (count > maxCount) {
        count = maxCount;
      }
      if (count < minCount) {
        count = minCount;
      }
      // ?????????tick?????????????????????tick??????
      interval = AutoUtil.snapFactorTo((max - min) / (count - 1), INTERVAL_ARRAY, 'floor');
    } else {
      count = avgCount;
    }
  }
  if (info.interval || maxCount !== minCount) {
    // ?????? max ??? min
    max = AutoUtil.snapMultiple(max, interval, 'ceil'); // ????????????
    min = AutoUtil.snapMultiple(min, interval, 'floor'); // ????????????
    count = Math.round((max - min) / interval);
    min = Util.fixedBase(min, interval);
    max = Util.fixedBase(max, interval);
  } else {
    avgCount = parseInt(avgCount, 10); // ??????
    var avg = (max + min) / 2;
    var avgTick = AutoUtil.snapMultiple(avg, interval, 'ceil');
    var sideCount = Math.floor((avgCount - 2) / 2);
    var maxTick = avgTick + sideCount * interval;
    var minTick = void 0;
    if (avgCount % 2 === 0) {
      minTick = avgTick - sideCount * interval;
    } else {
      minTick = avgTick - (sideCount + 1) * interval;
    }
    if (maxTick < max) {
      maxTick = maxTick + interval;
    }
    if (minTick > min) {
      minTick = minTick - interval;
    }
    max = Util.fixedBase(maxTick, interval);
    min = Util.fixedBase(minTick, interval);
  }

  ticks.push(min);
  for (var i = 1; i < count; i++) {
    ticks.push(Util.fixedBase(interval * i + min, interval));
  }
  if (ticks[ticks.length - 1] < max) {
    ticks.push(max);
  }
  return {
    min: min,
    max: max,
    interval: interval,
    count: count,
    ticks: ticks
  };
};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

/**
 * @fileOverview ????????????
 * @author dxq613@gmail.com
 */

// ????????????
function getFactor(v) {
  var factor = 1;
  if (v < 1) {
    var count = 0;
    while (v < 1) {
      factor = factor / 10;
      v = v * 10;
      count++;
    }
    // ???????????????????????????
    if (factor.toString().length > 20) {
      factor = parseFloat(factor.toFixed(count));
    }
  } else {
    while (v > 10) {
      factor = factor * 10;
      v = v / 10;
    }
  }

  return factor;
}

// ?????????????????????
function arrayFloor(values, value) {
  var length = values.length;
  if (length === 0) {
    return NaN;
  }

  var pre = values[0];

  if (value < values[0]) {
    return NaN;
  }

  if (value >= values[length - 1]) {
    return values[length - 1];
  }
  for (var i = 1, len = values.length; i < len; i++) {
    if (value < values[i]) {
      break;
    }
    pre = values[i];
  }

  return pre;
}

// ???????????????????????????
function arrayCeiling(values, value) {
  var length = values.length;
  if (length === 0) {
    return NaN;
  }
  // var pre = values[0];
  var rst = void 0;
  if (value > values[length - 1]) {
    return NaN;
  }
  if (value < values[0]) {
    return values[0];
  }

  for (var i = 1, len = values.length; i < len; i++) {
    if (value <= values[i]) {
      rst = values[i];
      break;
    }
  }

  return rst;
}

var Util = {
  // ?????????????????????
  snapFactorTo: function snapFactorTo(v, arr, snapType) {
    // ?????? v = -512,isFloor = true
    if (isNaN(v)) {
      return NaN;
    }
    var factor = 1; // ????????????
    if (v !== 0) {
      if (v < 0) {
        factor = -1;
      }
      v = v * factor; // v = 512
      var tmpFactor = getFactor(v);
      factor = factor * tmpFactor; // factor = -100

      v = v / tmpFactor; // v = 5.12
    }
    if (snapType === 'floor') {
      v = Util.snapFloor(arr, v); // v = 5
    } else if (snapType === 'ceil') {
      v = Util.snapCeiling(arr, v); // v = 6
    } else {
      v = Util.snapTo(arr, v); // ???????????? 5
    }
    var rst = v * factor;
    // ??????????????????????????????????????????????????????
    if (Math.abs(factor) < 1 && rst.toString().length > 20) {
      var decimalVal = parseInt(1 / factor);
      var symbol = factor > 0 ? 1 : -1;
      rst = v / decimalVal * symbol;
    }
    return rst;
  },

  // ?????????????????????
  snapMultiple: function snapMultiple(v, base, snapType) {
    var div = void 0;
    if (snapType === 'ceil') {
      div = Math.ceil(v / base);
    } else if (snapType === 'floor') {
      div = Math.floor(v / base);
    } else {
      div = Math.round(v / base);
    }
    return div * base;
  },

  /**
   * ???????????????????????????????????????
   * @param  {Array} values   ????????????
   * @param  {Number} value   ??????
   * @return {Number} ????????????
   */
  snapTo: function snapTo(values, value) {
    // ????????????values???????????????
    var floorVal = arrayFloor(values, value);
    var ceilingVal = arrayCeiling(values, value);
    if (isNaN(floorVal) || isNaN(ceilingVal)) {
      if (values[0] >= value) {
        return values[0];
      }
      var last = values[values.length - 1];
      if (last <= value) {
        return last;
      }
    }
    if (Math.abs(value - floorVal) < Math.abs(ceilingVal - value)) {
      return floorVal;
    }
    return ceilingVal;
  },

  /**
   * ?????????????????????????????????????????????
   * @param  {Array} values   ????????????
   * @param  {Number} value   ??????
   * @return {Number} ??????????????????
   */
  snapFloor: function snapFloor(values, value) {
    // ????????????values???????????????
    return arrayFloor(values, value);
  },

  /**
   * ?????????????????????????????????????????????
   * @param  {Array} values   ????????????
   * @param  {Number} value   ??????
   * @return {Number} ??????????????????
   */
  snapCeiling: function snapCeiling(values, value) {
    // ????????????values???????????????
    return arrayCeiling(values, value);
  }
};

module.exports = Util;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview The data is replaced with constant
 * @author dxq613@gmail.com
 */
var Base = __webpack_require__(8);
var Util = __webpack_require__(0);

var Identity = function (_Base) {
  _inherits(Identity, _Base);

  function Identity() {
    _classCallCheck(this, Identity);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Identity.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.isIdentity = true;
    this.type = 'identity';
    /**
     * ???????????????
     * @type {Array}
     */
    this.range = [0, 1];
    /**
     * ?????????
     * @type {*}
     */
    this.value = null;
  };

  /**
   * @override
   */


  Identity.prototype.getText = function getText() {
    return this.value.toString();
  };

  /**
   * @override
   */


  Identity.prototype.scale = function scale(value) {
    if (this.value !== value && Util.isNumber(value)) {
      return value;
    }
    return this.range[0];
  };

  /**
   * @override
   */


  Identity.prototype.invert = function invert() {
    return this.value;
  };

  return Identity;
}(Base);

Base.Identity = Identity;
module.exports = Identity;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Axis = __webpack_require__(46);
var Global = __webpack_require__(1);

var _require = __webpack_require__(6),
    Shape = _require.Shape;

function formatTicks(ticks) {
  var tmp = ticks.slice(0);
  if (tmp.length > 0) {
    var first = tmp[0];
    var last = tmp[tmp.length - 1];
    if (first.value !== 0) {
      tmp.unshift({
        value: 0
      });
    }
    if (last.value !== 1) {
      tmp.push({
        value: 1
      });
    }
  }

  return tmp;
}

var AxisController = function () {
  function AxisController(cfg) {
    _classCallCheck(this, AxisController);

    this.axisCfg = {};
    this.frontPlot = null;
    this.backPlot = null;
    this.axes = {}; // ??????????????????????????????
    Util.mix(this, cfg);
  }

  // ??????????????????????????????


  AxisController.prototype._isHide = function _isHide(field) {
    var axisCfg = this.axisCfg;
    return !axisCfg || axisCfg[field] === false;
  };

  AxisController.prototype._getLinePosition = function _getLinePosition(scale, dimType, index, transposed) {
    var position = '';
    var field = scale.field;
    var axisCfg = this.axisCfg;
    if (axisCfg[field] && axisCfg[field].position) {
      position = axisCfg[field].position;
    } else if (dimType === 'x') {
      position = transposed ? 'left' : 'bottom';
    } else if (dimType === 'y') {
      position = index ? 'right' : 'left';
      if (transposed) {
        position = 'bottom';
      }
    }

    return position;
  };

  AxisController.prototype._getLineCfg = function _getLineCfg(coord, dimType, position) {
    var start = void 0;
    var end = void 0;
    var factor = 1; // ???????????????????????????????????????????????????????????????
    if (dimType === 'x') {
      // x ????????????????????????????????????
      start = {
        x: 0,
        y: 0
      };
      end = {
        x: 1,
        y: 0
      };
    } else {
      // y????????????
      if (position === 'right') {
        // ???????????????
        start = {
          x: 1,
          y: 0
        };
        end = {
          x: 1,
          y: 1
        };
      } else {
        // ??????y?????????????????????y???
        start = {
          x: 0,
          y: 0
        };
        end = {
          x: 0,
          y: 1
        };
        factor = -1;
      }
    }
    if (coord.transposed) {
      factor *= -1;
    }

    return {
      offsetFactor: factor,
      start: coord.convertPoint(start),
      end: coord.convertPoint(end)
    };
  };

  AxisController.prototype._getCircleCfg = function _getCircleCfg(coord) {
    return {
      startAngle: coord.startAngle,
      endAngle: coord.endAngle,
      center: coord.center,
      radius: coord.circleRadius
    };
  };

  AxisController.prototype._getRadiusCfg = function _getRadiusCfg(coord) {
    var transposed = coord.transposed;
    var start = void 0;
    var end = void 0;
    if (transposed) {
      start = { x: 0, y: 0 };
      end = { x: 1, y: 0 };
    } else {
      start = { x: 0, y: 0 };
      end = { x: 0, y: 1 };
    }
    return {
      offsetFactor: -1,
      start: coord.convertPoint(start),
      end: coord.convertPoint(end)
    };
  };

  AxisController.prototype._getAxisCfg = function _getAxisCfg(coord, scale, verticalScale, dimType, defaultCfg) {
    var self = this;
    var axisCfg = this.axisCfg;
    var ticks = scale.getTicks();

    var cfg = Util.deepMix({
      ticks: ticks,
      frontContainer: this.frontPlot,
      backContainer: this.backPlot
    }, defaultCfg, axisCfg[scale.field]);

    var labels = [];
    var label = cfg.label;
    var count = ticks.length;
    var maxWidth = 0;
    var maxHeight = 0;
    var labelCfg = label;

    Util.each(ticks, function (tick, index) {
      if (Util.isFunction(label)) {
        // ?????????????????????????????????
        var executedLabel = label(tick.text, index, count);
        if (executedLabel) {
          labelCfg = Util.mix({}, Global._defaultAxis.label, executedLabel);
        } else {
          labelCfg = null;
        }
      }
      if (labelCfg) {
        var textStyle = {};
        if (labelCfg.textAlign) {
          textStyle.textAlign = labelCfg.textAlign;
        }
        if (labelCfg.textBaseline) {
          textStyle.textBaseline = labelCfg.textBaseline;
        }
        var axisLabel = new Shape.Text({
          className: 'axis-label',
          attrs: Util.mix({
            x: 0,
            y: 0,
            text: tick.text,
            fontFamily: self.chart.get('canvas').get('fontFamily') // ??????????????????
          }, labelCfg),
          value: tick.value,
          textStyle: textStyle,
          top: labelCfg.top,
          context: self.chart.get('canvas').get('context')
        });
        labels.push(axisLabel);

        var _axisLabel$getBBox = axisLabel.getBBox(),
            width = _axisLabel$getBBox.width,
            height = _axisLabel$getBBox.height;

        maxWidth = Math.max(maxWidth, width);
        maxHeight = Math.max(maxHeight, height);
      }
    });

    cfg.labels = labels;
    cfg.maxWidth = maxWidth;
    cfg.maxHeight = maxHeight;
    return cfg;
  };

  AxisController.prototype._createAxis = function _createAxis(coord, scale, verticalScale, dimType) {
    var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

    var self = this;
    var coordType = coord.type;
    var transposed = coord.transposed;
    var type = void 0;
    var key = void 0;
    var defaultCfg = void 0;
    if (coordType === 'cartesian' || coordType === 'rect') {
      // ??????????????????
      var position = self._getLinePosition(scale, dimType, index, transposed);
      defaultCfg = Global.axis[position];
      defaultCfg.position = position;
      type = 'Line';
      key = position;
    } else {
      // ???????????????
      if (dimType === 'x' && !transposed || dimType === 'y' && transposed) {
        // ???????????????
        defaultCfg = Global.axis.circle;
        type = 'Circle';
        key = 'circle';
      } else {
        // ???????????????
        defaultCfg = Global.axis.radius;
        type = 'Line';
        key = 'radius';
      }
    }
    var cfg = self._getAxisCfg(coord, scale, verticalScale, dimType, defaultCfg); // ?????????????????????
    cfg.type = type;
    cfg.dimType = dimType;
    cfg.verticalScale = verticalScale;
    cfg.index = index;
    this.axes[key] = cfg;
  };

  AxisController.prototype.createAxis = function createAxis(coord, xScale, yScales) {
    var self = this;
    if (xScale && !self._isHide(xScale.field)) {
      self._createAxis(coord, xScale, yScales[0], 'x'); // ?????? x ???
    }
    Util.each(yScales, function (yScale, index) {
      if (!self._isHide(yScale.field)) {
        self._createAxis(coord, yScale, xScale, 'y', index);
      }
    });

    var axes = this.axes;
    var chart = self.chart;
    if (chart._isAutoPadding()) {
      var userPadding = Util.parsePadding(chart.get('padding'));
      var appendPadding = chart.get('appendPadding');
      var legendRange = chart.get('legendRange') || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };

      var padding = [userPadding[0] === 'auto' ? legendRange.top + appendPadding * 2 : userPadding[0], userPadding[1] === 'auto' ? legendRange.right + appendPadding : userPadding[1], userPadding[2] === 'auto' ? legendRange.bottom + appendPadding : userPadding[2], userPadding[3] === 'auto' ? legendRange.left + appendPadding : userPadding[3]];

      if (coord.isPolar) {
        // ?????????
        var circleAxis = axes.circle;
        if (circleAxis) {
          var maxHeight = circleAxis.maxHeight,
              maxWidth = circleAxis.maxWidth,
              labelOffset = circleAxis.labelOffset;

          padding[0] += maxHeight + labelOffset;
          padding[1] += maxWidth + labelOffset;
          padding[2] += maxHeight + labelOffset;
          padding[3] += maxWidth + labelOffset;
        }
      } else {
        // ???????????????
        if (axes.right && userPadding[1] === 'auto') {
          var _axes$right = axes.right,
              _maxWidth = _axes$right.maxWidth,
              _labelOffset = _axes$right.labelOffset;

          padding[1] += _maxWidth + _labelOffset;
        }

        if (axes.left && userPadding[3] === 'auto') {
          var _axes$left = axes.left,
              _maxWidth2 = _axes$left.maxWidth,
              _labelOffset2 = _axes$left.labelOffset;

          padding[3] += _maxWidth2 + _labelOffset2;
        }

        if (axes.bottom && userPadding[2] === 'auto') {
          var _axes$bottom = axes.bottom,
              _maxHeight = _axes$bottom.maxHeight,
              _labelOffset3 = _axes$bottom.labelOffset;

          padding[2] += _maxHeight + _labelOffset3;
        }
      }
      chart.set('padding', padding); // TODO, ??????????????????changeData ????????????
      chart._updateLayout(padding);
    }

    Util.each(axes, function (axis) {
      var type = axis.type,
          grid = axis.grid,
          verticalScale = axis.verticalScale,
          ticks = axis.ticks,
          dimType = axis.dimType,
          position = axis.position,
          index = axis.index;

      var appendCfg = void 0;
      if (coord.isPolar) {
        if (type === 'Line') {
          appendCfg = self._getRadiusCfg(coord);
        } else if (type === 'Circle') {
          appendCfg = self._getCircleCfg(coord);
        }
      } else {
        appendCfg = self._getLineCfg(coord, dimType, position);
      }

      if (grid && verticalScale) {
        var gridPoints = [];
        var verticalTicks = formatTicks(verticalScale.getTicks());

        Util.each(ticks, function (tick) {
          var subPoints = [];
          Util.each(verticalTicks, function (verticalTick) {
            var x = dimType === 'x' ? tick.value : verticalTick.value;
            var y = dimType === 'x' ? verticalTick.value : tick.value;
            var point = coord.convertPoint({
              x: x,
              y: y
            });
            subPoints.push(point);
          });

          gridPoints.push({
            points: subPoints,
            _id: 'axis-' + dimType + index + '-grid-' + tick.tickValue
          });
        });
        axis.gridPoints = gridPoints;

        if (coord.isPolar && grid.type === 'arc') {
          axis.center = coord.center;
          axis.startAngle = coord.startAngle;
          axis.endAngle = coord.endAngle;
        }
      }
      appendCfg._id = 'axis-' + dimType;
      if (!Util.isNil(index)) {
        appendCfg._id = 'axis-' + dimType + index;
      }

      new Axis[type](Util.mix(axis, appendCfg));
    });
  };

  AxisController.prototype.clear = function clear() {
    this.axes = {};
    this.frontPlot.clear();
    this.backPlot.clear();
  };

  return AxisController;
}();

module.exports = AxisController;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var Abstract = __webpack_require__(15);

// require('./circle');
__webpack_require__(47);

module.exports = Abstract;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Abstract = __webpack_require__(15);

var Line = function (_Abstract) {
  _inherits(Line, _Abstract);

  function Line() {
    _classCallCheck(this, Line);

    return _possibleConstructorReturn(this, _Abstract.apply(this, arguments));
  }

  Line.prototype._initDefaultCfg = function _initDefaultCfg() {
    _Abstract.prototype._initDefaultCfg.call(this);
    this.start = null;
    this.end = null;
  };
  // ????????????????????????


  Line.prototype.getOffsetPoint = function getOffsetPoint(value) {
    var start = this.start,
        end = this.end;

    return {
      x: start.x + (end.x - start.x) * value,
      y: start.y + (end.y - start.y) * value
    };
  };

  // ????????????????????????????????????????????????????????????


  Line.prototype.getAxisVector = function getAxisVector() {
    var start = this.start,
        end = this.end;

    return [end.x - start.x, end.y - start.y];
  };

  Line.prototype.drawLine = function drawLine(lineCfg) {
    var container = this.getContainer(lineCfg.top);
    var start = this.start,
        end = this.end;

    container.addShape('line', {
      className: 'axis-line',
      attrs: Util.mix({
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y
      }, lineCfg)
    });
  };

  return Line;
}(Abstract);

Abstract.Line = Line;
module.exports = Line;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Container = __webpack_require__(18);
var Group = __webpack_require__(19);

var Canvas = function () {
  Canvas.prototype.get = function get(name) {
    return this._attrs[name];
  };

  Canvas.prototype.set = function set(name, value) {
    this._attrs[name] = value;
  };

  function Canvas(cfg) {
    _classCallCheck(this, Canvas);

    this._attrs = Util.mix({
      type: 'canvas',
      children: []
    }, cfg);
    this._initPixelRatio();
    this._initCanvas();
  }

  Canvas.prototype._initPixelRatio = function _initPixelRatio() {
    var pixelRatio = this.get('pixelRatio');
    if (!pixelRatio) {
      this.set('pixelRatio', Util.getPixelRatio());
    }
  };

  Canvas.prototype._beforeDraw = function _beforeDraw() {
    var context = this._attrs.context;
    var el = this._attrs.el;
    !Util.isWx && !Util.isMy && context && context.clearRect(0, 0, el.width, el.height);
  };

  Canvas.prototype._initCanvas = function _initCanvas() {
    var self = this;
    var el = self.get('el');
    var context = self.get('context');
    var canvas = void 0;

    if (context) {
      // CanvasRenderingContext2D
      canvas = context.canvas;
    } else if (Util.isString(el)) {
      // HTMLElement's id
      canvas = Util.getDomById(el);
    } else {
      // HTMLElement
      canvas = el;
    }

    if (!canvas) {
      throw new Error('Please specify the id or el of the chart!');
    }

    if (context && canvas && !canvas.getContext) {
      canvas.getContext = function () {
        return context;
      };
    }

    var width = self.get('width');
    if (!width) {
      width = Util.getWidth(canvas);
    }

    var height = self.get('height');
    if (!height) {
      height = Util.getHeight(canvas);
    }

    self.set('canvas', this);
    self.set('el', canvas);
    self.set('context', context || canvas.getContext('2d'));
    self.changeSize(width, height);
  };

  /**
   * ?????? canvas ?????????
   * @param  {Number} width  ??????
   * @param  {Number} height ??????
   */


  Canvas.prototype.changeSize = function changeSize(width, height) {
    var pixelRatio = this.get('pixelRatio');
    var canvasDOM = this.get('el');

    if (Util.isBrowser) {
      canvasDOM.style.width = width + 'px';
      canvasDOM.style.height = height + 'px';
    }

    if (!Util.isWx && !Util.isMy) {
      canvasDOM.width = width * pixelRatio;
      canvasDOM.height = height * pixelRatio;

      if (pixelRatio !== 1) {
        var ctx = this.get('context');
        ctx.scale(pixelRatio, pixelRatio);
      }
    }

    this.set('width', width);
    this.set('height', height);
  };

  /**
   * ?????? canvas ?????? dom ???????????????
   * @return {Number} ????????????
   */


  Canvas.prototype.getWidth = function getWidth() {
    var pixelRatio = this.get('pixelRatio');
    var width = this.get('width');
    return width * pixelRatio;
  };

  /**
   * ?????? canvas ?????? dom ???????????????
   * @return {Number} ????????????
   */


  Canvas.prototype.getHeight = function getHeight() {
    var pixelRatio = this.get('pixelRatio');
    var height = this.get('height');
    return height * pixelRatio;
  };

  /**
   * ???????????????????????? canvas ??????
   * @param  {Number} clientX ??????x??????
   * @param  {Number} clientY ??????y??????
   * @return {Object} canvas??????
   */


  Canvas.prototype.getPointByClient = function getPointByClient(clientX, clientY) {
    var el = this.get('el');
    var bbox = el.getBoundingClientRect();
    var width = bbox.right - bbox.left;
    var height = bbox.bottom - bbox.top;
    return {
      x: (clientX - bbox.left) * (el.width / width),
      y: (clientY - bbox.top) * (el.height / height)
    };
  };

  Canvas.prototype.draw = function draw() {
    var self = this;
    if (self._attrs.destroyed) {
      return;
    }
    self._beforeDraw();
    try {
      var context = self._attrs.context;
      var children = self._attrs.children;
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        child.draw(context);
      }

      if (Util.isWx || Util.isMy) {
        context.draw();
      }
    } catch (ev) {
      // ??????????????????????????????
      console.warn('error in draw canvas, detail as:');
      console.warn(ev);
    }
  };

  Canvas.prototype.destroy = function destroy() {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    this._attrs = {};
    this.set('destroyed', true);
  };

  return Canvas;
}();

Util.mix(Canvas.prototype, Container, {
  getGroupClass: function getGroupClass() {
    return Group;
  }
});

module.exports = Canvas;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Shape = __webpack_require__(2);

var Rect = function (_Shape) {
  _inherits(Rect, _Shape);

  function Rect() {
    _classCallCheck(this, Rect);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Rect.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'rect';
  };

  Rect.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: 0,
      lineWidth: 0
    };
  };

  Rect.prototype.createPath = function createPath(context) {
    var self = this;
    var attrs = self.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        width = attrs.width,
        height = attrs.height;


    context.beginPath();
    var radius = attrs.radius;
    if (!radius || !(width * height)) {
      context.rect(x, y, width, height);
    } else {
      radius = Util.parsePadding(radius);
      context.moveTo(x + radius[0], y);
      context.lineTo(x + width - radius[1], y);
      context.arc(x + width - radius[1], y + radius[1], radius[1], -Math.PI / 2, 0, false);
      context.lineTo(x + width, y + height - radius[2]);
      context.arc(x + width - radius[2], y + height - radius[2], radius[2], 0, Math.PI / 2, false);
      context.lineTo(x + radius[3], y + height);
      context.arc(x + radius[3], y + height - radius[3], radius[3], Math.PI / 2, Math.PI, false);
      context.lineTo(x, y + radius[0]);
      context.arc(x + radius[0], y + radius[0], radius[0], Math.PI, Math.PI * 3 / 2, false);
      context.closePath();
    }
  };

  Rect.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        width = attrs.width,
        height = attrs.height;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  };

  return Rect;
}(Shape);

Shape.Rect = Rect;
module.exports = Rect;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);

var Circle = function (_Shape) {
  _inherits(Circle, _Shape);

  function Circle() {
    _classCallCheck(this, Circle);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Circle.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'circle';
  };

  Circle.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      r: 0,
      lineWidth: 0
    };
  };

  Circle.prototype.createPath = function createPath(context) {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        r = attrs.r;

    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
  };

  Circle.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        r = attrs.r;


    return {
      minX: x - r,
      maxX: x + r,
      minY: y - r,
      maxY: y + r
    };
  };

  return Circle;
}(Shape);

Shape.Circle = Circle;
module.exports = Circle;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);
var bbox = __webpack_require__(7);

var Line = function (_Shape) {
  _inherits(Line, _Shape);

  function Line() {
    _classCallCheck(this, Line);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Line.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canStroke = true;
    this._attrs.type = 'line';
  };

  Line.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      lineWidth: 1
    };
  };

  Line.prototype.createPath = function createPath(context) {
    var attrs = this.get('attrs');
    var x1 = attrs.x1,
        y1 = attrs.y1,
        x2 = attrs.x2,
        y2 = attrs.y2;


    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
  };

  Line.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x1 = attrs.x1,
        y1 = attrs.y1,
        x2 = attrs.x2,
        y2 = attrs.y2;

    return bbox.getBBoxFromLine(x1, y1, x2, y2);
  };

  return Line;
}(Shape);

Shape.Line = Line;
module.exports = Line;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);
var bbox = __webpack_require__(7);

var Polygon = function (_Shape) {
  _inherits(Polygon, _Shape);

  function Polygon() {
    _classCallCheck(this, Polygon);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Polygon.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'polygon';
  };

  Polygon.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      points: null,
      lineWidth: 0
    };
  };

  Polygon.prototype.createPath = function createPath(context) {
    var self = this;
    var attrs = self.get('attrs');
    var points = attrs.points;

    context.beginPath();

    for (var i = 0, len = points.length; i < len; i++) {
      var point = points[i];
      if (i === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
    context.closePath();
  };

  Polygon.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var points = attrs.points;

    return bbox.getBBoxFromPoints(points);
  };

  return Polygon;
}(Shape);

Shape.Polygon = Polygon;
module.exports = Polygon;

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);
var Smooth = __webpack_require__(23);
var bbox = __webpack_require__(7);

var Polyline = function (_Shape) {
  _inherits(Polyline, _Shape);

  function Polyline() {
    _classCallCheck(this, Polyline);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Polyline.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'polyline';
  };

  Polyline.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      points: null,
      lineWidth: 1,
      smooth: false
    };
  };

  Polyline.prototype.createPath = function createPath(context) {
    var self = this;
    var attrs = self.get('attrs');
    var points = attrs.points,
        smooth = attrs.smooth;


    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    if (smooth) {
      var constaint = [[0, 0], [1, 1]];
      var sps = Smooth.smooth(points, false, constaint);
      for (var i = 0, n = sps.length; i < n; i++) {
        var sp = sps[i];
        context.bezierCurveTo(sp[1], sp[2], sp[3], sp[4], sp[5], sp[6]);
      }
    } else {
      var _i = void 0;
      var l = void 0;
      for (_i = 1, l = points.length - 1; _i < l; _i++) {
        context.lineTo(points[_i].x, points[_i].y);
      }
      context.lineTo(points[l].x, points[l].y);
    }
  };

  Polyline.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var points = attrs.points,
        smooth = attrs.smooth;


    if (smooth) {
      var newPoints = [];
      var constaint = [[0, 0], [1, 1]];
      var sps = Smooth.smooth(points, false, constaint);
      for (var i = 0, n = sps.length; i < n; i++) {
        var sp = sps[i];
        if (i === 0) {
          newPoints.push([points[0].x, points[0].y, sp[1], sp[2], sp[3], sp[4], sp[5], sp[6]]);
        } else {
          var lastPoint = sps[i - 1];
          newPoints.push([lastPoint[5], lastPoint[6], sp[1], sp[2], sp[3], sp[4], sp[5], sp[6]]);
        }
      }
      return bbox.getBBoxFromBezierGroup(newPoints);
    }
    return bbox.getBBoxFromPoints(points);
  };

  return Polyline;
}(Shape);

Shape.Polyline = Polyline;
module.exports = Polyline;

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);
var bbox = __webpack_require__(7);

var Arc = function (_Shape) {
  _inherits(Arc, _Shape);

  function Arc() {
    _classCallCheck(this, Arc);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Arc.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canStroke = true;
    this._attrs.type = 'arc';
  };

  Arc.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      r: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: false,
      lineWidth: 1
    };
  };

  Arc.prototype.createPath = function createPath(context) {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        r = attrs.r,
        startAngle = attrs.startAngle,
        endAngle = attrs.endAngle,
        clockwise = attrs.clockwise;


    context.beginPath();
    context.arc(x, y, r, startAngle, endAngle, clockwise);
  };

  Arc.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        r = attrs.r,
        startAngle = attrs.startAngle,
        endAngle = attrs.endAngle,
        clockwise = attrs.clockwise;


    return bbox.getBBoxFromArc(x, y, r, startAngle, endAngle, clockwise);
  };

  return Arc;
}(Shape);

Shape.Arc = Arc;
module.exports = Arc;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);
var bbox = __webpack_require__(7);

var Sector = function (_Shape) {
  _inherits(Sector, _Shape);

  function Sector() {
    _classCallCheck(this, Sector);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Sector.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'sector';
  };

  Sector.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      lineWidth: 0,
      r: 0,
      r0: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: false
    };
  };

  Sector.prototype.createPath = function createPath(context) {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        startAngle = attrs.startAngle,
        endAngle = attrs.endAngle,
        r = attrs.r,
        r0 = attrs.r0,
        clockwise = attrs.clockwise;

    context.beginPath();
    var unitX = Math.cos(startAngle);
    var unitY = Math.sin(startAngle);

    context.moveTo(unitX * r0 + x, unitY * r0 + y);
    context.lineTo(unitX * r + x, unitY * r + y);
    context.arc(x, y, r, startAngle, endAngle, clockwise);
    context.lineTo(Math.cos(endAngle) * r0 + x, Math.sin(endAngle) * r0 + y);
    if (r0 !== 0) {
      context.arc(x, y, r0, endAngle, startAngle, !clockwise);
    }
    context.closePath();
  };

  Sector.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        r = attrs.r,
        r0 = attrs.r0,
        startAngle = attrs.startAngle,
        endAngle = attrs.endAngle,
        clockwise = attrs.clockwise;

    var outerBBox = bbox.getBBoxFromArc(x, y, r, startAngle, endAngle, clockwise);
    var innerBBox = bbox.getBBoxFromArc(x, y, r0, startAngle, endAngle, clockwise);
    return {
      minX: Math.min(outerBBox.minX, innerBBox.minX),
      minY: Math.min(outerBBox.minY, innerBBox.minY),
      maxX: Math.max(outerBBox.maxX, innerBBox.maxX),
      maxY: Math.max(outerBBox.maxY, innerBBox.maxY)
    };
  };

  return Sector;
}(Shape);

Shape.Sector = Sector;
module.exports = Sector;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Shape = __webpack_require__(2);

var textWidthCacheCounter = 0;
var textWidthCache = {};
var TEXT_CACHE_MAX = 5000;

var Text = function (_Shape) {
  _inherits(Text, _Shape);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Text.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'text';
  };

  Text.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      lineWidth: 0,
      lineCount: 1,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textAlign: 'start',
      textBaseline: 'bottom',
      lineHeight: null,
      textArr: null
    };
  };

  Text.prototype._getFontStyle = function _getFontStyle() {
    var attrs = this._attrs.attrs;
    var fontSize = attrs.fontSize,
        fontFamily = attrs.fontFamily,
        fontWeight = attrs.fontWeight,
        fontStyle = attrs.fontStyle,
        fontVariant = attrs.fontVariant;

    return fontStyle + ' ' + fontVariant + ' ' + fontWeight + ' ' + fontSize + 'px ' + fontFamily;
  };

  Text.prototype._afterAttrsSet = function _afterAttrsSet() {
    var attrs = this._attrs.attrs;
    attrs.font = this._getFontStyle();

    if (attrs.text) {
      var text = attrs.text;
      var textArr = void 0;
      if (Util.isString(text) && text.indexOf('\n') !== -1) {
        textArr = text.split('\n');
        var lineCount = textArr.length;
        attrs.lineCount = lineCount;
        attrs.textArr = textArr;
      }
    }
    this.set('attrs', attrs);
  };

  Text.prototype._getTextHeight = function _getTextHeight() {
    var attrs = this._attrs.attrs;
    var lineCount = attrs.lineCount;
    var fontSize = attrs.fontSize * 1;
    if (lineCount > 1) {
      var spaceingY = this._getSpaceingY();
      return fontSize * lineCount + spaceingY * (lineCount - 1);
    }
    return fontSize;
  };

  Text.prototype._getSpaceingY = function _getSpaceingY() {
    var attrs = this._attrs.attrs;
    var lineHeight = attrs.lineHeight;
    var fontSize = attrs.fontSize * 1;
    return lineHeight ? lineHeight - fontSize : fontSize * 0.14;
  };

  Text.prototype.drawInner = function drawInner(context) {
    var self = this;
    var attrs = self._attrs.attrs;
    var text = attrs.text;
    if (!text) {
      return;
    }
    var textArr = attrs.textArr;
    var fontSize = attrs.fontSize * 1;
    var spaceingY = self._getSpaceingY();
    var x = attrs.x;
    var y = attrs.y;

    if (attrs.rotate) {
      // ????????????
      context.translate(x, y);
      context.rotate(attrs.rotate);
      x = 0;
      y = 0;
    }

    var textBaseline = attrs.textBaseline;
    var height = void 0;
    if (textArr) {
      height = self._getTextHeight();
    }
    var subY = void 0;

    // context.beginPath();
    if (self.hasFill()) {
      var fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
      }
      if (textArr) {
        for (var i = 0, len = textArr.length; i < len; i++) {
          var subText = textArr[i];
          subY = y + i * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') {
            subY += height - fontSize - (height - fontSize) / 2;
          }
          if (textBaseline === 'top') {
            subY += height - fontSize;
          }
          context.fillText(subText, x, subY);
        }
      } else {
        context.fillText(text, x, y);
      }
    }

    if (self.hasStroke()) {
      if (textArr) {
        for (var _i = 0, _len = textArr.length; _i < _len; _i++) {
          var _subText = textArr[_i];
          subY = y + _i * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') {
            subY += height - fontSize - (height - fontSize) / 2;
          }
          if (textBaseline === 'top') {
            subY += height - fontSize;
          }
          context.strokeText(_subText, x, subY);
        }
      } else {
        context.strokeText(text, x, y);
      }
    }
  };

  Text.prototype.calculateBox = function calculateBox() {
    var self = this;
    var attrs = self._attrs.attrs;
    var x = attrs.x,
        y = attrs.y,
        textAlign = attrs.textAlign,
        textBaseline = attrs.textBaseline;

    var width = self._getTextWidth(); // attrs.width
    if (!width) {
      // ??????width??????????????????????????????
      return {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      };
    }
    var height = self._getTextHeight(); // attrs.height
    var point = {
      x: x,
      y: y - height
    }; // default textAlign: start, textBaseline: bottom

    if (textAlign) {
      if (textAlign === 'end' || textAlign === 'right') {
        point.x -= width;
      } else if (textAlign === 'center') {
        point.x -= width / 2;
      }
    }

    if (textBaseline) {
      if (textBaseline === 'top') {
        point.y += height;
      } else if (textBaseline === 'middle') {
        point.y += height / 2;
      }
    }

    return {
      minX: point.x,
      minY: point.y,
      maxX: point.x + width,
      maxY: point.y + height
    };
  };

  Text.prototype._getTextWidth = function _getTextWidth() {
    var attrs = this._attrs.attrs;
    var text = attrs.text;
    var context = this.get('context');

    if (Util.isNil(text)) return undefined;

    var font = attrs.font;
    var textArr = attrs.textArr;
    var key = text + '' + font;
    if (textWidthCache[key]) {
      return textWidthCache[key];
    }

    var width = 0;
    if (textArr) {
      for (var i = 0, length = textArr.length; i < length; i++) {
        var subText = textArr[i];
        width = Math.max(width, Util.measureText(subText, font, context).width);
      }
    } else {
      width = Util.measureText(text, font, context).width;
    }

    if (textWidthCacheCounter > TEXT_CACHE_MAX) {
      textWidthCacheCounter = 0;
      textWidthCache = {};
    }
    textWidthCacheCounter++;
    textWidthCache[key] = width;

    return width;
  };

  return Text;
}(Shape);

Shape.Text = Text;
module.exports = Text;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = __webpack_require__(2);

var Custom = function (_Shape) {
  _inherits(Custom, _Shape);

  function Custom() {
    _classCallCheck(this, Custom);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Custom.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.createPath = null;
    this._attrs.type = 'custom';
  };

  Custom.prototype.createPath = function createPath(context) {
    var createPath = this.get('createPath');
    createPath && createPath.call(this, context);
  };

  Custom.prototype.calculateBox = function calculateBox() {
    var calculateBox = this.get('calculateBox');
    return calculateBox && calculateBox.call(this);
  };

  return Custom;
}(Shape);

Shape.Custom = Custom;
module.exports = Custom;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Path = __webpack_require__(25);
var Geom = __webpack_require__(4);

__webpack_require__(20);

var Line = function (_Path) {
  _inherits(Line, _Path);

  function Line() {
    _classCallCheck(this, Line);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  /**
   * ???????????????????????????
   * @protected
   * @return {Object} ????????????
   */
  Line.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Path.prototype.getDefaultCfg.call(this);
    cfg.type = 'line';
    cfg.sortable = true;
    return cfg;
  };

  return Line;
}(Path);

Geom.Line = Line;
module.exports = Line;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Geom = __webpack_require__(4);
var Util = __webpack_require__(0);
var SizeMixin = __webpack_require__(26);
__webpack_require__(60);

var Interval = function (_Geom) {
  _inherits(Interval, _Geom);

  /**
   * ???????????????????????????
   * @protected
   * @return {Object} ????????????
   */
  Interval.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'interval';
    cfg.shapeType = 'interval';
    cfg.generatePoints = true;
    return cfg;
  };

  function Interval(cfg) {
    _classCallCheck(this, Interval);

    var _this = _possibleConstructorReturn(this, _Geom.call(this, cfg));

    Util.mix(_this, SizeMixin);
    return _this;
  }

  Interval.prototype.createShapePointsCfg = function createShapePointsCfg(obj) {
    var cfg = _Geom.prototype.createShapePointsCfg.call(this, obj);
    cfg.size = this.getNormalizedSize(obj);
    return cfg;
  };

  Interval.prototype.clearInner = function clearInner() {
    _Geom.prototype.clearInner.call(this);
    this.set('defaultSize', null);
  };

  return Interval;
}(Geom);

Geom.Interval = Interval;

module.exports = Interval;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Shape = __webpack_require__(5);
var Vector2 = __webpack_require__(3);
var Global = __webpack_require__(1);

function getRectPoints(cfg) {
  var x = cfg.x,
      y = cfg.y,
      y0 = cfg.y0,
      size = cfg.size;

  // ???3????????????
  // 1. y???x???????????????
  // 2. y????????????x??????
  // 3. x????????????y??????

  var ymin = y0;
  var ymax = y;
  if (Util.isArray(y)) {
    ymax = y[1];
    ymin = y[0];
  }

  var xmin = void 0;
  var xmax = void 0;
  if (Util.isArray(x)) {
    xmin = x[0];
    xmax = x[1];
  } else {
    xmin = x - size / 2;
    xmax = x + size / 2;
  }

  return [{ x: xmin, y: ymin }, { x: xmin, y: ymax }, { x: xmax, y: ymax }, { x: xmax, y: ymin }];
}

function getRectRange(points) {
  var xValues = [];
  var yValues = [];
  for (var i = 0, len = points.length; i < len; i++) {
    var point = points[i];
    xValues.push(point.x);
    yValues.push(point.y);
  }
  var xMin = Math.min.apply(null, xValues);
  var yMin = Math.min.apply(null, yValues);
  var xMax = Math.max.apply(null, xValues);
  var yMax = Math.max.apply(null, yValues);

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin
  };
}

var Interval = Shape.registerFactory('interval', {
  defaultShapeType: 'rect',
  getDefaultPoints: function getDefaultPoints(cfg) {
    return getRectPoints(cfg);
  }
});

Shape.registerShape('interval', 'rect', {
  draw: function draw(cfg, container) {
    var points = this.parsePoints(cfg.points);
    var style = Util.mix({
      fill: cfg.color
    }, Global.shape.interval, cfg.style);
    if (cfg.isInCircle) {
      var newPoints = points.slice(0);
      if (this._coord.transposed) {
        newPoints = [points[0], points[3], points[2], points[1]];
      }

      var _cfg$center = cfg.center,
          x = _cfg$center.x,
          y = _cfg$center.y;

      var v = [1, 0];
      var v0 = [newPoints[0].x - x, newPoints[0].y - y];
      var v1 = [newPoints[1].x - x, newPoints[1].y - y];
      var v2 = [newPoints[2].x - x, newPoints[2].y - y];

      var startAngle = Vector2.angleTo(v, v1);
      var endAngle = Vector2.angleTo(v, v2);
      var r0 = Vector2.length(v0);
      var r = Vector2.length(v1);

      if (startAngle >= 1.5 * Math.PI) {
        startAngle = startAngle - 2 * Math.PI;
      }

      if (endAngle >= 1.5 * Math.PI) {
        endAngle = endAngle - 2 * Math.PI;
      }

      return container.addShape('Sector', {
        className: 'interval',
        attrs: Util.mix({
          x: x,
          y: y,
          r: r,
          r0: r0,
          startAngle: startAngle,
          endAngle: endAngle
        }, style)
      });
    }

    var rectCfg = getRectRange(points);

    return container.addShape('rect', {
      className: 'interval',
      attrs: Util.mix(rectCfg, style)
    });
  }
});

module.exports = Interval;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var Adjust = __webpack_require__(11);

__webpack_require__(62);
__webpack_require__(63);

module.exports = Adjust;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview ????????????
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);
var Adjust = __webpack_require__(11);
var Global = __webpack_require__(1);

var Dodge = function (_Adjust) {
  _inherits(Dodge, _Adjust);

  function Dodge() {
    _classCallCheck(this, Dodge);

    return _possibleConstructorReturn(this, _Adjust.apply(this, arguments));
  }

  Dodge.prototype._initDefaultCfg = function _initDefaultCfg() {
    /**
     * ???????????????,2??????????????????
     * @type {Number}
     */
    this.marginRatio = Global.widthRatio.dodgeMargin;
    /**
     * ??????????????????????????????,????????????2?????????????????? 1/2
     * @type {Number}
     */
    this.dodgeRatio = Global.widthRatio.column;
  };

  Dodge.prototype.getDodgeOffset = function getDodgeOffset(range, index, count) {
    var self = this;
    var pre = range.pre;
    var next = range.next;
    var tickLength = next - pre;
    var width = tickLength * self.dodgeRatio / count;
    var margin = self.marginRatio * width;
    var offset = 1 / 2 * (tickLength - count * width - (count - 1) * margin) + ((index + 1) * width + index * margin) - 1 / 2 * width - 1 / 2 * tickLength;
    return (pre + next) / 2 + offset;
  };

  Dodge.prototype.processAdjust = function processAdjust(dataArray) {
    var self = this;
    var count = dataArray.length;
    var xField = self.xField;
    Util.each(dataArray, function (data, index) {
      for (var i = 0, len = data.length; i < len; i++) {
        var obj = data[i];
        var value = obj[xField];
        var range = {
          pre: value - 0.5,
          next: value + 0.5
        };
        var dodgeValue = self.getDodgeOffset(range, index, count);
        obj[xField] = dodgeValue;
      }
    });
  };

  return Dodge;
}(Adjust);

Adjust.Dodge = Dodge;
module.exports = Dodge;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview Stack data
 * @author dxq613@gmail.com
 */

var Util = __webpack_require__(0);
var Adjust = __webpack_require__(11);

var Stack = function (_Adjust) {
  _inherits(Stack, _Adjust);

  function Stack() {
    _classCallCheck(this, Stack);

    return _possibleConstructorReturn(this, _Adjust.apply(this, arguments));
  }

  Stack.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.xField = null;
    this.yField = null;
  };

  Stack.prototype.processAdjust = function processAdjust(dataArray) {
    var self = this;
    var xField = self.xField;
    var yField = self.yField;
    var count = dataArray.length;
    var stackCache = {
      positive: {},
      negative: {}
    };

    for (var i = 0; i < count; i++) {
      var data = dataArray[i];
      for (var j = 0, len = data.length; j < len; j++) {
        var item = data[j];
        var x = item[xField];
        var y = item[yField];
        var xkey = x.toString();
        y = Util.isArray(y) ? y[1] : y;
        var direction = y >= 0 ? 'positive' : 'negative';
        if (!stackCache[direction][xkey]) {
          stackCache[direction][xkey] = 0;
        }
        item[yField] = [stackCache[direction][xkey], y + stackCache[direction][xkey]];
        stackCache[direction][xkey] += y;
      }
    }
  };

  return Stack;
}(Adjust);

Adjust.Stack = Stack;
module.exports = Stack;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = __webpack_require__(13);
var Vector2 = __webpack_require__(3);
var Matrix = __webpack_require__(14);

var Polar = function (_Base) {
  _inherits(Polar, _Base);

  function Polar() {
    _classCallCheck(this, Polar);

    return _possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  Polar.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'polar';
    this.startAngle = -Math.PI / 2;
    this.endAngle = Math.PI * 3 / 2;
    this.inner = 0;
    this.innerRadius = 0; // alias
    this.isPolar = true;
    this.transposed = false;
    this.center = null;
    this.radius = null; // ????????????
  };

  Polar.prototype.init = function init(start, end) {
    var self = this;
    var inner = self.inner || self.innerRadius;
    var width = Math.abs(end.x - start.x);
    var height = Math.abs(end.y - start.y);

    var maxRadius = void 0;
    var center = void 0;
    if (self.startAngle === -Math.PI && self.endAngle === 0) {
      maxRadius = Math.min(width / 2, height);
      center = {
        x: (start.x + end.x) / 2,
        y: start.y
      };
    } else {
      maxRadius = Math.min(width, height) / 2;
      center = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
      };
    }

    var radius = self.radius; // ????????????
    if (radius > 0 && radius <= 1) {
      maxRadius = maxRadius * radius;
    }

    this.x = {
      start: self.startAngle,
      end: self.endAngle
    };

    this.y = {
      start: maxRadius * inner,
      end: maxRadius
    };
    this.center = center;
    this.circleRadius = maxRadius; // ????????????
  };

  Polar.prototype.convertPoint = function convertPoint(point) {
    var self = this;
    var center = self.center;
    var transposed = self.transposed;
    var xDim = transposed ? 'y' : 'x';
    var yDim = transposed ? 'x' : 'y';

    var x = self.x;
    var y = self.y;

    var angle = x.start + (x.end - x.start) * point[xDim];
    var radius = y.start + (y.end - y.start) * point[yDim];

    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  };

  Polar.prototype.invertPoint = function invertPoint(point) {
    var self = this;
    var center = self.center,
        transposed = self.transposed,
        x = self.x,
        y = self.y;

    var xDim = transposed ? 'y' : 'x';
    var yDim = transposed ? 'x' : 'y';

    var m = [1, 0, 0, 1, 0, 0];
    Matrix.rotate(m, m, x.start);

    var startV = [1, 0];
    Vector2.transformMat2d(startV, startV, m);
    startV = [startV[0], startV[1]];

    var pointV = [point.x - center.x, point.y - center.y];
    if (Vector2.zero(pointV)) {
      return {
        x: 0,
        y: 0
      };
    }

    var theta = Vector2.angleTo(startV, pointV, x.end < x.start);
    if (Math.abs(theta - Math.PI * 2) < 0.001) {
      theta = 0;
    }
    var l = Vector2.length(pointV);
    var percentX = theta / (x.end - x.start);
    percentX = x.end - x.start > 0 ? percentX : -percentX;
    var percentY = (l - y.start) / (y.end - y.start);
    var rst = {};
    rst[xDim] = percentX;
    rst[yDim] = percentY;
    return rst;
  };

  return Polar;
}(Base);

Base.Polar = Polar;
module.exports = Polar;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ??????????????????????????? tooltip ??? legend ??? marker
 * @type {Object}
 */
var Util = __webpack_require__(0);

var _require = __webpack_require__(6),
    Shape = _require.Shape;

var SYMBOLS = {
  // ???
  circle: function circle(x, y, r, ctx) {
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
  },

  // ?????????
  square: function square(x, y, r, ctx) {
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
  }
};

var Marker = function (_Shape) {
  _inherits(Marker, _Shape);

  function Marker() {
    _classCallCheck(this, Marker);

    return _possibleConstructorReturn(this, _Shape.apply(this, arguments));
  }

  Marker.prototype._initProperties = function _initProperties() {
    _Shape.prototype._initProperties.call(this);
    this._attrs.canFill = true;
    this._attrs.canStroke = true;
    this._attrs.type = 'marker';
  };

  Marker.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      lineWidth: 0
    };
  };

  Marker.prototype.createPath = function createPath(context) {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        radius = attrs.radius;

    var symbol = attrs.symbol || 'circle';
    var method = void 0;
    if (Util.isFunction(symbol)) {
      method = symbol;
    } else {
      method = SYMBOLS[symbol];
    }
    context.beginPath();
    method(x, y, radius, context, this);
  };

  Marker.prototype.calculateBox = function calculateBox() {
    var attrs = this.get('attrs');
    var x = attrs.x,
        y = attrs.y,
        radius = attrs.radius;

    return {
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius
    };
  };

  return Marker;
}(Shape);

module.exports = Marker;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);

var _require = __webpack_require__(6),
    Group = _require.Group;

var Marker = __webpack_require__(65);
var MARKER_RADIUS = 3;

var List = function () {
  List.prototype.getDefaultCfg = function getDefaultCfg() {
    return {
      showTitle: false,
      /**
       * ????????????
       * @type {?String}
       */
      title: null,
      /**
       * ??????????????????
       * @type {?Array}
       */
      items: null,
      /**
       * ??????????????????????????????
       * @type {Number}
       */
      titleGap: 12,
      /**
       * ????????????????????????????????????
       * @type {Number}
       */
      itemGap: 10,
      /**
       * ????????????????????????????????????
       * @type {Number}
       */
      itemMarginBottom: 12,
      /**
       * ????????????????????????
       * @type {String}
       */
      unCheckColor: '#bfbfbf',
      /**
       * ????????????????????????
       * @type {[type]}
       */
      itemFormatter: null,
      itemWidth: null,
      /**
       * marker ??????????????????
       * @type {Number}
       */
      wordSpace: 6,
      /**
       * ?????????????????????
       * @type {[type]}
       */
      x: 0,
      /**
       * ?????????????????????
       * @type {[type]}
       */
      y: 0,
      /**
       * ????????????
       * @type {String}
       */
      layout: 'horizontal'
    };
  };

  function List(cfg) {
    _classCallCheck(this, List);

    Util.deepMix(this, this.getDefaultCfg(), cfg);
    this._init();
    this._renderTitle();
    this._renderItems();
  }

  List.prototype._init = function _init() {
    var container = new Group();
    this.container = container;
    var wrapper = container.addGroup();
    this.wrapper = wrapper;
    var itemsGroup = wrapper.addGroup({
      className: 'itemsGroup'
    });
    this.itemsGroup = itemsGroup;

    if (this.parent) {
      // ????????????????????????
      this.parent.add(container);
    }
  };

  List.prototype._renderTitle = function _renderTitle(title) {
    title = title || this.title;

    var titleHeight = 0;
    if (this.showTitle && title) {
      var wrapper = this.wrapper,
          titleStyle = this.titleStyle;

      var titleShape = wrapper.addShape('text', {
        className: 'title',
        attrs: Util.mix({
          x: 0,
          y: 0,
          text: title
        }, titleStyle)
      });
      titleHeight = titleShape.getBBox().height + this.titleGap;
      this.titleShape = titleShape;
    }
    this._titleHeight = titleHeight;
  };

  List.prototype._renderItems = function _renderItems(items) {
    var self = this;
    items = items || self.items;

    if (!items) {
      return;
    }

    if (self.reversed) {
      items.reverse();
    }
    Util.each(items, function (item, index) {
      self._addItem(item, index);
    });
    if (items.length > 1) {
      this._adjustItems();
    }
    this._renderBackground(); // ????????????
  };

  List.prototype._renderBackground = function _renderBackground() {
    var background = this.background;
    if (background) {
      var container = this.container;
      var wrapper = this.wrapper;

      var _wrapper$getBBox = wrapper.getBBox(),
          minX = _wrapper$getBBox.minX,
          minY = _wrapper$getBBox.minY,
          width = _wrapper$getBBox.width,
          height = _wrapper$getBBox.height;

      var padding = background.padding || [0, 0, 0, 0];
      padding = Util.parsePadding(padding);
      var attrs = Util.mix({
        x: minX - padding[3],
        y: minY - padding[0],
        width: width + padding[1] + padding[3],
        height: height + padding[0] + padding[2]
      }, background);
      var backShape = this.backShape;
      if (backShape) {
        backShape.attr(attrs);
      } else {
        backShape = container.addShape('Rect', {
          zIndex: -1,
          attrs: attrs
        });
      }
      this.backShape = backShape;
      container.sort();
    }
  };

  List.prototype._addItem = function _addItem(item) {
    var itemsGroup = this.itemsGroup;
    var itemGroup = itemsGroup.addGroup({
      name: item.name,
      value: item.value, // ???????????????
      dataValue: item.dataValue, // ???????????????????????????????????????
      checked: item.checked
    });
    var unCheckColor = this.unCheckColor,
        nameStyle = this.nameStyle,
        valueStyle = this.valueStyle,
        wordSpace = this.wordSpace;
    var marker = item.marker,
        value = item.value;

    var startX = 0;

    if (marker) {
      // ????????? marker ?????? marker, ????????? { radius, symbol, fill / stroke }
      var radius = marker.radius || MARKER_RADIUS;
      var markerAttrs = Util.mix({
        x: radius,
        y: this._titleHeight
      }, marker);

      if (item.checked === false) {
        if (markerAttrs.fill) {
          markerAttrs.fill = unCheckColor;
        }
        // if (markerAttrs.stroke) {
        //   markerAttrs.stroke = unCheckColor;
        // }
      }

      var markerShape = new Marker({
        className: 'item-marker',
        attrs: markerAttrs
      });
      itemGroup.add(markerShape);
      startX += markerShape.getBBox().width + wordSpace;
    }

    var nameText = void 0;
    var name = item.name;
    if (name) {
      name = value ? name + ': ' : name;
      nameText = itemGroup.addShape('text', {
        className: 'name',
        attrs: Util.mix({
          x: startX,
          y: this._titleHeight,
          text: this._formatItemValue(name)
        }, nameStyle, item.checked === false ? { fill: unCheckColor } : null)
      });
    }

    if (value) {
      var valueX = startX;
      if (nameText) {
        valueX += nameText.getBBox().width;
      }

      itemGroup.addShape('text', {
        className: 'value',
        attrs: Util.mix({
          x: valueX,
          y: this._titleHeight,
          text: value
        }, valueStyle, item.checked === false ? { fill: unCheckColor } : null)
      });
    }
    return itemGroup;
  };

  List.prototype._formatItemValue = function _formatItemValue(value) {
    var formatter = this.itemFormatter;
    if (formatter) {
      value = formatter.call(this, value);
    }
    return value;
  };

  List.prototype._getMaxItemWidth = function _getMaxItemWidth() {
    var width = void 0;
    var itemWidth = this.itemWidth;

    if (Util.isNumber(itemWidth) || Util.isNil(itemWidth)) {
      return itemWidth;
    }
    // ???????????????????????????
    if (itemWidth === 'auto') {
      var itemsGroup = this.itemsGroup;
      var children = itemsGroup.get('children');
      var count = children.length;
      var maxItemWidth = 0;
      for (var i = 0; i < count; i++) {
        var _children$i$getBBox = children[i].getBBox(),
            _width = _children$i$getBBox.width;

        maxItemWidth = Math.max(maxItemWidth, _width);
      }
      var maxLength = this.maxLength;
      var itemGap = this.itemGap;
      var twoAvgWidth = (maxLength - itemGap) / 2;
      var threeAvgWidth = (maxLength - itemGap * 2) / 3;

      if (count === 2) {
        width = Math.max(maxItemWidth, twoAvgWidth);
      } else {
        // 1. max <= 3Avg, 3Avg
        // 2. 3Avg < max && max < 2avg, 2avg
        // 3. max > 2avg, max, ????????????
        if (maxItemWidth <= threeAvgWidth) {
          width = threeAvgWidth;
        } else if (maxItemWidth <= twoAvgWidth) {
          width = twoAvgWidth;
        } else {
          width = maxItemWidth;
        }
      }
      return width;
    }
  };

  List.prototype._adjustHorizontal = function _adjustHorizontal() {
    var maxLength = this.maxLength,
        itemsGroup = this.itemsGroup;


    var children = itemsGroup.get('children');
    var itemGap = this.itemGap,
        itemMarginBottom = this.itemMarginBottom;

    var titleHeight = this._titleHeight;

    var row = 0;
    var rowWidth = 0;
    var width = void 0;
    var height = void 0;
    var itemWidth = this._getMaxItemWidth();
    var legendHitBoxes = [];
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      var box = child.getBBox();
      var childHeight = box.height;
      var childWidth = box.width;
      width = itemWidth || childWidth;
      height = childHeight + itemMarginBottom;

      if (width - (maxLength - rowWidth) > 0.0001) {
        row++;
        rowWidth = 0;
      }

      child.moveTo(rowWidth, row * height);
      legendHitBoxes.push({
        x: rowWidth,
        y: row * height + titleHeight - childHeight / 2,
        width: childWidth * 1.375,
        height: childHeight * 1.375
      });
      rowWidth += width + itemGap;
    }
    this.legendHitBoxes = legendHitBoxes;
    return;
  };

  List.prototype._adjustVertical = function _adjustVertical() {
    var maxLength = this.maxLength,
        itemsGroup = this.itemsGroup; // ?????????????????? maxLength ?????????????????????

    var itemGap = this.itemGap,
        itemMarginBottom = this.itemMarginBottom,
        itemWidth = this.itemWidth;

    var titleHeight = this._titleHeight;
    var children = itemsGroup.get('children');

    var colHeight = 0;
    var width = void 0;
    var height = void 0;
    var maxItemWidth = 0;
    var totalWidth = 0;
    var legendHitBoxes = [];

    for (var i = 0, length = children.length; i < length; i++) {
      var child = children[i];
      var bbox = child.getBBox();
      width = bbox.width;
      height = bbox.height;

      if (Util.isNumber(itemWidth)) {
        maxItemWidth = itemWidth + itemGap;
      } else if (width > maxItemWidth) {
        maxItemWidth = width + itemGap;
      }

      if (maxLength - colHeight < height) {
        colHeight = 0;
        totalWidth += maxItemWidth;
        child.moveTo(totalWidth, 0);
        legendHitBoxes.push({
          x: totalWidth,
          y: titleHeight - height / 2,
          width: width * 1.375,
          height: height * 1.375
        });
      } else {
        child.moveTo(totalWidth, colHeight);
        legendHitBoxes.push({
          x: totalWidth,
          y: colHeight - height / 2 + titleHeight,
          width: width * 1.375,
          height: height * 1.375
        });
      }

      colHeight += height + itemMarginBottom;
    }
    this.legendHitBoxes = legendHitBoxes;
    return;
  };

  List.prototype._adjustItems = function _adjustItems() {
    var layout = this.layout;
    if (layout === 'horizontal') {
      this._adjustHorizontal();
    } else {
      this._adjustVertical();
    }
  };

  List.prototype.moveTo = function moveTo(x, y) {
    this.x = x;
    this.y = y;
    var container = this.container;
    container && container.moveTo(x, y);
    return this;
  };

  List.prototype.setItems = function setItems(items) {
    this.clearItems();
    this._renderItems(items);
  };

  List.prototype.setTitle = function setTitle(title) {
    var titleShape = this.titleShape;
    if (titleShape) {
      titleShape.attr('text', title);
    } else {
      this._renderTitle(title);
    }
  };

  List.prototype.clearItems = function clearItems() {
    var itemsGroup = this.itemsGroup;
    itemsGroup.clear();
  };

  List.prototype.getWidth = function getWidth() {
    var container = this.container;
    var bbox = container.getBBox();
    return bbox.width;
  };

  List.prototype.getHeight = function getHeight() {
    var container = this.container;
    var bbox = container.getBBox();
    return bbox.height;
  };

  List.prototype.show = function show() {
    var container = this.container;
    container.show();
  };

  List.prototype.hide = function hide() {
    var container = this.container;
    container.hide();
  };

  List.prototype.clear = function clear() {
    var container = this.container;
    container.clear();
    container.remove(true);
  };

  return List;
}();

module.exports = List;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Geom = __webpack_require__(4);
__webpack_require__(68);

var Point = function (_Geom) {
  _inherits(Point, _Geom);

  function Point() {
    _classCallCheck(this, Point);

    return _possibleConstructorReturn(this, _Geom.apply(this, arguments));
  }

  Point.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'point';
    cfg.shapeType = 'point';
    cfg.generatePoints = true;
    return cfg;
  };

  Point.prototype.draw = function draw(data, shapeFactory) {
    var self = this;
    var container = self.get('container');
    Util.each(data, function (obj) {
      var shape = obj.shape;
      var cfg = self.getDrawCfg(obj);
      if (Util.isArray(obj.y)) {
        var hasStack = self.hasAdjust('stack'); // ?????????????????? stack ??????
        Util.each(obj.y, function (y, idx) {
          cfg.y = y;
          if (!hasStack || idx !== 0) {
            self.drawShape(shape, obj, cfg, container, shapeFactory);
          }
        });
      } else if (!Util.isNil(obj.y)) {
        self.drawShape(shape, obj, cfg, container, shapeFactory);
      }
    });
  };

  return Point;
}(Geom);

Geom.Point = Point;

module.exports = Point;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Global = __webpack_require__(1);
var ShapeUtil = __webpack_require__(12);
var Shape = __webpack_require__(5);
var SHAPES = ['circle', 'hollowCircle', 'rect'];

var Point = Shape.registerFactory('point', {
  defaultShapeType: 'circle',
  getDefaultPoints: function getDefaultPoints(pointInfo) {
    return ShapeUtil.splitPoints(pointInfo);
  }
});

function getPointsCfg(cfg) {
  var style = {
    lineWidth: 0,
    stroke: cfg.color,
    fill: cfg.color
  };
  if (cfg.size) {
    style.size = cfg.size;
  }

  Util.mix(style, cfg.style);
  return Util.mix({}, Global.shape.point, style);
}

function drawShape(cfg, container, shape) {
  if (cfg.size === 0) return;
  var pointCfg = getPointsCfg(cfg);
  var size = pointCfg.r || pointCfg.size;
  var x = cfg.x;
  var y = !Util.isArray(cfg.y) ? [cfg.y] : cfg.y;
  if (shape === 'hollowCircle') {
    pointCfg.lineWidth = 1;
    pointCfg.fill = null;
  }
  for (var i = 0, len = y.length; i < len; i++) {
    if (shape === 'rect') {
      return container.addShape('Rect', {
        className: 'point',
        attrs: Util.mix({
          x: x - size,
          y: y[i] - size,
          width: size * 2,
          height: size * 2
        }, pointCfg)
      });
    }

    return container.addShape('Circle', {
      className: 'point',
      attrs: Util.mix({
        x: x,
        y: y[i],
        r: size
      }, pointCfg)
    });
  }
}

Util.each(SHAPES, function (shapeType) {
  Shape.registerShape('point', shapeType, {
    draw: function draw(cfg, container) {
      return drawShape(cfg, container, shapeType);
    }
  });
});

module.exports = Point;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview ?????????
 * @author dxq613 @gmail.com
 * @author sima.zhang1990@gmail.com
 */

var Geom = __webpack_require__(4);
var ShapeUtil = __webpack_require__(12);
var Util = __webpack_require__(0);
__webpack_require__(70);

var Area = function (_Geom) {
  _inherits(Area, _Geom);

  function Area() {
    _classCallCheck(this, Area);

    return _possibleConstructorReturn(this, _Geom.apply(this, arguments));
  }

  /**
   * ???????????????????????????
   * @protected
   * @return {Object} ????????????
   */
  Area.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'area';
    cfg.shapeType = 'area';
    cfg.generatePoints = true;
    cfg.sortable = true;
    return cfg;
  };

  Area.prototype.draw = function draw(data, shapeFactory) {
    var self = this;
    var container = self.get('container');
    var cfg = this.getDrawCfg(data[0]);
    var yScale = self.getYScale();
    var splitArray = ShapeUtil.splitArray(data, yScale.field);
    cfg.origin = data; // path,line,area ?????????origin ???????????????
    Util.each(splitArray, function (subData, splitedIndex) {
      cfg.splitedIndex = splitedIndex; // ???????????????????????? ????????????id
      var points = subData.map(function (obj) {
        return obj.points;
      });
      cfg.points = points;
      self.drawShape(cfg.shape, data[0], cfg, container, shapeFactory);
    });
  };

  return Area;
}(Geom);

Geom.Area = Area;

module.exports = Area;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var Util = __webpack_require__(0);
var Shape = __webpack_require__(5);
var Smooth = __webpack_require__(23);
var Global = __webpack_require__(1);

// ????????????
function equals(v1, v2) {
  return Math.abs(v1 - v2) < 0.00001;
}

// ????????????????????????
function equalsCenter(points, center) {
  var eqls = true;
  Util.each(points, function (point) {
    if (!equals(point.x, center.x) || !equals(point.y, center.y)) {
      eqls = false;
      return false;
    }
  });
  return eqls;
}

function drawCircleArea(topPoints, bottomPoints, container, style, isSmooth) {
  var shape = container.addShape('Polyline', {
    className: 'area',
    attrs: Util.mix({
      points: topPoints,
      smooth: isSmooth
    }, style)
  });
  if (bottomPoints.length) {
    var bottomShape = container.addShape('Polyline', {
      className: 'area',
      attrs: Util.mix({
        points: bottomPoints,
        smooth: isSmooth
      }, style)
    });
    return [shape, bottomShape];
  }
  return shape;
}

function drawRectShape(topPoints, bottomPoints, container, style, isSmooth) {
  var shape = void 0;
  if (isSmooth) {
    shape = container.addShape('Custom', {
      className: 'area',
      attrs: Util.mix({
        points: topPoints.concat(bottomPoints)
      }, style),
      createPath: function createPath(context) {
        var constaint = [// ??????
        [0, 0], [1, 1]];
        var points = this._attrs.attrs.points;
        var topSps = Smooth.smooth(points.slice(0, points.length / 2), false, constaint);
        var bottomSps = Smooth.smooth(points.slice(points.length / 2, points.length), false, constaint);

        context.beginPath();
        context.moveTo(topPoints[0].x, topPoints[0].y);
        for (var i = 0, n = topSps.length; i < n; i++) {
          var sp = topSps[i];
          context.bezierCurveTo(sp[1], sp[2], sp[3], sp[4], sp[5], sp[6]);
        }
        context.lineTo(bottomPoints[0].x, bottomPoints[0].y);
        for (var _i = 0, _n = bottomSps.length; _i < _n; _i++) {
          var _sp = bottomSps[_i];
          context.bezierCurveTo(_sp[1], _sp[2], _sp[3], _sp[4], _sp[5], _sp[6]);
        }
        context.closePath();
      }
    });
  } else {
    topPoints = topPoints.concat(bottomPoints);
    shape = container.addShape('Polyline', {
      className: 'area',
      attrs: Util.mix({
        points: topPoints
      }, style)
    });
  }
  return shape;
}

function drawShape(cfg, container, isSmooth) {
  var self = this;
  var points = cfg.points;
  var topPoints = []; // ?????????????????????
  var bottomPoints = []; // ?????????????????????
  Util.each(points, function (point) {
    bottomPoints.push(point[0]);
    topPoints.push(point[1]);
  });
  var style = Util.mix({
    fillStyle: cfg.color
  }, Global.shape.area, cfg.style);
  bottomPoints.reverse(); // ??????
  topPoints = self.parsePoints(topPoints);
  bottomPoints = self.parsePoints(bottomPoints);
  if (cfg.isInCircle) {
    if (equalsCenter(bottomPoints, cfg.center)) {
      // ???????????????????????????????????????
      bottomPoints = [];
    }
    return drawCircleArea(topPoints, bottomPoints, container, style, isSmooth);
  }

  return drawRectShape(topPoints, bottomPoints, container, style, isSmooth);
}

var Area = Shape.registerFactory('area', {
  defaultShapeType: 'area',
  // ?????????????????????????????????????????????, ???????????????x????????????y?????????
  getDefaultPoints: function getDefaultPoints(obj) {
    var x = obj.x;
    var y = obj.y;
    var y0 = obj.y0; // ?????????
    y = Util.isArray(y) ? y : [y0, y];

    var points = [];
    points.push({
      x: x,
      y: y[0]
    }, {
      x: x,
      y: y[1]
    });
    return points;
  }
});

var SHAPES = ['area', 'smooth'];
Util.each(SHAPES, function (shapeType) {
  Shape.registerShape('area', shapeType, {
    draw: function draw(cfg, container) {
      var smooth = shapeType === 'smooth';
      return drawShape.call(this, cfg, container, smooth);
    }
  });
});

module.exports = Area;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var Abstract = __webpack_require__(15);

var Circle = function (_Abstract) {
  _inherits(Circle, _Abstract);

  function Circle() {
    _classCallCheck(this, Circle);

    return _possibleConstructorReturn(this, _Abstract.apply(this, arguments));
  }

  Circle.prototype._initDefaultCfg = function _initDefaultCfg() {
    _Abstract.prototype._initDefaultCfg.call(this);
    this.startAngle = -Math.PI / 2; // ?????????????????????
    this.endAngle = Math.PI * 3 / 2; // ?????????????????????
    this.radius = null; // ??????
    this.center = null; // ??????
  };

  // ????????????????????????


  Circle.prototype.getOffsetPoint = function getOffsetPoint(value) {
    var startAngle = this.startAngle,
        endAngle = this.endAngle;

    var angle = startAngle + (endAngle - startAngle) * value;
    return this._getCirclePoint(angle);
  };

  // ??????????????????


  Circle.prototype._getCirclePoint = function _getCirclePoint(angle, radius) {
    var self = this;
    var center = self.center;
    radius = radius || self.radius;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  };

  Circle.prototype.getTextAlignInfo = function getTextAlignInfo(point, offset) {
    var self = this;
    var offsetVector = self.getOffsetVector(point, offset);
    var align = void 0;
    var baseLine = 'middle';
    if (offsetVector[0] > 0) {
      align = 'left';
    } else if (offsetVector[0] < 0) {
      align = 'right';
    } else {
      align = 'center';
      if (offsetVector[1] > 0) {
        baseLine = 'top';
      } else if (offsetVector[1] < 0) {
        baseLine = 'bottom';
      }
    }
    return {
      textAlign: align,
      textBaseline: baseLine
    };
  };

  // ????????????????????????????????????????????????????????????


  Circle.prototype.getAxisVector = function getAxisVector(point) {
    var center = this.center;
    var factor = this.offsetFactor;
    return [(point.y - center.y) * factor, (point.x - center.x) * -1 * factor];
  };

  Circle.prototype.drawLine = function drawLine(lineCfg) {
    var center = this.center,
        radius = this.radius,
        startAngle = this.startAngle,
        endAngle = this.endAngle;

    var container = this.getContainer(lineCfg.top);
    container.addShape('arc', {
      className: 'axis-line',
      attrs: Util.mix({
        x: center.x,
        y: center.y,
        r: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }, lineCfg)
    });
  };

  return Circle;
}(Abstract);

Abstract.Circle = Circle;
module.exports = Circle;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview ??????????????????????????????
 * @author dxq613@gmail.com
 */
var Base = __webpack_require__(8);
var Category = __webpack_require__(21);
var Util = __webpack_require__(0);
var fecha = __webpack_require__(73);
var catAuto = __webpack_require__(22);

/**
 * ?????????????????????
 * @class Scale.TimeCategory
 */

var TimeCategory = function (_Category) {
  _inherits(TimeCategory, _Category);

  function TimeCategory() {
    _classCallCheck(this, TimeCategory);

    return _possibleConstructorReturn(this, _Category.apply(this, arguments));
  }

  TimeCategory.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'timeCat';
    /**
     * ???????????????????????????????????????
     * @type {Boolean}
     */
    this.sortable = true;
    this.tickCount = 5;
    /**
     * ???????????????
     * @type {String}
     */
    this.mask = 'YYYY-MM-DD';
    /**
     * ???????????????
     * @type {Array}
     */
    this.range = [0, 1];
    /**
     * ???????????????
     * @type {Array}
     */
    this.ticks = null;
    /**
     * ????????????????????????????????????
     * @type {Array}
     */
    this.values = [];
    /**
     * ??????????????????
     * @type {Boolean}
     */
    this.isCategory = true;
  };

  TimeCategory.prototype.init = function init() {
    var self = this;
    var values = this.values;
    // ???????????????????????????????????????????????????????????????
    Util.each(values, function (v, i) {
      values[i] = self._toTimeStamp(v);
    });
    if (this.sortable) {
      values.sort(function (v1, v2) {
        return v1 - v2;
      });
    }

    if (!self.ticks) {
      self.ticks = this.calculateTicks(false);
    }
  };

  /**
   * ?????? ticks
   * @return {array} ?????? ticks ??????
   */


  TimeCategory.prototype.calculateTicks = function calculateTicks() /* formated */{
    var self = this;
    var count = self.tickCount;
    var temp = catAuto({
      maxCount: count,
      data: self.values
    });

    var ticks = temp.ticks;
    // if (formated) {
    //   Util.each(ticks, function(value, index) {
    //     ticks[index] = fecha.format(value, self.mask);
    //   });
    // }
    return ticks;
  };

  /**
   * @override
   */


  TimeCategory.prototype.translate = function translate(value) {
    value = this._toTimeStamp(value);
    var index = this.values.indexOf(value);

    if (index === -1) {
      if (Util.isNumber(value) && value < this.values.length) {
        index = value;
      } else {
        index = NaN;
      }
    }
    return index;
  };

  /**
   * @override
   */


  TimeCategory.prototype.scale = function scale(value) {
    var rangeMin = this.rangeMin();
    var rangeMax = this.rangeMax();
    var index = this.translate(value);
    var percent = void 0;

    if (this.values.length === 1) {
      percent = index;
    } else if (index > -1) {
      percent = index / (this.values.length - 1);
    } else {
      percent = 0;
    }

    return rangeMin + percent * (rangeMax - rangeMin);
  };

  /**
   * @override
   */


  TimeCategory.prototype.getText = function getText(value) {
    var result = '';
    var index = this.translate(value);
    if (index > -1) {
      result = this.values[index];
    } else {
      result = value;
    }

    var formatter = this.formatter;
    result = parseInt(result, 10);
    result = formatter ? formatter(result) : fecha.format(result, this.mask);
    return result;
  };

  /**
   * @override
   */


  TimeCategory.prototype.getTicks = function getTicks() {
    var self = this;
    var ticks = this.ticks;
    var rst = [];
    Util.each(ticks, function (tick) {
      var obj = void 0;
      if (Util.isObject(tick)) {
        obj = tick;
      } else {
        obj = {
          text: Util.isString(tick) ? tick : self.getText(tick),
          value: self.scale(tick)
        };
      }
      rst.push(obj);
    });
    return rst;
  };

  // ???????????????????????????


  TimeCategory.prototype._toTimeStamp = function _toTimeStamp(value) {
    if (Util.isString(value)) {
      if (value.indexOf('T') > 0) {
        value = new Date(value).getTime();
      } else {
        value = new Date(value.replace(/-/ig, '/')).getTime();
      }
    }
    if (Util.isDate(value)) {
      value = value.getTime();
    }
    return value;
  };

  return TimeCategory;
}(Category);

Base.TimeCat = TimeCategory;
module.exports = TimeCategory;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;(function (main) {
  'use strict';

  /**
   * Parse or format dates
   * @class fecha
   */

  var fecha = {};
  var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
  var twoDigits = /\d\d?/;
  var threeDigits = /\d{3}/;
  var fourDigits = /\d{4}/;
  var word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
  var literal = /\[([^]*?)\]/gm;
  var noop = function noop() {};

  function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
  }

  function monthUpdate(arrName) {
    return function (d, v, i18n) {
      var index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
      if (~index) {
        d.month = index;
      }
    };
  }

  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }

  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthNamesShort = shorten(monthNames, 3);
  var dayNamesShort = shorten(dayNames, 3);
  fecha.i18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: ['am', 'pm'],
    DoFn: function DoFn(D) {
      return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
    }
  };

  var formatFlags = {
    D: function D(dateObj) {
      return dateObj.getDate();
    },
    DD: function DD(dateObj) {
      return pad(dateObj.getDate());
    },
    Do: function Do(dateObj, i18n) {
      return i18n.DoFn(dateObj.getDate());
    },
    d: function d(dateObj) {
      return dateObj.getDay();
    },
    dd: function dd(dateObj) {
      return pad(dateObj.getDay());
    },
    ddd: function ddd(dateObj, i18n) {
      return i18n.dayNamesShort[dateObj.getDay()];
    },
    dddd: function dddd(dateObj, i18n) {
      return i18n.dayNames[dateObj.getDay()];
    },
    M: function M(dateObj) {
      return dateObj.getMonth() + 1;
    },
    MM: function MM(dateObj) {
      return pad(dateObj.getMonth() + 1);
    },
    MMM: function MMM(dateObj, i18n) {
      return i18n.monthNamesShort[dateObj.getMonth()];
    },
    MMMM: function MMMM(dateObj, i18n) {
      return i18n.monthNames[dateObj.getMonth()];
    },
    YY: function YY(dateObj) {
      return String(dateObj.getFullYear()).substr(2);
    },
    YYYY: function YYYY(dateObj) {
      return pad(dateObj.getFullYear(), 4);
    },
    h: function h(dateObj) {
      return dateObj.getHours() % 12 || 12;
    },
    hh: function hh(dateObj) {
      return pad(dateObj.getHours() % 12 || 12);
    },
    H: function H(dateObj) {
      return dateObj.getHours();
    },
    HH: function HH(dateObj) {
      return pad(dateObj.getHours());
    },
    m: function m(dateObj) {
      return dateObj.getMinutes();
    },
    mm: function mm(dateObj) {
      return pad(dateObj.getMinutes());
    },
    s: function s(dateObj) {
      return dateObj.getSeconds();
    },
    ss: function ss(dateObj) {
      return pad(dateObj.getSeconds());
    },
    S: function S(dateObj) {
      return Math.round(dateObj.getMilliseconds() / 100);
    },
    SS: function SS(dateObj) {
      return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
    },
    SSS: function SSS(dateObj) {
      return pad(dateObj.getMilliseconds(), 3);
    },
    a: function a(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
    },
    A: function A(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
    },
    ZZ: function ZZ(dateObj) {
      var o = dateObj.getTimezoneOffset();
      return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
    }
  };

  var parseFlags = {
    D: [twoDigits, function (d, v) {
      d.day = v;
    }],
    Do: [new RegExp(twoDigits.source + word.source), function (d, v) {
      d.day = parseInt(v, 10);
    }],
    M: [twoDigits, function (d, v) {
      d.month = v - 1;
    }],
    YY: [twoDigits, function (d, v) {
      var da = new Date(),
          cent = +('' + da.getFullYear()).substr(0, 2);
      d.year = '' + (v > 68 ? cent - 1 : cent) + v;
    }],
    h: [twoDigits, function (d, v) {
      d.hour = v;
    }],
    m: [twoDigits, function (d, v) {
      d.minute = v;
    }],
    s: [twoDigits, function (d, v) {
      d.second = v;
    }],
    YYYY: [fourDigits, function (d, v) {
      d.year = v;
    }],
    S: [/\d/, function (d, v) {
      d.millisecond = v * 100;
    }],
    SS: [/\d{2}/, function (d, v) {
      d.millisecond = v * 10;
    }],
    SSS: [threeDigits, function (d, v) {
      d.millisecond = v;
    }],
    d: [twoDigits, noop],
    ddd: [word, noop],
    MMM: [word, monthUpdate('monthNamesShort')],
    MMMM: [word, monthUpdate('monthNames')],
    a: [word, function (d, v, i18n) {
      var val = v.toLowerCase();
      if (val === i18n.amPm[0]) {
        d.isPm = false;
      } else if (val === i18n.amPm[1]) {
        d.isPm = true;
      }
    }],
    ZZ: [/([\+\-]\d\d:?\d\d|Z)/, function (d, v) {
      if (v === 'Z') v = '+00:00';
      var parts = (v + '').match(/([\+\-]|\d\d)/gi),
          minutes;

      if (parts) {
        minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
      }
    }]
  };
  parseFlags.dd = parseFlags.d;
  parseFlags.dddd = parseFlags.ddd;
  parseFlags.DD = parseFlags.D;
  parseFlags.mm = parseFlags.m;
  parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
  parseFlags.MM = parseFlags.M;
  parseFlags.ss = parseFlags.s;
  parseFlags.A = parseFlags.a;

  // Some common format strings
  fecha.masks = {
    default: 'ddd MMM DD YYYY HH:mm:ss',
    shortDate: 'M/D/YY',
    mediumDate: 'MMM D, YYYY',
    longDate: 'MMMM D, YYYY',
    fullDate: 'dddd, MMMM D, YYYY',
    shortTime: 'HH:mm',
    mediumTime: 'HH:mm:ss',
    longTime: 'HH:mm:ss.SSS'
  };

  /***
   * Format a date
   * @method format
   * @param {Date|number} dateObj
   * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
   */
  fecha.format = function (dateObj, mask, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof dateObj === 'number') {
      dateObj = new Date(dateObj);
    }

    if (Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime())) {
      throw new Error('Invalid Date in fecha.format');
    }

    mask = fecha.masks[mask] || mask || fecha.masks['default'];

    var literals = [];

    // Make literals inactive by replacing them with ??
    mask = mask.replace(literal, function ($0, $1) {
      literals.push($1);
      return '??';
    });
    // Apply formatting rules
    mask = mask.replace(token, function ($0) {
      return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
    });
    // Inline literal values back into the formatted value
    return mask.replace(/\?\?/g, function () {
      return literals.shift();
    });
  };

  /**
   * Parse a date string into an object, changes - into /
   * @method parse
   * @param {string} dateStr Date string
   * @param {string} format Date parse format
   * @returns {Date|boolean}
   */
  fecha.parse = function (dateStr, format, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof format !== 'string') {
      throw new Error('Invalid format in fecha.parse');
    }

    format = fecha.masks[format] || format;

    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
      return false;
    }

    var isValid = true;
    var dateInfo = {};
    format.replace(token, function ($0) {
      if (parseFlags[$0]) {
        var info = parseFlags[$0];
        var index = dateStr.search(info[0]);
        if (!~index) {
          isValid = false;
        } else {
          dateStr.replace(info[0], function (result) {
            info[1](dateInfo, result, i18n);
            dateStr = dateStr.substr(index + result.length);
            return result;
          });
        }
      }

      return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
    });

    if (!isValid) {
      return false;
    }

    var today = new Date();
    if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
      dateInfo.hour = +dateInfo.hour + 12;
    } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
      dateInfo.hour = 0;
    }

    var date;
    if (dateInfo.timezoneOffset != null) {
      dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
      date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
    } else {
      date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
    }
    return date;
  };

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fecha;
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return fecha;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {
    main.fecha = fecha;
  }
})(this);

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  Text: __webpack_require__(75),
  Line: __webpack_require__(76),
  Arc: __webpack_require__(77),
  Rect: __webpack_require__(78),
  Html: __webpack_require__(79),
  Tag: __webpack_require__(80)
};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

var Text = function (_GuideBase) {
  _inherits(Text, _GuideBase);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Text.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'text';
    /**
     * ?????????????????????
     * @type {Function | Array}
     */
    this.position = null;
    /**
     * ???????????????????????????
     * @type {String}
     */
    this.content = null;
    /**
     * ???????????????????????????
     * @type {Object}
     */
    this.style = {
      fill: '#000'
    };
    /**
     * x ??????????????????
     * @type {Number}
     */
    this.offsetX = 0;
    /**
     * y ??????????????????
     * @type {Number}
     */
    this.offsetY = 0;
  };

  Text.prototype.render = function render(coord, container) {
    var position = this.position;
    var point = this.parsePoint(coord, position);
    var content = this.content,
        style = this.style,
        offsetX = this.offsetX,
        offsetY = this.offsetY;


    if (offsetX) {
      point.x += offsetX;
    }

    if (offsetY) {
      point.y += offsetY;
    }

    var shape = container.addShape('text', {
      className: 'guide-text',
      attrs: Util.mix({
        x: point.x,
        y: point.y,
        text: content
      }, style)
    });
    this.element = shape;
  };

  return Text;
}(GuideBase);

GuideBase.Text = Text;
module.exports = Text;

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

var Line = function (_GuideBase) {
  _inherits(Line, _GuideBase);

  function Line() {
    _classCallCheck(this, Line);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Line.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'line';
    this.start = [];
    this.end = [];
    this.style = {
      stroke: '#000',
      lineWidth: 1
    };
  };

  Line.prototype.render = function render(coord, container) {
    var points = [];
    points[0] = this.parsePoint(coord, this.start);
    points[1] = this.parsePoint(coord, this.end);
    var shape = container.addShape('Line', {
      className: 'guide-line',
      attrs: Util.mix({
        x1: points[0].x,
        y1: points[0].y,
        x2: points[1].x,
        y2: points[1].y
      }, this.style)
    });
    this.element = shape;
  };

  return Line;
}(GuideBase);

GuideBase.Line = Line;
module.exports = Line;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

var Arc = function (_GuideBase) {
  _inherits(Arc, _GuideBase);

  function Arc() {
    _classCallCheck(this, Arc);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Arc.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'arc';
    /**
     * ??????
     * @type {Array | Function}
     */
    this.start = [];
    /**
     * ??????
     * @type {Array | Function}
     */
    this.end = [];
    /**
     * ???????????????????????????
     * @type {Object}
     */
    this.style = {
      stroke: '#999',
      lineWidth: 1
    };
  };

  Arc.prototype.render = function render(coord, container) {
    var self = this;
    var start = self.parsePoint(coord, self.start);
    var end = self.parsePoint(coord, self.end);
    var coordCenter = coord.center;
    var radius = Math.sqrt((start.x - coordCenter.x) * (start.x - coordCenter.x) + (start.y - coordCenter.y) * (start.y - coordCenter.y));
    var startAngle = Math.atan2(start.y - coordCenter.y, start.x - coordCenter.x);
    var endAngle = Math.atan2(end.y - coordCenter.y, end.x - coordCenter.x);
    var shape = container.addShape('arc', {
      className: 'guide-arc',
      attrs: Util.mix({
        x: coordCenter.x,
        y: coordCenter.y,
        r: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }, self.style)
    });
    self.element = shape;
  };

  return Arc;
}(GuideBase);

GuideBase.Arc = Arc;
module.exports = Arc;

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

var Rect = function (_GuideBase) {
  _inherits(Rect, _GuideBase);

  function Rect() {
    _classCallCheck(this, Rect);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Rect.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'rect';
    this.start = [];
    this.end = [];
    this.style = {
      fill: '#CCD7EB',
      opacity: 0.4
    };
  };

  Rect.prototype.render = function render(coord, container) {
    var start = this.parsePoint(coord, this.start);
    var end = this.parsePoint(coord, this.end);
    var shape = container.addShape('rect', {
      className: 'guide-rect',
      attrs: Util.mix({
        x: start.x,
        y: start.y,
        width: Math.abs(end.x - start.x),
        height: Math.abs(start.y - end.y)
      }, this.style)
    });
    this.element = shape;
  };

  return Rect;
}(GuideBase);

GuideBase.Rect = Rect;
module.exports = Rect;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

function getOffsetFromAlign(alignX, alignY, width, height) {
  var result = [];

  if (alignX === 'left' && alignY === 'top') {
    result[0] = 0;
    result[1] = 0;
  } else if (alignX === 'right' && alignY === 'top') {
    result[0] = -width;
    result[1] = 0;
  } else if (alignX === 'left' && alignY === 'bottom') {
    result[0] = 0;
    result[1] = Math.floor(-height);
  } else if (alignX === 'right' && alignY === 'bottom') {
    result[0] = Math.floor(-width);
    result[1] = Math.floor(-height);
  } else if (alignX === 'right' && alignY === 'middle') {
    result[0] = Math.floor(-width);
    result[1] = Math.floor(-height / 2);
  } else if (alignX === 'left' && alignY === 'middle') {
    result[0] = 0;
    result[1] = Math.floor(-height / 2);
  } else if (alignX === 'center' && alignY === 'bottom') {
    result[0] = Math.floor(-width / 2);
    result[1] = Math.floor(-height);
  } else if (alignX === 'center' && alignY === 'top') {
    result[0] = Math.floor(-width / 2);
    result[1] = 0;
  } else {
    result[0] = Math.floor(-width / 2);
    result[1] = Math.floor(-height / 2);
  }

  return result;
}

function modifyCSS(DOM, CSS) {
  for (var key in CSS) {
    if (CSS.hasOwnProperty(key)) {
      DOM.style[key] = CSS[key];
    }
  }
  return DOM;
}

function createDom(str) {
  var container = document.createElement('div');
  str = str.replace(/(^\s*)|(\s*$)/g, '');
  container.innerHTML = '' + str;
  return container.childNodes[0];
}

var Html = function (_GuideBase) {
  _inherits(Html, _GuideBase);

  function Html() {
    _classCallCheck(this, Html);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Html.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'html';
    /**
     * dom ???????????????
     * @type {Object | Array}
     */
    this.position = null;
    /**
      * ???????????????????????????????????? 'left'???'center'???'right'
      * @type {String}
      */
    this.alignX = 'center';
    /**
      * ???????????????????????????????????? 'top'???'middle'???'bottom'
      * @type {String}
      */
    this.alignY = 'middle';
    /**
      * x ??????????????????
      * @type {Number}
      */
    this.offsetX = null;
    /**
      * y ??????????????????
      * @type {Number}
      */
    this.offsetY = null;
    /**
    * html??????
    *@type {String | Function}
    */
    this.html = null;
  };

  // override paint


  Html.prototype.render = function render(coord, container) {
    var self = this;
    var position = self.parsePoint(coord, self.position);
    var myNode = createDom(self.html);
    myNode = modifyCSS(myNode, {
      position: 'absolute',
      top: Math.floor(position.y) + 'px',
      left: Math.floor(position.x) + 'px',
      visibility: 'hidden'
    });

    var parentNode = container.get('canvas').get('el').parentNode;
    parentNode = modifyCSS(parentNode, {
      position: 'relative'
    });
    // ??????html guide ?????????
    var wrapperNode = void 0;
    if (parentNode.getElementsByClassName('guideWapper').length > 0) {
      wrapperNode = parentNode.getElementsByClassName('guideWapper')[0];
    } else {
      wrapperNode = createDom('<div class="guideWapper"></div>');
      wrapperNode = modifyCSS(wrapperNode, {
        position: 'absolute',
        top: 0,
        left: 0
      });
      parentNode.appendChild(wrapperNode);
    }
    wrapperNode.appendChild(myNode);

    var alignX = self.alignX,
        alignY = self.alignY,
        offsetX = self.offsetX,
        offsetY = self.offsetY;

    var width = Util.getWidth(myNode);
    var height = Util.getHeight(myNode);
    var newOffset = getOffsetFromAlign(alignX, alignY, width, height);
    position.x = position.x + newOffset[0];
    position.y = position.y + newOffset[1];

    if (offsetX) {
      position.x += offsetX;
    }

    if (offsetY) {
      position.y += offsetY;
    }

    modifyCSS(myNode, {
      top: Math.floor(position.y) + 'px',
      left: Math.floor(position.x) + 'px',
      visibility: 'visible'
    });
    self.element = wrapperNode;
  };

  Html.prototype.remove = function remove() {
    var element = this.element;
    element && element.remove();
  };

  return Html;
}(GuideBase);

GuideBase.Html = Html;
module.exports = Html;

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Util = __webpack_require__(0);
var GuideBase = __webpack_require__(9);

var Tag = function (_GuideBase) {
  _inherits(Tag, _GuideBase);

  function Tag() {
    _classCallCheck(this, Tag);

    return _possibleConstructorReturn(this, _GuideBase.apply(this, arguments));
  }

  Tag.prototype._initDefaultCfg = function _initDefaultCfg() {
    this.type = 'tag';
    this.position = null;
    this.content = null;
    this.direct = 'auto'; // ????????????????????????????????????????????????????????????????????????
    this.offsetX = 0;
    this.offsetY = 0;
    this.side = 4; //  ??????????????????
    this.background = {
      padding: 5, // tag ?????????
      radius: 2, // tag ??????
      fill: '#1890FF' // tag ?????????
    };
    this.textStyle = {
      fontSize: 12,
      fill: '#fff',
      textAlign: 'center',
      textBaseline: 'middle'
    };
    this.withPoint = true;
    this.pointStyle = {
      fill: '#1890FF',
      r: 3,
      lineWidth: 1,
      stroke: '#fff'
    };
  };

  Tag.prototype._getDirect = function _getDirect(container, point, tagWidth, tagHeight) {
    var direct = this.direct;
    if (direct === 'auto') {
      // ????????????
      var side = this.side;
      var canvas = container.get('canvas');
      var clientWidth = canvas.getWidth();
      var clientHeight = canvas.getHeight();
      var x = point.x,
          y = point.y;


      var vertical = 't';
      var horizontal = 'l';

      if (y - side - tagHeight < 0) {
        vertical = 'b';
      }

      if (vertical === 'b') {
        if (y + side + tagHeight > clientHeight) {
          vertical = 't';
        }
      }

      var diff = vertical === 'c' ? side : 0;
      if (x - diff - tagWidth < 0) {
        horizontal = 'r';
      }
      if (horizontal === 'r') {
        var _diff = vertical === 'c' ? side : 0;
        if (x + _diff + tagWidth > clientWidth) {
          horizontal = 'l';
        }
      }
      direct = vertical + horizontal;
      this.direct = direct;
    }

    return direct;
  };

  Tag.prototype.render = function render(coord, container) {
    var position = this.parsePoint(coord, this.position);
    var content = this.content,
        background = this.background,
        textStyle = this.textStyle;


    var wrapperContainer = container.addGroup({
      className: 'guide-tag'
    });

    if (this.withPoint) {
      wrapperContainer.addShape('Circle', {
        className: 'guide-tag-point',
        attrs: Util.mix({
          x: position.x,
          y: position.y
        }, this.pointStyle)
      });
    }

    var tagContainer = wrapperContainer.addGroup();
    // ????????????
    var tagText = tagContainer.addShape('text', {
      className: 'guide-tag-text',
      zIndex: 1,
      attrs: Util.mix({
        x: 0,
        y: 0,
        text: content
      }, textStyle)
    });

    // ???????????????
    var textBBox = tagText.getBBox();
    var padding = Util.parsePadding(background.padding);
    var tagWidth = textBBox.width + padding[1] + padding[3];
    var tagHeight = textBBox.height + padding[0] + padding[2];
    var yMin = textBBox.minY - padding[0];
    var xMin = textBBox.minX - padding[3];
    var tagBg = tagContainer.addShape('rect', {
      className: 'guide-tag-bg',
      zIndex: -1,
      attrs: Util.mix({
        x: xMin,
        y: yMin,
        width: tagWidth,
        height: tagHeight
      }, background)
    });
    var direct = this._getDirect(container, position, tagWidth, tagHeight);
    var side = this.side;
    var x = position.x + this.offsetX;
    var y = position.y + this.offsetY;
    var arrowPoints = void 0;
    var radius = Util.parsePadding(background.radius);
    if (direct === 'tl') {
      arrowPoints = [{ x: tagWidth - side + xMin, y: tagHeight + yMin - 1 }, // ?????? 1 ???????????????????????????
      { x: tagWidth + xMin, y: tagHeight + yMin - 1 }, { x: tagWidth + xMin, y: tagHeight + side + yMin }];
      radius[2] = 0;
      x = x - tagWidth;
      y = y - side - tagHeight;
    } else if (direct === 'cl') {
      arrowPoints = [{ x: tagWidth + xMin - 1, y: (tagHeight - side) / 2 + yMin }, { x: tagWidth + xMin - 1, y: (tagHeight + side) / 2 + yMin }, { x: tagWidth + side + xMin, y: tagHeight / 2 + yMin }];

      x = x - tagWidth - side;
      y = y - tagHeight / 2;
    } else if (direct === 'bl') {
      arrowPoints = [{ x: tagWidth + xMin, y: -side + yMin }, { x: tagWidth - side + xMin, y: yMin + 1 }, { x: tagWidth + xMin, y: yMin + 1 }];
      radius[1] = 0;

      x = x - tagWidth;
      y = y + side;
    } else if (direct === 'bc') {
      arrowPoints = [{ x: tagWidth / 2 + xMin, y: -side + yMin }, { x: (tagWidth - side) / 2 + xMin, y: yMin + 1 }, { x: (tagWidth + side) / 2 + xMin, y: yMin + 1 }];
      x = x - tagWidth / 2;
      y = y + side;
    } else if (direct === 'br') {
      arrowPoints = [{ x: xMin, y: -side + yMin }, { x: xMin, y: yMin + 1 }, { x: side + xMin, y: yMin + 1 }];
      radius[0] = 0;
      y = y + side;
    } else if (direct === 'cr') {
      arrowPoints = [{ x: -side + xMin, y: tagHeight / 2 + yMin }, { x: xMin + 1, y: (tagHeight - side) / 2 + yMin }, { x: xMin + 1, y: (tagHeight + side) / 2 + yMin }];
      x = x + side;
      y = y - tagHeight / 2;
    } else if (direct === 'tr') {
      arrowPoints = [{ x: 0 + xMin, y: tagHeight + side + yMin }, { x: 0 + xMin, y: tagHeight + yMin - 1 }, { x: side + xMin, y: tagHeight + yMin - 1 }];
      radius[3] = 0;

      y = y - tagHeight - side;
    } else if (direct === 'tc') {
      arrowPoints = [{ x: (tagWidth - side) / 2 + xMin, y: tagHeight + yMin - 1 }, { x: (tagWidth + side) / 2 + xMin, y: tagHeight + yMin - 1 }, { x: tagWidth / 2 + xMin, y: tagHeight + side + yMin }];
      x = x - tagWidth / 2;
      y = y - tagHeight - side;
    }

    tagContainer.addShape('Polygon', {
      zIndex: 0,
      attrs: {
        points: arrowPoints,
        fill: background.fill
      }
    });

    tagBg.attr('radius', radius);
    tagContainer.moveTo(x - xMin, y - yMin);
    tagContainer.sort();

    this.element = wrapperContainer;
  };

  return Tag;
}(GuideBase);

GuideBase.Tag = Tag;
module.exports = Tag;

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Global = __webpack_require__(1);
var Tooltip = __webpack_require__(82);

// Register the default configuration for Tooltip
Global.tooltip = Util.deepMix({
  triggerOn: ['touchstart', 'touchmove'],
  // triggerOff: 'touchend',
  showTitle: false,
  showCrosshairs: false,
  crosshairsStyle: {
    stroke: 'rgba(0, 0, 0, 0.25)',
    lineWidth: 1
  },
  showTooltipMarker: true,
  background: {
    radius: 1,
    fill: 'rgba(0, 0, 0, 0.65)',
    padding: [3, 5]
  },
  titleStyle: {
    fontSize: 12,
    fill: '#fff',
    textAlign: 'start',
    textBaseline: 'top'
  },
  nameStyle: {
    fontSize: 12,
    fill: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'start',
    textBaseline: 'middle'
  },
  valueStyle: {
    fontSize: 12,
    fill: '#fff',
    textAlign: 'start',
    textBaseline: 'middle'
  },
  showItemMarker: true,
  itemMarkerStyle: {
    radius: 3,
    symbol: 'circle',
    lineWidth: 1,
    stroke: '#fff'
  },
  layout: 'horizontal'
}, Global.tooltip || {});

function _getTooltipValueScale(geom) {
  var colorAttr = geom.getAttr('color');
  if (colorAttr) {
    var colorScale = colorAttr.getScale(colorAttr.type);
    if (colorScale.isLinear) {
      return colorScale;
    }
  }
  var xScale = geom.getXScale();
  var yScale = geom.getYScale();
  if (yScale) {
    return yScale;
  }

  return xScale;
}

function getTooltipName(geom, origin) {
  var name = void 0;
  var nameScale = void 0;
  var groupScales = geom._getGroupScales();
  if (groupScales.length) {
    // ???????????????????????????????????????????????????
    Util.each(groupScales, function (scale) {
      nameScale = scale;
      return false;
    });
  }
  if (nameScale) {
    var field = nameScale.field;
    name = nameScale.getText(origin[field]);
  } else {
    var valueScale = _getTooltipValueScale(geom);
    name = valueScale.alias || valueScale.field;
  }
  return name;
}

function getTooltipValue(geom, origin) {
  var scale = _getTooltipValueScale(geom);
  return scale.getText(origin[scale.field]);
}

function getTooltipTitle(geom, origin) {
  var position = geom.getAttr('position');
  var field = position.getFields()[0];
  var scale = geom.get('scales')[field];
  return scale.getText(origin[scale.field]);
}

function _indexOfArray(items, item) {
  var rst = -1;
  Util.each(items, function (sub, index) {
    if (sub.title === item.title && sub.name === item.name && sub.value === item.value && sub.color === item.color) {
      rst = index;
      return false;
    }
  });
  return rst;
}

// ??????????????????, ??????????????????????????????????????????????????????
function _uniqItems(items) {
  var tmp = [];
  Util.each(items, function (item) {
    var index = _indexOfArray(tmp, item);
    if (index === -1) {
      tmp.push(item);
    } else {
      tmp[index] = item;
    }
  });
  return tmp;
}

function isEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

var TooltipController = function () {
  function TooltipController(cfg) {
    _classCallCheck(this, TooltipController);

    this.enable = true;
    this.cfg = {};
    this.tooltip = null;
    this.chart = null;
    this.timeStamp = 0;
    Util.mix(this, cfg);
    var chart = this.chart;
    this.canvasDom = chart.get('canvas').get('el');
  }

  TooltipController.prototype._setCrosshairsCfg = function _setCrosshairsCfg() {
    var self = this;
    var chart = self.chart;
    var defaultCfg = Util.mix({}, Global.tooltip);
    var geoms = chart.get('geoms');
    var shapes = [];
    Util.each(geoms, function (geom) {
      var type = geom.get('type');
      if (Util.indexOf(shapes, type) === -1) {
        shapes.push(type);
      }
    });
    if (geoms.length && chart.get('coord').type === 'cartesian') {
      if (shapes.length === 1 && ['line', 'area', 'path', 'point'].indexOf(shapes[0]) !== -1) {
        Util.mix(defaultCfg, {
          showCrosshairs: true
        });
      }
    }

    return defaultCfg;
  };

  TooltipController.prototype._getMaxLength = function _getMaxLength() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var layout = cfg.layout,
        plotRange = cfg.plotRange;

    return layout === 'horizontal' ? plotRange.br.x - plotRange.bl.x : plotRange.bl.y - plotRange.tr.y;
  };

  TooltipController.prototype.render = function render() {
    var self = this;

    if (self.tooltip || !self.enable) {
      return;
    }

    var chart = self.chart;
    var canvas = chart.get('canvas');
    var frontPlot = chart.get('frontPlot').addGroup({
      className: 'tooltipContainer',
      zIndex: 10
    });
    var backPlot = chart.get('backPlot').addGroup({
      className: 'tooltipContainer'
    });
    var plotRange = chart.get('plotRange');
    var coord = chart.get('coord');

    var defaultCfg = self._setCrosshairsCfg();
    var cfg = self.cfg;
    cfg = Util.deepMix({
      plotRange: plotRange,
      frontPlot: frontPlot,
      backPlot: backPlot,
      canvas: canvas,
      fixed: coord.transposed || coord.isPolar
    }, defaultCfg, cfg);
    cfg.maxLength = self._getMaxLength(cfg);
    this.cfg = cfg;
    var tooltip = new Tooltip(cfg);
    self.tooltip = tooltip;
    self.bindEvents();
  };

  TooltipController.prototype.clear = function clear() {
    var tooltip = this.tooltip;
    tooltip && tooltip.destroy();
    this.tooltip = null;
    this.prePoint = null;
    this.unBindEvents();
  };

  TooltipController.prototype._getTooltipMarkerStyle = function _getTooltipMarkerStyle() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = cfg.type,
        items = cfg.items;

    var tooltipCfg = this.cfg;
    if (type === 'rect') {
      var x = void 0;
      var y = void 0;
      var width = void 0;
      var height = void 0;
      var chart = this.chart;

      var _chart$get = chart.get('plotRange'),
          tl = _chart$get.tl,
          br = _chart$get.br;

      var coord = chart.get('coord');
      var firstItem = items[0];
      var lastItem = items[items.length - 1];
      var intervalWidth = firstItem.width;
      if (coord.transposed) {
        x = tl.x;
        y = lastItem.y - intervalWidth * 0.75;
        width = br.x - tl.x;
        height = firstItem.y - lastItem.y + 1.5 * intervalWidth;
      } else {
        x = firstItem.x - intervalWidth * 0.75;
        y = tl.y;
        width = lastItem.x - firstItem.x + 1.5 * intervalWidth;
        height = br.y - tl.y;
      }

      cfg.style = Util.mix({
        x: x,
        y: y,
        width: width,
        height: height,
        fill: '#CCD6EC',
        opacity: 0.3
      }, tooltipCfg.tooltipMarkerStyle);
    } else {
      cfg.style = Util.mix({
        radius: 4,
        fill: '#fff',
        lineWidth: 2
      }, tooltipCfg.tooltipMarkerStyle);
    }

    return cfg;
  };

  TooltipController.prototype._setTooltip = function _setTooltip(point, items) {
    var tooltipMarkerCfg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var lastActive = this._lastActive;
    var tooltip = this.tooltip;
    var cfg = this.cfg;

    items = _uniqItems(items); // ????????????????????????

    if (cfg.onShow) {
      // tooltip ??????
      cfg.onShow({
        x: point.x,
        y: point.y,
        tooltip: tooltip,
        items: items,
        tooltipMarkerCfg: tooltipMarkerCfg
      });
    }
    if (isEqual(lastActive, items)) {
      return;
    }
    this._lastActive = items;

    if (cfg.onChange || Util.isFunction(cfg.custom)) {
      // ?????????????????????
      var onChange = cfg.onChange || cfg.custom;
      onChange({
        x: point.x,
        y: point.y,
        tooltip: tooltip,
        items: items,
        tooltipMarkerCfg: tooltipMarkerCfg
      });
    }

    if (!cfg.custom) {
      var first = items[0];
      var title = first.title || first.name;
      tooltip.setContent(title, items);
    }
    tooltip.setPosition(items);

    var markerItems = tooltipMarkerCfg.items;
    if (cfg.showTooltipMarker && markerItems.length) {
      tooltipMarkerCfg = this._getTooltipMarkerStyle(tooltipMarkerCfg);
      tooltip.setMarkers(tooltipMarkerCfg);
    } else {
      tooltip.clearMarkers();
    }

    tooltip.show();
  };

  TooltipController.prototype.showTooltip = function showTooltip(point) {
    var self = this;
    var chart = self.chart;

    var tooltipMarkerType = void 0;
    var tooltipMarkerItems = [];
    var items = [];
    var cfg = self.cfg;
    var marker = void 0;
    if (cfg.showItemMarker) {
      marker = cfg.itemMarkerStyle;
    }

    var geoms = chart.get('geoms');
    var coord = chart.get('coord');

    Util.each(geoms, function (geom) {
      var type = geom.get('type');
      var records = geom.getSnapRecords(point);
      Util.each(records, function (record) {
        if (record.x && record.y) {
          var x = record.x,
              y = record.y,
              _origin = record._origin,
              color = record.color;

          var tooltipItem = {
            x: x,
            y: Util.isArray(y) ? y[1] : y,
            color: color || Global.defaultColor,
            origin: _origin,
            name: getTooltipName(geom, _origin),
            value: getTooltipValue(geom, _origin),
            title: getTooltipTitle(geom, _origin)
          };
          if (marker) {
            tooltipItem.marker = Util.mix({
              fill: color || Global.defaultColor
            }, marker);
          }
          items.push(tooltipItem);

          if (['line', 'area', 'path'].indexOf(type) !== -1) {
            tooltipMarkerType = 'circle';
            tooltipMarkerItems.push(tooltipItem);
          } else if (type === 'interval' && coord.type === 'cartesian') {
            tooltipMarkerType = 'rect';
            tooltipItem.width = geom.getSize(record._origin);
            tooltipMarkerItems.push(tooltipItem);
          }
        }
      });
    });

    if (items.length) {
      var tooltipMarkerCfg = {
        items: tooltipMarkerItems,
        type: tooltipMarkerType
      };
      self._setTooltip(point, items, tooltipMarkerCfg);
    } else {
      self.hideTooltip();
    }
  };

  TooltipController.prototype.hideTooltip = function hideTooltip() {
    var cfg = this.cfg;
    this._lastActive = [];
    var tooltip = this.tooltip;
    if (tooltip) {
      tooltip.hide();
      if (cfg.onHide) {
        cfg.onHide({
          tooltip: tooltip
        });
      }
      var canvas = this.chart.get('canvas');
      canvas.draw();
    }
  };

  TooltipController.prototype.handleShowEvent = function handleShowEvent(ev) {
    var chart = this.chart;
    var plot = chart.get('plotRange');

    var _Util$createEvent = Util.createEvent(ev, chart),
        x = _Util$createEvent.x,
        y = _Util$createEvent.y;

    if (!(x >= plot.tl.x && x <= plot.tr.x && y >= plot.tl.y && y <= plot.br.y)) {
      // not in chart plot
      this.hideTooltip();
      return;
    }
    var lastTimeStamp = this.timeStamp;
    var timeStamp = +new Date();
    if (timeStamp - lastTimeStamp > 16) {
      this.showTooltip({ x: x, y: y });
      this.timeStamp = timeStamp;
    }
  };

  TooltipController.prototype.handleHideEvent = function handleHideEvent() {
    this.hideTooltip();
  };

  TooltipController.prototype.handleDocEvent = function handleDocEvent(ev) {
    var canvasDom = this.canvasDom;
    if (ev.target !== canvasDom) {
      this.hideTooltip();
    }
  };

  TooltipController.prototype._handleEvent = function _handleEvent(methodName, method, action) {
    var canvasDom = this.canvasDom;
    Util.each([].concat(methodName), function (aMethod) {
      if (Util.isFunction(aMethod)) {
        aMethod(method, action); // TODO??? ????????????????????????????????????
      } else if (action === 'bind') {
        Util.addEventListener(canvasDom, aMethod, method);
      } else {
        Util.removeEventListener(canvasDom, aMethod, method);
      }
    });
  };

  TooltipController.prototype.bindEvents = function bindEvents() {
    var triggerOn = this.cfg.triggerOn;
    var triggerOff = this.cfg.triggerOff;
    var showMethod = Util.wrapBehavior(this, 'handleShowEvent');
    var hideMethod = Util.wrapBehavior(this, 'handleHideEvent');

    triggerOn && this._handleEvent(triggerOn, showMethod, 'bind');
    triggerOff && this._handleEvent(triggerOff, hideMethod, 'bind');
    // TODO: ???????????????canvas ??????????????? tooltip ??????
    var docMethod = Util.wrapBehavior(this, 'handleDocEvent');
    Util.isBrowser && Util.addEventListener(document, 'touchstart', docMethod);
  };

  TooltipController.prototype.unBindEvents = function unBindEvents() {
    var triggerOn = this.cfg.triggerOn;
    var triggerOff = this.cfg.triggerOff;
    var showMethod = Util.getWrapBehavior(this, 'handleShowEvent');
    var hideMethod = Util.getWrapBehavior(this, 'handleHideEvent');

    triggerOn && this._handleEvent(triggerOn, showMethod, 'unBind');
    triggerOff && this._handleEvent(triggerOff, hideMethod, 'unBind');
    // TODO: ???????????????canvas ??????????????? tooltip ??????
    var docMethod = Util.getWrapBehavior(this, 'handleDocEvent');
    Util.isBrowser && Util.removeEventListener(document, 'touchstart', docMethod);
  };

  return TooltipController;
}();

module.exports = {
  init: function init(chart) {
    var tooltipController = new TooltipController({
      chart: chart
    });
    chart.set('tooltipController', tooltipController);
    /**
     * ?????? tooltip
     * @param  {Boolean|Object} enable Boolean ??????????????????tooltip???Object ??????????????????
     * @param  {Object} cfg ?????????
     * @return {Chart} ?????? Chart ??????
     */
    chart.tooltip = function (enable) {
      var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Util.isObject(enable)) {
        cfg = enable;
        enable = true;
      }
      tooltipController.enable = enable;
      tooltipController.cfg = cfg;

      return this;
    };
  },
  afterGeomDraw: function afterGeomDraw(chart) {
    var tooltipController = chart.get('tooltipController');
    tooltipController.render();

    /**
     * ?????????????????????????????? tooltip
     * @param  {Object} point ???????????????
     * @return {Chart}       ?????? chart ??????
     */
    chart.showTooltip = function (point) {
      tooltipController.showTooltip(point);
      return this;
    };

    /**
     * ?????? tooltip
     * @return {Chart}       ?????? chart ??????
     */
    chart.hideTooltip = function () {
      tooltipController.hideTooltip();
      return this;
    };
  },
  clearInner: function clearInner(chart) {
    var tooltipController = chart.get('tooltipController');
    tooltipController.clear();
  }
};

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Marker = __webpack_require__(65);
var Container = __webpack_require__(66);
var GAP = 4;

var Tooltip = function () {
  Tooltip.prototype.getDefaultCfg = function getDefaultCfg() {
    return {
      /**
       * ???????????? tooltip ?????????????????????????????????
       * @type {Object}
       */
      showCrosshairs: false,
      /**
       * tooltip ?????????????????????
       * @type {Object}
       */
      crosshairsStyle: {
        stroke: 'rgba(0, 0, 0, 0.25)',
        lineWidth: 1
      },
      /**
       * tooltip ???????????????
       * @type {Object}
       */
      background: null,
      /**
       * ???????????????horizontal ?????? vertical
       * @type {String}
       */
      layout: 'horizontal',
      offsetX: 0,
      offsetY: 0
    };
  };

  function Tooltip(cfg) {
    _classCallCheck(this, Tooltip);

    Util.deepMix(this, this.getDefaultCfg(), cfg);
    var frontPlot = this.frontPlot;
    var plotRange = this.plotRange;

    if (!this.custom) {
      // custom ??????????????????????????? tooltip
      var container = new Container(Util.mix({
        parent: frontPlot
      }, cfg));
      this.container = container;
      if (!this.fixed) {
        this.tooltipArrow = frontPlot.addShape('Polygon', {
          className: 'tooltip-arrow',
          visible: false,
          zIndex: -1,
          attrs: {
            points: [],
            fill: this.background.fill
          }
        });
      }
    }

    if (this.showCrosshairs) {
      var crosshairsStyle = this.crosshairsStyle;
      var shape = frontPlot.addShape('Line', {
        className: 'tooltip-crosshairs',
        zIndex: 0,
        visible: false,
        attrs: Util.mix({
          x1: 0,
          y1: plotRange.bl.y,
          x2: 0,
          y2: plotRange.tl.y
        }, crosshairsStyle)
      });
      this.crosshairsShape = shape;
    }

    frontPlot.sort();
  }

  Tooltip.prototype.setContent = function setContent(title, items) {
    this.title = title;
    this.items = items;
    var container = this.container;
    container.setTitle(title);
    container.setItems(items);
  };

  Tooltip.prototype.setPosition = function setPosition(items) {
    var container = this.container,
        plotRange = this.plotRange,
        offsetX = this.offsetX,
        offsetY = this.offsetY,
        crosshairsShape = this.crosshairsShape,
        fixed = this.fixed,
        tooltipArrow = this.tooltipArrow;

    crosshairsShape && crosshairsShape.moveTo(items[0].x, 0); // ???????????????

    if (!container) {
      return;
    }

    var containerBBox = container.container.getBBox();
    var minX = containerBBox.minX,
        minY = containerBBox.minY,
        width = containerBBox.width,
        height = containerBBox.height;
    var tl = plotRange.tl,
        tr = plotRange.tr;

    var posX = 0;
    var posY = tl.y - height - GAP + offsetY; // ????????????????????????????????????????????????

    if (fixed) {
      var x = (tl.x + tr.x) / 2;
      posX = x - width / 2 + offsetX;
    } else {
      var _x = void 0;
      if (items.length > 1) {
        _x = (items[0].x + items[items.length - 1].x) / 2;
      } else {
        _x = items[0].x;
      }
      posX = _x - width / 2 + offsetX;
      // ??????????????????????????????????????????
      if (posX < tl.x) {
        posX = tl.x;
      }
      if (posX + width > tr.x) {
        posX = tr.x - width;
      }

      // if (posY < 0) {
      //   posY = 0;
      // }

      if (tooltipArrow) {
        tooltipArrow.attr('points', [{ x: _x - 3, y: tl.y - GAP + offsetY }, { x: _x + 3, y: tl.y - GAP + offsetY }, { x: _x, y: tl.y + offsetY }]);
        var backShape = container.backShape;
        var radius = Util.parsePadding(backShape.attr('radius'));
        if (_x === tl.x) {
          radius[3] = 0;

          tooltipArrow.attr('points', [{ x: tl.x, y: tl.y + offsetY }, { x: tl.x, y: tl.y - GAP + offsetY }, { x: tl.x + GAP, y: tl.y - GAP + offsetY }]);
        } else if (_x === tr.x) {
          radius[2] = 0;

          tooltipArrow.attr('points', [{ x: tr.x, y: tl.y + offsetY }, { x: tr.x - GAP, y: tl.y - GAP + offsetY }, { x: tr.x, y: tl.y - GAP + offsetY }]);
        }
        backShape.attr('radius', radius);
      }
    }

    container.moveTo(posX - minX, posY - minY);
  };

  Tooltip.prototype.setMarkers = function setMarkers() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var self = this;
    var items = cfg.items,
        style = cfg.style,
        type = cfg.type;

    var markerGroup = self._getMarkerGroup(type);
    if (type === 'circle') {
      for (var i = 0, length = items.length; i < length; i++) {
        var item = items[i];
        var marker = new Marker({
          className: 'tooltip-circle-marker',
          attrs: Util.mix({
            x: item.x,
            y: item.y,
            stroke: item.color
          }, style)
        });
        markerGroup.add(marker);
      }
    } else {
      markerGroup.addShape('rect', {
        className: 'tooltip-rect-marker',
        attrs: style
      });
    }
  };

  Tooltip.prototype.clearMarkers = function clearMarkers() {
    var markerGroup = this.markerGroup;
    markerGroup && markerGroup.clear();
  };

  Tooltip.prototype.show = function show() {
    var crosshairsShape = this.crosshairsShape;
    var markerGroup = this.markerGroup;
    var container = this.container;
    var tooltipArrow = this.tooltipArrow;
    var canvas = this.canvas;
    // canvas.sort();
    crosshairsShape && crosshairsShape.show();
    markerGroup && markerGroup.show();
    container && container.show();
    tooltipArrow && tooltipArrow.show();
    canvas.draw();
  };

  Tooltip.prototype.hide = function hide() {
    var crosshairsShape = this.crosshairsShape;
    var markerGroup = this.markerGroup;
    var container = this.container;
    var tooltipArrow = this.tooltipArrow;
    crosshairsShape && crosshairsShape.hide();
    markerGroup && markerGroup.hide();
    container && container.hide();
    tooltipArrow && tooltipArrow.hide();
  };

  Tooltip.prototype.destroy = function destroy() {
    var crosshairsShape = this.crosshairsShape;
    var markerGroup = this.markerGroup;
    var container = this.container;
    var tooltipArrow = this.tooltipArrow;

    crosshairsShape && crosshairsShape.remove(true);
    markerGroup && markerGroup.remove(true);
    container && container.clear();
    tooltipArrow && tooltipArrow.remove(true);

    this.destroyed = true;
  };

  Tooltip.prototype._getMarkerGroup = function _getMarkerGroup(type) {
    var markerGroup = this.markerGroup;
    if (!markerGroup) {
      if (type === 'circle') {
        markerGroup = this.frontPlot.addGroup({
          zIndex: 1
        });
      } else {
        markerGroup = this.backPlot.addGroup();
      }
      this.markerGroup = markerGroup;
    } else {
      markerGroup.clear();
    }

    return markerGroup;
  };

  return Tooltip;
}();

module.exports = Tooltip;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var Guide = __webpack_require__(9);
var Global = __webpack_require__(1);

// register the default configuration for Guide
Global.guide = Util.deepMix({
  line: {
    style: {
      stroke: '#a3a3a3',
      lineWidth: 1
    },
    top: true
  },
  text: {
    style: {
      fill: '#787878',
      textAlign: 'center',
      textBaseline: 'middle'
    },
    offsetX: 0,
    offsetY: 0,
    top: true
  },
  rect: {
    style: {
      fill: '#fafafa'
    },
    top: false
  },
  arc: {
    style: {
      stroke: '#a3a3a3'
    },
    top: true
  },
  html: {
    offsetX: 0,
    offsetY: 0,
    alignX: 'middle',
    alignY: 'middle'
  },
  tag: {
    top: true,
    offsetX: 0, // X ?????????
    offsetY: 0, // Y ?????????
    side: 4, //  ??????????????????
    background: {
      padding: 5, // tag ?????????
      radius: 2, // tag ??????
      fill: '#1890FF' // tag ?????????
    },
    textStyle: {
      fontSize: 12,
      fill: '#fff',
      textAlign: 'center',
      textBaseline: 'middle'
    }
  }
}, Global.guide || {});

var GuideController = function () {
  function GuideController(cfg) {
    _classCallCheck(this, GuideController);

    this.guides = [];
    this.xScale = null;
    this.yScales = null;
    Util.mix(this, cfg);
  }

  GuideController.prototype.paint = function paint(coord) {
    var self = this;
    var guides = self.guides;
    var xScale = self.xScale;
    var yScales = self.yScales;
    Util.each(guides, function (guide) {
      guide.xScale = xScale;
      guide.yScales = yScales;
      var container = guide.top ? self.frontPlot : self.backPlot;
      guide.render(coord, container);
    });
  };

  GuideController.prototype.clear = function clear() {
    this.reset();
    this.guides = [];
    return this;
  };

  GuideController.prototype.reset = function reset() {
    var guides = this.guides;
    Util.each(guides, function (guide) {
      guide.remove();
    });
  };

  GuideController.prototype._createGuide = function _createGuide(type, cfg) {
    var ClassName = Util.upperFirst(type);
    var guide = new Guide[ClassName](Util.deepMix({}, Global.guide[type], cfg));
    this.guides.push(guide);
    return this;
  };

  GuideController.prototype.line = function line() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('line', cfg);
  };

  GuideController.prototype.text = function text() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('text', cfg);
  };

  GuideController.prototype.arc = function arc() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('arc', cfg);
  };

  GuideController.prototype.html = function html() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('html', cfg);
  };

  GuideController.prototype.rect = function rect() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('rect', cfg);
  };

  GuideController.prototype.tag = function tag() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return this._createGuide('tag', cfg);
  };

  return GuideController;
}();

module.exports = {
  init: function init(chart) {
    var guideController = new GuideController({
      frontPlot: chart.get('frontPlot').addGroup({
        zIndex: 20,
        className: 'guideContainer'
      }),
      backPlot: chart.get('backPlot').addGroup({
        className: 'guideContainer'
      })
    });
    chart.set('guideController', guideController);
    /**
     * ??????????????? guide
     * @return {GuideController} ?????? guide ?????????
     */
    chart.guide = function () {
      return guideController;
    };
  },
  afterGeomDraw: function afterGeomDraw(chart) {
    var guideController = chart.get('guideController');
    if (!guideController.guides.length) {
      return;
    }
    var xScale = chart.getXScale();
    var yScales = chart.getYScales();
    var coord = chart.get('coord');
    guideController.xScale = xScale;
    guideController.yScales = yScales;
    guideController.paint(coord);
  },
  clear: function clear(chart) {
    chart.get('guideController').clear();
  },
  repaint: function repaint(chart) {
    chart.get('guideController').reset();
  }
};

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = __webpack_require__(0);
var List = __webpack_require__(66);
var Global = __webpack_require__(1);
var LEGEND_GAP = 12;
var MARKER_SIZE = 3;

var DEFAULT_CFG = {
  itemMarginBottom: 12,
  itemGap: 10,
  showTitle: false,
  titleStyle: {
    fontSize: 12,
    fill: '#808080',
    textAlign: 'start',
    textBaseline: 'top'
  },
  nameStyle: {
    fill: '#808080',
    fontSize: 12,
    textAlign: 'start',
    textBaseline: 'middle'
  },
  valueStyle: {
    fill: '#000000',
    fontSize: 12,
    textAlign: 'start',
    textBaseline: 'middle'
  },
  unCheckColor: '#bfbfbf',
  itemWidth: 'auto',
  wordSpace: 6,
  selectedMode: 'multiple' // 'multiple' or 'single'
};

// Register the default configuration for Legend
Global.legend = Util.deepMix({
  right: Util.mix({
    position: 'right',
    layout: 'vertical'
  }, DEFAULT_CFG),
  left: Util.mix({
    position: 'left',
    layout: 'vertical'
  }, DEFAULT_CFG),
  top: Util.mix({
    position: 'top',
    layout: 'horizontal'
  }, DEFAULT_CFG),
  bottom: Util.mix({
    position: 'bottom',
    layout: 'horizontal'
  }, DEFAULT_CFG)
}, Global.legend || {});

function compare(a, b) {
  return a - b;
}

function _isScaleExist(scales, compareScale) {
  var flag = false;
  Util.each(scales, function (scale) {
    var scaleValues = [].concat(scale.values);
    var compareScaleValues = [].concat(compareScale.values);
    if (scale.type === compareScale.type && scale.field === compareScale.field && scaleValues.sort(compare).toString() === compareScaleValues.sort(compare).toString()) {
      flag = true;
      return;
    }
  });

  return flag;
}

var LegendController = function () {
  function LegendController(cfg) {
    _classCallCheck(this, LegendController);

    this.legendCfg = {};
    this.enable = true;
    this.position = 'top';
    Util.mix(this, cfg);
    var chart = this.chart;
    this.canvasDom = chart.get('canvas').get('el');
    this.clear();
  }

  LegendController.prototype.addLegend = function addLegend(scale, attr, filterVals) {
    var self = this;
    var legendCfg = self.legendCfg;
    var field = scale.field;
    var fieldCfg = legendCfg[field];

    if (fieldCfg === false) {
      // ????????????????????????
      return null;
    }

    if (fieldCfg && fieldCfg.custom) {
      // ?????????????????????
      self.addCustomLegend(field);
    } else {
      var position = legendCfg.position || self.position;
      if (fieldCfg && fieldCfg.position) {
        // ????????????????????????????????? position???????????? position ??????
        position = fieldCfg.position;
      }
      if (scale.isCategory) {
        // ?????????????????????
        self._addCategroyLegend(scale, attr, position, filterVals);
      }
    }
  };

  LegendController.prototype.addCustomLegend = function addCustomLegend(field) {
    var self = this;

    var legendCfg = self.legendCfg;
    if (field && legendCfg[field]) {
      legendCfg = legendCfg[field];
    }

    var position = legendCfg.position || self.position;
    var legends = self.legends;
    legends[position] = legends[position] || [];
    var items = legendCfg.items;
    if (!items) {
      return null;
    }

    var container = self.container;
    Util.each(items, function (item) {
      if (!Util.isObject(item.marker)) {
        item.marker = {
          symbol: item.marker || 'circle',
          fill: item.fill,
          radius: MARKER_SIZE
        };
      } else {
        item.marker.radius = item.marker.radius || MARKER_SIZE;
      }
      item.checked = Util.isNil(item.checked) ? true : item.checked;
      item.name = item.name || item.value; // ?????? value ?????????
    });
    var legend = new List(Util.deepMix({}, Global.legend[position], legendCfg, {
      maxLength: self._getMaxLength(position),
      items: items,
      parent: container
    }));
    // container.add(legend.container);
    legends[position].push(legend);
  };

  LegendController.prototype.clear = function clear() {
    var legends = this.legends;
    Util.each(legends, function (legendItems) {
      Util.each(legendItems, function (legend) {
        legend.clear();
      });
    });

    this.legends = {};
    this.unBindEvents();
  };

  LegendController.prototype._isFiltered = function _isFiltered(scale, values, value) {
    var rst = false;
    value = scale.invert(value);
    Util.each(values, function (val) {
      rst = rst || scale.getText(val) === scale.getText(value);
      if (rst) {
        return false;
      }
    });
    return rst;
  };

  LegendController.prototype._getMaxLength = function _getMaxLength(position) {
    var chart = this.chart;
    var appendPadding = chart.get('appendPadding') * 2;
    return position === 'right' || position === 'left' ? chart.get('height') - appendPadding : chart.get('width') - appendPadding;
  };

  LegendController.prototype._addCategroyLegend = function _addCategroyLegend(scale, attr, position, filterVals) {
    var self = this;
    var legendCfg = self.legendCfg,
        legends = self.legends,
        container = self.container;

    var items = [];
    var field = scale.field;
    var ticks = scale.getTicks();
    legends[position] = legends[position] || [];

    var symbol = 'circle';
    if (legendCfg[field] && legendCfg[field].marker) {
      // ????????? field ???????????????????????? marker
      symbol = legendCfg[field].marker;
    } else if (legendCfg.marker) {
      symbol = legendCfg.marker;
    }

    Util.each(ticks, function (tick) {
      var text = tick.text;
      var name = text;
      var scaleValue = tick.value;
      var value = scale.invert(scaleValue);
      var color = attr.mapping(value).join('') || Global.defaultColor;

      var marker = {
        fill: color,
        radius: 3,
        symbol: 'circle',
        stroke: '#fff'
      };

      if (Util.isPlainObject(symbol)) {
        Util.mix(marker, symbol);
      } else {
        marker.symbol = symbol;
      }

      items.push({
        name: name, // ??????????????????????????????
        dataValue: value, // ???????????????????????????????????????
        checked: filterVals ? self._isFiltered(scale, filterVals, scaleValue) : true,
        marker: marker
      });
    });

    var lastCfg = Util.deepMix({}, Global.legend[position], legendCfg[field] || legendCfg, {
      maxLength: self._getMaxLength(position),
      items: items,
      field: field,
      filterVals: filterVals,
      parent: container
    });
    if (lastCfg.showTitle) {
      Util.deepMix(lastCfg, {
        title: scale.alias || scale.field
      });
    }

    var legend = new List(lastCfg);
    // container.add(legend.container);
    legends[position].push(legend);
    return legend;
  };

  LegendController.prototype._alignLegend = function _alignLegend(legend, pre, position) {
    var self = this;
    var _self$plotRange = self.plotRange,
        tl = _self$plotRange.tl,
        bl = _self$plotRange.bl;

    var chart = self.chart;
    var offsetX = legend.offsetX || 0;
    var offsetY = legend.offsetY || 0;
    var chartWidth = chart.get('width');
    var chartHeight = chart.get('height');
    var appendPadding = chart.get('appendPadding');
    var legendHeight = legend.getHeight();
    var legendWidth = legend.getWidth();

    var x = 0;
    var y = 0;
    if (position === 'left' || position === 'right') {
      // position ??? left???right?????????????????????????????????
      var verticalAlign = legend.verticalAlign || 'middle'; // ????????????????????????????????????
      var height = Math.abs(tl.y - bl.y);
      x = position === 'left' ? appendPadding : chartWidth - legendWidth - appendPadding;
      y = (height - legendHeight) / 2 + tl.y;
      if (verticalAlign === 'top') {
        y = tl.y;
      } else if (verticalAlign === 'bottom') {
        y = bl.y - legendHeight;
      }

      if (pre) {
        y = pre.get('y') - legendHeight - LEGEND_GAP;
      }
    } else {
      // position ??? top???bottom???????????????????????????
      var align = legend.align || 'left'; // ????????????????????????????????????
      x = appendPadding;

      if (align === 'center') {
        x = chartWidth / 2 - legendWidth / 2;
      } else if (align === 'right') {
        x = chartWidth - (legendWidth + appendPadding);
      }
      y = position === 'top' ? appendPadding + Math.abs(legend.container.getBBox().minY) : chartHeight - legendHeight;
      if (pre) {
        var preWidth = pre.getWidth();
        x = pre.x + preWidth + LEGEND_GAP;
      }
    }
    if (position === 'bottom' && offsetY > 0) {
      offsetY = 0;
    }
    if (position === 'right' && offsetX > 0) {
      offsetX = 0;
    }
    legend.moveTo(x + offsetX, y + offsetY);
  };

  LegendController.prototype.alignLegends = function alignLegends() {
    var self = this;
    var legends = self.legends;
    Util.each(legends, function (legendItems, position) {
      Util.each(legendItems, function (legend, index) {
        var pre = legendItems[index - 1];
        self._alignLegend(legend, pre, position);
      });
    });

    return self;
  };

  LegendController.prototype.handleEvent = function handleEvent(ev) {
    var self = this;

    function findItem(x, y) {
      var result = null;
      var legends = self.legends;
      Util.each(legends, function (legendItems) {
        Util.each(legendItems, function (legend) {
          var itemsGroup = legend.itemsGroup,
              legendHitBoxes = legend.legendHitBoxes;

          var children = itemsGroup.get('children');
          if (children.length) {
            var legendPosX = legend.x;
            var legendPosY = legend.y;
            Util.each(legendHitBoxes, function (box, index) {
              if (x >= box.x + legendPosX && x <= box.x + box.width + legendPosX && y >= box.y + legendPosY && y <= box.height + box.y + legendPosY) {
                // inbox
                result = {
                  clickedItem: children[index],
                  clickedLegend: legend
                };
                return false;
              }
            });
          }
        });
      });
      return result;
    }

    var chart = self.chart;

    var _Util$createEvent = Util.createEvent(ev, chart),
        x = _Util$createEvent.x,
        y = _Util$createEvent.y;

    var clicked = findItem(x, y);
    if (clicked && clicked.clickedLegend.clickable !== false) {
      var clickedItem = clicked.clickedItem,
          clickedLegend = clicked.clickedLegend;

      if (clickedLegend.onClick) {
        // ???????????????????????????
        ev.clickedItem = clickedItem;
        clickedLegend.onClick(ev);
      } else if (!clickedLegend.custom) {
        // ????????????????????????????????????
        var checked = clickedItem.get('checked');
        var value = clickedItem.get('dataValue');
        var filterVals = clickedLegend.filterVals,
            field = clickedLegend.field,
            selectedMode = clickedLegend.selectedMode;

        var isSingeSelected = selectedMode === 'single';

        if (isSingeSelected) {
          chart.filter(field, function (val) {
            return val === value;
          });
        } else {
          if (!checked) {
            filterVals.push(value);
          } else {
            Util.Array.remove(filterVals, value);
          }

          chart.filter(field, function (val) {
            return filterVals.indexOf(val) !== -1;
          });
        }

        chart.repaint();
      }
    }
  };

  LegendController.prototype.bindEvents = function bindEvents() {
    var legendCfg = this.legendCfg;
    var triggerOn = legendCfg.triggerOn || 'touchstart';
    var method = Util.wrapBehavior(this, 'handleEvent');
    if (Util.isFunction(triggerOn)) {
      triggerOn(method, 'bind');
    } else {
      Util.addEventListener(this.canvasDom, triggerOn, method);
    }
  };

  LegendController.prototype.unBindEvents = function unBindEvents() {
    var legendCfg = this.legendCfg;
    var triggerOn = legendCfg.triggerOn || 'touchstart';
    var method = Util.getWrapBehavior(this, 'handleEvent');
    if (Util.isFunction(triggerOn)) {
      triggerOn(method, 'unBind');
    } else {
      Util.removeEventListener(this.canvasDom, triggerOn, method);
    }
  };

  return LegendController;
}();

module.exports = {
  init: function init(chart) {
    var legendController = new LegendController({
      container: chart.get('backPlot'),
      plotRange: chart.get('plotRange'),
      chart: chart
    });
    chart.set('legendController', legendController);

    /**
     * ????????????
     * @chainable
     * @param  {Boolean|String|Object} field Boolean ???????????????????????????String ??????????????????????????????Object ??????????????????????????????
     * @param  {Object|Boolean} cfg   ??????????????????Object ???????????????????????????????????????Boolean ???????????????????????????
     * @return {Chart}       ???????????? chart ?????????
     */
    chart.legend = function (field, cfg) {
      var legendCfg = legendController.legendCfg;
      legendController.enable = true;

      if (Util.isBoolean(field)) {
        legendController.enable = field;
        legendCfg = cfg || {};
      } else if (Util.isObject(field)) {
        legendCfg = field;
      } else {
        legendCfg[field] = cfg;
      }

      legendController.legendCfg = legendCfg;

      return this;
    };
  },
  beforeGeomDraw: function beforeGeomDraw(chart) {
    var legendController = chart.get('legendController');
    if (!legendController.enable) return null; // legend is not displayed

    var geoms = chart.get('geoms');
    var legendCfg = legendController.legendCfg;
    var scales = [];

    if (legendCfg && legendCfg.custom) {
      // ?????????????????????
      legendController.addCustomLegend();
    } else {
      Util.each(geoms, function (geom) {
        var colorAttr = geom.getAttr('color');
        if (colorAttr) {
          var type = colorAttr.type;
          var scale = colorAttr.getScale(type);
          if (scale.type !== 'identity' && !_isScaleExist(scales, scale)) {
            scales.push(scale);
            // Get filtered values
            var field = scale.field,
                values = scale.values;

            var filters = chart.get('filters');
            var filterVals = void 0;
            if (filters && filters[field]) {
              filterVals = values.filter(filters[field]);
            } else {
              filterVals = values.slice(0);
            }
            legendController.addLegend(scale, colorAttr, filterVals);
          }
        }
      });
    }

    if (legendCfg && legendCfg.clickable !== false) {
      legendController.bindEvents();
    }

    var legends = legendController.legends;
    var legendRange = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    var appendPadding = chart.get('appendPadding');
    Util.each(legends, function (legendItems, position) {
      var padding = 0;
      Util.each(legendItems, function (legend) {
        var width = legend.getWidth();
        var height = legend.getHeight();
        if (position === 'top' || position === 'bottom') {
          padding = Math.max(padding, height);
          if (legend.offsetY > 0) {
            padding += legend.offsetY;
          }
        } else {
          padding = Math.max(padding, width);
          if (legend.offsetX > 0) {
            padding += legend.offsetX;
          }
        }
      });
      legendRange[position] = padding + appendPadding;
    });
    chart.set('legendRange', legendRange);
  },
  afterGeomDraw: function afterGeomDraw(chart) {
    var legendController = chart.get('legendController');
    legendController.alignLegends();

    /**
     * ??????????????? items
     * [getLegendItems description]
     * @return {[type]} [description]
     */
    chart.getLegendItems = function () {
      var result = {};
      var legends = legendController.legends;
      Util.each(legends, function (legendItems) {
        Util.each(legendItems, function (legend) {
          var field = legend.field,
              items = legend.items;

          result[field] = items;
        });
      });
      return result;
    };
  },
  clearInner: function clearInner(chart) {
    var legendController = chart.get('legendController');
    legendController.clear();
    chart.set('legendRange', null);
  }
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * ??????????????????????????????
 * @author sima.zhang
 */
var Util = __webpack_require__(0);
var defaultAnimationCfg = {
  appear: {
    duration: 450,
    easing: 'quadraticOut'
  }, // ????????????????????????
  update: {
    duration: 300,
    easing: 'quadraticOut'
  }, // ????????????????????????????????????
  enter: {
    duration: 300,
    easing: 'quadraticOut'
  }, // ??????????????????????????????????????????
  leave: {
    duration: 350,
    easing: 'quadraticIn' // ???????????????????????????
  } };

var Animate = {
  defaultCfg: {},
  Action: {},
  getAnimation: function getAnimation(geomType, coord, animationType) {
    var geomAnimateCfg = this.defaultCfg[geomType];
    if (geomAnimateCfg) {
      var animation = geomAnimateCfg[animationType];
      if (Util.isFunction(animation)) {
        return animation(coord);
      }
    }
    return false;
  },
  getAnimateCfg: function getAnimateCfg(geomType, animationType) {
    var defaultCfg = defaultAnimationCfg[animationType];
    var geomConfig = this.defaultCfg[geomType];
    if (geomConfig && geomConfig.cfg && geomConfig.cfg[animationType]) {
      return Util.deepMix({}, defaultCfg, geomConfig.cfg[animationType]);
    }
    return defaultCfg;
  },
  registerAnimation: function registerAnimation(animationName, animationFun) {
    if (!this.Action) {
      this.Action = {};
    }
    this.Action[animationName] = animationFun;
  }
};

module.exports = Animate;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * ????????????
 */
var _require = __webpack_require__(6),
    Shape = _require.Shape,
    Matrix = _require.Matrix;

var Util = __webpack_require__(0);

var Helpers = {
  getCoordInfo: function getCoordInfo(coord) {
    var start = coord.start;
    var end = coord.end;
    return {
      start: start,
      end: end,
      width: end.x - start.x,
      height: Math.abs(end.y - start.y)
    };
  },
  getScaledMatrix: function getScaledMatrix(shape, v, direct) {
    var scaledMatrix = void 0;

    shape.apply(v); // shape ????????????????????????
    var x = v[0];
    var y = v[1];

    if (direct === 'x') {
      shape.transform([['t', x, y], ['s', 0.01, 1], ['t', -x, -y]]);
      var matrix = shape.getMatrix();
      scaledMatrix = Matrix.transform(matrix, [['t', x, y], ['s', 100, 1], ['t', -x, -y]]);
    } else if (direct === 'y') {
      shape.transform([['t', x, y], ['s', 1, 0.01], ['t', -x, -y]]);
      var _matrix = shape.getMatrix();
      scaledMatrix = Matrix.transform(_matrix, [['t', x, y], ['s', 1, 100], ['t', -x, -y]]);
    } else if (direct === 'xy') {
      shape.transform([['t', x, y], ['s', 0.01, 0.01], ['t', -x, -y]]);
      var _matrix2 = shape.getMatrix();
      scaledMatrix = Matrix.transform(_matrix2, [['t', x, y], ['s', 100, 100], ['t', -x, -y]]);
    }
    return scaledMatrix;
  },
  getClip: function getClip(coord) {
    var _Helpers$getCoordInfo = Helpers.getCoordInfo(coord),
        start = _Helpers$getCoordInfo.start,
        end = _Helpers$getCoordInfo.end,
        width = _Helpers$getCoordInfo.width,
        height = _Helpers$getCoordInfo.height;

    var margin = 200;
    var clip = void 0;

    if (coord.isPolar) {
      var circleRadius = coord.circleRadius,
          center = coord.center,
          startAngle = coord.startAngle,
          endAngle = coord.endAngle;

      clip = new Shape.Sector({
        attrs: {
          x: center.x,
          y: center.y,
          r: circleRadius + margin,
          r0: 0,
          startAngle: startAngle,
          endAngle: startAngle
        }
      });
      clip.endState = {
        endAngle: endAngle
      };
    } else {
      clip = new Shape.Rect({
        attrs: {
          x: start.x - margin,
          y: end.y - margin,
          width: coord.isTransposed ? width + margin * 2 : 0,
          height: coord.isTransposed ? 0 : height + margin * 2
        }
      });

      if (coord.isTransposed) {
        clip.endState = {
          height: height + margin * 2
        };
      } else {
        clip.endState = {
          width: width + margin * 2
        };
      }
    }
    clip.isClip = true;
    return clip;
  },
  getAnimateParam: function getAnimateParam(animateCfg, index, id) {
    var result = {};
    if (animateCfg.delay) {
      result.delay = Util.isFunction(animateCfg.delay) ? animateCfg.delay(index, id) : animateCfg.delay;
    }
    result.easing = animateCfg.easing;
    result.duration = animateCfg.duration;
    result.delay = animateCfg.delay;
    // result.onStart = animateCfg.onStart;
    // result.onUpdate = animateCfg.onUpdate;
    // result.onEnd = animateCfg.onEnd;
    return result;
  },
  doAnimation: function doAnimation(shape, endState, animateCfg, callback) {
    var id = shape._id;
    var index = shape.get('index');

    var _Helpers$getAnimatePa = Helpers.getAnimateParam(animateCfg, index, id),
        easing = _Helpers$getAnimatePa.easing,
        delay = _Helpers$getAnimatePa.delay,
        duration = _Helpers$getAnimatePa.duration;

    var anim = shape.animate().to({
      attrs: endState,
      duration: duration,
      delay: delay,
      easing: easing
    });

    if (callback) {
      anim.onEnd(function () {
        callback();
      });
    }
  }
};

module.exports = Helpers;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * ???????????????????????????????????????????????????
 */
var F2 = __webpack_require__(27);

__webpack_require__(88);
__webpack_require__(61);

__webpack_require__(64); // ????????????
__webpack_require__(71); // ?????????????????????????????????

__webpack_require__(72); // timeCat ???????????????

__webpack_require__(74); // ?????? guide ??????

var Tooltip = __webpack_require__(81);
var Guide = __webpack_require__(83);
var Legend = __webpack_require__(84);
var Animation = __webpack_require__(93); // ??????????????????

F2.Animate = __webpack_require__(85);
// ????????????
F2.Chart.plugins.register([Tooltip, Legend, Guide, Animation]);

module.exports = F2;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var Geom = __webpack_require__(4);

__webpack_require__(67);
__webpack_require__(25);
__webpack_require__(58);
__webpack_require__(69);
__webpack_require__(59);
__webpack_require__(89);
__webpack_require__(91);

module.exports = Geom;

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Geom = __webpack_require__(4);
var Util = __webpack_require__(0);
__webpack_require__(90);

var Polygon = function (_Geom) {
  _inherits(Polygon, _Geom);

  function Polygon() {
    _classCallCheck(this, Polygon);

    return _possibleConstructorReturn(this, _Geom.apply(this, arguments));
  }

  /**
   * ???????????????????????????
   * @protected
   * @return {Object} ????????????
   */
  Polygon.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'polygon';
    cfg.shapeType = 'polygon';
    cfg.generatePoints = true;
    return cfg;
  };

  Polygon.prototype.createShapePointsCfg = function createShapePointsCfg(obj) {
    var cfg = _Geom.prototype.createShapePointsCfg.call(this, obj);
    var self = this;
    var x = cfg.x;
    var y = cfg.y;
    var temp = void 0;
    if (!(Util.isArray(x) && Util.isArray(y))) {
      // x y ??????????????????????????????
      var xScale = self.getXScale();
      var yScale = self.getYScale();
      var xCount = xScale.values ? xScale.values.length : xScale.ticks.length;
      var yCount = yScale.values ? yScale.values.length : yScale.ticks.length;
      var xOffset = 0.5 * 1 / xCount;
      var yOffset = 0.5 * 1 / yCount;
      if (xScale.isCategory && yScale.isCategory) {
        // ??????x,y????????????
        x = [x - xOffset, x - xOffset, x + xOffset, x + xOffset];
        y = [y - yOffset, y + yOffset, y + yOffset, y - yOffset];
      } else if (Util.isArray(x)) {
        // x ?????????
        temp = x;
        x = [temp[0], temp[0], temp[1], temp[1]];
        y = [y - yOffset / 2, y + yOffset / 2, y + yOffset / 2, y - yOffset / 2];
      } else if (Util.isArray(y)) {
        // y ?????????
        temp = y;
        y = [temp[0], temp[1], temp[1], temp[0]];
        x = [x - xOffset / 2, x - xOffset / 2, x + xOffset / 2, x + xOffset / 2];
      }
      cfg.x = x;
      cfg.y = y;
    }
    return cfg;
  };

  return Polygon;
}(Geom);

Geom.Polygon = Polygon;

module.exports = Polygon;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(5);
var Util = __webpack_require__(0);

var Polygon = Shape.registerFactory('polygon', {
  defaultShapeType: 'polygon',
  getDefaultPoints: function getDefaultPoints(pointInfo) {
    var points = [];
    var x = pointInfo.x,
        y = pointInfo.y;

    for (var i = 0, len = x.length; i < len; i++) {
      points.push({
        x: x[i],
        y: y[i]
      });
    }
    return points;
  }
});

Shape.registerShape('polygon', 'polygon', {
  draw: function draw(cfg, container) {
    var points = this.parsePoints(cfg.points);
    var style = Util.mix({
      fill: cfg.color,
      points: points
    }, cfg.style);
    // G.drawLines(points, canvas, style);
    return container.addShape('Polygon', {
      className: 'polygon',
      attrs: style
    });
  }
});

module.exports = Polygon;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Geom = __webpack_require__(4);
var Util = __webpack_require__(0);
var SizeMixin = __webpack_require__(26);
__webpack_require__(92);

var Schema = function (_Geom) {
  _inherits(Schema, _Geom);

  Schema.prototype.getDefaultCfg = function getDefaultCfg() {
    var cfg = _Geom.prototype.getDefaultCfg.call(this);
    cfg.type = 'schema';
    cfg.shapeType = 'schema';
    cfg.generatePoints = true;
    return cfg;
  };

  function Schema(cfg) {
    _classCallCheck(this, Schema);

    var _this = _possibleConstructorReturn(this, _Geom.call(this, cfg));

    Util.mix(_this, SizeMixin);
    return _this;
  }

  Schema.prototype.createShapePointsCfg = function createShapePointsCfg(obj) {
    var cfg = _Geom.prototype.createShapePointsCfg.call(this, obj);
    cfg.size = this.getNormalizedSize(obj);
    return cfg;
  };

  Schema.prototype.clearInner = function clearInner() {
    _Geom.prototype.clearInner.call(this);
    this.set('defaultSize', null);
  };

  return Schema;
}(Geom);

Geom.Schema = Schema;

module.exports = Schema;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(5);
var Util = __webpack_require__(0);
// START candle shape
function _sortValue(value) {
  // ??????????????????
  var sorted = value.sort(function (a, b) {
    return a < b ? 1 : -1;
  });

  var length = sorted.length;
  if (length < 4) {
    var min = sorted[length - 1];
    for (var i = 0; i < 4 - length; i++) {
      sorted.push(min);
    }
  }
  return sorted;
}

// ?????????????????????????????????
function getCandlePoints(x, y, width) {
  var yValues = _sortValue(y);
  var points = [{
    x: x,
    y: yValues[0]
  }, {
    x: x,
    y: yValues[1]
  }, {
    x: x - width / 2,
    y: yValues[2]
  }, {
    x: x - width / 2,
    y: yValues[1]
  }, {
    x: x + width / 2,
    y: yValues[1]
  }, {
    x: x + width / 2,
    y: yValues[2]
  }, {
    x: x,
    y: yValues[2]
  }, {
    x: x,
    y: yValues[3]
  }];
  return points;
}

var Schema = Shape.registerFactory('schema', {});

Shape.registerShape('schema', 'candle', {
  // ????????????k????????????
  getPoints: function getPoints(cfg) {
    return getCandlePoints(cfg.x, cfg.y, cfg.size);
  },

  // ??????k??????
  draw: function draw(cfg, container) {
    var points = this.parsePoints(cfg.points);
    var style = Util.mix({
      stroke: cfg.color,
      fill: cfg.color,
      lineWidth: 1
    }, cfg.style);
    return container.addShape('Custom', {
      className: 'schema',
      attrs: style,
      createPath: function createPath(ctx) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);

        ctx.moveTo(points[2].x, points[2].y);
        for (var i = 3; i < 6; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.moveTo(points[6].x, points[6].y);
        ctx.lineTo(points[7].x, points[7].y);
      }
    });
  }
});

module.exports = Schema;

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * ?????????????????????????????????????????????
 * @author sima.zhang
 */
var Util = __webpack_require__(0);
var Element = __webpack_require__(16);
var Timeline = __webpack_require__(94);
var Animator = __webpack_require__(95);
var Animate = __webpack_require__(85);
var ShapeAction = __webpack_require__(97);
var GroupAction = __webpack_require__(98);
var Chart = __webpack_require__(24);

var timeline = void 0;
Element.prototype.animate = function () {
  var attrs = this.get('attrs');
  return new Animator(this, attrs, timeline);
};

Chart.prototype.animate = function (cfg) {
  this.set('animate', cfg);
  return this;
};

Animate.Action = ShapeAction;
Animate.defaultCfg = {
  interval: {
    enter: function enter(coord) {
      if (coord.isPolar && coord.transposed) {
        // ??????????????????
        return function (shape) {
          shape.set('zIndex', -1);
          var container = shape.get('parent');
          container.sort();
        };
      }
      return ShapeAction.fadeIn;
    }
  },
  area: {
    enter: function enter(coord) {
      if (coord.isPolar) return null;
      return ShapeAction.fadeIn;
    }
  },
  line: {
    enter: function enter(coord) {
      if (coord.isPolar) return null;

      return ShapeAction.fadeIn;
    }
  },
  path: {
    enter: function enter(coord) {
      if (coord.isPolar) return null;

      return ShapeAction.fadeIn;
    }
  }
};

var GROUP_ANIMATION = {
  line: function line(coord) {
    if (coord.isPolar) {
      return GroupAction.groupScaleInXY;
    }
    return GroupAction.groupWaveIn;
  },
  area: function area(coord) {
    if (coord.isPolar) {
      return GroupAction.groupScaleInXY;
    }
    return GroupAction.groupWaveIn;
  },
  path: function path(coord) {
    if (coord.isPolar) {
      return GroupAction.groupScaleInXY;
    }
    return GroupAction.groupWaveIn;
  },
  point: function point() {
    return GroupAction.shapesScaleInXY;
  },
  interval: function interval(coord) {
    var result = void 0;
    if (coord.isPolar) {
      // ?????????
      result = GroupAction.groupScaleInXY; // ?????????????????????
      if (coord.transposed) {
        // ??????
        result = GroupAction.groupWaveIn;
      }
    } else {
      result = coord.transposed ? GroupAction.groupScaleInX : GroupAction.groupScaleInY;
    }
    return result;
  },
  schema: function schema() {
    return GroupAction.groupWaveIn;
  }
};

function diff(fromAttrs, toAttrs) {
  var endState = {};
  for (var k in toAttrs) {
    if (Util.isNumber(fromAttrs[k]) && fromAttrs[k] !== toAttrs[k]) {
      endState[k] = toAttrs[k];
    } else if (Util.isArray(fromAttrs[k]) && JSON.stringify(fromAttrs[k]) !== JSON.stringify(toAttrs[k])) {
      endState[k] = toAttrs[k];
    }
  }
  return endState;
}

// ????????? shape ??????????????? id ??????
function _getShapeId(geom, dataObj) {
  var type = geom.get('type');
  var id = 'geom-' + type;
  var xScale = geom.getXScale();
  var yScale = geom.getYScale();
  var xField = xScale.field || 'x';
  var yField = yScale.field || 'y';
  var yVal = dataObj[yField];
  var xVal = void 0;
  if (xScale.isIdentity) {
    xVal = xScale.value;
  } else {
    xVal = dataObj[xField];
  }

  if (type === 'interval' || type === 'schema') {
    id += '-' + xVal;
  } else if (type === 'line' || type === 'area' || type === 'path') {
    id += '-' + type;
  } else {
    // ??????????????????????????? xVal
    id += xScale.isCategory ? '-' + xVal : '-' + xVal + '-' + yVal;
  }

  var groupScales = geom._getGroupScales();
  Util.each(groupScales, function (groupScale) {
    var field = groupScale.field;
    if (groupScale.type !== 'identity') {
      id += '-' + dataObj[field];
    }
  });

  return id;
}

// ????????????????????????shapes
function getShapes(geoms, chart, coord) {
  var shapes = [];

  Util.each(geoms, function (geom) {
    var geomContainer = geom.get('container');
    var geomShapes = geomContainer.get('children'); // ????????????????????? shapes
    // const coord = geom.get('coord');
    var type = geom.get('type');
    var animateCfg = Util.isNil(geom.get('animateCfg')) ? _getAnimateCfgByShapeType(type, chart) : geom.get('animateCfg');
    if (animateCfg !== false) {
      Util.each(geomShapes, function (shape, index) {
        if (shape.get('className') === type) {
          shape._id = _getShapeId(geom, shape.get('origin')._origin);
          shape.set('coord', coord);
          shape.set('animateCfg', animateCfg);
          shape.set('index', index);
          shapes.push(shape);
        }
      });
    }
    geom.set('shapes', geomShapes);
  });
  return shapes;
}

function cache(shapes) {
  var rst = {};
  for (var i = 0, len = shapes.length; i < len; i++) {
    var shape = shapes[i];
    if (!shape._id || shape.isClip) continue;
    var id = shape._id;
    rst[id] = {
      _id: id,
      type: shape.get('type'), // ????????????
      attrs: Util.mix({}, shape._attrs.attrs), // ????????????
      className: shape.get('className'),
      geomType: shape.get('className'),
      index: shape.get('index'),
      coord: shape.get('coord'),
      animateCfg: shape.get('animateCfg')
    };
  }
  return rst;
}

function getAnimate(geomType, coord, animationType, animationName) {
  var result = void 0;

  if (Util.isFunction(animationName)) {
    result = animationName;
  } else if (Util.isString(animationName)) {
    result = Animate.Action[animationName];
  } else {
    result = Animate.getAnimation(geomType, coord, animationType);
  }
  return result;
}

function getAnimateCfg(geomType, animationType, animateCfg) {
  if (animateCfg && animateCfg[animationType] === false) {
    return false;
  }

  var defaultCfg = Animate.getAnimateCfg(geomType, animationType);
  if (animateCfg && animateCfg[animationType]) {
    return Util.deepMix({}, defaultCfg, animateCfg[animationType]);
  }
  return defaultCfg;
}

function addAnimate(cache, shapes, canvas) {
  var animate = void 0;
  var animateCfg = void 0;

  // ??????????????????: leave -> update -> enter
  var updateShapes = []; // ???????????? shapes
  var newShapes = []; // ???????????? shapes
  Util.each(shapes, function (shape) {
    var result = cache[shape._id];
    if (!result) {
      newShapes.push(shape);
    } else {
      shape.set('cacheShape', result);
      updateShapes.push(shape);
      delete cache[shape._id];
    }
  });

  // ??????????????????
  Util.each(cache, function (deletedShape) {
    var className = deletedShape.className,
        coord = deletedShape.coord,
        _id = deletedShape._id,
        attrs = deletedShape.attrs,
        index = deletedShape.index,
        type = deletedShape.type;


    animateCfg = getAnimateCfg(className, 'leave', deletedShape.animateCfg);
    if (animateCfg === false) return true;

    animate = getAnimate(className, coord, 'leave', animateCfg.animation);
    if (Util.isFunction(animate)) {
      var tempShape = canvas.addShape(type, {
        attrs: attrs,
        index: index,
        canvas: canvas,
        className: className
      });
      tempShape._id = _id;
      animate(tempShape, animateCfg, coord);
    }
  });

  // ??????????????????
  Util.each(updateShapes, function (updateShape) {
    var className = updateShape.get('className');

    animateCfg = getAnimateCfg(className, 'update', updateShape.get('animateCfg'));
    if (animateCfg === false) return true;

    var coord = updateShape.get('coord');
    var cacheAttrs = updateShape.get('cacheShape').attrs;
    var endState = diff(cacheAttrs, updateShape._attrs.attrs); // ????????????????????????????????????????????????
    if (Object.keys(endState).length) {
      animate = getAnimate(className, coord, 'update', animateCfg.animation);
      if (Util.isFunction(animate)) {
        animate(updateShape, animateCfg, coord);
      } else {
        updateShape.attr(cacheAttrs);
        updateShape.animate().to({
          attrs: endState,
          duration: animateCfg.duration,
          easing: animateCfg.easing,
          delay: animateCfg.delay
        }).onEnd(function () {
          updateShape.set('cacheShape', null);
        });
      }
    }
  });

  // ????????? shape ??????
  Util.each(newShapes, function (newShape) {
    // ??????????????????????????????
    var className = newShape.get('className');
    var coord = newShape.get('coord');

    animateCfg = getAnimateCfg(className, 'enter', newShape.get('animateCfg'));
    if (animateCfg === false) return true;

    animate = getAnimate(className, coord, 'enter', animateCfg.animation);
    if (Util.isFunction(animate)) {
      if (className === 'interval' && coord.isPolar && coord.transposed) {
        var index = newShape.get('index');
        var lastShape = updateShapes[index - 1];
        animate(newShape, animateCfg, lastShape);
      } else {
        animate(newShape, animateCfg, coord);
      }
    }
  });
}

function _getAnimateCfgByShapeType(type, chart) {
  var animateCfg = chart.get('animate');

  if (animateCfg) {
    return animateCfg[type];
  }

  return null;
}

module.exports = {
  afterCanvasInit: function afterCanvasInit() /* chart */{
    timeline = new Timeline();
    timeline.play();
  },
  beforeCanvasDraw: function beforeCanvasDraw(chart) {
    if (chart.get('animate') === false) {
      return;
    }

    var isUpdate = chart.get('isUpdate');
    var canvas = chart.get('canvas');
    var coord = chart.get('coord');
    var geoms = chart.get('geoms');

    var caches = canvas.get('caches') || [];
    if (caches.length === 0) {
      isUpdate = false;
    }

    var shapes = getShapes(geoms, chart, coord); // geom ????????????

    var _chart$get = chart.get('axisController'),
        frontPlot = _chart$get.frontPlot,
        backPlot = _chart$get.backPlot;

    var axisShapes = [];
    // get axes' shapes
    frontPlot.get('children').concat(backPlot.get('children')).forEach(function (s) {
      var className = s.get('className');
      s.set('coord', coord);
      s.set('animateCfg', _getAnimateCfgByShapeType(className, chart));
      axisShapes.push(s);
    });

    var cacheShapes = shapes.concat(axisShapes);
    canvas.set('caches', cache(cacheShapes));

    if (isUpdate) {
      addAnimate(caches, cacheShapes, canvas);
    } else {
      // ??????????????????
      var animateCfg = void 0;
      var animate = void 0;
      Util.each(geoms, function (geom) {
        var type = geom.get('type');
        var geomCfg = Util.isNil(geom.get('animateCfg')) ? _getAnimateCfgByShapeType(type, chart) : geom.get('animateCfg');
        if (geomCfg !== false) {
          animateCfg = getAnimateCfg(type, 'appear', geomCfg);
          animate = getAnimate(type, coord, 'appear', animateCfg.animation);
          if (Util.isFunction(animate)) {
            // ???????????????????????????
            var _shapes = geom.get('shapes');
            Util.each(_shapes, function (shape) {
              animate(shape, animateCfg, coord);
            });
          } else if (GROUP_ANIMATION[type]) {
            // ????????????????????????
            animate = GroupAction[animateCfg.animation] || GROUP_ANIMATION[type](coord);

            var yScale = geom.getYScale();
            var zeroY = coord.convertPoint({
              x: 0,
              y: yScale.scale(geom.getYMinValue())
            });

            var container = geom.get('container');
            animate && animate(container, animateCfg, coord, zeroY);
          }
        }
      });
    }
  },
  afterCanvasDestroyed: function afterCanvasDestroyed() /* chart */{
    timeline.stop();
  }
};

/***/ }),
/* 94 */
/***/ (function(module, exports) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestAnimationFrame = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.requestAnimationFrame ? window.requestAnimationFrame : function (fn) {
  return setTimeout(fn, 16);
};
// const cancelAnimationFrame = typeof window === 'object' && window.cancelAnimationFrame ? window.cancelAnimationFrame : function(id) {
//   return clearInterval(id);
// };

var clock = (typeof performance === 'undefined' ? 'undefined' : _typeof(performance)) === 'object' && performance.now ? performance : Date;

var Timeline = function () {
  function Timeline() {
    _classCallCheck(this, Timeline);

    this.anims = [];
    this.time = null;
    this.playing = false;
    this.canvas = [];
  }

  Timeline.prototype.play = function play() {
    var self = this;
    self.time = clock.now();
    self.playing = true;

    function step() {
      if (self.playing) {
        requestAnimationFrame(step);
        self.update();
      }
    }

    requestAnimationFrame(step);
  };

  Timeline.prototype.stop = function stop() {
    this.playing = false;
    this.time = null;
    this.canvas = [];
  };

  Timeline.prototype.update = function update() {
    var currentTime = clock.now();
    this.canvas = [];

    for (var i = 0; i < this.anims.length; i++) {
      var propertyAnim = this.anims[i];
      if (currentTime < propertyAnim.startTime || propertyAnim.hasEnded) {
        continue;
      }
      var shape = propertyAnim.shape; // shape
      if (shape.get('destroyed')) {
        this.anims.splice(i, 1);
        i--;
        continue;
      }

      var startState = propertyAnim.startState,
          endState = propertyAnim.endState,
          interpolate = propertyAnim.interpolate,
          duration = propertyAnim.duration;

      if (currentTime >= propertyAnim.startTime && !propertyAnim.hasStarted) {
        propertyAnim.hasStarted = true;
        if (propertyAnim.onStart) {
          propertyAnim.onStart();
        }
      }
      var t = (currentTime - propertyAnim.startTime) / duration;
      t = Math.max(0, Math.min(t, 1));
      t = propertyAnim.easing(t);

      if (propertyAnim.onFrame) {
        propertyAnim.onFrame(t);
      } else {
        for (var key in interpolate) {
          var diff = interpolate[key];
          var value = diff(t);
          var newValue = void 0;
          if (key === 'points') {
            newValue = [];
            var aLen = Math.max(startState.points.length, endState.points.length);
            for (var j = 0; j < aLen; j += 2) {
              newValue.push({
                x: value[j],
                y: value[j + 1]
              });
            }
          } else {
            newValue = value;
          }
          shape._attrs.attrs[key] = newValue;
        }
      }

      var canvas = shape.get('canvas');
      if (this.canvas.indexOf(canvas) === -1) {
        this.canvas.push(canvas);
      }

      if (propertyAnim.onUpdate) {
        propertyAnim.onUpdate();
      }

      if (currentTime >= propertyAnim.endTime && !propertyAnim.hasEnded) {
        propertyAnim.hasEnded = true;
        if (propertyAnim.onEnd) {
          propertyAnim.onEnd();
        }
      }

      if (t === 1) {
        // ??????
        this.anims.splice(i, 1);
        i--;
      }
    }

    this.canvas.map(function (c) {
      c.draw();
      return c;
    });
    this.time = clock.now();
  };

  return Timeline;
}();

// Timeline.getGlobalInstance = function() {
//   if (!Timeline.globalInstance) {
//     Timeline.globalInstance = new Timeline();
//   }
//   return Timeline.globalInstance;
// };

module.exports = Timeline;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Easing = __webpack_require__(96);

function plainArray(arr) {
  var result = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i]) {
      result.push(arr[i].x);
      result.push(arr[i].y);
    }
  }
  return result;
}

function interpolateNumber(a, b) {
  a = +a;
  b -= a;
  return function (t) {
    return a + b * t;
  };
}

function interpolateArray(a, b) {
  var nb = b ? b.length : 0;
  var na = a ? Math.min(nb, a.length) : 0;
  var x = new Array(na);
  var c = new Array(nb);
  var i = void 0;

  for (i = 0; i < na; ++i) {
    x[i] = interpolateNumber(a[i], b[i]);
  }for (; i < nb; ++i) {
    c[i] = b[i];
  }return function (t) {
    for (i = 0; i < na; ++i) {
      c[i] = x[i](t);
    }return c;
  };
}

var Animator = function () {
  function Animator(shape, source, timeline) {
    _classCallCheck(this, Animator);

    this.hasStarted = false;
    this.hasEnded = false;
    this.shape = shape;
    this.source = source;
    this.timeline = timeline;
    this.animate = null;
  }

  // delay, attrs, duration, easing


  Animator.prototype.to = function to() {
    var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var delay = cfg.delay || 0;
    var attrs = cfg.attrs || {};
    var duration = cfg.duration || 1000;

    var easing = void 0; // ????????????
    if (typeof cfg.easing === 'function') {
      easing = cfg.easing;
    } else {
      easing = Easing[cfg.easing] || Easing.linear;
    }

    var animInfo = {
      shape: this.shape,
      startTime: this.timeline.time + delay,
      duration: duration,
      easing: easing
    };

    var interpolate = {}; // ????????????
    for (var attrName in attrs) {
      var startValue = this.source[attrName];
      var endValue = attrs[attrName];
      if (attrName === 'points') {
        startValue = plainArray(startValue);
        endValue = plainArray(endValue);
        interpolate.points = interpolateArray(startValue, endValue);
        this.source.points = startValue;
        attrs.points = endValue;
      } else if (attrName === 'matrix') {
        interpolate.matrix = interpolateArray(startValue, endValue);
      } else {
        interpolate[attrName] = interpolateNumber(startValue, endValue);
      }
    }
    animInfo.interpolate = interpolate;
    animInfo.startState = this.source;
    animInfo.endState = attrs;
    animInfo.endTime = animInfo.startTime + duration;

    this.timeline.anims.push(animInfo);
    this.animate = animInfo;
    return this;
  };

  Animator.prototype.onFrame = function onFrame(callback) {
    // ?????????????????????????????????
    if (this.animate) {
      this.animate.onFrame = function (frame) {
        callback(frame);
      };
    }

    return this;
  };

  Animator.prototype.onStart = function onStart(callback) {
    if (this.animate) {
      this.animate.onStart = function () {
        callback();
      };
    }

    return this;
  };

  Animator.prototype.onUpdate = function onUpdate(callback) {
    if (this.animate) {
      this.animate.onUpdate = function () {
        callback();
      };
    }

    return this;
  };

  Animator.prototype.onEnd = function onEnd(callback) {
    if (this.animate) {
      this.animate.onEnd = function () {
        callback();
      };
    }

    return this;
  };

  return Animator;
}();

module.exports = Animator;

/***/ }),
/* 96 */
/***/ (function(module, exports) {

var Easing = {
  linear: function linear(k) {
    return k;
  },
  quadraticIn: function quadraticIn(k) {
    return k * k;
  },
  quadraticOut: function quadraticOut(k) {
    return k * (2 - k);
  },
  quadraticInOut: function quadraticInOut(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2) - 1);
  },
  cubicIn: function cubicIn(k) {
    return k * k * k;
  },
  cubicOut: function cubicOut(k) {
    return --k * k * k + 1;
  },
  cubicInOut: function cubicInOut(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k + 2);
  },
  elasticIn: function elasticIn(k) {
    var s = void 0;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
  },
  elasticOut: function elasticOut(k) {
    var s = void 0;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
  },
  elasticInOut: function elasticInOut(k) {
    var s = void 0;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    if ((k *= 2) < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    }
    return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
  },
  backIn: function backIn(k) {
    var s = 1.70158;
    return k * k * ((s + 1) * k - s);
  },
  backOut: function backOut(k) {
    var s = 1.70158;
    return (k = k - 1) * k * ((s + 1) * k + s) + 1;
  },
  backInOut: function backInOut(k) {
    var s = 1.70158 * 1.525;
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s));
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  },
  bounceIn: function bounceIn(k) {
    return 1 - Easing.bounceOut(1 - k);
  },
  bounceOut: function bounceOut(k) {
    if ((k /= 1) < 1 / 2.75) {
      return 7.5625 * k * k;
    } else if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
    } else if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
    }

    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
  },
  bounceInOut: function bounceInOut(k) {
    if (k < 0.5) {
      return Easing.bounceIn(k * 2) * 0.5;
    }
    return Easing.bounceOut(k * 2 - 1) * 0.5 + 0.5;
  }
};

module.exports = Easing;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @fileOverview ?????? shape ??????????????????
 * @author sima.zhang
 */
var Util = __webpack_require__(0);
var Helpers = __webpack_require__(86);

/*
function waveIn(shape, animateCfg, coord) {
  const clip = Helpers.getClip(coord);
  clip.set('canvas', shape.get('canvas'));
  shape.attr('clip', clip);
  const onEnd = function() {
    shape.attr('clip', null);
    clip.remove(true);
  };
  Helpers.doAnimation(clip, clip.endState, animateCfg, onEnd);
}

function scaleInX(shape, animateCfg) {
  const box = shape.getBBox();
  const points = shape.get('origin').points;
  let x;
  const y = (box.minY + box.maxY) / 2;

  if (points[0].y - points[1].y > 0) { // ????????????????????????
    x = box.maxX;
  } else {
    x = box.minX;
  }
  const scaledMatrix = Helpers.getScaledMatrix(shape, [ x, y ], 'x');
  Helpers.doAnimation(shape, { matrix: scaledMatrix }, animateCfg);
}

function scaleInY(shape, animateCfg) {
  const box = shape.getBBox();
  const points = shape.get('origin').points;
  const x = (box.minX + box.maxX) / 2;
  let y;

  if (points[0].y - points[1].y <= 0) { // ????????????????????????
    y = box.maxY;
  } else {
    y = box.minY;
  }
  const scaledMatrix = Helpers.getScaledMatrix(shape, [ x, y ], 'x');
  Helpers.doAnimation(shape, { matrix: scaledMatrix }, animateCfg);
}
*/

function fadeIn(shape, animateCfg) {
  var fillOpacity = Util.isNil(shape.attr('fillOpacity')) ? 1 : shape.attr('fillOpacity');
  var strokeOpacity = Util.isNil(shape.attr('strokeOpacity')) ? 1 : shape.attr('strokeOpacity');
  shape.attr('fillOpacity', 0);
  shape.attr('strokeOpacity', 0);
  var endState = {
    fillOpacity: fillOpacity,
    strokeOpacity: strokeOpacity
  };
  Helpers.doAnimation(shape, endState, animateCfg);
}

// ???????????????
module.exports = {
  // waveIn,
  // scaleInX,
  // scaleInY,
  fadeIn: fadeIn
};

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * ????????????
 * @author sima.zhang
 */
var Helpers = __webpack_require__(86);

var _require = __webpack_require__(6),
    Shape = _require.Shape;

function _groupScaleIn(container, animateCfg, coord, zeroY, type) {
  var _Helpers$getCoordInfo = Helpers.getCoordInfo(coord),
      start = _Helpers$getCoordInfo.start,
      end = _Helpers$getCoordInfo.end,
      width = _Helpers$getCoordInfo.width,
      height = _Helpers$getCoordInfo.height;

  var x = void 0;
  var y = void 0;

  var clip = new Shape.Rect({
    attrs: {
      x: start.x,
      y: end.y,
      width: width,
      height: height
    }
  });

  if (type === 'y') {
    x = start.x + width / 2;
    y = zeroY.y < start.y ? zeroY.y : start.y;
  } else if (type === 'x') {
    x = zeroY.x > start.x ? zeroY.x : start.x;
    y = start.y + height / 2;
  } else if (type === 'xy') {
    if (coord.isPolar) {
      x = coord.center.x;
      y = coord.center.y;
    } else {
      x = (start.x + end.x) / 2;
      y = (start.y + end.y) / 2;
    }
  }

  var endMatrix = Helpers.getScaledMatrix(clip, [x, y], type);
  clip.isClip = true;
  clip.endState = {
    matrix: endMatrix
  };

  clip.set('canvas', container.get('canvas'));
  container.attr('clip', clip);
  var onEnd = function onEnd() {
    container.attr('clip', null);
    clip.remove(true);
  };
  Helpers.doAnimation(clip, clip.endState, animateCfg, onEnd);
}

function _shapeScale(container, animateCfg, type) {
  var shapes = container.get('children');
  var x = void 0;
  var y = void 0;
  var endMatrix = void 0;

  for (var i = 0, len = shapes.length; i < len; i++) {
    var shape = shapes[i];
    var box = shape.getBBox();
    x = (box.minX + box.maxX) / 2;
    y = (box.minY + box.maxY) / 2;
    endMatrix = Helpers.getScaledMatrix(shape, [x, y], type);
    Helpers.doAnimation(shape, { matrix: endMatrix }, animateCfg);
  }
}

function groupScaleInX(container, animateCfg, coord, zeroY) {
  _groupScaleIn(container, animateCfg, coord, zeroY, 'x');
}

function groupScaleInY(container, animateCfg, coord, zeroY) {
  _groupScaleIn(container, animateCfg, coord, zeroY, 'y');
}

function groupScaleInXY(container, animateCfg, coord, zeroY) {
  _groupScaleIn(container, animateCfg, coord, zeroY, 'xy');
}

function shapesScaleInX(container, animateCfg) {
  _shapeScale(container, animateCfg, 'x');
}

function shapesScaleInY(container, animateCfg) {
  _shapeScale(container, animateCfg, 'y');
}

function shapesScaleInXY(container, animateCfg) {
  _shapeScale(container, animateCfg, 'xy');
}

function groupWaveIn(container, animateCfg, coord) {
  var clip = Helpers.getClip(coord);
  clip.set('canvas', container.get('canvas'));
  container.attr('clip', clip);
  var onEnd = function onEnd() {
    container.attr('clip', null);
    clip.remove(true);
  };
  Helpers.doAnimation(clip, clip.endState, animateCfg, onEnd);
}

module.exports = {
  groupWaveIn: groupWaveIn,
  groupScaleInX: groupScaleInX,
  groupScaleInY: groupScaleInY,
  groupScaleInXY: groupScaleInXY,
  shapesScaleInX: shapesScaleInX,
  shapesScaleInY: shapesScaleInY,
  shapesScaleInXY: shapesScaleInXY
};

/***/ })
/******/ ]);
});