package petersan.games.catan.core


import petersan.games.catan.*
import petersan.games.catan.DevelopmentCard.Type.*
import petersan.games.catan.model.*
import petersan.games.catan.Notifier
import petersan.games.catan.core.action.*
import petersan.games.catan.core.action.Action.Type.*

import kotlin.random.Random

class DevelopmentCardService(games: GameRepository, template: Notifier, random: Random = Random) :
    CatanServiceBase(games, template, random) {

    fun buyDevelopmentCard(id: Int, user: String) = verifiedAction(id, user, BUY_CARD) { ctx ->
        val card = DevelopmentCard(selectRandomCardType(ctx))

        ctx.player.resources -= Construction.CARD.price
        ctx.player.cards += card

        CardBoughtAction(card)
    }

    private fun selectRandomCardType(ctx: GameContext): DevelopmentCard.Type {
        val cards = DevelopmentCard.Type.values().associateWith { it.amount }.toMutableMap()
        ctx.game.players.values.map { it.cards }.flatten().forEach { cards[it.type] = cards[it.type]!! - 1 }

        assert(cards.values.sum() > 0) { "all cards are bought" }

        val index = random.nextInt(0, cards.values.sum())
        var current = 0
        for ((type, amount) in cards) {
            current += amount
            if (current > index) {
                return type
            }
        }
        throw IllegalStateException("card wasn't found")
    }

    private fun findCard(ctx: GameContext, type: DevelopmentCard.Type) = ctx.player.cards
        .find { it.type == type && !it.played }
        ?: throw IllegalStateException("no $type found")

    fun useKnight(id: Int, user: String, position: Point) = verifiedAction(id, user, PLAY_KNIGHT) { ctx ->

        val card = findCard(ctx, KNIGHT)
        card.played = true
        ctx.game.fields.forEach { it.robber = it.x == position.x && it.y == position.y }
        card.played = true
        println("${ctx.color} played knight and moved robber to $position")
        KnightPlayedAction(position)
    }

    fun playMonopole(id: Int, user: String, resource: Resource) = verifiedAction(id, user, PLAY_MONOPOLE) { ctx ->
        val card = findCard(ctx, DevelopmentCard.Type.MONOPOLE)

        val sum = ctx.game.players
            .filter { (c, _) -> c != ctx.color }
            .map { (_, p) -> p.resources.replace(resource, 0) ?: 0 }
            .sum()
        ctx.player.resources.add(resource, sum)
        println("${ctx.color} played monopole and got $sum of $resource")
        card.played = true
        MonopolePlayedAction(resource)
    }

    fun playInvention(id: Int, user: String, first: Resource, second: Resource) =
        verifiedAction(id, user, PLAY_INVENTION) { ctx ->
            val card = findCard(ctx, DevelopmentCard.Type.INVENTION)

            ctx.player.resources.add(first, 1)
            ctx.player.resources.add(second, 1)
            println("${ctx.color} played invention and got 1 of $first and 1 of $second")
            card.played = true
            InventionPlayedAction(first, second)
        }

    fun playRoads(id: Int, user: String, first: Line, second: Line) = verifiedAction(id, user, PLAY_ROADS) { ctx ->
        val card = findCard(ctx, DevelopmentCard.Type.ROADS)

        val graph = GraphConstructor().construct(ctx.game)
        checkRoadBuildable(graph.edges[first.edgeKey()]!!, ctx.color)

        graph.edges[first.edgeKey()]!!.content = ctx.color

        checkRoadBuildable(graph.edges[second.edgeKey()]!!, ctx.color)

        ctx.player.roads += first
        ctx.player.roads += second
        println("${ctx.color} played roads and added two roads $first and $second")
        card.played = true
        RoadsPlayedAction(first, second)
    }
}