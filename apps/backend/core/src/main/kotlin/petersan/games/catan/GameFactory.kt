package petersan.games.catan

import petersan.games.catan.model.Resource.*
import petersan.games.catan.*
import petersan.games.catan.model.Resource
import petersan.games.catan.model.add
import petersan.games.catan.Color.*

class GameFactory {
    fun produce(
        id: Int?,
        standard: Boolean = false,
        playerMap: Map<Color, String> = mapOf(RED to "1", ORANGE to "2")): Game {
        return Game(id, state = Game.State.INIT, createAreas(standard),
            playerMap.mapValues{Player(it.value)},
            harbors = harbors(standard).map { Harbor(it.key.toLine(), it.value) },
            moves = mutableListOf(Move(1, playerMap.keys.first()))
        ).apply {
            updateAllowedActions()
        }
    }


    fun applyInitialization(game: Game) {
        game.apply {
            players.map { (color, player) -> initPlayer(color, player, fields) }
            state = Game.State.PLAY
            updateAllowedActions()
        }
    }

    private fun initPlayer(color: Color, player: Player, areas: List<Area>) {
        val set = STANDARD_INIT[color]!!
        player.towns.add(set.first.first.toNode())
        player.towns.add(set.second.first.toNode())
        player.roads.add(set.first.second.toLine())
        player.roads.add(set.second.second.toLine())

        fun NodeKey.surroundingAreaKeys(): List<Pair<Int, Int>> {
            val (x, y) = toNode()

            return if ((x % 2 == 0 && y % 2 == 0) || (x % 2 == 1 && y % 2 == 1)) {
                listOf(x to y, x - 2 to y, x - 1 to y - 1)
            } else {
                listOf(x - 2 to y - 1, x to y - 1, x - 1 to y)
            }
        }

        set.second.first.surroundingAreaKeys().forEach {
            areas.find { area -> area.x == it.first && area.y == it.second }?.resource?.let {
                player.resources.add(it, 1)
            }
        }
    }

    private fun harbors(standard: Boolean): Map<EdgeKey, Resource?> {
        if(standard) return HARBORS
        val resources = HARBORS.values.toList().shuffled()
        return HARBORS.keys.mapIndexed {ind, key -> key to resources[ind]}.toMap()
    }

    enum class Direction(val dX: Int, val dY: Int) {
        RIGHT(2,0), D_RIGHT(1,1), D_LEFT(-1,1), LEFT(-2,0), U_LEFT(-1,-1), U_RIGHT(1,-1);
        fun successor() = values()[(ordinal + 1) % values().size]
    }

    data class Initialization(val first: Pair<NodeKey, EdgeKey>, val second: Pair<NodeKey, EdgeKey>)

    companion object {

        private fun set(town: String, edge: String) = NodeKey(town) to EdgeKey(edge)

        val STANDARD_INIT = mapOf(
            RED to Initialization(set("4:1", "4>1"), set("2:3", "2>3")),
            ORANGE to Initialization(set("7:1", "6>1"), set("5:4", "5>4")),
            BLUE to Initialization(set("3:4", "3>4"), set("7:4", "7<3")),
            MAGENTA to Initialization(set("3:2", "2>2"), set("8:3", "8<2")),
        )


        val HARBORS = mapOf(
            "2>0" to null,
            "5>0" to GRAIN,
            "8>1" to ORE,
            "10<2" to null,
            "8>4" to WOOL,
            "5>5" to null,
            "2>5" to null,
            "1<3" to BRICK,
            "1<1" to LUMBER
        ).mapKeys { EdgeKey(it.key) }

        val VALUES: IntArray = intArrayOf(
            10, 2, 9,
            12, 6, 4, 10,
            9, 11, 3, 8,
            8, 3, 4, 5,
            5, 6, 11
        )

        val AREA_LINES: Array<IntRange> = arrayOf(
            2..6,
            1..7,
            0..8,
            1..7,
            2..6)

        val FIELDS: Array<Resource?> = arrayOf(
            ORE, WOOL, LUMBER,
            GRAIN, BRICK, WOOL, BRICK,
            GRAIN, LUMBER, null, LUMBER, ORE,
            LUMBER, ORE, GRAIN, WOOL,
            BRICK, GRAIN, WOOL
        )

        val N_VALUES: IntArray = intArrayOf(10, 2, 9,10, 8, 5, 11,6,5,8,9,12,6,4,3,4,3,11)
    }

    private fun createAreas(standard: Boolean): List<Area> {
        val areas = mutableListOf<Area>()
        var k = 0
        var desertOffset = 0

        val fields: Array<Resource?> = FIELDS.copyOf()

        if(!standard){
            fields.shuffle()
            fields.shuffle()
            fields.shuffle()
        }

        for (y in AREA_LINES.indices) {
            for (x in AREA_LINES[y] step 2) {

                areas.add(Area(x, y, fields[k], -2, fields[k] == null))
//                areas.add(if (fields[k] == null) {
//                    desertOffset = -1
//                    Area(x, y, fields[k], -1, true)
//                } else {
//                    Area(x, y, fields[k], VALUES[k + desertOffset], false)
//                })
//
                k++
            }
        }

        return applyValues(areas, standard)
    }



    private fun applyValues(areas : List<Area>, standard: Boolean): List<Area> {
        val map = areas.associateBy { Point(it.x,it.y) }

        val values = N_VALUES.copyOf()

        val toReturn = mutableListOf<Area>()


        var current = Point(2,0) to Direction.RIGHT




        fun next(direction: Direction) = Point(current.first.x + direction.dX, current.first.y + direction.dY)

        fun check(point: Point) =  map[point] != null && toReturn.none { it.x == point.x && it.y == point.y }

        var robber = 0
        for(k in areas.indices) {
            val curArea = map[current.first] ?: throw IllegalStateException("area ${current.first} not found")

            toReturn.add( if(curArea.robber) {
                robber ++
                curArea.copy(value = -1)
            } else curArea.copy(value = values[k-robber]))

            val nextSameDirection = next(current.second)

            current = if(check(nextSameDirection)){
                nextSameDirection to current.second
            } else {

                val firstTurn = current.second.successor()
                val nextAfterFirstTurn = next(firstTurn)
                if(check(nextAfterFirstTurn)) nextAfterFirstTurn to firstTurn
                else next(firstTurn.successor()) to firstTurn.successor()

            }
        }

        return toReturn
    }

}
