package petersan.games.catan.model

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.junit.jupiter.api.Test
import petersan.games.catan.*
import petersan.games.catan.core.action.DiceAction
import petersan.games.catan.Color.*


class PersistenceTest {
    private val game = game("0:0")

    private val mapper = ObjectMapper()
        .findAndRegisterModules()

    @Test
    fun testSerialization(){
        val userGame = Game(
            id = 2,
            fields = game.fields,
            players = mapOf(BLUE to Player("1"), ORANGE to Player("2"), RED to Player("3")),
            harbors = emptyList(),
            moves = mutableListOf(Move(1, BLUE).apply {
                actions += DiceAction(1,1)
            })
        ).apply {
            player(BLUE).longestPath = listOf(EdgeKey("0>0"))
        }

        val serialized = mapper.writeValueAsString(userGame)

        println(serialized)

        val deserialized = mapper.readValue(serialized, Game::class.java)

        val i=0;

    }
}