package petersan.games.catan

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test
import petersan.games.catan.model.*
import petersan.games.catan.Color.*
import petersan.games.catan.core.graph.Edge
import petersan.games.catan.core.graph.Graph
import petersan.games.catan.core.graph.GraphConstructor
import petersan.games.catan.core.graph.Node

internal class GraphTest {

    @Test
    fun testGraphCreation() {
        val graph = graph("0:0", "2:0")

        assertThat(graph.nodes.keys)
            .containsExactly("0:0", "1:0", "2:0", "0:1", "1:1", "2:1", "3:0", "4:0", "3:1", "4:1")

        assertThat(graph.edges.keys)
            .containsExactly("0>0", "1>0", "2<0", "0>1", "1>1", "0<0", "2>0", "3>0", "4<0", "2>1", "3>1")
            .apply {
                element(0).matches { it == "0>0" }
            }
    }

    @Test
    fun testNeighbours() {
        val graph = graph("0:0", "2:0", "1:1")

        assertThat(graph.nodes["2:1"]!!.neighbours().map(Node::key))
            .containsExactlyInAnyOrder("1:1", "2:0", "3:1")

        assertThat(graph.edges["1>1"]!!.toNeighbours().map(Edge::key))
            .containsExactlyInAnyOrder("2<0", "2>1")

        assertThat(graph.edges["2>1"]!!.fromNeighbours().map(Edge::key))
            .containsExactlyInAnyOrder("1>1", "2<0")
    }

    fun graph(vararg areaKeys: String): Graph {
        return GraphConstructor().construct(Game(
            id = 1,
            fields = areaKeys.map { it.split(":") }.map { Area(it[0].toInt(), it[1].toInt(), null, 1) },
            players = mapOf(ORANGE to Player("1"), BLUE to Player("2")),
            harbors = emptyList(),
            moves = mutableListOf(Move(1, ORANGE))
        ))
    }

    @Test
    fun testResourceDeserialization(){

        class Val (val resource: Resource)

        assertThat( jacksonObjectMapper().readValue("""{"resource": "lumber"}""", Val::class.java).resource)
            .isEqualTo(Resource.LUMBER)
    }





}