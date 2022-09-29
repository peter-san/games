package petersan.games.catan.core

import petersan.games.catan.*
import petersan.games.catan.core.action.Action
import petersan.games.catan.core.action.CityBoughtAction
import petersan.games.catan.core.action.RoadBoughtAction
import petersan.games.catan.core.action.TownBoughtAction
import petersan.games.catan.model.add
import petersan.games.catan.model.minusAssign
import kotlin.random.Random

class ConstructionService(games: GameRepository, template: Notifier, random: Random = Random) :
    CatanServiceBase(games, template, random) {

    fun addRoad(id: Int, line: Line, user: String) = verifiedAction(id, user, Action.Type.BUY_ROAD) { ctx ->
        val player = ctx.game.player(ctx.color)
        val graph = ctx.graph
        val edge = graph.edges[line.edgeKey()]!!
        require(edge.content == null) { "road at ${line.edgeKey()} already bought" }

        if (ctx.game.state == Game.State.PLAY) {
            checkRoadBuildable(edge, ctx.color)

            player.resources -= Construction.ROAD.price // TODO add test for price

        } else if (ctx.game.state == Game.State.INIT){
            val town = (ctx.move.actions.find { it.type == Action.Type.BUY_TOWN }!! as TownBoughtAction).point
            val node = graph.nodes[town.nodeKey()]
            require(edge.from == node || edge.to == node) { "road must be connected to selected town" }

            println("${ctx.color} selected road $line")
        }

        player.roads.add(line)
        RoadBoughtAction(line)
    }

    fun buyTown(id: Int, point: Point, user: String) = verifiedAction(id, user, Action.Type.BUY_TOWN) { context ->
        val node = context.graph.nodes[point.nodeKey()]!!
        require(node.content == null) { "town at ${node.key} already bought" }
        require(node.neighbours().find { it.content != null } == null) { "neighbour is too close" }

        if(context.game.state == Game.State.PLAY) {
            require(node.edges.find { it.content == context.color } != null) { "no adjacent road" }
            context.player.resources -= Construction.TOWN.price
        }else if(context.game.state == Game.State.INIT){

            //FIXME add tests for init phase

            if (context.player.towns.size == 1) {

                fun addAreaResource(dX: Int, dY: Int) =
                    context.game.fields.filter { it.x == point.x + dX && it.y == point.y + dY && it.resource != null }
                        .forEach {
                            println("add one ${it.resource}")
                            context.player.resources.add(it.resource!!, 1)
                        }

                fun isAreaKey(p: Point) = (p.x % 2 == 1 && p.y % 2 == 1) || (p.x % 2 == 0 && p.y % 2 == 0)

                if (isAreaKey(point)) {
                    addAreaResource(0, 0)
                    addAreaResource(-2, 0)
                    addAreaResource(-1, -1)
                } else {
                    addAreaResource(-1, 0)
                    addAreaResource(-2, -1)
                    addAreaResource(0, -1)
                }
            }
        }

        context.player.towns.add(point)
        TownBoughtAction(point)
    }

    fun buyCity(id: Int, position: Point, user: String) = verifiedAction(id, user, Action.Type.BUY_CITY) { ctx ->
        val node = ctx.graph.nodes[position.nodeKey()]!!
        require(node.content == ctx.color) { "you need first a town at ${node.key}" }
        require(!node.city) { "there is already a city at ${node.key}" }
        ctx.player.towns.remove(position)
        ctx.player.cities.add(position)
        ctx.player.resources -= Construction.CITY.price
        CityBoughtAction(position)
    }
}
