export default function matchArray(array, value) {
  return (array.toString().toLowerCase().includes(value.toLowerCase())) ? true : false ;
}
