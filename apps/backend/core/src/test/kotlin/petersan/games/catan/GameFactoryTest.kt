package petersan.games.catan.petersan.games.catan

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import petersan.games.catan.GameFactory

internal class GameFactoryTest {

    val testee = GameFactory()
    @Test
    fun testAreaCreation(){
        val game = testee.produce(1, true)
        assertTrue(game.fields.size === 19)
    }
}