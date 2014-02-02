package controller

import model.{PurchaseInfo, Purchase}
import org.joda.time.DateTime

/**
 * Author: chris
 * Created: 2/2/14
 */
class ApiController extends ApplicationController  {

  def postPurchase = {
    val purchase = parsedBody.extract[PurchaseInfo]
    logger.info(s"Saving purchase: " + purchase)
    Purchase.createWithAttributes('userId -> purchase.userId, 'amount -> purchase.amount, 'createdAt -> DateTime.now)
  }

}
