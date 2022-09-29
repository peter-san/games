package petersan.games.web

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication


import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@SpringBootApplication
class Application

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}

@Configuration
class WebConfiguration : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**").allowedMethods("*")
    }
}

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(registry: MessageBrokerRegistry) {
        registry.enableSimpleBroker("/topic")
        registry.setApplicationDestinationPrefixes("/app")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins(
                "http://localhost:3000",
                "http://192.168.178.63:3000",
                "http://north-static-dev.s3-website.eu-north-1.amazonaws.com",
                "https://games.petersan.de/").withSockJS()
    }
}


@EnableWebSecurity
@Configuration
class SecurityConfig : WebSecurityConfigurerAdapter(true) {
    override fun configure(http: HttpSecurity?) {
        http!!.cors().and().csrf().disable()
            .addFilterBefore(HeaderAuthFilter(), BasicAuthenticationFilter::class.java)
            .authorizeRequests().antMatchers(HttpMethod.GET, "*").permitAll()
    }
}


val AUTH_HEADER = "x-amzn-oidc-identity"

class HeaderAuthFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val xAuth: String = request.getHeader("auth") ?: "anonymous"


        SecurityContextHolder.getContext().authentication = HeaderAuthentication(xAuth, emptyList())
        filterChain.doFilter(request, response)
    }
}

class HeaderAuthentication(private val header: String, private val authorities: List<GrantedAuthority>) :
    AbstractAuthenticationToken(authorities) {
    override fun getCredentials() = null
    override fun getName() = header
    override fun toString() = "HeaderAuth: $header"
    override fun getPrincipal() = header
}