function OrganizedList(ChF) {
	var back = [], chanFun = ChF;
	
	this.push = function (ele) 
		{ back[back.length] = ele; chanFun.call(null, ele, back.length-1, back); return ele; };
	this.pop = function ()
		{ return back.pop(); };
	this.remove = this.add = function (idx, ele) { 
		var ret = (ele == null)?(back.splice(idx,1)[0]):([back.splice(idx,0,ele),ele][1]);
		for (; idx < back.length; idx++) 
			{ chanFun.apply(null, [back[idx], idx, back]); }
		return ret;
	};
	this.peek = function() { return back[back.length-1]; };
	this.check = function (idx) { return back[idx]; };
	this.valueOf = function () 
		{ return back.slice(0); }
}

var sandbox = {
  blocking: function blocking(ele) {
    var e = (typeof ele=='String')?document.getElementById(ele):ele;
    e.style.display = (e.style.display == 'none')?'':'none';
  }
};
blocking = sandbox.blocking;

//ECMA 5 fallbacks
(function() {
//Array
var arrP = Array.prototype;
if (!('forEach' in arrP)) Array.prototype.forEach = function(fn, that) { 
  for (var i=0, n=this.length; i<n; i++) fn.call(that, this[i], i, this);
};

if (!('map' in arrP)) Array.prototype.map = function(action, that) { 
  for (var i=0, tmpArr = []; i < this.length; i++)
    tmpArr.push(action.call(that, this[i], i, this));
  return tmpArr;
}; 

if (!('filter' in arrP)) Array.prototype.filter = function (action, that) { 
  var tmpArr = []; for (var i=0; i < this.length; i++)
    { if (i in this && action.call(that, this[i], i, this)) tmpArr.push(this[i]); }
  return tmpArr;
}; 

if (!('indexOf' in arrP)) Array.prototype.indexOf = function (ele, beginLoc) { 
  for (var i=(beginLoc||0); i < this.length; i++) if (ele === this[i]) return i;
  return -1;
};

if (!('reduce' in arrP)) Array.prototype.reduce = function (action, initLoc) {
  var tmpArr = []; for (var i=(initLoc||0); i < this.length; i++)
    tmpArr = action.call(undefined, tmpArr, this[i], i, this);
  return tmpArr;
};

if (!('some' in arrP)) Array.prototype.some = function (action, that) {
  for (var i=0, isTrue=0; i < this.length; i++) isTrue = action.call(that, this[i], i, this);
  return isTrue;
};
if (!('isArray' in Array)) Array.isArray = function (obj) {	
  return (typeof obj == 'object' && /array/i.test(obj.constructor));
};

//String
if (!('trim' in String.prototype)) String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,'');
};

//Date
if (!('now' in Date)) Date.now = function () { return +(new Date); };

//Object
if (!('keys' in Object)) Object.keys = function(obj) 
  { var keys = []; for (var props in obj) obj.hasOwnProperty(props) && keys.push(props); return keys;
}; 
})();


String.prototype.matchCount = function (regxp) {return (this.match(regxp)?this.match(regxp).length:0);};

String.prototype.getInnerHtml = function (tag) {
  var attr = (!!arguments[1])? ' '+arguments[1]: '', TAtL = tag.length+attr.length;
  if (this.indexOf('<'+tag+attr+'>') != -1 && this.lastIndexOf('</'+tag+'>') != -1)
    {return this.substring((this.indexOf('<'+tag+attr+'>')+TAtL+2),this.lastIndexOf('</'+tag+'>'));}
  else { return this; }
};

RegExp.escapeText = function(text) 
	{ return text.replace(new RegExp('(\\'+('/.*+?|()[]{}\\'.split('').join('|\\'))+')', 'g'), '\\$1');  };