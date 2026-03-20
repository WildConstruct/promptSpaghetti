import os
import json
import random
import urllib.request
import urllib.error

class PromptSpaghettiNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "source": (["Local File", "Cloud Access (API Key)"],),
                "psg_file_path": ("STRING", {
                    "multiline": False,
                    "default": "./examples/my-prompt.psg"
                }),
                "psg_cloud_id": ("STRING", {
                    "multiline": False,
                    "default": ""
                }),
                "api_key": ("STRING", {
                    "multiline": False,
                    "default": ""
                }),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff})
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)

    FUNCTION = "generate_prompt"
    CATEGORY = "Prompt Spaghetti"

    def generate_prompt(self, source, psg_file_path, psg_cloud_id, api_key, seed):
        graph_data = None
        
        if source == "Local File":
            if not os.path.isfile(psg_file_path):
                raise FileNotFoundError(f"Local .psg file not found at: {psg_file_path}")
            with open(psg_file_path, 'r', encoding='utf-8') as f:
                graph_data = json.load(f)
        else:
            if not psg_cloud_id or not api_key:
                raise ValueError("Both psg_cloud_id and api_key are required for Cloud Access.")
            
            # Fetch the .psg remotely from the Prompt Spaghetti account API
            url = f"https://api.promptspaghetti.com/api/v1/graphs/{psg_cloud_id}"
            req = urllib.request.Request(url, headers={
                'Authorization': f'Bearer {api_key}',
                'Accept': 'application/json'
            })
            try:
                with urllib.request.urlopen(req) as response:
                    raw_data = response.read().decode('utf-8')
                    graph_data = json.loads(raw_data)
            except urllib.error.URLError as e:
                raise ConnectionError(f"Failed to fetch PSG from cloud: {e}")
            
        if not graph_data:
            return ("",)
            
        # Parse graph_data using deterministic seed
        rng = random.Random(seed)
        prompt_text = self.evaluate_graph(graph_data, rng)
        
        return (prompt_text,)

    def evaluate_graph(self, graph, rng):
        nodes = {n['id']: n for n in graph.get('nodes', [])}
        edges = graph.get('edges', [])
        
        # Build adjacency backwards
        # node_id -> list of incoming edges
        incoming_edges = {}
        for edge in edges:
            target = edge.get('target')
            if target not in incoming_edges:
                incoming_edges[target] = []
            incoming_edges[target].append(edge)
            
        # Find output node
        output_node = next((n for n in nodes.values() if n.get('type') == 'output' or n.get('type') == 'Output'), None)
        if not output_node:
            raise ValueError("No Output node found in graph")
            
        return self._resolve_node(output_node, nodes, incoming_edges, rng)

    def _resolve_node(self, current_node, nodes, incoming_edges, rng):
        node_type = current_node.get('type', '').lower()
        node_id = current_node['id']
        data = current_node.get('data', {})
        
        in_edges = incoming_edges.get(node_id, [])
        
        if node_type == 'output':
            template = current_node.get('template', data.get('template', ''))
            if template:
                result = template
                for edge in in_edges:
                    source_id = edge['source']
                    source_node = nodes.get(source_id)
                    if source_node:
                        val = self._resolve_node(source_node, nodes, incoming_edges, rng)
                        result = result.replace(f"{{{{{source_id}}}}}", val)
                return result
            else:
                if not in_edges:
                    return ""
                source_edge = in_edges[0]
                return self._resolve_node(nodes[source_edge['source']], nodes, incoming_edges, rng)
            
        elif node_type == 'textblock':
            return data.get('text', data.get('value', ''))
            
        elif node_type == 'concat':
            separator = data.get('separator', ' ')
            edge1 = next((e for e in in_edges if e.get('targetHandle') == 'input1'), None)
            edge2 = next((e for e in in_edges if e.get('targetHandle') == 'input2'), None)
            
            str1 = self._resolve_node(nodes[edge1['source']], nodes, incoming_edges, rng) if edge1 else ""
            str2 = self._resolve_node(nodes[edge2['source']], nodes, incoming_edges, rng) if edge2 else ""
            
            if str1 and str2:
                return f"{str1}{separator}{str2}"
            return str1 + str2
            
        elif node_type == 'weightedchoice':
            # Support both root level and data level options (legacy vs active)
            options = current_node.get('options', data.get('options', []))
            if not options:
                val = data.get('value', '[]')
                try:
                    options = json.loads(val)
                except:
                    options = []
                    
            if not options:
                return ""
                
            weights = [opt.get('weight', 1) for opt in options]
            choice = rng.choices(options, weights=weights, k=1)[0]
            
            # Simple offline string resolution of the branch choice
            return choice.get('text', choice.get('value', ''))
            
        return ""
