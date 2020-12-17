var currentSort = null

export default function propComparator(prop) {
      var c, d;
      currentSort = (currentSort !== prop) ? prop : null;
      return function Comparator(a, b) {
          c = (typeof a[prop].value === "string" && !isNaN(parseFloat(a[prop].value))) ? parseFloat(a[prop].value.replace(/,/g, '')) : a[prop].value;
          d = (typeof b[prop].value === "string" && !isNaN(parseFloat(b[prop].value))) ? parseFloat(b[prop].value.replace(/,/g, '')) : b[prop].value;
          if (("" + c).substring(0, 5) == "<svg>") {
              if (c < d) return (currentSort !== prop) ? 1 : -1;
              if (c > d) return (currentSort !== prop) ? -1 : 1;
              return 0;
          } else {
          if (c < d) return (currentSort !== prop) ? -1 : 1;
          if (c > d) return (currentSort !== prop) ? 1 : -1;
          return 0;
          }
      }
}