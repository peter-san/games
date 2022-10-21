package petersan.games.lambda

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.eventbridge.AmazonEventBridge
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import petersan.games.catan.*
import com.amazonaws.services.eventbridge.AmazonEventBridgeClient
import com.amazonaws.services.eventbridge.model.PutEventsRequest
import com.amazonaws.services.eventbridge.model.PutEventsRequestEntry
import com.amazonaws.services.eventbridge.model.PutEventsResult
import petersan.games.catan.core.*
import petersan.games.catan.model.ShallowGame

@Configuration
class CatanContext(private val jackson: ObjectMapper) {


    @Bean
    fun repository() = InMemoryRepository()


    @Bean
    fun gamesService(repository: GameRepository, notifier: Notifier) = GamesService(repository, notifier)

    @Bean
    fun constructionService(repository: GameRepository, notifier: Notifier) = ConstructionService(repository, notifier)

    @Bean
    fun catanService(repository: GameRepository, notifier: Notifier) = CatanService(repository, notifier)

    @Bean
    fun cardService(repository: GameRepository, notifier: Notifier) = DevelopmentCardService(repository, notifier)

    @Bean
    fun marketService(repository: GameRepository, notifier: Notifier) = MarketService(repository, notifier)

    @Bean
    fun eventBridgeClient() = AmazonEventBridgeClient.builder()
        .withRegion(Regions.EU_NORTH_1)
        .withCredentials(DefaultAWSCredentialsProviderChain())
        .build()


    data class WebsocketEvent(val path: String, val content: Any)

    @Bean
    fun notifier(eventBridgeClient: AmazonEventBridge) = object : Notifier {

        val path = "/topic/games/catan/"

        override fun created(game: Game) = send(game, Notifier.Update.Type.CREATED)

        override fun updated(game: Game) = send(game, Notifier.Update.Type.UPDATED)

        override fun deleted(game: Game) = send(game, Notifier.Update.Type.DELETED)

        fun send(game: Game, type: Notifier.Update.Type) {
            val requestEntry = PutEventsRequestEntry()
            requestEntry.withSource("catan-lambda-spring")
                .withDetailType("game update")
                .withDetail(jackson.writeValueAsString(WebsocketEvent(
                    path = path + game.id,
                    content = Notifier.Update(type, game))))
                .withEventBusName("catan-events")

            val request = PutEventsRequest().withEntries(
                entry(game, path+game.id, type),
                //entry(game, "$path*", type))
                entry(ShallowGame(game.id, game.state, game.players), "$path*", type))

            val result: PutEventsResult =
                eventBridgeClient.putEvents(request) //AmazonEventBridgeClient puts the event onto the event bus
            if (result.failedEntryCount == 0)
                println("CarImportEvent for vin ${game.id} was successfully put onto event bus")
            else {
                System.err.println("Game update for ${game.id} was failing to put onto the event bus")
            }
        }

        private fun <T> entry(t: T, path: String, type: Notifier.Update.Type): PutEventsRequestEntry {
            return PutEventsRequestEntry().withSource("catan-lambda-spring")
                .withDetailType("game update")
                .withDetail(jackson.writeValueAsString(WebsocketEvent(
                    path = path,
                    content = Notifier.Update(type, t))))
                .withEventBusName("catan-events")
        }

    }

}

