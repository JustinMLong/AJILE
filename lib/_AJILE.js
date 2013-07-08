var AJILE = (function() { 

  var exports = {}, modules = {ready:{}, loading:{}}, 
    options = {defaults: {}, overrides: {}};

/*  var require = exports.require = function(moduleID) {
    if (arguments.length > 1) { 
      return Array.prototype.slice.call(arguments, 0).map(function(id){
        return require(id);
      }); 
    }

    var module;
    require.paths.forEach(function(path) {
      if (!module && existsWithin(moduleID, path)) 
        module = getModule(moduleID, path);
    });

  };
  require.paths = [
    "js:defined(.)",
    "file:.\.js",
    "file:../externs/.\.js"
  ];*/

  var require = exports.require = function(moduleID) {
   return modules.ready[moduleID].definition;
  }

  var existsWithin = function(moduleName, path) {

  };


  var extend = exports.extend = function(module, name, func) {
    if (typeof module == 'string') module = require(module);
    module[name] = func;
  };
  
  var inject = exports.inject = function() {
    
    
  };

  var override = exports.override = function(requestedObj, val) {
    options.overrides[requestedObj] = val;
  };
  
  var provide = exports.provide = function(id) {
    var id = id+'.';
    return function(name, value) {
    options.defaults[id + name] = value;
    return options.overrides[id + name] || value;
    };
  };
  
  var request = exports.request = function (requestedObj) {
    if (!~requestedObj.indexOf('.')) requestedObj = 'base.' + requestedObj;
    return options.overrides[requestedObj] || options.defaults[requestedObj];
  };

  var Module = function (id, vers, dep, constructor) {
    this.id = id, this.version = vers, this.dependencies = dep, this.constructor = constructor;
    this.prototype = Module.prototype; Module.prototype.provide = Module.prototype.provide(id);
    this.definition = constructor.apply(this, dep);
  };
  Module.prototype = (function(){
    this.request = request, this.provide = provide, this.override = override, 
    this.inject = inject, this.extend = extend; return this;
  })();
  Module.constructor = Module;
  
  var attemptLoad = function (id, vers, dep, moduleConstructor) {
    try {
      with (exports) {
      modules.ready[id] = new Module(id, vers, dep, moduleConstructor); }

      /*Object.keys(modules.ready[id].definition).forEach(function(api){
        modules.ready[id].prototype[api] = modules.ready[id].definition[api];
      });*/
    }
    catch (excep) {
      console.log(excep);
      modules.loading[id] = {
        dependencies: dep,
        module: {
          name: id,
          version: vers,
          dependencies: dep,
          definition: constructor
        }
      };
    }
  };
  
  var define = exports.define = function (moduleDef) { 
    if (!moduleDef) return;
    var id = moduleDef.name, vers = moduleDef.version, 
      dependencies = moduleDef.requirements, factory = moduleDef.constructor;
    if (modules.ready[id]) return this.modules.ready[id];

    dependencies = dependencies.map(function(module) {
      return require(module);
    });

    attemptLoad.call(this, id, vers, dependencies, factory);
  };
  

  return exports;
})();