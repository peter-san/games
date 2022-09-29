package petersan.games.lambda


import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

@Configuration
class JacksonConfiguration {


    @Bean
    @Primary
    fun objectMapper(): ObjectMapper = ObjectMapper().apply {
        configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
        configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true)
        configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
        setSerializationInclusion(JsonInclude.Include.NON_NULL)
        findAndRegisterModules()
    }
}