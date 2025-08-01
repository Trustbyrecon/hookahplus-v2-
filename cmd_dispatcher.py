# cmd_dispatcher.py

import os
import zipfile
import shutil


def bundleDeployKit():
    """
    Bundles the Hookah+ deploy kit: React UI, YAML configs, and Netlify-ready build.
    Returns path to generated ZIP.
    """
    bundle_name = "hookahplus_deploy_kit.zip"
    output_dir = "dist"
    bundle_path = os.path.join(output_dir, bundle_name)
    os.makedirs(output_dir, exist_ok=True)

    files_to_include = [
        "dashboard/ui_component_pack/",
        "preorder/web_companion/",
        "configs/session_config.yaml",
        "netlify.toml",
        "README.md"
    ]

    with zipfile.ZipFile(bundle_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in files_to_include:
            if os.path.isdir(item):
                for root, _, files in os.walk(item):
                    for file in files:
                        full_path = os.path.join(root, file)
                        arcname = os.path.relpath(full_path, os.path.dirname(item))
                        zipf.write(full_path, arcname)
            elif os.path.isfile(item):
                zipf.write(item, os.path.basename(item))

    return f"✅ Deploy kit bundled at: {bundle_path}"


def switchDomain(domain_name="hookahplus.net"):
    """
    Simulates domain switch for deployment.
    """
    # Placeholder logic — in production, update Netlify config or DNS.
    return f"🌐 Domain switched to: https://{domain_name}"


def deployFlavorMixUI():
    """
    Deploys Flavor Mix History Tracker UI.
    """
    # Simulate deployment steps
    return "📦 Flavor Mix UI deployed to /flavor-mix-history"


def capturePOSWaitlist():
    """
    Activates POS Plugin Waitlist capture form.
    """
    return "📝 POS waitlist form now live at /waitlist"


def fireSession():
    """
    Simulates full Hookah+ session with QR + pricing.
    """
    return "🔥 Session launched with QR tracking + dynamic pricing enabled"


def openWhisperMemory():
    """
    Opens the Whisper Log Memory view.
    """
    return "📖 Whisper Memory Panel opened — review recent Reflex signals"


def alignMainPortalUI():
    """
    Syncs the main portal landing screen with links to key dashboards and
    panels. Generates a styled HTML page at ``dashboard/pages/index.html`` with
    navigation buttons.
    """
    output_dir = "dashboard/pages"
    index_html_path = os.path.join(output_dir, "index.html")
    os.makedirs(output_dir, exist_ok=True)

    html = """
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <title>Hookah+ Portal</title>
  <style>
    body {
      background-color: #000;
      color: #f5f5f5;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 10vh;
    }
    h1 {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
    }
    .button-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 2rem;
    }
    a {
      padding: 1rem 2rem;
      text-decoration: none;
      color: #000;
      background: gold;
      border-radius: 12px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
      transition: background 0.3s ease;
      text-align: center;
    }
    a:hover {
      background: orange;
    }
  </style>
</head>
<body>
  <h1>Hookah+ — Select Your Operational Mode</h1>
  <div class=\"button-grid\">
    <a href=\"/lounge\">Lounge Dashboard</a>
    <a href=\"/preorder\">QR Pre-Order Gateway</a>
    <a href=\"/admin\">Admin Intelligence Hub</a>
    <a href=\"/operator\">Main Operator Panel</a>
  </div>
</body>
</html>
""".strip()

    try:
        with open(index_html_path, "w") as f:
            f.write(html)
        return f"✅ Main portal UI written to {index_html_path}"
    except Exception as e:
        return f"❌ Failed to write main portal HTML: {str(e)}"


# Optional: Extend as new cmd.* actions are needed


# Codex and internal use: maps string commands to functions
COMMANDS = {
    "bundleDeployKit": bundleDeployKit,
    "switchDomain": switchDomain,
    "deployFlavorMixUI": deployFlavorMixUI,
    "capturePOSWaitlist": capturePOSWaitlist,
    "fireSession": fireSession,
    "openWhisperMemory": openWhisperMemory,
    "alignMainPortalUI": alignMainPortalUI
}


# Optional: Run test
if __name__ == "__main__":
    for cmd_name, cmd_func in COMMANDS.items():
        print(f"▶️ {cmd_name}: {cmd_func()}")
