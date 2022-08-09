(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":3,"get-intrinsic":6}],3:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":5,"get-intrinsic":6}],4:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],5:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":4}],6:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/g, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":5,"has":9,"has-symbols":7}],7:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":8}],8:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],9:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":5}],10:[function(require,module,exports){
var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

function addNumericSeparator(num, str) {
    if (
        num === Infinity
        || num === -Infinity
        || num !== num
        || (num && num > -1000 && num < 1000)
        || $test.call(/e/, str)
    ) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace.call(str, sepRegex, '$&_');
}

var utilInspect = require('./util.inspect');
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;

module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has(opts, 'quoteStyle') && (opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double')) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) { // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        mapForEach.call(obj, function (value, key) {
            mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
        });
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        setForEach.call(obj, function (value) {
            setParts.push(inspect(value, obj));
        });
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace.call(String(s), /"/g, '&quot;');
}

function isArray(obj) { return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isDate(obj) { return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isRegExp(obj) { return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isError(obj) { return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isString(obj) { return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isNumber(obj) { return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isBoolean(obj) { return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = $replace.call($replace.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

},{"./util.inspect":1}],11:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};

},{}],12:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":11,"./parse":13,"./stringify":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(
                parseArrayValue(part.slice(pos + 1), options),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else if (cleanRoot !== '__proto__') {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};

},{"./utils":15}],14:[function(require,module,exports){
'use strict';

var getSideChannel = require('side-channel');
var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var split = String.prototype.split;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    commaRoundTrip,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    format,
    formatter,
    encodeValuesOnly,
    charset,
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            if (generateArrayPrefix === 'comma' && encodeValuesOnly) {
                var valuesArray = split.call(String(obj), ',');
                var valuesJoined = '';
                for (var i = 0; i < valuesArray.length; ++i) {
                    valuesJoined += (i === 0 ? '' : ',') + formatter(encoder(valuesArray[i], defaults.encoder, charset, 'value', format));
                }
                return [formatter(keyValue) + (commaRoundTrip && isArray(obj) && valuesArray.length === 1 ? '[]' : '') + '=' + valuesJoined];
            }
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? prefix + '[]' : prefix;

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix
            : adjustedPrefix + (allowDots ? '.' + key : '[' + key + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
    if (opts && 'commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    var commaRoundTrip = generateArrayPrefix === 'comma' && opts && opts.commaRoundTrip;

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

},{"./formats":11,"./utils":15,"side-channel":16}],15:[function(require,module,exports){
'use strict';

var formats = require('./formats');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
            || (format === formats.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        /* eslint operator-linebreak: [2, "before"] */
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};

},{"./formats":11}],16:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');
var inspect = require('object-inspect');

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);

var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);

/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */
var listGetNode = function (list, key) { // eslint-disable-line consistent-return
	for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr; // eslint-disable-line no-param-reassign
			return curr;
		}
	}
};

var listGet = function (objects, key) {
	var node = listGetNode(objects, key);
	return node && node.value;
};
var listSet = function (objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = { // eslint-disable-line no-param-reassign
			key: key,
			next: objects.next,
			value: value
		};
	}
};
var listHas = function (objects, key) {
	return !!listGetNode(objects, key);
};

module.exports = function getSideChannel() {
	var $wm;
	var $m;
	var $o;
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		get: function (key) { // eslint-disable-line consistent-return
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapGet($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapGet($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listGet($o, key);
				}
			}
		},
		has: function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapHas($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapHas($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listHas($o, key);
				}
			}
			return false;
		},
		set: function (key, value) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if (!$wm) {
					$wm = new $WeakMap();
				}
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				if (!$m) {
					$m = new $Map();
				}
				$mapSet($m, key, value);
			} else {
				if (!$o) {
					/*
					 * Initialize the linked list as an empty node, so that we don't have
					 * to special-case handling of the first node: we can always refer to
					 * it as (previous node).next, instead of something like (list).head
					 */
					$o = { key: {}, next: null };
				}
				listSet($o, key, value);
			}
		}
	};
	return channel;
};

},{"call-bind/callBound":2,"get-intrinsic":6,"object-inspect":10}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function () {
    return _v.default;
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function () {
    return _v2.default;
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function () {
    return _v3.default;
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function () {
    return _v4.default;
  }
});
Object.defineProperty(exports, "NIL", {
  enumerable: true,
  get: function () {
    return _nil.default;
  }
});
Object.defineProperty(exports, "version", {
  enumerable: true,
  get: function () {
    return _version.default;
  }
});
Object.defineProperty(exports, "validate", {
  enumerable: true,
  get: function () {
    return _validate.default;
  }
});
Object.defineProperty(exports, "stringify", {
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function () {
    return _parse.default;
  }
});

var _v = _interopRequireDefault(require("./v1.js"));

var _v2 = _interopRequireDefault(require("./v3.js"));

var _v3 = _interopRequireDefault(require("./v4.js"));

var _v4 = _interopRequireDefault(require("./v5.js"));

var _nil = _interopRequireDefault(require("./nil.js"));

var _version = _interopRequireDefault(require("./version.js"));

var _validate = _interopRequireDefault(require("./validate.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

var _parse = _interopRequireDefault(require("./parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./nil.js":19,"./parse.js":20,"./stringify.js":24,"./v1.js":25,"./v3.js":26,"./v4.js":28,"./v5.js":29,"./validate.js":30,"./version.js":31}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);

    for (let i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = '0123456789abcdef';

  for (let i = 0; i < length32; i += 8) {
    const x = input[i >> 5] >>> i % 32 & 0xff;
    const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/**
 * Calculate output length with padding and bit length
 */


function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }

  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));

  for (let i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

var _default = md5;
exports.default = _default;
},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports.default = _default;
},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports.default = _default;
},{"./validate.js":30}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports.default = _default;
},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);

function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}
},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes === 'string') {
    const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];

    for (let i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    // Convert Array-like to Array
    bytes = Array.prototype.slice.call(bytes);
  }

  bytes.push(0x80);
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);

  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);

    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }

    M[i] = arr;
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);

    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }

    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];

    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

var _default = sha1;
exports.default = _default;
},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports.default = _default;
},{"./validate.js":30}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports.default = _default;
},{"./rng.js":22,"./stringify.js":24}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _md = _interopRequireDefault(require("./md5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;
},{"./md5.js":18,"./v35.js":27}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(require("./stringify.js"));

var _parse = _interopRequireDefault(require("./parse.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
},{"./parse.js":20,"./stringify.js":24}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _stringify = _interopRequireDefault(require("./stringify.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports.default = _default;
},{"./rng.js":22,"./stringify.js":24}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _sha = _interopRequireDefault(require("./sha1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;
},{"./sha1.js":23,"./v35.js":27}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regex = _interopRequireDefault(require("./regex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports.default = _default;
},{"./regex.js":21}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validate = _interopRequireDefault(require("./validate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports.default = _default;
},{"./validate.js":30}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const poynt_collect_1 = require("./poynt-collect");
const poynt_collect_v2_1 = require("./poynt-collect-v2");
if (typeof window !== "undefined") {
    // @ts-ignore
    window.PoyntCollect = poynt_collect_1.PoyntCollect;
}
if (typeof window !== "undefined") {
    // @ts-ignore
    window.TokenizeJs = poynt_collect_v2_1.TokenizeJs;
}

},{"./poynt-collect":44,"./poynt-collect-v2":43}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPLEPAY_SUPPORTED_NETWORKS = exports.APPLEPAY_MERCHANT_CAPABILITIES = exports.APPLEPAY_VERSION = exports.IFRAME_NAME = exports.GOOGLEPAY_ALLOWED_CARD_NETWORKS = exports.GOOGLEPAY_ALLOWED_AUTHN_METHODS = exports.GOOGLEPAY_SHIPPING_COUNTRY_CODES = exports.GOOGLEPAY_VERSION_MINOR = exports.GOOGLEPAY_VERSION = exports.GOOGLEPAY_GATEWAY = exports.GOOGLEPAY_MERCHANT_ID = exports.GOOGLEPAY_SCRIPT_URL = exports.RECAPTCHA_SCRIPT_URL = exports.RECAPTCHA_KEY = exports.GOOGLE_PAY_INTENT_MAP = exports.GOOGLE_PAY_EVENT_MAP = exports.WALLET_REQUEST_DEFAULT = exports.PUBLIC_URL = void 0;
const event_type_1 = require("./enums/event-type");
const googlepay_1 = require("./enums/googlepay");
let ENV_PUBLIC_URL;
// TODO: change ENV_PUBLIC_URL to use new subdomains as soon as they are ready
if ("development" === "development") {
    ENV_PUBLIC_URL = "https://vt-ci.poynt.net";
}
else if ("development" === "production") {
    ENV_PUBLIC_URL = "https://vt.poynt.net";
}
else if ("development" === "st") {
    ENV_PUBLIC_URL = "https://vt-st.poynt.net";
}
else if ("development" === "ote") {
    ENV_PUBLIC_URL = "https://vt-ote.poynt.net";
}
else if ("development" === "test") {
    ENV_PUBLIC_URL = "https://vt-test.poynt.net";
}
else if ("development" === "ci") {
    ENV_PUBLIC_URL = "https://vt-ci.poynt.net";
}
exports.PUBLIC_URL = ENV_PUBLIC_URL;
exports.WALLET_REQUEST_DEFAULT = {
    currency: "USD",
    country: "US",
    merchantName: "",
    total: {
        label: "",
        amount: "0.00",
    },
};
exports.GOOGLE_PAY_EVENT_MAP = {
    [googlepay_1.CallbackType.INITIALIZE]: event_type_1.EventType.ShippingAddressChange,
    [googlepay_1.CallbackType.SHIPPING_ADDRESS]: event_type_1.EventType.ShippingAddressChange,
    [googlepay_1.CallbackType.SHIPPING_OPTION]: event_type_1.EventType.ShippingMethodChange,
    [googlepay_1.CallbackType.OFFER]: event_type_1.EventType.CouponCodeChange,
};
exports.GOOGLE_PAY_INTENT_MAP = {
    [googlepay_1.CallbackType.INITIALIZE]: googlepay_1.CallbackType.SHIPPING_ADDRESS,
    [googlepay_1.CallbackType.SHIPPING_ADDRESS]: googlepay_1.CallbackType.SHIPPING_ADDRESS,
    [googlepay_1.CallbackType.SHIPPING_OPTION]: googlepay_1.CallbackType.SHIPPING_OPTION,
    [googlepay_1.CallbackType.OFFER]: googlepay_1.CallbackType.OFFER,
};
exports.RECAPTCHA_KEY = "6LdTM9cgAAAAAP98uxXROsW3L4aQVYeD_fuZC8Gk";
exports.RECAPTCHA_SCRIPT_URL = "https://www.google.com/recaptcha/enterprise.js?render=";
exports.GOOGLEPAY_SCRIPT_URL = "https://pay.google.com/gp/p/js/pay.js";
exports.GOOGLEPAY_MERCHANT_ID = "BCR2DN4T3D32TPA6";
exports.GOOGLEPAY_GATEWAY = "godaddypayments";
exports.GOOGLEPAY_VERSION = 2;
exports.GOOGLEPAY_VERSION_MINOR = 0;
// Array of ISO 3166-1 alpha-2 country codes for shipping addess,
// e.g. ["US", "CA", "JP"]. [] means supports all
exports.GOOGLEPAY_SHIPPING_COUNTRY_CODES = [];
exports.GOOGLEPAY_ALLOWED_AUTHN_METHODS = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
exports.GOOGLEPAY_ALLOWED_CARD_NETWORKS = ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"];
exports.IFRAME_NAME = "poynt-collect-v2-iframe";
exports.APPLEPAY_VERSION = 6;
exports.APPLEPAY_MERCHANT_CAPABILITIES = ["supports3DS"];
exports.APPLEPAY_SUPPORTED_NETWORKS = ["visa", "masterCard", "amex", "discover", "interac"];

},{"./enums/event-type":35,"./enums/googlepay":36}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["SHIPPING_CONTACT_INVALID"] = "shippingContactInvalid";
    ErrorType["BILLING_CONTACT_INVALID"] = "billingContactInvalid";
    ErrorType["ADDRESS_UNSERVICEABLE"] = "addressUnserviceable";
    ErrorType["COUPON_CODE_INVALID"] = "couponCodeInvalid";
    ErrorType["COUPON_CODE_EXPIRED"] = "couponCodeExpired";
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
;

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
// See https://github.com/poynt/virtual-terminal/blob/staging/assets/js/poynt-collect/src/lib/enums/event-type.ts
var EventType;
(function (EventType) {
    // Inbound from Virtual Terminal
    EventType["ValidateApplePay"] = "validate_applepay";
    EventType["TransactionCreated"] = "transaction_created";
    EventType["TransactionDeclined"] = "transaction_declined";
    EventType["TransactionVoided"] = "transaction_voided";
    EventType["Error"] = "error";
    EventType["WalletNonceError"] = "wallet_nonce_error";
    EventType["ValidateGooglePayError"] = "validate_googlepay_error";
    EventType["Ready"] = "ready";
    EventType["Nonce"] = "nonce";
    EventType["WalletNonce"] = "wallet_nonce";
    EventType["Token"] = "token";
    EventType["Validated"] = "validated";
    EventType["GetNonce"] = "get_nonce";
    EventType["ValidateGooglePay"] = "validate_googlepay";
    EventType["IFrameContentReady"] = "iframe_ready";
    // Outbound to Virtual Terminal
    EventType["Init"] = "init";
    EventType["OpCreateTransaction"] = "op_create_transaction";
    EventType["OpCreateToken"] = "op_create_token";
    EventType["OpCreateTokenTransaction"] = "op_create_token_transaction";
    EventType["OpCreateNonceTransaction"] = "op_create_nonce_transaction";
    EventType["OpGetNonce"] = "op_get_nonce";
    EventType["OpGetWalletNonce"] = "op_get_wallet_nonce";
    EventType["OpValidateApplePay"] = "op_validate_applepay";
    EventType["OpValidateGooglePay"] = "op_validate_googlepay";
    EventType["SiftSession"] = "set_sift_session";
    EventType["CreateEcommerceTransaction"] = "create_ecommerce_transaction";
    // Outbound to browser
    EventType["ShippingMethodChange"] = "shipping_method_change";
    EventType["ShippingAddressChange"] = "shipping_address_change";
    EventType["PaymentMethodChange"] = "payment_method_change";
    EventType["PaymentAuthorized"] = "payment_authorized";
    EventType["CouponCodeChange"] = "coupon_code_change";
    EventType["CloseWallet"] = "close_wallet";
    // Outbound to browser (analytics events)
    EventType["WalletButtonClick"] = "wallet_button_click";
})(EventType = exports.EventType || (exports.EventType = {}));

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = exports.CallbackType = void 0;
var CallbackType;
(function (CallbackType) {
    CallbackType["INITIALIZE"] = "INITIALIZE";
    CallbackType["SHIPPING_ADDRESS"] = "SHIPPING_ADDRESS";
    CallbackType["SHIPPING_OPTION"] = "SHIPPING_OPTION";
    CallbackType["OFFER"] = "OFFER";
    CallbackType["PAYMENT_AUTHORIZATION"] = "PAYMENT_AUTHORIZATION";
})(CallbackType = exports.CallbackType || (exports.CallbackType = {}));
;
var ErrorType;
(function (ErrorType) {
    ErrorType["SHIPPING_ADDRESS_INVALID"] = "SHIPPING_ADDRESS_INVALID";
    ErrorType["SHIPPING_ADDRESS_UNSERVICEABLE"] = "SHIPPING_ADDRESS_UNSERVICEABLE";
    ErrorType["PAYMENT_DATA_INVALID"] = "PAYMENT_DATA_INVALID";
    ErrorType["OFFER_INVALID"] = "OFFER_INVALID";
    ErrorType["OTHER_ERROR"] = "OTHER_ERROR";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletType = void 0;
var WalletType;
(function (WalletType) {
    WalletType["ApplePay"] = "apple_pay";
    WalletType["GooglePay"] = "google_pay";
})(WalletType = exports.WalletType || (exports.WalletType = {}));

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaymentRequest = exports.buildWalletNonceError = exports.buildErrors = exports.buildShippingMethods = exports.buildTotal = exports.buildLineItems = void 0;
const constants_1 = require("../constants");
const applepay_1 = require("../enums/applepay");
const buildLineItems = (request) => {
    if (!(request === null || request === void 0 ? void 0 : request.lineItems)) {
        return [];
    }
    return request.lineItems.map((o) => {
        return {
            label: o.label,
            amount: o.amount,
            type: o.isPending ? "pending" : "final",
        };
    });
};
exports.buildLineItems = buildLineItems;
const buildTotal = (request) => {
    if (!(request === null || request === void 0 ? void 0 : request.total)) {
        return {
            label: "",
            amount: "0.00",
        };
    }
    return {
        label: request.total.label,
        amount: request.total.amount,
        type: request.total.isPending ? "pending" : "final",
    };
};
exports.buildTotal = buildTotal;
const buildShippingMethods = (request) => {
    if (!(request === null || request === void 0 ? void 0 : request.shippingMethods)) {
        return [];
    }
    return request.shippingMethods.map((o) => {
        return {
            identifier: o.id,
            label: o.label,
            amount: o.amount,
            detail: o.detail,
        };
    });
};
exports.buildShippingMethods = buildShippingMethods;
const buildErrors = (request) => {
    const errorCodes = {
        invalid_shipping_address: applepay_1.ErrorType.SHIPPING_CONTACT_INVALID,
        unserviceable_address: applepay_1.ErrorType.ADDRESS_UNSERVICEABLE,
        invalid_billing_address: applepay_1.ErrorType.BILLING_CONTACT_INVALID,
        invalid_coupon_code: applepay_1.ErrorType.COUPON_CODE_INVALID,
        expired_coupon_code: applepay_1.ErrorType.COUPON_CODE_EXPIRED,
        invalid_payment_data: applepay_1.ErrorType.UNKNOWN,
        unknown: applepay_1.ErrorType.UNKNOWN,
    };
    const error = request === null || request === void 0 ? void 0 : request.error;
    if (!error) {
        return;
    }
    return [
        //@ts-ignore
        new ApplePayError(error.code ? errorCodes[error.code] : applepay_1.ErrorType.UNKNOWN, error.contactField, error.message ? error.message : "")
    ];
};
exports.buildErrors = buildErrors;
const buildWalletNonceError = (errorEvent) => {
    var _a;
    return [
        //@ts-ignore
        new ApplePayError(applepay_1.ErrorType.UNKNOWN, undefined, errorEvent && "data" in errorEvent ? (_a = errorEvent.data) === null || _a === void 0 ? void 0 : _a.error : errorEvent === null || errorEvent === void 0 ? void 0 : errorEvent.message)
    ];
};
exports.buildWalletNonceError = buildWalletNonceError;
/**
 * Maps WalletRequest object to ApplePayPaymentRequest
 * @returns ApplePayPaymentRequest containing payment data
 */
const buildPaymentRequest = (request) => {
    var _a;
    const requiredContactFields = ["name", "postalAddress"];
    if (request === null || request === void 0 ? void 0 : request.requireEmail) {
        requiredContactFields.push("email");
    }
    if (request === null || request === void 0 ? void 0 : request.requirePhone) {
        requiredContactFields.push("phone");
    }
    return {
        countryCode: request === null || request === void 0 ? void 0 : request.country,
        currencyCode: request === null || request === void 0 ? void 0 : request.currency,
        merchantCapabilities: constants_1.APPLEPAY_MERCHANT_CAPABILITIES,
        supportedNetworks: constants_1.APPLEPAY_SUPPORTED_NETWORKS,
        total: (0, exports.buildTotal)(request),
        lineItems: (0, exports.buildLineItems)(request),
        requiredBillingContactFields: requiredContactFields,
        requiredShippingContactFields: (request === null || request === void 0 ? void 0 : request.requireShippingAddress) ? requiredContactFields : undefined,
        supportsCouponCode: request === null || request === void 0 ? void 0 : request.supportCouponCode,
        couponCode: (request === null || request === void 0 ? void 0 : request.supportCouponCode) ? (_a = request === null || request === void 0 ? void 0 : request.couponCode) === null || _a === void 0 ? void 0 : _a.code : undefined,
    };
};
exports.buildPaymentRequest = buildPaymentRequest;

},{"../constants":33,"../enums/applepay":34}],39:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setButtonsContainerProperties = exports.setButtonProperties = exports.getSsid = exports.createIFrame = exports.populateUrlOptionsDefaults = exports.loadScript = exports.removeCachedScripts = exports.getCachedScripts = void 0;
const qs_1 = require("qs");
const constants = __importStar(require("../constants"));
const cachedScripts = {};
const getCachedScripts = () => {
    return Object.assign({}, cachedScripts);
};
exports.getCachedScripts = getCachedScripts;
const removeCachedScripts = () => {
    Object.keys(cachedScripts).forEach(key => cachedScripts[key] = null);
};
exports.removeCachedScripts = removeCachedScripts;
const loadScript = (src) => {
    const existing = cachedScripts[src];
    if (existing) {
        return existing;
    }
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        const onScriptLoad = () => {
            resolve();
        };
        const onScriptError = () => {
            script.removeEventListener('load', onScriptLoad);
            script.removeEventListener('error', onScriptError);
            cachedScripts[src] = null;
            script.remove();
            reject(new Error(`Unable to load script ${src}`));
        };
        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);
        document.body.appendChild(script);
    });
    cachedScripts[src] = promise;
    return promise;
};
exports.loadScript = loadScript;
const populateUrlOptionsDefaults = (options) => {
    if (options.style === undefined) {
        options.style = {
            container: {},
            input: {
                firstName: {},
                lastName: {},
                email: {},
            },
        };
    }
    if (options.displayComponents) {
        if (options.displayComponents.submitButton === undefined) {
            options.displayComponents.submitButton = false;
        }
        if (options.displayComponents.firstName === undefined) {
            options.displayComponents.firstName = false;
        }
        if (options.displayComponents.lastName === undefined) {
            options.displayComponents.lastName = false;
        }
        if (options.displayComponents.zipCode === undefined) {
            options.displayComponents.zipCode = false;
        }
        if (options.displayComponents.address === undefined) {
            options.displayComponents.address = false;
        }
        if (options.displayComponents.emailAddress === undefined) {
            options.displayComponents.emailAddress = false;
        }
        if (options.displayComponents.state === undefined) {
            options.displayComponents.state = false;
        }
        if (options.displayComponents.country === undefined) {
            options.displayComponents.country = false;
        }
        if (options.displayComponents.phone === undefined) {
            options.displayComponents.phone = false;
        }
        if (options.displayComponents.ecommerceFirstName === undefined) {
            options.displayComponents.ecommerceFirstName = false;
        }
        if (options.displayComponents.ecommerceLastName === undefined) {
            options.displayComponents.ecommerceLastName = false;
        }
        if (options.displayComponents.ecommerceEmailAddress === undefined) {
            options.displayComponents.ecommerceEmailAddress = false;
        }
        if (options.displayComponents.paymentLabel === undefined) {
            options.displayComponents.paymentLabel = false;
        }
    }
    else {
        options.displayComponents = {
            submitButton: false,
            firstName: false,
            lastName: false,
            zipCode: false,
            emailAddress: false,
        };
    }
    if (options.emailReceipt === undefined) {
        options.emailReceipt = true;
    }
};
exports.populateUrlOptionsDefaults = populateUrlOptionsDefaults;
const createIFrame = (businessId, applicationId, mountOptions) => {
    var _a;
    // TODO: change iFrameUrl to use new subdomains as soon as they are ready
    let iFrameUrl = constants.PUBLIC_URL + "/react/poynt-collect/";
    const iFrame = document.createElement("iframe");
    iFrame.setAttribute("name", constants.IFRAME_NAME);
    iFrame.setAttribute("id", constants.IFRAME_NAME);
    const allOptions = mountOptions || {};
    (0, exports.populateUrlOptionsDefaults)(allOptions);
    allOptions.businessId = businessId;
    allOptions.applicationId = applicationId;
    allOptions.parentUrl = window.location.hostname;
    allOptions.isV2 = true;
    allOptions.useMessagePort = true;
    iFrameUrl += "?" + (0, qs_1.stringify)(allOptions) + "&breakcache=" + new Date().toISOString();
    if (mountOptions) {
        if (mountOptions.style && mountOptions.iFrame) {
            iFrame.style.cssText = JSON.stringify(mountOptions.iFrame);
            if (mountOptions.iFrame.height) {
                iFrame.style["height"] = mountOptions.iFrame.height;
            }
            if (mountOptions.iFrame.width) {
                iFrame.style["width"] = mountOptions.iFrame.width;
            }
            if (mountOptions.iFrame.border) {
                iFrame.style["border"] = mountOptions.iFrame.border;
            }
            if (mountOptions.iFrame.borderRadius) {
                iFrame.style["borderRadius"] = mountOptions.iFrame.borderRadius;
            }
            if (mountOptions.iFrame.boxShadow) {
                iFrame.style["boxShadow"] = mountOptions.iFrame.boxShadow;
            }
        }
        if (
        //iFrame will render card form by default, so we set display none here if its for GooglePay/ApplePay only
        ((_a = mountOptions.paymentMethods) === null || _a === void 0 ? void 0 : _a.length) &&
            !mountOptions.paymentMethods.includes("card")) {
            iFrame.setAttribute("style", "display: none");
        }
    }
    iFrame.setAttribute("src", iFrameUrl);
    return iFrame;
};
exports.createIFrame = createIFrame;
const getSsid = () => {
    const cookiesIFrame = document.cookie.match(new RegExp("(?:^|; )" + "__ssid".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return cookiesIFrame ? decodeURIComponent(cookiesIFrame[1]) : "";
};
exports.getSsid = getSsid;
const setButtonProperties = (container, buttonOptions) => {
    const button = container.getElementsByTagName("button")[0];
    const minWidth = (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.type) === "plain" ? "160px" : "240px";
    const minHeight = "40px";
    const margin = "8px";
    button.style.setProperty("width", "100%");
    button.style.setProperty("height", "100%");
    container.style.setProperty("min-width", minWidth);
    container.style.setProperty("min-height", minHeight);
    container.style.setProperty("margin", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.margin) || margin);
    container.style.setProperty("width", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.width) || minWidth);
    container.style.setProperty("height", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.height) || minHeight);
    return container;
};
exports.setButtonProperties = setButtonProperties;
const setButtonsContainerProperties = (container, buttonsContainerOptions) => {
    container.style.setProperty("display", "flex");
    container.style.setProperty("justify-content", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.justifyContent) || "center");
    container.style.setProperty("align-items", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.alignItems) || "center");
    container.style.setProperty("flex-direction", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.flexDirection) || "row");
    if (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.style) {
        const cssRules = Object.entries(buttonsContainerOptions.style);
        cssRules.forEach((cssRule) => {
            container.style.setProperty(cssRule[0], cssRule[1]);
        });
    }
    return container;
};
exports.setButtonsContainerProperties = setButtonsContainerProperties;

},{"../constants":33,"qs":12}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGooglePay = exports.buildPaymentRequest = exports.buildPaymentDataChangedHandlerError = exports.buildWalletNonceError = exports.buildMissedHandlerError = exports.buildDuplicateCouponCodeError = exports.buildError = exports.buildOfferInfo = exports.buildShippingMethods = exports.buildTransactionInfo = exports.buildLineItems = exports.getCardPaymentMethod = exports.getBaseCardPaymentMethod = void 0;
const constants_1 = require("../constants");
const common_1 = require("./common");
const event_type_1 = require("../enums/event-type");
const googlepay_1 = require("../enums/googlepay");
/**
 * Fetch a GooglePay payment method configs that are supported by GoDaddy Payments
 * which determine supported authentication methods, card networks, and billing
 * information requirements
 *
 * @param request
 * @returns GooglePay payment configuration
 */
const getBaseCardPaymentMethod = (request) => {
    const result = {
        type: "CARD",
        parameters: {
            allowedAuthMethods: constants_1.GOOGLEPAY_ALLOWED_AUTHN_METHODS,
            allowedCardNetworks: constants_1.GOOGLEPAY_ALLOWED_CARD_NETWORKS,
        },
    };
    result.parameters.billingAddressRequired = true;
    result.parameters.billingAddressParameters = { format: "FULL" };
    if (request.requirePhone) {
        result.parameters.billingAddressParameters.phoneNumberRequired = true;
    }
    return result;
};
exports.getBaseCardPaymentMethod = getBaseCardPaymentMethod;
/**
 * Fetch GooglePay tokenization and payment configs that are supported by Godaddy Payments
 * which includes tokenization specs, GoDaddy gateway ID, and payment method configs.
 *
 * @param request
 * @param businessId GoDaddy Payments business UUID
 * @returns GooglePay payment and tokenization configuration
 */
const getCardPaymentMethod = (request, businessId) => {
    const baseCardPaymentMethod = (0, exports.getBaseCardPaymentMethod)(request);
    return Object.assign({ tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
                gateway: constants_1.GOOGLEPAY_GATEWAY,
                gatewayMerchantId: businessId,
            },
        } }, baseCardPaymentMethod);
};
exports.getCardPaymentMethod = getCardPaymentMethod;
/**
 * Build GooglePay representation of line items from the generic WalletRequest interface.
 * DisplayItem.type defaults to "LINE_ITEM" because it's a required field for which it will
 * not have any UI side-effects.
 *
 * @param request
 * @returns GooglePay line items
 */
const buildLineItems = (request) => {
    if (!(request === null || request === void 0 ? void 0 : request.lineItems)) {
        return [];
    }
    return request.lineItems.map((lineItem) => {
        return {
            label: lineItem.label,
            price: lineItem.amount,
            type: "LINE_ITEM",
            status: lineItem.isPending ? "PENDING" : "FINAL",
        };
    });
};
exports.buildLineItems = buildLineItems;
/**
 * Build GooglePay representation of a transaction unit that determines payer's ability
 * to pay. This method is mostly used for updating wallet session when payer interacts
 * with payment sheet and trigger these events (see EventType definition):
 * - ShippingAddressChange
 * - ShippingMethodChange
 * - CouponCodeChange
 *
 * @param request
 * @returns GooglePay transaction unit containing line items
 */
const buildTransactionInfo = (request) => {
    const items = (0, exports.buildLineItems)(request);
    if (!(request === null || request === void 0 ? void 0 : request.total)) {
        return {
            countryCode: request === null || request === void 0 ? void 0 : request.country,
            currencyCode: (request === null || request === void 0 ? void 0 : request.currency) || "",
            totalPrice: "0.00",
            totalPriceStatus: "ESTIMATED",
            displayItems: items
        };
    }
    return {
        countryCode: request.country,
        currencyCode: request.currency,
        totalPrice: request.total.amount,
        totalPriceLabel: request.total.label,
        totalPriceStatus: request.total.isPending ? "ESTIMATED" : "FINAL",
        displayItems: items,
    };
};
exports.buildTransactionInfo = buildTransactionInfo;
/**
 * Build GooglePay representation of shipping methods. This method is mostly used for
 * updating wallet session when payer interacts with payment sheet and trigger these
 * events (see EventType definition):
 * - ShippingAddressChange
 * - CouponCodeChange
 *
 * @param request
 * @returns GooglePay shipping methods
 */
const buildShippingMethods = (request) => {
    var _a;
    if (!((_a = request === null || request === void 0 ? void 0 : request.shippingMethods) === null || _a === void 0 ? void 0 : _a.length)) {
        return {
            shippingOptions: [],
        };
    }
    const options = request.shippingMethods.map((shippingMethod) => {
        return {
            id: shippingMethod.id,
            label: shippingMethod.label,
            description: shippingMethod.detail,
        };
    });
    return {
        shippingOptions: options,
    };
};
exports.buildShippingMethods = buildShippingMethods;
/**
 * Build GooglePay representation of coupon code. This method is mostly used for updating
 * wallet session when payer interacts with payment sheet (handles one coupon per action)
 * and trigger these events (see EventType definition):
 * - CouponCodeChange
 *
 * @param request
 * @returns GooglePay coupon code
 */
const buildOfferInfo = (request) => {
    var _a;
    if (!((_a = request === null || request === void 0 ? void 0 : request.couponCode) === null || _a === void 0 ? void 0 : _a.code)) {
        return {
            offers: [],
        };
    }
    return {
        offers: [
            {
                redemptionCode: request.couponCode.code,
                description: request.couponCode.label,
            }
        ]
    };
};
exports.buildOfferInfo = buildOfferInfo;
/**
 * Build GooglePay representation of error objects. This method is mostly used for
 * updating wallet session when payer interacts with payment sheet and trigger these
 * events (see EventType definition):
 * - ShippingAddressChange
 * - CouponCodeChange
 * - PaymentAuthorized
 *
 * @param request
 * @param callbackIntent field indicator of error input
 * @returns GooglePay error object
 */
const buildError = (request, callbackIntent) => {
    const errorCodes = {
        invalid_shipping_address: googlepay_1.ErrorType.SHIPPING_ADDRESS_INVALID,
        unserviceable_address: googlepay_1.ErrorType.SHIPPING_ADDRESS_UNSERVICEABLE,
        invalid_billing_address: googlepay_1.ErrorType.PAYMENT_DATA_INVALID,
        invalid_coupon_code: googlepay_1.ErrorType.OFFER_INVALID,
        expired_coupon_code: googlepay_1.ErrorType.OFFER_INVALID,
        invalid_payment_data: googlepay_1.ErrorType.PAYMENT_DATA_INVALID,
        unknown: googlepay_1.ErrorType.OTHER_ERROR,
    };
    const error = request === null || request === void 0 ? void 0 : request.error;
    if (!error) {
        return;
    }
    return {
        reason: error.code ? errorCodes[error.code] : errorCodes.unknown,
        intent: callbackIntent,
        message: error.message || "",
    };
};
exports.buildError = buildError;
const buildDuplicateCouponCodeError = (callbackIntent) => {
    return {
        reason: googlepay_1.ErrorType.OFFER_INVALID,
        intent: callbackIntent,
        message: "Coupon code already applied",
    };
};
exports.buildDuplicateCouponCodeError = buildDuplicateCouponCodeError;
const buildMissedHandlerError = (eventType, callbackIntent) => {
    return {
        reason: googlepay_1.ErrorType.OTHER_ERROR,
        intent: callbackIntent,
        message: `${eventType} callback handler not found`,
    };
};
exports.buildMissedHandlerError = buildMissedHandlerError;
const buildWalletNonceError = (callbackIntent, errorEvent) => {
    var _a;
    return {
        reason: googlepay_1.ErrorType.OTHER_ERROR,
        intent: callbackIntent,
        message: errorEvent && "data" in errorEvent ? (_a = errorEvent.data) === null || _a === void 0 ? void 0 : _a.error : (errorEvent === null || errorEvent === void 0 ? void 0 : errorEvent.message) || "",
    };
};
exports.buildWalletNonceError = buildWalletNonceError;
const buildPaymentDataChangedHandlerError = (callbackTrigger) => {
    return {
        reason: googlepay_1.ErrorType.OTHER_ERROR,
        intent: constants_1.GOOGLE_PAY_INTENT_MAP[callbackTrigger],
        message: `Callback trigger "${callbackTrigger}" not found or intermediate payment data does not exist`,
    };
};
exports.buildPaymentDataChangedHandlerError = buildPaymentDataChangedHandlerError;
/**
 * Build GooglePay payment request configs containing GoDaddy gateway merchant ID,
 * GooglePay API version, payment configuration, and payment sheet input options:
 * - Shipping Address
 * - Shipping Method
 * - Coupon Code
 *
 * @param request
 * @param businessId GoDaddy Payments business UUID
 * @returns GooglePay payment request model
 */
const buildPaymentRequest = (request, businessId, authJwt) => {
    var _a, _b;
    const merchantInfo = {
        merchantId: constants_1.GOOGLEPAY_MERCHANT_ID,
        merchantOrigin: document.domain,
        merchantName: request.merchantName,
        authJwt: authJwt,
    };
    const result = {
        apiVersion: constants_1.GOOGLEPAY_VERSION,
        apiVersionMinor: constants_1.GOOGLEPAY_VERSION_MINOR,
        merchantInfo: merchantInfo,
        allowedPaymentMethods: [
            (0, exports.getCardPaymentMethod)(request, businessId)
        ],
        transactionInfo: (0, exports.buildTransactionInfo)(request),
    };
    const callbackIntents = [googlepay_1.CallbackType.PAYMENT_AUTHORIZATION];
    if (request.requireShippingAddress) {
        callbackIntents.push(googlepay_1.CallbackType.SHIPPING_ADDRESS, googlepay_1.CallbackType.SHIPPING_OPTION);
        result.shippingAddressRequired = true;
        result.shippingOptionRequired = true;
        result.shippingAddressParameters = {
            allowedCountryCodes: constants_1.GOOGLEPAY_SHIPPING_COUNTRY_CODES,
            phoneNumberRequired: request.requirePhone,
        };
        if ((_a = request.shippingMethods) === null || _a === void 0 ? void 0 : _a.length) {
            result.shippingOptionParameters = (0, exports.buildShippingMethods)(request);
        }
    }
    if (request.supportCouponCode) {
        callbackIntents.push(googlepay_1.CallbackType.OFFER);
        if ((_b = request.couponCode) === null || _b === void 0 ? void 0 : _b.code) {
            result.offerInfo = {
                offers: [{
                        redemptionCode: request.couponCode.code,
                        description: request.couponCode.label,
                    }],
            };
        }
    }
    if (request.requireEmail) {
        result.emailRequired = true;
    }
    result.callbackIntents = callbackIntents;
    return result;
};
exports.buildPaymentRequest = buildPaymentRequest;
const validateGooglePay = (businessId, applicationId) => {
    return new Promise((resolve, reject) => {
        const iFrame = (0, common_1.createIFrame)(businessId, applicationId, { paymentMethods: ["google_pay"] });
        const messageChannel = new MessageChannel();
        const originMessageChannel = messageChannel.port1;
        const iframeMessageChannel = messageChannel.port2;
        const removeIFrame = () => {
            originMessageChannel.close();
            iframeMessageChannel.close();
            const body = document.getElementsByTagName("body")[0];
            if (body.contains(iFrame)) {
                body.removeChild(iFrame);
            }
        };
        const timeout = setTimeout(() => {
            removeIFrame();
            reject(new Error("Timeout error while validating Google Pay"));
        }, 10000);
        originMessageChannel.onmessage = (event) => {
            var _a;
            let message = event.data;
            try {
                message = JSON.parse(event.data);
            }
            catch (error) {
                return console.error(error);
            }
            if (!(message === null || message === void 0 ? void 0 : message.type)) {
                return;
            }
            if (message.type === event_type_1.EventType.IFrameContentReady) {
                return (_a = iFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                    type: event_type_1.EventType.OpValidateGooglePay,
                    options: {
                        domain: document.domain,
                    },
                }, "*");
            }
            if (message.type === event_type_1.EventType.ValidateGooglePay) {
                clearTimeout(timeout);
                removeIFrame();
                return resolve(message.data);
            }
            if (message.type === event_type_1.EventType.ValidateGooglePayError) {
                clearTimeout(timeout);
                removeIFrame();
                return reject(message.data);
            }
        };
        iFrame.onload = () => {
            var _a;
            (_a = iFrame === null || iFrame === void 0 ? void 0 : iFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({ type: event_type_1.EventType.Init }, "*", [iframeMessageChannel]);
        };
        document.getElementsByTagName("body")[0].appendChild(iFrame);
    });
};
exports.validateGooglePay = validateGooglePay;

},{"../constants":33,"../enums/event-type":35,"../enums/googlepay":36,"./common":39}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSiftJSSnippet = void 0;
const uuid_1 = require("uuid");
// loaded sift js snippet to page and return sift session id
const loadSiftJSSnippet = () => {
    let _user_id = "";
    let _session_id = (0, uuid_1.v4)();
    //@ts-ignore
    var _sift = (window._sift = window._sift || []);
    //@ts-ignore
    _sift.push(["_setAccount", "37eb7daac0"]);
    //@ts-ignore
    _sift.push(["_setUserId", _user_id]);
    //@ts-ignore
    _sift.push(["_setSessionId", _session_id]);
    //@ts-ignore
    _sift.push(["_trackPageview"]);
    (function () {
        function ls() {
            var e = document.createElement("script");
            e.src = "https://cdn.sift.com/s.js";
            document.body.appendChild(e);
        }
        //@ts-ignore
        if (window.attachEvent) {
            //@ts-ignore
            window.attachEvent("onload", ls);
        }
        else {
            window.addEventListener("load", ls, false);
        }
    })();
    return _session_id;
};
exports.loadSiftJSSnippet = loadSiftJSSnippet;

},{"uuid":17}],42:[function(require,module,exports){
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWalletNonceRequest = exports.buildPaymentAuthorizedResponse = exports.buildAddress = exports.buildCouponCodeResponse = exports.buildShippingMethodResponse = exports.buildShippingAddressResponse = void 0;
const wallet_type_1 = require("../enums/wallet-type");
;
;
;
;
;
const buildShippingAddressResponse = (event) => {
    return {
        shippingAddress: {
            administrativeArea: event.administrativeArea || "",
            countryCode: event.countryCode || "",
            postalCode: event.postalCode || "",
            locality: event.locality || "",
        }
    };
};
exports.buildShippingAddressResponse = buildShippingAddressResponse;
const buildShippingMethodResponse = (event, shippingMethods) => {
    const result = {
        shippingMethod: {},
    };
    // ApplePay
    if ("identifier" in event) {
        result.shippingMethod = {
            id: event.identifier,
            label: event.label,
            detail: event.detail,
            amount: event.amount,
        };
    }
    // GooglePay
    if ("id" in event) {
        const shippingMethod = (shippingMethods || []).find(item => item.id === event.id);
        result.shippingMethod = {
            id: event.id,
            label: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.label,
            detail: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.detail,
            amount: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.amount,
        };
    }
    return result;
};
exports.buildShippingMethodResponse = buildShippingMethodResponse;
const buildCouponCodeResponse = (event) => {
    return {
        couponCode: Array.isArray(event) ? event[0] : event,
    };
};
exports.buildCouponCodeResponse = buildCouponCodeResponse;
const buildAddress = (address, email) => {
    let result = {};
    // ApplePay
    if ("givenName" in address) {
        const { phoneticFamilyName, phoneticGivenName, subLocality, subAdministrativeArea, country, givenName = "", familyName = "" } = address, data = __rest(address, ["phoneticFamilyName", "phoneticGivenName", "subLocality", "subAdministrativeArea", "country", "givenName", "familyName"]);
        result = Object.assign(Object.assign({}, data), { name: `${givenName} ${familyName}` });
    }
    // GooglePay
    if ("name" in address) {
        const { sortingCode, address1 = "", address2 = "", address3 = "" } = address, data = __rest(address, ["sortingCode", "address1", "address2", "address3"]);
        result = Object.assign(Object.assign({}, data), { emailAddress: email, addressLines: [address1, address2, address3].filter(address => address) });
    }
    return result;
};
exports.buildAddress = buildAddress;
const buildPaymentAuthorizedResponse = (event, nonceEventData) => {
    var _a, _b;
    const result = {};
    // ApplePay
    if ("token" in event) {
        if (event.shippingContact) {
            result.shippingAddress = (0, exports.buildAddress)(event.shippingContact);
        }
        if (event.billingContact) {
            result.billingAddress = (0, exports.buildAddress)(event.billingContact);
        }
        result.source = wallet_type_1.WalletType.ApplePay;
    }
    // GooglePay
    if ("paymentMethodData" in event) {
        if (event.shippingAddress) {
            result.shippingAddress = (0, exports.buildAddress)(event.shippingAddress, event.email);
        }
        if ((_a = event.paymentMethodData.info) === null || _a === void 0 ? void 0 : _a.billingAddress) {
            result.billingAddress = (0, exports.buildAddress)(event.paymentMethodData.info.billingAddress, event.email);
        }
        result.source = wallet_type_1.WalletType.GooglePay;
    }
    result.nonce = (_b = nonceEventData === null || nonceEventData === void 0 ? void 0 : nonceEventData.data) === null || _b === void 0 ? void 0 : _b.nonce;
    return result;
};
exports.buildPaymentAuthorizedResponse = buildPaymentAuthorizedResponse;
const buildWalletNonceRequest = (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    let result = {};
    // ApplePay
    if ("token" in event) {
        result = {
            applePayPaymentToken: event.token,
            zip: (_a = event.billingContact) === null || _a === void 0 ? void 0 : _a.postalCode,
            line1: ((_b = event.billingContact) === null || _b === void 0 ? void 0 : _b.addressLines) && ((_c = event.billingContact) === null || _c === void 0 ? void 0 : _c.addressLines[0]),
            line2: ((_d = event.billingContact) === null || _d === void 0 ? void 0 : _d.addressLines) && ((_e = event.billingContact) === null || _e === void 0 ? void 0 : _e.addressLines[1]),
            city: (_f = event.billingContact) === null || _f === void 0 ? void 0 : _f.locality,
            territory: (_g = event.billingContact) === null || _g === void 0 ? void 0 : _g.administrativeArea,
            countryCode: (_h = event.billingContact) === null || _h === void 0 ? void 0 : _h.countryCode,
        };
    }
    // GooglePay
    if ("paymentMethodData" in event) {
        result = {
            googlePayPaymentToken: event.paymentMethodData,
            zip: (_k = (_j = event.paymentMethodData.info) === null || _j === void 0 ? void 0 : _j.billingAddress) === null || _k === void 0 ? void 0 : _k.postalCode,
            line1: (_m = (_l = event.paymentMethodData.info) === null || _l === void 0 ? void 0 : _l.billingAddress) === null || _m === void 0 ? void 0 : _m.address1,
            line2: (_p = (_o = event.paymentMethodData.info) === null || _o === void 0 ? void 0 : _o.billingAddress) === null || _p === void 0 ? void 0 : _p.address2,
            city: (_r = (_q = event.paymentMethodData.info) === null || _q === void 0 ? void 0 : _q.billingAddress) === null || _r === void 0 ? void 0 : _r.locality,
            territory: (_t = (_s = event.paymentMethodData.info) === null || _s === void 0 ? void 0 : _s.billingAddress) === null || _t === void 0 ? void 0 : _t.administrativeArea,
            countryCode: (_v = (_u = event.paymentMethodData.info) === null || _u === void 0 ? void 0 : _u.billingAddress) === null || _v === void 0 ? void 0 : _v.countryCode,
        };
    }
    return result;
};
exports.buildWalletNonceRequest = buildWalletNonceRequest;

},{"../enums/wallet-type":37}],43:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenizeJs = void 0;
const constants = __importStar(require("./lib/constants"));
const event_type_1 = require("./lib/enums/event-type");
const wallet_type_1 = require("./lib/enums/wallet-type");
const sift_1 = require("./lib/helpers/sift");
const commonHelpers = __importStar(require("./lib/helpers/common"));
const walletHelpers = __importStar(require("./lib/helpers/wallet"));
const applePayHelpers = __importStar(require("./lib/helpers/applepay"));
const googlePayHelpers = __importStar(require("./lib/helpers/googlepay"));
const googlePayEnums = __importStar(require("./lib/enums/googlepay"));
// v2 poynt collect
class TokenizeJs {
    constructor(businessId, applicationId, walletRequest = constants.WALLET_REQUEST_DEFAULT) {
        this.createMessageChannel = () => {
            var _a;
            this.messageChannel = new MessageChannel();
            this.messageChannel.port1.onmessage = (event) => {
                let data = event.data;
                try {
                    data = JSON.parse(event.data);
                }
                catch (error) {
                    return console.error(error);
                }
                this.processCallbacks(data.type, data);
            };
            this.postIFrameMessage({ type: event_type_1.EventType.Init }, (_a = this.messageChannel) === null || _a === void 0 ? void 0 : _a.port2);
            this.postIFrameMessage({
                type: event_type_1.EventType.SiftSession,
                options: { siftSessionId: this.siftSessionId },
            });
        };
        this.googlePayPaymentDataChangedHandler = (intermediatePaymentData) => {
            return new Promise((resolve) => {
                var _a;
                const callbackTrigger = intermediatePaymentData.callbackTrigger;
                const callbackIntent = constants.GOOGLE_PAY_INTENT_MAP[callbackTrigger];
                const eventType = constants.GOOGLE_PAY_EVENT_MAP[callbackTrigger];
                const updateWith = (walletRequest) => {
                    this.updateWalletRequest(walletRequest, eventType);
                    const update = {};
                    const transactionInfo = googlePayHelpers.buildTransactionInfo(this.walletRequest);
                    const error = googlePayHelpers.buildError(this.walletRequest, callbackIntent);
                    if (transactionInfo) {
                        update.newTransactionInfo = transactionInfo;
                    }
                    if (error) {
                        update.error = error;
                    }
                    if (this.walletRequest.requireShippingAddress &&
                        callbackTrigger !== googlePayEnums.CallbackType.SHIPPING_OPTION) {
                        update.newShippingOptionParameters = googlePayHelpers.buildShippingMethods(this.walletRequest);
                    }
                    if (callbackTrigger === googlePayEnums.CallbackType.OFFER) {
                        update.newOfferInfo = googlePayHelpers.buildOfferInfo(this.walletRequest);
                    }
                    resolve(update);
                };
                if (callbackTrigger === googlePayEnums.CallbackType.INITIALIZE &&
                    !this.walletRequest.requireShippingAddress) {
                    return resolve({});
                }
                if (!this.listenerCallbacks[eventType]) {
                    return resolve({
                        error: googlePayHelpers.buildMissedHandlerError(eventType, callbackIntent),
                    });
                }
                if (callbackIntent === googlePayEnums.CallbackType.SHIPPING_OPTION &&
                    intermediatePaymentData.shippingOptionData) {
                    this.processCallbacks(event_type_1.EventType.ShippingMethodChange, Object.assign(Object.assign({}, walletHelpers.buildShippingMethodResponse(intermediatePaymentData.shippingOptionData, this.walletRequest.shippingMethods)), { updateWith: updateWith }));
                }
                else if (callbackIntent === googlePayEnums.CallbackType.SHIPPING_ADDRESS &&
                    intermediatePaymentData.shippingAddress) {
                    this.processCallbacks(event_type_1.EventType.ShippingAddressChange, Object.assign(Object.assign({}, walletHelpers.buildShippingAddressResponse(intermediatePaymentData.shippingAddress)), { updateWith: updateWith }));
                }
                else if (callbackIntent === googlePayEnums.CallbackType.OFFER &&
                    ((_a = intermediatePaymentData.offerData) === null || _a === void 0 ? void 0 : _a.redemptionCodes)) {
                    if (intermediatePaymentData.offerData.redemptionCodes.length > 1) {
                        return resolve({
                            newOfferInfo: googlePayHelpers.buildOfferInfo(this.walletRequest),
                            error: googlePayHelpers.buildDuplicateCouponCodeError(callbackIntent),
                        });
                    }
                    this.processCallbacks(event_type_1.EventType.CouponCodeChange, Object.assign(Object.assign({}, walletHelpers.buildCouponCodeResponse(intermediatePaymentData.offerData.redemptionCodes)), { updateWith: updateWith }));
                }
                else {
                    //Should never happen
                    const error = googlePayHelpers.buildPaymentDataChangedHandlerError(callbackTrigger);
                    console.error(error);
                    resolve({ error });
                }
            });
        };
        this.googlePayPaymentAuthorizedHandler = (paymentData) => {
            return new Promise((resolve, reject) => {
                const complete = (walletRequest) => {
                    const data = walletRequest || {};
                    this.updateWalletRequest(data, event_type_1.EventType.PaymentAuthorized);
                    const error = googlePayHelpers.buildError(this.walletRequest, googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION);
                    resolve({
                        transactionState: error ? "ERROR" : "SUCCESS",
                        error: error,
                    });
                };
                if (!this.listenerCallbacks[event_type_1.EventType.PaymentAuthorized]) {
                    return resolve({
                        transactionState: "ERROR",
                        error: googlePayHelpers.buildMissedHandlerError(event_type_1.EventType.PaymentAuthorized, googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION),
                    });
                }
                this.getWalletNonce(walletHelpers.buildWalletNonceRequest(paymentData)).then(nonceEventData => {
                    this.processCallbacks(event_type_1.EventType.PaymentAuthorized, Object.assign(Object.assign({}, walletHelpers.buildPaymentAuthorizedResponse(paymentData, nonceEventData)), { complete: complete }));
                }).catch(error => {
                    resolve({
                        transactionState: "ERROR",
                        error: googlePayHelpers.buildWalletNonceError(googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION, error),
                    });
                });
            });
        };
        this.businessId = businessId;
        this.applicationId = applicationId;
        this.walletRequest = walletRequest;
        this.iFrame = null;
        this.ssid = "";
        this.listenerCallbacks = {};
        this.siftSessionId = (0, sift_1.loadSiftJSSnippet)();
        this.walletContainer = { buttonsContainer: null };
        this.messageChannel = null;
    }
    //add callback listener for a specific event
    on(eventName, callback) {
        if (!this.listenerCallbacks[eventName]) {
            this.listenerCallbacks[eventName] = [];
        }
        this.listenerCallbacks[eventName].push(callback);
    }
    //remove callback listener for a specific event
    off(eventName, callback) {
        if (!this.listenerCallbacks[eventName]) {
            return;
        }
        this.listenerCallbacks[eventName] = this.listenerCallbacks[eventName].filter((item) => {
            return item !== callback;
        });
    }
    postIFrameMessage(data, port) {
        var _a, _b;
        const stringifiedData = JSON.stringify(data);
        (_b = (_a = this.iFrame) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage(stringifiedData, "*", port ? [port] : undefined);
    }
    ;
    getIFrame() {
        return this.iFrame;
    }
    mount(domElement, document, mountOptions) {
        commonHelpers.loadScript(constants.RECAPTCHA_SCRIPT_URL + constants.RECAPTCHA_KEY).then(() => {
            this.iFrame = commonHelpers.createIFrame(this.businessId, this.applicationId, mountOptions);
            this.ssid = commonHelpers.getSsid();
            this.iFrame.onload = () => {
                this.createMessageChannel();
            };
            const form = document.getElementById(domElement);
            form === null || form === void 0 ? void 0 : form.appendChild(this.iFrame);
        });
        const iFrameReadyHandler = () => {
            var _a, _b, _c;
            this.off(event_type_1.EventType.IFrameContentReady, iFrameReadyHandler);
            if (!this.iFrame) {
                return;
            }
            const applePay = (_a = mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.paymentMethods) === null || _a === void 0 ? void 0 : _a.includes(wallet_type_1.WalletType.ApplePay);
            const googlePay = (_b = mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.paymentMethods) === null || _b === void 0 ? void 0 : _b.includes(wallet_type_1.WalletType.GooglePay);
            if (applePay || googlePay) {
                const buttonsContainer = document.createElement("div");
                buttonsContainer.setAttribute("id", "wallet-buttons-container");
                buttonsContainer.setAttribute("class", ((_c = mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.buttonsContainerOptions) === null || _c === void 0 ? void 0 : _c.className) || "");
                commonHelpers.setButtonsContainerProperties(buttonsContainer, mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.buttonsContainerOptions);
                // const grecaptchaContainer = document.createElement("div");
                // grecaptchaContainer.id = "collect-grecaptcha";
                // buttonsContainer.appendChild(grecaptchaContainer);
                const form = document.getElementById(domElement);
                form === null || form === void 0 ? void 0 : form.appendChild(buttonsContainer);
                this.walletContainer.buttonsContainer = buttonsContainer;
                // show apple pay button when VT is successfully loaded
                if (applePay) {
                    this.showApplePayButton(mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.buttonOptions);
                }
                // show google pay button when VT is successfully loaded
                if (googlePay) {
                    this.showGooglePayButton(mountOptions === null || mountOptions === void 0 ? void 0 : mountOptions.buttonOptions);
                }
                // grecaptcha.enterprise.render("collect-grecaptcha", {
                //   "sitekey": constants.SAURABH_KEY,
                // });
            }
        };
        this.on(event_type_1.EventType.IFrameContentReady, iFrameReadyHandler);
    }
    /**
     * Calls webview to get nonce
     * @param getNonceOptions
     */
    getNonce(getNonceOptions) {
        if (this.iFrame) {
            getNonceOptions.ssid = this.ssid;
            grecaptcha.enterprise.execute(constants.RECAPTCHA_KEY, { action: 'card_button' }).then(function (token) {
                console.log('reCAPTCHA Enterprise token: ', token);
            });
            this.postIFrameMessage({
                type: event_type_1.EventType.OpGetNonce,
                options: getNonceOptions,
            });
        }
    }
    getWalletNonce(getWalletNonceOptions) {
        return new Promise((resolve, reject) => {
            if (this.iFrame) {
                getWalletNonceOptions.ssid = this.ssid;
                const removeEventHandlers = () => {
                    this.off(event_type_1.EventType.WalletNonce, walletNonceHandler);
                    this.off(event_type_1.EventType.WalletNonceError, walletNonceErrorHandler);
                };
                const walletNonceHandler = (nonce) => {
                    removeEventHandlers();
                    clearTimeout(timeout);
                    resolve(nonce);
                };
                const walletNonceErrorHandler = (error) => {
                    removeEventHandlers();
                    clearTimeout(timeout);
                    reject(error);
                };
                const timeout = setTimeout(() => {
                    removeEventHandlers();
                    reject(new Error("Timeout error while generating nonce"));
                }, 10000);
                this.on(event_type_1.EventType.WalletNonce, walletNonceHandler);
                this.on(event_type_1.EventType.WalletNonceError, walletNonceErrorHandler);
                this.postIFrameMessage({
                    type: event_type_1.EventType.OpGetWalletNonce,
                    options: getWalletNonceOptions,
                });
            }
            else {
                reject(new Error("getWalletNonce error: iFrame not found"));
            }
        });
    }
    /**
     * Calls webview to create an ecommerce transaction
     * @param options
     */
    createEcommerceTransaction(options) {
        if (this.iFrame) {
            this.postIFrameMessage({
                type: event_type_1.EventType.CreateEcommerceTransaction,
                options: options,
            });
        }
    }
    // Create sale or auth transaction using card token.
    createNonceTransaction(createNonceTransactionOptions) {
        if (this.iFrame) {
            this.postIFrameMessage({
                type: event_type_1.EventType.OpCreateNonceTransaction,
                options: createNonceTransactionOptions,
            });
        }
    }
    /**
     * Reloads the iFrame.
     */
    reload() {
        var _a;
        if (this.iFrame) {
            (_a = this.iFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.location.reload();
        }
    }
    /**
     * Unmounts
     */
    unmount(domElement, document) {
        if (this.messageChannel) {
            this.messageChannel.port1.close();
            this.messageChannel.port2.close();
            this.messageChannel = null;
        }
        if (document && domElement) {
            const form = document.getElementById(domElement);
            // remove VT iframe
            if (this.iFrame) {
                if (form === null || form === void 0 ? void 0 : form.contains(this.iFrame)) {
                    form === null || form === void 0 ? void 0 : form.removeChild(this.iFrame);
                }
                this.iFrame = null;
            }
            // remove apple pay and google pay buttons
            if (this.walletContainer.buttonsContainer) {
                if (form === null || form === void 0 ? void 0 : form.contains(this.walletContainer.buttonsContainer)) {
                    form === null || form === void 0 ? void 0 : form.removeChild(this.walletContainer.buttonsContainer);
                }
                this.walletContainer.buttonsContainer = null;
            }
        }
    }
    abortApplePaySession() {
        if (this.walletContainer.applePaySession) {
            try {
                this.walletContainer.applePaySession.abort();
                this.walletContainer.applePaySession = undefined;
            }
            catch (error) {
                console.error("abortApplePaySession error: ", error);
            }
        }
        else {
            console.error("abortApplePaySession error: ApplePay session not found");
        }
    }
    /**
     * Shows applepay button DOM element to parent DOM element. Client
     * should handle ApplePay button styling (via CSS) and pass-in
     * className for VT to render.
     *
     * @param buttonOptions WalletRequest buttonOptions
     */
    showApplePayButton(buttonOptions) {
        var _a;
        const container = document.createElement("div");
        container.id = "applepay-button-container";
        const button = document.createElement("button");
        let type = buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.type;
        if ((buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.type) === "checkout") {
            type = "check-out";
        }
        button.setAttribute("type", "button");
        button.style.setProperty("-webkit-appearance", "-apple-pay-button");
        button.style.setProperty("-apple-pay-button-type", type || "buy");
        button.style.setProperty("-apple-pay-button-style", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.color) || "black");
        button.style.setProperty("cursor", "pointer");
        button.setAttribute("lang", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.locale) || "en");
        button.onclick = this.applePayHandler.bind(this);
        container.appendChild(button);
        commonHelpers.setButtonProperties(container, buttonOptions);
        // attach Apple Pay button to wallet container
        (_a = this.walletContainer.buttonsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(container);
    }
    /**
     * Shows googlepay button DOM element to parent DOM element. Client
     * should handle GooglePay button styling (via options) and pass-in
     * GooglePayButtonOptions for VT to render.
     *
     * @param buttonOptions GooglePayButtonOptions
     */
    showGooglePayButton(buttonOptions) {
        var _a;
        try {
            if (this.walletContainer.paymentsClient) {
                const container = this.walletContainer.paymentsClient.createButton({
                    buttonColor: buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.color,
                    buttonType: buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.type,
                    buttonSizeMode: "fill",
                    buttonLocale: buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.locale,
                    allowedPaymentMethods: [
                        googlePayHelpers.getBaseCardPaymentMethod(this.walletRequest)
                    ],
                    onClick: this.googlePayHandler.bind(this),
                });
                container.id = "googlepay-button-container";
                commonHelpers.setButtonProperties(container, buttonOptions);
                // attach Google Pay button to wallet container
                (_a = this.walletContainer.buttonsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(container);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * Checks if wallet payment is supported based on browser
     *
     * @returns Boolean promise indicating wallet payment is supported
     */
    supportWalletPayments() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                googlePay: false,
                applePay: false,
            };
            const disableApplePay = (_b = (_a = this.walletRequest) === null || _a === void 0 ? void 0 : _a.disableWallets) === null || _b === void 0 ? void 0 : _b.applePay;
            const disableGooglePay = (_d = (_c = this.walletRequest) === null || _c === void 0 ? void 0 : _c.disableWallets) === null || _d === void 0 ? void 0 : _d.googlePay;
            if (!this.walletRequest) {
                console.error(new Error("Wallet request cannot be null."));
                return result;
            }
            if (!disableApplePay) {
                try {
                    if (window.ApplePaySession &&
                        ApplePaySession.supportsVersion(constants.APPLEPAY_VERSION) &&
                        ApplePaySession.canMakePayments()) {
                        result.applePay = true;
                    }
                    else {
                        result.applePay = false;
                    }
                }
                catch (error) {
                    console.error("JS Exception caught in supportWalletPayments method: ", error);
                }
            }
            if (!disableGooglePay) {
                try {
                    yield commonHelpers.loadScript(constants.GOOGLEPAY_SCRIPT_URL);
                    if ((_f = (_e = window.google) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.api) {
                        const googlePayValidationPayload = yield googlePayHelpers.validateGooglePay(this.businessId, this.applicationId);
                        if (googlePayValidationPayload.authJwt && googlePayValidationPayload.googleEnvironment) {
                            const paymentsClient = this.buildGooglePayPaymentsClient(this.walletRequest, googlePayValidationPayload.googleEnvironment);
                            const isReadyToPay = yield paymentsClient.isReadyToPay({
                                apiVersion: constants.GOOGLEPAY_VERSION,
                                apiVersionMinor: constants.GOOGLEPAY_VERSION_MINOR,
                                allowedPaymentMethods: [
                                    googlePayHelpers.getBaseCardPaymentMethod(this.walletRequest)
                                ],
                                existingPaymentMethodRequired: false,
                            });
                            result.googlePay = isReadyToPay.result;
                            if (result.googlePay) {
                                this.walletContainer.paymentsClient = paymentsClient;
                                this.walletContainer.googlePayValidationPayload = googlePayValidationPayload;
                            }
                        }
                    }
                }
                catch (error) {
                    console.error("JS Exception caught in supportWalletPayments method: ", error);
                }
            }
            return result;
        });
    }
    /**
     * Updates wallet request total, display items, and shipping methods
     * when payment sheet is modified. This method should be used inside
     * callback functions of wallet events.
     *
     * @param update containing total, lineItems, shippingMethods
     */
    updateWalletRequest(update, event) {
        var _a;
        let request = this.walletRequest;
        // if no update on errors, then set errors as null and resolve all errors
        request.error = update.error;
        if (event === event_type_1.EventType.PaymentAuthorized) {
            return;
        }
        if (update.total) {
            request.total = update.total;
        }
        if (update.lineItems) {
            request.lineItems = update.lineItems;
        }
        if (event !== event_type_1.EventType.ShippingMethodChange && ((_a = update.shippingMethods) === null || _a === void 0 ? void 0 : _a.length)) {
            request.shippingMethods = update.shippingMethods;
        }
        if (event === event_type_1.EventType.CouponCodeChange && update.couponCode) {
            request.couponCode = update.couponCode;
        }
    }
    /**
     * ApplePay button on-click handler. This method will
     * 1) Create ApplePaySession based on stored WalletRequest
     * 2) Initialize user-defined events. See `event-type.ts` for list of supported events
     * 3) Start ApplePaySession
     * 4) Validate merchant through ApiService
     */
    applePayHandler() {
        if (!window.ApplePaySession) {
            console.error("ApplePay session not found");
            return;
        }
        // if (!grecaptcha.enterprise.getResponse()) {
        //   return console.log("YOU ARE A ROBOT!");
        // }
        // console.log("reCAPTCHA token: ", grecaptcha.enterprise.getResponse());
        grecaptcha.enterprise.execute(constants.RECAPTCHA_KEY, { action: 'apple_pay_button' }).then(function (token) {
            console.log('reCAPTCHA Enterprise token: ', token);
        });
        this.processCallbacks(event_type_1.EventType.WalletButtonClick, { source: wallet_type_1.WalletType.ApplePay });
        const session = this.buildApplePaySession();
        const request = this.walletRequest;
        // Merchant website validation
        session.onvalidatemerchant = (event) => {
            this.postIFrameMessage({
                type: event_type_1.EventType.OpValidateApplePay,
                options: {
                    domainName: document.domain,
                    validationUrl: event.validationURL,
                    displayName: request && request.merchantName,
                },
            });
        };
        const validateApplePayHandler = (paymentSession) => {
            this.off(event_type_1.EventType.ValidateApplePay, validateApplePayHandler);
            try {
                session.completeMerchantValidation(paymentSession.data);
            }
            catch (e) {
                console.log("Exception ignored on merchant validation: ", e);
            }
        };
        this.on(event_type_1.EventType.ValidateApplePay, validateApplePayHandler);
        // end Merchant Validation
        if (request.requireShippingAddress) {
            if (this.listenerCallbacks[event_type_1.EventType.ShippingAddressChange]) {
                session.onshippingcontactselected = (event) => {
                    const updateWith = (walletRequest) => {
                        this.updateWalletRequest(walletRequest, event_type_1.EventType.ShippingAddressChange);
                        session.completeShippingContactSelection({
                            newTotal: applePayHelpers.buildTotal(request),
                            newLineItems: applePayHelpers.buildLineItems(request),
                            newShippingMethods: applePayHelpers.buildShippingMethods(request),
                            errors: applePayHelpers.buildErrors(request),
                        });
                    };
                    this.processCallbacks(event_type_1.EventType.ShippingAddressChange, Object.assign(Object.assign({}, walletHelpers.buildShippingAddressResponse(event.shippingContact)), { updateWith: updateWith }));
                };
            }
            if (this.listenerCallbacks[event_type_1.EventType.ShippingMethodChange]) {
                session.onshippingmethodselected = (event) => {
                    const updateWith = (walletRequest) => {
                        this.updateWalletRequest(walletRequest, event_type_1.EventType.ShippingMethodChange);
                        session.completeShippingMethodSelection({
                            newTotal: applePayHelpers.buildTotal(request),
                            newLineItems: applePayHelpers.buildLineItems(request),
                        });
                    };
                    this.processCallbacks(event_type_1.EventType.ShippingMethodChange, Object.assign(Object.assign({}, walletHelpers.buildShippingMethodResponse(event.shippingMethod, request.shippingMethods)), { updateWith: updateWith }));
                };
            }
        }
        if (this.listenerCallbacks[event_type_1.EventType.PaymentMethodChange]) {
            session.onpaymentmethodselected = (event) => {
                const updateWith = (walletRequest) => {
                    this.updateWalletRequest(walletRequest, event_type_1.EventType.PaymentMethodChange);
                    session.completePaymentMethodSelection({
                        newTotal: applePayHelpers.buildTotal(request),
                        newLineItems: applePayHelpers.buildLineItems(request),
                    });
                };
                this.processCallbacks(event_type_1.EventType.PaymentMethodChange, Object.assign(Object.assign({}, event), { updateWith: updateWith }));
            };
        }
        if (this.listenerCallbacks[event_type_1.EventType.PaymentAuthorized]) {
            session.onpaymentauthorized = (event) => {
                const complete = (walletRequest) => {
                    const data = walletRequest || {};
                    this.updateWalletRequest(data, event_type_1.EventType.PaymentAuthorized);
                    const errors = applePayHelpers.buildErrors(request);
                    session.completePayment({
                        status: errors ? ApplePaySession.STATUS_FAILURE : ApplePaySession.STATUS_SUCCESS,
                        errors: errors,
                    });
                };
                this.getWalletNonce(walletHelpers.buildWalletNonceRequest(event.payment)).then(nonceEventData => {
                    this.processCallbacks(event_type_1.EventType.PaymentAuthorized, Object.assign(Object.assign({}, walletHelpers.buildPaymentAuthorizedResponse(event.payment, nonceEventData)), { complete: complete }));
                }).catch(error => {
                    session.completePayment({
                        status: ApplePaySession.STATUS_FAILURE,
                        errors: applePayHelpers.buildWalletNonceError(error),
                    });
                });
            };
        }
        if (this.listenerCallbacks[event_type_1.EventType.CloseWallet]) {
            session.oncancel = (event) => {
                this.processCallbacks(event_type_1.EventType.CloseWallet, event);
            };
        }
        if (request.supportCouponCode && this.listenerCallbacks[event_type_1.EventType.CouponCodeChange]) {
            session.oncouponcodechanged = (event) => {
                const updateWith = (walletRequest) => {
                    this.updateWalletRequest(walletRequest, event_type_1.EventType.CouponCodeChange);
                    session.completeCouponCodeChange({
                        // Update the payment request with any changed information.
                        newTotal: applePayHelpers.buildTotal(request),
                        newLineItems: applePayHelpers.buildLineItems(request),
                        newShippingMethods: applePayHelpers.buildShippingMethods(request),
                        errors: applePayHelpers.buildErrors(request),
                    });
                };
                this.processCallbacks(event_type_1.EventType.CouponCodeChange, Object.assign(Object.assign({}, walletHelpers.buildCouponCodeResponse(event.couponCode)), { updateWith: updateWith }));
            };
        }
        session.begin();
    }
    /**
     * GooglePay button on-click handler. This method will
     * 1) Create GooglePayPaymentRequest based on stored WalletRequest
     * 2) Open GooglePay payment sheet
     */
    googlePayHandler() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.walletContainer.paymentsClient) {
                console.error("GooglePay payments client not found");
                return;
            }
            if (!((_a = this.walletContainer.googlePayValidationPayload) === null || _a === void 0 ? void 0 : _a.authJwt)) {
                console.error("GooglePay auth JWT token not found");
                return;
            }
            // if (!grecaptcha.enterprise.getResponse()) {
            //   return console.log("YOU ARE A ROBOT!");
            // }
            // console.log("reCAPTCHA token: ", grecaptcha.enterprise.getResponse());
            grecaptcha.enterprise.execute(constants.RECAPTCHA_KEY, { action: 'google_pay_button' }).then(function (token) {
                console.log('reCAPTCHA Enterprise token: ', token);
            });
            this.processCallbacks(event_type_1.EventType.WalletButtonClick, { source: wallet_type_1.WalletType.GooglePay });
            const paymentDataRequest = googlePayHelpers.buildPaymentRequest(this.walletRequest, this.businessId, this.walletContainer.googlePayValidationPayload.authJwt);
            try {
                yield this.walletContainer.paymentsClient.loadPaymentData(paymentDataRequest);
            }
            catch (error) {
                console.error(error);
                this.processCallbacks(event_type_1.EventType.CloseWallet, { reason: error });
            }
        });
    }
    /**
     * Creates new ApplePaySession on start or on WalletRequest update.
     * @returns ApplePaySession
     */
    buildApplePaySession() {
        this.walletContainer.applePaySession = new ApplePaySession(constants.APPLEPAY_VERSION, applePayHelpers.buildPaymentRequest(this.walletRequest));
        return this.walletContainer.applePaySession;
    }
    /**
     * Creates new GooglePayPaymentsClient on start.
     * @returns PaymentsClient
     */
    buildGooglePayPaymentsClient(walletRequest, googleEnvironment) {
        const paymentDataCallbacks = {
            onPaymentAuthorized: this.googlePayPaymentAuthorizedHandler.bind(this),
        };
        if (walletRequest.requireShippingAddress ||
            walletRequest.supportCouponCode) {
            paymentDataCallbacks.onPaymentDataChanged = this.googlePayPaymentDataChangedHandler.bind(this);
        }
        const paymentsClient = new window.google.payments.api.PaymentsClient({
            environment: googleEnvironment,
            merchantInfo: {
                merchantName: walletRequest.merchantName,
                merchantId: constants.GOOGLEPAY_MERCHANT_ID,
            },
            paymentDataCallbacks: paymentDataCallbacks
        });
        return paymentsClient;
    }
    /**
     * Process callback functions synchronously
     * @param eventType Event string defined in event-type.ts
     * @param data      callback data
     * @return Object returned from user-defined callback
     */
    processCallbacks(eventType, data) {
        const callbacks = this.listenerCallbacks[eventType] || [];
        callbacks.forEach((callback) => {
            callback(data);
        });
    }
}
exports.TokenizeJs = TokenizeJs;

},{"./lib/constants":33,"./lib/enums/event-type":35,"./lib/enums/googlepay":36,"./lib/enums/wallet-type":37,"./lib/helpers/applepay":38,"./lib/helpers/common":39,"./lib/helpers/googlepay":40,"./lib/helpers/sift":41,"./lib/helpers/wallet":42}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoyntCollect = void 0;
const sift_1 = require("./lib/helpers/sift");
const constants_1 = require("./lib/constants");
const event_type_1 = require("./lib/enums/event-type");
const qs_1 = require("qs");
const IFRAME_NAME = "poynt-collect-iframe";
// v1 poynt collect for mangomint/moolah
class PoyntCollect {
    constructor(apiKey, applicationId) {
        this.apiKey = apiKey;
        this.applicationId = applicationId;
        this.iFrame = null;
        this.listenerCallbacks = {};
        this.siftSessionId = (0, sift_1.loadSiftJSSnippet)();
        this.isV2 = false;
        var self = this;
        this.eventCallbackHandler = function eventCallbackHandler(event) {
            // console.log("sdk eventlistener", event);
            // TODO: validate event.origin to be really vt.poynt.net (different based on environment)
            // dont publish the entire event, only publish the part customized by us
            const data = JSON.parse(event.data);
            const type = data.type;
            const callbacks = self.listenerCallbacks[type] || [];
            callbacks.forEach((callback) => {
                callback(data);
            });
        };
    }
    on(eventName, callback) {
        if (!this.listenerCallbacks[eventName]) {
            this.listenerCallbacks[eventName] = [];
        }
        this.listenerCallbacks[eventName].push(callback);
    }
    getIFrame() {
        return this.iFrame;
    }
    populateUrlOptionsDefaults(options) {
        if (options.style === undefined) {
            options.style = {
                container: {},
                input: {
                    firstName: {},
                    lastName: {},
                    email: {},
                },
            };
        }
        if (options.displayComponents) {
            if (options.displayComponents.submitButton === undefined) {
                options.displayComponents.submitButton = false;
            }
            if (options.displayComponents.firstName === undefined) {
                options.displayComponents.firstName = false;
            }
            if (options.displayComponents.lastName === undefined) {
                options.displayComponents.lastName = false;
            }
            if (options.displayComponents.zipCode === undefined) {
                options.displayComponents.zipCode = false;
            }
            if (options.displayComponents.emailAddress === undefined) {
                options.displayComponents.emailAddress = false;
            }
        }
        else {
            options.displayComponents = {
                submitButton: false,
                firstName: false,
                lastName: false,
                zipCode: false,
                emailAddress: false,
            };
        }
        if (options.emailReceipt === undefined) {
            options.emailReceipt = true;
        }
    }
    mount(domElement, document, mountOptions) {
        // TODO: change iFrameUrl to use new subdomains as soon as they are ready
        var iFrameUrl = constants_1.PUBLIC_URL + "/react/poynt-collect";
        this.iFrame = document.createElement("iframe");
        this.iFrame.setAttribute("name", IFRAME_NAME);
        this.iFrame.setAttribute("id", IFRAME_NAME);
        const form = document.getElementById(domElement);
        form === null || form === void 0 ? void 0 : form.appendChild(this.iFrame);
        var allOptions = mountOptions || {};
        this.populateUrlOptionsDefaults(allOptions);
        allOptions.apiKey = this.apiKey;
        allOptions.applicationId = this.applicationId;
        allOptions.parentUrl = window.location.hostname;
        allOptions.isV2 = this.isV2;
        let urlParams = (0, qs_1.stringify)(allOptions);
        iFrameUrl += "?" + urlParams + "&breakcache=" + new Date().toISOString();
        // console.log("iframeUrl", iFrameUrl);
        if (mountOptions) {
            if (mountOptions.style && mountOptions.iFrame) {
                this.iFrame.style.cssText = mountOptions.iFrame;
                if (mountOptions.iFrame.height) {
                    this.iFrame.style["height"] = mountOptions.iFrame.height;
                }
                if (mountOptions.iFrame.width) {
                    this.iFrame.style["width"] = mountOptions.iFrame.width;
                }
                if (mountOptions.iFrame.border) {
                    this.iFrame.style["border"] = mountOptions.iFrame.border;
                }
                if (mountOptions.iFrame.borderRadius) {
                    this.iFrame.style["borderRadius"] = mountOptions.iFrame.borderRadius;
                }
                if (mountOptions.iFrame.boxShadow) {
                    this.iFrame.style["boxShadow"] = mountOptions.iFrame.boxShadow;
                }
            }
        }
        // setup the listener once iframe is mounted
        this.iFrame.contentWindow.parent.addEventListener("message", this.eventCallbackHandler, "*");
        // Note: 'iFrameUrl' might not be available.
        //       May want to check url availability here and set some error url.
        this.iFrame.setAttribute("src", iFrameUrl);
        this.on(event_type_1.EventType.IFrameContentReady, () => {
            this.iFrame.contentWindow.postMessage({
                type: event_type_1.EventType.SiftSession,
                // @ts-ignore
                options: {
                    isV2: false,
                    siftSessionId: this.siftSessionId,
                },
            }, "*");
        });
    }
    /**
     * Calls webview to create a transaction.
     * @param createTransactionOptions
     * @deprecated only tokenized transactions will be supported
     */
    createTransaction(createTransactionOptions) {
        // console.log("createTransaction", createTransactionOptions);
        if (!createTransactionOptions || createTransactionOptions.amount === undefined) {
            throw new Error("Amount needs to be specified");
        }
        if (this.iFrame) {
            this.iFrame.contentWindow.postMessage({
                type: event_type_1.EventType.OpCreateTransaction,
                options: createTransactionOptions,
            }, "*");
        }
    }
    /**
     * Calls webview to create a token.
     * @param createTokenOptions
     */
    createToken(createTokenOptions) {
        // console.log("createToken", createTokenOptions);
        if (this.iFrame) {
            this.iFrame.contentWindow.postMessage({
                type: event_type_1.EventType.OpCreateToken,
                options: createTokenOptions,
            }, "*");
        }
    }
    // Create sale or auth transaction using card token.
    createTokenTransaction(createTokenTransactionOptions) {
        if (this.iFrame) {
            this.iFrame.contentWindow.postMessage({
                type: event_type_1.EventType.OpCreateTokenTransaction,
                options: createTokenTransactionOptions,
            }, "*");
        }
    }
    /**
     * Reloads the iFrame.
     */
    reload() {
        if (this.iFrame) {
            this.iFrame.contentWindow.location.reload();
        }
    }
    /**
     * Unmounts
     */
    unmount(domElement, document) {
        // console.log("unmounting");
        if (this.iFrame) {
            this.iFrame.contentWindow.parent.removeEventListener("message", this.eventCallbackHandler, "*");
            if (domElement && document) {
                const form = document.getElementById(domElement);
                form === null || form === void 0 ? void 0 : form.removeChild(this.iFrame);
            }
            this.iFrame = null;
        }
    }
}
exports.PoyntCollect = PoyntCollect;

},{"./lib/constants":33,"./lib/enums/event-type":35,"./lib/helpers/sift":41,"qs":12}]},{},[32]);
