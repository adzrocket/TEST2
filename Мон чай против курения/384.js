

function mleadsLinkReplacing() {
 var mleads_sess = (location.href.match(/mleads=([a-z0-9A-Z]{16,64})/) || {1:''})[1];
 var mleads_code = (location.href.match(/code=([a-z0-9A-Z]{4,16})/) || {1:''})[1];
flow_url = 'http://c.cpam.pro/T'+mleads_code;
 if(mleads_sess !== '' && mleads_code !== '') {
  var elems = document.getElementsByTagName('a');
  for(var i=0; i<elems.length; i++) {
    elems[i].removeAttribute('target');
    elems[i].href='http://c.cpam.pro/T'+mleads_code+'?mleads='+mleads_sess;
  }
 }
}
mleadsLinkReplacing();
window.onload = function() {
 mleadsLinkReplacing();
};