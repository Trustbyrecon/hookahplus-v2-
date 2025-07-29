import json
import os
import sys
import subprocess

# Load the Codex module map
MODULE_MAP_PATH = "CodexModuleMap.json"

def load_module_map():
    with open(MODULE_MAP_PATH, "r") as f:
        return json.load(f)

def find_module_for_command(cmd_name, modules, default_module):
    for module_name, module_info in modules.items():
        if cmd_name in module_info.get("triggers", []):
            return module_info
    return modules.get(default_module)

def dispatch_command(cmd_name):
    module_map = load_module_map()
    modules = module_map.get("modules", {})
    default_module = module_map.get("defaultModule", "pos")
    root_dir = module_map.get("rootDir", ".")

    module = find_module_for_command(cmd_name, modules, default_module)
    if not module:
        print(f"❌ No module found for command: {cmd_name}")
        return

    module_path = os.path.join(root_dir, module["path"])
    print(f"🔁 Dispatching `{cmd_name}` to module: {module['repo']} @ {module_path}")

    # Optional: Run bash/cmd/open editor
    try:
        os.chdir(module_path)
        print(f"📁 Changed directory to: {module_path}")
        subprocess.run(["code", "."], check=True)  # Open in VS Code
    except Exception as e:
        print(f"⚠️ Error dispatching command: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cmd_dispatcher.py cmd.deployOperatorDashboard")
    else:
        dispatch_command(sys.argv[1])
