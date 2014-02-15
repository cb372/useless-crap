package controller

import org.joda.time.DateTime
import twitter4j.{Twitter, TwitterException, TwitterFactory}
import twitter4j.auth.AccessToken
import org.scalatra.Unauthorized
import twitter4j.conf.ConfigurationBuilder
import scalikejdbc.SQLInterpolation._
import model._
import cacheable._
import guava.GuavaCache

object ApiController {
  implicit val cacheConfig = CacheConfig(GuavaCache())

  /*
   Note: env vars must be set.
   Twitter4j accepts "twitter4j.oath.consumerKey", but env vars with a dot are a pain.
   */
  val twitterFactory = new TwitterFactory(new ConfigurationBuilder()
      .setOAuthConsumerKey(sys.env("TWITTER_CONSUMER_KEY"))
      .setOAuthConsumerSecret(sys.env("TWITTER_CONSUMER_KEY_SECRET"))
      .build()
  )

  private def twitterClient(oauthToken: String, oauthTokenSecret: String): Twitter = cacheable {
    twitterFactory.getInstance(new AccessToken(oauthToken, oauthTokenSecret))
  }

}

/**
 * Author: chris
 * Created: 2/2/14
 */
class ApiController extends ApplicationController  {
  import ApiController._

  private val p = Purchase.defaultAlias

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

  def postPurchase = {
    val amount = (parsedBody \ "amount").extract[Double]
    val tags = (parsedBody \ "tags").extract[List[String]].map(_.trim)
    val userId = twitter.getId
    val purchaseId = Purchase.createWithAttributes('userId -> userId, 'amount -> amount, 'createdAt -> DateTime.now)
    for (tag <- tags) {
      val tagId = {
        // Find or create a tag with the given name
        Tag.findByName(tag).map(_.id).getOrElse(Tag.createWithAttributes('name -> tag))
      }
      PurchaseTag.createWithAttributes('purchaseId -> purchaseId, 'tagId -> tagId)
    }
    Purchase.joins(Purchase.tags).findById(purchaseId)
  }

  def listRecentPurchases = {
    val limit = params.getAsOrElse[Int]("limit", 5).max(0)
    Purchase.joins(Purchase.tags).findAllPaging(offset = 0, limit = limit, ordering = sqls"${p.createdAt} desc")
  }

  def userInfo = {
    val userId = twitter.getId
    User.findOrCreateById(userId)
  }

  def userStats = {
    val userId = twitter.getId
    val totalSpent = Purchase.totalSpentByUser(userId)
    val firstPurchase = Purchase.findFirstPurchaseByUser(userId)
    UserStats(totalSpent, firstPurchase.map(_.createdAt), twitter.getScreenName)
  }

  def updateUserSettings = {
    val userId = twitter.getId
    val currency = (parsedBody \ "currency").extract[String]
    User.updateById(userId).withAttributes('currency -> currency)
    User.findById(userId)
  }

}
