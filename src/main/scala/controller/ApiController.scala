package controller

import model._
import org.joda.time.DateTime
import twitter4j.{Twitter, TwitterException, TwitterFactory}
import twitter4j.auth.AccessToken
import org.scalatra.Unauthorized
import twitter4j.conf.ConfigurationBuilder

object ApiController {

  /*
   Note: env vars must be set.
   Twitter4j accepts "twitter4j.oath.consumerKey", but env vars with a dot are a pain.
   */
  val twitterFactory = new TwitterFactory(new ConfigurationBuilder()
      .setOAuthConsumerKey(sys.env("TWITTER_CONSUMER_KEY"))
      .setOAuthConsumerSecret(sys.env("TWITTER_CONSUMER_KEY_SECRET"))
      .build()
  )

  private def twitterClient(oauthToken: String, oauthTokenSecret: String) =
    twitterFactory.getInstance(new AccessToken(oauthToken, oauthTokenSecret))

}

/**
 * Author: chris
 * Created: 2/2/14
 */
class ApiController extends ApplicationController  {
  import ApiController._

  beforeAction() {
    for {
      oauthToken <- request.header("oauth_token")
      oauthTokenSecret <- request.header("oauth_token_secret")
      twitter = twitterClient(oauthToken, oauthTokenSecret)
    } {
      try {
        twitter.getId
        request.setAttribute("twitter", twitter)
      } catch {
        // Failed to authenticate with the given token
        case _: TwitterException => halt(Unauthorized())
      }
    }

    if (!request.get("twitter").isDefined) {
      halt(Unauthorized())
    }
  }

  private def twitter = request.getAs[Twitter]("twitter").get

  //case class PurchaseInfo(amount: Double)

  def postPurchase = {
    val amount = (parsedBody \ "amount").extract[Double]
    val userId = twitter.getId
    val id = Purchase.createWithAttributes('userId -> userId, 'amount -> amount, 'createdAt -> DateTime.now)
    Purchase.findById(id)
  }

}
