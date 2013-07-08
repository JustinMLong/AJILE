AJILE.define('view', ['dom', 'selector'], function (dom, selector) {

    var exports = {};

    var loadSubs = exports.loadSubs = function() {
      dom.create('#codeView',
        'ul.tier>li[content="(O): AJILE {"].object>ul.tier');

            view.mapProps(AJILE, $A('li > ul', $A('#codeView')));
    };

    var mapProps = exports.mapProps = function (obj, holder) {
        Object.keys(obj).forEach(function(modules) {
            var txt = modules, liType;
            switch (typeof obj[modules]) {
                case 'function': { txt = '(F): ' + txt;                                        liType = 'function'; break; }
                case   'object': { txt = '(O): ' + txt + ' {';                                 liType = 'object';   break; } 
                default        : { txt = '(P): ' + txt + ' (current value: '+obj[modules]+')'; liType = 'property'; break; }
            }
            holder.appendChild($A.li(txt, {'className': liType}));
            if (/object/i.test(typeof obj[modules]) && (obj[modules] !== null) && !(obj.getElementsByTagName)) {
                dom.create(selector.query('li:last-of-type', holder), 'ul.tier')
                var tmpObjList = $A.ul(null, {'className': 'tier'}); 
                mapProps(obj[modules],tmpObjList); 
                $A('li', holder, true)[$A('li', holder, true).length-1].appendChild(tmpObjList); 
            }
        });
    }; 

    return exports;
});