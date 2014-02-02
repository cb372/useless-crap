import org.joda.time.DateTime
import scalikejdbc._,SQLInterpolation._
import skinny.orm.SkinnyCRUDMapper

package object model {

  // Note: user IDs are strings because JavaScript doesn't have 64 bit ints.
  // Kinda lame, but there you go.
  // At least we store them in the DB as numbers.

  case class PurchaseInfo(userId: String, amount: Double)

  case class Purchase(id: Int, userId: String, amount: Double, createdAt: DateTime)

  object Purchase extends SkinnyCRUDMapper[Purchase] {
    override def defaultAlias = createAlias("p")
    override def tableName = "purchases"

    override def extract(rs: WrappedResultSet, n: ResultName[Purchase]) = new Purchase(
      id = rs.int(n.id),
      userId = rs.long(n.userId).toString,
      amount = rs.double(n.amount),
      createdAt = rs.dateTime(n.createdAt)
    )
  }
}

