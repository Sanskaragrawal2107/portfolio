import os
from app.env import load_app_env
load_app_env()

from app.graph.graph_factory import create_graph

def generate_graph_visualization():
    print("--- Loading Graph Structure ---")
    
    # OPTIMIZATION: LangGraph handles checkpointer=None perfectly for visualization!
    compiled_graph = create_graph(None)
    
    try:
        # Try rendering using pygraphviz/Graphviz
        png_data = compiled_graph.get_graph().draw_png()
        output_path = "graph.png"
        
        with open(output_path, "wb") as f:
            f.write(png_data)
        print(f"🎉 Success! Graph image saved as '{output_path}' in your backend folder.")
        
    except Exception as e:
        print("\n[INFO] Graphviz draw_png failed (common on Windows without Graphviz binaries).")
        print("Falling back to Mermaid Markdown representation...\n")
        
        # Fallback: Print Mermaid code
        mermaid_code = compiled_graph.get_graph().draw_mermaid()
        print("--- MERMAID CODE ---")
        print(mermaid_code)
        print("--------------------")
        print("👉 Copy above code and paste it into: https://mermaid.live to instantly see your diagram!")

if __name__ == "__main__":
    generate_graph_visualization()