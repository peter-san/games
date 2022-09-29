package petersan.games.catan.core

import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import petersan.games.catan.*
import petersan.games.catan.Color.*
import petersan.games.catan.core.action.Action
import petersan.games.catan.core.action.DiceAction
import petersan.games.catan.model.Resource.*

class MarketServiceTest {
    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)

    private val testee = MarketService(games, messages)
    private val game = game("0:0").copy (
        state = Game.State.PLAY,
        harbors = listOf(
            Harbor(line("0>0"), BRICK),
            Harbor(line("2<0")),
            Harbor(line("0>1"), LUMBER)
        ),
        moves =  mutableListOf(Move(1, BLUE, mutableListOf(DiceAction(1,1)))),
        players = mapOf(BLUE to Player("1").apply {
            towns += point("0:0")
            towns += point("2:1")
            cities += point("0:1")
        }))

    @BeforeEach
    fun setup() {
        every { games.find(1) } answers { game }
        every { games.save(any()) } answers { it.invocation.args[0] as Game }
    }

    @Test
    fun `check allowed actions for market`(){
        game.moves.add(Move(2,BLUE, mutableListOf()))
        game.updateAllowedActions()

        assertThat(game.player(BLUE).allowedActions).doesNotContain(Action.Type.MARKET)

        game.moves.last().actions += DiceAction(1,1)
        game.updateAllowedActions()

        assertThat(game.player(BLUE).allowedActions).doesNotContain(Action.Type.MARKET)

        game.player(BLUE).resources[BRICK] = 2
        game.updateAllowedActions()

        assertThat(game.player(BLUE).allowedActions).contains(Action.Type.MARKET)
    }

    @Test
    fun `given towns on harbors when market action then prices checked`(){
        val result = game.marketPrices(BLUE)
        game.player(BLUE).resources[BRICK] = 3
        game.updateAllowedActions()

        testee.market(1, mutableMapOf(BRICK to -2, ORE to 1), "1")

        assertThat(game.player(BLUE).resources).containsExactly(entry(BRICK, 1), entry(ORE, 1))
    }

}