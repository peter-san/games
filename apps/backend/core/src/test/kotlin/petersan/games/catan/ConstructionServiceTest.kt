package petersan.games.catan

import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import petersan.games.catan.core.action.DiceAction
import petersan.games.catan.model.Resource
import petersan.games.catan.model.Resource.*
import kotlin.random.Random
import petersan.games.catan.Color.*
import petersan.games.catan.core.ConstructionService
import petersan.games.catan.core.action.CatanValidationException

internal class ConstructionServiceTest {

    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)
    private val mockedRandom = mockk<Random>()

    private val testee = ConstructionService(games, messages, mockedRandom)
    private val game = game("0:0").apply {
        moves.last().actions.add(DiceAction(1,1))
        updateAllowedActions()
    }

    @BeforeEach
    fun setup() {
        every { games.find(1) } answers { game }
        every { games.save(any()) } answers { it.invocation.args[0] as Game }
    }

    @Test
    fun `given not enough resources when purchase road then error`() {
        val exception = assertThrows<CatanValidationException> {
            testee.addRoad(1, line("0>0"), "1")
        }
        assertThat(exception.message).isEqualTo("not enough resources for ROAD")
    }

    @Test
    fun `given bought road when purchase road then error`() {
        game.player(BLUE).resources += Construction.ROAD.price
        game.players[ORANGE]!!.roads += line("0>0")

        val exception = assertThrows<IllegalArgumentException> {
            testee.addRoad(1, line("0>0"), "1")
        }
        assertThat(exception.message).isEqualTo("road at 0>0 already bought")
    }

    @Test
    fun `given adjacent foreign town when purchase road then error`() {
        game.player(BLUE).resources += Construction.ROAD.price
        game.player(BLUE).roads += line("0<0")
        game.players[ORANGE]!!.towns += point("0:0")

        val exception = assertThrows<IllegalArgumentException> {
            testee.addRoad(1, line("0>0"), "1")
        }
        assertThat(exception.message).isEqualTo("no adjacent road")
    }

    @Test
    fun `given no adjacent town when purchase road then error`() {
        game.player(BLUE).resources += Construction.ROAD.price

        val exception = assertThrows<IllegalArgumentException> {
            testee.addRoad(1, line("0>0"), "1")
        }
        assertThat(exception.message).isEqualTo("no adjacent road")
    }

    @Test
    fun `given road when purchase adjacent road then bought`() {
        game.player(BLUE).resources += Construction.ROAD.price
        game.player(BLUE).roads += line("0<0")


        testee.addRoad(1, line("0>0"), "1")

        assertThat(game.player(BLUE).roads).contains(line("0>0"))
    }

    @Test
    fun `given no roads when purchase town then error`() {
        game.player(BLUE).resources += Construction.TOWN.price

        val exception = assertThrows<IllegalArgumentException> {
            testee.buyTown(1, point("1:0"), "1")
        }
        assertThat(exception.message).isEqualTo("no adjacent road")
    }

    @Test
    fun `given town next to position when purchase town then error`() {
        game.player(BLUE).resources += Construction.TOWN.price
        game.player(BLUE).roads += line("0>0")
        game.players[ORANGE]!!.towns += point("0:0")

        val exception = assertThrows<IllegalArgumentException> {
            testee.buyTown(1, point("1:0"), "1")
        }
        assertThat(exception.message).isEqualTo("neighbour is too close")

    }

    @Test
    fun `given road when purchase adjacent town then error`() {
        game.player(BLUE).resources += Construction.TOWN.price
        game.player(BLUE).roads += line("0>0")

        testee.buyTown(1, point("1:0"), "1")

        assertThat(game.player(BLUE).towns).contains(point("1:0"))
    }


    @Test
    fun `given town when purchase city then bought`() {
        game.player(BLUE).resources += Construction.CITY.price
        game.player(BLUE).towns += point("0:0")

        testee.buyCity(1, point("0:0"), "1")

        assertThat(game.player(BLUE).towns).doesNotContain(point("0:0"))
        assertThat(game.player(BLUE).cities).contains(point("0:0"))
    }



}