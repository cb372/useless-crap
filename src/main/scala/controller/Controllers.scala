package controller

import skinny._

object Controllers {
  object ng extends NgController with Routes {
    val angularApp = get("/?")(container).as('ngIndex)
  }

  object api extends ApiController with Routes {
    get("/api/purchases/recent")(listRecentPurchases).as('listRecentPurchases)
    post("/api/purchases")(postPurchase).as('postPurchase)
  }
}

