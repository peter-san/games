package petersan.games.catan.core

import petersan.games.catan.*
import petersan.games.catan.model.*
import petersan.games.catan.Notifier
import petersan.games.catan.core.action.*
import java.util.*
import kotlin.random.Random

//@Service
class MarketService(games: GameRepository, template: Notifier, random: Random = Random) :
    CatanServiceBase(games, template, random) {

    fun market(id: Int, exchange: Resources, user: String) = verifiedAction(id, user, Action.Type.MARKET) { ctx ->

        val player = ctx.game.players[ctx.color]!!


        val list = exchange.toList()

        require(list.size == 2){"only one to one change is supported"}

        val forMe = list.find { it.second == 1 } ?:
            throw CatanValidationException(CatanValidationException.Type.FORBIDDEN, "one should be present")

        val forMarket = list.find { it.second <0 } ?:
            throw CatanValidationException(CatanValidationException.Type.FORBIDDEN, "one should be present")

        require(forMe.first != forMarket.first) {"resources should be different!"}

        val price = ctx.game.marketPrices(ctx.color)[forMarket.first]!!

        require(-forMarket.second == price){"here should be $price of ${forMarket.first}"}
        require(price <= player.resources[forMarket.first] ?: 0) { "not enough ${forMarket.first}" }

        player.resources += exchange
        println("${ctx.color} used market: $exchange")
        MarketAction(exchange)
    }

    fun exchangeRequest(id: Int, recipient: Color, resources: Resources, user: String) =
        secondPhaseAction(id, user) { ctx ->
            val player = ctx.game.players[ctx.color]!!
            //todo check player and recipient allowed in current move
            println("${ctx.color} requested exchange to ${recipient}: $resources")
            ExchangeRequestedAction(ctx.color, recipient, resources, UUID.randomUUID())
        }

    fun exchangeResponse(id: Int, requestId: UUID, user: String, accepted: Boolean): Game {
        val game = find(id)
        val color = getColor(game, user)
        val move = game.moves.last()

        val request = move.actions
            .filterIsInstance<ExchangeRequestedAction>()
            .firstOrNull { it.requestId == requestId } ?: throw IllegalArgumentException("unknown request $requestId")

        check(move.actions.filterIsInstance<ExchangeResponseAction>().none { it.requestId == requestId })
        { "request $requestId handled already" }

        check(request.recipient == color) {"request isn't addressed to you, $color"}

        if(accepted){
            game.player(request.sender).resources -= request.exchange
            game.player(request.recipient).resources += request.exchange
        }

        return applyAction(game, ExchangeResponseAction(requestId, accepted))
    }

}