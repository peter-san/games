package petersan.games.catan

import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import petersan.games.catan.core.action.DiceAction
import petersan.games.catan.model.Resource
import kotlin.random.Random

class CatanServiceTest {

    private val games = mockk<GameRepository>()
    private val messages = mockk<Notifier>(relaxed = true)
    private val mockedRandom = mockk<Random>()

    private val testee = CatanService(games, messages, mockedRandom)
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
    fun testPlayerOrder(){
        val userGame = Game(
            id = 1,
            fields = game.fields,
            players = mapOf(Color.BLUE to Player("1"), Color.ORANGE to Player("2"), Color.RED to Player("3")),
            harbors = emptyList(),
            moves = mutableListOf(Move(1, Color.BLUE))
        )

        assertThat(userGame.players.keys.toList()).containsExactly(Color.BLUE, Color.ORANGE, Color.RED)

        userGame.state = Game.State.PLAY

        assertThat(testee.nextColor(userGame, Color.BLUE)).isEqualTo(Color.ORANGE)
        assertThat(testee.nextColor(userGame, Color.ORANGE)).isEqualTo(Color.RED)
        assertThat(testee.nextColor(userGame, Color.RED)).isEqualTo(Color.BLUE)

        userGame.state = Game.State.INIT

        assertThat(testee.nextColor(userGame, Color.BLUE)).isEqualTo(Color.ORANGE)
        assertThat(testee.nextColor(userGame, Color.ORANGE)).isEqualTo(Color.RED)
        assertThat(testee.nextColor(userGame, Color.RED)).isEqualTo(Color.BLUE)

        // every user has a road
        userGame.player(Color.BLUE).roads += line("0>0")
        userGame.players[Color.ORANGE]!!.roads += line("0>0")
        userGame.players[Color.RED]!!.roads += line("0>0")

        assertThat(testee.nextColor(userGame, Color.RED)).isEqualTo(Color.RED)

        userGame.players[Color.RED]!!.roads += line("0>1")

        assertThat(testee.nextColor(userGame, Color.RED)).isEqualTo(Color.ORANGE)

        assertThat(testee.nextColor(userGame, Color.ORANGE)).isEqualTo(Color.BLUE)
    }

    @Test
    fun testCuttingResources(){

        fun cuttedAmount(vararg res: Pair<Resource, Int>): Int{
            val resources = res.asSequence().toMap().toMutableMap()
            testee.removeRandomHalf(resources)
            return resources.values.sum()
        }

        assertThat(cuttedAmount(Resource.LUMBER to 5, Resource.ORE to 2)).isEqualTo(4)
        assertThat(cuttedAmount(Resource.LUMBER to 5, Resource.ORE to 1)).isEqualTo(3)
        assertThat(cuttedAmount(Resource.LUMBER to 1)).isEqualTo(1)

    }

    @Test
    fun testSevenDiced(){
        every { mockedRandom.nextInt(1, 7) } returns 2 andThen 5
        game.moves.last().actions.clear()

        game.player(Color.BLUE).resources.putAll(mutableMapOf(Resource.LUMBER to 5, Resource.ORE to 4, Resource.WOOL to 12))
        game.players[Color.ORANGE]!!.resources.putAll(mutableMapOf(Resource.LUMBER to 5))

        testee.roll(1, "1")

        assertThat(game.player(Color.BLUE).resources.values.sum()).isEqualTo(11)
        assertThat(game.players[Color.ORANGE]!!.resources.values.sum()).isEqualTo(5)
    }
}