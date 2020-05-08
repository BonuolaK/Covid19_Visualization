 function sortBy(arr, prop) {
  return arr.sort((a, b) => a[prop] - b[prop]);
 }

 Array.prototype.sum = function (prop) {
    var total = 0;
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += parseInt(this[i][prop])
    }
    return total
}

  function sortByDesc(arr, prop) {
  return arr.sort((a, b) => b[prop] - a[prop]);
 }

  function sortDate(arr, prop,format) {
  return arr.sort((a, b) => moment(a[prop],format).toDate() - moment(b[prop],format).toDate());
 }

  function sortDateByDesc(arr, prop,format) {
  return arr.sort((a, b) => moment(b[prop],format).toDate() - moment(a[prop],format).toDate());
 }

