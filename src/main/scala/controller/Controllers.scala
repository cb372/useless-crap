package controller

import skinny._

object Controllers {
  object ng extends NgController with Routes {
    val ngIndexUrl = get("/ng/")(container).as('ngIndex)
    val rootIndexUrl = get("/?")(redirect301("/ng/")).as('rootIndex)
  }

}

