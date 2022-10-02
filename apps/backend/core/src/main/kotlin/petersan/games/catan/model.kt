package petersan.games.catan

import com.fasterxml.jackson.annotation.JsonValue
import petersan.games.catan.core.CatanServiceBase
import petersan.games.catan.model.Resource.*
import petersan.games.catan.core.action.Action
import petersan.games.catan.model.Resource
import petersan.games.catan.model.Resources
import petersan.games.catan.core.action.isAllowed
import kotlin.math.min

data class Game(
    val id: Int?,
    var state: State = State.INIT,
    val fields: List<Area>,
    val players: Map<Color, Player>,
    val harbors: List<Harbor>,
    val moves: MutableList<Move> = mutableListOf(),
) {
    init {
        updateAllowedActions()
    }

    fun updateAllowedActions() {

        players.forEach{ (color, player) ->
            val ctx = CatanServiceBase.GameContext(this, color, moves.last())
            player.allowedActions = Action.Type.values().filter { type -> type.isAllowed(ctx) == null }
        }
    }

    enum class State(@JsonValue val value: String) {
        CREATION("creation"), INIT("init"), PLAY("play"), CLOSED("closed")
    }
}

fun Game.player(color: Color) = players[color]!!

fun Game.marketPrices(color: Color): Resources {
    val player = player(color)
    val map = values().associateWith { 4 }.toMutableMap()

    harbors.forEach {
        if(player.towns.contains(it.line.to) || player.towns.contains(it.line.from)
            || player.cities.contains(it.line.to) || player.cities.contains(it.line.from)){

            if(it.resource == null) {
                Resource.values().forEach { res -> map.merge(res, 3) {old, new -> min(old,new) }}
            }else {
                map.merge(it.resource, 2) {old, new -> min(old,new) }
            }
        }
    }

    return map
}

data class Move(
    val id: Int,
    val color: Color,
    val actions: MutableList<Action> = mutableListOf(),
) {
    fun rolled() = actions.any { it.type == Action.Type.DICE }
}


enum class Color(@JsonValue val value: String) {
    ORANGE("orange"),
    BLUE("blue"),
    MAGENTA("magenta"),
    RED("red")
}

data class Area(
    val x: Int,
    val y: Int,
    val resource: Resource?,
    val value: Int,
    var robber: Boolean = false,
) {
}

data class Point(val x: Int, val y: Int) {
    fun nodeKey() = "$x:$y"
}

@JvmInline
value class NodeKey(private val value: String){

    companion object {
        val KEY_REGEX = """(\d+):(\d+)""".toRegex()
    }

    private fun destruct() = KEY_REGEX.find(value)!!.destructured

    constructor(x: Int, y: Int): this("$x:$y")
    init {
        require(KEY_REGEX.find(value) != null) {"key $value doesn't match"}
    }

    fun toNode() = destruct().let {Point(it.component1().toInt(), it.component2().toInt())}
}

@JvmInline
value class EdgeKey(private val value: String){
    companion object {
        val KEY_REGEX = """(\d+)([><])(\d+)""".toRegex()
    }

    init {
        require(KEY_REGEX.find(value) != null) {"key $value doesn't match"}
    }

    private fun destruct() = KEY_REGEX.find(value)!!.destructured

    val from: NodeKey get() {
        val (f, s, t) = destruct()
        return NodeKey(f.toInt(),t.toInt())
    }

    val to: NodeKey get() {
        val (f, s, t) = destruct()
        val x = f.toInt()
        val y = t.toInt()
        return if (s == ">") NodeKey(x + 1, y) else NodeKey(x, y + 1)
    }

    fun toLine() = Line(from.toNode(), to.toNode())
}

@Deprecated(replaceWith = ReplaceWith( "EdgeKey"), message = "outdated")
data class Line(val from: Point, val to: Point) {

    fun edgeKey() = "${from.x}${if (from.x == to.x) "<" else ">"}${from.y}"
}

data class Harbor(val line: Line, val resource: Resource? = null)

data class Player(
    val name: String,
    val resources: Resources = mutableMapOf(),
    val towns: MutableList<Point> = mutableListOf(),
    val cities: MutableList<Point> = mutableListOf(),
    val roads: MutableList<Line> = mutableListOf(),
    val cards: MutableList<DevelopmentCard> = mutableListOf(),
    var allowedActions: List<Action.Type> = emptyList(),
    //var points: Int = 0,
    var biggestArmy: Boolean = false,
    var longestPath: List<EdgeKey>? = null
)

data class DevelopmentCard(val type: Type, var played: Boolean = false) {
    enum class Type(@JsonValue val value: String, val amount: Int) {
        KNIGHT("knight", 16),
        MONOPOLE("monopole", 2),
        ROADS("roads", 2),
        INVENTION("invention", 2),
        VICTORY("victory", 5)
    }
}

enum class Construction(val price: Resources, val maxAmount: Int, val getter: (p: Player) -> MutableList<*>) {
    TOWN(mutableMapOf(LUMBER to 1, BRICK to 1, WOOL to 1, GRAIN to 1), 5, Player::towns),
    CITY(mutableMapOf(GRAIN to 2, ORE to 3), 4, Player::cities),
    ROAD(mutableMapOf(LUMBER to 1, BRICK to 1), 15, Player::roads),
    CARD(mutableMapOf(ORE to 1, WOOL to 1, GRAIN to 1), 27, Player::cards)
}

