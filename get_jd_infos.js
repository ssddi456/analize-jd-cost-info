var fs = require('fs');
var _ = require('underscore');

var data = JSON.parse(fs.readFileSync('./data.json'));
//
// 总数
// 总消费
// 平均
// 最大
// 最小
// 
var bills      = [];
_.each(data,function( bill ) {
  if( !bill.parent ){
    if( bill.subs ){
      bill.total = 0;
      bill.goods = [];
      bill.subs.forEach(function( id, idx ) {
        var sub_bill = data[id];
        bill.total += (1*sub_bill.total);
        if ( !idx  ){
          bill.time = new Date(sub_bill.time);
          bill.stat = sub_bill.stat;
        }
        bill.goods = bill.goods.concat(sub_bill.goods);
      });
    }
    bill.total *= 1;
    bills.push(bill);
  }
});
var bills      =  bills.filter(function(bill) {
                    return bill.total && bill.stat == '已完成';
                  });
var bill_count =  bills.length;
var total      =  bills.reduce(function(pre,bill) {
                    return pre + bill.total;
                  },0);
var average    =  total / bill_count;
var sorted     =  _.sortBy(bills,'total');

var min_total  = sorted[0];
var max_total  = _.last(sorted);

console.log('bill_count : ', bill_count );
console.log('total      : ', total      );
console.log('average    : ', average    );
console.log('min_total  : ', min_total  );
console.log('max_total  : ', max_total  );