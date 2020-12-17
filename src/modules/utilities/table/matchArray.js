export default function matchArray(array, value) {

  var c = 0;

  for (var a = 0; a < array.length; a++) {
      c = (array[a].toString().substr(0, 4) !== "<svg" && array[a].toString().toLowerCase().indexOf(value.toLowerCase()) !== -1) ? c + 1 : c;
  }

  return (c > 0) ? true : false;
}
