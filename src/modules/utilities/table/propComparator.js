var currentSort = null

export default function propComparator(prop) {
      var c, d;
      currentSort = (currentSort !== prop) ? prop : null;
      return function Comparator(a, b) {
          c = (typeof a[prop].sort === "string" && !isNaN(parseFloat(a[prop].sort))) ? parseFloat(a[prop].sort.replace(/,/g, '')) : a[prop].sort;
          d = (typeof b[prop].sort === "string" && !isNaN(parseFloat(b[prop].sort))) ? parseFloat(b[prop].sort.replace(/,/g, '')) : b[prop].sort;
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