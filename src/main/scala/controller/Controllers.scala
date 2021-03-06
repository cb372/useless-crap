package controller

import skinny._

object Controllers {
  object ng extends NgController with Routes {
    val angularApp = get("/?")(container).as('ngIndex)
  }

  object api extends ApiController with Routes {
    get("/api/user")(userInfo).as('userInfo)
    post("/api/user")(updateUserSettings).as('userInfo)

    get("/api/user/stats")(userStats).as('userStats)

    get("/api/purchases/recent")(listRecentPurchases).as('listRecentPurchases)
    post("/api/purchases")(postPurchase).as('postPurchase)
  }
}

