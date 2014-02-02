package controller

import model.Purchase

/**
 * Author: chris
 * Created: 2/2/14
 */
class ApiController extends ApplicationController  {

  def postPurchase = {
    val purchase = parsedBody.extract[Purchase]
    logger.info(s"Saving purchase: " + purchase)
    // TODO save to DB
  }

}
