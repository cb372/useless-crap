import org.joda.time.DateTime
import scalikejdbc._,SQLInterpolation._
import skinny.orm.{SkinnyJoinTable, SkinnyCRUDMapper}

package object model {

  case class Purchase(id: Int, userId: Long, amount: Double, createdAt: DateTime, tags: Seq[Tag] = Nil)
  case class Tag(id: Int, name: String)
  case class PurchaseTag(purchaseId: Int, tagId: Int)
  case class UserStats(totalSpent: Double, since: Option[DateTime])

  object Purchase extends SkinnyCRUDMapper[Purchase] {
    val tags = hasManyThrough[Tag](PurchaseTag, Tag, (purchase, ts) => purchase.copy(tags = ts))

    override def defaultAlias = createAlias("p")
    override def tableName = "purchases"

    override def extract(rs: WrappedResultSet, n: ResultName[Purchase]) = new Purchase(
      id = rs.int(n.id),
      userId = rs.long(n.userId),
      amount = rs.double(n.amount),
      createdAt = rs.dateTime(n.createdAt)
    )

    def totalSpentByUser(userId: Long): Double = {
      where(SQLSyntax.eq(defaultAlias.userId, userId)).sum('amount).toDouble
    }

    def findFirstPurchaseByUser(userId: Long): Option[Purchase] = {
      findAllByPaging(
        where = SQLSyntax.eq(defaultAlias.userId, userId),
        limit = 1,
        ordering = sqls"${defaultAlias.createdAt} asc")
        .headOption
    }
  }

  object Tag extends SkinnyCRUDMapper[Tag] {
    override def defaultAlias = createAlias("t")
    override def tableName = "tags"

    override def extract(rs: WrappedResultSet, n: ResultName[Tag]) = new Tag(rs.int(n.id), rs.string(n.name))

    def findByName(name: String): Option[Tag] = findBy(SQLSyntax.eq(sqls"name", name))
  }

  object PurchaseTag extends SkinnyJoinTable[PurchaseTag] {
    override def defaultAlias = createAlias("pt")
    override def tableName = "purchases_tags"
  }
}

