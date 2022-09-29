package petersan.games.catan.core.action

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonValue
import petersan.games.catan.*
import petersan.games.catan.model.*
import java.util.*

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(value = CreateAction::class, name = "create"),
    JsonSubTypes.Type(value = JoinAction::class, name = "join"),
    JsonSubTypes.Type(value = DeleteAction::class, name = "delete"),

    JsonSubTypes.Type(value = DiceAction::class, name = "dice"),
    JsonSubTypes.Type(value = CloseAction::class, name = "close"),
    JsonSubTypes.Type(value = RobberMovedAction::class, name = "move-robber"),
    JsonSubTypes.Type(value = MarketAction::class, name = "market"),

    JsonSubTypes.Type(value = TownBoughtAction::class, name = "buy-town"),
    JsonSubTypes.Type(value = CityBoughtAction::class, name = "buy-city"),
    JsonSubTypes.Type(value = RoadBoughtAction::class, name = "buy-road"),
    JsonSubTypes.Type(value = CardBoughtAction::class, name = "buy-card"),


    JsonSubTypes.Type(value = KnightPlayedAction::class, name = "play-knight"),
    JsonSubTypes.Type(value = MonopolePlayedAction::class, name = "play-monopole"),
    JsonSubTypes.Type(value = InventionPlayedAction::class, name = "play-invention"),
    JsonSubTypes.Type(value = RoadsPlayedAction::class, name = "play-roads"),

    JsonSubTypes.Type(value = ExchangeRequestedAction::class, name = "exchange-request"),
    JsonSubTypes.Type(value = ExchangeResponseAction::class, name = "exchange-response"),

)
abstract class Action(@JsonIgnore open val type: Type) {
    enum class Type(@JsonValue val value: String) {
        CREATE("create"),
        JOIN("join"),
        DELETE("delete"),
        DICE("dice"),
        CLOSE_MOVE("close"),
        BUY_TOWN("buy-town"),
        BUY_CITY("buy-city"),
        BUY_ROAD("buy-road"),
        MOVE_ROBBER("move-robber"),
        MARKET("market"),
        BUY_CARD("buy-card"),
        PLAY_KNIGHT("play-knight"),
        PLAY_MONOPOLE("play-monopole"),
        PLAY_INVENTION("play-invention"),
        PLAY_ROADS("play-roads"),
        EXCHANGE_REQUEST("exchange-request"),
        EXCHANGE_RESPONSE("exchange-response"),
    }
}

data class DiceAction(val first: Int, val second: Int) : Action(Type.DICE) {
    @get:JsonIgnore
    val value get() = first + second
}

data class CreateAction(val default: Boolean) : Action(Type.CREATE)
data class JoinAction(val color: Color) : Action(Type.JOIN)
class DeleteAction : Action(Type.DELETE)
data class CloseAction(val stateChange: Game.State? = null) : Action(Type.CLOSE_MOVE)
data class TownBoughtAction(val point: Point) : Action(Type.BUY_TOWN)
data class CityBoughtAction(val point: Point) : Action(Type.BUY_CITY)
data class RoadBoughtAction(val line: Line) : Action(Type.BUY_ROAD)
data class RobberMovedAction(val point: Point) : Action(Type.MOVE_ROBBER)
data class MarketAction(val resources: Resources) : Action(Type.MARKET)
data class CardBoughtAction(val card: DevelopmentCard) : Action(Type.BUY_CARD)
data class KnightPlayedAction(val point: Point) : Action(Type.PLAY_KNIGHT)
data class MonopolePlayedAction(val resource: Resource) : Action(Type.PLAY_MONOPOLE)
data class InventionPlayedAction(val first: Resource, val second: Resource) : Action(Type.PLAY_INVENTION)
data class RoadsPlayedAction(val first: Line, val second: Line) : Action(Type.PLAY_ROADS)
data class ExchangeRequestedAction(
    val sender: Color,
    val recipient: Color,
    val exchange: Resources,
    val requestId: UUID,
) : Action(Type.EXCHANGE_REQUEST)

data class ExchangeResponseAction(val requestId: UUID, val accepted: Boolean) : Action(Type.EXCHANGE_RESPONSE)