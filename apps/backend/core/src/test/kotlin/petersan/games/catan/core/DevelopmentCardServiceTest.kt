package petersan.games.catan.core

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import petersan.games.catan.*
import petersan.games.catan.Color.*
import petersan.games.catan.DevelopmentCard.Type.*
import org.assertj.core.api.Assertions.assertThat
import petersan.games.catan.core.action.DiceAction

class DevelopmentCardServiceTest {
    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)

    private val testee = DevelopmentCardService(games, messages)
    private val game = game("0:0").apply {
        moves.last().actions += DiceAction(3,3)
    }

    @BeforeEach
    fun setup() {
        every { games.find(1) } answers { game }
        every { games.save(any()) } answers { it.invocation.args[0] as Game }
    }

    @Test
    fun testBiggestArmyEvaluation(){
        game.player(BLUE).apply {
            cards += DevelopmentCard(KNIGHT, false)
            cards += DevelopmentCard(KNIGHT, false)
            cards += DevelopmentCard(KNIGHT, false)
        }

        testee.useKnight(1, "1", Point(0,0))
        assertThat(game.player(BLUE).biggestArmy).isFalse

        testee.useKnight(1, "1", Point(0,0))
        assertThat(game.player(BLUE).biggestArmy).isFalse

        testee.useKnight(1, "1", Point(0,0))
        assertThat(game.player(BLUE).biggestArmy).isTrue
    }

    @Test
    fun testLongestRoadEvaluation(){
        game.player(BLUE).apply {

            cards += DevelopmentCard(ROADS, false)
            roads.addAll(listOf(
                line("0>0"),
                line("1>0"),
                line("2<0")
            ))
        }

        game.updateAllowedActions()

        assertThat(game.player(BLUE).longestPath).isNull()

        testee.playRoads(1, "1", line("0<0"), line("0>1"))

        assertThat(game.player(BLUE).longestPath).containsExactlyInAnyOrder(
            EdgeKey("0>0"),
            EdgeKey("1>0"),
            EdgeKey("2<0"),
            EdgeKey("0<0"),
            EdgeKey("0>1"),
        )
    }

}