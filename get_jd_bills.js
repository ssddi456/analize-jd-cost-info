var request = require('request');
var async = require('async');
var fs = require('fs');
var util = require('util');
var cheerio = require('cheerio');
var iconvLite = require('iconv-lite');


var conf = JSON.parse(fs.readFileSync('./config.json'));
var list_page = 'http://order.jd.com/center/list.action?d=%s&s=4096&page=%s';

var req = request.defaults({
  headers : conf.headers,
  proxy : 'http://localhost:8888',
  pool : {
    maxSocket : 50
  }
});

function get_gbk_page ( url, done ) {
  var check = req.get(url);
  var buffer = [];
  function once () {
    once = function() {}
    done.apply(null,arguments);
  }
  check.on('data',function( chuck ) {
    buffer.push(chuck);
  });
  check.on('end',function() {
    buffer = Buffer.concat(buffer);
    var page = iconvLite.decode(buffer,'gbk');
    var $ = cheerio.load(page.toString());
    once(null,$);
  });
  check.on('error',function(e) {
    once(e);
  });
}

var bill_info = {};
async.map([2013,2014],function( year, done) {
  var not_last_page = 1;
  var page = 1;
  async.whilst(function() {
    return not_last_page == 1;
  },function( done ) {
    get_gbk_page(util.format(list_page,year,page),function(  err, $ ) {
      not_last_page = 0;
      var table = $('table.tb-void');
      var parents = table.find('tbody[id^=parent-]');
      var bills   = table.find('tbody[id^=tb-]');
      
      // bill
      //  id    : 
      //  total :
      //  time  :
      //  goods :
      //  subs  : bill_id[]
      //  

      [].forEach.call(bills,function( item ){
        var bill = {};
        var $item = $(item);
        var id = bill.id = $item.attr('id').replace('tb-','');
        var parent = $item.attr('class');
        parent && (parent = parent.replace('parent-',''));
        bill.parent = parent;
        var infos  = $item.find('tr[id^=track]');
        infos.find('td').each(function(idx, item ) {
          var text = $(this).text().trim();
          switch(idx){
            case 1 :
              bill.pay_by = text;
              break;
            case 2 :
              var payinfo = text.replace(/[\t\r]/g,'').split('\n');
              bill.total = payinfo[0].replace(/[^\d]/g,'');
              bill.paymethod = payinfo[1];
              break;
            case 3 :
              bill.time = text;
              break;
            case 4 :
              bill.stat = text;
          }
        });
        bill.goods  = [].map.call(infos.find('img'),function( good ) {
          var $good = $(good);
          return {
            name : $good.attr('title'),
            src  : $good.attr('data-lazyload'),
            page : $good.parent().attr('href')
          }
        });
        bill_info[id] = bill;
        parent && (bill_info[parent] || (bill_info[parent] = { subs : []})).subs.push(id);
        not_last_page = 1;
      });
      page += 1;
      done(err);
    });
  },done);
},function( err ) {
  console.log(err);
  console.log(JSON.stringify(bill_info,null,2));
});