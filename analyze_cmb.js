var cvs_loader = require('./cvs_loader');
var data = cvs_loader('./cmb_2014_10_14.cvs');


function normalize_bill_num ( num ) {
  if( !num ){
    return 0;
  }
  if( num.match(/[^\d]/) ){
    num = num.replace(/[^\d]/g,'');
  }
  return 1*num;
}

var atm取款 = data.filter(function( action ) {
  return action.交易备注.match( /atm/i );
}).map(function( action ) {
  return action.支出;
}).reduce(function(pre, 支出) {
  return pre + normalize_bill_num(支出);
},0);

var 网上消费 = data.filter(function( action ) {
  return action.交易类型 == '网上消费' 
    || ( action.交易类型 == '直付通交易' 
      && !action.交易备注.match('基金'));
}).map(function( action ) {
  return action.支出;
}).reduce(function( pre, 支出 ) {
  return pre + normalize_bill_num(支出);
},0);

console.log(data.reduce(function( pre,  action ) {
  pre.总存入 += normalize_bill_num(action.存入);
  pre.总支出 += normalize_bill_num(action.支出);
  pre.净流入 = pre.总存入 - pre.总支出;
  return pre;
},{ 
  总存入 : 0,
  总支出 : 0,
  净流入 : 0
}));

console.log( 'atm取款 : ', atm取款 );
console.log( '网上消费 : ', 网上消费 );