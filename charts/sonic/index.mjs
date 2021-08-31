
import sonification from "./sonification"

export default class sonic {

  constructor() {

    this.isInitiated = false

  }

  ification(sonicData, x, y, keyOrder, margin, domain, svg) {

    if (!this.isInitiated) {

      this.isInitiated = true

      sonification.init(sonicData, x, y, keyOrder, margin, domain, svg)

    } else {

      sonification.update(x, y)

    }

  }

}