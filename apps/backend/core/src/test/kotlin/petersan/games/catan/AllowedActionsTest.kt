package petersan.games.catan

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import kotlin.random.Random
import org.assertj.core.api.Assertions.assertThat
import petersan.games.catan.core.action.Action.Type.*
import petersan.games.catan.model.Resource.*
import petersan.games.catan.Color.*
import petersan.games.catan.core.CatanService


class AllowedActionsTest {
    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)
    private val mockedRandom = mockk<Random>()

    private val testee = CatanService(games, messages, mockedRandom)
    private val game = game("0:0")

    @BeforeEach
    fun setup() {
        every { games.find(1) } answers { game }
        every { mockedRandom.nextInt(1, 7) } returns 1 andThen 1
        every {games.save(any())} answers {it.invocation.args[0] as Game}
    }

    @Test
     fun `given game in play then dice allowed`(){

        assertThat(game.player(BLUE).allowedActions).contains(DICE)
        assertThat(game.player(ORANGE).allowedActions).doesNotContain(DICE)

        testee.roll(1, "1")

        assertThat(game.player(BLUE).allowedActions).doesNotContain(DICE)
        assertThat(game.player(ORANGE).allowedActions).doesNotContain(DICE)

        testee.closeMove(1, "1")

        assertThat(game.player(BLUE).allowedActions).doesNotContain(DICE)
        assertThat(game.player(ORANGE).allowedActions).contains(DICE)
    }

    @Test
    fun `given game in play when roll 7 then only move robber is allowed`(){
        every { mockedRandom.nextInt(1, 7) } returns 3 andThen 4
        testee.roll(1, "1")

        assertThat(game.player(BLUE).allowedActions).containsOnly(MOVE_ROBBER)
    }

    @Test
    fun `given game in play when diced close is available`(){

        assertThat(game.player(BLUE).allowedActions).doesNotContain(CLOSE_MOVE)
        every { mockedRandom.nextInt(1, 7) } returns 1 andThen 4
        testee.roll(1, "1")

        assertThat(game.player(BLUE).allowedActions).contains(CLOSE_MOVE)
    }

    @Test
    fun `given game in play when diced 7 and robbed close is available`(){

        assertThat(game.player(BLUE).allowedActions).doesNotContain(CLOSE_MOVE)
        every { mockedRandom.nextInt(1, 7) } returns 3 andThen 4
        testee.roll(1, "1")

        assertThat(game.player(BLUE).allowedActions).doesNotContain(CLOSE_MOVE)

        testee.moveRobber(1, point("1:1"), "1")

        assertThat(game.player(BLUE).allowedActions).contains(CLOSE_MOVE)
    }


    @Test
    fun `given diced move when enough resources then buy card available`(){

        assertThat(game.player(BLUE).allowedActions).doesNotContain(BUY_CARD)

        every { mockedRandom.nextInt(1, 7) } returns 1 andThen 4

        testee.roll(1, "1")

        assertThat(game.player(BLUE).allowedActions).doesNotContain(BUY_CARD)


        game.player(BLUE).resources += mutableMapOf(ORE to 1, WOOL to  1, GRAIN to 1 )
        game.updateAllowedActions()

        assertThat(game.player(BLUE).allowedActions).contains(BUY_CARD)
    }

    @Test
    fun `given game in init when buy town then allowed buy road`(){
        game.state = Game.State.INIT

        //FIXME

    }



}