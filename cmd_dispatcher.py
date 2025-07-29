import json
import os
import sys
import subprocess
from pathlib import Path

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

def try_open_editor(module_path, module_name):
    """Try different ways to open the module in an editor"""
    module_path_str = str(module_path)
    
    # Try VS Code first
    try:
        subprocess.run(["code", "."], cwd=module_path_str, check=True, shell=True)
        print(f"🚀 Opened {module_name} in VS Code")
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass
    
    # Try VS Code with full path
    try:
        code_paths = [
            "C:/Users/Dwayne Clark/AppData/Local/Programs/Microsoft VS Code/Code.exe",
            "C:/Program Files/Microsoft VS Code/Code.exe",
            "C:/Program Files (x86)/Microsoft VS Code/Code.exe"
        ]
        for code_path in code_paths:
            if os.path.exists(code_path):
                subprocess.run([code_path, module_path_str], check=True)
                print(f"🚀 Opened {module_name} in VS Code")
                return True
    except subprocess.CalledProcessError:
        pass
    
    # Fallback: just show the path
    print(f"📁 Module directory: {module_path_str}")
    print(f"💡 You can manually open this directory in your preferred editor")
    return False

def dispatch_command(cmd_name):
    module_map = load_module_map()
    modules = module_map.get("modules", {})
    default_module = module_map.get("defaultModule", "pos")
    root_dir = module_map.get("rootDir", ".")

    module = find_module_for_command(cmd_name, modules, default_module)
    if not module:
        print(f"❌ No module found for command: {cmd_name}")
        return

    # Use pathlib for proper path handling on Windows
    module_path = Path(root_dir) / module["path"]
    module_path = module_path.resolve()  # Normalize the path
    
    print(f"🔁 Dispatching `{cmd_name}` to module: {module['repo']} @ {module_path}")

    # Check if the directory exists
    if not module_path.exists():
        print(f"❌ Directory does not exist: {module_path}")
        print(f"💡 Please ensure the module directory exists at: {module_path}")
        return

    if not module_path.is_dir():
        print(f"❌ Path exists but is not a directory: {module_path}")
        return

    # Change to the module directory
    try:
        os.chdir(str(module_path))
        print(f"📁 Changed directory to: {module_path}")
        
        # Try to open in an editor
        try_open_editor(module_path, module['repo'])
            
    except Exception as e:
        print(f"⚠️ Error dispatching command: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cmd_dispatcher.py <command>")
        print("Available commands:")
        module_map = load_module_map()
        for module_name, module_info in module_map.get("modules", {}).items():
            print(f"  {module_name}: {', '.join(module_info.get('triggers', []))}")
    else:
        dispatch_command(sys.argv[1])
