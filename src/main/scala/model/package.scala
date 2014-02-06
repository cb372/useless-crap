import org.joda.time.DateTime
import scalikejdbc._,SQLInterpolation._
import skinny.orm.SkinnyCRUDMapper

package object model {

  case class Purchase(id: Int, userId: Long, amount: Double, createdAt: DateTime)

  object Purchase extends SkinnyCRUDMapper[Purchase] {
    override def defaultAlias = createAlias("p")
    override def tableName = "purchases"

    override def extract(rs: WrappedResultSet, n: ResultName[Purchase]) = new Purchase(
      id = rs.int(n.id),
      userId = rs.long(n.userId),
      amount = rs.double(n.amount),
      createdAt = rs.dateTime(n.createdAt)
    )
  }
}

