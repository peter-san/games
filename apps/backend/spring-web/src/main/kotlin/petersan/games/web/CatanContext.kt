package petersan.games.web

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.messaging.simp.SimpMessagingTemplate
import petersan.games.catan.*

import petersan.games.catan.Notifier.Update
import petersan.games.catan.Notifier.Update.Type.*
import petersan.games.catan.core.*

@Configuration
class CatanContext {

    @Bean
    fun notifier(template: SimpMessagingTemplate) = object : Notifier {

        val path = "/topic/games/catan/"

        fun send(game: Game, type: Update.Type) = template.convertAndSend(path+game.id, Update(type, game))

        override fun created(game: Game) = send(game, CREATED)

        override fun updated(game: Game) = send(game, UPDATED)

        override fun deleted(game: Game) = send(game, DELETED)

    }

    @Bean
    @Primary
    fun repository() = InMemoryRepository()

    @Bean
    fun gamesService(repository: GameRepository, notifier: Notifier) = GamesService(repository, notifier)

    @Bean
    fun catanService(repository: GameRepository, notifier: Notifier) = CatanService(repository, notifier)

    @Bean
    fun constructionService(repository: GameRepository, notifier: Notifier) = ConstructionService(repository, notifier)

    @Bean
    fun cardService(repository: GameRepository, notifier: Notifier) = DevelopmentCardService(repository, notifier)

    @Bean
    fun marketService(repository: GameRepository, notifier: Notifier) = MarketService(repository, notifier)

    @Bean
    fun client() = AmazonDynamoDBClientBuilder.standard().build()

    @Bean
    fun mapper(amazonDynamoDB: AmazonDynamoDB) = DynamoDBMapper(amazonDynamoDB)

    @Bean
    @Primary
    fun jackson(): ObjectMapper = ObjectMapper().apply {
        configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
        configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true)
        configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
        setSerializationInclusion(JsonInclude.Include.NON_NULL)
        findAndRegisterModules()
    }
}