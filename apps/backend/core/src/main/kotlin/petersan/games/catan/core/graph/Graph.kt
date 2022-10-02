package petersan.games.catan.core.graph

import petersan.games.catan.Color
import petersan.games.catan.EdgeKey


class Node(
    val key: String,
    var content: Color? = null,
    var city: Boolean = false,
    var edges: List<Edge> = emptyList(),
) {
    fun neighbours(): List<Node> = edges.map { if (it.from == this) it.to else it.from }
}

class Edge(val key: String, val from: Node, val to: Node, var content: Color? = null) {

    fun neighbours(node: Node) = node.edges.filter { it != this }

    fun fromNeighbours() = neighbours(from)
    fun toNeighbours() = neighbours(to)

    fun opposite(node: Node) = if (node == to) from else to
}

class Graph(val edges: Map<String, Edge>, val nodes: Map<String, Node>) {
    fun node(key: String) = nodes[key] ?: throw IllegalArgumentException("unknown node $key")
    fun edge(key: String) = edges[key] ?: throw IllegalArgumentException("unknown edge $key")
}

fun Graph.longestPath(color: Color): LongestPath.SearchNode? {
    val roads = edges.values.filter { it.content == color }

    val initialSet = mutableSetOf<Node>()
    for (road in roads) {
        if (road.to.content == null || road.to.content == color) initialSet += road.to
        if (road.from.content == null || road.from.content == color) initialSet += road.from
    }

    val computer = LongestPath(color)

    return initialSet.map(computer::compute).maxByOrNull { it.length }
}

class LongestPath(val color: Color) {
    fun compute(node: Node): SearchNode {

        val queue = ArrayDeque<SearchNode>()
        queue.addFirst(SearchNode(node, 0, null, null))
        var max = queue.first()
        while (!queue.isEmpty()) {

            val n = queue.removeFirst()
            //println("node ${n.str()}")
            successor(n).forEach(queue::addFirst)

            if (n.length > max.length) {
                max = n
            }
        }

        return max
    }

    private fun successor(n: SearchNode): List<SearchNode> {

        if (n.node.content != null && n.node.content != color) {
            return emptyList()
        }

        return n.node.edges
            .filter { it.content == color }
            .filter { !n.hasEdge(it) }
            .map { SearchNode(it.opposite(n.node), n.length + 1, n, it) }
    }

    data class SearchNode(val node: Node, val length: Int, val predecessor: SearchNode?, val edge: Edge?) {
        fun hasEdge(e: Edge): Boolean {
            return edge == e || predecessor?.hasEdge(e) ?: false
        }

        fun str(): String = "| " + node.key + (predecessor?.str() ?: "")

        fun edges(): List<EdgeKey>{
            return predecessor?.let { it.edges() + EdgeKey(edge!!.key) } ?: emptyList()
        }

    }
}




