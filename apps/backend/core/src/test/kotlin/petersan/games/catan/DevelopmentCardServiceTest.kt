package petersan.games.catan

import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.random.Random
import petersan.games.catan.model.Resource.*
import petersan.games.catan.DevelopmentCard.Type.*
import petersan.games.catan.core.DevelopmentCardService
import petersan.games.catan.core.action.DiceAction
import petersan.games.catan.Color.*
import petersan.games.catan.core.action.CatanValidationException

class DevelopmentCardServiceTest {

    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)
    private val mockedRandom = mockk<Random>()

    private val testee = DevelopmentCardService(games, messages, mockedRandom)
    private val game = game("0:0", "0:1").apply {
        moves.last().actions.add(DiceAction(1, 1))
    }

    @BeforeEach
    fun setup() {
        every { games.find(1) } answers { game }
        every { games.save(any()) } answers { it.invocation.args[0] as Game }
    }

    @Test
    fun testCardPurchasing() {

        every { mockedRandom.nextInt(0, 27) } returns 15

        assertThrows<CatanValidationException> { testee.buyDevelopmentCard(1, "1") }.apply {
            assertThat(message).isEqualTo("not enough resources for CARD")
        }

        game.player(BLUE).resources += mutableMapOf(ORE to 5, WOOL to 5, GRAIN to 5)

        testee.buyDevelopmentCard(1, "1") // on 15th place should be a knight
        assertThat(game.player(BLUE).cards.map(DevelopmentCard::type)).contains(KNIGHT)
        assertThat(game.player(BLUE).resources).isEqualTo(mutableMapOf(ORE to 4, WOOL to 4, GRAIN to 4))

        every { mockedRandom.nextInt(0, 26) } returns 15 // on 15th place should be a monopole
        testee.buyDevelopmentCard(1, "1")
        assertThat(game.player(BLUE).cards.map(DevelopmentCard::type)).contains(KNIGHT, MONOPOLE)
        assertThat(game.player(BLUE).resources).isEqualTo(mutableMapOf(ORE to 3, WOOL to 3, GRAIN to 3))
    }

    @Test
    fun testMonopoleCard() {
        val userGame = Game(
            id = 2,
            state = Game.State.PLAY,
            fields = game.fields,
            players = mapOf(BLUE to Player("1"), ORANGE to Player("2"), RED to Player("3")),
            harbors = emptyList(),
            moves = mutableListOf(Move(1, BLUE).apply { actions += DiceAction(1, 1) })
        )

        every { games.find(2) } answers { userGame }

        userGame.player(BLUE).resources += mutableMapOf(ORE to 5, WOOL to 5)
        userGame.player(ORANGE).resources += mutableMapOf(ORE to 4, WOOL to 12)
        userGame.player(RED).resources += mutableMapOf(ORE to 2, WOOL to 2)

        assertThrows<CatanValidationException> { testee.playMonopole(2, "1", ORE) }.apply {
            assertThat(message).isEqualTo("MONOPOLE needed")
        }


        userGame.player(BLUE).cards += DevelopmentCard(MONOPOLE)

        testee.playMonopole(2, "1", ORE)
        assertThat(userGame.player(BLUE).resources).isEqualTo(mutableMapOf(ORE to 11, WOOL to 5))
        assertThat(userGame.player(ORANGE).resources).isEqualTo(mutableMapOf(ORE to 0, WOOL to 12))
        assertThat(userGame.player(RED).resources).isEqualTo(mutableMapOf(ORE to 0, WOOL to 2))


        userGame.player(BLUE).cards += DevelopmentCard(MONOPOLE)

        testee.playMonopole(2, "1", WOOL)
        assertThat(userGame.player(BLUE).resources).isEqualTo(mutableMapOf(ORE to 11, WOOL to 19))
        assertThat(userGame.player(ORANGE).resources).isEqualTo(mutableMapOf(ORE to 0, WOOL to 0))
        assertThat(userGame.player(RED).resources).isEqualTo(mutableMapOf(ORE to 0, WOOL to 0))
    }

    @Test
    fun testRoadsCard() {

        game.player(BLUE).cards += DevelopmentCard(ROADS)

        assertThrows<IllegalArgumentException> { testee.playRoads(1, "1", line("0>0"), line("1>0")) }.apply {
            assertThat(message).isEqualTo("no adjacent road")
        }

        game.player(BLUE).roads += line("0<0")

        testee.playRoads(1, "1", line("0>0"), line("1>0"))

        assertThat(game.player(BLUE).roads.map(Line::edgeKey)).contains("0<0", "0>0", "1>0")
    }
}