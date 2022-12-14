package petersan.games.catan.core

import petersan.games.catan.*
import petersan.games.catan.core.action.*
import petersan.games.catan.core.graph.*
import kotlin.random.Random

abstract class CatanServiceBase(val games: GameRepository, val notifier: Notifier, val random: Random) {

    protected fun find(id: Int): Game = games.find(id) ?: throw IllegalArgumentException("unknown game $id")

    data class GameContext(val game: Game, val color: Color, val move: Move)

    val GameContext.player get() = game.player(color)
    val GameContext.graph get() = GraphConstructor().construct(game)

    protected fun getColor(game: Game, user: String) = game.players.filter { it.value.name == user }.keys.firstOrNull()
        ?: throw java.lang.IllegalArgumentException("user $user isn't player")

    protected fun actionContext(id: Int, user: String, type: Action.Type? = null): GameContext {
        val game = find(id)
        val color = getColor(game, user)
        val move = game.moves.last()
        assert(move.color == color) { "not your move, $user" }

        return GameContext(game, color, move).also {
            type?.isAllowed(it)?.let { exp -> throw exp }
        }
    }


    private val recognizer = VictoryRecognizer()


    protected fun applyAction(game: Game, action: Action): Game {

        game.moves.last().actions.add(action)
        recognizer.updateVictoryPoints(game)?.run {
            game.state = Game.State.CLOSED
            game.moves.last().actions.add(CloseAction(Game.State.CLOSED))
        }

        game.updateAllowedActions()

        return games.save(game).also { notifier.updated(game) }
    }

    protected fun verifiedAction(
        id: Int,
        user: String,
        type: Action.Type,
        action: (context: GameContext) -> Action,
    ): Game = actionContext(id, user, type).let { applyAction(it.game, action(it)) }


    private val MIN_AMOUNT = 5
    protected fun evaluateLongestRoad(players: Map<Color, Player>, graph: Graph){

        val map = players.keys.mapNotNull { graph.longestPath(it)?.run { it to this } ?: null }.toMap()
        val max = map.maxByOrNull { (c,lp)->lp.length } !!
        players.values.forEach { it.longestPath = null }
        if(map.count { (c, lp)-> lp.length == max.value.length } == 1 && max.value.length >= MIN_AMOUNT) {
            players[max.key]!!.longestPath = max.value.edges()
        }
    }

    protected fun secondPhaseAction(
        id: Int,
        user: String,
        checkRolled: Boolean = true,
        action: (context: GameContext) -> Action,
    ): Game {
        val context = actionContext(id, user)
        if (checkRolled) { checkSecondPhaseAllowed(context.move) }
        return applyAction(context.game, action(context))
    }

    protected fun checkSecondPhaseAllowed(move: Move) {
        assert(move.rolled()) { "roll first" }
        move.actions.last().run {
            assert(type != Action.Type.DICE || (this as DiceAction).value != 7) { "robber needs to be moved" }
        }
    }

    fun checkRoadBuildable(edge: Edge, color: Color) {
        fun checkDirection(node: Node): Boolean {
            val nodeCheck = node.content == null || node.content == color
            val edgeCheck = edge.neighbours(node).find { it.content == color } != null
            return nodeCheck && edgeCheck
        }

        require(checkDirection(edge.from) || checkDirection(edge.to)) { "no adjacent road" }
    }
}

