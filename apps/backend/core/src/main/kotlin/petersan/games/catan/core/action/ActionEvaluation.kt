package petersan.games.catan.core.action

import petersan.games.catan.*
import petersan.games.catan.core.CatanServiceBase.GameContext
import petersan.games.catan.Game.State.*
import petersan.games.catan.core.action.Action.Type.*


data class CatanValidationException(val status: Type, override val message: String?) : Exception(message) {
    enum class Type(val code: Int) {
        FORBIDDEN(403)
    }
}

typealias Exp = CatanValidationException

infix fun <T> ((T) -> Exp?).and(arg: (T) -> Exp?): (T) -> Exp? = { this(it) ?: arg(it) }
infix fun <T> ((T) -> Exp?).or(arg: (T) -> Exp?): (T) -> Exp? = {
    val first: Exp? = this(it)
    val second: Exp? = arg(it)

    if (first == null || second == null) null else first ?: second
}

fun forbidden(message: (GameContext) -> String, predicate: (GameContext) -> Boolean): (GameContext) -> Exp? {
    return { if (!predicate.invoke(it)) Exp(CatanValidationException.Type.FORBIDDEN, message(it)) else null }
}

fun state(state: Game.State) = forbidden({ "should be in $state" }) { it.game.state == state }
val myTurn = forbidden({ "not your turn, ${it.color}" }) { it.color == it.move.color }
fun noAction(actionType: Action.Type) = forbidden({ "$actionType took already place" })
{ it.move.actions.none { a -> a.type == actionType } }

fun hasAction(actionType: Action.Type) = forbidden({ "$actionType needed" })
{ it.move.actions.any { a -> a.type == actionType } }

val sevenDiced = forbidden({ "7 wasn't diced" }) { ctx -> ctx.move.actions.any { it is DiceAction && it.value == 7 } }
val diced = forbidden({ "roll first" }) { ctx -> ctx.move.actions.any { it is DiceAction && it.value != 7 } }
val dicedAndRobbed = diced or (sevenDiced and hasAction(MOVE_ROBBER))
val meDicedAndRobbed = state(PLAY) and myTurn and (diced or (sevenDiced and hasAction(MOVE_ROBBER)))

val hasResourcesForMarket = forbidden({ "not enough resources for market" }) {
    val resources = it.game.player(it.color).resources
    val prices = it.game.marketPrices(it.color)

    resources.any { (t, amount) -> amount >= prices[t]!! }
}

fun enoughFor(type: Construction) = forbidden({ "not enough resources for $type" }) { ctx ->
    val resources = ctx.game.player(ctx.color).resources
    type.price.map { (resource, amount) -> (resources[resource] ?: 0) >= amount }.all { it }
}

fun itemsLeft(type: Construction) = forbidden({ "no items of type $type available" }) { ctx ->
    type.getter(ctx.game.player(ctx.color)).size <= type.maxAmount
}

fun hasCard(type: DevelopmentCard.Type) = forbidden({ "$type needed" })
{ it.game.player(it.color).cards.any { card -> card.type == type && !card.played } }

fun hasOpenExchangeRequest() = forbidden({ "need open exchange request" }) {
    it.move.actions.any { a ->
        a is ExchangeRequestedAction && a.recipient == it.color &&
                it.move.actions.none { resp -> resp is ExchangeResponseAction && a.requestId == resp.requestId }
    }
}



fun Action.Type.isAllowed(ctx: GameContext): Exp? {
    val check = when (this) {
        DICE -> state(PLAY) and myTurn and noAction(DICE)
        MOVE_ROBBER -> myTurn and sevenDiced and noAction(MOVE_ROBBER)
        CLOSE_MOVE -> myTurn and (
                (state(PLAY) and dicedAndRobbed) or
                        (state(INIT) and hasAction(BUY_TOWN) and hasAction(BUY_ROAD)) or
                        state(CREATION)
                )
        MARKET -> meDicedAndRobbed and hasResourcesForMarket

        BUY_CARD -> meDicedAndRobbed and enoughFor(Construction.CARD)
        PLAY_KNIGHT -> meDicedAndRobbed and hasCard(DevelopmentCard.Type.KNIGHT)
        PLAY_INVENTION -> meDicedAndRobbed and hasCard(DevelopmentCard.Type.INVENTION)
        PLAY_ROADS -> meDicedAndRobbed and hasCard(DevelopmentCard.Type.ROADS)
        PLAY_MONOPOLE -> meDicedAndRobbed and hasCard(DevelopmentCard.Type.MONOPOLE)

        BUY_TOWN -> ( meDicedAndRobbed and enoughFor(Construction.TOWN) and itemsLeft(Construction.TOWN)) or
                (state(INIT) and myTurn and noAction(BUY_TOWN))

        BUY_ROAD -> ( meDicedAndRobbed
                and enoughFor(Construction.ROAD)
                and itemsLeft(Construction.ROAD)
                ) or (state(INIT)
                and myTurn
                and hasAction(BUY_TOWN)
                and noAction(BUY_ROAD))


        BUY_CITY -> meDicedAndRobbed and enoughFor(Construction.CITY) and itemsLeft(Construction.CITY)
        EXCHANGE_REQUEST -> meDicedAndRobbed
        EXCHANGE_RESPONSE -> hasOpenExchangeRequest()

        else -> forbidden({ "unsupported" }) { false }
    }
    return check(ctx)
}
