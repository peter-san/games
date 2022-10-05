package petersan.games.web.persistence

import com.amazonaws.services.dynamodbv2.datamodeling.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component
import petersan.games.catan.Game
import petersan.games.catan.GameRepository
import kotlin.random.Random

@Component
class DynamoRepository(val mapper: DynamoDBMapper, val jackson: ObjectMapper) : GameRepository {
    override fun findAll(): List<Game> {

        val result = mapper.scan(GameEntry::class.java, DynamoDBScanExpression())
        return result.map ( this::fromEntry )//.map { it -> it }

    }

    override fun find(id: Int): Game? =

        mapper.query(
            GameEntry::class.java,
            DynamoDBQueryExpression<GameEntry?>().withHashKeyValues(GameEntry(id))).map ( this::fromEntry ).first()


    override fun save(original: Game): Game {

        val game = if(original.id != null) { original } else { original.copy(id= Random.nextInt(1000000)) }

        mapper.save(toEntry(game))
        return find(game.id!!)!!

    }

    override fun delete(game: Game) {
        mapper.delete(GameEntry(game.id))
    }

    fun toEntry(game: Game) = GameEntry(game.id, jackson.writeValueAsString(game))
    fun fromEntry(entry: GameEntry): Game = jackson.readValue( entry.game, Game::class.java)
}



@DynamoDBTable(tableName = "games")
data class GameEntry(
    @get:DynamoDBHashKey(attributeName = "gameId")
    var gameId: Int? = null,

    var game: String? = null
)