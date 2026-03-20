# Prompt Spaghetti Node for ComfyUI

This package provides a custom node for ComfyUI that integrates closely with **Prompt Spaghetti**.

## Features
- **Local PSG Mode:** Specify a local `.psg` graph file path on disk. The node will securely evaluate the graph, picking random node paths, interpolating values, and spitting out the generated prompt deterministic to the provided Seed.
- **Cloud ID Mode (Coming Soon):** Hook into the Prompt Spaghetti Fastify backend via API Key to directly retrieve team-wide approved fragments and workflows seamlessly. 

## Installation
1. Navigate to your ComfyUI `custom_nodes` directory.
2. Clone or copy this directory (`comfyui-node`) inside:
```bash
git clone https://github.com/WildConstruct/promptSpaghetti.git
cp -r promptSpaghetti/packages/comfyui-node ComfyUI/custom_nodes/prompt_spaghetti
```
3. Restart your ComfyUI server.
4. Add the node `Prompt Spaghetti` -> `PromptSpaghettiNode`.
