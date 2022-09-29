package petersan.games.catan

import petersan.games.catan.core.action.*
import petersan.games.catan.model.*
import petersan.games.catan.core.action.Action.Type.*
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

    protected fun applyAction(game: Game, action: Action):Game {

        return games.save(
            game.apply {
                game.moves.last().actions.add(action)
                game.updateAllowedActions()
            })
            .also {
                notifier.updated(game)
            }
    }

    protected fun verifiedAction(
        id: Int,
        user: String,
        type: Action.Type,
        action: (context: GameContext) -> Action,
    ): Game = actionContext(id, user, type).let { applyAction(it.game, action(it)) }


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

class CatanService(
    games: GameRepository,
    template: Notifier,
    random: Random = Random.Default,
) : CatanServiceBase(games, template, random) {

    @Deprecated("use GamesService")
    fun all() = games.findAll().toList()

    fun game(id: Int): Game = find(id).also { println("fetched catan game: $id") }

    @Deprecated("use GamesService")
    fun create(providedId: Int?, standard: Boolean, players: Map<Color, String>): Game {
        val game = games.save(GameFactory().produce(providedId, standard, players))
        notifier.updated(game)
        return game
    }

    fun roll(id: Int, user: String): Game {
        val ctx = actionContext(id, user, Action.Type.DICE)

        val first = random.nextInt(1, 7)
        val second = random.nextInt(1, 7)
        val sum = first + second

        if (sum != 7) {
            fun updateResources(game: Game, dice: Int) {
                val graph = GraphConstructor().construct(game)

                game.fields
                    .filter { it.value == dice && !it.robber }
                    .map { it.resource!! to it.nodes() }
                    .forEach { (resource, ps) ->
                        run {
                            for (point in ps) {
                                graph.nodes[point.nodeKey()]?.also {
                                    it.content?.run {
                                        game.player(this).resources.add(resource, if (it.city) 2 else 1)
                                    }
                                }
                            }
                        }
                    }
            }

            updateResources(ctx.game, sum)
        } else {
            for ((c, p) in ctx.game.players) {
                if (p.resources.values.sum() > 7) {
                    removeRandomHalf(p.resources)
                }
            }
        }

        println("${ctx.color} rolled $first and $second")
        return applyAction(ctx.game, DiceAction(first, second))
    }


    fun closeMove(id: Int, user: String): Game {
        val (game, color, move) = actionContext(id, user, CLOSE_MOVE)

        var stateSwitch = false
        if (game.state == Game.State.INIT
            && game.players.values.all { it.towns.size == 2 && it.roads.size == 2 }) {

            game.state = Game.State.PLAY
            stateSwitch = true
            println("let's play")
            move.actions.add(CloseAction(Game.State.PLAY))
        } else if(game.state == Game.State.CREATION){

            val defaultSetup = (move.actions.find { it is CreateAction } as CreateAction).default

            if(defaultSetup){
                GameFactory().applyInitialization(game)
                game.state = Game.State.PLAY
                move.actions.add(CloseAction(Game.State.PLAY))
            }else {
                game.state = Game.State.INIT
                move.actions.add(CloseAction(Game.State.INIT))
            }

            stateSwitch = true
        } else {
            move.actions.add(CloseAction())
        }

        return games.save(game.apply {
            moves.add(Move(move.id + 1, if(stateSwitch) color else nextColor(game, color)))
            updateAllowedActions()
            println("$color closed move, next ${nextColor(game, color)}")
        }).also {
            notifier.updated(it)
        }

    }

    fun nextColor(game: Game, current: Color): Color {

        val reversed = game.state == Game.State.INIT && game.players.values.all { it.roads.size >= 1 }
        val colors = game.players.keys.toList()
        var toReturn: Color? = null
        //val index = colors.indexOf(current)

        colors.forEachIndexed { index, element ->
            if (element == current) {
                toReturn = if (reversed) {
                    if (index == colors.size - 1 && game.players[element]!!.roads.size == 1)
                        current
                    else
                        colors[index - 1]
                } else {
                    if (index == colors.size - 1) colors.first() else colors[index + 1]
                }
            }
        }
        return toReturn!!
    }

    fun moveRobber(id: Int, position: Point, user: String): Game {
        val ctx = actionContext(id, user, MOVE_ROBBER)

        Action.Type.MOVE_ROBBER.isAllowed(ctx)?.let { throw it }

        ctx.move.actions.last().run {
            assert(type == Action.Type.DICE) { "last action wasn't dice" }
            assert((this as DiceAction).value == 7) { "7 wasn't rolled" }
        }

        ctx.game.fields.forEach { it.robber = it.x == position.x && it.y == position.y }
        println("${ctx.color} moved robber to $position")

        return applyAction(ctx.game, RobberMovedAction(position))
    }

    fun removeRandomHalf(resources: Resources) {
        resources
            .map { (k, e) -> List(e) { k } }
            .flatten().shuffled()
            .take(resources.values.sum() / 2)
            .forEach { resources.add(it, -1) }
    }

    private fun Area.nodes(): List<Point> {
        val points = mutableListOf<Point>();
        for (i in 0..1) {
            for (j in 0..2) {
                points.add(Point(x + j, y + i))
            }
        }
        return points
    }
}

