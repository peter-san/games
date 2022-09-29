package petersan.games.catan.core

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import petersan.games.catan.*
import petersan.games.catan.Color.*
import petersan.games.catan.core.action.Action

class GamesServiceTest {

    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)

    private val testee = GamesService(games, messages)
    private val game = game("0:0").copy (
        state = Game.State.CREATION,
        players = mapOf(BLUE to Player("1"))
    )

    @Test
    fun `when create game then created with user and in creation`() {
        val slot = slot<Game>()
        every { games.save(capture(slot)) } answers { game("0:0") }

        testee.createGame("1", RED, false)

        assertThat(slot.captured.state).isEqualTo(Game.State.CREATION)
        assertThat(slot.captured.players).isEqualTo(mapOf(
            RED to Player("1").apply { allowedActions += Action.Type.CLOSE_MOVE }))
    }

    @Test
    fun `given no game when join then exception`() {

        every { games.find(1) }.returns(null)

        assertThrows<IllegalArgumentException> { testee.joinGame(1, "2", BLUE) }.apply {
            assertThat(message).isEqualTo("unknown game 1")
        }
    }

    @Test
    fun `given game with blue when blue joins then exception`() {

        every { games.find(1) }.returns(game)

        assertThrows<IllegalStateException> { testee.joinGame(1, "2", BLUE) }.apply {
            assertThat(message).isEqualTo("BLUE exists already")
        }
    }

    @Test
    fun `given game with user 1 when 1 joins then exception`() {

        every { games.find(1) }.returns(game)

        assertThrows<IllegalStateException> { testee.joinGame(1, "1", RED) }.apply {
            assertThat(message).isEqualTo("1 plays already")
        }
    }

    @Test
    fun `given game with when red joins then saved`() {

        every { games.find(1) }.returns(game)
        val slot = slot<Game>()
        every { games.save(capture(slot)) } answers { it.invocation.args[0] as Game }

        val owner = Player("1").apply {
            allowedActions += Action.Type.CLOSE_MOVE
        }

        testee.joinGame(1, "2", RED).also {
            assertThat(it.state).isEqualTo(Game.State.CREATION)
            assertThat(it.players).isEqualTo(mapOf(BLUE to owner, RED to Player("2")))
        }

        assertThat(slot.captured.state).isEqualTo(Game.State.CREATION)
        assertThat(slot.captured.players).isEqualTo(mapOf(BLUE to owner, RED to Player("2")))

    }



}