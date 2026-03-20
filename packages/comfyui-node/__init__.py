from .prompt_spaghetti import PromptSpaghettiNode

NODE_CLASS_MAPPINGS = {
    "PromptSpaghettiNode": PromptSpaghettiNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptSpaghettiNode": "Prompt Spaghetti"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
