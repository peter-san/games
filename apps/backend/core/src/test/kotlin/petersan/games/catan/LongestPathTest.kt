package petersan.games.catan


import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test

import petersan.games.catan.Color.*
import petersan.games.catan.core.graph.LongestPath
import petersan.games.catan.core.graph.longestPath

class LongestPathTest {

    private val testee = LongestPath(BLUE)

    @Test
    fun testThreeInRow() {
        val graph = graph("0:0") {
            it.player(BLUE).roads += line("0>0")
            it.player(BLUE).roads += line("1>0")
            it.player(BLUE).roads += line("2<0")
        }

        testee.compute(graph.node("0:0")).apply {
            assertThat(length).isEqualTo(3)
            assertThat(edges()).containsExactly(
                EdgeKey("0>0"),
                EdgeKey("1>0"),
                EdgeKey("2<0"))
        }
    }

    @Test
    fun testCycle() {
        val graph = graph("0:0", "2:0", "1:1") {
            listOf("0>0", "1>0", "2>0", "3>0", "4<0", "3>1", "2>1", "2<0")
                .map {k->line(k)}
                .forEach { l -> it.player(BLUE).roads += l }
        }

        testee.compute(graph.node("2:0")).apply {
            assertThat(edges()).containsExactly(
                EdgeKey("2>0"),
                EdgeKey("3>0"),
                EdgeKey("4<0"),
                EdgeKey("3>1"),
                EdgeKey("2>1"),
                EdgeKey("2<0"),
                EdgeKey("1>0"),
                EdgeKey("0>0")
            )
        }
    }

    @Test
    fun testSplittedTree() {
        val graph = graph("0:0", "2:0", "1:1") {

            listOf("0>0", "0<0", "2>0", "3>0", "4<0", "3>1", "2>1", "2<0")
                .map {k->line(k)}
                .forEach { l -> it.player(BLUE).roads += l }
        }


        assertThat( graph.longestPath(BLUE)!!.length).isEqualTo(6)
    }

    @Test
    fun testForeignTownOnTheWay() {
        val graph = graph("0:0") {
            it.player(BLUE).roads += line("0>0")
            it.player(BLUE).roads += line("1>0")
            it.player(BLUE).roads += line("2<0")

            it.player(ORANGE).towns += point("2:0")
        }

        testee.compute(graph.node("0:0")).apply {
            assertThat(length).isEqualTo(2)
            assertThat(edges()).containsExactly(
                EdgeKey("0>0"),
                EdgeKey("1>0"))
        }
    }
}