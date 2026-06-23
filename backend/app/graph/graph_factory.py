from app.graph.graph import builder


def create_graph(checkpointer):

    return builder.compile(
        checkpointer=checkpointer
    )

