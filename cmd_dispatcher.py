# hookahplus/cmd/cmd_dispatcher.py

from modules import reflex_ui

COMMANDS = {
    "deployReflexUI": reflex_ui.deploy_reflex_ui,
    "renderReflexLoyalty": reflex_ui.render_reflex_loyalty,
    "injectReflexHeatmap": reflex_ui.inject_reflex_heatmap,
    "deployFlavorMixUI": reflex_ui.deploy_flavor_mix_ui,
    # Add more here...
}

def dispatch(cmd_name, *args):
    if cmd_name in COMMANDS:
        return COMMANDS[cmd_name](*args)
    else:
        return f"❌ Unknown command: {cmd_name}"
